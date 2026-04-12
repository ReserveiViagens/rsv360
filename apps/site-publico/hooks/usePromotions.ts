import { useQuery } from '@tanstack/react-query';
import { fetchPromotions, fetchPromotionById } from '@/services/promotions.adapter';

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions', 'list'],
    queryFn: fetchPromotions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePromotion(id: string) {
  return useQuery({
    queryKey: ['promotions', 'detail', id],
    queryFn: () => fetchPromotionById(id),
    enabled: !!id,
  });
}