import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi, seasonsApi, calculatorApi, competitorsApi, otaApi, alertsApi } from '../api/pricing-api';
import type { PricingRule, PricingSeason, Competitor } from '../types';

// ===== Query Keys =====
export const PRICING_KEYS = {
  rules: ['pricing', 'rules'] as const,
  rule: (id: string) => ['pricing', 'rules', id] as const,
  seasons: ['pricing', 'seasons'] as const,
  season: (id: string) => ['pricing', 'seasons', id] as const,
  history: (accId: string) => ['pricing', 'history', accId] as const,
  bulkPrices: (accId: string) => ['pricing', 'bulk', accId] as const,
  competitors: ['pricing', 'competitors'] as const,
  competitor: (id: string) => ['pricing', 'competitors', id] as const,
  competitorRates: (id: string) => ['pricing', 'competitors', id, 'rates'] as const,
  comparison: (accId: string) => ['pricing', 'comparison', accId] as const,
  parity: (accId: string) => ['pricing', 'parity', accId] as const,
  alerts: ['pricing', 'alerts'] as const,
  alert: (id: string) => ['pricing', 'alerts', id] as const,
};

// ===== Query Hooks =====

// Pricing Rules
export const useRules = (params?: { accommodationId?: string; isActive?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...PRICING_KEYS.rules, params],
    queryFn: () => rulesApi.list(params),
  });

export const useRule = (id: string) =>
  useQuery({
    queryKey: PRICING_KEYS.rule(id),
    queryFn: () => rulesApi.getById(id),
    enabled: !!id,
  });

// Seasons
export const useSeasons = (params?: { type?: string; isActive?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...PRICING_KEYS.seasons, params],
    queryFn: () => seasonsApi.list(params),
  });

// Note: useSeason hook removed - seasonsApi doesn't have getById method

// Price History & Calculations
export const usePriceHistory = (
  accommodationId: string,
  params?: { startDate?: string; endDate?: string; limit?: number }
) =>
  useQuery({
    queryKey: [...PRICING_KEYS.history(accommodationId), params],
    queryFn: () => calculatorApi.history(accommodationId, params),
    enabled: !!accommodationId,
  });

export const useBulkPrices = (
  accommodationId: string,
  startDate: string,
  endDate: string
) =>
  useQuery({
    queryKey: PRICING_KEYS.bulkPrices(accommodationId),
    queryFn: () => calculatorApi.bulkCalculate({ accommodationId, startDate, endDate }),
    enabled: !!accommodationId && !!startDate && !!endDate,
  });

// Competitors
export const useCompetitors = (params?: { accommodationId?: string; platform?: string; isActive?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...PRICING_KEYS.competitors, params],
    queryFn: () => competitorsApi.list(params),
  });

export const useCompetitor = (id: string) =>
  useQuery({
    queryKey: PRICING_KEYS.competitor(id),
    queryFn: () => competitorsApi.getById(id),
    enabled: !!id,
  });

export const useCompetitorRates = (
  competitorId: string,
  params?: { startDate?: string; endDate?: string; page?: number; limit?: number }
) =>
  useQuery({
    queryKey: [...PRICING_KEYS.competitorRates(competitorId), params],
    queryFn: () => competitorsApi.rates(competitorId, params),
    enabled: !!competitorId,
  });

export const useCompetitorComparison = (
  accommodationId: string,
  checkInDate: string,
  checkOutDate: string
) =>
  useQuery({
    queryKey: [...PRICING_KEYS.comparison(accommodationId), checkInDate, checkOutDate],
    queryFn: () => competitorsApi.comparison(accommodationId, checkInDate, checkOutDate),
    enabled: !!accommodationId && !!checkInDate && !!checkOutDate,
  });

export const useRateParity = (
  accommodationId: string,
  platform?: string
) =>
  useQuery({
    queryKey: [...PRICING_KEYS.parity(accommodationId), platform],
    queryFn: () => competitorsApi.parity(accommodationId, platform),
    enabled: !!accommodationId,
  });

// Alerts
export const useAlerts = (params?: { accommodationId?: string; severity?: string; status?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...PRICING_KEYS.alerts, params],
    queryFn: () => alertsApi.list(params),
  });

export const useAlert = (id: string) =>
  useQuery({
    queryKey: PRICING_KEYS.alert(id),
    queryFn: () => alertsApi.getById(id),
    enabled: !!id,
  });

// ===== Mutation Hooks =====
const usePricingMutation = () => {
  const queryClient = useQueryClient();
  return { queryClient };
};

// Pricing Rules Mutations
export const useCreateRule = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: rulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.rules });
    },
  });
};

export const useUpdateRule = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingRule> }) =>
      rulesApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.rules });
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.rule(data.id) });
    },
  });
};

export const useDeleteRule = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.rules });
    },
  });
};

// Seasons Mutations
export const useCreateSeason = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: seasonsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.seasons });
    },
  });
};

export const useUpdateSeason = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingSeason> }) =>
      seasonsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.seasons });
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.season(data.id) });
    },
  });
};

export const useDeleteSeason = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: seasonsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.seasons });
    },
  });
};

// Price Calculation Mutations
export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: calculatorApi.calculate,
  });
};

// Competitors Mutations
export const useCreateCompetitor = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: competitorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitors });
    },
  });
};

export const useUpdateCompetitor = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Competitor> }) =>
      competitorsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitors });
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitor(data.id) });
    },
  });
};

export const useDeleteCompetitor = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: competitorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitors });
    },
  });
};

// OTA Scraper Mutations
export const useScrapeOta = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: ({ competitorId, checkIn, checkOut }: { competitorId: string; checkIn: string; checkOut: string }) =>
      otaApi.scrapeAll(competitorId, checkIn, checkOut),
    onSuccess: (data, variables) => {
      // Invalidate competitor data to update lastScrapedAt
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitors });
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitor(variables.competitorId) });
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.competitorRates(variables.competitorId) });
    },
  });
};

// Alerts Mutations
export const useAcknowledgeAlert = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: alertsApi.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.alerts });
    },
  });
};

export const useResolveAlert = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: ({ id, resolvedBy }: { id: string; resolvedBy?: string }) =>
      alertsApi.resolve(id, resolvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.alerts });
    },
  });
};

export const useDismissAlert = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: alertsApi.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.alerts });
    },
  });
};

export const useCheckAlerts = () => {
  const { queryClient } = usePricingMutation();
  return useMutation({
    mutationFn: alertsApi.check,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.alerts });
    },
  });
};