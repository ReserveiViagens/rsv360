/**
 * API Route: Criar Solicitação de Check-in
 * POST /api/checkin/request
 */

import { NextRequest, NextResponse } from 'next/server';
import { CheckinRequestSchema } from '@/lib/schemas/checkin-schemas';
import { createCheckinRequest, generateQRCodeForCheckin } from '@/lib/checkin-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const authResult = await advancedAuthMiddleware(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Validar body
    const body = await request.json();
    const validationResult = CheckinRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar se o usuário tem permissão para criar check-in para esta reserva
    // (opcional: verificar se a reserva pertence ao usuário)
    
    // Criar check-in
    const checkin = await createCheckinRequest({
      ...data,
      user_id: authResult.user.id
    });

    // Gerar QR code automaticamente
    const qrCode = await generateQRCodeForCheckin(checkin.id);

    return NextResponse.json({
      success: true,
      data: {
        ...checkin,
        qr_code: qrCode.qrCode,
        qr_code_url: qrCode.qrCodeUrl
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar check-in:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao criar check-in',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

