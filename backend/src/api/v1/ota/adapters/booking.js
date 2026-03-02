const OTAAdapter = require('./base');
const logger = require('../../../../utils/logger');
// Usar fetch nativo (Node.js 18+) ou instalar axios: npm install axios
const fetch = global.fetch || require('node-fetch');

/**
 * Adapter para Booking.com
 */
class BookingAdapter extends OTAAdapter {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://distribution-xml.booking.com/2.0/json';
  }

  /**
   * Verificar conexão com Booking.com
   */
  async testConnection() {
    try {
      // Booking.com usa autenticação via API key
      const url = `${this.baseUrl}/hotels?hotel_ids=${this.propertyId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      return response.ok;
    } catch (error) {
      logger.error('Booking.com connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Buscar disponibilidade
   */
  async getAvailability(checkIn, checkOut) {
    try {
      const url = `${this.baseUrl}/hotelAvailability?hotel_ids=${this.propertyId}&checkin=${checkIn}&checkout=${checkOut}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Converter resposta da Booking.com para formato padrão
      return this._convertAvailabilityResponse(data);
    } catch (error) {
      logger.error('Error getting availability from Booking.com:', error.message);
      throw error;
    }
  }

  /**
   * Buscar reservas
   */
  async getReservations(startDate, endDate) {
    try {
      const url = `${this.baseUrl}/reservations?hotel_id=${this.propertyId}&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Converter resposta da Booking.com para formato padrão
      return this._convertReservationsResponse(data);
    } catch (error) {
      logger.error('Error getting reservations from Booking.com:', error.message);
      throw error;
    }
  }

  /**
   * Criar reserva
   */
  async createReservation(reservationData) {
    try {
      const response = await fetch(`${this.baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel_id: this.propertyId,
          room_id: this.accommodationId,
          checkin: reservationData.checkIn,
          checkout: reservationData.checkOut,
          guests: reservationData.guests,
          guest_name: reservationData.guestName,
          guest_email: reservationData.guestEmail,
          guest_phone: reservationData.guestPhone,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        otaReservationId: data.reservation_id,
        status: 'confirmed',
        ...reservationData,
      };
    } catch (error) {
      logger.error('Error creating reservation on Booking.com:', error.message);
      throw error;
    }
  }

  /**
   * Atualizar disponibilidade
   */
  async updateAvailability(availabilityData) {
    try {
      const response = await fetch(`${this.baseUrl}/hotelAvailability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel_id: this.propertyId,
          room_id: this.accommodationId,
          dates: availabilityData.dates.map(date => ({
            date: date.date,
            available: date.available,
            price: date.price,
          })),
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating availability on Booking.com:', error.message);
      throw error;
    }
  }

  /**
   * Atualizar preços
   */
  async updatePricing(pricingData) {
    try {
      const response = await fetch(`${this.baseUrl}/hotelPricing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel_id: this.propertyId,
          room_id: this.accommodationId,
          prices: pricingData.prices.map(price => ({
            date: price.date,
            price: price.price,
            currency: price.currency || 'BRL',
          })),
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating pricing on Booking.com:', error.message);
      throw error;
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelReservation(reservationId) {
    try {
      const response = await fetch(`${this.baseUrl}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error canceling reservation on Booking.com:', error.message);
      throw error;
    }
  }

  /**
   * Converter resposta de disponibilidade para formato padrão
   */
  _convertAvailabilityResponse(data) {
    // Implementar conversão específica da Booking.com
    return {
      available: data.available || false,
      price: data.price || null,
      currency: data.currency || 'BRL',
    };
  }

  /**
   * Converter resposta de reservas para formato padrão
   */
  _convertReservationsResponse(data) {
    // Implementar conversão específica da Booking.com
    return (data.reservations || []).map(reservation => ({
      otaReservationId: reservation.reservation_id,
      checkIn: reservation.checkin,
      checkOut: reservation.checkout,
      guests: reservation.guests,
      totalAmount: reservation.total_amount,
      currency: reservation.currency || 'BRL',
      status: reservation.status || 'confirmed',
      guestName: reservation.guest_name,
      guestEmail: reservation.guest_email,
      guestPhone: reservation.guest_phone,
    }));
  }
}

module.exports = BookingAdapter;
