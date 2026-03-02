/**
 * ✅ INTEGRAÇÃO VRBO (Expedia Group)
 * Sistema completo de integração com VRBO
 */

import { getCredential } from './credentials-service';
import { queryDatabase } from './db';

export interface VRBOConfig {
  api_key: string;
  api_secret: string;
  access_token?: string;
  refresh_token?: string;
  property_id?: string;
}

export interface VRBOListing {
  id: string;
  property_id: string;
  title: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  base_price: number;
  currency: string;
  amenities: string[];
  images: string[];
}

export interface VRBOBooking {
  id: string;
  listing_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: string;
}

/**
 * Autenticar com VRBO
 */
export async function authenticateVRBO(config: VRBOConfig): Promise<{ access_token: string; refresh_token: string }> {
  if (!config.api_key || !config.api_secret) {
    throw new Error('Credenciais VRBO não fornecidas');
  }

  try {
    const response = await fetch('https://api.vrbo.com/v1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.api_key,
        client_secret: config.api_secret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha na autenticação VRBO');
    }

    const data = await response.json();
    return {
      access_token: data.access_token || config.access_token || '',
      refresh_token: data.refresh_token || '',
    };
  } catch (error: any) {
    if (config.access_token) {
      console.warn('Autenticação VRBO falhou, usando token existente:', error.message);
      return { access_token: config.access_token, refresh_token: config.refresh_token || '' };
    }
    throw error;
  }
}

/**
 * Buscar listings do VRBO
 */
export async function fetchVRBOListings(config: VRBOConfig): Promise<VRBOListing[]> {
  const auth = await authenticateVRBO(config);

  const response = await fetch('https://api.vrbo.com/v1/listings', {
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar listings VRBO: ${response.statusText}`);
  }

  const data = await response.json();
  return data.listings || [];
}

/**
 * Buscar reservas do VRBO
 */
export async function fetchVRBOBookings(
  config: VRBOConfig,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    listingId?: string;
  }
): Promise<VRBOBooking[]> {
  const auth = await authenticateVRBO(config);

  const params = new URLSearchParams();
  if (filters?.startDate) params.append('start_date', filters.startDate.toISOString().split('T')[0]);
  if (filters?.endDate) params.append('end_date', filters.endDate.toISOString().split('T')[0]);
  if (filters?.listingId) params.append('listing_id', filters.listingId);

  const response = await fetch(`https://api.vrbo.com/v1/bookings?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${auth.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar reservas VRBO: ${response.statusText}`);
  }

  const data = await response.json();
  return data.bookings || [];
}

/**
 * Sincronizar com VRBO
 */
export async function syncVRBOBidirectional(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<{ created: number; updated: number }> {
  const config = await getVRBOConfig(propertyId);
  const vrboBookings = await fetchVRBOBookings(config, { startDate, endDate });

  let created = 0;
  let updated = 0;

  for (const vrboBooking of vrboBookings) {
    const existing = await queryDatabase(
      `SELECT * FROM bookings WHERE external_id = $1 AND external_source = 'vrbo'`,
      [vrboBooking.id]
    );

    if (existing.length > 0) {
      await queryDatabase(
        `UPDATE bookings 
         SET status = $1, check_in = $2, check_out = $3, guests_count = $4
         WHERE id = $5`,
        [
          mapVRBOStatus(vrboBooking.status),
          vrboBooking.check_in,
          vrboBooking.check_out,
          vrboBooking.guests,
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
        VALUES ($1, $2, 'vrbo', NULL, $3, $4, $5, $6, $7)`,
        [
          propertyId,
          vrboBooking.id,
          vrboBooking.check_in,
          vrboBooking.check_out,
          vrboBooking.guests,
          mapVRBOStatus(vrboBooking.status),
          vrboBooking.total_amount,
        ]
      );
      created++;
    }
  }

  return { created, updated };
}

/**
 * Obter configuração do VRBO
 */
async function getVRBOConfig(propertyId: number): Promise<VRBOConfig> {
  const apiKey = await getCredential('vrbo', `api_key_${propertyId}`);
  const apiSecret = await getCredential('vrbo', `api_secret_${propertyId}`);
  const accessToken = await getCredential('vrbo', `access_token_${propertyId}`);

  if (!apiKey || !apiSecret) {
    throw new Error('Credenciais VRBO não configuradas para esta propriedade');
  }

  return {
    api_key: apiKey,
    api_secret: apiSecret,
    access_token: accessToken || undefined,
    property_id: propertyId.toString(),
  };
}

/**
 * Mapear status do VRBO
 */
function mapVRBOStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'confirmed',
    'pending': 'pending',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || 'pending';
}

