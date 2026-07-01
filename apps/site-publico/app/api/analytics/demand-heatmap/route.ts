/**
 * GET /api/analytics/demand-heatmap — heatmap alinhado ao schema S2 (start_date, total_amount).
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import { queryDatabase } from '@/lib/db';
import { fetchBookingBreakdown } from '@/lib/analytics-booking-breakdown';

const BOOKING_STATUSES = "('confirmed', 'pending')";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await marketingLabAuth(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get('start_date') ||
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate =
      searchParams.get('end_date') ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const propertyId = searchParams.get('property_id')
      ? parseInt(searchParams.get('property_id')!, 10)
      : undefined;

    const params: unknown[] = [startDate, endDate];
    const itemFilter = propertyId ? 'AND item_id = $3' : '';
    if (propertyId) params.push(propertyId);

    const rows = await queryDatabase(
      `SELECT
         start_date::date AS date,
         COUNT(*) AS bookings_count,
         SUM(total_amount) AS revenue,
         AVG(total_amount) AS avg_booking_value
       FROM bookings
       WHERE status IN ${BOOKING_STATUSES}
       AND start_date::date >= $1::date
       AND start_date::date <= $2::date
       ${itemFilter}
       GROUP BY start_date::date
       ORDER BY date ASC`,
      params
    );

    const maxBookings = Math.max(
      ...rows.map((row: { bookings_count: string }) => parseInt(row.bookings_count || '0', 10)),
      1
    );

    const heatmapData = rows.map((row: Record<string, string>) => {
      const bookings = parseInt(row.bookings_count || '0', 10);
      const dateVal = row.date;
      const dateStr =
        typeof dateVal === 'string'
          ? dateVal.slice(0, 10)
          : new Date(dateVal).toISOString().slice(0, 10);
      return {
        date: dateStr,
        bookings,
        revenue: parseFloat(row.revenue || '0'),
        avg_value: parseFloat(row.avg_booking_value || '0'),
        demand_level: Math.round((bookings / maxBookings) * 100),
        intensity:
          bookings > maxBookings * 0.8 ? 'high' : bookings > maxBookings * 0.5 ? 'medium' : 'low',
      };
    });

    const breakdown = await fetchBookingBreakdown({
      propertyId,
      startDate,
      endDate,
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      data: {
        heatmap: heatmapData,
        max_demand: maxBookings,
        date_range: { start: startDate, end: endDate },
        breakdown,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar mapa de calor';
    console.error('Erro ao gerar mapa de calor:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
