/**
 * ✅ API DE SOLICITAÇÃO DE VERIFICAÇÃO
 * POST /api/verification/request - Criar solicitação de verificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, withAuth } from '@/lib/api-auth';
import { createVerificationRequest } from '@/lib/verification-service';

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const formData = await request.formData();
    const propertyId = parseInt(formData.get('property_id') as string);
    const photos = formData.getAll('photos') as File[];
    const video = formData.get('video') as File | null;

    if (!propertyId || photos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'property_id e pelo menos uma foto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o host da propriedade
    const { queryDatabase } = await import('@/lib/db');
    const property = await queryDatabase(
      `SELECT host_id FROM properties WHERE id = $1`,
      [propertyId]
    );

    if (property.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    if (property[0].host_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Você não é o host desta propriedade' },
        { status: 403 }
      );
    }

    // Criar solicitação de verificação
    const verification = await createVerificationRequest(
      propertyId,
      user.id,
      photos,
      video || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Solicitação de verificação criada com sucesso',
      data: verification,
    });
  } catch (error: any) {
    console.error('Erro ao criar solicitação de verificação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar solicitação de verificação' },
      { status: 500 }
    );
  }
});

