/**
 * ✅ FASE 1 - ETAPA 1.4: React Hook - useVote
 * Hook customizado para gerenciar votações em itens de wishlist
 * 
 * @module hooks/useVote
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Vote, VoteDTO } from '@/lib/group-travel/types';

import voteService from '@/lib/group-travel/api/vote.service';

// Mock temporário removido - usando service real
/* const voteService = {
  vote: async (itemId: string, voteType: 'upvote' | 'downvote') => {
    const response = await fetch(`/api/wishlists/items/${itemId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao votar');
    }
    const result = await response.json();
    return result.data;
  },
  removeVote: async (itemId: string) => {
    const response = await fetch(`/api/wishlists/items/${itemId}/vote`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao remover voto');
    }
  },
  getItemVotes: async (itemId: string, options?: { limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const response = await fetch(`/api/wishlists/items/${itemId}/votes?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar votos');
    const data = await response.json();
    return data.data || [];
  },
  getUserVote: async (itemId: string, userId: string) => {
    const response = await fetch(`/api/wishlists/items/${itemId}/votes/user/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Erro ao buscar voto do usuário');
    }
    const data = await response.json();
    return data.data || null;
  },
  getVotesStats: async (itemId: string) => {
    const response = await fetch(`/api/wishlists/items/${itemId}/votes/stats`);
    if (!response.ok) throw new Error('Erro ao buscar estatísticas');
    const data = await response.json();
    return data.data || { upvotes: 0, downvotes: 0, total: 0 };
  }
}; */

interface UseVoteOptions {
  itemId?: string;
  userId?: string;
}

export function useVote(options: UseVoteOptions = {}) {
  const { itemId, userId } = options;
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  // Query: Votos do item
  const {
    data: votes,
    isLoading: isLoadingVotes,
    error: votesError
  } = useQuery<Vote[]>({
    queryKey: ['votes', itemId],
    queryFn: () => voteService.getItemVotes(itemId!),
    staleTime: 60 * 1000, // 1 minuto
    enabled: !!itemId
  });

  // Query: Voto do usuário logado
  const {
    data: userVote,
    isLoading: isLoadingUserVote,
    error: userVoteError
  } = useQuery<Vote | null>({
    queryKey: ['userVote', itemId, userId],
    queryFn: () => voteService.getUserVote(itemId!, userId!),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!itemId && !!userId
  });

  // Query: Estatísticas de votos
  const {
    data: votesStats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery<{ upvotes: number; downvotes: number; total: number }>({
    queryKey: ['votesStats', itemId],
    queryFn: () => voteService.getVotesStats(itemId!),
    staleTime: 60 * 1000, // 1 minuto
    enabled: !!itemId
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // Mutation: Votar
  const voteMutation = useMutation({
    mutationFn: ({ itemId, voteType }: { itemId: string; voteType: 'upvote' | 'downvote' }) =>
      voteService.vote(itemId, voteType),
    onMutate: async ({ itemId, voteType }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['votes', itemId] });
      await queryClient.cancelQueries({ queryKey: ['userVote', itemId, userId] });
      await queryClient.cancelQueries({ queryKey: ['votesStats', itemId] });

      // Snapshot dos valores anteriores
      const previousVotes = queryClient.getQueryData<Vote[]>(['votes', itemId]);
      const previousUserVote = queryClient.getQueryData<Vote | null>(['userVote', itemId, userId]);
      const previousStats = queryClient.getQueryData<{ upvotes: number; downvotes: number; total: number }>(['votesStats', itemId]);

      // Optimistic update: adicionar voto temporário
      if (previousUserVote) {
        // Se já tinha voto, atualizar
        queryClient.setQueryData<Vote | null>(['userVote', itemId, userId], {
          ...previousUserVote,
          voteType
        });
      } else if (userId) {
        // Novo voto
        const optimisticVote: Vote = {
          id: `temp-${Date.now()}`,
          itemId,
          userId: userId!,
          voteType,
          createdAt: new Date()
        };
        queryClient.setQueryData<Vote | null>(['userVote', itemId, userId], optimisticVote);
      }

      // Atualizar stats otimisticamente
      if (previousStats) {
        const newStats = { ...previousStats };
        if (previousUserVote) {
          // Remover voto anterior
          if (previousUserVote.voteType === 'upvote') {
            newStats.upvotes = Math.max(0, newStats.upvotes - 1);
          } else {
            newStats.downvotes = Math.max(0, newStats.downvotes - 1);
          }
        }
        // Adicionar novo voto
        if (voteType === 'upvote') {
          newStats.upvotes += 1;
        } else {
          newStats.downvotes += 1;
        }
        newStats.total = newStats.upvotes + newStats.downvotes;
        queryClient.setQueryData(['votesStats', itemId], newStats);
      }

      return { previousVotes, previousUserVote, previousStats };
    },
    onError: (err, variables, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousVotes) {
        queryClient.setQueryData(['votes', variables.itemId], context.previousVotes);
      }
      if (context?.previousUserVote !== undefined) {
        queryClient.setQueryData(['userVote', variables.itemId, userId], context.previousUserVote);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['votesStats', variables.itemId], context.previousStats);
      }
      toast.error(err.message || 'Erro ao votar');
    },
    onSuccess: (data, variables) => {
      // Invalidar queries para refetch com dados reais
      queryClient.invalidateQueries({ queryKey: ['votes', variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['userVote', variables.itemId, userId] });
      queryClient.invalidateQueries({ queryKey: ['votesStats', variables.itemId] });
      
      // Invalidar também a wishlist que contém o item
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast.success('Voto registrado com sucesso!');
    }
  });

  // Mutation: Remover voto
  const removeVoteMutation = useMutation({
    mutationFn: (itemId: string) => voteService.removeVote(itemId),
    onMutate: async (itemId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['votes', itemId] });
      await queryClient.cancelQueries({ queryKey: ['userVote', itemId, userId] });
      await queryClient.cancelQueries({ queryKey: ['votesStats', itemId] });

      // Snapshot dos valores anteriores
      const previousVotes = queryClient.getQueryData<Vote[]>(['votes', itemId]);
      const previousUserVote = queryClient.getQueryData<Vote | null>(['userVote', itemId, userId]);
      const previousStats = queryClient.getQueryData<{ upvotes: number; downvotes: number; total: number }>(['votesStats', itemId]);

      // Optimistic update: remover voto
      queryClient.setQueryData<Vote | null>(['userVote', itemId, userId], null);

      // Atualizar stats otimisticamente
      if (previousStats && previousUserVote) {
        const newStats = { ...previousStats };
        if (previousUserVote.voteType === 'upvote') {
          newStats.upvotes = Math.max(0, newStats.upvotes - 1);
        } else {
          newStats.downvotes = Math.max(0, newStats.downvotes - 1);
        }
        newStats.total = newStats.upvotes + newStats.downvotes;
        queryClient.setQueryData(['votesStats', itemId], newStats);
      }

      return { previousVotes, previousUserVote, previousStats };
    },
    onError: (err, itemId, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousVotes) {
        queryClient.setQueryData(['votes', itemId], context.previousVotes);
      }
      if (context?.previousUserVote !== undefined) {
        queryClient.setQueryData(['userVote', itemId, userId], context.previousUserVote);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['votesStats', itemId], context.previousStats);
      }
      toast.error(err.message || 'Erro ao remover voto');
    },
    onSuccess: (_, itemId) => {
      // Invalidar queries para refetch com dados reais
      queryClient.invalidateQueries({ queryKey: ['votes', itemId] });
      queryClient.invalidateQueries({ queryKey: ['userVote', itemId, userId] });
      queryClient.invalidateQueries({ queryKey: ['votesStats', itemId] });
      
      // Invalidar também a wishlist que contém o item
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast.success('Voto removido com sucesso!');
    }
  });

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Verificar se usuário já votou
   */
  const hasUserVoted = (): boolean => {
    return !!userVote;
  };

  /**
   * Obter tipo de voto do usuário
   */
  const getUserVoteType = (): 'upvote' | 'downvote' | null => {
    return userVote?.voteType || null;
  };

  /**
   * Obter contadores de votos
   */
  const getVotesCount = (): { upvotes: number; downvotes: number; total: number } => {
    return votesStats || { upvotes: 0, downvotes: 0, total: 0 };
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const isLoading = isLoadingVotes || isLoadingUserVote || isLoadingStats;
  const error = votesError || userVoteError || statsError;

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    votes: votes || [],
    userVote: userVote || null,
    votesStats: votesStats || { upvotes: 0, downvotes: 0, total: 0 },

    // States
    isLoading,
    error,

    // Mutations
    vote: voteMutation.mutate,
    removeVote: removeVoteMutation.mutate,

    // Helpers
    hasUserVoted,
    getUserVoteType,
    getVotesCount,

    // Loading states
    isVoting: voteMutation.isPending,
    isRemovingVote: removeVoteMutation.isPending
  };
}

