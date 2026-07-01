/**
 * GET /api/pricing/dashboard — métricas e drill-down por propriedade
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricingLabAuth } from '@/lib/pricing-lab-auth';
import {
  fetchPropertyBookings,
  fetchPricingHistoryRows,
  getPricingDashboardMetrics,
} from '@/lib/pricing-drilldown';
import { getCompetitorPrices } from '@/lib/smart-pricing-service';
import { getPricingRules } from '@/lib/pricing-rules-service';
import { queryDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await pricingLabAuth(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = parseInt(searchParams.get('item_id') || '0', 10);
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'item_id é obrigatório' },
        { status: 400 }
      );
    }

    const [metrics, bookings, priceHistory, rules, competitors] = await Promise.all([
      getPricingDashboardMetrics(itemId),
      fetchPropertyBookings(itemId, { startDate, endDate, limit: 50 }),
      fetchPricingHistoryRows(itemId, startDate, endDate, 31),
      getPricingRules(itemId).catch(() => []),
      getCompetitorPrices(itemId, new Date()).catch(() => []),
    ]);

    let alerts: unknown[] = [];
    try {
      alerts = await queryDatabase(
        `SELECT id, alert_type, severity, title, message, created_at, is_read
         FROM pricing_alerts
         WHERE property_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [itemId]
      );
    } catch {
      alerts = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        breakdown: {
          bookings,
          price_history: priceHistory,
          rules: rules.slice(0, 20),
          competitors,
          alerts,
        },
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
    console.error('Erro no dashboard de pricing:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
