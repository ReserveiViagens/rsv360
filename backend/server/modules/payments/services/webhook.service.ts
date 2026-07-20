import { eq } from 'drizzle-orm';
const { db } = require('../../../../src/db/drizzle');
const { webhookEvents } = require('../../../../src/db/schema');
import { getPaymentProvider } from '../factory';
import { WebhookEvent } from '../interfaces';

export class WebhookService {
  private provider = getPaymentProvider();

  async processStripeWebhook(payload: string, signature: string): Promise<void> {
    if (!this.provider.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid signature');
    }

    const event = JSON.parse(payload);
    await this.saveEvent('stripe', event.id, event.type, event);

    // Process event
    await this.processEvent(event.id);
  }

  async processMPWebhook(payload: any): Promise<void> {
    // MP webhook processing
    await this.saveEvent('mercadopago', payload.id, payload.type, payload);
    await this.processEvent(payload.id);
  }

  verifySignature(payload: string, signature: string): boolean {
    return this.provider.verifyWebhookSignature(payload, signature);
  }

  async saveEvent(provider: string, externalEventId: string, eventType: string, payload: any): Promise<void> {
    // Check idempotency
    const existing = await db.select().from(webhookEvents)
      .where(eq(webhookEvents.externalEventId, externalEventId)).limit(1);

    if (existing.length) return; // Already processed

    await db.insert(webhookEvents).values({
      provider: provider as any,
      externalEventId,
      eventType,
      payload,
    });
  }

  async processEvent(eventId: string): Promise<void> {
    const event = await db.select().from(webhookEvents)
      .where(eq(webhookEvents.externalEventId, eventId)).limit(1);

    if (!event.length) return;

    // Process based on event type
    // Update payment/subscription status accordingly

    await db.update(webhookEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(webhookEvents.id, event[0].id));
  }

  async retryFailedEvents(): Promise<void> {
    const failedEvents = await db.select().from(webhookEvents)
      .where(eq(webhookEvents.processed, false));

    for (const event of failedEvents) {
      try {
        await this.processEvent(event.externalEventId);
      } catch (error) {
        await db.update(webhookEvents)
          .set({ error: (error as Error).message, retryCount: event.retryCount + 1 })
          .where(eq(webhookEvents.id, event.id));
      }
    }
  }

  async getEventLog(limit = 10, offset = 0): Promise<WebhookEvent[]> {
    const results = await db.select().from(webhookEvents)
      .limit(limit)
      .offset(offset)
      .orderBy(webhookEvents.createdAt);

    return results.map((e: {
      provider: string;
      externalEventId: string;
      eventType: string;
      payload: unknown;
      processed: boolean;
      error: string | null;
    }) => ({
      provider: e.provider,
      externalEventId: e.externalEventId,
      eventType: e.eventType,
      payload: e.payload as any,
      processed: e.processed,
      error: e.error || undefined,
    }));
  }
}