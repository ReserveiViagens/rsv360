/**
 * Adapter Mercado Pago para Split de Pagamento Marketplace
 * Integra com a API de pagamentos do MP para divisão automática
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/split-payments/landing
 */

import type { SplitResult } from './types';

const BASE_URL = 'https://api.mercadopago.com';
const WEBHOOK_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/mercadopago`
  : 'http://localhost:3000/api/webhooks/mercadopago';

export interface SplitPaymentRequest {
  amount: number;
  description: string;
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification?: { type: string; number: string };
  };
  payment_method_id: 'pix' | 'credit_card' | 'debit_card' | 'bolbradesco' | 'pec';
  metadata?: { booking_code?: string; booking_id?: number };
  split: SplitResult;
  receiver_external_id?: string;
  receiver_pix_key?: string;
}

export interface SplitPaymentResponse {
  id: string;
  status: string;
  status_detail?: string;
  transaction_amount: number;
  platform_amount: number;
  qr_code?: string;
  qr_code_base64?: string;
  date_of_expiration?: string;
  requires_3ds?: boolean;
  three_ds_info?: unknown;
}

/**
 * Criar pagamento PIX com split
 * application_fee = valor que fica com a plataforma (comissão)
 */
export async function createPixPaymentWithSplit(
  request: SplitPaymentRequest
): Promise<SplitPaymentResponse> {
  const accessToken =
    process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '';

  if (!accessToken) {
    return createMockSplitPayment(request, 'pix');
  }

  const platformAmount = request.split.platform_amount;
  const partnerAmount = request.amount - platformAmount;

  const paymentData: Record<string, unknown> = {
    transaction_amount: request.amount,
    description: request.description,
    payment_method_id: 'pix',
    payer: {
      email: request.payer.email,
      first_name: request.payer.first_name,
      last_name: request.payer.last_name || '',
      identification: request.payer.identification || undefined,
    },
    metadata: request.metadata || {},
    notification_url: WEBHOOK_URL,
    date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    application_fee: platformAmount,
  };

  const response = await fetch(`${BASE_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Idempotency-Key': `${request.metadata?.booking_code || 'split'}-${Date.now()}`,
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Mercado Pago error: ${response.status}`);
  }

  const result = await response.json();
  const qrCode =
    result.point_of_interaction?.transaction_data?.qr_code ||
    result.point_of_interaction?.transaction_data?.qr_code_base64;

  return {
    id: String(result.id),
    status: result.status,
    status_detail: result.status_detail,
    transaction_amount: result.transaction_amount,
    platform_amount: platformAmount,
    qr_code: qrCode,
    qr_code_base64: qrCode,
    date_of_expiration: result.date_of_expiration,
  };
}

/**
 * Criar pagamento com cartão e split
 */
export async function createCardPaymentWithSplit(
  request: SplitPaymentRequest & { token: string; installments?: number }
): Promise<SplitPaymentResponse> {
  const accessToken =
    process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '';

  if (!accessToken) {
    return createMockSplitPayment(request, 'card');
  }

  const platformAmount = request.split.platform_amount;

  const paymentData: Record<string, unknown> = {
    transaction_amount: request.amount,
    description: request.description,
    payment_method_id: request.payment_method_id,
    installments: request.installments || 1,
    token: request.token,
    payer: {
      email: request.payer.email,
      identification: request.payer.identification || undefined,
    },
    metadata: request.metadata || {},
    notification_url: WEBHOOK_URL,
    statement_descriptor: 'RSV 360°',
    application_fee: platformAmount,
  };

  const response = await fetch(`${BASE_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Idempotency-Key': `${request.metadata?.booking_code || 'split'}-${Date.now()}`,
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Mercado Pago error: ${response.status}`);
  }

  const result = await response.json();

  return {
    id: String(result.id),
    status: result.status,
    status_detail: result.status_detail,
    transaction_amount: result.transaction_amount,
    platform_amount: platformAmount,
    requires_3ds: result.status === 'pending' && result.status_detail === 'pending_challenge',
    three_ds_info: result.three_ds_info,
  };
}

/**
 * Fallback: quando MP não está configurado ou split não suportado
 * Registra split localmente; repasse manual ao parceiro
 */
function createMockSplitPayment(
  request: SplitPaymentRequest,
  method: string
): SplitPaymentResponse {
  const id = `MP-MOCK-${Date.now()}`;
  console.warn(
    '[MarketplaceSplit] Mercado Pago não configurado - usando modo simulado. Configure application_fee no painel MP para split real.'
  );

  if (method === 'pix') {
    return {
      id,
      status: 'pending',
      status_detail: 'pending_waiting_payment',
      transaction_amount: request.amount,
      platform_amount: request.split.platform_amount,
      qr_code: `00020126580014br.gov.bcb.pix0134mock-${id}`,
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  return {
    id,
    status: 'approved',
    status_detail: 'accredited',
    transaction_amount: request.amount,
    platform_amount: request.split.platform_amount,
  };
}
