/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, safeApiGet } from '@/lib/api';
import type { GuestProfile, GuestReservation } from '@/types/auth';

type BookingResponse = { booking: GuestReservation | null; guest: GuestProfile | null };

async function fetchBooking() {
  return api.get<BookingResponse>('/api/portal/booking');
}

export function useBooking(initialData?: BookingResponse | null) {
  return useQuery({
    queryKey: ['guest-portal', 'booking'],
    queryFn: fetchBooking,
    initialData: initialData || undefined,
    staleTime: 60_000,
  });
}

export function useReservations(initialData?: GuestReservation[] | null) {
  return useQuery({
    queryKey: ['guest-portal', 'reservations'],
    queryFn: async () => {
      const booking = await safeApiGet<BookingResponse>(
        '/api/portal/booking',
        { booking: null, guest: null } as unknown as BookingResponse,
      );
      return booking.booking ? [booking.booking] : [];
    },
    initialData: initialData || undefined,
    staleTime: 60_000,
  });
}

export function useReservationUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Record<string, unknown> }) =>
      api.put(`/api/portal/reservations/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-portal'] });
    },
  });
}
