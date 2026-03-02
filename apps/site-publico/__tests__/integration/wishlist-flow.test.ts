/**
 * ✅ FASE 5 - ETAPA 5.2: Testes de Integração E2E - Fluxo Completo de Wishlist
 * Testa o fluxo completo de criação, edição, votação e compartilhamento de wishlist
 * 
 * @module __tests__/integration/wishlist-flow.test
 */

import { queryDatabase } from '@/lib/db';
import WishlistService from '@/lib/group-travel/wishlist-service';
import VoteService from '@/lib/group-travel/vote-service';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Wishlist Complete Flow E2E', () => {
  const user1 = 'user-1-uuid';
  const user2 = 'user-2-uuid';
  const user3 = 'user-3-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn();
    mockRedisCache.set = jest.fn();
    mockRedisCache.del = jest.fn();
  });

  it('should handle complete wishlist flow: create, add items, vote, invite members', async () => {
    // 1. User 1 creates a wishlist
    const wishlistData = {
      name: 'Summer Trip 2025',
      description: 'Planning our summer vacation',
      privacy: 'shared' as const
    };

      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{
        id: 'wishlist-123',
        name: wishlistData.name,
        description: wishlistData.description,
        privacy: wishlistData.privacy,
        owner_id: user1,
        created_at: new Date()
      }]);

    const wishlist = await WishlistService.createWishlist(user1, wishlistData);
    expect(wishlist.id).toBe('wishlist-123');

    // 2. User 1 adds properties to wishlist
    const property1 = { propertyId: 'property-1', notes: 'Beach house' };
    const property2 = { propertyId: 'property-2', notes: 'Mountain cabin' };

      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: 'wishlist-123', owner_id: user1 }])
      .mockResolvedValueOnce([{ user_id: user1, role: 'owner' }])
      .mockResolvedValueOnce([{ id: 'item-1', wishlist_id: 'wishlist-123', ...property1 }])
      .mockResolvedValueOnce([{ id: 'wishlist-123', owner_id: user1 }])
      .mockResolvedValueOnce([{ user_id: user1, role: 'owner' }])
      .mockResolvedValueOnce([{ id: 'item-2', wishlist_id: 'wishlist-123', ...property2 }]);

    const item1 = await WishlistService.addItem('wishlist-123', user1, property1);
    const item2 = await WishlistService.addItem('wishlist-123', user1, property2);

    expect(item1.propertyId).toBe(property1.propertyId);
    expect(item2.propertyId).toBe(property2.propertyId);

    // 3. User 1 invites User 2 and User 3
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: 'wishlist-123', owner_id: user1 }])
      .mockResolvedValueOnce([{ user_id: user1, role: 'owner' }])
      .mockResolvedValueOnce([{ id: 'invite-1', email: 'user2@example.com', role: 'editor' }])
      .mockResolvedValueOnce([{ id: 'wishlist-123', owner_id: user1 }])
      .mockResolvedValueOnce([{ user_id: user1, role: 'owner' }])
      .mockResolvedValueOnce([{ id: 'invite-2', email: 'user3@example.com', role: 'viewer' }]);

    const invite1 = await WishlistService.inviteMember('wishlist-123', user1, {
      email: 'user2@example.com',
      role: 'editor'
    });
    const invite2 = await WishlistService.inviteMember('wishlist-123', user1, {
      email: 'user3@example.com',
      role: 'viewer'
    });

    expect(invite1.email).toBe('user2@example.com');
    expect(invite2.email).toBe('user3@example.com');

    // 4. User 2 votes on items
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: 'item-1', wishlist_id: 'wishlist-123' }])
      .mockResolvedValueOnce([]) // No existing vote
      .mockResolvedValueOnce([{ id: 'vote-1', item_id: 'item-1', user_id: user2, type: 'up' }])
      .mockResolvedValueOnce([{ id: 'item-2', wishlist_id: 'wishlist-123' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'vote-2', item_id: 'item-2', user_id: user2, type: 'down' }]);

    mockRedisCache.get = jest.fn().mockResolvedValue(null);

    const vote1 = await VoteService.vote(user2, {
      itemId: 'item-1',
      voteType: 'upvote'
    });
    const vote2 = await VoteService.vote(user2, {
      itemId: 'item-2',
      voteType: 'downvote'
    });

    expect(vote1.voteType).toBe('upvote');
    expect(vote2.voteType).toBe('downvote');

    // 5. User 3 tries to add item (should fail - viewer only)
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: 'wishlist-123' }])
      .mockResolvedValueOnce([{ user_id: user3, role: 'viewer' }]); // Viewer cannot add

    await expect(
      WishlistService.addItem('wishlist-123', user3, { propertyId: 'property-3' })
    ).rejects.toThrow('Permission denied');

    // 6. User 2 adds item (should succeed - editor)
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: 'wishlist-123' }])
      .mockResolvedValueOnce([{ user_id: user2, role: 'editor' }])
      .mockResolvedValueOnce([{ id: 'item-3', wishlist_id: 'wishlist-123', property_id: 'property-3' }]);

    const item3 = await WishlistService.addItem('wishlist-123', user2, { propertyId: 'property-3' });
    expect(item3.propertyId).toBe('property-3');

    // 7. Verify final state
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{
        id: 'wishlist-123',
        name: 'Summer Trip 2025',
        items: [
          { id: 'item-1', propertyId: 'property-1' },
          { id: 'item-2', propertyId: 'property-2' },
          { id: 'item-3', propertyId: 'property-3' }
        ],
        members: [
          { user_id: user1, role: 'owner' },
          { user_id: user2, role: 'editor' },
          { user_id: user3, role: 'viewer' }
        ]
      }]);

    const finalWishlist = await WishlistService.getWishlist('wishlist-123', user1);
    expect(finalWishlist?.items).toHaveLength(3);
    expect(finalWishlist?.members).toHaveLength(3);
  });

  it('should handle permissions correctly across different roles', async () => {
    const wishlistId = 'wishlist-123';

    // Owner can do everything
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: wishlistId, owner_id: user1 }])
      .mockResolvedValueOnce([{ user_id: user1, role: 'owner' }]);

    await expect(
      WishlistService.addItem(wishlistId, user1, { propertyId: 'prop-1' })
    ).resolves.toBeDefined();

    // Editor can add items
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: wishlistId }])
      .mockResolvedValueOnce([{ user_id: user2, role: 'editor' }])
      .mockResolvedValueOnce([{ id: 'item-1' }]);

    await expect(
      WishlistService.addItem(wishlistId, user2, { propertyId: 'prop-2' })
    ).resolves.toBeDefined();

    // Viewer cannot add items
      (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: wishlistId }])
      .mockResolvedValueOnce([{ user_id: user3, role: 'viewer' }]);

    await expect(
      WishlistService.addItem(wishlistId, user3, { propertyId: 'prop-3' })
    ).rejects.toThrow('Permission denied');
  });
});

