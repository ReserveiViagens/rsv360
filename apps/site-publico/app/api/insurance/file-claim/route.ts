/**
 * ✅ FASE 4: API DE SINISTRO
 * POST /api/insurance/file-claim/:policyId - Registrar sinistro
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { createInsuranceClaim } from '@/lib/insurance-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { policyId: string } }
) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const policyId = parseInt(params.policyId);
    if (!policyId) {
      return NextResponse.json(
        { success: false, error: 'ID de apólice inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const claim = await createInsuranceClaim({
      ...body,
      policy_id: policyId,
      user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Sinistro registrado com sucesso',
      data: claim,
    });
  } catch (error: any) {
    console.error('Erro ao registrar sinistro:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao registrar sinistro' },
      { status: 500 }
    );
  }
}

