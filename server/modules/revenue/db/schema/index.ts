export interface RuleCondition {
  occupancy_min?: number;
  occupancy_max?: number;
  days?: number[];
  season_name?: string;
  date_ranges?: Array<{ start: string; end: string }>;
  min_advance_days?: number;
  max_advance_days?: number;
  min_nights?: number;
  max_nights?: number;
  event_name?: string;
}

export interface PricingRule {
  id: number;
  name: string;
  description?: string;
  rule_type: 'OCCUPANCY' | 'DAY_OF_WEEK' | 'SEASONAL' | 'ADVANCE' | 'LENGTH_OF_STAY' | 'LAST_MINUTE' | 'EVENT';
  conditions: RuleCondition;
  adjustment_type: 'percentage' | 'fixed';
  adjustment_value: number;
  priority: number;
  is_active: boolean;
  room_type_id?: number;
  channel?: string;
  valid_from?: string;
  valid_until?: string;
  property_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AppliedRule {
  rule_id: number;
  rule_name: string;
  rule_type: string;
  adjustment: number;
  price_before: number;
  price_after: number;
}

export interface RateCalendarEntry {
  id: number;
  room_type_id: number;
  room_type_name?: string;
  date: string;
  base_price: number;
  calculated_price: number;
  manual_override: boolean;
  override_price?: number | null;
  final_price: number;
  occupancy_rate?: number;
  applied_rules?: AppliedRule[];
  min_stay?: number;
  max_stay?: number;
  closed_to_arrival?: boolean;
  closed_to_departure?: boolean;
  stop_sell?: boolean;
  property_id?: number;
  updated_at: string;
}

export interface DemandForecast {
  id: number;
  date: string;
  room_type_id?: number;
  predicted_occupancy: number;
  predicted_demand: number;
  confidence: number;
  historical_occupancy?: number;
  seasonality_factor: number;
  day_of_week_factor: number;
  trend_factor: number;
  events?: string[];
  property_id?: number;
  generated_at: string;
}

export interface CompetitorRate {
  id: number;
  competitor_name: string;
  room_type_equivalent?: string;
  date: string;
  price: number;
  currency: string;
  source: 'manual' | 'scraping' | 'api';
  url?: string;
  notes?: string;
  property_id?: number;
  captured_at: string;
}

export interface RevenueKPIs {
  period: { start: string; end: string };
  adr: number;
  revpar: number;
  occupancy_rate: number;
  total_revenue: number;
  rooms_sold: number;
  rooms_available: number;
  goppar?: number;
  alos: number;
  booking_lead_time: number;
  cancellation_rate: number;
  previous_period?: {
    adr: number;
    revpar: number;
    occupancy_rate: number;
    total_revenue: number;
  };
  adr_change?: number;
  revpar_change?: number;
  occupancy_change?: number;
  revenue_change?: number;
}
