/**
 * ✅ FASE 4: API DE MÉTRICAS DE QUALIDADE
 * GET /api/quality/metrics/:hostId - Métricas detalhadas de qualidade
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getHostDashboard, getQualityMetrics, getHostRatings, getHostBadges, calculateHostScore, determineHostLevel } from '@/lib/top-host-service';
import { getQualityMetricsQuerySchema } from '@/lib/schemas/top-host-schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;

  try {
    const hostId = parseInt(params.hostId);
    if (!hostId || isNaN(hostId)) {
      return NextResponse.json(
        { success: false, error: 'ID de host inválido' },
        { status: 400 }
      );
    }

    // Verificar permissão (próprio host ou admin)
    if (user.id !== hostId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id') ? parseInt(searchParams.get('item_id')!) : undefined;

    // Buscar dashboard completo usando o service
    const dashboard = await getHostDashboard(hostId, itemId);
    
    // Determinar nível do host
    const level = await determineHostLevel(hostId, itemId);

    return NextResponse.json({
      success: true,
      data: {
        ...dashboard,
        level,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}

