/**
 * ✅ TAREFA HIGH-3: Relatórios de ROI de Precificação
 * Calcula e gera relatórios de ROI do Smart Pricing
 */

import { queryDatabase } from './db';

export interface ROIMetrics {
  id?: number;
  property_id: number;
  metric_date: Date;
  revenue_without_smart_pricing: number;
  revenue_with_smart_pricing: number;
  bookings_without_smart_pricing: number;
  bookings_with_smart_pricing: number;
  avg_price_without_smart_pricing: number;
  avg_price_with_smart_pricing: number;
  conversion_rate_without: number;
  conversion_rate_with: number;
  created_at?: Date;
}

export interface ROIHistory {
  id?: number;
  property_id: number;
  period_start: Date;
  period_end: Date;
  base_revenue: number;
  smart_pricing_revenue: number;
  revenue_increase: number;
  revenue_increase_percentage: number;
  bookings_count: number;
  avg_price: number;
  smart_pricing_enabled: boolean;
  created_at?: Date;
}

export interface ROISummary {
  total_revenue_increase: number;
  total_revenue_increase_percentage: number;
  total_bookings: number;
  avg_price_increase: number;
  conversion_rate_improvement: number;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Calcular ROI para um período
 */
export async function calculateROI(
  propertyId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<ROIHistory> {
  // Buscar receita com smart pricing
  const withSmartPricing = await queryDatabase(
    `SELECT 
      COALESCE(SUM(total_price), 0) as revenue,
      COUNT(*) as bookings,
      COALESCE(AVG(total_price), 0) as avg_price
    FROM bookings
    WHERE property_id = $1
    AND check_in >= $2
    AND check_in <= $3
    AND status IN ('confirmed', 'completed')
    AND EXISTS (
      SELECT 1 FROM pricing_history 
      WHERE item_id = $1 
      AND date = DATE(bookings.check_in)
    )`,
    [propertyId, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
  );

  // Buscar receita sem smart pricing (estimada baseada em preço base)
  const withoutSmartPricing = await queryDatabase(
    `SELECT 
      COALESCE(SUM(p.base_price * EXTRACT(EPOCH FROM (b.check_out - b.check_in))/86400), 0) as revenue,
      COUNT(*) as bookings,
      COALESCE(AVG(p.base_price * EXTRACT(EPOCH FROM (b.check_out - b.check_in))/86400), 0) as avg_price
    FROM bookings b
    JOIN properties p ON b.property_id = p.id
    WHERE b.property_id = $1
    AND b.check_in >= $2
    AND b.check_in <= $3
    AND b.status IN ('confirmed', 'completed')
    AND NOT EXISTS (
      SELECT 1 FROM pricing_history 
      WHERE item_id = $1 
      AND date = DATE(b.check_in)
    )`,
    [propertyId, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
  );

  const withRevenue = parseFloat(withSmartPricing[0]?.revenue || '0');
  const withoutRevenue = parseFloat(withoutSmartPricing[0]?.revenue || '0');
  const bookings = parseInt(withSmartPricing[0]?.bookings || '0');
  const avgPrice = parseFloat(withSmartPricing[0]?.avg_price || '0');

  const revenueIncrease = withRevenue - withoutRevenue;
  const revenueIncreasePercentage = withoutRevenue > 0 
    ? (revenueIncrease / withoutRevenue) * 100 
    : 0;

  // Salvar no histórico
  const result = await queryDatabase(
    `INSERT INTO pricing_roi_history 
     (property_id, period_start, period_end, base_revenue, smart_pricing_revenue, 
      revenue_increase, revenue_increase_percentage, bookings_count, avg_price, smart_pricing_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (property_id, period_start, period_end) 
     DO UPDATE SET
       base_revenue = EXCLUDED.base_revenue,
       smart_pricing_revenue = EXCLUDED.smart_pricing_revenue,
       revenue_increase = EXCLUDED.revenue_increase,
       revenue_increase_percentage = EXCLUDED.revenue_increase_percentage,
       bookings_count = EXCLUDED.bookings_count,
       avg_price = EXCLUDED.avg_price
     RETURNING *`,
    [
      propertyId,
      periodStart.toISOString().split('T')[0],
      periodEnd.toISOString().split('T')[0],
      withoutRevenue,
      withRevenue,
      revenueIncrease,
      revenueIncreasePercentage,
      bookings,
      avgPrice,
      true,
    ]
  );

  return result[0] as ROIHistory;
}

/**
 * Registrar métrica diária de ROI
 */
export async function recordROIMetric(
  metric: Omit<ROIMetrics, 'id' | 'created_at'>
): Promise<ROIMetrics> {
  const result = await queryDatabase(
    `INSERT INTO pricing_roi_metrics 
     (property_id, metric_date, revenue_without_smart_pricing, revenue_with_smart_pricing,
      bookings_without_smart_pricing, bookings_with_smart_pricing,
      avg_price_without_smart_pricing, avg_price_with_smart_pricing,
      conversion_rate_without, conversion_rate_with)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (property_id, metric_date) 
     DO UPDATE SET
       revenue_without_smart_pricing = EXCLUDED.revenue_without_smart_pricing,
       revenue_with_smart_pricing = EXCLUDED.revenue_with_smart_pricing,
       bookings_without_smart_pricing = EXCLUDED.bookings_without_smart_pricing,
       bookings_with_smart_pricing = EXCLUDED.bookings_with_smart_pricing,
       avg_price_without_smart_pricing = EXCLUDED.avg_price_without_smart_pricing,
       avg_price_with_smart_pricing = EXCLUDED.avg_price_with_smart_pricing,
       conversion_rate_without = EXCLUDED.conversion_rate_without,
       conversion_rate_with = EXCLUDED.conversion_rate_with
     RETURNING *`,
    [
      metric.property_id,
      metric.metric_date.toISOString().split('T')[0],
      metric.revenue_without_smart_pricing,
      metric.revenue_with_smart_pricing,
      metric.bookings_without_smart_pricing,
      metric.bookings_with_smart_pricing,
      metric.avg_price_without_smart_pricing,
      metric.avg_price_with_smart_pricing,
      metric.conversion_rate_without,
      metric.conversion_rate_with,
    ]
  );

  return result[0] as ROIMetrics;
}

/**
 * Obter resumo de ROI para um período
 */
export async function getROISummary(
  propertyId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<ROISummary> {
  const history = await queryDatabase(
    `SELECT 
      SUM(revenue_increase) as total_revenue_increase,
      AVG(revenue_increase_percentage) as avg_revenue_increase_percentage,
      SUM(bookings_count) as total_bookings,
      AVG(avg_price) as avg_price
    FROM pricing_roi_history
    WHERE property_id = $1
    AND period_start >= $2
    AND period_end <= $3`,
    [propertyId, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
  );

  const metrics = await queryDatabase(
    `SELECT 
      AVG(conversion_rate_with - conversion_rate_without) as conversion_improvement
    FROM pricing_roi_metrics
    WHERE property_id = $1
    AND metric_date >= $2
    AND metric_date <= $3`,
    [propertyId, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
  );

  const totalRevenue = parseFloat(history[0]?.base_revenue || '0');
  const totalIncrease = parseFloat(history[0]?.total_revenue_increase || '0');
  const increasePercentage = totalRevenue > 0 
    ? (totalIncrease / totalRevenue) * 100 
    : parseFloat(history[0]?.avg_revenue_increase_percentage || '0');

  return {
    total_revenue_increase: totalIncrease,
    total_revenue_increase_percentage: increasePercentage,
    total_bookings: parseInt(history[0]?.total_bookings || '0'),
    avg_price_increase: parseFloat(history[0]?.avg_price || '0'),
    conversion_rate_improvement: parseFloat(metrics[0]?.conversion_improvement || '0'),
    period: {
      start: periodStart,
      end: periodEnd,
    },
  };
}

/**
 * Obter histórico de ROI
 */
export async function getROIHistory(
  propertyId: number,
  limit: number = 30
): Promise<ROIHistory[]> {
  return await queryDatabase(
    `SELECT * FROM pricing_roi_history
     WHERE property_id = $1
     ORDER BY period_start DESC
     LIMIT $2`,
    [propertyId, limit]
  ) as ROIHistory[];
}

