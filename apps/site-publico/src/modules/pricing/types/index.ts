// ===== Pricing Rule =====
export interface PricingRule {
  id: string;
  accommodationId: string;
  name: string;
  strategy: 'manual' | 'dynamic' | 'competitor_based' | 'seasonal' | 'demand_based' | 'ai_optimized';
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  occupancyThresholds: Record<string, unknown> | null;
  demandMultipliers: Record<string, unknown> | null;
  leadTimeRules: Record<string, unknown> | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRuleListResponse {
  rules: PricingRule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Season =====
export interface PricingSeason {
  id: string;
  name: string;
  type: 'high' | 'medium' | 'low' | 'blackout' | 'promotional';
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  fixedAdjustment: number | null;
  appliesToAccommodations: string[] | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonListResponse {
  seasons: PricingSeason[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Competitor =====
export interface Competitor {
  id: string;
  accommodationId: string;
  competitorName: string;
  platform: 'booking' | 'expedia' | 'airbnb' | 'decolar' | 'hotels_com' | 'trivago' | 'kayak' | 'google_hotels' | 'direct';
  externalUrl: string | null;
  externalId: string | null;
  location: string | null;
  starRating: number | null;
  isActive: boolean;
  lastScrapedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorListResponse {
  competitors: Competitor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== OTA Rate =====
export interface OtaRate {
  id: string;
  competitorId: string;
  platform: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string | null;
  price: number;
  originalPrice: number | null;
  currency: string;
  availability: boolean;
  occupancyEstimate: number | null;
  scrapeStatus: string;
  scrapedAt: string;
  source: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ===== Price Calculation =====
export interface PriceCalculation {
  basePrice: number;
  finalPrice: number;
  adjustments: Array<{ reason: string; type: string; value: number }>;
  strategy: string;
}

export interface BulkPriceResult {
  date: string;
  price: PriceCalculation;
}

// ===== Competitor Comparison =====
export interface CompetitorComparisonItem {
  competitorName: string;
  platform: string;
  price: number;
  currency: string;
  difference: number;
  percentDiff: number;
}

export interface CompetitorComparison {
  ourPrice: number;
  competitors: CompetitorComparisonItem[];
  cheapest: CompetitorComparisonItem | null;
  mostExpensive: CompetitorComparisonItem | null;
  average: number;
}

// ===== Rate Parity =====
export interface ParityViolation {
  date: string;
  platform: string;
  ourPrice: number;
  otaPrice: number;
  diff: number;
}

export interface RateParityReport {
  violations: ParityViolation[];
  totalViolations: number;
  complianceRate: number;
}

// ===== Pricing Alert =====
export interface PricingAlert {
  id: string;
  accommodationId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
}

export interface AlertListResponse {
  alerts: PricingAlert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Price History =====
export interface PriceHistoryEntry {
  id: string;
  accommodationId: string;
  date: string;
  price: number;
  basePrice: number;
  strategy: string | null;
  occupancyRate: number | null;
  demandScore: number | null;
  competitorAvgPrice: number | null;
  createdAt: string;
}

// ===== Competitor Rates =====
export interface CompetitorRatesResponse {
  rates: OtaRate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Pagination =====
export interface PaginationParams {
  page?: number;
  limit?: number;
}