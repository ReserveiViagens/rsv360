/**
 * API de Estatísticas de Auditoria
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { auditService } from '@/lib/audit-service';

/**
 * GET /api/audit/stats
 * Obter estatísticas de auditoria
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined;
    const endDate = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined;

    const stats = await auditService.getStats(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de auditoria:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter estatísticas de auditoria' },
      { status: 500 }
    );
  }
}

