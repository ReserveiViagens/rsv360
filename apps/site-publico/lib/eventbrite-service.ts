/**
 * ✅ SERVIÇO EVENTBRITE REAL
 * 
 * Integração real com Eventbrite API:
 * - Buscar eventos públicos
 * - Filtrar por localização
 * - Sincronizar eventos para Smart Pricing
 */

import { queryDatabase } from './db';
import { getCredential, getServiceCredentials } from './credentials-service';

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description?: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  venue?: {
    name: string;
    address: {
      address_1?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
    };
  };
  online_event: boolean;
  capacity?: number;
  status: string;
}

export interface LocalEvent {
  id: number;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  source: string;
  external_id?: string;
  attendee_count?: number;
  created_at: string;
}

/**
 * ✅ IMPLEMENTAÇÃO REAL: Buscar eventos do Eventbrite
 */
export async function fetchEventbriteEvents(
  location?: string,
  startDate?: Date,
  endDate?: Date
): Promise<EventbriteEvent[]> {
  try {
    const apiKey = await getCredential('eventbrite', 'api_key');
    
    if (!apiKey) {
      console.warn('Eventbrite API key não configurada');
      return [];
    }

    const params = new URLSearchParams({
      token: apiKey,
      expand: 'venue',
      status: 'live',
    });

    if (location) {
      params.append('location.address', location);
      params.append('location.within', '50km'); // 50km de raio
    }

    if (startDate) {
      params.append('start_date.range_start', startDate.toISOString());
    } else {
      params.append('start_date.range_start', new Date().toISOString());
    }

    if (endDate) {
      params.append('start_date.range_end', endDate.toISOString());
    } else {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      params.append('start_date.range_end', futureDate.toISOString());
    }

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error_description || `Erro ao buscar eventos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error: any) {
    console.error('Erro ao buscar eventos do Eventbrite:', error);
    return [];
  }
}

/**
 * Sincronizar eventos do Eventbrite para banco local
 */
export async function syncEventbriteEvents(
  location: string,
  startDate: Date,
  endDate: Date
): Promise<LocalEvent[]> {
  try {
    // Buscar eventos do Eventbrite
    const events = await fetchEventbriteEvents(location, startDate, endDate);

    const syncedEvents: LocalEvent[] = [];

    for (const event of events) {
      try {
        // Verificar se já existe
        const existing = await queryDatabase(
          `SELECT id FROM local_events 
           WHERE external_id = $1 AND source = 'eventbrite'`,
          [event.id]
        );

        const eventLocation = event.venue 
          ? `${event.venue.name}, ${event.venue.address?.city || location}`
          : location;

        if (existing.length === 0) {
          // Inserir novo evento
          const result = await queryDatabase(
            `INSERT INTO local_events 
             (title, description, location, start_date, end_date, source, external_id, attendee_count, created_at)
             VALUES ($1, $2, $3, $4, $5, 'eventbrite', $6, $7, CURRENT_TIMESTAMP)
             RETURNING id, title, description, location, start_date, end_date, source, external_id, attendee_count, created_at`,
            [
              event.name.text,
              event.description?.text || null,
              eventLocation,
              event.start.local,
              event.end.local,
              event.id,
              event.capacity || 0,
            ]
          );

          syncedEvents.push(result[0] as LocalEvent);
        } else {
          // Atualizar evento existente
          await queryDatabase(
            `UPDATE local_events 
             SET title = $1, description = $2, location = $3, start_date = $4, end_date = $5, attendee_count = $6
             WHERE id = $7`,
            [
              event.name.text,
              event.description?.text || null,
              eventLocation,
              event.start.local,
              event.end.local,
              event.capacity || 0,
              existing[0].id,
            ]
          );

          const updated = await queryDatabase(
            `SELECT id, title, description, location, start_date, end_date, source, external_id, attendee_count, created_at
             FROM local_events WHERE id = $1`,
            [existing[0].id]
          );

          syncedEvents.push(updated[0] as LocalEvent);
        }
      } catch (error: any) {
        console.error('Erro ao sincronizar evento:', error);
      }
    }

    return syncedEvents;
  } catch (error: any) {
    console.error('Erro ao sincronizar eventos do Eventbrite:', error);
    return [];
  }
}


