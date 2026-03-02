/**
 * ✅ WEBHOOK SERVICE
 * Serviço completo para gerenciar webhooks (enviar e receber)
 */

import { queryDatabase } from './db';
import * as crypto from 'crypto';

export interface WebhookSubscription {
  id: number;
  user_id: number;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered_at?: Date;
  success_count: number;
  failure_count: number;
}

export interface WebhookDelivery {
  id: number;
  subscription_id: number;
  event_type: string;
  payload: any;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  response_code?: number;
  response_body?: string;
  error_message?: string;
  attempts: number;
  max_attempts: number;
  next_retry_at?: Date;
  delivered_at?: Date;
}

export interface WebhookEvent {
  event_type: string;
  payload: any;
  timestamp: string;
}

/**
 * Eventos disponíveis para webhooks
 */
export const WEBHOOK_EVENTS = {
  // Reservas
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_COMPLETED: 'booking.completed',
  
  // Pagamentos
  PAYMENT_PENDING: 'payment.pending',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Seguros
  INSURANCE_POLICY_CREATED: 'insurance.policy.created',
  INSURANCE_CLAIM_SUBMITTED: 'insurance.claim.submitted',
  INSURANCE_CLAIM_APPROVED: 'insurance.claim.approved',
  INSURANCE_CLAIM_REJECTED: 'insurance.claim.rejected',
  
  // Verificação
  VERIFICATION_SUBMITTED: 'verification.submitted',
  VERIFICATION_APPROVED: 'verification.approved',
  VERIFICATION_REJECTED: 'verification.rejected',
  
  // Klarna
  KLARNA_SESSION_CREATED: 'klarna.session.created',
  KLARNA_PAYMENT_AUTHORIZED: 'klarna.payment.authorized',
  KLARNA_PAYMENT_CAPTURED: 'klarna.payment.captured',
  
  // Kakau
  KAKAU_POLICY_CREATED: 'kakau.policy.created',
  KAKAU_CLAIM_SUBMITTED: 'kakau.claim.submitted',
  KAKAU_CLAIM_APPROVED: 'kakau.claim.approved',
} as const;

/**
 * Criar assinatura HMAC para webhook
 */
export function createWebhookSignature(payload: any, secret: string): string {
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

/**
 * Verificar assinatura de webhook recebido
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Criar subscription de webhook
 */
export async function createWebhookSubscription(
  userId: number,
  url: string,
  events: string[],
  secret?: string
): Promise<WebhookSubscription> {
  // Gerar secret se não fornecido
  const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
  
  // Validar URL
  try {
    new URL(url);
  } catch {
    throw new Error('URL inválida');
  }
  
  // Validar eventos
  const validEvents = Object.values(WEBHOOK_EVENTS);
  const invalidEvents = events.filter(e => !validEvents.includes(e as any));
  if (invalidEvents.length > 0) {
    throw new Error(`Eventos inválidos: ${invalidEvents.join(', ')}`);
  }
  
  const result = await queryDatabase(
    `INSERT INTO webhook_subscriptions (user_id, url, events, secret, is_active)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [userId, url, JSON.stringify(events), webhookSecret]
  );
  
  return result[0];
}

/**
 * Listar subscriptions de um usuário
 */
export async function listWebhookSubscriptions(
  userId: number
): Promise<WebhookSubscription[]> {
  const result = await queryDatabase(
    `SELECT * FROM webhook_subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  
  return result.map(sub => ({
    ...sub,
    events: typeof sub.events === 'string' ? JSON.parse(sub.events) : sub.events
  }));
}

/**
 * Atualizar subscription
 */
export async function updateWebhookSubscription(
  subscriptionId: number,
  userId: number,
  updates: {
    url?: string;
    events?: string[];
    is_active?: boolean;
  }
): Promise<WebhookSubscription> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (updates.url) {
    updatesList.push(`url = $${paramCount++}`);
    values.push(updates.url);
  }
  
  if (updates.events) {
    updatesList.push(`events = $${paramCount++}`);
    values.push(JSON.stringify(updates.events));
  }
  
  if (updates.is_active !== undefined) {
    updatesList.push(`is_active = $${paramCount++}`);
    values.push(updates.is_active);
  }
  
  if (updatesList.length === 0) {
    throw new Error('Nenhuma atualização fornecida');
  }
  
  values.push(subscriptionId, userId);
  
  const result = await queryDatabase(
    `UPDATE webhook_subscriptions
     SET ${updatesList.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount++} AND user_id = $${paramCount++}
     RETURNING *`,
    values
  );
  
  if (result.length === 0) {
    throw new Error('Subscription não encontrada');
  }
  
  return {
    ...result[0],
    events: typeof result[0].events === 'string' ? JSON.parse(result[0].events) : result[0].events
  };
}

/**
 * Deletar subscription
 */
export async function deleteWebhookSubscription(
  subscriptionId: number,
  userId: number
): Promise<void> {
  const result = await queryDatabase(
    `DELETE FROM webhook_subscriptions
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [subscriptionId, userId]
  );
  
  if (result.length === 0) {
    throw new Error('Subscription não encontrada');
  }
}

/**
 * Enviar webhook (trigger event)
 */
export async function triggerWebhook(
  eventType: string,
  payload: any
): Promise<void> {
  // Buscar todas as subscriptions ativas que escutam este evento
  const subscriptions = await queryDatabase(
    `SELECT * FROM webhook_subscriptions
     WHERE is_active = true
     AND $1 = ANY(events)`,
    [eventType]
  );
  
  // Criar deliveries para cada subscription
  for (const subscription of subscriptions) {
    const events = typeof subscription.events === 'string' 
      ? JSON.parse(subscription.events) 
      : subscription.events;
    
    if (!events.includes(eventType)) continue;
    
    // Criar delivery
    const delivery = await queryDatabase(
      `INSERT INTO webhook_deliveries 
       (subscription_id, event_type, payload, status, attempts, max_attempts)
       VALUES ($1, $2, $3, 'pending', 0, 3)
       RETURNING *`,
      [subscription.id, eventType, JSON.stringify(payload)]
    );
    
    // Enviar webhook (async, não aguardar)
    sendWebhookDelivery(delivery[0].id, subscription, eventType, payload).catch(
      error => console.error('Erro ao enviar webhook:', error)
    );
  }
}

/**
 * Enviar delivery de webhook
 */
async function sendWebhookDelivery(
  deliveryId: number,
  subscription: any,
  eventType: string,
  payload: any
): Promise<void> {
  const webhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload
  };
  
  const signature = createWebhookSignature(webhookPayload, subscription.secret);
  
  try {
    const response = await fetch(subscription.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'User-Agent': 'RSV-Gen2-Webhook/1.0'
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });
    
    const responseBody = await response.text();
    
    // Atualizar delivery
    await queryDatabase(
      `UPDATE webhook_deliveries
       SET status = $1,
           response_code = $2,
           response_body = $3,
           attempts = attempts + 1,
           delivered_at = CASE WHEN $1 = 'success' THEN CURRENT_TIMESTAMP ELSE delivered_at END
       WHERE id = $4`,
      [
        response.ok ? 'success' : 'failed',
        response.status,
        responseBody.substring(0, 1000), // Limitar tamanho
        deliveryId
      ]
    );
    
    // Atualizar subscription stats
    await queryDatabase(
      `UPDATE webhook_subscriptions
       SET ${response.ok ? 'success_count = success_count + 1' : 'failure_count = failure_count + 1'},
           last_triggered_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [subscription.id]
    );
    
    // Se falhou e ainda tem tentativas, agendar retry
    if (!response.ok && subscription.attempts < subscription.max_attempts) {
      const nextRetry = new Date();
      nextRetry.setMinutes(nextRetry.getMinutes() + Math.pow(2, subscription.attempts) * 5); // Backoff exponencial
      
      await queryDatabase(
        `UPDATE webhook_deliveries
         SET status = 'retrying',
             next_retry_at = $1
         WHERE id = $2`,
        [nextRetry, deliveryId]
      );
    }
  } catch (error: any) {
    // Atualizar delivery com erro
    await queryDatabase(
      `UPDATE webhook_deliveries
       SET status = 'failed',
           error_message = $1,
           attempts = attempts + 1
       WHERE id = $2`,
      [error.message?.substring(0, 500), deliveryId]
    );
    
    // Atualizar subscription stats
    await queryDatabase(
      `UPDATE webhook_subscriptions
       SET failure_count = failure_count + 1
       WHERE id = $1`,
      [subscription.id]
    );
  }
}

/**
 * Processar webhook recebido (de serviço externo)
 */
export async function processReceivedWebhook(
  source: string,
  eventType: string,
  payload: any,
  signature?: string
): Promise<void> {
  // Verificar idempotência
  const eventId = payload.id || payload.event_id || `${source}-${Date.now()}`;
  
  const existing = await queryDatabase(
    `SELECT id FROM webhook_events
     WHERE event_id = $1 AND source = $2`,
    [eventId, source]
  );
  
  if (existing.length > 0) {
    console.log(`Evento ${eventId} já processado, ignorando`);
    return;
  }
  
  // Registrar evento recebido
  const received = await queryDatabase(
    `INSERT INTO webhook_received (source, event_type, payload, signature, is_verified)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [source, eventType, JSON.stringify(payload), signature || null, !!signature]
  );
  
  // Processar evento baseado na fonte
  try {
    await handleWebhookEvent(source, eventType, payload);
    
    // Marcar como processado
    await queryDatabase(
      `UPDATE webhook_received
       SET is_processed = true,
           processed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [received[0].id]
    );
    
    // Registrar no controle de idempotência
    await queryDatabase(
      `INSERT INTO webhook_events (event_id, source, event_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, source) DO NOTHING`,
      [eventId, source, eventType]
    );
  } catch (error: any) {
    // Marcar erro
    await queryDatabase(
      `UPDATE webhook_received
       SET processing_error = $1
       WHERE id = $2`,
      [error.message?.substring(0, 500), received[0].id]
    );
    throw error;
  }
}

/**
 * Handler para processar eventos de webhooks recebidos
 */
async function handleWebhookEvent(
  source: string,
  eventType: string,
  payload: any
): Promise<void> {
  switch (source) {
    case 'kakau':
      await handleKakauWebhook(eventType, payload);
      break;
    case 'klarna':
      await handleKlarnaWebhook(eventType, payload);
      break;
    default:
      console.warn(`Handler não implementado para fonte: ${source}`);
  }
}

/**
 * Handler para webhooks da Kakau
 */
async function handleKakauWebhook(eventType: string, payload: any): Promise<void> {
  switch (eventType) {
    case 'policy.status_changed':
      // Atualizar status da apólice
      await queryDatabase(
        `UPDATE insurance_policies
         SET status = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE provider_policy_id = $2`,
        [payload.status, payload.policy_id]
      );
      
      // Trigger webhook interno
      await triggerWebhook(WEBHOOK_EVENTS.INSURANCE_POLICY_CREATED, {
        policy_id: payload.policy_id,
        status: payload.status
      });
      break;
      
    case 'claim.status_changed':
      // Atualizar status do sinistro
      await queryDatabase(
        `UPDATE insurance_claims
         SET status = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE provider_claim_id = $2`,
        [payload.status, payload.claim_id]
      );
      
      // Trigger webhook interno
      const webhookEvent = payload.status === 'approved' 
        ? WEBHOOK_EVENTS.INSURANCE_CLAIM_APPROVED
        : WEBHOOK_EVENTS.INSURANCE_CLAIM_REJECTED;
      
      await triggerWebhook(webhookEvent, {
        claim_id: payload.claim_id,
        status: payload.status
      });
      break;
  }
}

/**
 * Handler para webhooks da Klarna
 */
async function handleKlarnaWebhook(eventType: string, payload: any): Promise<void> {
  switch (eventType) {
    case 'payment.authorized':
      await triggerWebhook(WEBHOOK_EVENTS.KLARNA_PAYMENT_AUTHORIZED, payload);
      break;
      
    case 'payment.captured':
      await triggerWebhook(WEBHOOK_EVENTS.KLARNA_PAYMENT_CAPTURED, payload);
      
      // Atualizar status do pagamento
      if (payload.order_id) {
        await queryDatabase(
          `UPDATE bookings
           SET payment_status = 'paid',
               updated_at = CURRENT_TIMESTAMP
           WHERE klarna_order_id = $1`,
          [payload.order_id]
        );
      }
      break;
      
    case 'payment.cancelled':
      await triggerWebhook(WEBHOOK_EVENTS.PAYMENT_FAILED, payload);
      break;
  }
}

/**
 * Retry deliveries falhados
 */
export async function retryFailedWebhookDeliveries(): Promise<void> {
  const failedDeliveries = await queryDatabase(
    `SELECT wd.*, ws.url, ws.secret, ws.events
     FROM webhook_deliveries wd
     JOIN webhook_subscriptions ws ON wd.subscription_id = ws.id
     WHERE wd.status IN ('retrying', 'failed')
     AND wd.attempts < wd.max_attempts
     AND (wd.next_retry_at IS NULL OR wd.next_retry_at <= CURRENT_TIMESTAMP)
     AND ws.is_active = true
     LIMIT 50`
  );
  
  for (const delivery of failedDeliveries) {
    const subscription = {
      id: delivery.subscription_id,
      url: delivery.url,
      secret: delivery.secret,
      events: typeof delivery.events === 'string' ? JSON.parse(delivery.events) : delivery.events,
      attempts: delivery.attempts,
      max_attempts: delivery.max_attempts
    };
    
    const payload = typeof delivery.payload === 'string' 
      ? JSON.parse(delivery.payload) 
      : delivery.payload;
    
    await sendWebhookDelivery(delivery.id, subscription, delivery.event_type, payload);
  }
}

