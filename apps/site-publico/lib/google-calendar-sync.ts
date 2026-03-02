import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
});

// Obter tokens do banco de dados
async function getGoogleTokens(userId: number): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const query = `
      SELECT 
        google_access_token as "accessToken",
        google_refresh_token as "refreshToken"
      FROM users
      WHERE id = $1
        AND google_access_token IS NOT NULL
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length > 0) {
      return {
        accessToken: result.rows[0].accessToken,
        refreshToken: result.rows[0].refreshToken,
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar tokens do Google:', error);
    return null;
  }
}

// Salvar tokens no banco
async function saveGoogleTokens(
  userId: number,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  try {
    const query = `
      UPDATE users
      SET 
        google_access_token = $1,
        google_refresh_token = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    await pool.query(query, [accessToken, refreshToken, userId]);
  } catch (error) {
    console.error('Erro ao salvar tokens do Google:', error);
    throw error;
  }
}

// Sincronizar reservas do RSV para Google Calendar
export async function syncRSVToCalendar(
  propertyId: number,
  userId: number
): Promise<{ synced: number; errors: number }> {
  try {
    const tokens = await getGoogleTokens(userId);
    if (!tokens) {
      throw new Error('Tokens do Google não encontrados. Usuário precisa autorizar acesso ao Google Calendar.');
    }
    
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Buscar reservas confirmadas
    const bookingsQuery = `
      SELECT 
        b.id,
        b.booking_code,
        b.check_in,
        b.check_out,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.property_id = $1
        AND b.status = 'confirmed'
        AND b.check_out >= CURRENT_DATE
      ORDER BY b.check_in ASC
    `;
    
    const bookingsResult = await pool.query(bookingsQuery, [propertyId]);
    const bookings = bookingsResult.rows;
    
    let synced = 0;
    let errors = 0;
    
    for (const booking of bookings) {
      try {
        const event = {
          summary: `Reserva RSV #${booking.booking_code} - ${booking.customer_name}`,
          description: `
Check-in: ${formatDate(booking.check_in)} às 14:00
Check-out: ${formatDate(booking.check_out)} às 11:00
Contato: ${booking.customer_email} | ${booking.customer_phone}
Propriedade: ${booking.property_title}

Gerado automaticamente pelo RSV 360°
          `.trim(),
          start: {
            dateTime: new Date(booking.check_in).toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: new Date(booking.check_out).toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          attendees: [
            { email: booking.customer_email },
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 dia antes
              { method: 'popup', minutes: 60 }, // 1 hora antes
            ],
          },
          colorId: '10', // Verde
        };
        
        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
          sendUpdates: 'all',
        });
        
        synced++;
      } catch (error) {
        console.error(`Erro ao sincronizar reserva ${booking.booking_code}:`, error);
        errors++;
      }
    }
    
    return { synced, errors };
  } catch (error) {
    console.error('Erro ao sincronizar RSV para Calendar:', error);
    throw error;
  }
}

// Sincronizar eventos do Google Calendar para bloqueios no RSV
export async function syncCalendarToRSV(
  propertyId: number,
  userId: number,
  calendarId: string = 'primary'
): Promise<{ imported: number; errors: number }> {
  try {
    const tokens = await getGoogleTokens(userId);
    if (!tokens) {
      throw new Error('Tokens do Google não encontrados.');
    }
    
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Buscar eventos futuros do Calendar
    const eventsResult = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = eventsResult.data.items || [];
    
    // Buscar ou criar calendar_id
    let finalCalendarId: number | null = null;
    const calendarQuery = `
      SELECT id FROM property_calendars WHERE property_id = $1 LIMIT 1
    `;
    const calendarResult = await pool.query(calendarQuery, [propertyId]);
    if (calendarResult.rows.length > 0) {
      finalCalendarId = calendarResult.rows[0].id;
    } else {
      const createCalendarQuery = `
        INSERT INTO property_calendars (property_id, ical_import_enabled)
        VALUES ($1, true)
        RETURNING id
      `;
      const createResult = await pool.query(createCalendarQuery, [propertyId]);
      finalCalendarId = createResult.rows[0].id;
    }
    
    let imported = 0;
    let errors = 0;
    
    for (const event of events) {
      try {
        // Filtrar eventos relevantes (ex.: "Manutenção" ou locais de Caldas Novas)
        const summary = event.summary || '';
        const description = event.description || '';
        
        if (
          summary.toLowerCase().includes('manutenção') ||
          summary.toLowerCase().includes('bloqueado') ||
          summary.toLowerCase().includes('caldas') ||
          description.toLowerCase().includes('go') ||
          description.toLowerCase().includes('caldas novas')
        ) {
          const startDate = event.start?.dateTime || event.start?.date;
          const endDate = event.end?.dateTime || event.end?.date;
          
          if (!startDate || !endDate) {
            errors++;
            continue;
          }
          
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          // Verificar se já existe bloqueio
          const existingQuery = `
            SELECT id FROM blocked_dates
            WHERE property_id = $1
              AND start_date = $2
              AND end_date = $3
              AND source = 'calendar'
              AND source_id = $4
          `;
          const existingResult = await pool.query(existingQuery, [
            propertyId,
            formatDate(start),
            formatDate(end),
            event.id || '',
          ]);
          
          if (existingResult.rows.length > 0) {
            // Atualizar existente
            await pool.query(
              `UPDATE blocked_dates
               SET reason = $1, updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [summary || 'Evento importado do Google Calendar', existingResult.rows[0].id]
            );
          } else {
            // Criar novo bloqueio
            await pool.query(
              `INSERT INTO blocked_dates (
                property_id, calendar_id, start_date, end_date, reason, type, source, source_id
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                propertyId,
                finalCalendarId,
                formatDate(start),
                formatDate(end),
                summary || 'Evento importado do Google Calendar',
                'event',
                'calendar',
                event.id || '',
              ]
            );
          }
          
          imported++;
        }
      } catch (error) {
        console.error(`Erro ao processar evento ${event.id}:`, error);
        errors++;
      }
    }
    
    // Atualizar last_sync_at
    if (finalCalendarId) {
      await pool.query(
        'UPDATE property_calendars SET last_sync_at = CURRENT_TIMESTAMP WHERE id = $1',
        [finalCalendarId]
      );
    }
    
    return { imported, errors };
  } catch (error) {
    console.error('Erro ao sincronizar Calendar para RSV:', error);
    throw error;
  }
}

// Função auxiliar para formatar data
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Obter URL de autorização OAuth
export function getGoogleAuthURL(userId: number): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId.toString(),
    prompt: 'consent',
  });
  
  return url;
}

// Trocar código de autorização por tokens
export async function exchangeCodeForTokens(
  code: string,
  userId: number
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Tokens não recebidos do Google');
    }
    
    await saveGoogleTokens(userId, tokens.access_token, tokens.refresh_token);
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  } catch (error) {
    console.error('Erro ao trocar código por tokens:', error);
    throw error;
  }
}

