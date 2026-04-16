import { api } from '@/src/lib/api';
import type { Automation, ChannelConfig, CommStats, Message, Template } from '../types';

type ApiList<T> = T[] | { data?: T[]; items?: T[] };

const unwrap = <T,>(response: ApiList<T>) => (Array.isArray(response) ? response : response.data ?? response.items ?? []);

export const communicationApi = {
  listTemplates: async () => unwrap(await api.get<ApiList<Template>>('/api/communication/templates')),
  getTemplate: (id: string | number) => api.get<Template>(`/api/communication/templates/${id}`),
  createTemplate: (payload: Partial<Template>) => api.post<Template>('/api/communication/templates', payload),
  updateTemplate: (id: string | number, payload: Partial<Template>) => api.put<Template>(`/api/communication/templates/${id}`, payload),
  deleteTemplate: (id: string | number) => api.delete<void>(`/api/communication/templates/${id}`),
  previewTemplate: (id: string | number, payload: Record<string, unknown>) => api.post<{ rendered: string }>(`/api/communication/templates/${id}/preview`, payload),

  listMessages: async () => unwrap(await api.get<ApiList<Message>>('/api/communication/messages')),
  getMessage: (id: string | number) => api.get<Message>(`/api/communication/messages/${id}`),
  sendMessage: (payload: unknown) => api.post<Message>('/api/communication/messages/send', payload),

  listAutomations: async () => unwrap(await api.get<ApiList<Automation>>('/api/communication/automations')),
  createAutomation: (payload: Partial<Automation>) => api.post<Automation>('/api/communication/automations', payload),
  updateAutomation: (id: string | number, payload: Partial<Automation>) => api.put<Automation>(`/api/communication/automations/${id}`, payload),

  getChannels: async () => unwrap(await api.get<ApiList<ChannelConfig>>('/api/communication/channels')),
  updateChannel: (channel: string, payload: Partial<ChannelConfig>) => api.put<ChannelConfig>(`/api/communication/channels/${channel}`, payload),

  getStats: () => api.get<CommStats>('/api/communication/stats'),
};
