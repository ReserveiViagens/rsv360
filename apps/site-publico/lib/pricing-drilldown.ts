/**
 * Consultas de drill-down para o hub de Precificação (S2).
 */

import { queryDatabase } from '@/lib/db';
import {
  fetchBookingBreakdown,
  type BookingBreakdownRow,
} from '@/lib/analytics-booking-breakdown';

export type { BookingBreakdownRow };

export interface PricingHistoryRow {
  date: string;
  base_price: number;
  final_price: number;
  demand_level: string | null;
}

export interface PricingDashboardMetrics {
  currentRevenue: number;
  averagePrice: number;
  occupancy: number;
  priceChange: number;
  totalBookings: number;
}

export async function fetchPropertyBookings(
  itemId: number,
  filters: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<BookingBreakdownRow[]> {
  return fetchBookingBreakdown({
    propertyId: itemId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 50,
  });
}

export async function fetchPricingHistoryRows(
  itemId: number,
  startDate?: string,
  endDate?: string,
  limit = 31
): Promise<PricingHistoryRow[]> {
  try {
    const params: unknown[] = [itemId];
    let dateFilter = '';

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND date >= $${params.length}::date`;
    }
    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND date <= $${params.length}::date`;
    }

    params.push(limit);

    const rows = await queryDatabase(
      `SELECT date, base_price, final_price, demand_level
       FROM pricing_history
       WHERE item_id = $1
       ${dateFilter}
       ORDER BY date DESC
       LIMIT $${params.length}`,
      params
    );

    return rows.map((row: Record<string, unknown>) => ({
      date:
        typeof row.date === 'string'
          ? row.date.slice(0, 10)
          : new Date(String(row.date)).toISOString().slice(0, 10),
      base_price: parseFloat(String(row.base_price || '0')),
      final_price: parseFloat(String(row.final_price || '0')),
      demand_level: row.demand_level ? String(row.demand_level) : null,
    }));
  } catch {
    return [];
  }
}

export async function getPricingDashboardMetrics(itemId: number): Promise<PricingDashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const startIso = thirtyDaysAgo.toISOString();
  const endIso = now.toISOString();
  const prevStartIso = sixtyDaysAgo.toISOString();
  const prevEndIso = thirtyDaysAgo.toISOString();

  try {
    const [current, previous, priceRows, historyAvg] = await Promise.all([
      queryDatabase(
        `SELECT
           COALESCE(SUM(total_amount), 0) AS revenue,
           COUNT(*) AS bookings
         FROM bookings
         WHERE item_id = $1
         AND status IN ('confirmed')
         AND created_at BETWEEN $2 AND $3`,
        [itemId, startIso, endIso]
      ),
      queryDatabase(
        `SELECT COALESCE(SUM(total_amount), 0) AS revenue
         FROM bookings
         WHERE item_id = $1
         AND status IN ('confirmed')
         AND created_at BETWEEN $2 AND $3`,
        [itemId, prevStartIso, prevEndIso]
      ),
      queryDatabase(
        `SELECT COALESCE(AVG(total_amount), 0) AS avg_price
         FROM bookings
         WHERE item_id = $1
         AND status IN ('confirmed')
         AND created_at BETWEEN $2 AND $3`,
        [itemId, startIso, endIso]
      ),
      queryDatabase(
        `SELECT COALESCE(AVG(final_price), 0) AS avg_price
         FROM pricing_history
         WHERE item_id = $1
         AND date >= $2::date AND date <= $3::date`,
        [itemId, startIso.slice(0, 10), endIso.slice(0, 10)]
      ).catch(() => [{ avg_price: '0' }]),
    ]);

    const currentRevenue = parseFloat(String(current[0]?.revenue || '0'));
    const prevRevenue = parseFloat(String(previous[0]?.revenue || '0'));
    const totalBookings = parseInt(String(current[0]?.bookings || '0'), 10);
    const bookingAvg = parseFloat(String(priceRows[0]?.avg_price || '0'));
    const historyPriceAvg = parseFloat(String(historyAvg[0]?.avg_price || '0'));
    const averagePrice = historyPriceAvg > 0 ? historyPriceAvg : bookingAvg;

    const occupancyRow = await queryDatabase(
      `SELECT COUNT(DISTINCT start_date::date) AS booked_days
       FROM bookings
       WHERE item_id = $1
       AND status IN ('confirmed', 'pending')
       AND start_date::date >= $2::date
       AND start_date::date <= $3::date`,
      [itemId, startIso.slice(0, 10), endIso.slice(0, 10)]
    );
    const bookedDays = parseInt(String(occupancyRow[0]?.booked_days || '0'), 10);
    const occupancy = (bookedDays / 30) * 100;

    const priceChange =
      prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      currentRevenue,
      averagePrice,
      occupancy: Math.min(100, occupancy),
      priceChange,
      totalBookings,
    };
  } catch {
    return {
      currentRevenue: 0,
      averagePrice: 0,
      occupancy: 0,
      priceChange: 0,
      totalBookings: 0,
    };
  }
}

export async function fetchSeasonBookings(
  itemId: number,
  startDate: string,
  endDate: string
): Promise<BookingBreakdownRow[]> {
  return fetchPropertyBookings(itemId, { startDate, endDate, limit: 30 });
}
