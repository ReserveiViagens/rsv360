/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GuestReservation, PortalBookingStatus } from '@/types/auth';

type BookingResponse = { booking: GuestReservation; guest: Record<string, unknown> };

export function useCheckinStatus(initialData?: PortalBookingStatus | null) {
  return useQuery({
    queryKey: ['guest-portal', 'checkin-status'],
    queryFn: async () => api.get<PortalBookingStatus>('/api/portal/checkin/status'),
    initialData: initialData || undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => api.post<BookingResponse>('/api/portal/checkin', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-portal'] });
    },
  });
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => api.post<BookingResponse>('/api/portal/checkout', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-portal'] });
    },
  });
}
