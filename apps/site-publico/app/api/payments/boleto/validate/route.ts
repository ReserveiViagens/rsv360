/**
 * ✅ ITEM 9: API de Validação de Boleto
 * GET /api/payments/boleto/validate?payment_id=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateBoletoExpiration } from '@/lib/mercadopago-boleto-refund-reports';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'payment_id é obrigatório' },
        { status: 400 }
      );
    }

    const validation = await validateBoletoExpiration(paymentId);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error: any) {
    console.error('Erro ao validar boleto:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao validar boleto' },
      { status: 500 }
    );
  }
}

