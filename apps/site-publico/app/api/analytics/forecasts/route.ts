/**
 * ✅ ITEM 59: DASHBOARD - PREVISÕES
 * GET /api/analytics/forecasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getForecasts } from '@/lib/analytics-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

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
    const filters = {
      period_type: (searchParams.get('period_type') as 'day' | 'week' | 'month') || 'month',
      periods_ahead: searchParams.get('periods_ahead') ? parseInt(searchParams.get('periods_ahead')!) : 6,
      property_id: searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined,
    };

    const data = await getForecasts(filters);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter previsões:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter previsões' },
      { status: 500 }
    );
  }
}

