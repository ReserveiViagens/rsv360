/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Wishlist Service
 * Testes para o serviço de wishlists
 * 
 * @module __tests__/lib/group-travel/wishlist-service.test
 */

import WishlistService from '@/lib/group-travel/wishlist-service';
import { queryDatabase } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('WishlistService', () => {
  const userId = 'user-123';
  const wishlistId = 'wishlist-456';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn();
    mockRedisCache.set = jest.fn();
    mockRedisCache.del = jest.fn();
  });

  describe('createWishlist', () => {
    it('should create a wishlist successfully', async () => {
      // Arrange
      const createData = {
        name: 'My Wishlist',
        description: 'Test wishlist',
        privacy: 'private' as const
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - INSERT wishlist (RETURNING)
      // 2. queryDatabase - INSERT member (pode falhar silenciosamente)
      
      // Mock 1: INSERT wishlist retorna wishlist criada
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: wishlistId,
          name: createData.name,
          description: createData.description,
          privacy: createData.privacy,
          created_by: userId,
          share_token: 'token-123',
          created_at: new Date(),
          updated_at: new Date()
        }])
        .mockResolvedValueOnce([]); // INSERT member

      // Act
      const result = await WishlistService.createWishlist(userId, createData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createData.name);
      expect(result.privacy).toBe(createData.privacy);
      expect(mockQueryDatabase).toHaveBeenCalled();
    });

    it('should validate privacy settings', async () => {
      // Arrange
      const createData = {
        name: 'My Wishlist',
        privacy: 'invalid' as any
      };

      // Act & Assert
      await expect(
        WishlistService.createWishlist(userId, createData)
      ).rejects.toThrow();
    });
  });

  describe('getWishlist', () => {
    it('should return wishlist if user has access', async () => {
      // Arrange
      const mockWishlist = {
        id: wishlistId,
        name: 'My Wishlist',
        privacy: 'private',
        owner_id: userId,
        members: [{ user_id: userId, role: 'owner' }]
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. redisCache.get - cache miss
      // 2. queryDatabase - SELECT wishlist
      // 3. checkUserAccess - SELECT members (se privada)
      // 4. queryDatabase - SELECT members (para retornar)
      
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: wishlistId,
          name: mockWishlist.name,
          privacy: mockWishlist.privacy,
          created_by: mockWishlist.owner_id,
          description: null,
          share_token: 'token-123',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'member-1',
          wishlist_id: wishlistId,
          user_id: userId, 
          role: 'owner' 
        }]) // checkUserAccess - retorna membro (tem acesso)
        .mockResolvedValueOnce([{ // SELECT members completo
          id: 'member-1',
          wishlist_id: wishlistId,
          user_id: userId,
          email: 'user@test.com',
          role: 'owner',
          joined_at: new Date(),
          user_name: 'User',
          user_avatar: null
        }]);

      // Act
      const result = await WishlistService.getWishlist(wishlistId, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(wishlistId);
    });

    it('should return null if wishlist does not exist', async () => {
      // Arrange
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);

      // Act
      const result = await WishlistService.getWishlist('invalid-id', userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error if user does not have access to private wishlist', async () => {
      // Arrange
      const mockWishlist = {
        id: wishlistId,
        privacy: 'private',
        owner_id: 'other-user'
      };

      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: wishlistId,
          name: 'Private Wishlist',
          privacy: 'private',
          created_by: 'other-user',
          description: null,
          share_token: 'token-123',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([]); // checkUserAccess - user is not a member

      // Act & Assert
      // O erro é re-lançado com prefixo: "Erro ao buscar wishlist: Access denied"
      await expect(
        WishlistService.getWishlist(wishlistId, userId)
      ).rejects.toThrow(/Access denied/);
    });
  });

  describe('addItem', () => {
    it('should add item to wishlist', async () => {
      // Arrange
      const itemData = {
        propertyId: 'property-123',
        notes: 'Great property'
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist
      // 2. queryDatabase - SELECT member (check permission)
      // 3. queryDatabase - INSERT item (RETURNING)
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: userId,
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'member-1',
          wishlist_id: wishlistId,
          user_id: userId, 
          role: 'owner' 
        }]) // SELECT member (check permission) - user é owner
        .mockResolvedValueOnce([{
          id: 'item-123',
          wishlist_id: wishlistId,
          property_id: itemData.propertyId,
          added_by: userId,
          notes: itemData.notes,
          priority: 'medium',
          created_at: new Date()
        }]); // INSERT item (RETURNING)

      // Act
      const result = await WishlistService.addItem(wishlistId, userId, itemData);

      // Assert
      expect(result).toBeDefined();
      expect(result.propertyId).toBe(itemData.propertyId);
      expect(mockQueryDatabase).toHaveBeenCalledTimes(3);
    });

    it('should throw error if user does not have permission', async () => {
      // Arrange
      const itemData = { propertyId: 'property-123' };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist
      // 2. queryDatabase - SELECT member (check permission) - retorna [] (sem permissão)
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId,
          created_by: 'other-user',
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([]); // SELECT member - User is not a member or viewer (sem permissão)

      // Act & Assert
      // O erro é re-lançado com prefixo: "Erro ao adicionar item: Permission denied"
      await expect(
        WishlistService.addItem(wishlistId, userId, itemData)
      ).rejects.toThrow(/Permission denied/);
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', async () => {
      // Arrange
      const itemId = 'item-123';

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT item
      // 2. queryDatabase - SELECT member (check permission)
      // 3. queryDatabase - DELETE item
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: itemId, 
          wishlist_id: wishlistId,
          property_id: 'property-123',
          added_by: userId,
          notes: null,
          priority: 'medium',
          created_at: new Date()
        }]) // SELECT item
        .mockResolvedValueOnce([{ user_id: userId, role: 'owner' }]) // SELECT member (check permission)
        .mockResolvedValueOnce([]); // DELETE item

      // Act
      await WishlistService.removeItem(wishlistId, itemId, userId);

      // Assert
      expect(mockQueryDatabase).toHaveBeenCalledTimes(3);
      expect(mockRedisCache.del).toHaveBeenCalled(); // Cache invalidation
    });
  });

  describe('inviteMember', () => {
    it('should invite member successfully', async () => {
      // Arrange
      const inviteData = {
        email: 'newuser@example.com',
        role: 'editor' as const
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist
      // 2. queryDatabase - SELECT member (check permission)
      // 3. queryDatabase - SELECT user email (check if owner)
      // 4. queryDatabase - INSERT member
      
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: userId,
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'member-owner',
          wishlist_id: wishlistId,
          user_id: userId, 
          role: 'owner' 
        }]) // SELECT member (check permission) - user é owner
        .mockResolvedValueOnce([]) // SELECT user email (owner não tem esse email, então [] = pode convidar)
        .mockResolvedValueOnce([{
          id: 'invite-123',
          wishlist_id: wishlistId,
          email: inviteData.email,
          role: inviteData.role,
          user_id: null,
          joined_at: new Date()
        }]); // INSERT member

      // Act
      const result = await WishlistService.inviteMember(wishlistId, userId, inviteData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(inviteData.email);
    });

    it('should throw error if owner tries to invite themselves', async () => {
      // Arrange
      const inviteData = {
        email: 'owner@example.com',
        role: 'editor' as const
      };

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: userId,
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'member-owner',
          wishlist_id: wishlistId,
          user_id: userId, 
          role: 'owner' 
        }]) // SELECT member (check permission) - user é owner
        .mockResolvedValueOnce([{ email: 'owner@example.com' }]); // SELECT user email (owner's email)

      // Act & Assert
      // O erro é re-lançado com prefixo: "Erro ao convidar membro: Cannot invite owner"
      await expect(
        WishlistService.inviteMember(wishlistId, userId, inviteData)
      ).rejects.toThrow(/Cannot invite owner/);
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      // Arrange
      const memberId = 'member-123';

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist
      // 2. queryDatabase - SELECT owner (check permission)
      // 3. queryDatabase - SELECT member to remove
      // 4. queryDatabase - DELETE member
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: userId,
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'owner-member',
          wishlist_id: wishlistId,
          user_id: userId, 
          role: 'owner' 
        }]) // SELECT owner (check permission) - user é owner
        .mockResolvedValueOnce([{ 
          id: memberId,
          wishlist_id: wishlistId,
          user_id: 'other-user',
          email: 'other@test.com',
          role: 'editor',
          joined_at: new Date()
        }]) // SELECT member to remove
        .mockResolvedValueOnce([]); // DELETE member

      // Act
      await WishlistService.removeMember(wishlistId, memberId, userId);

      // Assert
      expect(mockQueryDatabase).toHaveBeenCalledTimes(4);
    });

    it('should throw error if trying to remove owner', async () => {
      // Arrange
      const ownerId = userId;

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist
      // 2. queryDatabase - SELECT owner (check permission) - deve retornar owner
      // 3. queryDatabase - SELECT member to remove - deve retornar owner (não pode remover)
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: ownerId,
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'owner-member',
          wishlist_id: wishlistId,
          user_id: ownerId, 
          role: 'owner' 
        }]) // SELECT owner (check permission) - user é owner
        .mockResolvedValueOnce([{ 
          id: ownerId, // Tentando remover o próprio owner
          wishlist_id: wishlistId,
          user_id: ownerId,
          email: 'owner@test.com',
          role: 'owner', // É owner, não pode remover
          joined_at: new Date()
        }]); // SELECT member to remove - é owner, deve lançar erro

      // Act & Assert
      // O erro é re-lançado com prefixo: "Erro ao remover membro: Cannot remove owner"
      await expect(
        WishlistService.removeMember(wishlistId, ownerId, userId)
      ).rejects.toThrow(/Cannot remove owner/);
    });
  });

  describe('updateWishlist', () => {
    it('should update wishlist successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist
      // 2. queryDatabase - SELECT member (check permission)
      // 3. queryDatabase - UPDATE wishlist (RETURNING)
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: userId,
          name: 'Old Name',
          privacy: 'private',
          description: 'Old description',
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist
        .mockResolvedValueOnce([{ 
          id: 'member-owner',
          wishlist_id: wishlistId,
          user_id: userId, 
          role: 'owner' 
        }]) // SELECT member (check permission) - user é owner
        .mockResolvedValueOnce([{
          id: wishlistId,
          name: updateData.name,
          description: updateData.description,
          created_by: userId,
          privacy: 'private',
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]); // UPDATE wishlist (RETURNING)

      // Act
      const result = await WishlistService.updateWishlist(wishlistId, userId, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
    });
  });

  describe('deleteWishlist', () => {
    it('should delete wishlist if user is owner', async () => {
      // Arrange
      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist (verifica se existe e se user é owner)
      // 2. queryDatabase - DELETE wishlist
      
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: userId, // User é owner
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]) // SELECT wishlist - user é owner, pode deletar
        .mockResolvedValueOnce([]); // DELETE wishlist

      // Act
      await WishlistService.deleteWishlist(wishlistId, userId);

      // Assert
      expect(mockQueryDatabase).toHaveBeenCalledTimes(2);
      expect(mockRedisCache.del).toHaveBeenCalled();
    });

    it('should throw error if user is not owner', async () => {
      // Arrange
      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - SELECT wishlist (verifica se user é owner)
      
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ 
          id: wishlistId, 
          created_by: 'other-user', // User NÃO é owner
          name: 'Test Wishlist',
          privacy: 'private',
          description: null,
          share_token: 'token',
          created_at: new Date(),
          updated_at: new Date()
        }]); // SELECT wishlist - user não é owner, deve lançar erro

      // Act & Assert
      // O erro é re-lançado com prefixo: "Erro ao deletar wishlist: Only owner can delete"
      await expect(
        WishlistService.deleteWishlist(wishlistId, userId)
      ).rejects.toThrow(/Only owner can delete/);
    });
  });

  describe('getUserWishlists', () => {
    it('should return user wishlists', async () => {
      // Arrange
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      const mockWishlists = [
        { 
          id: 'wishlist-1', 
          name: 'Wishlist 1', 
          created_by: userId,
          description: null,
          privacy: 'private',
          share_token: 'token-1',
          created_at: new Date(),
          updated_at: new Date()
        },
        { 
          id: 'wishlist-2', 
          name: 'Wishlist 2', 
          created_by: userId,
          description: null,
          privacy: 'private',
          share_token: 'token-2',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockWishlists);

      // Act
      const result = await WishlistService.getUserWishlists(userId);

      // Assert
      expect(result).toHaveLength(2);
    });
  });
});

