/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GuestProfile, GuestReservation } from '@/types/auth';

type BookingResponse = { booking: GuestReservation; guest: GuestProfile };

export function useProfile(initialData?: GuestProfile | null) {
  return useQuery({
    queryKey: ['guest-portal', 'profile'],
    queryFn: async () => {
      try {
        return await api.get<GuestProfile>('/api/guest-portal/profile');
      } catch {
        const booking = await api.get<BookingResponse>('/api/portal/booking');
        return booking.guest || booking.booking?.guest || null;
      }
    },
    initialData: initialData || undefined,
    staleTime: 60_000,
  });
}

export function useProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GuestProfile) => {
      try {
        return await api.put<GuestProfile>('/api/guest-portal/profile', payload);
      } catch {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('rsv360_guest_profile', JSON.stringify(payload));
        }
        return payload;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-portal', 'profile'] });
    },
  });
}
