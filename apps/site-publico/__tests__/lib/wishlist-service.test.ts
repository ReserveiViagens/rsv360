/**
 * ✅ TESTES: WISHLIST SERVICE
 * Testes unitários completos para wishlist-service
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { queryDatabase } from '@/lib/db';
import {
  createWishlist,
  getWishlist,
  listUserWishlists,
  addWishlistItem,
  voteOnWishlistItem,
  listWishlistItems,
} from '@/lib/wishlist-service';

// Mock do queryDatabase
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
  __setMockPool: jest.fn(),
  closeDbPool: jest.fn().mockResolvedValue(undefined),
}));

// Mock de cache
jest.mock('@/lib/cache-integration', () => ({
  cacheWishlist: jest.fn((id, fn) => fn()),
  invalidateWishlistCache: jest.fn(),
  invalidateWishlistRelatedCache: jest.fn(),
  cacheGetOrSet: jest.fn((key, fn) => fn()),
}));

describe('Wishlist Service', () => {
  let mockQuery: jest.Mock;

  beforeAll(() => {
    mockQuery = queryDatabase as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    if (mockQuery && typeof mockQuery.mockClear === 'function') {
      mockQuery.mockClear();
    }
  });

  describe('createWishlist', () => {
    it('deve criar uma wishlist com sucesso', async () => {
      const mockWishlist = {
        id: 1,
        name: 'Viagem para Caldas Novas',
        description: 'Planejando viagem em família',
        is_public: false,
        share_token: 'abc123',
        creator_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock de criação de wishlist e adição de membro
      mockQuery
        .mockResolvedValueOnce([mockWishlist]) // INSERT wishlist
        .mockResolvedValueOnce([]); // INSERT member

      const result = await createWishlist(
        'Viagem para Caldas Novas',
        'Planejando viagem em família',
        1,
        false
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe('Viagem para Caldas Novas');
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('getWishlist', () => {
    it('deve buscar wishlist por ID', async () => {
      const mockWishlist = {
        id: 1,
        name: 'Test Wishlist',
        is_public: false,
        share_token: 'abc123',
      };

      mockQuery
        .mockResolvedValueOnce([mockWishlist]) // SELECT wishlist
        .mockResolvedValueOnce([{ count: '0' }]) // COUNT members
        .mockResolvedValueOnce([{ count: '0' }]); // COUNT items

      const result = await getWishlist(1, 1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });

    it('deve buscar wishlist por token', async () => {
      const mockWishlist = {
        id: 1,
        name: 'Test Wishlist',
        is_public: true,
        share_token: 'abc123',
      };

      mockQuery
        .mockResolvedValueOnce([mockWishlist]) // SELECT wishlist
        .mockResolvedValueOnce([{ count: '0' }]) // COUNT members
        .mockResolvedValueOnce([{ count: '0' }]); // COUNT items

      const result = await getWishlist('abc123', undefined, undefined);

      expect(result).toBeDefined();
      expect(result?.share_token).toBe('abc123');
    });
  });

  describe('addWishlistItem', () => {
    it('deve adicionar item à wishlist', async () => {
      const mockItem = {
        id: 1,
        wishlist_id: 1,
        item_id: 123,
        item_type: 'property',
        votes_up: 0,
        votes_down: 0,
        votes_maybe: 0,
      };

      // Mock de verificação de permissão e inserção
      mockQuery
        .mockResolvedValueOnce([{ wishlist_id: 1, is_public: false }]) // SELECT item
        .mockResolvedValueOnce([{ role: 'member', can_add: true }]) // SELECT member
        .mockResolvedValueOnce([mockItem]); // INSERT item

      const result = await addWishlistItem(
        1,
        123,
        'property',
        1,
        undefined,
        undefined,
        undefined,
        2,
        undefined,
        1
      );

      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('voteOnWishlistItem', () => {
    it('deve registrar voto com sucesso', async () => {
      const mockVote = {
        id: 1,
        item_id: 1,
        user_id: 1,
        vote: 'up',
        voted_at: new Date().toISOString(),
      };

      mockQuery
        .mockResolvedValueOnce([{ wishlist_id: 1 }]) // SELECT item
        .mockResolvedValueOnce([{ role: 'member', can_vote: true }]) // SELECT member
        .mockResolvedValueOnce([mockVote]); // INSERT/UPDATE vote

      const result = await voteOnWishlistItem(1, 'up', 1);

      expect(result).toBeDefined();
      expect(result?.vote).toBe('up');
    });

    it('deve rejeitar voto sem permissão', async () => {
      mockQuery
        .mockResolvedValueOnce([{ wishlist_id: 1 }]) // SELECT item
        .mockResolvedValueOnce([]); // Sem permissão

      const result = await voteOnWishlistItem(1, 'up', 1);

      expect(result).toBeNull();
    });
  });

  describe('listWishlistItems', () => {
    it('deve listar itens da wishlist', async () => {
      const mockItems = [
        {
          id: 1,
          wishlist_id: 1,
          item_id: 123,
          votes_up: 5,
          votes_down: 1,
          votes_maybe: 2,
        },
        {
          id: 2,
          wishlist_id: 1,
          item_id: 456,
          votes_up: 3,
          votes_down: 0,
          votes_maybe: 1,
        },
      ];

      mockQuery
        .mockResolvedValueOnce([{ wishlist_id: 1, is_public: false }]) // SELECT wishlist
        .mockResolvedValueOnce([{ role: 'member' }]) // SELECT member
        .mockResolvedValueOnce(mockItems); // SELECT items

      const result = await listWishlistItems(1, 1);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });
  });
});

