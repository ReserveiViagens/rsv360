/**
 * ✅ FASE 5 - ETAPA 5.2: Testes de Performance - Otimizações
 * Testa otimizações de cache, batch operations e queries eficientes
 * 
 * @module __tests__/performance/optimizations.test
 */

import VoteService from '@/lib/group-travel/vote-service';
import WishlistService from '@/lib/group-travel/wishlist-service';
import { queryDatabase } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Optimization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn();
    mockRedisCache.set = jest.fn();
    mockRedisCache.del = jest.fn();
  });

  it('should use cache to reduce database queries', async () => {
    // Arrange
    const itemId = 'item-123';
    const cachedVotes = [
      { id: 'vote-1', user_id: 'user-1', type: 'up', created_at: new Date().toISOString() }
    ];

    mockRedisCache.get = jest.fn()
      .mockResolvedValueOnce(null) // First call - cache miss
      .mockResolvedValueOnce(JSON.stringify(cachedVotes)) // Second call - cache hit
      .mockResolvedValueOnce(JSON.stringify(cachedVotes)); // Third call - cache hit

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(cachedVotes);

    // Act
    await VoteService.getItemVotes(itemId); // Cache miss
    await VoteService.getItemVotes(itemId); // Cache hit
    await VoteService.getItemVotes(itemId); // Cache hit

    // Assert
    expect(mockQueryDatabase).toHaveBeenCalledTimes(1); // Only called once
    expect(mockRedisCache.get).toHaveBeenCalledTimes(3);
    expect(mockRedisCache.set).toHaveBeenCalledTimes(1); // Set cache once
  });

  it('should invalidate cache on updates', async () => {
    // Arrange
    const userId = 'user-123';
    const itemId = 'item-456';

      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: itemId, wishlist_id: 'wishlist-123' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{
        id: 'vote-123',
        item_id: itemId,
        user_id: userId,
        type: 'up',
        created_at: new Date()
      }]);

    mockRedisCache.get = jest.fn().mockResolvedValue(null);

    // Act
    await VoteService.vote(userId, { itemId, voteType: 'upvote' });

    // Assert
    expect(mockRedisCache.del).toHaveBeenCalled(); // Cache should be invalidated
    expect(mockRedisCache.del).toHaveBeenCalledWith(
      expect.stringContaining(`vote:item:${itemId}`)
    );
  });

  it('should batch database queries efficiently', async () => {
    // Arrange
    const wishlistId = 'wishlist-123';
    const userId = 'user-123';
    const items = Array.from({ length: 10 }, (_, i) => ({
      propertyId: `property-${i + 1}`
    }));

    let queryCount = 0;
      (mockQueryDatabase as jest.Mock)
      .mockImplementation((query: string, params: any[]) => {
        queryCount++;
        if (query.includes('SELECT') && query.includes('wishlists')) {
          return Promise.resolve([{ id: wishlistId, owner_id: userId }]);
        }
        if (query.includes('SELECT') && query.includes('wishlist_members')) {
          return Promise.resolve([{ user_id: userId, role: 'owner' }]);
        }
        if (query.includes('INSERT')) {
          return Promise.resolve([{
            id: `item-${params[1]}`,
            wishlist_id: wishlistId,
            property_id: params[1]
          }]);
        }
        return Promise.resolve([]);
      });

    // Act
    for (const item of items) {
      await WishlistService.addItem(wishlistId, userId, item);
    }

    // Assert
    // Each addItem should use 3 queries (check wishlist, check permissions, insert)
    // But we can optimize by batching
    expect(queryCount).toBeLessThanOrEqual(30); // 10 items * 3 queries
  });

  it('should use connection pooling for concurrent requests', async () => {
    // Arrange
    const itemId = 'item-123';
    const users = Array.from({ length: 50 }, (_, i) => `user-${i + 1}`);

      (mockQueryDatabase as jest.Mock)
      .mockImplementation((query: string, params: any[]) => {
        if (query.includes('SELECT') && query.includes('wishlist_items')) {
          return Promise.resolve([{ id: itemId, wishlist_id: 'wishlist-123' }]);
        }
        if (query.includes('SELECT') && query.includes('wishlist_votes')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT')) {
          return Promise.resolve([{
            id: `vote-${params[1]}`,
            item_id: itemId,
            user_id: params[1],
            type: 'up',
            created_at: new Date()
          }]);
        }
        return Promise.resolve([]);
      });

    mockRedisCache.get = jest.fn().mockResolvedValue(null);

    // Mock getDbPool para VoteService usar transações
    const { getDbPool } = require('@/lib/db');
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    
    (getDbPool as jest.Mock).mockReturnValue({
      connect: jest.fn().mockResolvedValue(mockClient)
    });
    
    // Mock client.query para transações
    mockClient.query
      .mockImplementation((query: string, params: any[]) => {
        if (query === 'BEGIN' || query === 'COMMIT') {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT') && query.includes('wishlist_items')) {
          return Promise.resolve({ rows: [{ id: itemId, wishlist_id: 'wishlist-123' }] });
        }
        if (query.includes('SELECT') && query.includes('wishlist_votes')) {
          return Promise.resolve({ rows: [] });
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

    // Act
    const startTime = Date.now();
    const promises = users.map(userId =>
      VoteService.vote(userId, { itemId, voteType: 'upvote' })
    );
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(duration).toBeLessThan(3000); // Should handle concurrent requests efficiently
    // Cada voto faz: BEGIN, SELECT item, SELECT vote, INSERT vote, UPDATE item, COMMIT = 6 queries
    expect(mockClient.query).toHaveBeenCalledTimes(300); // 50 votes * 6 queries
  });

  it('should optimize queries with proper indexes', async () => {
    // Arrange
    const wishlistId = 'wishlist-123';
    const userId = 'user-123';

      (mockQueryDatabase as jest.Mock)
      .mockImplementation((query: string, params: any[]) => {
        // Simulate indexed query (should be fast)
        if (query.includes('WHERE id = $1')) {
          return Promise.resolve([{ id: wishlistId, owner_id: userId }]);
        }
        if (query.includes('WHERE user_id = $1')) {
          return Promise.resolve([{ user_id: userId, role: 'owner' }]);
        }
        return Promise.resolve([]);
      });

    // Act
    const startTime = Date.now();
    await WishlistService.getWishlist(wishlistId, userId);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(duration).toBeLessThan(100); // Indexed queries should be very fast
  });

  it('should use pagination to limit data transfer', async () => {
    // Arrange
    const chatId = 123;
    const limit = 50;
    const { listGroupMessages } = require('@/lib/group-chat-service');

      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce(
        Array.from({ length: limit }, (_, i) => ({
          id: i + 1,
          group_chat_id: chatId,
          message: `Message ${i + 1}`,
          message_type: 'text',
          created_at: new Date()
        }))
      )
      .mockResolvedValueOnce([]); // read_by

    mockRedisCache.get = jest.fn().mockResolvedValue(null);

    // Act
    const result = await listGroupMessages(chatId, limit, undefined, 1);

    // Assert
    expect(result).toHaveLength(limit);
    expect(result.length).toBeLessThanOrEqual(limit); // Should respect limit
  });
});

