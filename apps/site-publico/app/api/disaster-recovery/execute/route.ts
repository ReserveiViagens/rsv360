/**
 * API de Execução de Planos de Recuperação
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { disasterRecoveryService } from '@/lib/disaster-recovery-service';

/**
 * POST /api/disaster-recovery/execute
 * Executar plano de recuperação
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { plan_id, test } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id é obrigatório' },
        { status: 400 }
      );
    }

    if (test) {
      // Executar teste
      const execution = await disasterRecoveryService.testRecoveryPlan(plan_id);
      return NextResponse.json({
        success: true,
        data: execution,
        message: 'Teste de plano de recuperação executado com sucesso',
      });
    } else {
      // Executar plano real
      const execution = await disasterRecoveryService.executeRecoveryPlan(
        plan_id,
        'manual',
        auth.user.id,
        body.reason
      );
      return NextResponse.json({
        success: true,
        data: execution,
        message: 'Plano de recuperação executado com sucesso',
      });
    }
  } catch (error: any) {
    console.error('Erro ao executar plano de recuperação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao executar plano de recuperação' },
      { status: 500 }
    );
  }
}

