/**
 * GET /api/analytics/revenue-forecast — previsão alinhada ao schema S2 (total_amount, confirmed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import { queryDatabase } from '@/lib/db';

const REVENUE_STATUSES = "('confirmed')";

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
    const months = searchParams.get('months') ? parseInt(searchParams.get('months')!, 10) : 12;
    const propertyId = searchParams.get('property_id')
      ? parseInt(searchParams.get('property_id')!, 10)
      : undefined;

    const params: unknown[] = propertyId ? [propertyId] : [];
    const itemFilter = propertyId ? 'AND item_id = $1' : '';

    const historicalData = await queryDatabase(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
         SUM(total_amount) AS revenue,
         COUNT(*) AS bookings_count
       FROM bookings
       WHERE status IN ${REVENUE_STATUSES}
       AND created_at >= NOW() - INTERVAL '${months * 2} months'
       ${itemFilter}
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month ASC`,
      params
    );

    const revenues = historicalData.map((row: { revenue: string }) =>
      parseFloat(row.revenue || '0')
    );
    const avgRevenue =
      revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;

    let growthRate = 0;
    if (revenues.length > 1) {
      const mid = Math.floor(revenues.length / 2);
      const firstAvg = revenues.slice(0, mid).reduce((a, b) => a + b, 0) / mid || 0;
      const secondAvg =
        revenues.slice(mid).reduce((a, b) => a + b, 0) / (revenues.length - mid) || 0;
      if (firstAvg > 0) {
        growthRate = (secondAvg - firstAvg) / firstAvg / (revenues.length - mid || 1);
      }
    }

    const forecasts = [];
    const today = new Date();
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(today);
      forecastDate.setMonth(today.getMonth() + i);
      const monthIndex = forecastDate.getMonth();
      const seasonalFactor = monthIndex >= 10 || monthIndex <= 2 ? 1.2 : 0.9;
      const forecastRevenue = avgRevenue * (1 + growthRate * i) * seasonalFactor;
      forecasts.push({
        month: forecastDate.toISOString().slice(0, 7),
        forecasted_revenue: Math.max(0, forecastRevenue),
        confidence: Math.max(0.5, 1 - i * 0.05),
        growth_rate: growthRate,
        seasonal_factor: seasonalFactor,
      });
    }

    const historical = historicalData.map(
      (row: { month: string; revenue: string; bookings_count: string }) => ({
        month: row.month,
        revenue: parseFloat(row.revenue || '0'),
        bookings_count: parseInt(row.bookings_count || '0', 10),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        historical,
        forecasts,
        average_revenue: avgRevenue,
        growth_rate: growthRate,
        months_ahead: months,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar previsão de receita';
    console.error('Erro ao gerar previsão de receita:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
