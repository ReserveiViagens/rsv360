/**
 * ✅ INTEGRAÇÃO DECOLAR
 * Sistema completo de integração com Decolar
 */

import { getCredential } from './credentials-service';
import { queryDatabase } from './db';

export interface DecolarConfig {
  api_key: string;
  api_secret: string;
  access_token?: string;
  refresh_token?: string;
  property_id?: string;
}

export interface DecolarProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rooms: DecolarRoom[];
}

export interface DecolarRoom {
  id: string;
  property_id: string;
  name: string;
  type: string;
  capacity: number;
  amenities: string[];
  price_per_night: number;
}

export interface DecolarBooking {
  id: string;
  property_id: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: string;
}

/**
 * Autenticar com Decolar
 */
export async function authenticateDecolar(config: DecolarConfig): Promise<{ access_token: string; refresh_token: string }> {
  if (!config.api_key || !config.api_secret) {
    throw new Error('Credenciais Decolar não fornecidas');
  }

  try {
    const response = await fetch('https://api.decolar.com/v1/oauth/token', {
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
      throw new Error(errorData.error?.message || 'Falha na autenticação Decolar');
    }

    const data = await response.json();
    return {
      access_token: data.access_token || config.access_token || '',
      refresh_token: data.refresh_token || '',
    };
  } catch (error: any) {
    if (config.access_token) {
      console.warn('Autenticação Decolar falhou, usando token existente:', error.message);
      return { access_token: config.access_token, refresh_token: config.refresh_token || '' };
    }
    throw error;
  }
}

/**
 * Buscar propriedades do Decolar
 */
export async function fetchDecolarProperties(config: DecolarConfig): Promise<DecolarProperty[]> {
  const auth = await authenticateDecolar(config);

  const response = await fetch('https://api.decolar.com/v1/properties', {
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar propriedades Decolar: ${response.statusText}`);
  }

  const data = await response.json();
  return data.properties || [];
}

/**
 * Buscar reservas do Decolar
 */
export async function fetchDecolarBookings(
  config: DecolarConfig,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    propertyId?: string;
  }
): Promise<DecolarBooking[]> {
  const auth = await authenticateDecolar(config);

  const params = new URLSearchParams();
  if (filters?.startDate) params.append('start_date', filters.startDate.toISOString().split('T')[0]);
  if (filters?.endDate) params.append('end_date', filters.endDate.toISOString().split('T')[0]);
  if (filters?.propertyId) params.append('property_id', filters.propertyId);

  const response = await fetch(`https://api.decolar.com/v1/bookings?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar reservas Decolar: ${response.statusText}`);
  }

  const data = await response.json();
  return data.bookings || [];
}

/**
 * Sincronizar com Decolar
 */
export async function syncDecolarBidirectional(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<{ created: number; updated: number }> {
  const config = await getDecolarConfig(propertyId);
  const decolarBookings = await fetchDecolarBookings(config, { startDate, endDate, propertyId: config.property_id });

  let created = 0;
  let updated = 0;

  for (const decolarBooking of decolarBookings) {
    const existing = await queryDatabase(
      `SELECT * FROM bookings WHERE external_id = $1 AND external_source = 'decolar'`,
      [decolarBooking.id]
    );

    if (existing.length > 0) {
      await queryDatabase(
        `UPDATE bookings 
         SET status = $1, check_in = $2, check_out = $3, guests_count = $4
         WHERE id = $5`,
        [
          mapDecolarStatus(decolarBooking.status),
          decolarBooking.check_in,
          decolarBooking.check_out,
          decolarBooking.adults + decolarBooking.children,
          existing[0].id,
        ]
      );
      updated++;
    } else {
      await queryDatabase(
        `INSERT INTO bookings (
          property_id, external_id, external_source, user_id,
          check_in, check_out, guests_count, status, total_amount
        )
        VALUES ($1, $2, 'decolar', NULL, $3, $4, $5, $6, $7)`,
        [
          propertyId,
          decolarBooking.id,
          decolarBooking.check_in,
          decolarBooking.check_out,
          decolarBooking.adults + decolarBooking.children,
          mapDecolarStatus(decolarBooking.status),
          decolarBooking.total_amount,
        ]
      );
      created++;
    }
  }

  return { created, updated };
}

/**
 * Obter configuração do Decolar
 */
async function getDecolarConfig(propertyId: number): Promise<DecolarConfig> {
  const apiKey = await getCredential('decolar', `api_key_${propertyId}`);
  const apiSecret = await getCredential('decolar', `api_secret_${propertyId}`);
  const accessToken = await getCredential('decolar', `access_token_${propertyId}`);

  if (!apiKey || !apiSecret) {
    throw new Error('Credenciais Decolar não configuradas para esta propriedade');
  }

  return {
    api_key: apiKey,
    api_secret: apiSecret,
    access_token: accessToken || undefined,
    property_id: propertyId.toString(),
  };
}

/**
 * Mapear status do Decolar
 */
function mapDecolarStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'confirmed',
    'pending': 'pending',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || 'pending';
}

