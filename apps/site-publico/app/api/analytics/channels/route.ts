/**
 * ✅ ITEM 57: DASHBOARD - RESERVAS POR CANAL
 * GET /api/analytics/channels
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBookingsByChannel } from '@/lib/analytics-service';
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
      property_id: searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined,
    };

    const data = await getBookingsByChannel(filters);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter reservas por canal:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter dados de canais' },
      { status: 500 }
    );
  }
}

