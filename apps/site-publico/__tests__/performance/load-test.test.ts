/**
 * ✅ FASE 5 - ETAPA 5.2: Testes de Performance - Carga de Dados
 * Testa performance sob carga: múltiplas requisições simultâneas
 * 
 * @module __tests__/performance/load-test.test
 */

import VoteService from '@/lib/group-travel/vote-service';
import WishlistService from '@/lib/group-travel/wishlist-service';
import SplitPaymentService from '@/lib/group-travel/split-payment-service';
import { queryDatabase, getDbPool } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockGetDbPool = getDbPool as jest.MockedFunction<typeof getDbPool>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Load Tests - Data Load', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn().mockResolvedValue(null);
    mockRedisCache.set = jest.fn();
  });

  it('should handle 100 concurrent votes', async () => {
    // Arrange
    const itemId = 'item-123';
    const users = Array.from({ length: 100 }, (_, i) => `user-${i + 1}`);

    // Mock getDbPool para VoteService usar transações
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    
    mockGetDbPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(mockClient)
    } as any);
    
    // Mock client.query para transações
    mockClient.query
      .mockImplementation((query: string, params: any[]) => {
        if (query === 'BEGIN') {
          return Promise.resolve({ rows: [] });
        }
        if (query === 'COMMIT') {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT') && query.includes('wishlist_items')) {
          return Promise.resolve({ rows: [{ id: itemId, wishlist_id: 'wishlist-123' }] });
        }
        if (query.includes('SELECT') && query.includes('wishlist_votes')) {
          return Promise.resolve({ rows: [] }); // No existing vote
        }
        if (query.includes('INSERT') && query.includes('wishlist_votes')) {
          return Promise.resolve({
            rows: [{
              id: `vote-${params[1]}`,
              item_id: itemId,
              user_id: params[1],
              vote_type: 'up',
              created_at: new Date()
            }]
          });
        }
        if (query.includes('UPDATE') && query.includes('wishlist_items')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });
    
    mockClient.release.mockResolvedValue(undefined);
    mockRedisCache.get = jest.fn().mockResolvedValue(null); // No rate limit

    // Act
    const startTime = Date.now();
    const promises = users.map(userId =>
      VoteService.vote(userId, {
        itemId,
        voteType: 'upvote'
      })
    );
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(10000); // Should complete in less than 10 seconds (ajustado para transações)
    // Cada voto faz: BEGIN, SELECT item, SELECT vote, INSERT vote, UPDATE item, COMMIT = 6 queries
    expect(mockClient.query).toHaveBeenCalledTimes(600); // 100 votes * 6 queries each
  });

  it('should handle 50 concurrent wishlist creations', async () => {
    // Arrange
    const users = Array.from({ length: 50 }, (_, i) => `user-${i + 1}`);

      (mockQueryDatabase as jest.Mock)
      .mockImplementation((query: string, params: any[]) => {
        if (query.includes('INSERT')) {
          return Promise.resolve([{
            id: `wishlist-${params[0]}`,
            name: params[0],
            owner_id: params[1],
            created_at: new Date()
          }]);
        }
        return Promise.resolve([]);
      });

    // Act
    const startTime = Date.now();
    const promises = users.map((userId, index) =>
      WishlistService.createWishlist(userId, {
        name: `Wishlist ${index + 1}`,
        privacy: 'private'
      })
    );
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(results).toHaveLength(50);
    expect(duration).toBeLessThan(3000); // Should complete in less than 3 seconds
  });

  it('should handle 30 concurrent split payment creations', async () => {
    // Arrange
    const bookings = Array.from({ length: 30 }, (_, i) => ({
      bookingId: `booking-${i + 1}`,
      userId: `user-${i + 1}`,
      totalAmount: 300
    }));

      (mockQueryDatabase as jest.Mock)
      .mockImplementation((query: string, params: any[]) => {
        if (query.includes('SELECT') && query.includes('bookings')) {
          return Promise.resolve([{ id: params[0], total_amount: 300 }]);
        }
        if (query.includes('INSERT')) {
          return Promise.resolve([{
            id: `split-payment-${params[0]}`,
            booking_id: params[0],
            status: 'pending',
            splits: [
              { id: 'split-1', amount: 100 },
              { id: 'split-2', amount: 100 },
              { id: 'split-3', amount: 100 }
            ]
          }]);
        }
        return Promise.resolve([]);
      });

    // Act
    const startTime = Date.now();
    const promises = bookings.map(booking =>
      SplitPaymentService.createSplitPayment(booking.bookingId, {
        splits: [
          { userId: 'user-1', amount: 100 },
          { userId: 'user-2', amount: 100 },
          { userId: 'user-3', amount: 100 }
        ],
        currency: 'BRL'
      })
    );
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(results).toHaveLength(30);
    expect(duration).toBeLessThan(4000); // Should complete in less than 4 seconds
  });

  it('should handle cache hit performance', async () => {
    // Arrange
    const itemId = 'item-123';
    const cachedVotes = [
      { id: 'vote-1', user_id: 'user-1', type: 'up' },
      { id: 'vote-2', user_id: 'user-2', type: 'up' }
    ];

    mockRedisCache.get = jest.fn().mockResolvedValue(JSON.stringify(cachedVotes));

    // Act
    const startTime = Date.now();
    const results = await Promise.all([
      VoteService.getItemVotes(itemId),
      VoteService.getItemVotes(itemId),
      VoteService.getItemVotes(itemId),
      VoteService.getItemVotes(itemId),
      VoteService.getItemVotes(itemId)
    ]);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(results).toHaveLength(5);
    expect(duration).toBeLessThan(100); // Cache hits should be very fast
    expect(mockQueryDatabase).not.toHaveBeenCalled(); // Should use cache
  });
});

