/**
 * GET /api/analytics/insights — insights alinhados ao schema S2.
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import { queryDatabase } from '@/lib/db';
import { AnalyticsInsightsQuerySchema } from '@/lib/schemas/analytics-schemas';
import { fetchBookingBreakdown, type BookingBreakdownRow } from '@/lib/analytics-booking-breakdown';

const REVENUE_STATUSES = "('confirmed')";
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
    const query = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      property_id: searchParams.get('property_id')
        ? parseInt(searchParams.get('property_id')!, 10)
        : undefined,
      insight_types: searchParams.get('insight_types')?.split(',') as string[] | undefined,
    };

    const validatedQuery = AnalyticsInsightsQuerySchema.parse(query);

    const startDate = validatedQuery.start_date
      ? new Date(validatedQuery.start_date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = validatedQuery.end_date ? new Date(validatedQuery.end_date) : new Date();
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const itemFilter = validatedQuery.property_id ? 'AND item_id = $3' : '';
    const rangeParams = validatedQuery.property_id
      ? [startDate, endDate, validatedQuery.property_id]
      : [startDate, endDate];
    const dateParams = validatedQuery.property_id
      ? [startStr, endStr, validatedQuery.property_id]
      : [startStr, endStr];

    const insights: Array<Record<string, unknown>> = [];
    const propertyId = validatedQuery.property_id;

    const attachBreakdown = async (
      insight: Record<string, unknown>,
      filters: Parameters<typeof fetchBookingBreakdown>[0]
    ) => {
      insight.related_bookings = await fetchBookingBreakdown({ ...filters, limit: 20 });
      return insight;
    };

    const revenueData = await queryDatabase(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
         SUM(total_amount) AS revenue
       FROM bookings
       WHERE status IN ${REVENUE_STATUSES}
       AND created_at >= $1 AND created_at <= $2
       ${itemFilter}
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC
       LIMIT 3`,
      rangeParams
    );

    if (revenueData.length >= 2) {
      const recent = parseFloat(revenueData[0]?.revenue || '0');
      const previous = parseFloat(revenueData[1]?.revenue || '0');
      const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

      if (change < -10) {
        insights.push(
          await attachBreakdown(
            {
              id: 'revenue_decline',
              type: 'revenue',
              title: 'Receita em Declínio',
              description: `Receita diminuiu ${Math.abs(change).toFixed(1)}% comparado ao mês anterior`,
              severity: 'warning',
              recommendation:
                'Considere campanhas de marketing ou ajustes de preço para aumentar a demanda',
              metrics: { change, recent, previous },
              created_at: new Date().toISOString(),
            },
            { propertyId, month: revenueData[0]?.month as string | undefined }
          )
        );
      } else if (change > 10) {
        insights.push(
          await attachBreakdown(
            {
              id: 'revenue_growth',
              type: 'revenue',
              title: 'Crescimento de Receita',
              description: `Receita aumentou ${change.toFixed(1)}% comparado ao mês anterior`,
              severity: 'info',
              recommendation: 'Mantenha as estratégias atuais que estão gerando resultados positivos',
              metrics: { change, recent, previous },
              created_at: new Date().toISOString(),
            },
            { propertyId, month: revenueData[0]?.month as string | undefined }
          )
        );
      }
    }

    const occupancyRow = await queryDatabase(
      `SELECT
         COUNT(DISTINCT b.id) AS bookings,
         GREATEST(
           (MAX(b.end_date::date) - MIN(b.start_date::date) + 1),
           1
         ) AS span_days
       FROM bookings b
       WHERE b.start_date::date >= $1::date
       AND b.start_date::date <= $2::date
       AND b.status IN ${REVENUE_STATUSES}
       ${validatedQuery.property_id ? 'AND b.item_id = $3' : ''}`,
      dateParams
    );

    if (occupancyRow[0]) {
      const bookings = parseInt(occupancyRow[0].bookings || '0', 10);
      const spanDays = parseInt(occupancyRow[0].span_days || '1', 10);
      const occupancyRate = spanDays > 0 ? (bookings / spanDays) * 100 : 0;

      if (occupancyRate < 50 && bookings > 0) {
        insights.push(
          await attachBreakdown(
            {
              id: 'low_occupancy',
              type: 'occupancy',
              title: 'Ocupação Baixa',
              description: `Taxa estimada de ocupação em ${occupancyRate.toFixed(1)}% no período`,
              severity: 'warning',
              recommendation:
                'Considere estratégias de precificação dinâmica ou promoções para aumentar a ocupação',
              metrics: { occupancy: occupancyRate },
              created_at: new Date().toISOString(),
            },
            { propertyId, startDate: startStr, endDate: endStr }
          )
        );
      }
    }

    if (validatedQuery.property_id) {
      try {
        const benchmarkData = await queryDatabase(
          `SELECT AVG(price) AS market_avg
           FROM competitor_prices
           WHERE item_id = $1
           AND scraped_at >= NOW() - INTERVAL '30 days'`,
          [validatedQuery.property_id]
        );

        const propertyData = await queryDatabase(
          `SELECT base_price_per_night FROM properties WHERE id = $1`,
          [validatedQuery.property_id]
        );

        if (benchmarkData[0]?.market_avg && propertyData[0]?.base_price_per_night) {
          const marketAvg = parseFloat(benchmarkData[0].market_avg);
          const propertyPrice = parseFloat(propertyData[0].base_price_per_night);
          const difference =
            marketAvg > 0 ? ((propertyPrice - marketAvg) / marketAvg) * 100 : 0;

          if (difference > 20) {
            insights.push({
              id: 'price_above_market',
              type: 'pricing',
              title: 'Preço Acima da Média do Mercado',
              description: `Seu preço está ${difference.toFixed(1)}% acima da média dos concorrentes`,
              severity: 'warning',
              recommendation:
                'Considere ajustar preços para aumentar competitividade, ou destacar diferenciais',
              metrics: { difference, propertyPrice, marketAvg },
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch {
        /* competitor_prices / properties podem não existir no lab */
      }
    }

    const demandData = await queryDatabase(
      `SELECT start_date::date AS date, COUNT(*) AS bookings
       FROM bookings
       WHERE start_date::date >= $1::date
       AND start_date::date <= $2::date
       AND status IN ${BOOKING_STATUSES}
       ${itemFilter}
       GROUP BY start_date::date
       ORDER BY bookings DESC
       LIMIT 10`,
      dateParams
    );

    if (demandData.length > 0) {
      const maxBookings = Math.max(
        ...demandData.map((row: { bookings: string }) => parseInt(row.bookings || '0', 10))
      );
      const highDemandDates = demandData.filter(
        (row: { bookings: string }) => parseInt(row.bookings || '0', 10) >= maxBookings * 0.8
      );

      if (highDemandDates.length > 0) {
        const peakDate =
          typeof highDemandDates[0].date === 'string'
            ? highDemandDates[0].date.slice(0, 10)
            : new Date(highDemandDates[0].date).toISOString().slice(0, 10);

        insights.push(
          await attachBreakdown(
            {
              id: 'high_demand_periods',
              type: 'demand',
              title: 'Períodos de Alta Demanda Identificados',
              description: `${highDemandDates.length} datas com demanda acima de 80% do pico`,
              severity: 'info',
              recommendation: 'Considere aumentar preços nestes períodos para maximizar receita',
              metrics: {
                highDemandDates: highDemandDates.length,
                peakBookings: maxBookings,
                peakDate,
              },
              created_at: new Date().toISOString(),
            },
            { propertyId, startDate: peakDate, endDate: peakDate }
          )
        );
      }
    }

    if (insights.length === 0) {
      insights.push({
        id: 'lab_ok',
        type: 'performance',
        title: 'Período estável',
        description: 'Nenhum alerta crítico detectado com os dados atuais de reservas.',
        severity: 'info',
        recommendation: 'Adicione mais reservas ou filtre por propriedade para insights detalhados.',
        created_at: new Date().toISOString(),
      });
    }

    const summary = {
      total_insights: insights.length,
      critical_count: insights.filter((i) => i.severity === 'critical').length,
      warning_count: insights.filter((i) => i.severity === 'warning').length,
      info_count: insights.filter((i) => i.severity === 'info').length,
    };

    const breakdown: BookingBreakdownRow[] = await fetchBookingBreakdown({
      propertyId,
      startDate: startStr,
      endDate: endStr,
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        insights,
        summary,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        breakdown,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar insights';
    console.error('Erro ao gerar insights:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
