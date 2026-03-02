/**
 * API de Insights de Analytics
 * GET /api/analytics/insights - Obter insights gerais e recomendações
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';
import { AnalyticsInsightsQuerySchema } from '@/lib/schemas/analytics-schemas';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

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
      property_id: searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined,
      insight_types: searchParams.get('insight_types')?.split(',') as any,
    };

    // Validar query
    const validatedQuery = AnalyticsInsightsQuerySchema.parse(query);

    const startDate = validatedQuery.start_date 
      ? new Date(validatedQuery.start_date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = validatedQuery.end_date 
      ? new Date(validatedQuery.end_date)
      : new Date();

    const insights: any[] = [];

    // Insight 1: Receita em declínio
    const revenueData = await queryDatabase(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as revenue
      FROM bookings
      WHERE status IN ('confirmed', 'completed')
        AND created_at >= $1
        AND created_at <= $2
        ${validatedQuery.property_id ? 'AND item_id = $3' : ''}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 3`,
      validatedQuery.property_id 
        ? [startDate, endDate, validatedQuery.property_id]
        : [startDate, endDate]
    );

    if (revenueData.length >= 2) {
      const recent = parseFloat(revenueData[0]?.revenue || 0);
      const previous = parseFloat(revenueData[1]?.revenue || 0);
      const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

      if (change < -10) {
        insights.push({
          id: 'revenue_decline',
          type: 'revenue',
          title: 'Receita em Declínio',
          description: `Receita diminuiu ${Math.abs(change).toFixed(1)}% comparado ao mês anterior`,
          severity: 'warning',
          recommendation: 'Considere campanhas de marketing ou ajustes de preço para aumentar a demanda',
          metrics: { change, recent, previous },
          created_at: new Date().toISOString(),
        });
      } else if (change > 10) {
        insights.push({
          id: 'revenue_growth',
          type: 'revenue',
          title: 'Crescimento de Receita',
          description: `Receita aumentou ${change.toFixed(1)}% comparado ao mês anterior`,
          severity: 'info',
          recommendation: 'Mantenha as estratégias atuais que estão gerando resultados positivos',
          metrics: { change, recent, previous },
          created_at: new Date().toISOString(),
        });
      }
    }

    // Insight 2: Ocupação baixa
    const occupancyData = await queryDatabase(
      `SELECT 
        COUNT(DISTINCT b.id) as bookings,
        COUNT(DISTINCT a.date) as total_days
      FROM bookings b
      LEFT JOIN availability a ON a.property_id = b.item_id
      WHERE b.check_in >= $1::date
        AND b.check_in <= $2::date
        AND b.status IN ('confirmed', 'completed')
        ${validatedQuery.property_id ? 'AND b.item_id = $3' : ''}
      GROUP BY b.item_id`,
      validatedQuery.property_id 
        ? [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], validatedQuery.property_id]
        : [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    if (occupancyData.length > 0) {
      const avgOccupancy = occupancyData.reduce((sum: number, row: any) => {
        const days = parseInt(row.total_days || 0);
        const bookings = parseInt(row.bookings || 0);
        return sum + (days > 0 ? (bookings / days) * 100 : 0);
      }, 0) / occupancyData.length;

      if (avgOccupancy < 50) {
        insights.push({
          id: 'low_occupancy',
          type: 'occupancy',
          title: 'Ocupação Baixa',
          description: `Taxa média de ocupação está em ${avgOccupancy.toFixed(1)}%`,
          severity: 'warning',
          recommendation: 'Considere estratégias de precificação dinâmica ou promoções para aumentar a ocupação',
          metrics: { occupancy: avgOccupancy },
          created_at: new Date().toISOString(),
        });
      }
    }

    // Insight 3: Preços acima da média do mercado
    if (validatedQuery.property_id) {
      const benchmarkData = await queryDatabase(
        `SELECT 
          AVG(price) as market_avg
        FROM competitor_prices
        WHERE property_id = $1
          AND scraped_at >= NOW() - INTERVAL '30 days'`,
        [validatedQuery.property_id]
      );

      const propertyData = await queryDatabase(
        `SELECT base_price FROM properties WHERE id = $1`,
        [validatedQuery.property_id]
      );

      if (benchmarkData[0] && propertyData[0]) {
        const marketAvg = parseFloat(benchmarkData[0].market_avg || 0);
        const propertyPrice = parseFloat(propertyData[0].base_price || 0);
        const difference = marketAvg > 0 ? ((propertyPrice - marketAvg) / marketAvg) * 100 : 0;

        if (difference > 20) {
          insights.push({
            id: 'price_above_market',
            type: 'pricing',
            title: 'Preço Acima da Média do Mercado',
            description: `Seu preço está ${difference.toFixed(1)}% acima da média dos concorrentes`,
            severity: 'warning',
            recommendation: 'Considere ajustar preços para aumentar competitividade, ou destacar diferenciais que justifiquem o preço',
            metrics: { difference, propertyPrice, marketAvg },
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Insight 4: Alta demanda em períodos específicos
    const demandData = await queryDatabase(
      `SELECT 
        DATE(check_in) as date,
        COUNT(*) as bookings
      FROM bookings
      WHERE check_in >= $1::date
        AND check_in <= $2::date
        AND status IN ('confirmed', 'completed', 'pending')
        ${validatedQuery.property_id ? 'AND item_id = $3' : ''}
      GROUP BY DATE(check_in)
      ORDER BY bookings DESC
      LIMIT 10`,
      validatedQuery.property_id 
        ? [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], validatedQuery.property_id]
        : [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    if (demandData.length > 0) {
      const maxBookings = Math.max(...demandData.map((row: any) => parseInt(row.bookings || 0)));
      const highDemandDates = demandData.filter((row: any) => parseInt(row.bookings || 0) >= maxBookings * 0.8);

      if (highDemandDates.length > 0) {
        insights.push({
          id: 'high_demand_periods',
          type: 'demand',
          title: 'Períodos de Alta Demanda Identificados',
          description: `${highDemandDates.length} datas com demanda acima de 80% do pico`,
          severity: 'info',
          recommendation: 'Considere aumentar preços nestes períodos para maximizar receita',
          metrics: { highDemandDates: highDemandDates.length, peakBookings: maxBookings },
          created_at: new Date().toISOString(),
        });
      }
    }

    // Contar insights por severidade
    const summary = {
      total_insights: insights.length,
      critical_count: insights.filter(i => i.severity === 'critical').length,
      warning_count: insights.filter(i => i.severity === 'warning').length,
      info_count: insights.filter(i => i.severity === 'info').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        insights,
        summary,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar insights:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar insights' },
      { status: 500 }
    );
  }
}

