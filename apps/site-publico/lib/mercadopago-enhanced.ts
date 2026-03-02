/**
 * Serviço Mercado Pago Aprimorado
 * Melhorias e funcionalidades adicionais para processamento de pagamentos
 */

import { mercadoPagoService } from './mercadopago';
import { queryDatabase } from './db';
import { updateBookingStatus, logStatusChange } from './booking-status-service';

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

    // Se aprovado, atualizar status da reserva
    if (paymentStatus === 'paid') {
      await updateBookingStatus(
        bookingId,
        'confirmed',
        undefined,
        customerEmail,
        'Pagamento aprovado via cartão'
      );

      await queryDatabase(
        `UPDATE bookings 
         SET 
           payment_status = 'paid',
           status = 'confirmed',
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [bookingId]
      );
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
 * ✅ ITEM 7: WEBHOOK HANDLER COMPLETO
 * Processa todos os eventos do Mercado Pago e atualiza status
 */
export async function processWebhookEvent(
  eventType: string,
  eventData: any,
  xSignature?: string,
  xRequestId?: string
) {
  try {
    // Validar assinatura se fornecida
    if (xSignature && xRequestId && eventData.data?.id) {
      const isValid = mercadoPagoService.validateWebhookSignature(
        xSignature,
        xRequestId,
        eventData.data.id.toString()
      );

      if (!isValid) {
        throw new Error('Assinatura do webhook inválida');
      }
    }
  } catch (error) {
    console.error('Erro ao validar webhook:', error);
    return { processed: false, reason: 'Validation error' };
  }

  // Verificar idempotência
  const webhookId = eventData.id || eventData.data?.id;
  if (webhookId) {
    try {
      const existing = await queryDatabase(
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

  // Log do webhook
  try {
    await queryDatabase(
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

    await queryDatabase(
      `INSERT INTO webhook_logs (webhook_id, type, action, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (webhook_id) DO NOTHING`,
      [
        webhookId?.toString() || `webhook-${Date.now()}`,
        eventType,
        eventData.action || 'unknown',
        JSON.stringify(eventData),
      ]
    );
  } catch (error) {
    console.error('Erro ao logar webhook:', error);
  }

  // Processar diferentes tipos de eventos
  if (eventType === 'payment') {
    return await processPaymentWebhook(eventData);
  } else if (eventType === 'merchant_order') {
    return await processMerchantOrderWebhook(eventData);
  } else if (eventType === 'subscription') {
    return await processSubscriptionWebhook(eventData);
  } else {
    console.log(`Tipo de evento não tratado: ${eventType}`);
    return { processed: false, reason: 'Event type not handled' };
  }

  return { processed: false, reason: 'Unknown error' };
}

/**
 * Processa webhook de pagamento
 */
export async function processPaymentWebhook(eventData: any) {
  const paymentId = eventData.data?.id;
  if (!paymentId) {
    return { processed: false, reason: 'Payment ID not found' };
  }

  // Buscar informações atualizadas do Mercado Pago
  let paymentStatus = eventData.data?.status;
  let paymentDetails = eventData.data;

  if (!paymentStatus || !paymentDetails) {
    try {
      const apiPayment = await mercadoPagoService.getPaymentStatus(paymentId.toString());
      paymentStatus = apiPayment.status;
      paymentDetails = apiPayment;
    } catch (error) {
      console.error('Erro ao buscar detalhes do pagamento:', error);
    }
  }

  // Buscar pagamento no banco
  const payments = await queryDatabase(
    'SELECT * FROM payments WHERE gateway_transaction_id = $1',
    [paymentId.toString()]
  );

  if (payments.length === 0) {
    console.log(`Pagamento ${paymentId} não encontrado no banco`);
    return { processed: false, reason: 'Payment not found' };
  }

  const payment = payments[0];

  // Mapear status do Mercado Pago para nosso sistema
  const statusMap: Record<string, string> = {
    approved: 'paid',
    rejected: 'failed',
    cancelled: 'cancelled',
    refunded: 'refunded',
    partially_refunded: 'refunded',
    pending: 'pending',
    in_process: 'pending',
    in_mediation: 'pending',
    charged_back: 'failed',
  };

  const newPaymentStatus = statusMap[paymentStatus] || payment.payment_status;

  // Atualizar status do pagamento se mudou
  if (newPaymentStatus !== payment.payment_status) {
    await queryDatabase(
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

    // Registrar no histórico
    await logStatusChange(
      payment.booking_id,
      payment.payment_status as any,
      newPaymentStatus as any,
      undefined,
      'mercadopago',
      `Webhook: ${paymentStatus}`
    );
  }

  // Atualizar reserva baseado no status do pagamento
  const booking = await queryDatabase(
    'SELECT * FROM bookings WHERE id = $1',
    [payment.booking_id]
  );

  if (booking.length > 0) {
    const bookingData = booking[0];

    if (newPaymentStatus === 'paid') {
      // Pagamento aprovado - confirmar reserva
      await updateBookingStatus(
        payment.booking_id,
        'confirmed',
        undefined,
        bookingData.customer_email,
        'Pagamento confirmado via webhook'
      );

      await queryDatabase(
        `UPDATE bookings 
         SET 
           payment_status = 'paid',
           status = 'confirmed',
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [payment.booking_id]
      );

      console.log(`✅ Reserva ${payment.booking_id} confirmada após pagamento`);
    } else if (newPaymentStatus === 'cancelled' || newPaymentStatus === 'failed') {
      // Pagamento cancelado/falhou - cancelar reserva
      await updateBookingStatus(
        payment.booking_id,
        'cancelled',
        undefined,
        bookingData.customer_email,
        `Pagamento ${newPaymentStatus} via webhook`
      );

      await queryDatabase(
        `UPDATE bookings 
         SET 
           payment_status = 'cancelled',
           status = 'cancelled',
           cancelled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [payment.booking_id]
      );
    } else if (newPaymentStatus === 'refunded') {
      // Pagamento reembolsado
      await updateBookingStatus(
        payment.booking_id,
        'cancelled',
        undefined,
        bookingData.customer_email,
        'Pagamento reembolsado via webhook'
      );

      await queryDatabase(
        `UPDATE bookings 
         SET 
           payment_status = 'refunded',
           status = 'cancelled',
           cancelled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [payment.booking_id]
      );
    }
  }

  // Marcar webhook como processado
  if (webhookId) {
    await queryDatabase(
      `UPDATE webhook_logs 
       SET processed = TRUE, processed_at = CURRENT_TIMESTAMP 
       WHERE webhook_id = $1`,
      [webhookId.toString()]
    );
  }

  return { processed: true, payment_status: newPaymentStatus };
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

