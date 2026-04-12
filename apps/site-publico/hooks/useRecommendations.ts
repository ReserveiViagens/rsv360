import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations, fetchRecommendationById } from '@/services/recommendations.adapter';

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'list'],
    queryFn: fetchRecommendations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecommendation(id: string) {
  return useQuery({
    queryKey: ['recommendations', 'detail', id],
    queryFn: () => fetchRecommendationById(id),
    enabled: !!id,
  });
}