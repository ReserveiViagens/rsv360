/**
 * ✅ ITENS 63-70: API DE CONFLITOS DE SINCRONIZAÇÃO
 * GET /api/integrations/conflicts - Listar conflitos
 * POST /api/integrations/conflicts/[id]/resolve - Resolver conflito
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { resolveSyncConflict } from '@/lib/booking-service';

// GET /api/integrations/conflicts - Listar conflitos
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
    const integration_config_id = searchParams.get('integration_config_id');
    const resolution_status = searchParams.get('resolution_status') || 'pending';

    let query = `SELECT * FROM sync_conflicts WHERE resolution_status = $1`;
    const params: any[] = [resolution_status];
    let paramIndex = 2;

    if (integration_config_id) {
      query += ` AND integration_config_id = $${paramIndex}`;
      params.push(parseInt(integration_config_id));
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const conflicts = await queryDatabase(query, params);

    return NextResponse.json({
      success: true,
      data: conflicts,
      count: conflicts.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar conflitos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar conflitos' },
      { status: 500 }
    );
  }
}

