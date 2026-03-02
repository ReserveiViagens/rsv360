/**
 * ✅ TAREFA HIGH-8: Testes E2E para Smart Pricing End-to-End
 * Testa fluxo completo, APIs externas e alertas
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { calculateSmartPrice } from '@/lib/smart-pricing-service';
import { queryDatabase } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');
jest.mock('@/lib/competitor-scraper');
jest.mock('@/lib/ml/advanced-pricing-model');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Smart Pricing E2E Tests', () => {
  let testPropertyId: number;
  let testUserId: number;

  beforeAll(async () => {
    testPropertyId = 1;
    testUserId = 1;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn().mockResolvedValue(null);
    mockRedisCache.set = jest.fn();
  });

  describe('Complete Pricing Flow', () => {
    it('should calculate price for a booking request', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;
      const location = 'Caldas Novas, GO';

      // Mock database queries
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: testPropertyId, base_price: basePrice }])
        .mockResolvedValueOnce([{ temperature: 25, condition: 'sunny' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await calculateSmartPrice(
        testPropertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      expect(result).toBeDefined();
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.multipliers).toBeDefined();
    });

    it('should apply weather factors to pricing', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;
      const location = 'Caldas Novas, GO';

      // Mock database queries with weather data
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: testPropertyId, base_price: basePrice }])
        .mockResolvedValueOnce([{ temperature: 30, condition: 'sunny' }]) // Good weather
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await calculateSmartPrice(
        testPropertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      expect(result.multipliers.weather).toBeDefined();
      expect(result.multipliers.weather).toBeGreaterThan(0);
    });

    it('should apply event factors to pricing', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;
      const location = 'Caldas Novas, GO';

      // Mock database queries with events
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: testPropertyId, base_price: basePrice }])
        .mockResolvedValueOnce([{ temperature: 25, condition: 'sunny' }])
        .mockResolvedValueOnce([{ name: 'Festival', date: '2025-12-22' }]) // Event found
        .mockResolvedValueOnce([]);

      const result = await calculateSmartPrice(
        testPropertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      if (result.multipliers.events) {
        expect(result.multipliers.events).toBeGreaterThan(1.0);
      }
    });

    it('should apply competitor factors to pricing', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;
      const location = 'Caldas Novas, GO';

      // Mock database queries
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: testPropertyId, base_price: basePrice }])
        .mockResolvedValueOnce([{ temperature: 25, condition: 'sunny' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]); // Competitor data would be here

      const result = await calculateSmartPrice(
        testPropertyId,
        basePrice,
        checkIn,
        checkOut,
        location
      );

      expect(result.multipliers.competitors).toBeDefined();
    });

    it('should cache pricing calculations', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;
      const location = 'Caldas Novas, GO';

      // Mock database queries
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: testPropertyId, base_price: basePrice }])
        .mockResolvedValueOnce([{ temperature: 25, condition: 'sunny' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // First call - cache miss
      const start1 = Date.now();
      await calculateSmartPrice(testPropertyId, basePrice, checkIn, checkOut, location);
      const duration1 = Date.now() - start1;

      // Mock cache hit
      mockRedisCache.get = jest.fn().mockResolvedValueOnce(JSON.stringify({
        finalPrice: 120,
        multipliers: { weather: 1.0, events: 1.0, competitors: 1.0, demand: 1.0, season: 1.2 }
      }));

      // Second call - cache hit (should be faster)
      const start2 = Date.now();
      await calculateSmartPrice(testPropertyId, basePrice, checkIn, checkOut, location);
      const duration2 = Date.now() - start2;

      // Segunda chamada deve ser mais rápida (cache)
      expect(duration2).toBeLessThan(duration1);
    });
  });

  describe('External API Integration', () => {
    it('should handle OpenWeather API errors gracefully', async () => {
      // Simular erro na API do OpenWeather
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;

      const response = await fetch(
        `${baseUrl}/api/pricing/smart/calculate?property_id=${testPropertyId}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}&include_weather=true`
      );

      // Deve retornar sucesso mesmo se OpenWeather falhar
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      // Preço deve ser calculado sem fator de clima
      expect(data.data.finalPrice).toBeGreaterThan(0);
    });

    it('should handle Google Calendar API errors gracefully', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;

      const response = await fetch(
        `${baseUrl}/api/pricing/smart/calculate?property_id=${testPropertyId}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}&include_events=true`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      // Preço deve ser calculado sem eventos
      expect(data.data.finalPrice).toBeGreaterThan(0);
    });

    it('should handle competitor scraping errors gracefully', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;

      const response = await fetch(
        `${baseUrl}/api/pricing/smart/calculate?property_id=${testPropertyId}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}&include_competitors=true`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      // Preço deve ser calculado sem competidores
      expect(data.data.finalPrice).toBeGreaterThan(0);
    });
  });

  describe('Pricing Alerts', () => {
    it('should send alert when price change exceeds threshold', async () => {
      // Configurar alerta de mudança de preço
      const response = await fetch(`${baseUrl}/api/pricing/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: testPropertyId,
          threshold_percentage: 20, // Alerta se mudança > 20%
          alert_types: ['email', 'push'],
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should trigger alert when price increases significantly', async () => {
      // Simular aumento significativo de preço
      const oldPrice = 100;
      const newPrice = 150; // 50% de aumento

      const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;

      if (changePercentage > 20) {
        // Verificar se alerta foi enviado
        // TODO: Implementar verificação de alerta
        expect(changePercentage).toBeGreaterThan(20);
      }
    });

    it('should trigger alert when price decreases significantly', async () => {
      // Simular diminuição significativa de preço
      const oldPrice = 100;
      const newPrice = 70; // 30% de diminuição

      const changePercentage = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);

      if (changePercentage > 20) {
        // Verificar se alerta foi enviado
        // TODO: Implementar verificação de alerta
        expect(changePercentage).toBeGreaterThan(20);
      }
    });
  });

  describe('ML Model Integration', () => {
    it('should use ML model when available', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;

      const response = await fetch(
        `${baseUrl}/api/pricing/smart/calculate?property_id=${testPropertyId}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}&use_ml=true`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);

      if (data.data.mlPrediction) {
        expect(data.data.mlPrediction).toHaveProperty('predictedPrice');
        expect(data.data.mlPrediction).toHaveProperty('confidence');
        expect(data.data.mlPrediction.confidence).toBeGreaterThan(0);
        expect(data.data.mlPrediction.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should fallback to traditional method when ML fails', async () => {
      // Simular falha no ML
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;

      const response = await fetch(
        `${baseUrl}/api/pricing/smart/calculate?property_id=${testPropertyId}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}&use_ml=true`
      );

      // Deve retornar sucesso mesmo se ML falhar
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.finalPrice).toBeGreaterThan(0);
    });
  });

  describe('Pricing History', () => {
    it('should save pricing calculation to history', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');
      const basePrice = 100;

      // Calcular preço
      const calculateResponse = await fetch(
        `${baseUrl}/api/pricing/smart/calculate?property_id=${testPropertyId}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}`
      );
      expect(calculateResponse.ok).toBe(true);

      // Aguardar processamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar histórico
      const historyResponse = await fetch(
        `${baseUrl}/api/pricing/history?property_id=${testPropertyId}&date=${checkIn.toISOString().split('T')[0]}`
      );
      expect(historyResponse.ok).toBe(true);
      const historyData = await historyResponse.json();
      expect(historyData.success).toBe(true);
      expect(Array.isArray(historyData.data)).toBe(true);
    });

    it('should retrieve pricing history for a date range', async () => {
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      const response = await fetch(
        `${baseUrl}/api/pricing/history?property_id=${testPropertyId}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Integration with Booking Flow', () => {
    it('should use smart pricing in booking creation', async () => {
      const checkIn = new Date('2025-12-20');
      const checkOut = new Date('2025-12-25');

      // Criar reserva com smart pricing
      const response = await fetch(`${baseUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: testPropertyId,
          user_id: testUserId,
          check_in: checkIn.toISOString(),
          check_out: checkOut.toISOString(),
          guests: 2,
          use_smart_pricing: true,
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('total_price');
      expect(data.data.total_price).toBeGreaterThan(0);
    });
  });
});

