/**
 * Classe abstrata base para adapters OTA
 */
class OTAAdapter {
  constructor(config) {
    this.config = config;
    this.otaName = config.otaName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.propertyId = config.propertyId;
    this.accommodationId = config.accommodationId;
  }

  /**
   * Verificar conexão com a OTA
   * Deve ser implementado por cada adapter
   */
  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }

  /**
   * Buscar disponibilidade
   * Deve ser implementado por cada adapter
   */
  async getAvailability(checkIn, checkOut) {
    throw new Error('getAvailability must be implemented by subclass');
  }

  /**
   * Buscar reservas
   * Deve ser implementado por cada adapter
   */
  async getReservations(startDate, endDate) {
    throw new Error('getReservations must be implemented by subclass');
  }

  /**
   * Criar reserva
   * Deve ser implementado por cada adapter
   */
  async createReservation(reservationData) {
    throw new Error('createReservation must be implemented by subclass');
  }

  /**
   * Atualizar disponibilidade
   * Deve ser implementado por cada adapter
   */
  async updateAvailability(availabilityData) {
    throw new Error('updateAvailability must be implemented by subclass');
  }

  /**
   * Atualizar preços
   * Deve ser implementado por cada adapter
   */
  async updatePricing(pricingData) {
    throw new Error('updatePricing must be implemented by subclass');
  }

  /**
   * Cancelar reserva
   * Deve ser implementado por cada adapter
   */
  async cancelReservation(reservationId) {
    throw new Error('cancelReservation must be implemented by subclass');
  }
}

module.exports = OTAAdapter;
