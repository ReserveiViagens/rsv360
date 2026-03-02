/**
 * ✅ API DE REVISÃO DE VERIFICAÇÃO (Admin)
 * POST /api/verification/review - Aprovar ou rejeitar verificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, withAuth } from '@/lib/api-auth';
import { approveVerification, rejectVerification } from '@/lib/verification-service';
import { reviewVerificationSchema } from '@/lib/schemas/verification-schemas';

export const POST = withAuth(async (request: NextRequest, { user }) => {
  // Verificar se é admin
  if (user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Acesso negado. Apenas administradores podem revisar verificações' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = reviewVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { verification_id, approved, notes, rejection_reason } = validationResult.data;

    if (approved) {
      await approveVerification(verification_id, user.id, notes);
      return NextResponse.json({
        success: true,
        message: 'Verificação aprovada com sucesso',
      });
    } else {
      if (!rejection_reason) {
        return NextResponse.json(
          { success: false, error: 'Motivo da rejeição é obrigatório' },
          { status: 400 }
        );
      }
      await rejectVerification(verification_id, user.id, rejection_reason);
      return NextResponse.json({
        success: true,
        message: 'Verificação rejeitada',
      });
    }
  } catch (error: any) {
    console.error('Erro ao revisar verificação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao revisar verificação' },
      { status: 500 }
    );
  }
});

