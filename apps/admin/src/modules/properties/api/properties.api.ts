import { api } from '@/src/lib/api';
import type { ConsolidatedStats, PropertyItem, PropertyUserItem } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };
const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const propertiesApi = {
  list: async () => unwrap(await api.get<ApiList<PropertyItem>>('/api/properties')),
  get: (id: string | number) => api.get<PropertyItem>(`/api/properties/${id}`),
  create: (payload: Partial<PropertyItem>) => api.post<PropertyItem>('/api/properties', payload),
  update: (id: string | number, payload: Partial<PropertyItem>) => api.put<PropertyItem>(`/api/properties/${id}`, payload),
  delete: (id: string | number) => api.delete<void>(`/api/properties/${id}`),

  listUsers: async (id: string | number) => unwrap(await api.get<ApiList<PropertyUserItem>>(`/api/properties/${id}/users`)),
  addUser: (id: string | number, payload: Record<string, unknown>) => api.post<PropertyUserItem>(`/api/properties/${id}/users`, payload),
  updateUser: (id: string | number, userId: string | number, payload: Record<string, unknown>) => api.put<PropertyUserItem>(`/api/properties/${id}/users/${userId}`, payload),
  removeUser: (id: string | number, userId: string | number) => api.delete<void>(`/api/properties/${id}/users/${userId}`),

  stats: (id: string | number) => api.get<Record<string, number>>(`/api/properties/${id}/stats`),
  consolidated: () => api.get<ConsolidatedStats>('/api/properties/consolidated'),
};
