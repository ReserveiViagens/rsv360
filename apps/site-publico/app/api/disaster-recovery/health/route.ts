/**
 * API de Saúde do Sistema (Disaster Recovery)
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { disasterRecoveryService } from '@/lib/disaster-recovery-service';
import { jsonInternalError } from '@/lib/api-error';

/**
 * GET /api/disaster-recovery/health
 * Verificar saúde do sistema
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

    const health = await disasterRecoveryService.checkSystemHealth();

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error: any) {
    console.error('Erro ao verificar saúde do sistema:', error);
    return jsonInternalError(error);
  }
}

