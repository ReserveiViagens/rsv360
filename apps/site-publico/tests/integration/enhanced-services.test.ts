/**
 * ✅ TESTES DE INTEGRAÇÃO - SERVIÇOS AVANÇADOS
 * 
 * Testes para:
 * - Enhanced Wishlist Voting
 * - Enhanced Split Payment
 * - Enhanced Group Chat
 * - Trip Planning
 * - Integrações (Hospedin, VRBO, Decolar)
 * - Advanced Analytics
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { setupFetchMocks, mockFetch } from '../mocks/api-mocks';

beforeAll(() => {
  setupFetchMocks();
});

describe('Enhanced Services Integration Tests', () => {
  describe('Enhanced Wishlist Voting', () => {
    it('should vote on wishlist item', async () => {
      const { voteOnWishlistItem } = await import('../../lib/enhanced-wishlist-voting');
      
      const result = await voteOnWishlistItem(
        1,
        1,
        'test@example.com',
        'up',
        'Great property!'
      );

      expect(result).toHaveProperty('itemId');
      expect(result).toHaveProperty('votesUp');
      expect(result.votesUp).toBeGreaterThanOrEqual(0);
    });

    it('should get vote result', async () => {
      const { getVoteResult } = await import('../../lib/enhanced-wishlist-voting');
      
      const result = await getVoteResult(1);

      expect(result).toHaveProperty('itemId');
      expect(result).toHaveProperty('totalVotes');
      expect(result).toHaveProperty('consensus');
    });

    it('should get wishlist ranking', async () => {
      const { getWishlistRanking } = await import('../../lib/enhanced-wishlist-voting');
      
      const ranking = await getWishlistRanking(1);

      expect(Array.isArray(ranking)).toBe(true);
      if (ranking.length > 0) {
        expect(ranking[0]).toHaveProperty('ranking');
      }
    });
  });

  describe('Enhanced Split Payment', () => {
    it('should create enhanced split payment', async () => {
      const { createEnhancedSplitPayment } = await import('../../lib/enhanced-split-payment');
      
      const splitPayment = await createEnhancedSplitPayment(
        1,
        1000,
        'equal',
        [
          { email: 'user1@example.com', name: 'User 1' },
          { email: 'user2@example.com', name: 'User 2' },
        ],
        { currency: 'BRL' },
        1
      );

      expect(splitPayment).toHaveProperty('id');
      expect(splitPayment).toHaveProperty('participants');
      expect(splitPayment.participants.length).toBe(2);
    });
  });

  describe('Enhanced Group Chat', () => {
    it('should send enhanced message', async () => {
      const { sendEnhancedMessage } = await import('../../lib/enhanced-group-chat');
      
      const message = await sendEnhancedMessage(
        1,
        1,
        'test@example.com',
        'Hello!',
        { messageType: 'text' }
      );

      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('message');
      expect(message.message).toBe('Hello!');
    });

    it('should add reaction to message', async () => {
      const { addMessageReaction } = await import('../../lib/enhanced-group-chat');
      
      const success = await addMessageReaction(1, 1, 'test@example.com', '👍');

      expect(typeof success).toBe('boolean');
    });

    it('should create poll', async () => {
      const { createGroupChatPoll } = await import('../../lib/enhanced-group-chat');
      
      const poll = await createGroupChatPoll(
        1,
        1,
        'test@example.com',
        'Where should we go?',
        ['Option 1', 'Option 2'],
        false
      );

      expect(poll).toHaveProperty('id');
      expect(poll).toHaveProperty('question');
      expect(poll.options.length).toBe(2);
    });
  });

  describe('Trip Planning', () => {
    it('should create trip plan', async () => {
      const { createTripPlan } = await import('../../lib/trip-planning-service');
      
      const tripPlan = await createTripPlan(
        'Summer Trip',
        'Caldas Novas, GO',
        new Date('2025-07-01'),
        new Date('2025-07-07'),
        1,
        { budget: 5000 }
      );

      expect(tripPlan).toHaveProperty('id');
      expect(tripPlan).toHaveProperty('name');
      expect(tripPlan.name).toBe('Summer Trip');
    });

    it('should add trip task', async () => {
      const { addTripTask } = await import('../../lib/trip-planning-service');
      
      const task = await addTripTask(
        1,
        'Book hotel',
        { priority: 'high', assignedTo: 1 }
      );

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task.title).toBe('Book hotel');
    });
  });

  describe('Integrations', () => {
    it('should authenticate Hospedin', async () => {
      (global.fetch as jest.Mock) = mockFetch({
        access_token: 'test_token',
        refresh_token: 'test_refresh',
      });

      const { authenticateHospedin } = await import('../../lib/hospedin-service');
      
      const result = await authenticateHospedin({
        api_key: 'test_key',
        api_secret: 'test_secret',
      });

      expect(result).toHaveProperty('access_token');
    });

    it('should authenticate VRBO', async () => {
      (global.fetch as jest.Mock) = mockFetch({
        access_token: 'test_token',
        refresh_token: 'test_refresh',
      });

      const { authenticateVRBO } = await import('../../lib/vrbo-service');
      
      const result = await authenticateVRBO({
        api_key: 'test_key',
        api_secret: 'test_secret',
      });

      expect(result).toHaveProperty('access_token');
    });

    it('should authenticate Decolar', async () => {
      (global.fetch as jest.Mock) = mockFetch({
        access_token: 'test_token',
        refresh_token: 'test_refresh',
      });

      const { authenticateDecolar } = await import('../../lib/decolar-service');
      
      const result = await authenticateDecolar({
        api_key: 'test_key',
        api_secret: 'test_secret',
      });

      expect(result).toHaveProperty('access_token');
    });
  });

  describe('Advanced Analytics', () => {
    it('should generate revenue forecast', async () => {
      const { generateRevenueForecast } = await import('../../lib/advanced-analytics-service');
      
      const forecast = await generateRevenueForecast(
        1,
        new Date('2025-07-01'),
        new Date('2025-07-31'),
        { includeScenarios: true }
      );

      expect(Array.isArray(forecast)).toBe(true);
      if (forecast.length > 0) {
        expect(forecast[0]).toHaveProperty('forecasted_revenue');
        expect(forecast[0]).toHaveProperty('scenarios');
      }
    });

    it('should generate demand heatmap', async () => {
      const { generateDemandHeatmap } = await import('../../lib/advanced-analytics-service');
      
      const heatmap = await generateDemandHeatmap(
        1,
        new Date('2025-07-01'),
        new Date('2025-07-31')
      );

      expect(Array.isArray(heatmap)).toBe(true);
      if (heatmap.length > 0) {
        expect(heatmap[0]).toHaveProperty('demand_score');
        expect(heatmap[0]).toHaveProperty('demand_level');
      }
    });

    it('should generate competitor benchmark', async () => {
      const { generateCompetitorBenchmark } = await import('../../lib/advanced-analytics-service');
      
      const benchmark = await generateCompetitorBenchmark(1, [
        { id: 1, name: 'Competitor 1', type: 'hotel', location: 'Caldas Novas' },
        { id: 2, name: 'Competitor 2', type: 'hotel', location: 'Caldas Novas' },
      ]);

      expect(Array.isArray(benchmark)).toBe(true);
      if (benchmark.length > 0) {
        expect(benchmark[0]).toHaveProperty('competitor_name');
        expect(benchmark[0]).toHaveProperty('metrics');
        expect(benchmark[0]).toHaveProperty('comparison');
      }
    });
  });
});

