import { useQuery } from '@tanstack/react-query';
import { fetchTravels, fetchTravelById } from '@/services/travel.adapter';

export function useTravels() {
  return useQuery({
    queryKey: ['travel', 'list'],
    queryFn: fetchTravels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTravel(id: string) {
  return useQuery({
    queryKey: ['travel', 'detail', id],
    queryFn: () => fetchTravelById(id),
    enabled: !!id,
  });
}