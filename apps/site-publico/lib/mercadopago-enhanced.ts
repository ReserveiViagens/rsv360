/**
 * Serviço Mercado Pago Aprimorado
 * Melhorias e funcionalidades adicionais para processamento de pagamentos
 */

import { mercadoPagoService } from './mercadopago';
import { queryDatabase } from './db';
import { updateBookingStatus, logStatusChange } from './booking-status-service';
import {
  MpApiUnavailableError,
  logMpStatusDivergence,
  mapMpPaymentStatus,
  sanitizeMpApiStatusLabel,
} from './mp-payment-lookup';

export type GetPaymentStatusFn = (paymentId: string) => Promise<{ status?: string; [k: string]: unknown }>;

export type ProcessWebhookEventDeps = {
  queryDatabase: typeof queryDatabase;
  getPaymentStatus: GetPaymentStatusFn;
  updateBookingStatus: typeof updateBookingStatus;
  logStatusChange: typeof logStatusChange;
};

const defaultProcessDeps: ProcessWebhookEventDeps = {
  queryDatabase,
  getPaymentStatus: (id) => mercadoPagoService.getPaymentStatus(id),
  updateBookingStatus,
  logStatusChange,
};

/**
 * ✅ ITEM 6: PROCESSAMENTO PIX COMPLETO
 * Cria pagamento PIX, gera QR Code e processa confirmação via webhook
 */
export async function processPixPayment(
  bookingId: number,
  bookingCode: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  customerDocument?: string
) {
  try {
    // Criar pagamento PIX
    const paymentResult = await mercadoPagoService.createPixPayment({
      transaction_amount: amount,
      description: `Reserva ${bookingCode}`,
      payment_method_id: 'pix',
      payer: {
        email: customerEmail,
        first_name: customerName.split(' ')[0],
        last_name: customerName.split(' ').slice(1).join(' ') || '',
        identification: customerDocument ? {
          type: customerDocument.length === 11 ? 'CPF' : 'CNPJ',
          number: customerDocument.replace(/\D/g, ''),
        } : undefined,
      },
      metadata: {
        booking_code: bookingCode,
        booking_id: bookingId,
      },
    });

    // Atualizar registro de pagamento no banco
    await queryDatabase(
      `UPDATE payments 
       SET 
         gateway_transaction_id = $1,
         pix_qr_code = $2,
         pix_expires_at = $3,
         gateway_response = $4,
         payment_status = 'pending',
         updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $5`,
      [
        paymentResult.id,
        paymentResult.qr_code,
        paymentResult.date_of_expiration,
        JSON.stringify(paymentResult),
        bookingId,
      ]
    );

    return {
      success: true,
      payment_id: paymentResult.id,
      qr_code: paymentResult.qr_code,
      qr_code_base64: paymentResult.qr_code_base64,
      expires_at: paymentResult.date_of_expiration,
      status: paymentResult.status,
    };
  } catch (error: any) {
    console.error('Erro ao processar pagamento PIX:', error);
    throw new Error(`Erro ao processar pagamento PIX: ${error.message}`);
  }
}

/**
 * ✅ ITEM 8: PROCESSAMENTO CARTÃO COMPLETO
 * Processa pagamento com cartão, incluindo 3D Secure
 */
export async function processCardPayment(
  bookingId: number,
  bookingCode: string,
  amount: number,
  customerEmail: string,
  customerDocument: string,
  cardToken: string,
  installments: number = 1,
  cardType: 'credit_card' | 'debit_card' = 'credit_card',
  lastFour?: string,
  cardBrand?: string
) {
  try {
    // Criar pagamento com cartão
    const paymentResult = await mercadoPagoService.createCardPayment({
      transaction_amount: amount,
      description: `Reserva ${bookingCode}`,
      payment_method_id: cardType,
      installments,
      token: cardToken,
      payer: {
        email: customerEmail,
        identification: {
          type: customerDocument.length === 11 ? 'CPF' : 'CNPJ',
          number: customerDocument.replace(/\D/g, ''),
        },
      },
      metadata: {
        booking_code: bookingCode,
        booking_id: bookingId,
      },
    });

    // Verificar se requer 3D Secure
    if (paymentResult.requires_3ds) {
      return {
        success: true,
        requires_3ds: true,
        payment_id: paymentResult.id,
        three_ds_info: paymentResult.three_ds_info,
        status: paymentResult.status,
      };
    }

    // Atualizar registro de pagamento
    const paymentStatus = paymentResult.status === 'approved' ? 'paid' : 'pending';
    
    await queryDatabase(
      `UPDATE payments 
       SET 
         gateway_transaction_id = $1,
         card_last_four = $2,
         card_brand = $3,
         installments = $4,
         payment_status = $5,
         paid_at = $6,
         gateway_response = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $8`,
      [
        paymentResult.id,
        lastFour || null,
        cardBrand || null,
        installments,
        paymentStatus,
        paymentStatus === 'paid' ? new Date() : null,
        JSON.stringify(paymentResult),
        bookingId,
      ]
    );

    // Se aprovado, atualizar status da reserva (CAS — PR-11b)
    if (paymentStatus === 'paid') {
      const statusResult = await updateBookingStatus(
        bookingId,
        'confirmed',
        undefined,
        customerEmail,
        'Pagamento aprovado via cartão'
      );

      if (statusResult.success) {
        await queryDatabase(
          `UPDATE bookings
           SET
             payment_status = 'paid',
             confirmed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'confirmed'`,
          [bookingId]
        );
      }
    }

    return {
      success: true,
      payment_id: paymentResult.id,
      status: paymentResult.status,
      payment_status: paymentStatus,
      installments: paymentResult.installments,
    };
  } catch (error: any) {
    console.error('Erro ao processar pagamento com cartão:', error);
    throw new Error(`Erro ao processar pagamento com cartão: ${error.message}`);
  }
}

/**
 * Processa evento MP já autenticado pela rota (HMAC obrigatório em
 * app/api/webhooks/mercadopago). Não revalida assinatura aqui.
 * PR-02c: baixa/cancel só após GET /v1/payments/{id} (API = fonte de verdade).
 */
export async function processWebhookEvent(
  eventType: string,
  eventData: any,
  _xSignature?: string,
  _xRequestId?: string,
  deps: Partial<ProcessWebhookEventDeps> = {},
) {
  const resolved = { ...defaultProcessDeps, ...deps };

  // Verificar idempotência
  const webhookId = eventData.id || eventData.data?.id;
  if (webhookId) {
    try {
      const existing = await resolved.queryDatabase(
        `SELECT id FROM webhook_logs WHERE webhook_id = $1 AND processed = TRUE`,
        [webhookId.toString()]
      );

      if (existing.length > 0) {
        return { processed: false, reason: 'Already processed' };
      }
    } catch (error) {
      // Tabela pode não existir, continuar
    }
  }

  // Log do webhook (processed=FALSE até lookup + side-effects ok)
  try {
    await resolved.queryDatabase(
      `CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        webhook_id VARCHAR(255) UNIQUE,
        type VARCHAR(50),
        action VARCHAR(50),
        data JSONB,
        processed BOOLEAN DEFAULT FALSE,
        processed_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    // PR-11b: claim atômico — só o INSERT que ganha o UNIQUE processa side-effects
    const claimed = await resolved.queryDatabase(
      `INSERT INTO webhook_logs (webhook_id, type, action, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (webhook_id) DO NOTHING
       RETURNING id`,
      [
        webhookId?.toString() || `webhook-${Date.now()}`,
        eventType,
        eventData.action || 'unknown',
        JSON.stringify(eventData),
      ]
    );

    if (webhookId && (!claimed || claimed.length === 0)) {
      const existing = await resolved.queryDatabase(
        `SELECT processed FROM webhook_logs WHERE webhook_id = $1`,
        [webhookId.toString()]
      );
      if (existing[0]?.processed) {
        return { processed: false, reason: 'Already processed' };
      }
      return { processed: false, reason: 'Claim held by concurrent delivery' };
    }
  } catch (error) {
    console.error('Erro ao logar webhook:', error);
  }

  if (eventType === 'payment') {
    return await processPaymentWebhook(eventData, resolved);
  } else if (eventType === 'merchant_order') {
    return await processMerchantOrderWebhook(eventData);
  } else if (eventType === 'subscription') {
    return await processSubscriptionWebhook(eventData);
  } else {
    console.log(`Tipo de evento não tratado: ${eventType}`);
    return { processed: false, reason: 'Event type not handled' };
  }
}

/**
 * Processa webhook de pagamento — lookup API sempre (PR-02c).
 * Fail-closed: MpApiUnavailableError → handler responde 503 (reentrega nativa MP).
 */
export async function processPaymentWebhook(
  eventData: any,
  deps: ProcessWebhookEventDeps = defaultProcessDeps,
) {
  const webhookId = eventData?.id ?? eventData?.data?.id;
  const paymentId = eventData.data?.id;
  if (!paymentId) {
    return { processed: false, reason: 'Payment ID not found' };
  }

  const eventStatus =
    typeof eventData.data?.status === 'string' ? eventData.data.status : undefined;

  let paymentDetails: { status?: string; [k: string]: unknown };
  try {
    paymentDetails = await deps.getPaymentStatus(paymentId.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'mp_api_error';
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'mp_payment_lookup_failed',
        surface: 'site-publico',
        paymentId: String(paymentId),
        message,
      }),
    );
    throw new MpApiUnavailableError(message);
  }

  const paymentStatus = paymentDetails?.status;
  if (!paymentStatus || typeof paymentStatus !== 'string') {
    throw new MpApiUnavailableError('MP API returned no payment status');
  }

  logMpStatusDivergence({
    paymentId: String(paymentId),
    eventStatus,
    apiStatus: paymentStatus,
  });

  // Buscar pagamento no banco
  const payments = await deps.queryDatabase(
    'SELECT * FROM payments WHERE gateway_transaction_id = $1',
    [paymentId.toString()]
  );

  if (payments.length === 0) {
    console.log(`Pagamento ${paymentId} não encontrado no banco`);
    return { processed: false, reason: 'Payment not found' };
  }

  const payment = payments[0];
  const newPaymentStatus = mapMpPaymentStatus(paymentStatus);

  // Atualizar status do pagamento se mudou
  if (newPaymentStatus !== payment.payment_status) {
    await deps.queryDatabase(
      `UPDATE payments 
       SET 
         payment_status = $1,
         paid_at = $2,
         gateway_response = $3,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [
        newPaymentStatus,
        newPaymentStatus === 'paid' ? new Date() : payment.paid_at,
        JSON.stringify(paymentDetails || eventData),
        payment.id,
      ]
    );

    console.log(`✅ Pagamento ${paymentId} atualizado: ${payment.payment_status} → ${newPaymentStatus}`);

    await deps.logStatusChange(
      payment.booking_id,
      payment.payment_status as any,
      newPaymentStatus as any,
      undefined,
      'mercadopago',
      `Webhook+API: ${sanitizeMpApiStatusLabel(paymentStatus)}`
    );
  }

  // Atualizar reserva baseado no status da API (nunca no status do evento)
  const booking = await deps.queryDatabase(
    'SELECT * FROM bookings WHERE id = $1',
    [payment.booking_id]
  );

  if (booking.length > 0) {
    const bookingData = booking[0];

    if (newPaymentStatus === 'paid') {
      const statusResult = await deps.updateBookingStatus(
        payment.booking_id,
        'confirmed',
        undefined,
        bookingData.customer_email,
        'Pagamento confirmado via webhook (API MP approved)'
      );

      if (statusResult.success) {
        await deps.queryDatabase(
          `UPDATE bookings
           SET
             payment_status = 'paid',
             confirmed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'confirmed'`,
          [payment.booking_id]
        );
        console.log(`✅ Reserva ${payment.booking_id} confirmada após pagamento`);
      }
    } else if (newPaymentStatus === 'cancelled' || newPaymentStatus === 'failed') {
      const statusResult = await deps.updateBookingStatus(
        payment.booking_id,
        'cancelled',
        undefined,
        bookingData.customer_email,
        `Pagamento ${newPaymentStatus} via webhook (API MP)`
      );

      if (statusResult.success) {
        await deps.queryDatabase(
          `UPDATE bookings
           SET
             payment_status = 'cancelled',
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'cancelled'`,
          [payment.booking_id]
        );
      }
    } else if (newPaymentStatus === 'refunded') {
      const statusResult = await deps.updateBookingStatus(
        payment.booking_id,
        'cancelled',
        undefined,
        bookingData.customer_email,
        'Pagamento reembolsado via webhook (API MP)'
      );

      if (statusResult.success) {
        await deps.queryDatabase(
          `UPDATE bookings
           SET
             payment_status = 'refunded',
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'cancelled'`,
          [payment.booking_id]
        );
      }
    }
  }

  // Marcar webhook como processado só após lookup + side-effects
  if (webhookId) {
    await deps.queryDatabase(
      `UPDATE webhook_logs 
       SET processed = TRUE, processed_at = CURRENT_TIMESTAMP 
       WHERE webhook_id = $1`,
      [webhookId.toString()]
    );
  }

  return { processed: true, payment_status: newPaymentStatus, api_status: paymentStatus };
}

/**
 * Processa webhook de merchant order (opcional)
 */
async function processMerchantOrderWebhook(eventData: any) {
  // Implementar se necessário
  console.log('Merchant order webhook recebido:', eventData);
  return { processed: false, reason: 'Not implemented' };
}

/**
 * Processa webhook de subscription (opcional)
 */
async function processSubscriptionWebhook(eventData: any) {
  // Implementar se necessário
  console.log('Subscription webhook recebido:', eventData);
  return { processed: false, reason: 'Not implemented' };
}

/**
 * Busca histórico de webhooks processados
 */
export async function getWebhookHistory(limit: number = 50) {
  try {
    const history = await queryDatabase(
      `SELECT * FROM webhook_logs 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );

    return history;
  } catch (error) {
    console.error('Erro ao buscar histórico de webhooks:', error);
    return [];
  }
}

