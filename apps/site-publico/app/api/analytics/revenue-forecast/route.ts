/**
 * ✅ FASE 4: API DE PREVISÃO DE RECEITA
 * GET /api/analytics/revenue-forecast - Previsão de receita futura
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

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
    const months = searchParams.get('months') ? parseInt(searchParams.get('months')!) : 12;
    const property_id = searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined;

    // Buscar dados históricos de receita
    let query = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as revenue,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE status IN ('confirmed', 'completed')
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (property_id) {
      query += ` AND item_id = $${paramIndex}`;
      params.push(property_id);
      paramIndex++;
    }

    query += ` 
      AND created_at >= NOW() - INTERVAL '${months * 2} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `;

    const historicalData = await queryDatabase(query, params);

    // Calcular média móvel e tendência
    const revenues = historicalData.map((row: any) => parseFloat(row.revenue || 0));
    const avgRevenue = revenues.length > 0 
      ? revenues.reduce((a: number, b: number) => a + b, 0) / revenues.length 
      : 0;

    // Calcular crescimento médio mensal
    let growthRate = 0;
    if (revenues.length > 1) {
      const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
      const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (firstAvg > 0) {
        growthRate = ((secondAvg - firstAvg) / firstAvg) / (secondHalf.length || 1);
      }
    }

    // Gerar previsões para os próximos meses
    const forecasts = [];
    const today = new Date();
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(today);
      forecastDate.setMonth(today.getMonth() + i);
      
      // Aplicar crescimento e sazonalidade básica
      const monthIndex = forecastDate.getMonth();
      const seasonalFactor = monthIndex >= 10 || monthIndex <= 2 ? 1.2 : 0.9; // Alta temporada: nov-fev
      
      const forecastRevenue = avgRevenue * (1 + growthRate * i) * seasonalFactor;
      
      forecasts.push({
        month: forecastDate.toISOString().slice(0, 7),
        forecasted_revenue: Math.max(0, forecastRevenue),
        confidence: Math.max(0.5, 1 - (i * 0.05)), // Confiança diminui com o tempo
        growth_rate: growthRate,
        seasonal_factor: seasonalFactor,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        historical: historicalData,
        forecasts,
        average_revenue: avgRevenue,
        growth_rate: growthRate,
        months_ahead: months,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar previsão de receita:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar previsão de receita' },
      { status: 500 }
    );
  }
}

