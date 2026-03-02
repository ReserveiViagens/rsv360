/**
 * ✅ FASE 4: API DE APROVAÇÃO DE VERIFICAÇÃO
 * PUT /api/verification/approve/:requestId - Aprovar verificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { approveVerification } from '@/lib/verification-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    // Apenas admin pode aprovar
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores podem aprovar verificações.' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'ID de solicitação inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    await approveVerification(
      requestId,
      user.id,
      body.review_notes,
      body.badge,
      body.badge_expires_at
    );

    return NextResponse.json({
      success: true,
      message: 'Verificação aprovada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao aprovar verificação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao aprovar verificação' },
      { status: 500 }
    );
  }
}

