// Communication Service — Inbox/Conversations

import { eq, and, desc, asc, or, ilike } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { commConversations, commMessages } from '../db/schema';

export interface ConversationFilters {
  enterpriseId: string;
  isActive?: boolean;
  search?: string; // busca por lead info (TODO: join com leads)
  assignedTo?: string;
  channel?: 'email' | 'whatsapp' | 'sms' | 'push';
  page?: number;
  limit?: number;
}

export class InboxService {
  // Listar conversas
  static async listConversations(filters: ConversationFilters) {
    try {
      const { enterpriseId, isActive, search, assignedTo, channel, page = 1, limit = 20 } = filters;

      let whereConditions = [eq(commConversations.enterpriseId, enterpriseId)];

      if (isActive !== undefined) whereConditions.push(eq(commConversations.isActive, isActive));
      if (assignedTo) whereConditions.push(eq(commConversations.assignedTo, assignedTo));
      if (channel) whereConditions.push(eq(commConversations.channel, channel as any));

      // TODO: implementar busca por lead info quando houver tabela leads
      // if (search) {
      //   whereConditions.push(ilike(leads.name, `%${search}%`));
      // }

      const conversations = await db
        .select()
        .from(commConversations)
        .where(and(...whereConditions))
        .orderBy(desc(commConversations.lastMessageAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ count }] = await db
        .select({ count: count() })
        .from(commConversations)
        .where(and(...whereConditions));

      return {
        conversations,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error: any) {
      console.error('InboxService.listConversations error:', error);
      throw error;
    }
  }

  // Buscar conversa por ID
  static async getConversationById(id: string, enterpriseId: string) {
    try {
      const [conversation] = await db
        .select()
        .from(commConversations)
        .where(
          and(
            eq(commConversations.id, id),
            eq(commConversations.enterpriseId, enterpriseId)
          )
        )
        .limit(1);

      return conversation || null;
    } catch (error: any) {
      console.error('InboxService.getConversationById error:', error);
      throw error;
    }
  }

  // Buscar ou criar conversa
  static async getOrCreateConversation(enterpriseId: string, leadId: string, channel: string) {
    try {
      // Tentar encontrar conversa existente
      const [existing] = await db
        .select()
        .from(commConversations)
        .where(
          and(
            eq(commConversations.enterpriseId, enterpriseId),
            eq(commConversations.leadId, leadId),
            eq(commConversations.channel, channel)
          )
        )
        .limit(1);

      if (existing) {
        return { conversation: existing, created: false };
      }

      // Criar nova conversa
      const [conversation] = await db
        .insert(commConversations)
        .values({
          enterpriseId,
          leadId,
          channel,
          isActive: true,
        })
        .returning();

      return { conversation, created: true };
    } catch (error: any) {
      console.error('InboxService.getOrCreateConversation error:', error);
      throw error;
    }
  }

  // Listar mensagens de uma conversa
  static async getConversationMessages(conversationId: string, enterpriseId: string, options?: {
    page?: number;
    limit?: number;
  }) {
    try {
      const { page = 1, limit = 50 } = options || {};

      // Verificar se conversa pertence ao enterprise
      const conversation = await this.getConversationById(conversationId, enterpriseId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const messages = await db
        .select()
        .from(commMessages)
        .where(eq(commMessages.leadId, conversation.leadId))
        .orderBy(asc(commMessages.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ count }] = await db
        .select({ count: count() })
        .from(commMessages)
        .where(eq(commMessages.leadId, conversation.leadId));

      return {
        messages,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error: any) {
      console.error('InboxService.getConversationMessages error:', error);
      throw error;
    }
  }

  // Atribuir conversa a um usuário
  static async assignConversation(conversationId: string, enterpriseId: string, assignedTo: string) {
    try {
      const [conversation] = await db
        .update(commConversations)
        .set({
          assignedTo,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(commConversations.id, conversationId),
            eq(commConversations.enterpriseId, enterpriseId)
          )
        )
        .returning();

      return { success: true, conversation };
    } catch (error: any) {
      console.error('InboxService.assignConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Fechar conversa
  static async closeConversation(conversationId: string, enterpriseId: string) {
    try {
      const [conversation] = await db
        .update(commConversations)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(commConversations.id, conversationId),
            eq(commConversations.enterpriseId, enterpriseId)
          )
        )
        .returning();

      return { success: true, conversation };
    } catch (error: any) {
      console.error('InboxService.closeConversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Adicionar tag à conversa
  static async addConversationTag(conversationId: string, enterpriseId: string, tag: string) {
    try {
      const conversation = await this.getConversationById(conversationId, enterpriseId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const currentTags = conversation.tags || [];
      if (currentTags.includes(tag)) {
        return { success: true, conversation }; // Tag já existe
      }

      const updatedTags = [...currentTags, tag];

      const [updated] = await db
        .update(commConversations)
        .set({
          tags: updatedTags,
          updatedAt: new Date(),
        })
        .where(eq(commConversations.id, conversationId))
        .returning();

      return { success: true, conversation: updated };
    } catch (error: any) {
      console.error('InboxService.addConversationTag error:', error);
      return { success: false, error: error.message };
    }
  }

  // Estatísticas da inbox
  static async getInboxStats(enterpriseId: string) {
    try {
      // Contar conversas ativas
      const [{ activeCount }] = await db
        .select({ count: count() })
        .from(commConversations)
        .where(
          and(
            eq(commConversations.enterpriseId, enterpriseId),
            eq(commConversations.isActive, true)
          )
        );

      // Contar mensagens não lidas (inbound sem readAt)
      const [{ unreadCount }] = await db
        .select({ count: count() })
        .from(commMessages)
        .where(
          and(
            eq(commMessages.enterpriseId, enterpriseId),
            eq(commMessages.direction, 'inbound'),
            eq(commMessages.status, 'delivered')
          )
        );

      // Contar mensagens por canal hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const channelStats = await db
        .select({
          channel: commMessages.channel,
          count: count(),
        })
        .from(commMessages)
        .where(
          and(
            eq(commMessages.enterpriseId, enterpriseId),
            gte(commMessages.createdAt, today)
          )
        )
        .groupBy(commMessages.channel);

      return {
        activeConversations: activeCount,
        unreadMessages: unreadCount,
        todayMessages: channelStats,
      };
    } catch (error: any) {
      console.error('InboxService.getInboxStats error:', error);
      throw error;
    }
  }
}