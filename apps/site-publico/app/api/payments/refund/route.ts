/**
 * ✅ ITEM 10: API de Estornos
 * POST /api/payments/refund
 */

import { NextRequest, NextResponse } from 'next/server';
import { processRefund, getRefundHistory } from '@/lib/mercadopago-boleto-refund-reports';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { payment_id, booking_id, amount, reason, refunded_by, refunded_by_email } = body;

    if (!payment_id && !booking_id) {
      return NextResponse.json(
        { success: false, error: 'payment_id ou booking_id é obrigatório' },
        { status: 400 }
      );
    }

    const result = await processRefund(
      payment_id || '',
      booking_id,
      amount,
      reason,
      refunded_by,
      refunded_by_email
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reembolso processado com sucesso',
      data: {
        refund_id: result.refund_id,
        amount: result.amount,
      },
    });
  } catch (error: any) {
    console.error('Erro ao processar reembolso:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar reembolso' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await getRefundHistory(
      bookingId ? parseInt(bookingId) : undefined,
      limit
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Erro ao buscar histórico de estornos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}

