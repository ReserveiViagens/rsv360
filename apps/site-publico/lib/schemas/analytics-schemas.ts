/**
 * Schemas Zod para Analytics
 * Validação de dados de entrada para APIs de Analytics
 */

import { z } from 'zod';

// ============================================
// REVENUE FORECAST SCHEMAS
// ============================================

export const RevenueForecastQuerySchema = z.object({
  months: z.number().int().positive().max(24).optional().default(12),
  property_id: z.number().int().positive().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const RevenueForecastResponseSchema = z.object({
  historical: z.array(z.object({
    month: z.string(),
    revenue: z.number().nonnegative(),
    bookings_count: z.number().int().nonnegative(),
  })),
  forecasts: z.array(z.object({
    month: z.string(),
    forecasted_revenue: z.number().nonnegative(),
    confidence: z.number().min(0).max(1),
    growth_rate: z.number(),
    seasonal_factor: z.number().positive(),
  })),
  average_revenue: z.number().nonnegative(),
  growth_rate: z.number(),
  months_ahead: z.number().int().positive(),
});

// ============================================
// DEMAND HEATMAP SCHEMAS
// ============================================

export const DemandHeatmapQuerySchema = z.object({
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  property_id: z.number().int().positive().optional(),
  group_by: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export const DemandHeatmapResponseSchema = z.object({
  heatmap: z.array(z.object({
    date: z.string().date(),
    bookings: z.number().int().nonnegative(),
    revenue: z.number().nonnegative(),
    avg_value: z.number().nonnegative(),
    demand_level: z.number().int().min(0).max(100),
    intensity: z.enum(['low', 'medium', 'high']),
  })),
  max_demand: z.number().int().nonnegative(),
  date_range: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }),
});

// ============================================
// COMPETITOR BENCHMARK SCHEMAS
// ============================================

export const CompetitorBenchmarkQuerySchema = z.object({
  property_id: z.number().int().positive(),
  competitor_names: z.array(z.string()).optional(),
  date_range: z.object({
    start: z.string().date(),
    end: z.string().date(),
  }).optional(),
});

export const CompetitorBenchmarkResponseSchema = z.object({
  property: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    current_price: z.number().nonnegative(),
    avg_booking_value: z.number().nonnegative(),
    total_bookings: z.number().int().nonnegative(),
    avg_rating: z.number().min(0).max(5),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    avg_price: z.number().nonnegative(),
    min_price: z.number().nonnegative(),
    max_price: z.number().nonnegative(),
    data_points: z.number().int().nonnegative(),
  })),
  benchmarking: z.object({
    market_avg_price: z.number().nonnegative(),
    price_position: z.enum(['above', 'below', 'competitive']),
    price_difference_percent: z.number(),
    recommendation: z.string(),
  }),
});

// ============================================
// ANALYTICS INSIGHTS SCHEMAS
// ============================================

export const AnalyticsInsightsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  property_id: z.number().int().positive().optional(),
  insight_types: z.array(z.enum([
    'revenue',
    'occupancy',
    'pricing',
    'demand',
    'competition',
    'performance',
  ])).optional(),
});

export const InsightSchema = z.object({
  id: z.string(),
  type: z.enum(['revenue', 'occupancy', 'pricing', 'demand', 'competition', 'performance']),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  recommendation: z.string().optional(),
  metrics: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
});

export const AnalyticsInsightsResponseSchema = z.object({
  insights: z.array(InsightSchema),
  summary: z.object({
    total_insights: z.number().int().nonnegative(),
    critical_count: z.number().int().nonnegative(),
    warning_count: z.number().int().nonnegative(),
    info_count: z.number().int().nonnegative(),
  }),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

// ============================================
// DASHBOARD SCHEMAS
// ============================================

export const AnalyticsDashboardQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  property_id: z.number().int().positive().optional(),
  group_by: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export const KPISchema = z.object({
  totalRevenue: z.number().nonnegative(),
  totalBookings: z.number().int().nonnegative(),
  avgOccupancy: z.number().min(0).max(100),
  avgBookingValue: z.number().nonnegative(),
});

export const RevenueDataSchema = z.object({
  date: z.string().date(),
  revenue: z.number().nonnegative(),
  bookings: z.number().int().nonnegative(),
});

export const OccupancyDataSchema = z.object({
  date: z.string().date(),
  total_properties: z.number().int().nonnegative(),
  booked_properties: z.number().int().nonnegative(),
  occupancy_rate: z.number().min(0).max(100),
});

export const AnalyticsDashboardResponseSchema = z.object({
  kpis: KPISchema,
  revenue: z.array(RevenueDataSchema),
  occupancy: z.array(OccupancyDataSchema),
  bookingsByStatus: z.array(z.object({
    status: z.string(),
    count: z.number().int().nonnegative(),
    revenue: z.number().nonnegative(),
  })),
  topProperties: z.array(z.object({
    property_id: z.number().int().positive(),
    property_name: z.string(),
    bookings: z.number().int().nonnegative(),
    revenue: z.number().nonnegative(),
    avg_booking_value: z.number().nonnegative(),
  })),
  comparison: z.object({
    bookings: z.object({
      current: z.number().int().nonnegative(),
      previous: z.number().int().nonnegative(),
      change: z.number(),
    }),
    revenue: z.object({
      current: z.number().nonnegative(),
      previous: z.number().nonnegative(),
      change: z.number(),
    }),
  }),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RevenueForecastQuery = z.infer<typeof RevenueForecastQuerySchema>;
export type RevenueForecastResponse = z.infer<typeof RevenueForecastResponseSchema>;

export type DemandHeatmapQuery = z.infer<typeof DemandHeatmapQuerySchema>;
export type DemandHeatmapResponse = z.infer<typeof DemandHeatmapResponseSchema>;

export type CompetitorBenchmarkQuery = z.infer<typeof CompetitorBenchmarkQuerySchema>;
export type CompetitorBenchmarkResponse = z.infer<typeof CompetitorBenchmarkResponseSchema>;

export type AnalyticsInsightsQuery = z.infer<typeof AnalyticsInsightsQuerySchema>;
export type AnalyticsInsightsResponse = z.infer<typeof AnalyticsInsightsResponseSchema>;
export type Insight = z.infer<typeof InsightSchema>;

export type AnalyticsDashboardQuery = z.infer<typeof AnalyticsDashboardQuerySchema>;
export type AnalyticsDashboardResponse = z.infer<typeof AnalyticsDashboardResponseSchema>;
export type KPIs = z.infer<typeof KPISchema>;

