/**
 * ✅ TESTES: API QUALITY LEADERBOARD
 * Testes de integração para API de leaderboard
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/quality/leaderboard/route';
import { queryDatabase } from '@/lib/db';
import { cacheService } from '@/lib/cache-service';

jest.mock('@/lib/db');
jest.mock('@/lib/top-host-service', () => ({
  getTopHosts: jest.fn(),
}));
const mockCacheService = {
  generateKey: jest.fn((prefix, params) => `cache:${prefix}:${JSON.stringify(params)}`),
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('@/lib/cache-service', () => ({
  cacheService: mockCacheService,
}));
jest.mock('@/lib/api-auth', () => ({
  optionalAuth: async () => ({ user: { id: 1 } }),
}));

describe('API Quality Leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheService.get.mockReturnValue(null);
  });

  describe('GET /api/quality/leaderboard', () => {
    it('deve retornar leaderboard com dados válidos', async () => {
      const { getTopHosts } = require('@/lib/top-host-service');
      const mockLeaderboard = [
        {
          host_id: 1,
          host_name: 'João Silva',
          score: 95.5,
          level: 'superhost',
        },
      ];

      getTopHosts.mockResolvedValueOnce(mockLeaderboard);
      (queryDatabase as jest.Mock).mockResolvedValueOnce([
        { total_bookings: 150, avg_rating: 4.8, total_reviews: 120, total_revenue: 45000 },
      ]);

      const request = new NextRequest('http://localhost/api/quality/leaderboard?limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.leaderboard).toBeDefined();
    });

    it('deve usar cache quando disponível', async () => {
      const cachedData = {
        leaderboard: [],
        total_hosts: 0,
        generated_at: new Date().toISOString(),
      };

      mockCacheService.get.mockReturnValue(cachedData);

      const request = new NextRequest('http://localhost/api/quality/leaderboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cached).toBe(true);
    });

    it('deve validar parâmetros inválidos', async () => {
      const request = new NextRequest('http://localhost/api/quality/leaderboard?limit=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});

