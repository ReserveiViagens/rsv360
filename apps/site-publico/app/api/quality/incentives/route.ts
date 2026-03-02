/**
 * ✅ FASE 4: API DE INCENTIVOS DE QUALIDADE
 * POST /api/quality/incentives/:hostId - Aplicar incentivos a um host
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    // Apenas admin pode aplicar incentivos
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const hostId = parseInt(params.hostId);
    if (!hostId) {
      return NextResponse.json(
        { success: false, error: 'ID de host inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { incentive_type, incentive_value, description } = body;

    if (!incentive_type || !incentive_value) {
      return NextResponse.json(
        { success: false, error: 'incentive_type e incentive_value são obrigatórios' },
        { status: 400 }
      );
    }

    // Registrar incentivo (pode ser em uma tabela de incentivos ou como métrica)
    await queryDatabase(
      `INSERT INTO quality_metrics 
       (host_id, metric_type, metric_value, description, recorded_by, recorded_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [hostId, `incentive_${incentive_type}`, incentive_value, description || null, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Incentivo aplicado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao aplicar incentivo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao aplicar incentivo' },
      { status: 500 }
    );
  }
}

