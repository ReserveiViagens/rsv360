/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SERVICE_CATALOG } from '@/lib/static-data';
import type { GuestService, ServiceRequestPayload } from '@/types/service';

export function useServices() {
  return useQuery({
    queryKey: ['guest-portal', 'services'],
    queryFn: async () => {
      try {
        return await api.get<GuestService[]>('/api/guest-portal/services');
      } catch {
        return SERVICE_CATALOG;
      }
    },
    initialData: SERVICE_CATALOG,
    staleTime: 5 * 60_000,
  });
}

export function useServiceRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ServiceRequestPayload) =>
      api.post('/api/portal/requests', {
        type: payload.type,
        description: payload.description,
        priority: payload.priority || 'medium',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-portal', 'messages'] });
      void queryClient.invalidateQueries({ queryKey: ['guest-portal', 'requests'] });
    },
  });
}
