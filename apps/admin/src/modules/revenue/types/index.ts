export interface PricingRule {
  id: number;
  name: string;
  active: boolean;
  priority?: number;
  condition?: string;
  adjustment_type?: 'percent' | 'flat';
  adjustment_value?: number;
}

export interface RateCalendarEntry {
  id?: number;
  date: string;
  room_type?: string;
  rate: number;
  occupancy?: number;
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  predicted?: number;
}

export interface CompetitorRate {
  id: number;
  competitor: string;
  room_type?: string;
  rate: number;
  currency?: string;
}

export interface RevenueKPIs {
  adr: number;
  revpar: number;
  occupancy_rate: number;
  total_revenue?: number;
}
