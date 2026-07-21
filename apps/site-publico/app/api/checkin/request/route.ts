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

    // PR-03b: posse da reserva (não basta JWT)
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'manager') {
      const { queryDatabase } = await import('@/lib/db');
      const bookings = await queryDatabase(
        `SELECT id, customer_email, user_id FROM bookings WHERE id = $1 LIMIT 1`,
        [data.booking_id],
      );
      const b = bookings[0] as
        | { customer_email?: string; user_id?: number }
        | undefined;
      if (!b) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 404 });
      }
      const owns =
        Number(b.user_id) === authResult.user.id ||
        String(b.customer_email || '').toLowerCase() ===
          String(authResult.user.email || '').toLowerCase();
      if (!owns) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 404 });
      }
    }

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

