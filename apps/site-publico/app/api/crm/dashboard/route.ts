/**
 * ✅ ITEM 54: DASHBOARD DE CLIENTES
 * GET /api/crm/dashboard - Obter métricas do dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerDashboardMetrics } from '@/lib/crm-service';
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
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      segment_id: searchParams.get('segment_id') ? parseInt(searchParams.get('segment_id')!) : undefined,
    };

    const metrics = await getCustomerDashboardMetrics(filters);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    console.error('Erro ao obter métricas do dashboard:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter métricas' },
      { status: 500 }
    );
  }
}

