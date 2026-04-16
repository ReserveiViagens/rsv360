import { api } from '@/src/lib/api';
import type { Campaign, GuestProfile, GuestTimelineItem, LoyaltyMember, LoyaltyProgram, LoyaltyTransaction, CRMStats, Segment } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };
const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const crmApi = {
  listGuests: async () => unwrap(await api.get<ApiList<GuestProfile>>('/api/crm/guests')),
  getGuest: (id: string | number) => api.get<GuestProfile>(`/api/crm/guests/${id}`),
  createGuest: (payload: Partial<GuestProfile>) => api.post<GuestProfile>('/api/crm/guests', payload),
  updateGuest: (id: string | number, payload: Partial<GuestProfile>) => api.put<GuestProfile>(`/api/crm/guests/${id}`, payload),
  searchGuests: async (query: string) => unwrap(await api.get<ApiList<GuestProfile>>(`/api/crm/guests/search?q=${encodeURIComponent(query)}`)),
  getGuestTimeline: async (id: string | number) => unwrap(await api.get<ApiList<GuestTimelineItem>>(`/api/crm/guests/${id}/timeline`)),
  mergeGuests: (payload: Record<string, unknown>) => api.post('/api/crm/guests/merge', payload),
  listSegments: async () => unwrap(await api.get<ApiList<Segment>>('/api/crm/segments')),

  getProgram: () => api.get<LoyaltyProgram>('/api/crm/loyalty/program'),
  saveProgram: (payload: Partial<LoyaltyProgram>) => api.post<LoyaltyProgram>('/api/crm/loyalty/program', payload),
  listMembers: async () => unwrap(await api.get<ApiList<LoyaltyMember>>('/api/crm/loyalty/members')),
  getMember: (id: string | number) => api.get<LoyaltyMember>(`/api/crm/loyalty/members/${id}`),
  getStatement: async (id: string | number) => unwrap(await api.get<ApiList<LoyaltyTransaction>>(`/api/crm/loyalty/members/${id}/statement`)),
  earnPoints: (id: string | number, payload: Record<string, unknown>) => api.post(`/api/crm/loyalty/members/${id}/earn`, payload),
  redeemPoints: (id: string | number, payload: Record<string, unknown>) => api.post(`/api/crm/loyalty/members/${id}/redeem`, payload),

  listCampaigns: async () => unwrap(await api.get<ApiList<Campaign>>('/api/crm/campaigns')),
  getCampaign: (id: string | number) => api.get<Campaign>(`/api/crm/campaigns/${id}`),
  createCampaign: (payload: Partial<Campaign>) => api.post<Campaign>('/api/crm/campaigns', payload),
  updateCampaign: (id: string | number, payload: Partial<Campaign>) => api.put<Campaign>(`/api/crm/campaigns/${id}`, payload),
  sendCampaign: (id: string | number) => api.post(`/api/crm/campaigns/${id}/send`, {}),
  getCampaignStats: (id: string | number) => api.get<Record<string, number>>(`/api/crm/campaigns/${id}/stats`),

  getStats: () => api.get<CRMStats>('/api/crm/stats'),
};
