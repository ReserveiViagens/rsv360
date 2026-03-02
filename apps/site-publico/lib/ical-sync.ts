import ical, { ICalCalendar } from 'ical-generator';
import { parse } from 'node-ical';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// Exportar reservas do RSV para iCal
export async function exportRSVToICal(propertyId: number): Promise<string> {
  try {
    // Buscar reservas confirmadas da propriedade
    const bookingsQuery = `
      SELECT 
        b.id,
        b.booking_code,
        b.check_in,
        b.check_out,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.status,
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
    
    // Criar calendário iCal
    const calendar = ical({
      prodId: {
        company: 'RSV 360°',
        product: 'RSV 360° Booking System',
        language: 'PT-BR',
      },
      name: `Reservas - Propriedade ${propertyId}`,
      description: 'Calendário de reservas do RSV 360°',
      timezone: 'America/Sao_Paulo',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/properties/${propertyId}/calendar`,
    });
    
    // Adicionar cada reserva como evento
    for (const booking of bookings) {
      calendar.createEvent({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out),
        summary: `Reserva RSV #${booking.booking_code} - ${booking.customer_name}`,
        description: `
Reserva confirmada no RSV 360°
Código: ${booking.booking_code}
Hóspede: ${booking.customer_name}
Email: ${booking.customer_email}
Telefone: ${booking.customer_phone}
Propriedade: ${booking.property_title}
        `.trim(),
        location: booking.property_title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservas/${booking.booking_code}`,
        status: 'CONFIRMED',
        busystatus: 'BUSY',
        organizer: {
          name: 'RSV 360°',
          email: process.env.EMAIL_FROM || 'noreply@rsv360.com',
        },
        attendees: [
          {
            name: booking.customer_name,
            email: booking.customer_email,
            rsvp: false,
          },
        ],
      });
    }
    
    return calendar.toString();
  } catch (error) {
    console.error('Erro ao exportar iCal:', error);
    throw error;
  }
}

// Importar eventos iCal para bloqueios no RSV
export async function importICalToRSV(
  propertyId: number,
  icalContent: string | Buffer,
  calendarId?: number
): Promise<{ imported: number; errors: number }> {
  try {
    const events = parse(icalContent.toString());
    let imported = 0;
    let errors = 0;
    
    // Buscar ou criar calendar_id
    let finalCalendarId = calendarId;
    if (!finalCalendarId) {
      const calendarQuery = `
        SELECT id FROM property_calendars WHERE property_id = $1 LIMIT 1
      `;
      const calendarResult = await pool.query(calendarQuery, [propertyId]);
      if (calendarResult.rows.length > 0) {
        finalCalendarId = calendarResult.rows[0].id;
      } else {
        // Criar calendário se não existir
        const createCalendarQuery = `
          INSERT INTO property_calendars (property_id, ical_import_enabled)
          VALUES ($1, true)
          RETURNING id
        `;
        const createResult = await pool.query(createCalendarQuery, [propertyId]);
        finalCalendarId = createResult.rows[0].id;
      }
    }
    
    // Processar cada evento
    for (const key in events) {
      const event = events[key];
      
      if (event.type !== 'VEVENT') continue;
      
      try {
        const startDate = event.start ? new Date(event.start) : null;
        const endDate = event.end ? new Date(event.end) : null;
        
        if (!startDate || !endDate) {
          errors++;
          continue;
        }
        
        // Verificar se já existe bloqueio para essas datas
        const existingQuery = `
          SELECT id FROM blocked_dates
          WHERE property_id = $1
            AND start_date = $2
            AND end_date = $3
            AND source = 'ical'
        `;
        const existingResult = await pool.query(existingQuery, [
          propertyId,
          formatDate(startDate),
          formatDate(endDate),
        ]);
        
        if (existingResult.rows.length > 0) {
          // Atualizar existente
          const updateQuery = `
            UPDATE blocked_dates
            SET reason = $1, source_id = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `;
          await pool.query(updateQuery, [
            event.summary || 'Evento importado do iCal',
            key,
            existingResult.rows[0].id,
          ]);
        } else {
          // Criar novo bloqueio
          const insertQuery = `
            INSERT INTO blocked_dates (
              property_id,
              calendar_id,
              start_date,
              end_date,
              reason,
              type,
              source,
              source_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          await pool.query(insertQuery, [
            propertyId,
            finalCalendarId,
            formatDate(startDate),
            formatDate(endDate),
            event.summary || 'Evento importado do iCal',
            'event',
            'ical',
            key,
          ]);
        }
        
        imported++;
      } catch (error) {
        console.error(`Erro ao processar evento ${key}:`, error);
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
    console.error('Erro ao importar iCal:', error);
    throw error;
  }
}

// Função auxiliar para formatar data
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Gerar URL pública do iCal
export async function generateICalURL(propertyId: number): Promise<string> {
  const secret = process.env.ICAL_SECRET || 'change-me-in-production';
  const token = Buffer.from(`${propertyId}:${secret}`).toString('base64');
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/properties/${propertyId}/calendar/ical?token=${token}`;
}

// Validar token do iCal
export function validateICalToken(token: string, propertyId: number): boolean {
  const secret = process.env.ICAL_SECRET || 'change-me-in-production';
  const expectedToken = Buffer.from(`${propertyId}:${secret}`).toString('base64');
  return token === expectedToken;
}

// Sincronização bidirecional (exportar + importar)
export async function syncBidirectional(
  propertyId: number,
  icalURL?: string
): Promise<{ exported: boolean; imported: number; errors: number }> {
  try {
    // 1. Exportar reservas do RSV para iCal
    const icalContent = await exportRSVToICal(propertyId);
    
    // Salvar iCal em arquivo temporário ou retornar para download
    const icalPath = path.join(process.cwd(), 'public', 'calendars', `property-${propertyId}.ics`);
    const icalDir = path.dirname(icalPath);
    if (!fs.existsSync(icalDir)) {
      fs.mkdirSync(icalDir, { recursive: true });
    }
    fs.writeFileSync(icalPath, icalContent);
    
    // 2. Importar eventos externos (se URL fornecida)
    let imported = 0;
    let errors = 0;
    
    if (icalURL) {
      try {
        const response = await fetch(icalURL);
        const externalICal = await response.text();
        const result = await importICalToRSV(propertyId, externalICal);
        imported = result.imported;
        errors = result.errors;
      } catch (error) {
        console.error('Erro ao importar iCal externo:', error);
        errors++;
      }
    }
    
    return {
      exported: true,
      imported,
      errors,
    };
  } catch (error) {
    console.error('Erro na sincronização bidirecional:', error);
    throw error;
  }
}

