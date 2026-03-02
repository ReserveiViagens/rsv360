/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - useSharedWishlist Hook
 * Testes para o hook de wishlists compartilhadas
 * 
 * @module __tests__/hooks/useSharedWishlist.test
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSharedWishlist } from '@/hooks/useSharedWishlist';
import wishlistService from '@/lib/group-travel/api/wishlist.service';

// Mock do service frontend
jest.mock('@/lib/group-travel/api/wishlist.service');

const mockWishlistService = wishlistService as jest.Mocked<typeof wishlistService>;

describe('useSharedWishlist', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('wishlists query', () => {
    it('should fetch all wishlists', async () => {
      // Arrange
      const mockWishlists = [
        { id: 'wishlist-1', name: 'Wishlist 1', privacy: 'private' },
        { id: 'wishlist-2', name: 'Wishlist 2', privacy: 'shared' }
      ];

      mockWishlistService.getAll = jest.fn().mockResolvedValue(mockWishlists);

      // Act
      const { result } = renderHook(() => useSharedWishlist(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.wishlists).toBeDefined();
      });

      // O hook retorna wishlists diretamente
      expect(result.current.wishlists).toEqual(mockWishlists);
      expect(mockWishlistService.getAll).toHaveBeenCalled();
    });

    it('should handle error when fetching wishlists', async () => {
      // Arrange
      const error = new Error('Failed to fetch');
      mockWishlistService.getAll = jest.fn().mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useSharedWishlist(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('wishlist query', () => {
    it('should fetch single wishlist by id', async () => {
      // Arrange
      const wishlistId = 'wishlist-123';
      const mockWishlist = {
        id: wishlistId,
        name: 'My Wishlist',
        privacy: 'private',
        items: [],
        members: []
      };

      mockWishlistService.getById = jest.fn().mockResolvedValue(mockWishlist);

      // Act
      const { result } = renderHook(() => useSharedWishlist({ wishlistId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.wishlist).toBeDefined();
      });

      expect(result.current.wishlist).toEqual(mockWishlist);
      expect(mockWishlistService.getById).toHaveBeenCalledWith(wishlistId);
    });
  });

  describe('createWishlist mutation', () => {
    it('should create wishlist successfully', async () => {
      // Arrange
      const createData = {
        name: 'New Wishlist',
        description: 'Test',
        privacy: 'private' as const
      };

      const mockWishlist = {
        id: 'wishlist-new',
        ...createData
      };

      mockWishlistService.create = jest.fn().mockResolvedValue(mockWishlist);

      // Act
      const { result } = renderHook(() => useSharedWishlist(), { wrapper });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      result.current.createWishlist(createData);

      // Assert
      await waitFor(() => {
        expect(mockWishlistService.create).toHaveBeenCalledWith(createData);
      });
    });
  });

  describe('updateWishlist mutation', () => {
    it('should update wishlist successfully', async () => {
      // Arrange
      const wishlistId = 'wishlist-123';
      const updateData = {
        name: 'Updated Name'
      };

      const mockUpdated = {
        id: wishlistId,
        ...updateData
      };

      mockWishlistService.update = jest.fn().mockResolvedValue(mockUpdated);

      // Act
      const { result } = renderHook(() => useSharedWishlist({ wishlistId }), { wrapper });

      result.current.updateWishlist({ id: wishlistId, data: updateData });

      // Assert
      await waitFor(() => {
        expect(mockWishlistService.update).toHaveBeenCalledWith(wishlistId, updateData);
      });
    });
  });

  describe('deleteWishlist mutation', () => {
    it('should delete wishlist successfully', async () => {
      // Arrange
      const wishlistId = 'wishlist-123';
      mockWishlistService.delete = jest.fn().mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useSharedWishlist({ wishlistId }), { wrapper });

      result.current.deleteWishlist(wishlistId);

      // Assert
      await waitFor(() => {
        expect(mockWishlistService.delete).toHaveBeenCalledWith(wishlistId);
      });
    });
  });

  describe('addItem mutation', () => {
    it('should add item to wishlist', async () => {
      // Arrange
      const wishlistId = 'wishlist-123';
      const itemData = {
        propertyId: 'property-456',
        notes: 'Great property'
      };

      const mockItem = {
        id: 'item-123',
        wishlistId,
        ...itemData
      };

      mockWishlistService.addItem = jest.fn().mockResolvedValue(mockItem);

      // Act
      const { result } = renderHook(() => useSharedWishlist({ wishlistId }), { wrapper });

      result.current.addItem({ wishlistId, data: itemData });

      // Assert
      await waitFor(() => {
        expect(mockWishlistService.addItem).toHaveBeenCalledWith(wishlistId, itemData);
      });
    });
  });

  describe('removeItem mutation', () => {
    it('should remove item from wishlist', async () => {
      // Arrange
      const wishlistId = 'wishlist-123';
      const itemId = 'item-456';
      mockWishlistService.removeItem = jest.fn().mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useSharedWishlist({ wishlistId }), { wrapper });

      result.current.removeItem({ wishlistId, itemId });

      // Assert
      await waitFor(() => {
        expect(mockWishlistService.removeItem).toHaveBeenCalledWith(wishlistId, itemId);
      });
    });
  });

  describe('inviteMember mutation', () => {
    it('should invite member successfully', async () => {
      // Arrange
      const wishlistId = 'wishlist-123';
      const inviteData = {
        email: 'newuser@example.com',
        role: 'editor' as const
      };

      const mockInvite = {
        id: 'invite-123',
        email: inviteData.email,
        role: inviteData.role
      };

      mockWishlistService.inviteMember = jest.fn().mockResolvedValue(mockInvite);

      // Act
      const { result } = renderHook(() => useSharedWishlist({ wishlistId }), { wrapper });

      result.current.inviteMember({ wishlistId, email: inviteData.email, role: inviteData.role });

      // Assert
      await waitFor(() => {
        expect(mockWishlistService.inviteMember).toHaveBeenCalledWith(wishlistId, inviteData.email, inviteData.role);
      });
    });
  });

  describe('helper functions', () => {
    it('should check if user can edit', () => {
      // Arrange
      const wishlist = {
        id: 'wishlist-123',
        createdBy: 'user-123',
        members: [
          { userId: 'user-123', role: 'owner' },
          { userId: 'user-456', role: 'editor' }
        ]
      } as any;

      // Act - Teste com owner
      const { result: resultOwner } = renderHook(() => useSharedWishlist({ userId: 'user-123' }), { wrapper });
      const canEditOwner = resultOwner.current.canEdit(wishlist);

      // Act - Teste com editor
      const { result: resultEditor } = renderHook(() => useSharedWishlist({ userId: 'user-456' }), { wrapper });
      const canEditEditor = resultEditor.current.canEdit(wishlist);

      // Act - Teste com viewer
      const { result: resultViewer } = renderHook(() => useSharedWishlist({ userId: 'user-789' }), { wrapper });
      const cannotEdit = resultViewer.current.canEdit(wishlist);

      // Assert
      expect(canEditOwner).toBe(true);
      expect(canEditEditor).toBe(true);
      expect(cannotEdit).toBe(false);
    });
  });
});

