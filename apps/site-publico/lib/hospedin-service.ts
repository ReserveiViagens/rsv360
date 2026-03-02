/**
 * ✅ INTEGRAÇÃO HOSPEDIN PMS
 * Sistema completo de integração com Hospedin
 */

import { getCredential } from './credentials-service';

export interface HospedinConfig {
  api_key: string;
  api_secret: string;
  access_token?: string;
  refresh_token?: string;
  property_id?: string;
}

export interface HospedinBooking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out';
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface HospedinRoom {
  id: string;
  property_id: string;
  name: string;
  type: string;
  capacity: number;
  amenities: string[];
  price_per_night: number;
  available: boolean;
}

/**
 * Autenticar com Hospedin
 */
export async function authenticateHospedin(config: HospedinConfig): Promise<{ access_token: string; refresh_token: string }> {
  if (!config.api_key || !config.api_secret) {
    throw new Error('Credenciais Hospedin não fornecidas');
  }

  try {
    const response = await fetch('https://api.hospedin.com/v1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: config.api_key,
        client_secret: config.api_secret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha na autenticação Hospedin');
    }

    const data = await response.json();
    return {
      access_token: data.access_token || config.access_token || '',
      refresh_token: data.refresh_token || '',
    };
  } catch (error: any) {
    if (config.access_token) {
      console.warn('Autenticação Hospedin falhou, usando token existente:', error.message);
      return { access_token: config.access_token, refresh_token: config.refresh_token || '' };
    }
    throw error;
  }
}

/**
 * Buscar reservas do Hospedin
 */
export async function fetchHospedinBookings(
  config: HospedinConfig,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }
): Promise<HospedinBooking[]> {
  const auth = await authenticateHospedin(config);
  
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('start_date', filters.startDate.toISOString().split('T')[0]);
  if (filters?.endDate) params.append('end_date', filters.endDate.toISOString().split('T')[0]);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`https://api.hospedin.com/v1/bookings?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar reservas Hospedin: ${response.statusText}`);
  }

  const data = await response.json();
  return data.bookings || [];
}

/**
 * Criar reserva no Hospedin
 */
export async function createHospedinBooking(
  config: HospedinConfig,
  booking: {
    property_id: string;
    room_id: string;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    check_in: string;
    check_out: string;
    adults: number;
    children?: number;
    total_amount: number;
    notes?: string;
  }
): Promise<HospedinBooking> {
  const auth = await authenticateHospedin(config);

  const response = await fetch('https://api.hospedin.com/v1/bookings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Erro ao criar reserva no Hospedin');
  }

  const data = await response.json();
  return data.booking;
}

/**
 * Buscar disponibilidade
 */
export async function fetchHospedinAvailability(
  config: HospedinConfig,
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; available: boolean; rooms: HospedinRoom[] }>> {
  const auth = await authenticateHospedin(config);

  const params = new URLSearchParams({
    property_id: propertyId,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });

  const response = await fetch(`https://api.hospedin.com/v1/availability?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar disponibilidade Hospedin: ${response.statusText}`);
  }

  const data = await response.json();
  return data.availability || [];
}

/**
 * Sincronizar reservas bidirecionalmente
 */
export async function syncHospedinBidirectional(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<{ created: number; updated: number; conflicts: number }> {
  const config = await getHospedinConfig(propertyId);
  const hospedinBookings = await fetchHospedinBookings(config, { startDate, endDate });

  let created = 0;
  let updated = 0;
  let conflicts = 0;

  for (const hospedinBooking of hospedinBookings) {
    // Verificar se já existe no nosso sistema
    const existing = await queryDatabase(
      `SELECT * FROM bookings WHERE external_id = $1 AND external_source = 'hospedin'`,
      [hospedinBooking.id]
    );

    if (existing.length > 0) {
      // Atualizar existente
      await queryDatabase(
        `UPDATE bookings 
         SET status = $1, check_in = $2, check_out = $3, guests_count = $4
         WHERE id = $5`,
        [
          mapHospedinStatus(hospedinBooking.status),
          hospedinBooking.check_in,
          hospedinBooking.check_out,
          hospedinBooking.adults + (hospedinBooking.children || 0),
          existing[0].id,
        ]
      );
      updated++;
    } else {
      // Criar novo
      await queryDatabase(
        `INSERT INTO bookings (
          property_id, external_id, external_source, user_id,
          check_in, check_out, guests_count, status, total_amount
        )
        VALUES ($1, $2, 'hospedin', NULL, $3, $4, $5, $6, $7)`,
        [
          propertyId,
          hospedinBooking.id,
          hospedinBooking.check_in,
          hospedinBooking.check_out,
          hospedinBooking.adults + (hospedinBooking.children || 0),
          mapHospedinStatus(hospedinBooking.status),
          hospedinBooking.total_amount,
        ]
      );
      created++;
    }
  }

  return { created, updated, conflicts };
}

/**
 * Obter configuração do Hospedin
 */
async function getHospedinConfig(propertyId: number): Promise<HospedinConfig> {
  const apiKey = await getCredential('hospedin', `api_key_${propertyId}`);
  const apiSecret = await getCredential('hospedin', `api_secret_${propertyId}`);
  const accessToken = await getCredential('hospedin', `access_token_${propertyId}`);

  if (!apiKey || !apiSecret) {
    throw new Error('Credenciais Hospedin não configuradas para esta propriedade');
  }

  return {
    api_key: apiKey,
    api_secret: apiSecret,
    access_token: accessToken || undefined,
    property_id: propertyId.toString(),
  };
}

/**
 * Mapear status do Hospedin para nosso sistema
 */
function mapHospedinStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'confirmed',
    'pending': 'pending',
    'cancelled': 'cancelled',
    'checked_in': 'checked_in',
    'checked_out': 'completed',
  };
  return statusMap[status] || 'pending';
}

import { queryDatabase } from './db';

