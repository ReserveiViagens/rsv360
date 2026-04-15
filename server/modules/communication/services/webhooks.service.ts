// Communication Service — Webhooks

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { commWebhooks, commMessages } from '../db/schema';

export interface WebhookPayload {
  provider: string;
  event: string;
  data: any;
  signature?: string;
  timestamp?: string;
}

export interface WebhookConfig {
  id: string;
  enterpriseId: string;
  provider: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  retryCount?: number;
  lastDelivery?: Date;
}

export class WebhooksService {
  // Registrar webhook
  static async createWebhook(config: Omit<WebhookConfig, 'id'>) {
    try {
      const [webhook] = await db
        .insert(commWebhooks)
        .values({
          enterpriseId: config.enterpriseId,
          provider: config.provider,
          url: config.url,
          secret: config.secret,
          events: config.events,
          isActive: config.isActive,
        })
        .returning();

      return { success: true, webhook };
    } catch (error: any) {
      console.error('WebhooksService.createWebhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listar webhooks
  static async listWebhooks(enterpriseId: string) {
    try {
      const webhooks = await db
        .select()
        .from(commWebhooks)
        .where(eq(commWebhooks.enterpriseId, enterpriseId))
        .orderBy(desc(commWebhooks.createdAt));

      return webhooks;
    } catch (error: any) {
      console.error('WebhooksService.listWebhooks error:', error);
      throw error;
    }
  }

  // Buscar webhook por ID
  static async getWebhookById(id: string, enterpriseId: string) {
    try {
      const [webhook] = await db
        .select()
        .from(commWebhooks)
        .where(
          and(
            eq(commWebhooks.id, id),
            eq(commWebhooks.enterpriseId, enterpriseId)
          )
        )
        .limit(1);

      return webhook || null;
    } catch (error: any) {
      console.error('WebhooksService.getWebhookById error:', error);
      throw error;
    }
  }

  // Atualizar webhook
  static async updateWebhook(id: string, enterpriseId: string, updates: Partial<WebhookConfig>) {
    try {
      const [webhook] = await db
        .update(commWebhooks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(commWebhooks.id, id),
            eq(commWebhooks.enterpriseId, enterpriseId)
          )
        )
        .returning();

      return { success: true, webhook };
    } catch (error: any) {
      console.error('WebhooksService.updateWebhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Deletar webhook
  static async deleteWebhook(id: string, enterpriseId: string) {
    try {
      await db
        .delete(commWebhooks)
        .where(
          and(
            eq(commWebhooks.id, id),
            eq(commWebhooks.enterpriseId, enterpriseId)
          )
        );

      return { success: true };
    } catch (error: any) {
      console.error('WebhooksService.deleteWebhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Processar webhook de provider
  static async processWebhook(provider: string, payload: WebhookPayload) {
    try {
      // Buscar webhooks ativos para este provider e evento
      const webhooks = await db
        .select()
        .from(commWebhooks)
        .where(
          and(
            eq(commWebhooks.provider, provider),
            eq(commWebhooks.isActive, true)
          )
        );

      const relevantWebhooks = webhooks.filter(webhook =>
        webhook.events.includes(payload.event) || webhook.events.includes('*')
      );

      if (relevantWebhooks.length === 0) {
        console.log(`No active webhooks for provider ${provider} and event ${payload.event}`);
        return { processed: 0 };
      }

      // Processar cada webhook
      const results = await Promise.allSettled(
        relevantWebhooks.map(webhook => this.deliverWebhook(webhook, payload))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`Webhook processing: ${successful} successful, ${failed} failed`);

      return { processed: relevantWebhooks.length, successful, failed };
    } catch (error: any) {
      console.error('WebhooksService.processWebhook error:', error);
      throw error;
    }
  }

  // Entregar webhook para URL específica
  private static async deliverWebhook(webhook: any, payload: WebhookPayload) {
    try {
      const webhookPayload = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        provider: payload.provider,
        event: payload.event,
        data: payload.data,
      };

      // Gerar assinatura HMAC se secret estiver configurado
      let signature: string | undefined;
      if (webhook.secret) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(webhookPayload));
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhook.secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
        signature = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }

      // Enviar para URL do webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RSV360-Webhook/1.0',
          ...(signature && { 'X-Signature': `sha256=${signature}` }),
          'X-Webhook-ID': webhook.id,
          'X-Provider': payload.provider,
          'X-Event': payload.event,
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Atualizar lastDelivery
      await db
        .update(commWebhooks)
        .set({
          lastDelivery: new Date(),
          retryCount: 0, // Reset retry count on success
        })
        .where(eq(commWebhooks.id, webhook.id));

      console.log(`Webhook delivered successfully to ${webhook.url}`);
      return { success: true };
    } catch (error: any) {
      console.error(`Webhook delivery failed for ${webhook.url}:`, error);

      // Incrementar retry count
      await db
        .update(commWebhooks)
        .set({
          retryCount: (webhook.retryCount || 0) + 1,
        })
        .where(eq(commWebhooks.id, webhook.id));

      throw error;
    }
  }

  // Validar assinatura do webhook
  static async validateWebhookSignature(webhookId: string, payload: string, signature: string) {
    try {
      const webhook = await db
        .select()
        .from(commWebhooks)
        .where(eq(commWebhooks.id, webhookId))
        .limit(1);

      if (!webhook[0] || !webhook[0].secret) {
        return false;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhook[0].secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const expectedSignatureBuffer = await crypto.subtle.sign('HMAC', key, data);
      const expectedSignature = Array.from(new Uint8Array(expectedSignatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return `sha256=${expectedSignature}` === signature;
    } catch (error: any) {
      console.error('WebhooksService.validateWebhookSignature error:', error);
      return false;
    }
  }

  // Processar webhook específico de provider (ex: status update)
  static async processProviderWebhook(provider: string, payload: WebhookPayload) {
    try {
      // Processar webhooks customizados
      await this.processWebhook(provider, payload);

      // Processar updates específicos do provider
      switch (provider) {
        case 'sendgrid':
          await this.processSendGridWebhook(payload);
          break;
        case 'twilio':
          await this.processTwilioWebhook(payload);
          break;
        case 'whatsapp':
          await this.processWhatsAppWebhook(payload);
          break;
        case 'firebase':
          await this.processFirebaseWebhook(payload);
          break;
        default:
          console.log(`Unknown provider webhook: ${provider}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('WebhooksService.processProviderWebhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Processar webhook do SendGrid
  private static async processSendGridWebhook(payload: WebhookPayload) {
    // Exemplo: atualizar status de email
    if (payload.event === 'delivered' || payload.event === 'bounce' || payload.event === 'spam') {
      const messageId = payload.data?.messageId;
      if (messageId) {
        await db
          .update(commMessages)
          .set({
            status: payload.event,
            updatedAt: new Date(),
          })
          .where(eq(commMessages.externalId, messageId));
      }
    }
  }

  // Processar webhook do Twilio
  private static async processTwilioWebhook(payload: WebhookPayload) {
    // Exemplo: atualizar status de SMS
    if (payload.event === 'delivered' || payload.event === 'failed') {
      const messageSid = payload.data?.MessageSid;
      if (messageSid) {
        await db
          .update(commMessages)
          .set({
            status: payload.event,
            updatedAt: new Date(),
          })
          .where(eq(commMessages.externalId, messageSid));
      }
    }
  }

  // Processar webhook do WhatsApp
  private static async processWhatsAppWebhook(payload: WebhookPayload) {
    // Exemplo: processar mensagem inbound
    if (payload.event === 'message' && payload.data?.direction === 'inbound') {
      // TODO: integrar com MessagesService para processar inbound
      console.log('WhatsApp inbound message:', payload.data);
    }
  }

  // Processar webhook do Firebase
  private static async processFirebaseWebhook(payload: WebhookPayload) {
    // Exemplo: atualizar status de push notification
    if (payload.event === 'delivered' || payload.event === 'failed') {
      const messageId = payload.data?.messageId;
      if (messageId) {
        await db
          .update(commMessages)
          .set({
            status: payload.event,
            updatedAt: new Date(),
          })
          .where(eq(commMessages.externalId, messageId));
      }
    }
  }
}