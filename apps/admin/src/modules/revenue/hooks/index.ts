import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { revenueApi } from '../api/revenue.api';

export function usePricingRules() {
  return useQuery({ queryKey: ['revenue', 'rules'], queryFn: revenueApi.listRules });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revenueApi.createRule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['revenue'] });
    },
  });
}

export function useRateCalendar() {
  return useQuery({ queryKey: ['revenue', 'calendar'], queryFn: revenueApi.getCalendar });
}

export function useForecast() {
  return useQuery({ queryKey: ['revenue', 'forecast'], queryFn: revenueApi.getForecast });
}

export function useCompetitors() {
  return useQuery({ queryKey: ['revenue', 'competitors'], queryFn: revenueApi.listCompetitors });
}

export function useRevenueKPIs() {
  return useQuery({ queryKey: ['revenue', 'kpis'], queryFn: revenueApi.getKPIs });
}
