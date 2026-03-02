/**
 * ✅ ITEM 55: DASHBOARD - RECEITA POR PERÍODO
 * GET /api/analytics/revenue
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRevenueByPeriod } from '@/lib/analytics-service';
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
      period_type: (searchParams.get('period_type') as 'day' | 'week' | 'month' | 'year') || 'month',
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      property_id: searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined,
      group_by: (searchParams.get('group_by') as 'day' | 'week' | 'month' | 'year') || undefined,
    };

    const data = await getRevenueByPeriod(filters);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter receita por período:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter receita' },
      { status: 500 }
    );
  }
}

