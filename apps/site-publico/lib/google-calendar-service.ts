/**
 * ✅ FASE 7: GOOGLE CALENDAR SYNC SERVICE
 * Sincronização bidirecional entre RSV e Google Calendar
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { queryDatabase } from './db';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
});

export interface CalendarCredentials {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  location?: string;
  attendees?: Array<{ email: string }>;
}

/**
 * ✅ Obter URL de autorização OAuth2
 */
export function getGoogleAuthUrl(state?: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: state || '',
  });
}

/**
 * ✅ Trocar código de autorização por tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<CalendarCredentials> {
  const { tokens } = await oauth2Client.getToken(code);
  
  return {
    access_token: tokens.access_token || '',
    refresh_token: tokens.refresh_token || '',
    expiry_date: tokens.expiry_date,
  };
}

/**
 * ✅ Atualizar credenciais e obter cliente autenticado
 */
async function getAuthenticatedClient(credentials: CalendarCredentials): Promise<typeof google.calendar> {
  oauth2Client.setCredentials({
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
    expiry_date: credentials.expiry_date,
  });

  // Verificar se o token expirou e renovar se necessário
  if (credentials.expiry_date && credentials.expiry_date < Date.now()) {
    const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(newCredentials);
    
    // Atualizar credenciais no banco
    if (credentials.refresh_token) {
      await queryDatabase(
        `UPDATE user_oauth_tokens 
         SET access_token = $1, expiry_date = $2, updated_at = CURRENT_TIMESTAMP
         WHERE refresh_token = $3`,
        [newCredentials.access_token, newCredentials.expiry_date, credentials.refresh_token]
      );
    }
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * ✅ Sincronizar reserva para Google Calendar
 */
export async function syncBookingToCalendar(
  bookingId: number,
  hostId: number,
  calendarId: string = 'primary'
): Promise<string> {
  // Buscar credenciais do host
  const credentials = await queryDatabase(
    `SELECT access_token, refresh_token, expiry_date 
     FROM user_oauth_tokens 
     WHERE user_id = $1 AND provider = 'google'`,
    [hostId]
  );

  if (credentials.length === 0) {
    throw new Error('Host não possui credenciais do Google Calendar');
  }

  const creds: CalendarCredentials = {
    access_token: credentials[0].access_token,
    refresh_token: credentials[0].refresh_token,
    expiry_date: credentials[0].expiry_date ? parseInt(credentials[0].expiry_date) : undefined,
  };

  // Buscar dados da reserva
  const booking = await queryDatabase(
    `SELECT 
      b.*,
      p.name as property_name,
      u.name as guest_name,
      u.email as guest_email,
      u.phone as guest_phone
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (booking.length === 0) {
    throw new Error('Reserva não encontrada');
  }

  const bookingData = booking[0];

  // Criar evento no Google Calendar
  const calendar = await getAuthenticatedClient(creds);
  
  const event: CalendarEvent = {
    summary: `Reserva RSV #${bookingData.code} - ${bookingData.guest_name}`,
    description: `
      Propriedade: ${bookingData.property_name}
      Hóspede: ${bookingData.guest_name}
      Email: ${bookingData.guest_email}
      Telefone: ${bookingData.guest_phone}
      Valor: R$ ${parseFloat(bookingData.total_amount).toFixed(2)}
      
      Link: ${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}
    `,
    start: {
      dateTime: new Date(bookingData.check_in).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: new Date(bookingData.check_out).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    location: bookingData.property_name,
    attendees: [
      { email: bookingData.guest_email },
    ],
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: 'all',
  });

  // Salvar ID do evento no banco
  await queryDatabase(
    `UPDATE bookings 
     SET calendar_event_id = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [response.data.id, bookingId]
  );

  return response.data.id || '';
}

/**
 * ✅ Atualizar evento no Google Calendar
 */
export async function updateCalendarEvent(
  bookingId: number,
  hostId: number,
  calendarId: string = 'primary'
): Promise<void> {
  // Buscar credenciais e dados da reserva
  const credentials = await queryDatabase(
    `SELECT access_token, refresh_token, expiry_date 
     FROM user_oauth_tokens 
     WHERE user_id = $1 AND provider = 'google'`,
    [hostId]
  );

  if (credentials.length === 0) {
    throw new Error('Host não possui credenciais do Google Calendar');
  }

  const booking = await queryDatabase(
    `SELECT 
      b.*,
      p.name as property_name,
      u.name as guest_name,
      u.email as guest_email
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (booking.length === 0 || !booking[0].calendar_event_id) {
    throw new Error('Reserva não encontrada ou sem evento no calendário');
  }

  const creds: CalendarCredentials = {
    access_token: credentials[0].access_token,
    refresh_token: credentials[0].refresh_token,
    expiry_date: credentials[0].expiry_date ? parseInt(credentials[0].expiry_date) : undefined,
  };

  const calendar = await getAuthenticatedClient(creds);
  const bookingData = booking[0];

  const event: CalendarEvent = {
    summary: `Reserva RSV #${bookingData.code} - ${bookingData.guest_name}`,
    description: `
      Propriedade: ${bookingData.property_name}
      Hóspede: ${bookingData.guest_name}
      Status: ${bookingData.status}
      
      Link: ${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}
    `,
    start: {
      dateTime: new Date(bookingData.check_in).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: new Date(bookingData.check_out).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
  };

  await calendar.events.update({
    calendarId,
    eventId: bookingData.calendar_event_id,
    requestBody: event,
    sendUpdates: 'all',
  });
}

/**
 * ✅ Deletar evento do Google Calendar
 */
export async function deleteCalendarEvent(
  bookingId: number,
  hostId: number,
  calendarId: string = 'primary'
): Promise<void> {
  // Buscar credenciais e ID do evento
  const credentials = await queryDatabase(
    `SELECT access_token, refresh_token, expiry_date 
     FROM user_oauth_tokens 
     WHERE user_id = $1 AND provider = 'google'`,
    [hostId]
  );

  if (credentials.length === 0) {
    throw new Error('Host não possui credenciais do Google Calendar');
  }

  const booking = await queryDatabase(
    `SELECT calendar_event_id FROM bookings WHERE id = $1`,
    [bookingId]
  );

  if (booking.length === 0 || !booking[0].calendar_event_id) {
    return; // Já deletado ou nunca existiu
  }

  const creds: CalendarCredentials = {
    access_token: credentials[0].access_token,
    refresh_token: credentials[0].refresh_token,
    expiry_date: credentials[0].expiry_date ? parseInt(credentials[0].expiry_date) : undefined,
  };

  const calendar = await getAuthenticatedClient(creds);

  try {
    await calendar.events.delete({
      calendarId,
      eventId: booking[0].calendar_event_id,
      sendUpdates: 'all',
    });

    // Remover ID do evento do banco
    await queryDatabase(
      `UPDATE bookings 
       SET calendar_event_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [bookingId]
    );
  } catch (error: any) {
    if (error.code !== 404) {
      throw error;
    }
    // Evento já deletado, apenas limpar do banco
    await queryDatabase(
      `UPDATE bookings 
       SET calendar_event_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [bookingId]
    );
  }
}

/**
 * ✅ Sincronizar disponibilidade do Google Calendar para RSV
 */
export async function syncAvailabilityFromCalendar(
  hostId: number,
  propertyId: number,
  calendarId: string = 'primary'
): Promise<number> {
  // Buscar credenciais
  const credentials = await queryDatabase(
    `SELECT access_token, refresh_token, expiry_date 
     FROM user_oauth_tokens 
     WHERE user_id = $1 AND provider = 'google'`,
    [hostId]
  );

  if (credentials.length === 0) {
    throw new Error('Host não possui credenciais do Google Calendar');
  }

  const creds: CalendarCredentials = {
    access_token: credentials[0].access_token,
    refresh_token: credentials[0].refresh_token,
    expiry_date: credentials[0].expiry_date ? parseInt(credentials[0].expiry_date) : undefined,
  };

  const calendar = await getAuthenticatedClient(creds);

  // Buscar eventos futuros do calendário
  const now = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(now.getFullYear() + 1);

  const response = await calendar.events.list({
    calendarId,
    timeMin: now.toISOString(),
    timeMax: oneYearLater.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];
  let blockedDates = 0;

  // Bloquear datas ocupadas no RSV
  for (const event of events) {
    if (!event.start?.dateTime) continue;

    const startDate = new Date(event.start.dateTime);
    const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : startDate;

    // Verificar se já existe bloqueio
    const existing = await queryDatabase(
      `SELECT id FROM property_availability 
       WHERE property_id = $1 
       AND date >= $2 AND date < $3
       AND status = 'blocked'`,
      [propertyId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    if (existing.length === 0) {
      // Criar bloqueios para cada data
      const currentDate = new Date(startDate);
      while (currentDate < endDate) {
        await queryDatabase(
          `INSERT INTO property_availability (property_id, date, status, reason)
           VALUES ($1, $2, 'blocked', 'Bloqueado via Google Calendar: ${event.summary}')
           ON CONFLICT (property_id, date) DO UPDATE
           SET status = 'blocked', reason = EXCLUDED.reason`,
          [propertyId, currentDate.toISOString().split('T')[0]]
        );
        currentDate.setDate(currentDate.getDate() + 1);
        blockedDates++;
      }
    }
  }

  return blockedDates;
}
