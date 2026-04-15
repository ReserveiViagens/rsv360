// Communication Service — Messages

import { eq, and, desc, asc, count } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import {
  commMessages,
  commConversations,
  commTemplates,
  commProviderConfigs,
  commCampaigns,
  commWebhooks,
} from '../db/schema';
import { CommunicationProviderFactory } from '../providers';

export interface SendMessageOptions {
  enterpriseId: string;
  leadId?: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'push';
  content: string;
  subject?: string;
  templateId?: string;
  variables?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: any;
}

export interface MessageFilters {
  enterpriseId: string;
  channel?: 'email' | 'whatsapp' | 'sms' | 'push';
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  leadId?: string;
  page?: number;
  limit?: number;
}

export class CommunicationService {
  // Enviar mensagem através do provider apropriado
  static async sendMessage(options: SendMessageOptions) {
    const {
      enterpriseId,
      leadId,
      channel,
      content,
      subject,
      templateId,
      variables,
      priority = 'normal',
      metadata,
    } = options;

    try {
      // Buscar provider ativo para o canal
      const providerConfig = await db
        .select()
        .from(commProviderConfigs)
        .where(
          and(
            eq(commProviderConfigs.enterpriseId, enterpriseId),
            eq(commProviderConfigs.channel, channel),
            eq(commProviderConfigs.isActive, true)
          )
        )
        .orderBy(desc(commProviderConfigs.priority))
        .limit(1);

      if (!providerConfig.length) {
        throw new Error(`No active provider found for channel: ${channel}`);
      }

      const provider = CommunicationProviderFactory.getProvider(enterpriseId, channel);
      if (!provider) {
        throw new Error(`Provider factory failed for channel: ${channel}`);
      }

      let result: { success: boolean; messageId?: string; error?: string };

      // Executar envio baseado no canal
      switch (channel) {
        case 'email':
          if (!provider.email) throw new Error('Email provider not available');
          result = await provider.email.sendEmail(
            leadId || '', // TODO: buscar email do lead
            subject || '',
            content,
            { templateId, variables }
          );
          break;

        case 'whatsapp':
          if (!provider.whatsapp) throw new Error('WhatsApp provider not available');
          result = await provider.whatsapp.sendMessage(
            leadId || '', // TODO: buscar phone do lead
            content,
            { templateId, variables }
          );
          break;

        case 'sms':
          if (!provider.sms) throw new Error('SMS provider not available');
          result = await provider.sms.sendSMS(
            leadId || '', // TODO: buscar phone do lead
            content
          );
          break;

        case 'push':
          if (!provider.push) throw new Error('Push provider not available');
          result = await provider.push.sendPush(
            {}, // TODO: buscar subscription do lead
            { title: subject || '', body: content }
          );
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Salvar mensagem no banco
      const messageData = {
        enterpriseId,
        leadId,
        channel: channel as any,
        provider: providerConfig[0].provider,
        direction: 'outbound' as const,
        status: (result.success ? 'sent' : 'failed') as any,
        priority,
        subject,
        content,
        templateId,
        metadata,
        externalId: result.messageId,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : undefined,
      };

      const [message] = await db.insert(commMessages).values(messageData).returning();

      // Atualizar conversa se existir
      if (leadId) {
        await this.updateOrCreateConversation(enterpriseId, leadId, channel);
      }

      return { success: result.success, message, error: result.error };
    } catch (error: any) {
      console.error('CommunicationService.sendMessage error:', error);
      return { success: false, error: error.message };
    }
  }

  // Receber mensagem (webhook)
  static async receiveMessage(enterpriseId: string, data: {
    leadId?: string;
    channel: 'email' | 'whatsapp' | 'sms';
    content: string;
    from: string; // email ou phone
    externalId?: string;
    metadata?: any;
  }) {
    try {
      const messageData = {
        enterpriseId,
        leadId: data.leadId,
        channel: data.channel,
        provider: 'webhook' as any, // TODO: determinar provider do webhook
        direction: 'inbound' as const,
        status: 'delivered' as const,
        content: data.content,
        externalId: data.externalId,
        metadata: data.metadata,
        deliveredAt: new Date(),
      };

      const [message] = await db.insert(commMessages).values(messageData).returning();

      // Atualizar conversa
      if (data.leadId) {
        await this.updateOrCreateConversation(enterpriseId, data.leadId, data.channel);
      }

      return { success: true, message };
    } catch (error: any) {
      console.error('CommunicationService.receiveMessage error:', error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar status da mensagem
  static async updateMessageStatus(messageId: string, status: string, timestamp?: Date) {
    try {
      const updateData: any = { status };
      if (timestamp) {
        switch (status) {
          case 'delivered': updateData.deliveredAt = timestamp; break;
          case 'read': updateData.readAt = timestamp; break;
        }
      }

      const [message] = await db
        .update(commMessages)
        .set(updateData)
        .where(eq(commMessages.id, messageId))
        .returning();

      return { success: true, message };
    } catch (error: any) {
      console.error('CommunicationService.updateMessageStatus error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listar mensagens com filtros
  static async listMessages(filters: MessageFilters) {
    try {
      const { enterpriseId, channel, status, leadId, page = 1, limit = 20 } = filters;

      let whereConditions = [eq(commMessages.enterpriseId, enterpriseId)];

      if (channel) whereConditions.push(eq(commMessages.channel, channel as any));
      if (status) whereConditions.push(eq(commMessages.status, status as any));
      if (leadId) whereConditions.push(eq(commMessages.leadId, leadId));

      const messages = await db
        .select()
        .from(commMessages)
        .where(and(...whereConditions))
        .orderBy(desc(commMessages.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(commMessages)
        .where(and(...whereConditions));

      return {
        messages,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: any) {
      console.error('CommunicationService.listMessages error:', error);
      throw error;
    }
  }

  // Helper: atualizar ou criar conversa
  private static async updateOrCreateConversation(enterpriseId: string, leadId: string, channel: string) {
    try {
      const [existing] = await db
        .select()
        .from(commConversations)
        .where(
          and(
            eq(commConversations.enterpriseId, enterpriseId),
            eq(commConversations.leadId, leadId),
            eq(commConversations.channel, channel as any)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(commConversations)
          .set({
            lastMessageAt: new Date(),
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(commConversations.id, existing.id));
      } else {
        await db.insert(commConversations).values({
          enterpriseId,
          leadId,
          channel: channel as any,
          isActive: true,
          lastMessageAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
}