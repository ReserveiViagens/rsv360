import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, broadcastsApi, funnelsApi, whatsappApi, abTestsApi, analyticsApi } from '../api/marketing-api';
import type {
  Campaign, CampaignListResponse, CampaignStats,
  Broadcast, BroadcastListResponse,
  Funnel, FunnelListResponse,
  AbTest, AbTestListResponse, DashboardOverview, MetricPoint,
} from '../types';

export const MKT_KEYS = {
  campaigns: ['mkt', 'campaigns'] as const,
  campaign: (id: string) => ['mkt', 'campaigns', id] as const,
  campaignStats: ['mkt', 'campaigns', 'stats'] as const,
  broadcasts: ['mkt', 'broadcasts'] as const,
  broadcast: (id: string) => ['mkt', 'broadcasts', id] as const,
  broadcastStats: ['mkt', 'broadcasts', 'stats'] as const,
  funnels: ['mkt', 'funnels'] as const,
  funnel: (id: string) => ['mkt', 'funnels', id] as const,
  funnelReport: (id: string) => ['mkt', 'funnels', id, 'report'] as const,
  whatsappTemplates: ['mkt', 'whatsapp', 'templates'] as const,
  whatsappConversations: ['mkt', 'whatsapp', 'conversations'] as const,
  whatsappMessages: (convId: string) => ['mkt', 'whatsapp', 'messages', convId] as const,
  abTests: ['mkt', 'ab-tests'] as const,
  abTest: (id: string) => ['mkt', 'ab-tests', id] as const,
  abTestStats: ['mkt', 'ab-tests', 'stats'] as const,
  dashboard: ['mkt', 'analytics', 'dashboard'] as const,
  timeseries: (metric: string) => ['mkt', 'analytics', 'timeseries', metric] as const,
  channels: ['mkt', 'analytics', 'channels'] as const,
  attribution: ['mkt', 'analytics', 'attribution'] as const,
};

// ===== Campaigns =====

export function useCampaigns(params?: { status?: string; type?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MKT_KEYS.campaigns, params],
    queryFn: () => campaignsApi.list(params),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: MKT_KEYS.campaign(id),
    queryFn: () => campaignsApi.getById(id),
    enabled: !!id,
  });
}

export function useCampaignStats(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [...MKT_KEYS.campaignStats, params],
    queryFn: () => campaignsApi.stats(params),
  });
}

// ===== Broadcasts =====

export function useBroadcasts(params?: { status?: string; channel?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MKT_KEYS.broadcasts, params],
    queryFn: () => broadcastsApi.list(params),
  });
}

export function useBroadcast(id: string) {
  return useQuery({
    queryKey: MKT_KEYS.broadcast(id),
    queryFn: () => broadcastsApi.getById(id),
    enabled: !!id,
  });
}

// ===== Funnels =====

export function useFunnels(params?: { isActive?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MKT_KEYS.funnels, params],
    queryFn: () => funnelsApi.list(params),
  });
}

export function useFunnelReport(id: string) {
  return useQuery({
    queryKey: MKT_KEYS.funnelReport(id),
    queryFn: () => funnelsApi.report(id),
    enabled: !!id,
  });
}

// ===== WhatsApp =====

export function useWhatsappTemplates(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MKT_KEYS.whatsappTemplates, params],
    queryFn: () => whatsappApi.templates.list(params),
  });
}

// ===== A/B Tests =====

export function useAbTests(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MKT_KEYS.abTests, params],
    queryFn: () => abTestsApi.list(params),
  });
}

export function useAbTest(id: string) {
  return useQuery({
    queryKey: MKT_KEYS.abTest(id),
    queryFn: () => abTestsApi.getById(id),
    enabled: !!id,
  });
}

export function useAbTestStats() {
  return useQuery({
    queryKey: MKT_KEYS.abTestStats,
    queryFn: () => abTestsApi.stats(),
  });
}

// ===== A/B Test Mutations =====

export function useCreateAbTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AbTest>) => abTestsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTests });
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTestStats });
    },
  });
}

export function useStartAbTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => abTestsApi.start(id),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTests });
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTest(id as string) });
    },
  });
}

export function usePauseAbTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => abTestsApi.pause(id),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTests });
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTest(id as string) });
    },
  });
}

export function useResumeAbTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => abTestsApi.resume(id),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTests });
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTest(id as string) });
    },
  });
}

export function useCompleteAbTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, results }: { id: string; results: unknown }) => abTestsApi.complete(id, results),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTests });
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTest(id as string) });
    },
  });
}

export function useCancelAbTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => abTestsApi.cancel(id),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTests });
      qc.invalidateQueries({ queryKey: MKT_KEYS.abTest(id as string) });
    },
  });
}
// ===== Campaign Mutations =====

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Campaign>) => campaignsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.campaigns });
      qc.invalidateQueries({ queryKey: MKT_KEYS.campaignStats });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) => campaignsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.campaigns });
      qc.invalidateQueries({ queryKey: MKT_KEYS.campaign(id) });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.campaigns }),
  });
}

export function useDuplicateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.campaigns }),
  });
}

// ===== Broadcast Mutations =====

export function useCreateBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Broadcast>) => broadcastsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.broadcasts }),
  });
}

export function useScheduleBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) => broadcastsApi.schedule(id, scheduledAt),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.broadcasts }),
  });
}

export function useExecuteBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, recipientIds }: { id: string; recipientIds: string[] }) => broadcastsApi.execute(id, recipientIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.broadcasts }),
  });
}

// ===== Funnel Mutations =====

export function useCreateFunnel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Funnel>) => funnelsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.funnels }),
  });
}

export function useDeleteFunnel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => funnelsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MKT_KEYS.funnels }),
  });
}

// ===== WhatsApp Mutations =====

// ===== Analytics =====

export function useDashboardOverview(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [...MKT_KEYS.dashboard, params],
    queryFn: () => analyticsApi.dashboard(params),
  });
}

export function useTimeseries(metric: string, params?: { startDate?: string; endDate?: string; granularity?: string }) {
  return useQuery({
    queryKey: [...MKT_KEYS.timeseries(metric), params],
    queryFn: () => analyticsApi.timeseries(metric, params),
    enabled: !!metric,
  });
}

export function useChannelBreakdown(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [...MKT_KEYS.channels, params],
    queryFn: () => analyticsApi.channels(params),
  });
}

// ===== WhatsApp =====

export function useWhatsappConversations() {
  return useQuery({
    queryKey: MKT_KEYS.whatsappConversations,
    queryFn: () => whatsappApi.conversations.list(),
  });
}

export function useWhatsappMessages(conversationId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MKT_KEYS.whatsappMessages(conversationId), params],
    queryFn: () => whatsappApi.messages.list(conversationId, params),
    enabled: !!conversationId,
  });
}

export function useSendWhatsappMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: { content: string; type?: string; templateId?: string } }) =>
      whatsappApi.messages.send(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: MKT_KEYS.whatsappMessages(conversationId) });
    },
  });
}