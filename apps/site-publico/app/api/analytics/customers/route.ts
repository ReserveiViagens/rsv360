/**
 * ✅ ITEM 58: DASHBOARD - ANÁLISE DE CLIENTES
 * GET /api/analytics/customers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerAnalysis } from '@/lib/analytics-service';
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

    const data = await getCustomerAnalysis(filters);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Erro ao obter análise de clientes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter análise' },
      { status: 500 }
    );
  }
}

