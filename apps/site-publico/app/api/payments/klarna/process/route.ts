/**
 * ✅ TAREFA MEDIUM-1: API para processar pagamento Klarna
 * POST /api/payments/klarna/process
 */

import { NextRequest, NextResponse } from 'next/server';
import { klarnaClient } from '@/lib/klarna-service';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, session_id, authorization_token } = body;

    // Validar dados obrigatórios
    if (!booking_id || !session_id || !authorization_token) {
      return NextResponse.json(
        { success: false, error: 'booking_id, session_id e authorization_token são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar dados da reserva
    const booking = await queryDatabase(
      `SELECT * FROM bookings WHERE id = $1`,
      [booking_id]
    );

    if (!booking || booking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    // Processar pagamento Klarna
    const payment = await klarnaClient.processPayment({
      session_id,
      authorization_token,
    });

    // Atualizar reserva e criar registro de pagamento
    await queryDatabase(
      `BEGIN;
        UPDATE bookings 
        SET status = 'confirmed', 
            payment_status = 'pending',
            updated_at = NOW()
        WHERE id = $1;
        
        INSERT INTO payments (
          booking_id,
          amount,
          currency,
          method,
          gateway_provider,
          transaction_id,
          status,
          metadata,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW());
        
        COMMIT;`,
      [
        booking_id,
        payment.amount,
        payment.currency,
        'klarna',
        'klarna',
        payment.order_id,
        payment.status === 'authorized' || payment.status === 'captured' ? 'pending' : 'failed',
        JSON.stringify({
          klarna_order_id: payment.order_id,
          installments: payment.installments,
          session_id,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        order_id: payment.order_id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        installments: payment.installments,
      },
    });
  } catch (error: any) {
    console.error('Erro ao processar pagamento Klarna:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar pagamento Klarna' },
      { status: 500 }
    );
  }
}

