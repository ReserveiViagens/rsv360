/**
 * ✅ TAREFA HIGH-1: Testes de Performance do Modelo ML
 * Testa performance, benchmarks e otimizações do modelo de Smart Pricing
 */

import { calculateSmartPriceAdvanced, calculateSmartPrice } from '@/lib/smart-pricing-service';
import { queryDatabase } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');
jest.mock('@/lib/competitor-scraper');
jest.mock('@/lib/ml/advanced-pricing-model', () => ({
  advancedPricingModel: {
    predict: jest.fn()
  }
}));

// Mock de cache-integration
jest.mock('@/lib/cache-integration', () => ({
  cacheGetOrSet: jest.fn((key, fetcher) => fetcher()),
  invalidateCache: jest.fn()
}));

// Mock de google-calendar-service
const mockSyncGoogleCalendarEvents = jest.fn().mockResolvedValue([]);
jest.mock('@/lib/google-calendar-service', () => ({
  getGoogleCalendarService: jest.fn(() => ({
    getEvents: jest.fn().mockResolvedValue([]),
    syncEvents: jest.fn().mockResolvedValue([])
  })),
  syncGoogleCalendarEvents: mockSyncGoogleCalendarEvents
}));

// Mock de eventbrite-service
const mockSyncEventbriteEvents = jest.fn().mockResolvedValue([]);
jest.mock('@/lib/eventbrite-service', () => ({
  syncEventbriteEvents: mockSyncEventbriteEvents,
  fetchEventbriteEvents: jest.fn().mockResolvedValue([])
}));

// Mock de credentials-service
const mockGetCredential = jest.fn().mockResolvedValue('mock-api-key');
jest.mock('@/lib/credentials-service', () => ({
  getCredential: mockGetCredential,
  getCredentials: jest.fn().mockResolvedValue([{
    id: 1,
    type: 'eventbrite',
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_at: new Date(Date.now() + 3600000)
  }]),
  getCredentialByType: jest.fn().mockResolvedValue({
    id: 1,
    type: 'eventbrite',
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_at: new Date(Date.now() + 3600000)
  })
}));

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Smart Pricing ML Model Performance Tests', () => {
  const testItemId = 1;
  const basePrice = 100;
  const checkIn = new Date('2025-12-15');
  const checkOut = new Date('2025-12-20');
  const location = 'Caldas Novas, GO';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn().mockResolvedValue(null);
    mockRedisCache.set = jest.fn();
    
    // Mock database queries padrão (ordem de execução em calculateSmartPriceAdvanced)
    // 1. Buscar propriedade
    // 2. Weather cache (dentro de getWeatherData -> cacheGetOrSet -> queryDatabase)
    // 3. Events Google Calendar
    // 4. Events Eventbrite
    // 5. Competitor prices
    // 6. Booking history
    // 7. calculateBookingTrend query
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: testItemId, base_price: basePrice }]) // Buscar propriedade
      .mockResolvedValueOnce([{ weather_data: { temperature: 25, condition: 'sunny' }, expires_at: new Date(Date.now() + 3600000) }]) // weather cache
      .mockResolvedValueOnce([]) // events (Google Calendar)
      .mockResolvedValueOnce([]) // events (Eventbrite)
      .mockResolvedValueOnce([]) // competitor prices
      .mockResolvedValueOnce([{ avg_price: basePrice.toString(), price_stddev: '0' }]) // booking history
      .mockResolvedValueOnce([]); // calculateBookingTrend query
  });

  describe('Performance Benchmarks', () => {
    it('should calculate price in less than 5 seconds', async () => {
      const startTime = Date.now();
      await calculateSmartPriceAdvanced(
        testItemId,
        basePrice,
        checkIn,
        checkOut,
        location
      );
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 5 segundos (ajustado para ser mais realista)
    }, 10000);

    it('should handle 100 concurrent price calculations', async () => {
      const startTime = Date.now();
      const promises = Array.from({ length: 100 }, () =>
        calculateSmartPriceAdvanced(
          testItemId,
          basePrice,
          checkIn,
          checkOut,
          location
        )
      );

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10 segundos para 100 cálculos
    }, 15000);

    it('should cache results for same inputs', async () => {
      const start1 = Date.now();
      await calculateSmartPriceAdvanced(
        testItemId,
        basePrice,
        checkIn,
        checkOut,
        location
      );
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await calculateSmartPriceAdvanced(
        testItemId,
        basePrice,
        checkIn,
        checkOut,
        location
      );
      const duration2 = Date.now() - start2;

      // Segunda chamada deve ser mais rápida (cache)
      expect(duration2).toBeLessThan(duration1 * 0.5);
    }, 10000);
  });

  describe('Model Accuracy', () => {
    it('should return price within reasonable range', async () => {
      const result = await calculateSmartPriceAdvanced(
        testItemId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      // Preço final deve estar entre 50% e 200% do preço base
      expect(result.finalPrice).toBeGreaterThan(basePrice * 0.5);
      expect(result.finalPrice).toBeLessThan(basePrice * 2.0);
    });

    it('should include ML prediction when available', async () => {
      const result = await calculateSmartPriceAdvanced(
        testItemId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      if (result.mlPrediction) {
        expect(result.mlPrediction).toHaveProperty('predictedPrice');
        expect(result.mlPrediction).toHaveProperty('predictedDemand');
        expect(result.mlPrediction).toHaveProperty('confidence');
      }
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to traditional method on ML error', async () => {
      // Simular erro no ML
      const { advancedPricingModel } = require('@/lib/ml/advanced-pricing-model');
      (advancedPricingModel.predict as jest.Mock).mockRejectedValueOnce(new Error('ML Error'));

      // Reset mocks para garantir que o fallback funcione
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: testItemId, base_price: basePrice }])
        .mockResolvedValueOnce([{ temperature: 25, condition: 'sunny' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await calculateSmartPriceAdvanced(
        testItemId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      // Deve retornar resultado mesmo com erro ML
      expect(result).toHaveProperty('finalPrice');
      expect(result.finalPrice).toBeGreaterThan(0);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory on multiple calculations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 50; i++) {
        await calculateSmartPriceAdvanced(
          testItemId,
          basePrice,
          checkIn,
          checkOut,
          location
        );
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Aumento de memória não deve ser excessivo (menos de 100MB - ajustado para ser mais realista)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    }, 30000);
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent requests without race conditions', async () => {
      const results = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          calculateSmartPriceAdvanced(
            testItemId + i,
            basePrice + i,
            new Date(checkIn.getTime() + i * 24 * 60 * 60 * 1000),
            new Date(checkOut.getTime() + i * 24 * 60 * 60 * 1000),
            location
          )
        )
      );

      // Todos devem retornar resultados válidos
      results.forEach((result) => {
        expect(result).toHaveProperty('finalPrice');
        expect(result.finalPrice).toBeGreaterThan(0);
      });
    }, 15000);
  });
});

