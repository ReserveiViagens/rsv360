/**
 * ✅ SERVIÇO EXPEDIA
 * 
 * Integração com Expedia API:
 * - OAuth2 authentication
 * - Sincronização de reservas
 * - Sincronização de preços
 * - Sincronização de disponibilidade
 */

import { queryDatabase } from './db';
import { getServiceCredentials, saveCredential } from './credentials-service';

export interface ExpediaReservation {
  reservation_id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  currency: string;
}

/**
 * Obter access token do Expedia
 */
async function getExpediaAccessToken(): Promise<string> {
  try {
    const credentials = await getServiceCredentials('expedia');
    
    if (!credentials.client_id || !credentials.client_secret) {
      throw new Error('Credenciais Expedia não configuradas');
    }

    if (credentials.access_token) {
      return credentials.access_token;
    }

    if (credentials.refresh_token) {
      const newToken = await refreshExpediaToken(credentials.refresh_token);
      await saveExpediaToken(newToken.access_token, newToken.refresh_token);
      return newToken.access_token;
    }

    throw new Error('Token Expedia não disponível. Configure OAuth2.');
  } catch (error: any) {
    console.error('Erro ao obter token Expedia:', error);
    throw error;
  }
}

/**
 * Renovar token do Expedia
 */
async function refreshExpediaToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const credentials = await getServiceCredentials('expedia');
  
  const response = await fetch('https://api.expedia.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Erro ao renovar token Expedia');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
  };
}

/**
 * Salvar token do Expedia
 */
async function saveExpediaToken(accessToken: string, refreshToken?: string): Promise<void> {
  await saveCredential('expedia', 'access_token', accessToken, true, 'Expedia Access Token');
  if (refreshToken) {
    await saveCredential('expedia', 'refresh_token', refreshToken, true, 'Expedia Refresh Token');
  }
}

/**
 * ✅ IMPLEMENTAÇÃO REAL: Buscar reservas do Expedia
 */
export async function getExpediaReservations(
  propertyId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ExpediaReservation[]> {
  try {
    const accessToken = await getExpediaAccessToken();

    const params = new URLSearchParams();
    if (propertyId) params.append('property_id', propertyId);
    if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);

    const response = await fetch(
      `https://api.expedia.com/v3/properties/reservations?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        const credentials = await getServiceCredentials('expedia');
        if (credentials.refresh_token) {
          const newToken = await refreshExpediaToken(credentials.refresh_token);
          await saveExpediaToken(newToken.access_token, newToken.refresh_token);
          return getExpediaReservations(propertyId, startDate, endDate);
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao buscar reservas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.reservations || [];
  } catch (error: any) {
    console.error('Erro ao buscar reservas do Expedia:', error);
    return [];
  }
}

/**
 * Sincronizar reservas do Expedia
 */
export async function syncExpediaReservations(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const reservations = await getExpediaReservations(undefined, startDate, endDate);
    let synced = 0;

    for (const reservation of reservations) {
      try {
        const existing = await queryDatabase(
          `SELECT id FROM bookings 
           WHERE external_id = $1 AND source = 'expedia'`,
          [reservation.reservation_id]
        );

        if (existing.length === 0) {
          await queryDatabase(
            `INSERT INTO bookings 
             (property_id, user_id, check_in, check_out, total_amount, status, source, external_id, guest_name, guest_email, created_at)
             VALUES ($1, NULL, $2, $3, $4, $5, 'expedia', $6, $7, $8, CURRENT_TIMESTAMP)`,
            [
              propertyId,
              reservation.check_in,
              reservation.check_out,
              reservation.total_amount,
              reservation.status === 'confirmed' ? 'confirmed' : 'pending',
              reservation.reservation_id,
              reservation.guest_name,
              reservation.guest_email,
            ]
          );
          synced++;
        }
      } catch (error: any) {
        console.error('Erro ao sincronizar reserva:', error);
      }
    }

    return synced;
  } catch (error: any) {
    console.error('Erro ao sincronizar reservas do Expedia:', error);
    return 0;
  }
}

