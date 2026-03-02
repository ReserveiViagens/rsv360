/**
 * ✅ FASE 4: API DE BUSCA DE APÓLICE
 * GET /api/insurance/policy?booking_id=:bookingId - Buscar apólice por reserva
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getInsurancePolicyByBooking } from '@/lib/insurance-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id') ? parseInt(searchParams.get('booking_id')!) : null;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'booking_id é obrigatório' },
        { status: 400 }
      );
    }

    const policy = await getInsurancePolicyByBooking(bookingId);

    if (!policy) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Nenhuma apólice encontrada para esta reserva',
      });
    }

    // Verificar se o usuário tem permissão (dono da reserva ou admin)
    if (policy.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error('Erro ao buscar apólice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar apólice' },
      { status: 500 }
    );
  }
}

