/**
 * ✅ FASE 4: API DE SUBMISSÃO DE VERIFICAÇÃO
 * POST /api/verification/submit/:propertyId - Submeter solicitação de verificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { submitVerificationRequest, getVerificationByProperty } from '@/lib/verification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const propertyId = parseInt(params.propertyId);
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'ID de propriedade inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe verificação pendente
    const existing = await getVerificationByProperty(propertyId);
    if (existing && existing.status === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Já existe uma verificação pendente para esta propriedade' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const verification = await submitVerificationRequest({
      ...body,
      property_id: propertyId,
      requested_by: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitação de verificação enviada com sucesso',
      data: verification,
    });
  } catch (error: any) {
    console.error('Erro ao submeter verificação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao submeter verificação' },
      { status: 500 }
    );
  }
}
