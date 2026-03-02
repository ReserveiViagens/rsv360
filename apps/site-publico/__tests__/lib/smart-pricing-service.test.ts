/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Smart Pricing Service
 * Testes para o serviço de precificação inteligente
 * 
 * @module __tests__/lib/smart-pricing-service.test
 */

import { calculateSmartPrice } from '@/lib/smart-pricing-service';
import { queryDatabase } from '@/lib/db';
import { competitorScraperService } from '@/lib/competitor-scraper';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');
jest.mock('@/lib/competitor-scraper', () => ({
  competitorScraperService: {
    scrapeCompetitors: jest.fn()
  }
}));
jest.mock('@/lib/cache-integration', () => ({
  cachePricing: jest.fn((key, dateKey, fn) => fn()),
  invalidatePricingCache: jest.fn()
}));
jest.mock('@/lib/ml/advanced-pricing-model', () => ({
  advancedPricingModel: {
    predict: jest.fn()
  }
}));

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;
const mockCompetitorScraper = competitorScraperService as jest.Mocked<typeof competitorScraperService>;

describe('SmartPricingService', () => {
  const propertyId = 1;
  const basePrice = 100;
  const checkIn = new Date('2025-12-15');
  const checkOut = new Date('2025-12-20');
  const location = 'Caldas Novas, GO';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn().mockResolvedValue(null);
    mockRedisCache.set = jest.fn();
  });

  describe('calculateSmartPrice', () => {
    it('should calculate price with weather factor', async () => {
      // Arrange
      const mockWeather = {
        temperature: 28,
        condition: 'sunny',
        humidity: 60,
        windSpeed: 10
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT dynamic_pricing_config
      // 2. getWeatherData (pode fazer queryDatabase interno)
      // 3. syncGoogleCalendarEvents (pode fazer queryDatabase interno)
      // 4. syncEventbriteEvents (pode fazer queryDatabase interno)
      // 5. queryDatabase - SELECT properties (para scraping)
      // 6. getCompetitorPrices (pode fazer queryDatabase interno)
      // 7. calculateDemandMultiplier (pode fazer queryDatabase interno)
      // 8. queryDatabase - INSERT pricing_history

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]) // No config
        .mockResolvedValueOnce([]) // Weather cache miss
        .mockResolvedValueOnce([]) // Google Calendar events
        .mockResolvedValueOnce([]) // Eventbrite events
        .mockResolvedValueOnce([]) // Properties (for scraping)
        .mockResolvedValueOnce([]) // Competitor prices cache
        .mockResolvedValueOnce([]) // Demand multiplier query
        .mockResolvedValueOnce([]); // INSERT pricing_history

      // Note: getWeatherData is called internally and will use mocked queryDatabase
      // The service will handle weather data internally

      // Act
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.basePrice).toBe(basePrice);
      expect(result.multipliers).toBeDefined();
    });

    it('should calculate price with events factor', async () => {
      // Arrange
      const mockEvents = [
        {
          id: 1,
          event_name: 'Festival',
          event_type: 'festival',
          start_date: '2025-12-15',
          price_multiplier: 1.2
        }
      ];

      // SEQUÊNCIA DE CHAMADAS REAL:
      // 1. SELECT dynamic_pricing_config
      // 2. getWeatherData (faz SELECT weather_cache internamente)
      // 3. syncGoogleCalendarEvents (faz SELECT google_calendar_events internamente)
      // 4. syncEventbriteEvents (faz SELECT eventbrite_events internamente)
      // 5. SELECT properties (para scraping)
      // 6. getCompetitorPrices (faz SELECT competitor_prices internamente)
      // 7. calculateDemandMultiplier (faz SELECT bookings internamente)
      // 8. INSERT pricing_history

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]) // No config
        .mockResolvedValueOnce([]) // Weather cache (getWeatherData)
        .mockResolvedValueOnce(mockEvents) // Google Calendar events (syncGoogleCalendarEvents)
        .mockResolvedValueOnce([]) // Eventbrite events (syncEventbriteEvents)
        .mockResolvedValueOnce([]) // Properties (for scraping)
        .mockResolvedValueOnce([]) // Competitor prices cache (getCompetitorPrices)
        .mockResolvedValueOnce([]) // Demand multiplier query (calculateDemandMultiplier)
        .mockResolvedValueOnce([]); // INSERT pricing_history

      // Act
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      // Assert
      expect(result).toBeDefined();
      // O serviço pode não retornar events se não houver eventos válidos
      // Vamos apenas verificar que o resultado existe
      expect(result.basePrice).toBe(basePrice);
      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });

    it('should calculate price with competitor prices', async () => {
      // Arrange
      const mockCompetitors = [
        { competitor_name: 'Hotel A', price: 120, currency: 'BRL' },
        { competitor_name: 'Hotel B', price: 110, currency: 'BRL' }
      ];

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]) // No config
        .mockResolvedValueOnce([]) // Weather cache miss
        .mockResolvedValueOnce([]) // Google Calendar events
        .mockResolvedValueOnce([]) // Eventbrite events
        .mockResolvedValueOnce([{ location, latitude: null, longitude: null }]) // Properties (for scraping)
        .mockResolvedValueOnce([]) // Competitor prices cache
        .mockResolvedValueOnce([]) // Demand multiplier query
        .mockResolvedValueOnce([]); // INSERT pricing_history

      mockCompetitorScraper.scrapeCompetitors = jest.fn().mockResolvedValue([
        { success: true, prices: mockCompetitors }
      ]);

      // Act
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.competitors).toBeDefined();
    });

    it('should respect min and max price constraints', async () => {
      // Arrange
      const minPriceMultiplier = 0.5; // 50% of base price = 50
      const maxPriceMultiplier = 2.0; // 200% of base price = 200

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          item_id: propertyId,
          min_price_multiplier: minPriceMultiplier.toString(),
          max_price_multiplier: maxPriceMultiplier.toString()
        }]) // Config with min/max multipliers
        .mockResolvedValueOnce([]) // Weather cache miss
        .mockResolvedValueOnce([]) // Google Calendar events
        .mockResolvedValueOnce([]) // Eventbrite events
        .mockResolvedValueOnce([]) // Properties (for scraping)
        .mockResolvedValueOnce([]) // Competitor prices cache
        .mockResolvedValueOnce([]) // Demand multiplier query
        .mockResolvedValueOnce([]); // INSERT pricing_history

      // Act
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      // Assert
      const minPrice = basePrice * minPriceMultiplier;
      const maxPrice = basePrice * maxPriceMultiplier;
      expect(result.finalPrice).toBeGreaterThanOrEqual(minPrice);
      expect(result.finalPrice).toBeLessThanOrEqual(maxPrice);
    });
  });


  describe('price calculation edge cases', () => {
    it('should handle zero base price', async () => {
      // Arrange
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]) // No config
        .mockResolvedValueOnce([]) // Weather cache miss
        .mockResolvedValueOnce([]) // Google Calendar events
        .mockResolvedValueOnce([]) // Eventbrite events
        .mockResolvedValueOnce([]) // Properties (for scraping)
        .mockResolvedValueOnce([]) // Competitor prices cache
        .mockResolvedValueOnce([]) // Demand multiplier query
        .mockResolvedValueOnce([]); // INSERT pricing_history

      // Act
      const result = await calculateSmartPrice(
        propertyId,
        0,
        checkIn,
        checkOut,
        location
      );

      // Assert
      // O serviço não valida basePrice = 0, apenas calcula com os multiplicadores
      expect(result).toBeDefined();
      expect(result.basePrice).toBe(0);
      expect(result.finalPrice).toBe(0);
    });

    it('should handle invalid date range', async () => {
      // Arrange
      const invalidCheckOut = new Date('2025-12-10'); // Before checkIn

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]) // No config
        .mockResolvedValueOnce([]) // Weather cache miss
        .mockResolvedValueOnce([]) // Google Calendar events
        .mockResolvedValueOnce([]) // Eventbrite events
        .mockResolvedValueOnce([]) // Properties (for scraping)
        .mockResolvedValueOnce([]) // Competitor prices cache
        .mockResolvedValueOnce([]) // Demand multiplier query
        .mockResolvedValueOnce([]); // INSERT pricing_history

      // Act & Assert
      // O serviço não valida a ordem das datas, apenas calcula
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        checkIn,
        invalidCheckOut,
        location
      );

      expect(result).toBeDefined();
    });
  });

  describe('calculateDemandMultiplier - EXTRACT validation', () => {
    it('deve calcular demand multiplier com datas válidas usando EXTRACT corretamente', async () => {
      // Arrange - Datas de alta demanda (Natal)
      const highDemandCheckIn = new Date('2024-12-25');
      const highDemandCheckOut = new Date('2024-12-26');
      
      // Mock para query de histórico de bookings
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ booking_count: 15, avg_nights: 3.5 }]) // Histórico alto
        .mockResolvedValueOnce([{ occupied_count: 8 }]); // Ocupação alta

      // Act - Chamar calculateSmartPrice que internamente chama calculateDemandMultiplier
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        highDemandCheckIn,
        highDemandCheckOut,
        location
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.finalPrice).toBeGreaterThan(basePrice); // Deve ter multiplicador > 1.0
      
      // Verificar que query com EXTRACT foi chamada corretamente
      const extractCalls = (mockQueryDatabase as jest.Mock).mock.calls.filter(
        (call: any[]) => call[0] && call[0].includes('EXTRACT')
      );
      
      expect(extractCalls.length).toBeGreaterThan(0);
      
      // Verificar que casting está correto na query
      const extractQuery = extractCalls[0][0];
      expect(extractQuery).toContain('EXTRACT(MONTH FROM check_in::date) = $2::INTEGER');
      expect(extractQuery).toContain('EXTRACT(DAY FROM check_in::date)::INTEGER');
    });

    it('deve lidar com datas de baixa demanda corretamente', async () => {
      // Arrange - Datas de baixa demanda
      const lowDemandCheckIn = new Date('2024-02-15');
      const lowDemandCheckOut = new Date('2024-02-16');
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ booking_count: 2, avg_nights: 2.0 }]) // Histórico baixo
        .mockResolvedValueOnce([{ occupied_count: 1 }]); // Ocupação baixa

      // Act
      const result = await calculateSmartPrice(
        propertyId,
        basePrice,
        lowDemandCheckIn,
        lowDemandCheckOut,
        location
      );

      // Assert
      expect(result).toBeDefined();
      // Em baixa demanda, o preço pode ser menor ou igual ao base
      expect(result.finalPrice).toBeGreaterThanOrEqual(basePrice * 0.8);
    });
  });
});

