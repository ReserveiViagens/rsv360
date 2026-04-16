import {
  Campaign,
  CampaignListResponse,
  CampaignStats,
  Broadcast,
  BroadcastListResponse,
  Funnel,
  FunnelListResponse,
  WhatsappTemplate,
  WhatsappConversation,
  WhatsappConversationListResponse,
  WhatsappMessage,
  WhatsappMessageListResponse,
  AbTest,
  AbTestListResponse,
  DashboardOverview,
  MetricPoint,
  ChannelMetrics,
  PaginationParams,
} from '../types';

const API_BASE = '/api/v1/mkt';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// ===== Campaigns =====

export const campaignsApi = {
  list: (params?: { status?: string; type?: string; search?: string; page?: number; limit?: number }) =>
    request<CampaignListResponse>(`/campaigns?${new URLSearchParams(params as Record<string, string>)}`),
  getById: (id: string) => request<Campaign>(`/campaigns/${id}`),
  create: (data: Partial<Campaign>) => request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Campaign>) => request<Campaign>(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/campaigns/${id}`, { method: 'DELETE' }),
  duplicate: (id: string) => request<Campaign>(`/campaigns/${id}/duplicate`, { method: 'POST' }),
  stats: (params?: { startDate?: string; endDate?: string }) =>
    request<CampaignStats>(`/campaigns/stats?${new URLSearchParams(params as Record<string, string>)}`),
};

// ===== Broadcasts =====

export const broadcastsApi = {
  list: (params?: { status?: string; channel?: string; page?: number; limit?: number }) =>
    request<BroadcastListResponse>(`/broadcasts?${new URLSearchParams(params as Record<string, string>)}`),
  getById: (id: string) => request<Broadcast>(`/broadcasts/${id}`),
  create: (data: Partial<Broadcast>) => request<Broadcast>('/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Broadcast>) => request<Broadcast>(`/broadcasts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  schedule: (id: string, scheduledAt: string) => request(`/broadcasts/${id}/schedule`, { method: 'POST', body: JSON.stringify({ scheduledAt }) }),
  execute: (id: string, recipientIds: string[]) => request(`/broadcasts/${id}/execute`, { method: 'POST', body: JSON.stringify({ recipientIds }) }),
  stats: () => request(`/broadcasts/stats`),
};

// ===== Funnels =====

export const funnelsApi = {
  list: (params?: { isActive?: string; page?: number; limit?: number }) =>
    request<FunnelListResponse>(`/funnels?${new URLSearchParams(params as Record<string, string>)}`),
  getById: (id: string) => request<Funnel>(`/funnels/${id}`),
  create: (data: Partial<Funnel>) => request<Funnel>('/funnels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Funnel>) => request<Funnel>(`/funnels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/funnels/${id}`, { method: 'DELETE' }),
  addLead: (id: string, leadId: string, initialStageId?: string) =>
    request(`/funnels/${id}/leads`, { method: 'POST', body: JSON.stringify({ leadId, initialStageId }) }),
  report: (id: string) => request(`/funnels/${id}/report`),
};

// ===== WhatsApp =====

export const whatsappApi = {
  templates: {
    list: (params?: { status?: string; page?: number; limit?: number }) =>
      request(`/whatsapp/templates?${new URLSearchParams(params as Record<string, string>)}`),
    create: (data: Partial<WhatsappTemplate>) => request('/whatsapp/templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<WhatsappTemplate>) => request(`/whatsapp/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/whatsapp/templates/${id}`, { method: 'DELETE' }),
  },
  conversations: {
    list: (params?: { isActive?: string; search?: string; page?: number; limit?: number }) =>
      request<WhatsappConversationListResponse>(`/whatsapp/conversations?${new URLSearchParams(params as Record<string, string>)}`),
    getOrCreate: (leadId: string, phone: string) =>
      request<WhatsappConversation>('/whatsapp/conversations', { method: 'POST', body: JSON.stringify({ leadId, phone }) }),
    close: (id: string) => request(`/whatsapp/conversations/${id}/close`, { method: 'POST' }),
  },
  messages: {
    list: (conversationId: string, params?: { page?: number; limit?: number }) =>
      request<WhatsappMessageListResponse>(`/whatsapp/conversations/${conversationId}/messages?${new URLSearchParams(params as Record<string, string>)}`),
    send: (conversationId: string, data: { content: string; type?: string; templateId?: string }) =>
      request<WhatsappMessage>(`/whatsapp/conversations/${conversationId}/messages/send`, { method: 'POST', body: JSON.stringify(data) }),
  },
};

// ===== A/B Tests =====

export const abTestsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    request<AbTestListResponse>(`/ab-tests?${new URLSearchParams(params as Record<string, string>)}`),
  getById: (id: string) => request<AbTest>(`/ab-tests/${id}`),
  create: (data: Partial<AbTest>) => request<AbTest>('/ab-tests', { method: 'POST', body: JSON.stringify(data) }),
  start: (id: string) => request(`/ab-tests/${id}/start`, { method: 'POST' }),
  pause: (id: string) => request(`/ab-tests/${id}/pause`, { method: 'POST' }),
  resume: (id: string) => request(`/ab-tests/${id}/resume`, { method: 'POST' }),
  complete: (id: string, results: unknown) => request(`/ab-tests/${id}/complete`, { method: 'POST', body: JSON.stringify({ results }) }),
  cancel: (id: string) => request(`/ab-tests/${id}/cancel`, { method: 'POST' }),
  stats: () => request(`/ab-tests/stats`),
};

// ===== Analytics =====

export const analyticsApi = {
  dashboard: (params?: { startDate?: string; endDate?: string }) =>
    request<DashboardOverview>(`/analytics/dashboard?${new URLSearchParams(params as Record<string, string>)}`),
  campaignPerformance: (campaignId: string) => request(`/analytics/campaigns/${campaignId}`),
  channels: (params?: { startDate?: string; endDate?: string }) =>
    request<{ channels: ChannelMetrics[] }>(`/analytics/channels?${new URLSearchParams(params as Record<string, string>)}`),
  timeseries: (metric: string, params?: { startDate?: string; endDate?: string; granularity?: string }) =>
    request<{ series: MetricPoint[] }>(`/analytics/timeseries?metric=${metric}&${new URLSearchParams(params as Record<string, string>)}`),
  attribution: (params?: { startDate?: string; endDate?: string; model?: string }) =>
    request(`/analytics/attribution?${new URLSearchParams(params as Record<string, string>)}`),
};