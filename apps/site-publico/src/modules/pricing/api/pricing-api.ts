import type {
  PricingRule, PricingRuleListResponse,
  PricingSeason, SeasonListResponse,
  Competitor, CompetitorListResponse,
  OtaRate, PriceCalculation, BulkPriceResult,
  CompetitorComparison, RateParityReport,
  PricingAlert, AlertListResponse,
  PriceHistoryEntry, CompetitorRatesResponse,
} from '../types';

const API_BASE = '/api/v1/pricing';

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

function qs(params?: Record<string, unknown>): string {
  if (!params) return '';
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return filtered.length ? '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])) : '';
}

// ===== Pricing Rules =====
export const rulesApi = {
  list: (params?: { accommodationId?: string; isActive?: string; page?: number; limit?: number }) =>
    request<PricingRuleListResponse>(`/pricing/rules${qs(params)}`),
  getById: (id: string) => request<PricingRule>(`/pricing/rules/${id}`),
  create: (data: Partial<PricingRule>) => request<PricingRule>('/pricing/rules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PricingRule>) => request<PricingRule>(`/pricing/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/pricing/rules/${id}`, { method: 'DELETE' }),
};

// ===== Seasons =====
export const seasonsApi = {
  list: (params?: { type?: string; isActive?: string; page?: number; limit?: number }) =>
    request<SeasonListResponse>(`/pricing/seasons${qs(params)}`),
  create: (data: Partial<PricingSeason>) => request<PricingSeason>('/pricing/seasons', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PricingSeason>) => request<PricingSeason>(`/pricing/seasons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/pricing/seasons/${id}`, { method: 'DELETE' }),
};

// ===== Price Calculation =====
export const calculatorApi = {
  calculate: (data: { accommodationId: string; date: string; occupancyRate?: number; demandScore?: number; competitorAvgPrice?: number }) =>
    request<PriceCalculation>('/pricing/calculate', { method: 'POST', body: JSON.stringify(data) }),
  bulkCalculate: (data: { accommodationId: string; startDate: string; endDate: string }) =>
    request<BulkPriceResult[]>('/pricing/calculate/bulk', { method: 'POST', body: JSON.stringify(data) }),
  history: (accommodationId: string, params?: { startDate?: string; endDate?: string; limit?: number }) =>
    request<{ history: PriceHistoryEntry[]; total: number }>(`/pricing/history/${accommodationId}${qs(params)}`),
};

// ===== Competitors =====
export const competitorsApi = {
  list: (params?: { accommodationId?: string; platform?: string; isActive?: string; page?: number; limit?: number }) =>
    request<CompetitorListResponse>(`/competitors${qs(params)}`),
  getById: (id: string) => request<Competitor>(`/competitors/${id}`),
  create: (data: Partial<Competitor>) => request<Competitor>('/competitors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Competitor>) => request<Competitor>(`/competitors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/competitors/${id}`, { method: 'DELETE' }),
  rates: (id: string, params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    request<CompetitorRatesResponse>(`/competitors/${id}/rates${qs(params)}`),
  comparison: (accommodationId: string, checkInDate: string, checkOutDate: string) =>
    request<CompetitorComparison>(`/competitors/comparison/${accommodationId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`),
  parity: (accommodationId: string, platform?: string) =>
    request<RateParityReport>(`/competitors/parity/${accommodationId}${platform ? '?platform=' + platform : ''}`),
};

// ===== OTA Scraper =====
export const otaApi = {
  scrapeAll: (competitorId: string, checkIn: string, checkOut: string) =>
    request<ScrapeResult>(`/ota/scrape/${competitorId}`, { method: 'POST', body: JSON.stringify({ checkIn, checkOut }) }),
  scrapePlatform: (competitorId: string, platform: string, checkIn: string, checkOut: string) =>
    request(`/ota/scrape/${competitorId}/${platform}`, { method: 'POST', body: JSON.stringify({ checkIn, checkOut }) }),
};

// ===== Alerts =====
export const alertsApi = {
  list: (params?: { accommodationId?: string; severity?: string; status?: string; page?: number; limit?: number }) =>
    request<AlertListResponse>(`/alerts${qs(params)}`),
  getById: (id: string) => request<PricingAlert>(`/alerts/${id}`),
  acknowledge: (id: string) => request(`/alerts/${id}/acknowledge`, { method: 'POST' }),
  resolve: (id: string, resolvedBy?: string) =>
    request(`/alerts/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolvedBy }) }),
  dismiss: (id: string) => request(`/alerts/${id}/dismiss`, { method: 'POST' }),
  check: (accommodationId: string) =>
    request(`/alerts/check/${accommodationId}`, { method: 'POST' }),
};