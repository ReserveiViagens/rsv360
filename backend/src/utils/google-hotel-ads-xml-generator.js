const { XMLBuilder } = require('fast-xml-parser');

/**
 * Utilitário para gerar feeds XML do Google Hotel Ads
 * Conforme especificação: https://support.google.com/hotelprices/answer/6326256
 */
class GoogleHotelAdsXmlGenerator {
  constructor() {
    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      suppressEmptyNode: true,
    });
  }

  /**
   * Gera feed XML completo para Google Hotel Ads
   * @param {Array} properties - Array de propriedades com acomodações
   * @param {Object} options - Opções de geração
   * @returns {string} XML formatado
   */
  generateFeed(properties, options = {}) {
    const {
      feedName = 'RSV360 Feed',
      lastGenerated = new Date().toISOString(),
      includeAuctions = true,
      includeFlashDeals = true,
    } = options;

    const hotels = [];

    for (const property of properties) {
      if (!property.accommodations || property.accommodations.length === 0) {
        continue;
      }

      for (const accommodation of property.accommodations) {
        const hotel = this.generateHotel(property, accommodation, {
          includeAuctions,
          includeFlashDeals,
        });

        if (hotel) {
          hotels.push(hotel);
        }
      }
    }

    const feed = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      HotelData: {
        '@_xmlns': 'http://www.google.com/hotel/ads/2013',
        Hotel: hotels,
      },
    };

    const xml = this.builder.build(feed);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  }

  /**
   * Gera elemento Hotel para uma acomodação
   */
  generateHotel(property, accommodation, options = {}) {
    const { includeAuctions, includeFlashDeals } = options;

    // Validar dados obrigatórios
    if (!accommodation.id || !accommodation.name || !property.city || !property.country) {
      return null;
    }

    const hotel = {
      '@_id': `rsv360_${accommodation.id}`,
      Name: accommodation.name,
      HotelID: `rsv360_${accommodation.id}`,
      Country: property.country || 'BR',
      City: property.city,
    };

    // Adicionar coordenadas se disponíveis
    if (property.latitude && property.longitude) {
      hotel.Coordinates = {
        '@_latitude': property.latitude,
        '@_longitude': property.longitude,
      };
    }

    // Adicionar endereço se disponível
    if (property.address) {
      hotel.Address = {
        AddressLine: property.address,
      };
      if (property.state) {
        hotel.Address.Province = property.state;
      }
      if (property.postal_code) {
        hotel.Address.PostalCode = property.postal_code;
      }
    }

    // Adicionar descrição
    if (accommodation.description) {
      hotel.Description = {
        Text: {
          '@_language': 'pt-BR',
          '#text': accommodation.description.substring(0, 500), // Limite Google
        },
      };
    }

    // Adicionar imagens
    if (accommodation.images && accommodation.images.length > 0) {
      hotel.Images = {
        Image: accommodation.images.slice(0, 20).map((img, index) => ({
          '@_id': index + 1,
          '@_url': img.url || img,
        })),
      };
    }

    // Gerar Rate Plans
    const ratePlans = [];

    // Rate Plan padrão (preço normal)
    if (accommodation.base_price) {
      ratePlans.push(
        this.generateRatePlan(accommodation, {
          id: 'standard',
          name: 'Preço Padrão',
          price: accommodation.base_price,
          availability: this.generateAvailability(accommodation),
        })
      );
    }

    // Rate Plans de leilões ativos
    if (includeAuctions && accommodation.active_auctions) {
      for (const auction of accommodation.active_auctions) {
        ratePlans.push(
          this.generateRatePlan(accommodation, {
            id: `auction_${auction.id}`,
            name: `Leilão - ${auction.title || 'Oferta Especial'}`,
            price: auction.current_price || auction.start_price,
            availability: this.generateAvailabilityFromAuction(auction),
            basePrice: auction.start_price,
            discount: auction.discount_percentage,
          })
        );
      }
    }

    // Rate Plans de flash deals ativos
    if (includeFlashDeals && accommodation.active_flash_deals) {
      for (const flashDeal of accommodation.active_flash_deals) {
        ratePlans.push(
          this.generateRatePlan(accommodation, {
            id: `flashdeal_${flashDeal.id}`,
            name: `Flash Deal - ${flashDeal.title || 'Oferta Relâmpago'}`,
            price: flashDeal.current_price,
            availability: this.generateAvailabilityFromFlashDeal(flashDeal),
            basePrice: flashDeal.original_price,
            discount: flashDeal.discount_percentage,
          })
        );
      }
    }

    if (ratePlans.length === 0) {
      return null; // Não incluir hotel sem rate plans
    }

    hotel.RatePlan = ratePlans;

    return hotel;
  }

  /**
   * Gera Rate Plan para Google Hotel Ads
   */
  generateRatePlan(accommodation, options) {
    const {
      id,
      name,
      price,
      availability,
      basePrice,
      discount,
    } = options;

    const ratePlan = {
      '@_id': id,
      Name: name,
      Price: {
        '@_currency': 'BRL',
        '#text': price.toFixed(2),
      },
    };

    // Adicionar preço base se houver desconto
    if (basePrice && basePrice > price) {
      ratePlan.Base = {
        '@_currency': 'BRL',
        '#text': basePrice.toFixed(2),
      };
    }

    // Adicionar disponibilidade
    if (availability && availability.length > 0) {
      ratePlan.Availability = availability.map((avail) => ({
        '@_date': avail.date,
        '@_available': avail.available ? 'true' : 'false',
      }));
    }

    // Adicionar link de reserva direta
    ratePlan.DirectBookingLink = `https://rsv360.com/accommodations/${accommodation.id}/book?ratePlan=${id}`;

    // Adicionar políticas de cancelamento se disponíveis
    if (accommodation.cancellation_policy) {
      ratePlan.CancellationPolicy = {
        Text: {
          '@_language': 'pt-BR',
          '#text': accommodation.cancellation_policy,
        },
      };
    }

    return ratePlan;
  }

  /**
   * Gera disponibilidade padrão para acomodação
   */
  generateAvailability(accommodation, days = 30) {
    const availability = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Verificar se há disponibilidade na data
      const isAvailable = accommodation.availability
        ? accommodation.availability[dateStr] !== undefined
          ? accommodation.availability[dateStr] > 0
          : true
        : true;

      availability.push({
        date: dateStr,
        available: isAvailable,
      });
    }

    return availability;
  }

  /**
   * Gera disponibilidade a partir de leilão
   */
  generateAvailabilityFromAuction(auction) {
    const availability = [];
    const startDate = new Date(auction.start_date);
    const endDate = new Date(auction.end_date);
    const today = new Date();

    // Disponibilidade apenas durante o período do leilão
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d >= today && auction.status === 'active') {
        availability.push({
          date: d.toISOString().split('T')[0],
          available: true,
        });
      }
    }

    return availability;
  }

  /**
   * Gera disponibilidade a partir de flash deal
   */
  generateAvailabilityFromFlashDeal(flashDeal) {
    const availability = [];
    const startDate = new Date(flashDeal.start_date);
    const endDate = new Date(flashDeal.end_date);
    const today = new Date();

    // Disponibilidade durante o período do flash deal e enquanto houver unidades
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d >= today && flashDeal.status === 'active' && flashDeal.units_available > 0) {
        availability.push({
          date: d.toISOString().split('T')[0],
          available: true,
        });
      }
    }

    return availability;
  }

  /**
   * Valida XML gerado
   */
  validateFeed(xml) {
    const errors = [];

    try {
      // Verificar se é XML válido
      if (!xml || !xml.includes('<?xml')) {
        errors.push('Invalid XML format');
      }

      // Verificar estrutura básica
      if (!xml.includes('<HotelData')) {
        errors.push('Missing HotelData element');
      }

      // Verificar se há pelo menos um hotel
      const hotelCount = (xml.match(/<Hotel/g) || []).length;
      if (hotelCount === 0) {
        errors.push('No hotels found in feed');
      }

      // Verificar se cada hotel tem RatePlan
      const ratePlanCount = (xml.match(/<RatePlan/g) || []).length;
      if (ratePlanCount === 0) {
        errors.push('No rate plans found in feed');
      }
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = GoogleHotelAdsXmlGenerator;
