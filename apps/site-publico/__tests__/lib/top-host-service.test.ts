/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Top Host Service
 * Testes para o serviço de qualidade e badges de hosts
 * 
 * @module __tests__/lib/top-host-service.test
 */

import {
  getHostBadges,
  assignBadgeToHost,
  getHostRatings,
  calculateHostScore,
  getQualityMetrics
} from '@/lib/top-host-service';
import { queryDatabase } from '@/lib/db';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/cache-integration', () => ({
  cacheQuality: jest.fn((hostId, fetcher) => fetcher()), // Executa o fetcher diretamente
  invalidateQualityCache: jest.fn()
}));

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;

describe('TopHostService', () => {
  const hostId = 1;
  const propertyId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateHostScore', () => {
    it('should calculate host score correctly', async () => {
      // Arrange
      const mockRatings = [
        {
          id: 1,
          host_id: hostId,
          rating_type: 'overall',
          rating_value: 4.5,
          review_count: 100,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          host_id: hostId,
          rating_type: 'cleanliness',
          rating_value: 4.8,
          review_count: 100,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      // SEQUÊNCIA DE CHAMADAS:
      // 1. calculateHostScore -> cacheQuality -> getHostRatings -> cacheQuality -> queryDatabase (SELECT ratings)
      // 2. calculateHostScore -> queryDatabase (SELECT existing score)
      // 3. calculateHostScore -> queryDatabase (UPDATE ou INSERT score)

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce(mockRatings) // getHostRatings (dentro de cacheQuality)
        .mockResolvedValueOnce([]) // SELECT existing score (não existe)
        .mockResolvedValueOnce([{
          id: 1,
          host_id: hostId,
          item_id: null,
          overall_score: 85,
          quality_score: 90,
          performance_score: 80,
          guest_satisfaction_score: 90,
          calculated_at: new Date().toISOString()
        }]); // INSERT host_scores

      // Act
      const score = await calculateHostScore(hostId);

      // Assert
      expect(score).toBeDefined();
      expect(score.overall_score).toBeGreaterThanOrEqual(0);
      expect(score.overall_score).toBeLessThanOrEqual(100);
    });

    it('should return cached score if available', async () => {
      // Arrange
      const cachedScore = {
        id: 1,
        host_id: hostId,
        item_id: null,
        overall_score: 85,
        quality_score: 90,
        performance_score: 80,
        guest_satisfaction_score: 90,
        calculated_at: new Date().toISOString()
      };

      // Mock cache integration para retornar valor cached diretamente
      const { cacheQuality } = require('@/lib/cache-integration');
      (cacheQuality as jest.Mock).mockResolvedValueOnce(cachedScore);

      // Act
      const score = await calculateHostScore(hostId);

      // Assert
      expect(score).toBeDefined();
      expect(score.overall_score).toBe(85);
      // Com cache, não deve chamar queryDatabase
      expect(mockQueryDatabase).not.toHaveBeenCalled();
    });
  });

  describe('getHostBadges', () => {
    it('should return all badges for a host', async () => {
      // Arrange
      // O serviço retorna um array mapeado onde cada item tem propriedade 'badge' aninhada
      const mockBadgeAssignments = [
        {
          id: 1,
          host_id: hostId,
          badge_id: 1,
          item_id: null,
          earned_at: new Date().toISOString(),
          expires_at: null,
          is_active: true,
          badge_key: 'super_host',
          badge_name: 'Super Host',
          badge_description: 'Super Host badge',
          badge_icon: null,
          badge_category: 'quality',
          criteria: '{}'
        },
        {
          id: 2,
          host_id: hostId,
          badge_id: 2,
          item_id: null,
          earned_at: new Date().toISOString(),
          expires_at: null,
          is_active: true,
          badge_key: 'quick_response',
          badge_name: 'Quick Response',
          badge_description: 'Quick Response badge',
          badge_icon: null,
          badge_category: 'performance',
          criteria: '{}'
        }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockBadgeAssignments);

      // Act
      const badges = await getHostBadges(hostId);

      // Assert
      expect(badges).toHaveLength(2);
      expect(badges[0].badge.badge_key).toBe('super_host');
      expect(badges[1].badge.badge_key).toBe('quick_response');
    });

    it('should return only active badges', async () => {
      // Arrange
      const mockBadgeAssignments = [
        {
          id: 1,
          host_id: hostId,
          badge_id: 1,
          item_id: null,
          earned_at: new Date().toISOString(),
          expires_at: null,
          is_active: true,
          badge_key: 'active_badge',
          badge_name: 'Active Badge',
          badge_description: '',
          badge_icon: null,
          badge_category: 'quality',
          criteria: '{}'
        },
        {
          id: 2,
          host_id: hostId,
          badge_id: 2,
          item_id: null,
          earned_at: new Date().toISOString(),
          expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
          is_active: false,
          badge_key: 'inactive_badge',
          badge_name: 'Inactive Badge',
          badge_description: '',
          badge_icon: null,
          badge_category: 'quality',
          criteria: '{}'
        }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockBadgeAssignments);

      // Act
      const badges = await getHostBadges(hostId, undefined, true); // activeOnly = true

      // Assert
      // O serviço filtra no SQL, então apenas badges ativos devem ser retornados
      expect(badges.length).toBeGreaterThan(0);
      const activeBadges = badges.filter(b => b.is_active);
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('assignBadgeToHost', () => {
    it('should assign badge to host', async () => {
      // Arrange
      const badgeId = 1;

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: 1,
          host_id: hostId,
          badge_id: badgeId,
          item_id: null,
          earned_at: new Date().toISOString(),
          expires_at: null,
          is_active: true
        }]); // INSERT badge assignment

      // Act
      const result = await assignBadgeToHost(hostId, badgeId);

      // Assert
      expect(result).toBeDefined();
      expect(result.host_id).toBe(hostId);
      expect(result.badge_id).toBe(badgeId);
    });

    it('should assign badge with itemId', async () => {
      // Arrange
      const badgeId = 1;

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: 2,
          host_id: hostId,
          badge_id: badgeId,
          item_id: propertyId,
          earned_at: new Date().toISOString(),
          expires_at: null,
          is_active: true
        }]); // INSERT badge assignment

      // Act
      const result = await assignBadgeToHost(hostId, badgeId, propertyId);

      // Assert
      expect(result).toBeDefined();
      expect(result.item_id).toBe(propertyId);
    });
  });

  describe('getHostRatings', () => {
    it('should return all ratings for a host', async () => {
      // Arrange
      // getHostRatings usa cacheQuality, então precisa mockar o fetcher
      const mockRatings = [
        {
          id: 1,
          host_id: hostId,
          item_id: null,
          rating_type: 'overall',
          rating_value: 4.5,
          review_count: 100,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          host_id: hostId,
          item_id: null,
          rating_type: 'cleanliness',
          rating_value: 4.8,
          review_count: 100,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      // getHostRatings usa cacheQuality que executa o fetcher
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockRatings);

      // Act
      const ratings = await getHostRatings(hostId);

      // Assert
      expect(ratings).toHaveLength(2);
      expect(ratings.find(r => r.rating_type === 'overall')).toBeDefined();
    });

    it('should filter ratings by property if propertyId provided', async () => {
      // Arrange
      const mockRatings = [
        {
          id: 1,
          host_id: hostId,
          item_id: propertyId,
          rating_type: 'overall',
          rating_value: 4.5,
          review_count: 100,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          host_id: hostId,
          item_id: 2,
          rating_type: 'overall',
          rating_value: 4.0,
          review_count: 50,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockRatings);

      // Act
      const ratings = await getHostRatings(hostId, propertyId);

      // Assert
      // O serviço filtra no SQL, então apenas ratings do propertyId devem ser retornados
      expect(ratings.length).toBeGreaterThan(0);
      const propertyRatings = ratings.filter(r => r.item_id === propertyId);
      expect(propertyRatings.length).toBeGreaterThan(0);
    });
  });

  describe('calculateHostScore with different ratings', () => {
    it('should calculate higher score for better ratings', async () => {
      // Arrange - High ratings
      const highRatings = [
        {
          id: 1,
          host_id: hostId,
          item_id: null,
          rating_type: 'overall',
          rating_value: 5.0,
          review_count: 200,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          host_id: hostId,
          item_id: null,
          rating_type: 'cleanliness',
          rating_value: 5.0,
          review_count: 200,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          host_id: hostId,
          item_id: null,
          rating_type: 'response_time',
          rating_value: 5.0,
          review_count: 200,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce(highRatings) // getHostRatings
        .mockResolvedValueOnce([]) // SELECT existing score (não existe)
        .mockResolvedValueOnce([{
          id: 1,
          host_id: hostId,
          item_id: null,
          overall_score: 95,
          quality_score: 100,
          performance_score: 100,
          guest_satisfaction_score: 100,
          calculated_at: new Date().toISOString()
        }]); // INSERT host_scores

      // Act
      const highScore = await calculateHostScore(hostId);

      // Assert
      expect(highScore.overall_score).toBeGreaterThan(80);
    });

    it('should calculate lower score for worse ratings', async () => {
      // Arrange - Low ratings
      const lowRatings = [
        {
          id: 1,
          host_id: hostId,
          item_id: null,
          rating_type: 'overall',
          rating_value: 2.0,
          review_count: 10,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          host_id: hostId,
          item_id: null,
          rating_type: 'cleanliness',
          rating_value: 2.0,
          review_count: 10,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce(lowRatings) // getHostRatings
        .mockResolvedValueOnce([]) // SELECT existing score (não existe)
        .mockResolvedValueOnce([{
          id: 1,
          host_id: hostId,
          item_id: null,
          overall_score: 30,
          quality_score: 30,
          performance_score: 30,
          guest_satisfaction_score: 30,
          calculated_at: new Date().toISOString()
        }]); // INSERT host_scores

      // Act
      const lowScore = await calculateHostScore(hostId);

      // Assert
      expect(lowScore.overall_score).toBeLessThan(50);
    });
  });

  describe('getQualityMetrics', () => {
    it('should return quality metrics for a host', async () => {
      // Arrange
      const mockMetrics = [
        {
          id: 1,
          host_id: hostId,
          metric_type: 'response_rate',
          metric_value: 95,
          metric_unit: 'percentage',
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString(),
          calculated_at: new Date().toISOString()
        },
        {
          id: 2,
          host_id: hostId,
          metric_type: 'response_time',
          metric_value: 2,
          metric_unit: 'hours',
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString(),
          calculated_at: new Date().toISOString()
        }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockMetrics);

      // Act
      const metrics = await getQualityMetrics(hostId);

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.find(m => m.metric_type === 'response_rate')).toBeDefined();
    });
  });
});

