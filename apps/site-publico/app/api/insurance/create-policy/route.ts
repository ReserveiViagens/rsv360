/**
 * ✅ FASE 4: API DE CRIAÇÃO DE APÓLICE
 * POST /api/insurance/create-policy/:bookingId - Criar apólice de seguro
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { createInsurancePolicy, getInsurancePolicyByBooking } from '@/lib/insurance-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const bookingId = parseInt(params.bookingId);
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe apólice para esta reserva
    const existing = await getInsurancePolicyByBooking(bookingId);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma apólice para esta reserva' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const policy = await createInsurancePolicy({
      ...body,
      booking_id: bookingId,
      user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Apólice criada com sucesso',
      data: policy,
    });
  } catch (error: any) {
    console.error('Erro ao criar apólice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar apólice' },
      { status: 500 }
    );
  }
}

