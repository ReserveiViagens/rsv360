import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { commMessages } from '../db/schema';
import { getActiveProvider } from '../providers/factory';
import { TemplatesService } from './templates.service';

type EnqueuePayload = {
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  recipient: string;
  recipientName?: string;
  templateId: string;
  variables?: Record<string, any>;
  bookingId?: string;
  scheduledAt?: Date | null;
};

const BACKOFF_MINUTES = [1, 5, 30];

export class QueueService {
  static async enqueueMessage(enterpriseId: string, payload: EnqueuePayload) {
    const rendered = await TemplatesService.renderTemplate(payload.templateId, payload.variables || {});

    const provider = await getActiveProvider(db, enterpriseId, payload.channel);
    const providerName =
      payload.channel === 'email'
        ? provider.email?.name || 'smtp'
        : payload.channel === 'sms'
          ? provider.sms?.name || 'twilio'
          : payload.channel === 'whatsapp'
            ? provider.whatsapp?.name || 'whatsapp_business'
            : provider.push?.name || 'firebase';

    const [message] = await db
      .insert(commMessages)
      .values({
        enterpriseId,
        channel: payload.channel as any,
        provider: providerName as any,
        direction: 'outbound',
        status: 'pending',
        subject: rendered.subject || undefined,
        content: rendered.body,
        templateId: payload.templateId,
        metadata: {
          recipient: payload.recipient,
          recipientName: payload.recipientName,
          bookingId: payload.bookingId,
          retryCount: 0,
          maxRetries: 3,
          nextAttemptAt: payload.scheduledAt || new Date(),
          variables: payload.variables || {},
        },
      } as any)
      .returning();

    return message;
  }

  static async processQueue() {
    const pending = await db
      .select()
      .from(commMessages)
      .where(eq(commMessages.status, 'pending'))
      .orderBy(asc(commMessages.createdAt))
      .limit(50);

    let sent = 0;
    let failed = 0;
    const now = Date.now();

    for (const msg of pending) {
      const metadata: any = msg.metadata || {};
      const nextAttemptAt = metadata.nextAttemptAt ? new Date(metadata.nextAttemptAt).getTime() : 0;
      if (nextAttemptAt > now) continue;

      try {
        await db
          .update(commMessages)
          .set({ status: 'sent', sentAt: new Date() } as any)
          .where(eq(commMessages.id, msg.id));

        const provider = await getActiveProvider(db, msg.enterpriseId, msg.channel as any);
        const recipient = metadata.recipient;
        let result: { success: boolean; messageId?: string; error?: string } = { success: false };

        if (msg.channel === 'email' && provider.email) {
          result = await provider.email.sendEmail(recipient, msg.subject || 'Mensagem RSV360', msg.content);
        } else if (msg.channel === 'sms' && provider.sms) {
          result = await provider.sms.sendSMS(recipient, msg.content);
        } else if (msg.channel === 'whatsapp' && provider.whatsapp) {
          if (provider.whatsapp.sendTextMessage) {
            result = await provider.whatsapp.sendTextMessage(recipient, msg.content);
          } else {
            result = await provider.whatsapp.sendMessage(recipient, msg.content);
          }
        }

        if (!result.success) throw new Error(result.error || 'Falha no envio');

        await db
          .update(commMessages)
          .set({
            status: 'sent',
            externalId: result.messageId,
            sentAt: new Date(),
            errorMessage: null,
          } as any)
          .where(eq(commMessages.id, msg.id));
        sent += 1;
      } catch (error: any) {
        const retryCount = Number(metadata.retryCount || 0) + 1;
        const maxRetries = Number(metadata.maxRetries || 3);
        const nextMinutes = BACKOFF_MINUTES[retryCount - 1] || 30;
        const isFinalFailure = retryCount >= maxRetries;

        await db
          .update(commMessages)
          .set({
            status: isFinalFailure ? 'failed' : 'pending',
            errorMessage: error.message,
            metadata: {
              ...metadata,
              retryCount,
              maxRetries,
              nextAttemptAt: isFinalFailure ? undefined : new Date(Date.now() + nextMinutes * 60000),
            },
          } as any)
          .where(eq(commMessages.id, msg.id));
        failed += 1;
        console.error(`[COMM] Falha ao enviar msg ${msg.id}: ${error.message}`);
      }
    }

    if (sent + failed > 0) {
      console.info(`[COMM] Queue processada: ${sent} sent, ${failed} failed`);
    }
    return { sent, failed, total: pending.length };
  }

  static async retryFailed(enterpriseId: string) {
    const failed = await db
      .select()
      .from(commMessages)
      .where(and(eq(commMessages.enterpriseId, enterpriseId), eq(commMessages.status, 'failed')));

    let requeued = 0;
    for (const msg of failed) {
      const metadata: any = msg.metadata || {};
      if ((metadata.retryCount || 0) < (metadata.maxRetries || 3)) {
        await db
          .update(commMessages)
          .set({
            status: 'pending',
            metadata: { ...metadata, nextAttemptAt: new Date() },
          } as any)
          .where(eq(commMessages.id, msg.id));
        requeued += 1;
      }
    }
    return { requeued };
  }
}
