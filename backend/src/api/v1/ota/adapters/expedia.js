const OTAAdapter = require('./base');
const logger = require('../../../../utils/logger');
// Usar fetch nativo (Node.js 18+) ou instalar axios: npm install axios
const fetch = global.fetch || require('node-fetch');

/**
 * Adapter para Expedia
 */
class ExpediaAdapter extends OTAAdapter {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://api.expedia.com/v3';
  }

  /**
   * Verificar conexão com Expedia
   */
  async testConnection() {
    try {
      // Expedia usa autenticação OAuth2
      const token = await this._getAccessToken();
      const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      return response.ok;
    } catch (error) {
      logger.error('Expedia connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Obter token de acesso OAuth2
   */
  async _getAccessToken() {
    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      });

      const response = await fetch('https://api.expedia.com/oauth2/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Error getting Expedia access token:', error.message);
      throw error;
    }
  }

  /**
   * Buscar disponibilidade
   */
  async getAvailability(checkIn, checkOut) {
    try {
      const token = await this._getAccessToken();
      const url = `${this.baseUrl}/properties/${this.propertyId}/availability?checkin=${checkIn}&checkout=${checkOut}&room_id=${this.accommodationId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this._convertAvailabilityResponse(data);
    } catch (error) {
      logger.error('Error getting availability from Expedia:', error.message);
      throw error;
    }
  }

  /**
   * Buscar reservas
   */
  async getReservations(startDate, endDate) {
    try {
      const token = await this._getAccessToken();
      const url = `${this.baseUrl}/properties/${this.propertyId}/reservations?start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this._convertReservationsResponse(data);
    } catch (error) {
      logger.error('Error getting reservations from Expedia:', error.message);
      throw error;
    }
  }

  /**
   * Criar reserva
   */
  async createReservation(reservationData) {
    try {
      const token = await this._getAccessToken();
      const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: this.accommodationId,
          checkin: reservationData.checkIn,
          checkout: reservationData.checkOut,
          guests: reservationData.guests,
          guest: {
            name: reservationData.guestName,
            email: reservationData.guestEmail,
            phone: reservationData.guestPhone,
          },
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
      logger.error('Error creating reservation on Expedia:', error.message);
      throw error;
    }
  }

  /**
   * Atualizar disponibilidade
   */
  async updateAvailability(availabilityData) {
    try {
      const token = await this._getAccessToken();
      const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: this.accommodationId,
          availability: availabilityData.dates.map(date => ({
            date: date.date,
            available: date.available,
            rate: date.price,
          })),
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating availability on Expedia:', error.message);
      throw error;
    }
  }

  /**
   * Atualizar preços
   */
  async updatePricing(pricingData) {
    try {
      const token = await this._getAccessToken();
      const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}/rates`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: this.accommodationId,
          rates: pricingData.prices.map(price => ({
            date: price.date,
            rate: price.price,
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
      logger.error('Error updating pricing on Expedia:', error.message);
      throw error;
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelReservation(reservationId) {
    try {
      const token = await this._getAccessToken();
      const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error canceling reservation on Expedia:', error.message);
      throw error;
    }
  }

  /**
   * Converter resposta de disponibilidade para formato padrão
   */
  _convertAvailabilityResponse(data) {
    // Implementar conversão específica da Expedia
    return {
      available: data.available || false,
      price: data.rate || null,
      currency: data.currency || 'BRL',
    };
  }

  /**
   * Converter resposta de reservas para formato padrão
   */
  _convertReservationsResponse(data) {
    // Implementar conversão específica da Expedia
    return (data.reservations || []).map(reservation => ({
      otaReservationId: reservation.reservation_id,
      checkIn: reservation.checkin,
      checkOut: reservation.checkout,
      guests: reservation.guests,
      totalAmount: reservation.total_amount,
      currency: reservation.currency || 'BRL',
      status: reservation.status || 'confirmed',
      guestName: reservation.guest?.name,
      guestEmail: reservation.guest?.email,
      guestPhone: reservation.guest?.phone,
    }));
  }
}

module.exports = ExpediaAdapter;
