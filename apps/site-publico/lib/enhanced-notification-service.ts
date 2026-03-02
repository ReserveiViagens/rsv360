/**
 * ✅ SERVIÇO DE NOTIFICAÇÕES MULTI-CANAL MELHORADO
 * 
 * Extensão do notification-service.ts com:
 * - Templates customizáveis
 * - Fila de notificações
 * - Retry automático
 * - Analytics de entrega
 * - Preferências granulares
 */

import { sendEmailNotification, sendSMSNotification, sendWhatsAppNotification, sendPushNotification } from './notification-service';
import { queryDatabase } from './db';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  category: 'booking' | 'payment' | 'message' | 'system' | 'promotion';
  subject?: string;
  body: string;
  variables: string[]; // Lista de variáveis disponíveis
}

export interface NotificationQueueItem {
  id: number;
  user_id: number;
  template_id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  variables: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  retry_count: number;
  max_retries: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  created_at: string;
}

/**
 * Processar template com variáveis
 */
function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processed = processed.replace(regex, String(value));
  }
  return processed;
}

/**
 * Enviar notificação usando template
 */
export async function sendNotificationWithTemplate(
  userId: number,
  templateId: string,
  variables: Record<string, any>,
  channels: Array<'email' | 'sms' | 'whatsapp' | 'push'> = ['email']
): Promise<{ success: boolean; results: Record<string, boolean> }> {
  try {
    // Buscar template (em produção, buscar do banco)
    const template = await getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`);
    }

    const results: Record<string, boolean> = {};

    // Processar template
    const processedBody = processTemplate(template.body, variables);
    const processedSubject = template.subject ? processTemplate(template.subject, variables) : undefined;

    // Enviar por cada canal solicitado
    for (const channel of channels) {
      try {
        let success = false;

        switch (channel) {
          case 'email':
            success = await sendEmailNotification(
              userId,
              variables.email || '',
              processedSubject || 'Notificação',
              processedBody
            );
            break;
          case 'sms':
            success = await sendSMSNotification(
              userId,
              variables.phone || '',
              processedBody
            );
            break;
          case 'whatsapp':
            success = await sendWhatsAppNotification(
              userId,
              variables.phone || '',
              processedBody
            );
            break;
          case 'push':
            success = await sendPushNotification(
              userId,
              processedSubject || 'Notificação',
              processedBody,
              variables
            );
            break;
        }

        results[channel] = success;
      } catch (error: any) {
        console.error(`Erro ao enviar ${channel}:`, error);
        results[channel] = false;
      }
    }

    return {
      success: Object.values(results).some(r => r),
      results,
    };
  } catch (error: any) {
    console.error('Erro ao enviar notificação com template:', error);
    return { success: false, results: {} };
  }
}

/**
 * Adicionar notificação à fila
 */
export async function queueNotification(
  userId: number,
  templateId: string,
  variables: Record<string, any>,
  channels: Array<'email' | 'sms' | 'whatsapp' | 'push'>,
  options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduled_at?: Date;
    max_retries?: number;
  }
): Promise<number> {
  try {
    const result = await queryDatabase(
      `INSERT INTO notification_queue 
       (user_id, template_id, type, variables, priority, scheduled_at, retry_count, max_retries, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, 'pending', CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        userId,
        templateId,
        JSON.stringify(channels),
        JSON.stringify(variables),
        options?.priority || 'normal',
        options?.scheduled_at?.toISOString() || null,
        options?.max_retries || 3,
      ]
    );

    return result[0]?.id;
  } catch (error: any) {
    console.error('Erro ao adicionar notificação à fila:', error);
    throw error;
  }
}

/**
 * Processar fila de notificações
 */
export async function processNotificationQueue(limit: number = 50): Promise<number> {
  try {
    // Buscar notificações pendentes
    const items = await queryDatabase(
      `SELECT * FROM notification_queue 
       WHERE status = 'pending' 
       AND (scheduled_at IS NULL OR scheduled_at <= CURRENT_TIMESTAMP)
       ORDER BY 
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'normal' THEN 3
           WHEN 'low' THEN 4
         END,
         created_at ASC
       LIMIT $1`,
      [limit]
    );

    let processed = 0;

    for (const item of items) {
      try {
        // Marcar como processando
        await queryDatabase(
          `UPDATE notification_queue SET status = 'processing' WHERE id = $1`,
          [item.id]
        );

        // Enviar notificação
        const channels = JSON.parse(item.type);
        const variables = JSON.parse(item.variables);
        const result = await sendNotificationWithTemplate(
          item.user_id,
          item.template_id,
          variables,
          channels
        );

        if (result.success) {
          // Marcar como enviada
          await queryDatabase(
            `UPDATE notification_queue SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [item.id]
          );
          processed++;
        } else {
          // Incrementar retry
          const newRetryCount = item.retry_count + 1;
          if (newRetryCount >= item.max_retries) {
            await queryDatabase(
              `UPDATE notification_queue SET status = 'failed' WHERE id = $1`,
              [item.id]
            );
          } else {
            await queryDatabase(
              `UPDATE notification_queue SET status = 'pending', retry_count = $1 WHERE id = $2`,
              [newRetryCount, item.id]
            );
          }
        }
      } catch (error: any) {
        console.error(`Erro ao processar notificação ${item.id}:`, error);
        await queryDatabase(
          `UPDATE notification_queue SET status = 'failed', error_message = $1 WHERE id = $2`,
          [error.message, item.id]
        );
      }
    }

    return processed;
  } catch (error: any) {
    console.error('Erro ao processar fila de notificações:', error);
    return 0;
  }
}

/**
 * Obter template (mock - em produção buscar do banco)
 */
async function getTemplate(templateId: string): Promise<NotificationTemplate | null> {
  // Templates padrão
  const templates: Record<string, NotificationTemplate> = {
    'booking-confirmation': {
      id: 'booking-confirmation',
      name: 'Confirmação de Reserva',
      type: 'email',
      category: 'booking',
      subject: 'Reserva Confirmada - {{booking_code}}',
      body: `
        <h1>Reserva Confirmada!</h1>
        <p>Olá {{guest_name}},</p>
        <p>Sua reserva <strong>{{booking_code}}</strong> foi confirmada.</p>
        <p><strong>Check-in:</strong> {{check_in}}</p>
        <p><strong>Check-out:</strong> {{check_out}}</p>
        <p><strong>Total:</strong> {{total_amount}}</p>
        <p>Obrigado por escolher nossos serviços!</p>
      `,
      variables: ['guest_name', 'booking_code', 'check_in', 'check_out', 'total_amount'],
    },
    'payment-received': {
      id: 'payment-received',
      name: 'Pagamento Recebido',
      type: 'email',
      category: 'payment',
      subject: 'Pagamento Recebido - {{amount}}',
      body: `
        <h1>Pagamento Confirmado</h1>
        <p>Recebemos seu pagamento de <strong>{{amount}}</strong>.</p>
        <p>Referência: {{payment_reference}}</p>
      `,
      variables: ['amount', 'payment_reference'],
    },
  };

  // Templates adicionais usados pelos serviços
  const extraTemplates: Record<string, NotificationTemplate> = {
    'split_payment_invitation': {
      id: 'split_payment_invitation',
      name: 'Convite de Pagamento Dividido',
      type: 'email',
      category: 'payment',
      subject: 'Convite para pagamento - {{amount}} {{currency}}',
      body: '<p>Você foi convidado a participar de um pagamento dividido. Valor: {{amount}} {{currency}}. Link: {{paymentLink}}. Prazo: {{deadline}}</p>',
      variables: ['amount', 'currency', 'paymentLink', 'deadline'],
    },
    'split_payment_reminder': {
      id: 'split_payment_reminder',
      name: 'Lembrete de Pagamento',
      type: 'email',
      category: 'payment',
      subject: 'Lembrete: Pagamento pendente',
      body: '<p>Seu pagamento de {{amount}} {{currency}} está pendente. Link: {{paymentLink}}. Dias em atraso: {{daysOverdue}}</p>',
      variables: ['amount', 'currency', 'paymentLink', 'daysOverdue'],
    },
    'trip_task_assigned': {
      id: 'trip_task_assigned',
      name: 'Tarefa Atribuída',
      type: 'email',
      category: 'message',
      subject: 'Nova tarefa: {{taskTitle}}',
      body: '<p>Uma tarefa foi atribuída a você na viagem {{tripId}}. Título: {{taskTitle}}. Data: {{dueDate}}</p>',
      variables: ['tripId', 'taskTitle', 'dueDate'],
    },
    'trip_invitation': {
      id: 'trip_invitation',
      name: 'Convite de Viagem',
      type: 'email',
      category: 'message',
      subject: 'Convite para {{tripName}}',
      body: '<p>Você foi convidado para a viagem {{tripName}}. Link: {{invitationLink}}</p>',
      variables: ['tripId', 'tripName', 'invitationLink'],
    },
    'group_chat_mention': {
      id: 'group_chat_mention',
      name: 'Menção em Chat',
      type: 'email',
      category: 'message',
      subject: '{{senderName}} mencionou você',
      body: '<p>{{senderName}} mencionou você no chat {{groupChatId}}: {{message}}</p>',
      variables: ['groupChatId', 'senderName', 'message'],
    },
    'booking_participant_added': {
      id: 'booking_participant_added',
      name: 'Participante Adicionado',
      type: 'email',
      category: 'booking',
      subject: 'Novo participante na reserva',
      body: '<p>{{participantName}} foi adicionado à reserva {{bookingId}}</p>',
      variables: ['bookingId', 'participantName'],
    },
  };

  return templates[templateId] || extraTemplates[templateId] || null;
}

/**
 * Enviar notificação (API unificada - templates ou delegação)
 */
export async function sendNotification(params: {
  userId?: number;
  type: string | string[];
  templateId?: string;
  variables?: Record<string, any>;
  title?: string;
  message?: string;
  [key: string]: any;
}): Promise<{ success: boolean }> {
  try {
    if (params.templateId && params.userId) {
      const channels = Array.isArray(params.type) ? params.type : [params.type];
      const hasInApp = channels.includes('in_app');
      const externalChannels = channels.filter((c: string) =>
        ['email', 'sms', 'whatsapp', 'push'].includes(c)
      ) as Array<'email' | 'sms' | 'whatsapp' | 'push'>;
      const vars = { ...params.variables };

      if (externalChannels.includes('email') && !vars.email) {
        const user = await queryDatabase('SELECT email FROM users WHERE id = $1', [params.userId]);
        vars.email = user[0]?.email || '';
      }
      if ((externalChannels.includes('sms') || externalChannels.includes('whatsapp')) && !vars.phone) {
        const user = await queryDatabase('SELECT phone FROM users WHERE id = $1', [params.userId]);
        vars.phone = user[0]?.phone || '';
      }

      let success = false;
      if (externalChannels.length > 0) {
        const result = await sendNotificationWithTemplate(
          params.userId,
          params.templateId,
          vars,
          externalChannels
        );
        success = result.success;
      }
      if (hasInApp) {
        const { createInAppNotification } = await import('./notification-service');
        const template = await getTemplate(params.templateId);
        const body = template ? processTemplate(template.body, vars) : params.title || 'Notificação';
        await createInAppNotification(params.userId, 'message', params.title || 'Notificação', body, vars);
        success = true;
      }
      return { success };
    }

    if (params.templateId && !params.userId) {
      return { success: false };
    }

    if (!params.userId) {
      return { success: false };
    }

    const { sendNotification: sendBase } = await import('./notification-service');
    const ok = await sendBase({
      userId: params.userId,
      type: typeof params.type === 'string' ? params.type : 'in_app',
      title: params.title,
      message: params.message || '',
      data: params.variables,
    });
    return { success: ok };
  } catch (error: any) {
    console.error('Erro em sendNotification:', error);
    return { success: false };
  }
}

/**
 * Criar tabela de fila de notificações
 */
export async function createNotificationQueueTable() {
  await queryDatabase(`
    CREATE TABLE IF NOT EXISTS notification_queue (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      template_id VARCHAR(255) NOT NULL,
      type TEXT NOT NULL, -- JSON array de canais
      variables JSONB NOT NULL,
      priority VARCHAR(20) DEFAULT 'normal',
      scheduled_at TIMESTAMP,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      status VARCHAR(20) DEFAULT 'pending',
      sent_at TIMESTAMP,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
    CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
    CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_at);
  `);
}

