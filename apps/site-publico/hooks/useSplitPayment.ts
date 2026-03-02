/**
 * ✅ FASE 1 - ETAPA 1.4: React Hook - useSplitPayment
 * Hook customizado para gerenciar divisão de pagamentos
 * 
 * @module hooks/useSplitPayment
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SplitPayment, PaymentSplit, CreateSplitPaymentDTO } from '@/lib/group-travel/types';

import splitPaymentService from '@/lib/group-travel/api/split-payment.service';

// Mock temporário removido - usando service real
/* const splitPaymentService = {
  createSplit: async (bookingId: string, data: CreateSplitPaymentDTO) => {
    const response = await fetch(`/api/bookings/${bookingId}/split-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar divisão de pagamento');
    }
    const result = await response.json();
    return result.data;
  },
  getBookingSplits: async (bookingId: string) => {
    const response = await fetch(`/api/bookings/${bookingId}/split-payment`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Erro ao buscar divisão de pagamento');
    }
    const data = await response.json();
    return data.data || null;
  },
  markAsPaid: async (splitId: string, paymentData: { method: string; transactionId?: string }) => {
    const response = await fetch(`/api/split-payments/${splitId}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao marcar como pago');
    }
    const result = await response.json();
    return result.data;
  },
  getUserSplits: async (userId: string, options?: { status?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const response = await fetch(`/api/split-payments/user/${userId}?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar splits do usuário');
    const data = await response.json();
    return data.data || [];
  },
  getSplitStatus: async (bookingId: string) => {
    const response = await fetch(`/api/bookings/${bookingId}/split-payment/status`);
    if (!response.ok) throw new Error('Erro ao buscar status');
    const data = await response.json();
    return data.data || { total: 0, paid: 0, pending: 0, percentage: 0 };
  },
  sendReminder: async (splitId: string) => {
    const response = await fetch(`/api/split-payments/${splitId}/reminder`, {
      method: 'POST'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar lembrete');
    }
  }
}; */

interface UseSplitPaymentOptions {
  bookingId?: string;
  userId?: string;
}

export function useSplitPayment(options: UseSplitPaymentOptions = {}) {
  const { bookingId, userId } = options;
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  // Query: Split payment do booking
  const {
    data: splitPayment,
    isLoading: isLoadingSplitPayment,
    error: splitPaymentError
  } = useQuery<SplitPayment | null>({
    queryKey: ['splitPayment', bookingId],
    queryFn: () => splitPaymentService.getBookingSplits(bookingId!),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!bookingId
  });

  // Query: Splits do usuário
  const {
    data: userSplits,
    isLoading: isLoadingUserSplits,
    error: userSplitsError
  } = useQuery<PaymentSplit[]>({
    queryKey: ['userSplits', userId],
    queryFn: () => splitPaymentService.getUserSplits(userId!),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!userId
  });

  // Query: Status do split payment (com polling se parcial)
  const {
    data: splitStatus,
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery<{ total: number; paid: number; pending: number; percentage: number }>({
    queryKey: ['splitStatus', bookingId],
    queryFn: () => splitPaymentService.getSplitStatus(bookingId!),
    staleTime: 30 * 1000, // 30 segundos
    enabled: !!bookingId,
    refetchInterval: (query) => {
      // Polling a cada 30s se status for 'partial'
      const data = query.state.data;
      if (data && splitPayment?.status === 'partial') {
        return 30000;
      }
      return false;
    }
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // Mutation: Criar split payment
  const createSplit = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: CreateSplitPaymentDTO }) =>
      splitPaymentService.createSplit(bookingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['splitPayment', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['splitStatus', variables.bookingId] });
      toast.success('Divisão de pagamento criada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar divisão de pagamento');
    }
  });

  // Mutation: Marcar como pago
  const markAsPaid = useMutation({
    mutationFn: ({ splitId, paymentData }: { splitId: string; paymentData: { method: string; transactionId?: string } }) =>
      splitPaymentService.markAsPaid(splitId, paymentData),
    onMutate: async ({ splitId, paymentData }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['splitPayment', bookingId] });
      await queryClient.cancelQueries({ queryKey: ['userSplits', userId] });
      await queryClient.cancelQueries({ queryKey: ['splitStatus', bookingId] });

      // Snapshot dos valores anteriores
      const previousSplitPayment = queryClient.getQueryData<SplitPayment | null>(['splitPayment', bookingId]);
      const previousUserSplits = queryClient.getQueryData<PaymentSplit[]>(['userSplits', userId]);
      const previousStatus = queryClient.getQueryData<{ total: number; paid: number; pending: number; percentage: number }>(['splitStatus', bookingId]);

      // Optimistic update
      if (previousSplitPayment) {
        const updatedSplits = previousSplitPayment.splits.map(split =>
          split.id === splitId
            ? { ...split, status: 'paid' as const, paidAt: new Date(), paymentMethod: paymentData.method }
            : split
        );

        // Verificar se todos estão pagos
        const allPaid = updatedSplits.every(s => s.status === 'paid');
        const somePaid = updatedSplits.some(s => s.status === 'paid');

        queryClient.setQueryData<SplitPayment | null>(['splitPayment', bookingId], {
          ...previousSplitPayment,
          splits: updatedSplits,
          status: allPaid ? 'completed' : somePaid ? 'partial' : 'pending'
        });
      }

      // Atualizar userSplits otimisticamente
      if (previousUserSplits) {
        const updatedUserSplits = previousUserSplits.map(split =>
          split.id === splitId
            ? { ...split, status: 'paid' as const, paidAt: new Date(), paymentMethod: paymentData.method }
            : split
        );
        queryClient.setQueryData<PaymentSplit[]>(['userSplits', userId], updatedUserSplits);
      }

      // Atualizar status otimisticamente
      if (previousStatus && previousSplitPayment) {
        const paidAmount = previousSplitPayment.splits
          .filter(s => s.id === splitId || s.status === 'paid')
          .reduce((sum, s) => sum + s.amount, 0);
        
        queryClient.setQueryData(['splitStatus', bookingId], {
          ...previousStatus,
          paid: paidAmount,
          pending: previousStatus.total - paidAmount,
          percentage: (paidAmount / previousStatus.total) * 100
        });
      }

      return { previousSplitPayment, previousUserSplits, previousStatus };
    },
    onError: (err, variables, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousSplitPayment) {
        queryClient.setQueryData(['splitPayment', bookingId], context.previousSplitPayment);
      }
      if (context?.previousUserSplits) {
        queryClient.setQueryData(['userSplits', userId], context.previousUserSplits);
      }
      if (context?.previousStatus) {
        queryClient.setQueryData(['splitStatus', bookingId], context.previousStatus);
      }
      toast.error(err.message || 'Erro ao marcar como pago');
    },
    onSuccess: (_, variables) => {
      // Invalidar queries para refetch com dados reais
      queryClient.invalidateQueries({ queryKey: ['splitPayment', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['userSplits', userId] });
      queryClient.invalidateQueries({ queryKey: ['splitStatus', bookingId] });
      
      toast.success('Pagamento confirmado! 🎉', {
        duration: 5000
      });
    }
  });

  // Mutation: Enviar lembrete
  const sendReminder = useMutation({
    mutationFn: (splitId: string) => splitPaymentService.sendReminder(splitId),
    onSuccess: () => {
      toast.info('Lembrete enviado com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar lembrete');
    }
  });

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Obter split do usuário
   */
  const getUserSplit = (userId?: string): PaymentSplit | null => {
    if (!userId || !splitPayment) return null;
    return splitPayment.splits.find(s => s.userId === userId) || null;
  };

  /**
   * Verificar se usuário já pagou
   */
  const isPaid = (userId?: string): boolean => {
    const split = getUserSplit(userId);
    return split?.status === 'paid';
  };

  /**
   * Obter valor pendente do usuário
   */
  const getPendingAmount = (userId?: string): number => {
    const split = getUserSplit(userId);
    if (!split || split.status === 'paid') return 0;
    return split.amount;
  };

  /**
   * Obter progresso do pagamento
   */
  const getPaymentProgress = (): { percentage: number; paid: number; total: number } => {
    if (!splitStatus) {
      return { percentage: 0, paid: 0, total: 0 };
    }
    return {
      percentage: splitStatus.percentage,
      paid: splitStatus.paid,
      total: splitStatus.total
    };
  };

  /**
   * Verificar se pode enviar lembrete (rate limit: 1 por dia)
   */
  const canSendReminder = (splitId: string): boolean => {
    // TODO: Implementar verificação de rate limit (24h)
    // Por enquanto, sempre permite
    return true;
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const isLoading = isLoadingSplitPayment || isLoadingUserSplits || isLoadingStatus;
  const error = splitPaymentError || userSplitsError || statusError;

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    splitPayment: splitPayment || null,
    userSplits: userSplits || [],
    splitStatus: splitStatus || { total: 0, paid: 0, pending: 0, percentage: 0 },

    // States
    isLoading,
    error,

    // Mutations
    createSplit: createSplit.mutate,
    markAsPaid: markAsPaid.mutate,
    sendReminder: sendReminder.mutate,

    // Helpers
    getUserSplit,
    isPaid,
    getPendingAmount,
    getPaymentProgress,
    canSendReminder,

    // Loading states
    isCreating: createSplit.isPending,
    isMarkingAsPaid: markAsPaid.isPending,
    isSendingReminder: sendReminder.isPending
  };
}

