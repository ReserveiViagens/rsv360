import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../api/crm.api';

export function useGuests() {
  return useQuery({ queryKey: ['crm', 'guests'], queryFn: crmApi.listGuests });
}

export function useGuest(id?: string) {
  return useQuery({ queryKey: ['crm', 'guests', id], queryFn: () => crmApi.getGuest(String(id)), enabled: Boolean(id) });
}

export function useGuestSearch(query: string) {
  return useQuery({ queryKey: ['crm', 'guests', 'search', query], queryFn: () => crmApi.searchGuests(query), enabled: query.length > 1 });
}

export function useGuestTimeline(id?: string) {
  return useQuery({ queryKey: ['crm', 'guests', id, 'timeline'], queryFn: () => crmApi.getGuestTimeline(String(id)), enabled: Boolean(id) });
}

export function useSegments() {
  return useQuery({ queryKey: ['crm', 'segments'], queryFn: crmApi.listSegments });
}

export function useProgram() {
  return useQuery({ queryKey: ['crm', 'program'], queryFn: crmApi.getProgram });
}

export function useSaveProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmApi.saveProgram,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['crm', 'program'] });
    },
  });
}

export function useMembers() {
  return useQuery({ queryKey: ['crm', 'members'], queryFn: crmApi.listMembers });
}

export function useMember(id?: string) {
  return useQuery({ queryKey: ['crm', 'members', id], queryFn: () => crmApi.getMember(String(id)), enabled: Boolean(id) });
}

export function useStatement(id?: string) {
  return useQuery({ queryKey: ['crm', 'members', id, 'statement'], queryFn: () => crmApi.getStatement(String(id)), enabled: Boolean(id) });
}

export function useCampaigns() {
  return useQuery({ queryKey: ['crm', 'campaigns'], queryFn: crmApi.listCampaigns });
}

export function useCampaign(id?: string) {
  return useQuery({ queryKey: ['crm', 'campaigns', id], queryFn: () => crmApi.getCampaign(String(id)), enabled: Boolean(id) });
}

export function useCampaignStats(id?: string | number) {
  return useQuery({ queryKey: ['crm', 'campaigns', id, 'stats'], queryFn: () => crmApi.getCampaignStats(String(id)), enabled: Boolean(id) });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['crm', 'campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => crmApi.updateCampaign(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['crm', 'campaigns'] });
    },
  });
}

export function useCRMStats() {
  return useQuery({ queryKey: ['crm', 'stats'], queryFn: crmApi.getStats });
}
