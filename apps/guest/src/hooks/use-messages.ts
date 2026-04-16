/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GuestMessage } from '@/types/message';
import type { PortalFeedback, PortalRequest } from '@/types/auth';

function mapRequestsAndFeedback(requests: PortalRequest[], feedback: PortalFeedback[] | null): GuestMessage[] {
  const requestMessages = requests.map((request) => ({
    id: String(request.id),
    author: 'guest' as const,
    message: request.description || `Solicitação ${request.type}`,
    createdAt: request.created_at || new Date().toISOString(),
    status: request.status,
  }));

  const feedbackMessages =
    feedback?.map((item) => ({
      id: `feedback-${item.id}`,
      author: 'guest' as const,
      message: item.comment || `Feedback com nota ${item.overall_rating || 0}`,
      createdAt: item.created_at || new Date().toISOString(),
      status: item.is_published ? 'published' : 'draft',
    })) || [];

  return [...requestMessages, ...feedbackMessages].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function useMessages() {
  return useQuery({
    queryKey: ['guest-portal', 'messages'],
    queryFn: async () => {
      const [requests, feedback] = await Promise.all([
        api.get<PortalRequest[]>('/api/portal/requests'),
        api.get<PortalFeedback[]>('/api/portal/feedback').catch(() => [] as PortalFeedback[]),
      ]);

      return mapRequestsAndFeedback(requests, feedback);
    },
    initialData: [] as GuestMessage[],
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { message: string }) =>
      api.post('/api/portal/requests', {
        type: 'other',
        description: payload.message,
        priority: 'medium',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-portal', 'messages'] });
    },
  });
}
