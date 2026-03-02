/**
 * ✅ ITEM 56: DASHBOARD - TAXA DE OCUPAÇÃO
 * GET /api/analytics/occupancy
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOccupancyRate } from '@/lib/analytics-service';
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
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    if (!date_from || !date_to) {
      return NextResponse.json(
        { success: false, error: 'date_from e date_to são obrigatórios' },
        { status: 400 }
      );
    }

    const filters = {
      date_from,
      date_to,
      property_id: searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined,
    };

    const data = await getOccupancyRate(filters);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter taxa de ocupação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter ocupação' },
      { status: 500 }
    );
  }
}

