/**
 * API processar split em reserva/pagamento
 * POST: calcular split e criar pagamento com divisão
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import {
  calculateSplit,
  recordSplitTransaction,
} from '@/lib/marketplace-split/marketplace-split-service';
import {
  createPixPaymentWithSplit,
  createCardPaymentWithSplit,
} from '@/lib/marketplace-split/mercadopago-split-adapter';
import type { ServiceType } from '@/lib/marketplace-split/types';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      total_amount,
      service_type = 'rent',
      receiver_id,
      platform_pct,
      payment_method = 'pix',
      description,
      payer,
      metadata,
      token,
      installments,
    } = body;

    if (!total_amount || total_amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'total_amount é obrigatório e deve ser positivo' },
        { status: 400 }
      );
    }

    if (!payer?.email || !payer?.first_name) {
      return NextResponse.json(
        { success: false, error: 'payer com email e first_name é obrigatório' },
        { status: 400 }
      );
    }

    const split = await calculateSplit({
      total_amount: parseFloat(total_amount),
      service_type: service_type as ServiceType,
      receiver_id: receiver_id ? parseInt(receiver_id) : undefined,
      platform_pct: platform_pct != null ? parseFloat(platform_pct) : undefined,
    });

    let paymentResult;

    if (payment_method === 'pix') {
      paymentResult = await createPixPaymentWithSplit({
        amount: total_amount,
        description: description || `Pagamento ${service_type}`,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: payer.identification,
        },
        payment_method_id: 'pix',
        metadata,
        split,
      });
    } else if (payment_method === 'credit_card' || payment_method === 'debit_card') {
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'token do cartão é obrigatório' },
          { status: 400 }
        );
      }
      paymentResult = await createCardPaymentWithSplit({
        amount: total_amount,
        description: description || `Pagamento ${service_type}`,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: payer.identification,
        },
        payment_method_id: payment_method,
        token,
        installments: installments || 1,
        metadata,
        split,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'payment_method deve ser pix, credit_card ou debit_card' },
        { status: 400 }
      );
    }

    const receiverAmount = split.total_partner_amount;
    const receiverId = receiver_id ? parseInt(receiver_id) : null;

    await recordSplitTransaction({
      booking_id: metadata?.booking_id,
      payment_id: paymentResult.id,
      total_amount: total_amount,
      platform_amount: split.platform_amount,
      receiver_id: receiverId || undefined,
      receiver_amount: receiverAmount > 0 ? receiverAmount : undefined,
      service_type,
      gateway_response: paymentResult as unknown as Record<string, unknown>,
      status: paymentResult.status === 'approved' ? 'completed' : 'pending',
    });

    return NextResponse.json({
      success: true,
      data: {
        payment: paymentResult,
        split: {
          platform_amount: split.platform_amount,
          platform_pct: split.platform_pct,
          partner_amount: receiverAmount,
          allocations: split.allocations,
        },
      },
    });
  } catch (err: unknown) {
    console.error('[split-marketplace/process] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
