/**
 * ✅ FASE 1 - ETAPA 1.4: React Hook - useSharedWishlist
 * Hook customizado para gerenciar wishlists compartilhadas
 * 
 * @module hooks/useSharedWishlist
 */

'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  SharedWishlist,
  WishlistItem,
  WishlistMember,
  CreateWishlistDTO,
  UpdateWishlistDTO,
  AddItemDTO
} from '@/lib/group-travel/types';

import wishlistService from '@/lib/group-travel/api/wishlist.service';

// Mock temporário removido - usando service real
/* const wishlistService = {
  getAll: async () => {
    const response = await fetch('/api/wishlists');
    if (!response.ok) throw new Error('Erro ao buscar wishlists');
    const data = await response.json();
    return data.data || [];
  },
  getById: async (id: string) => {
    const response = await fetch(`/api/wishlists/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar wishlist');
    const data = await response.json();
    return data.data;
  },
  create: async (data: CreateWishlistDTO) => {
    const response = await fetch('/api/wishlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar wishlist');
    const result = await response.json();
    return result.data;
  },
  update: async (id: string, data: UpdateWishlistDTO) => {
    const response = await fetch(`/api/wishlists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar wishlist');
    const result = await response.json();
    return result.data;
  },
  delete: async (id: string) => {
    const response = await fetch(`/api/wishlists/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao deletar wishlist');
  },
  addItem: async (wishlistId: string, data: AddItemDTO) => {
    const response = await fetch(`/api/wishlists/${wishlistId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao adicionar item');
    const result = await response.json();
    return result.data;
  },
  removeItem: async (wishlistId: string, itemId: string) => {
    const response = await fetch(`/api/wishlists/${wishlistId}/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao remover item');
  },
  inviteMember: async (wishlistId: string, email: string, role: string) => {
    const response = await fetch(`/api/wishlists/${wishlistId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    if (!response.ok) throw new Error('Erro ao convidar membro');
  },
  removeMember: async (wishlistId: string, memberId: string) => {
    const response = await fetch(`/api/wishlists/${wishlistId}/members/${memberId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao remover membro');
  }
}; */

interface UseSharedWishlistOptions {
  wishlistId?: string;
  userId?: string;
}

export function useSharedWishlist(options: UseSharedWishlistOptions = {}) {
  const { wishlistId, userId } = options;
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // QUERIES
  // ============================================

  // Query: Lista de todas as wishlists
  const {
    data: wishlists,
    isLoading: isLoadingWishlists,
    error: wishlistsError
  } = useQuery<SharedWishlist[]>({
    queryKey: ['wishlists'],
    queryFn: () => wishlistService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true
  });

  // Query: Wishlist específica
  const {
    data: wishlist,
    isLoading: isLoadingWishlist,
    error: wishlistError
  } = useQuery<SharedWishlist>({
    queryKey: ['wishlist', wishlistId],
    queryFn: () => wishlistService.getById(wishlistId!),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!wishlistId
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // Mutation: Criar wishlist
  const createWishlist = useMutation({
    mutationFn: (data: CreateWishlistDTO) => wishlistService.create(data),
    onSuccess: (newWishlist) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast.success('Wishlist criada com sucesso!');
      return newWishlist;
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar wishlist');
      setError(err);
    }
  });

  // Mutation: Atualizar wishlist
  const updateWishlist = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWishlistDTO }) =>
      wishlistService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast.success('Wishlist atualizada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar wishlist');
      setError(err);
    }
  });

  // Mutation: Deletar wishlist
  const deleteWishlist = useMutation({
    mutationFn: (id: string) => wishlistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast.success('Wishlist deletada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao deletar wishlist');
      setError(err);
    }
  });

  // Mutation: Adicionar item
  const addItem = useMutation({
    mutationFn: ({ wishlistId, data }: { wishlistId: string; data: AddItemDTO }) =>
      wishlistService.addItem(wishlistId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', variables.wishlistId] });
      toast.success('Item adicionado com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao adicionar item');
      setError(err);
    }
  });

  // Mutation: Remover item
  const removeItem = useMutation({
    mutationFn: ({ wishlistId, itemId }: { wishlistId: string; itemId: string }) =>
      wishlistService.removeItem(wishlistId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', variables.wishlistId] });
      toast.success('Item removido com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover item');
      setError(err);
    }
  });

  // Mutation: Convidar membro
  const inviteMember = useMutation({
    mutationFn: ({ wishlistId, email, role }: { wishlistId: string; email: string; role?: string }) =>
      wishlistService.inviteMember(wishlistId, email, role || 'viewer'),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', variables.wishlistId] });
      toast.success('Convite enviado!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar convite');
      setError(err);
    }
  });

  // Mutation: Remover membro
  const removeMember = useMutation({
    mutationFn: ({ wishlistId, memberId }: { wishlistId: string; memberId: string }) =>
      wishlistService.removeMember(wishlistId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', variables.wishlistId] });
      toast.success('Membro removido com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover membro');
      setError(err);
    }
  });

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Verificar se usuário pode editar wishlist
   */
  const canEdit = useCallback((wishlist: SharedWishlist | undefined, userId?: string): boolean => {
    if (!wishlist || !userId) return false;
    if (wishlist.createdBy === userId) return true;
    const member = wishlist.members?.find(m => m.userId === userId);
    return member?.role === 'owner' || member?.role === 'editor';
  }, []);

  /**
   * Verificar se usuário pode visualizar wishlist
   */
  const canView = useCallback((wishlist: SharedWishlist | undefined, userId?: string): boolean => {
    if (!wishlist) return false;
    if (wishlist.privacy === 'public') return true;
    if (!userId) return false;
    if (wishlist.createdBy === userId) return true;
    return wishlist.members?.some(m => m.userId === userId) || false;
  }, []);

  /**
   * Ordenar items por votos (DESC)
   */
  const getItemsSortedByVotes = useCallback((wishlist: SharedWishlist | undefined): WishlistItem[] => {
    if (!wishlist?.items) return [];
    return [...wishlist.items].sort((a, b) => b.votesCount - a.votesCount);
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const items = wishlist?.items || [];
  const members = wishlist?.members || [];
  const isLoading = isLoadingWishlists || isLoadingWishlist;
  const currentError = error || wishlistsError || wishlistError;

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    wishlists: wishlists || [],
    wishlist,
    items,
    members,

    // States
    isLoading,
    error: currentError,

    // Mutations
    createWishlist: createWishlist.mutate,
    updateWishlist: updateWishlist.mutate,
    deleteWishlist: deleteWishlist.mutate,
    addItem: addItem.mutate,
    removeItem: removeItem.mutate,
    inviteMember: inviteMember.mutate,
    removeMember: removeMember.mutate,

    // Helpers
    canEdit: (wishlist?: SharedWishlist) => canEdit(wishlist, userId),
    canView: (wishlist?: SharedWishlist) => canView(wishlist, userId),
    getItemsSortedByVotes: () => getItemsSortedByVotes(wishlist),

    // Loading states
    isCreating: createWishlist.isPending,
    isUpdating: updateWishlist.isPending,
    isDeleting: deleteWishlist.isPending,
    isAddingItem: addItem.isPending,
    isRemovingItem: removeItem.isPending,
    isInvitingMember: inviteMember.isPending,
    isRemovingMember: removeMember.isPending
  };
}

