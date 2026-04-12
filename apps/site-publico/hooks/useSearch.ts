import { useQuery } from '@tanstack/react-query';
import { fetchSearchs, fetchSearchById } from '@/services/search.adapter';

export function useSearchs() {
  return useQuery({
    queryKey: ['search', 'list'],
    queryFn: fetchSearchs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearch(id: string) {
  return useQuery({
    queryKey: ['search', 'detail', id],
    queryFn: () => fetchSearchById(id),
    enabled: !!id,
  });
}