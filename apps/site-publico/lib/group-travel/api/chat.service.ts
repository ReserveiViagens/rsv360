/**
 * ✅ FASE 1 - ETAPA 1.5: API Service Frontend - Chat
 * Service para comunicação com API de chat em grupo
 * 
 * @module group-travel/api/chat.service
 */

import type { GroupChat, GroupMessage, ChatMember, SendMessageDTO } from '../types';
import { requestWithRetry } from './wishlist.service';

// ============================================
// CHAT SERVICE
// ============================================

class ChatService {
  private baseURL = '/api/chats';

  /**
   * Buscar chat por ID
   */
  async getChat(chatId: string): Promise<GroupChat> {
    const url = `${this.baseURL}/${chatId}`;
    return requestWithRetry<GroupChat>(url);
  }

  /**
   * Buscar mensagens do chat (com paginação cursor-based)
   */
  async getMessages(
    chatId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<{
    messages: GroupMessage[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const url = `${this.baseURL}/${chatId}/messages${params.toString() ? `?${params}` : ''}`;
    return requestWithRetry<{
      messages: GroupMessage[];
      nextCursor: string | null;
      hasMore: boolean;
    }>(url);
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(chatId: string, data: SendMessageDTO): Promise<GroupMessage> {
    const url = `${this.baseURL}/${chatId}/messages`;
    return requestWithRetry<GroupMessage>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar mensagem
   */
  async deleteMessage(messageId: string): Promise<void> {
    const url = `${this.baseURL}/messages/${messageId}`;
    await requestWithRetry<void>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Atualizar mensagem
   */
  async updateMessage(messageId: string, content: string): Promise<GroupMessage> {
    const url = `${this.baseURL}/messages/${messageId}`;
    return requestWithRetry<GroupMessage>(url, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  /**
   * Buscar membros do chat
   */
  async getMembers(chatId: string): Promise<ChatMember[]> {
    const url = `${this.baseURL}/${chatId}/members`;
    return requestWithRetry<ChatMember[]>(url);
  }

  /**
   * Marcar mensagens como lidas
   */
  async markAsRead(chatId: string): Promise<void> {
    const url = `${this.baseURL}/${chatId}/read`;
    await requestWithRetry<void>(url, {
      method: 'POST',
    });
  }
}

// Exportar instância singleton
export default new ChatService();

