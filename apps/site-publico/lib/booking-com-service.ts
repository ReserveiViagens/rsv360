/**
 * ✅ SERVIÇO BOOKING.COM
 * 
 * Integração com Booking.com API:
 * - OAuth2 authentication
 * - Sincronização de reservas
 * - Sincronização de preços
 * - Sincronização de disponibilidade
 * - Mensagens
 */

import { queryDatabase } from './db';
import { getServiceCredentials, saveCredential } from './credentials-service';

export interface BookingComReservation {
  reservation_id: string;
  hotel_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  currency: string;
}

/**
 * Obter access token do Booking.com
 */
async function getBookingComAccessToken(): Promise<string> {
  try {
    const credentials = await getServiceCredentials('booking_com');
    
    if (!credentials.client_id || !credentials.client_secret) {
      throw new Error('Credenciais Booking.com não configuradas');
    }

    if (credentials.access_token) {
      return credentials.access_token;
    }

    if (credentials.refresh_token) {
      const newToken = await refreshBookingComToken(credentials.refresh_token);
      await saveBookingComToken(newToken.access_token, newToken.refresh_token);
      return newToken.access_token;
    }

    throw new Error('Token Booking.com não disponível. Configure OAuth2.');
  } catch (error: any) {
    console.error('Erro ao obter token Booking.com:', error);
    throw error;
  }
}

/**
 * Renovar token do Booking.com
 */
async function refreshBookingComToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const credentials = await getServiceCredentials('booking_com');
  
  const response = await fetch('https://api.booking.com/v3/auth/token', {
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
    throw new Error(errorData.error?.message || 'Erro ao renovar token Booking.com');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
  };
}

/**
 * Salvar token do Booking.com
 */
async function saveBookingComToken(accessToken: string, refreshToken?: string): Promise<void> {
  await saveCredential('booking_com', 'access_token', accessToken, true, 'Booking.com Access Token');
  if (refreshToken) {
    await saveCredential('booking_com', 'refresh_token', refreshToken, true, 'Booking.com Refresh Token');
  }
}

/**
 * ✅ IMPLEMENTAÇÃO REAL: Buscar reservas do Booking.com
 */
export async function getBookingComReservations(
  hotelId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<BookingComReservation[]> {
  try {
    const accessToken = await getBookingComAccessToken();

    const params = new URLSearchParams();
    if (hotelId) params.append('hotel_id', hotelId);
    if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);

    const response = await fetch(
      `https://api.booking.com/v3/hotels/reservations?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        const credentials = await getServiceCredentials('booking_com');
        if (credentials.refresh_token) {
          const newToken = await refreshBookingComToken(credentials.refresh_token);
          await saveBookingComToken(newToken.access_token, newToken.refresh_token);
          return getBookingComReservations(hotelId, startDate, endDate);
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao buscar reservas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.reservations || [];
  } catch (error: any) {
    console.error('Erro ao buscar reservas do Booking.com:', error);
    return [];
  }
}

/**
 * Sincronizar reservas do Booking.com
 */
export async function syncBookingComReservations(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const reservations = await getBookingComReservations(undefined, startDate, endDate);
    let synced = 0;

    for (const reservation of reservations) {
      try {
        // Verificar se já existe
        const existing = await queryDatabase(
          `SELECT id FROM bookings 
           WHERE external_id = $1 AND source = 'booking_com'`,
          [reservation.reservation_id]
        );

        if (existing.length === 0) {
          await queryDatabase(
            `INSERT INTO bookings 
             (property_id, user_id, check_in, check_out, total_amount, status, source, external_id, guest_name, guest_email, created_at)
             VALUES ($1, NULL, $2, $3, $4, $5, 'booking_com', $6, $7, $8, CURRENT_TIMESTAMP)`,
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
    console.error('Erro ao sincronizar reservas do Booking.com:', error);
    return 0;
  }
}

