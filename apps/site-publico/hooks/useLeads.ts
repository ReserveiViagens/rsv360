import { useQuery } from '@tanstack/react-query';
import { fetchLeadss, fetchLeadsById } from '@/services/leads.adapter';

export function useLeadss() {
  return useQuery({
    queryKey: ['leads', 'list'],
    queryFn: fetchLeadss,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeads(id: string) {
  return useQuery({
    queryKey: ['leads', 'detail', id],
    queryFn: () => fetchLeadsById(id),
    enabled: !!id,
  });
}