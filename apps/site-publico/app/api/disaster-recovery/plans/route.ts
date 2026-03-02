/**
 * API de Planos de Recuperação
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { disasterRecoveryService, type RecoveryPlan } from '@/lib/disaster-recovery-service';

/**
 * GET /api/disaster-recovery/plans
 * Obter planos de recuperação
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
    const planId = searchParams.get('id');

    if (planId) {
      const plan = await disasterRecoveryService.getRecoveryPlan(parseInt(planId));
      if (!plan) {
        return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: plan });
    }

    // Retornar todos os planos (implementar se necessário)
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Erro ao obter planos de recuperação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter planos de recuperação' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/disaster-recovery/plans
 * Criar plano de recuperação
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
    const plan: RecoveryPlan = {
      name: body.name,
      description: body.description,
      priority: body.priority,
      rto: body.rto,
      rpo: body.rpo,
      steps: body.steps || [],
      enabled: body.enabled !== false,
    };

    const created = await disasterRecoveryService.createRecoveryPlan(plan);

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Plano de recuperação criado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao criar plano de recuperação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar plano de recuperação' },
      { status: 500 }
    );
  }
}

