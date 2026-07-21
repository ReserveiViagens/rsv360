import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { sendPaymentConfirmed } from '@/lib/email';
import { processWebhookEvent } from '@/lib/mercadopago-enhanced';
import { authorizeMercadoPagoWebhook, isAlreadyProcessedWebhook } from '@/lib/mp-webhook-auth';

export type MpWebhookHandleInput = {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataIdFromQuery: string | undefined;
  body: Record<string, unknown>;
  nowMs?: number;
};

/**
 * Core Next MP webhook handler — HMAC obrigatório + idempotência via webhook_logs.
 */
export async function handleMercadoPagoWebhook(
  input: MpWebhookHandleInput,
): Promise<NextResponse> {
  try {
    const auth = authorizeMercadoPagoWebhook({
      xSignature: input.xSignature,
      xRequestId: input.xRequestId,
      dataIdFromQuery: input.dataIdFromQuery,
      secret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
      nowMs: input.nowMs,
    });

    if (!auth.ok) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'mp_webhook_auth_failed',
          surface: 'site-publico',
          code: auth.code,
          hasSignature: Boolean(input.xSignature),
          hasRequestId: Boolean(input.xRequestId),
          hasDataIdQuery: Boolean(input.dataIdFromQuery),
        }),
      );
      return NextResponse.json({ received: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = input.body;
    const webhookId =
      (body.id as string | number | undefined) ??
      (body.data as { id?: string | number } | undefined)?.id;

    if (webhookId) {
      try {
        const existingWebhook = await queryDatabase(
          `SELECT id FROM webhook_logs WHERE webhook_id = $1 AND processed = TRUE`,
          [webhookId.toString()],
        );

        if (isAlreadyProcessedWebhook(existingWebhook)) {
          return NextResponse.json({
            received: true,
            duplicate: true,
            message: 'Already processed',
          });
        }
      } catch {
        // tabela pode não existir
      }
    }

    const type = (body.type as string | undefined) || (body.action as string | undefined);
    const result = await processWebhookEvent(String(type || 'unknown'), body);

    if (!result.processed) {
      const duplicate = result.reason === 'Already processed';
      return NextResponse.json({
        received: true,
        processed: false,
        duplicate,
        reason: result.reason,
      });
    }

    if (type === 'payment' && result.payment_status === 'paid') {
      const paymentId = (body.data as { id?: string | number } | undefined)?.id;

      if (paymentId) {
        const payments = await queryDatabase(
          'SELECT booking_id FROM payments WHERE gateway_transaction_id = $1',
          [paymentId.toString()],
        );

        if (payments.length > 0) {
          const booking = await queryDatabase(
            `SELECT booking_code, item_name, customer_name, customer_email, total, payment_method 
             FROM bookings WHERE id = $1`,
            [payments[0].booking_id],
          );

          if (booking.length > 0) {
            const bookingData = booking[0];
            try {
              await sendPaymentConfirmed({
                code: bookingData.booking_code,
                guestName: bookingData.customer_name,
                guestEmail: bookingData.customer_email,
                propertyName: bookingData.item_name,
                amount: parseFloat(bookingData.total),
                paymentMethod: bookingData.payment_method || 'pix',
              });
            } catch (emailError) {
              console.error('Erro ao enviar email de pagamento confirmado:', emailError);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true, processed: true, duplicate: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'webhook_error';
    console.error('Erro ao processar webhook:', message);
    return NextResponse.json({ received: true, error: 'processing_error' });
  }
}
