/**
 * ✅ TESTES: API PRICING FORECAST
 * Testes de integração para API de forecast de preços
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/pricing/forecast/route';
import { queryDatabase } from '@/lib/db';
import { cacheService } from '@/lib/cache-service';

jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
}));

const mockCacheService = {
  generateKey: jest.fn((prefix, params) => `cache:${prefix}:${JSON.stringify(params)}`),
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('@/lib/cache-service', () => ({
  cacheService: mockCacheService,
}));

describe('API Pricing Forecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheService.get.mockReturnValue(null);
  });

  describe('GET /api/pricing/forecast', () => {
    it('deve gerar forecast com parâmetros válidos', async () => {
      const mockProperty = {
        id: 1,
        base_price_per_night: 250,
      };

      const mockHistory = [
        { date: '2025-12-01', final_price: 250, occupancy_rate: 0.8, booking_count: 5 },
      ];

      (queryDatabase as jest.Mock)
        .mockResolvedValueOnce([mockProperty])
        .mockResolvedValueOnce(mockHistory)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const url = new URL('http://localhost/api/pricing/forecast');
      url.searchParams.set('property_id', '1');
      url.searchParams.set('start_date', '2025-12-20');
      url.searchParams.set('end_date', '2025-12-30');
      const request = new NextRequest(url.toString());

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.forecast).toBeDefined();
      expect(data.data.summary).toBeDefined();
    });

    it('deve validar property_id obrigatório', async () => {
      const url = new URL('http://localhost/api/pricing/forecast');
      url.searchParams.set('start_date', '2025-12-20');
      url.searchParams.set('end_date', '2025-12-30');
      const request = new NextRequest(url.toString());

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('deve validar datas', async () => {
      const url = new URL('http://localhost/api/pricing/forecast');
      url.searchParams.set('property_id', '1');
      url.searchParams.set('start_date', '2025-12-30');
      url.searchParams.set('end_date', '2025-12-20');
      const request = new NextRequest(url.toString());

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('deve usar cache quando disponível', async () => {
      const cachedData = {
        property_id: 1,
        forecast: [],
        summary: { avg_predicted_price: 250 },
      };

      mockCacheService.get.mockReturnValue(cachedData);

      const url = new URL('http://localhost/api/pricing/forecast');
      url.searchParams.set('property_id', '1');
      url.searchParams.set('start_date', '2025-12-20');
      url.searchParams.set('end_date', '2025-12-30');
      const request = new NextRequest(url.toString());

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cached).toBe(true);
      expect(queryDatabase).not.toHaveBeenCalled();
    });
  });
});

