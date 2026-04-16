import { api } from '@/src/lib/api';
import type { CompetitorRate, ForecastPoint, PricingRule, RateCalendarEntry, RevenueKPIs } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };
const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const revenueApi = {
  listRules: async () => unwrap(await api.get<ApiList<PricingRule>>('/api/revenue/rules')),
  createRule: (payload: Partial<PricingRule>) => api.post<PricingRule>('/api/revenue/rules', payload),
  updateRule: (id: number | string, payload: Partial<PricingRule>) => api.put<PricingRule>(`/api/revenue/rules/${id}`, payload),
  deleteRule: (id: number | string) => api.delete<void>(`/api/revenue/rules/${id}`),
  reorderRules: (payload: { ids: number[] }) => api.post('/api/revenue/rules/reorder', payload),

  getCalendar: async () => unwrap(await api.get<ApiList<RateCalendarEntry>>('/api/revenue/calendar')),
  bulkUpdateCalendar: (payload: Record<string, unknown>) => api.put('/api/revenue/calendar/bulk', payload),
  calculatePrice: (payload: Record<string, unknown>) => api.post<{ price: number }>('/api/revenue/calculate', payload),

  getForecast: async () => unwrap(await api.get<ApiList<ForecastPoint>>('/api/revenue/forecast')),
  generateForecast: (payload: Record<string, unknown>) => api.post('/api/revenue/forecast/generate', payload),

  listCompetitors: async () => unwrap(await api.get<ApiList<CompetitorRate>>('/api/revenue/competitors')),
  createCompetitor: (payload: Partial<CompetitorRate>) => api.post<CompetitorRate>('/api/revenue/competitors', payload),

  getKPIs: () => api.get<RevenueKPIs>('/api/revenue/kpis'),
  getStats: () => api.get<Record<string, number>>('/api/revenue/stats'),
};
