/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Group Chat Service
 * Testes para o serviço de chat em grupo
 * 
 * @module __tests__/lib/group-travel/group-chat-service.test
 */

import {
  createGroupChat,
  getGroupChat,
  sendGroupMessage,
  listGroupMessages,
  listGroupChatMembers,
  addGroupChatMember,
  markMessagesAsRead,
  editGroupMessage,
  deleteGroupMessage
} from '@/lib/group-chat-service';
import { queryDatabase } from '@/lib/db';

// Mocks
jest.mock('@/lib/db');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;

describe('GroupChatService', () => {
  const userId = 1;
  const chatId = 1;
  const wishlistId = 1;
  const bookingId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockQueryDatabase as jest.Mock).mockReset();
  });

  describe('createGroupChat', () => {
    it('should create chat for wishlist', async () => {
      // Arrange
      const name = 'Wishlist Chat';
      const description = 'Chat for wishlist';
      const chatType = 'wishlist' as const;

      // SEQUÊNCIA DE CHAMADAS:
      // 1. queryDatabase - INSERT group_chats (RETURNING)
      // 2. queryDatabase - INSERT group_chat_members (se createdBy fornecido)

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name,
          description,
          booking_id: null,
          chat_type: chatType,
          is_private: false,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: null,
          member_count: 1,
          unread_count: 0
        }]) // INSERT group_chats
        .mockResolvedValueOnce([{
          id: 1,
          group_chat_id: chatId,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString()
        }]); // INSERT group_chat_members

      // Act
      const result = await createGroupChat(name, description, chatType, undefined, false, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(chatId);
      expect(result.name).toBe(name);
      expect(result.chat_type).toBe(chatType);
      expect(mockQueryDatabase).toHaveBeenCalledTimes(2);
    });

    it('should create chat for booking', async () => {
      // Arrange
      const name = 'Booking Chat';
      const chatType = 'booking' as const;

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name,
          description: null,
          booking_id: bookingId,
          chat_type: chatType,
          is_private: false,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: null,
          member_count: 1,
          unread_count: 0
        }]) // INSERT group_chats
        .mockResolvedValueOnce([{
          id: 1,
          group_chat_id: chatId,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString()
        }]); // INSERT group_chat_members

      // Act
      const result = await createGroupChat(name, undefined, chatType, bookingId, false, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.booking_id).toBe(bookingId);
    });
  });

  describe('sendGroupMessage', () => {
    it('should send text message successfully', async () => {
      // Arrange
      const message = 'Hello everyone!';
      const messageType = 'text' as const;

      // SEQUÊNCIA DE CHAMADAS:
      // 1. getGroupChat - SELECT group_chats (pode fazer múltiplas queries internas)
      // 2. queryDatabase - INSERT group_chat_messages (RETURNING)

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: false,
          created_by: userId
        }]) // getGroupChat - SELECT group_chats
        .mockResolvedValueOnce([{ count: '1' }]) // getGroupChat - SELECT COUNT members
        .mockResolvedValueOnce([{ count: '0' }]) // getGroupChat - SELECT COUNT unread
        .mockResolvedValueOnce([{
          id: 1,
          group_chat_id: chatId,
          sender_id: userId,
          sender_email: null,
          sender_name: 'User',
          message,
          message_type: messageType,
          attachments: null,
          reply_to_message_id: null,
          created_at: new Date().toISOString(),
          edited_at: null,
          deleted_at: null
        }]); // INSERT group_chat_messages

      // Act
      const result = await sendGroupMessage(chatId, message, userId, undefined, undefined, messageType);

      // Assert
      expect(result).toBeDefined();
      expect(result?.message).toBe(message);
      expect(result?.message_type).toBe(messageType);
    });

    it('should send image message successfully', async () => {
      // Arrange
      const message = 'Check this out!';
      const messageType = 'image' as const;
      const attachments = [{ url: 'https://example.com/image.jpg', type: 'image/jpeg' }];

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: false,
          created_by: userId
        }]) // getGroupChat
        .mockResolvedValueOnce([{ count: '1' }]) // member count
        .mockResolvedValueOnce([{ count: '0' }]) // unread count
        .mockResolvedValueOnce([{
          id: 1,
          group_chat_id: chatId,
          message,
          message_type: messageType,
          attachments: JSON.stringify(attachments),
          created_at: new Date().toISOString()
        }]); // INSERT message

      // Act
      const result = await sendGroupMessage(chatId, message, userId, undefined, undefined, messageType, attachments);

      // Assert
      expect(result).toBeDefined();
      expect(result?.message_type).toBe('image');
      expect(result?.attachments).toBeDefined();
    });

    it('should return null if user is not a member', async () => {
      // Arrange
      const message = 'Hello';

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]); // getGroupChat returns null (not a member)

      // Act
      const result = await sendGroupMessage(chatId, message, userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('listGroupMessages', () => {
    it('should return messages with pagination', async () => {
      // Arrange
      const mockMessages = [
        {
          id: 1,
          group_chat_id: chatId,
          message: 'Message 1',
          created_at: new Date().toISOString(),
          deleted_at: null
        },
        {
          id: 2,
          group_chat_id: chatId,
          message: 'Message 2',
          created_at: new Date().toISOString(),
          deleted_at: null
        }
      ];

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: false
        }]) // getGroupChat
        .mockResolvedValueOnce([{ count: '1' }]) // member count
        .mockResolvedValueOnce([{ count: '0' }]) // unread count
        .mockResolvedValueOnce(mockMessages) // SELECT messages
        .mockResolvedValueOnce([]) // SELECT reads for message 1
        .mockResolvedValueOnce([]) // SELECT reads for message 2
        .mockResolvedValueOnce([]); // SELECT reads for message 2 (reply check)

      // Act
      const result = await listGroupMessages(chatId, 50, undefined, userId);

      // Assert
      expect(result).toHaveLength(2);
      // O serviço retorna mensagens em ordem DESC (mais recente primeiro)
      // Então result[0] será "Message 2" e result[1] será "Message 1"
      expect(result[0].message).toBe('Message 2'); // Most recent first (DESC order)
      expect(result[1].message).toBe('Message 1'); // Older message
    });

    it('should return empty array if user does not have access', async () => {
      // Arrange
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]); // getGroupChat returns null

      // Act
      const result = await listGroupMessages(chatId, 50, undefined, userId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('listGroupChatMembers', () => {
    it('should return all chat members', async () => {
      // Arrange
      const mockMembers = [
        {
          id: 1,
          group_chat_id: chatId,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString(),
          user_name: 'User 1',
          user_email: 'user1@test.com'
        },
        {
          id: 2,
          group_chat_id: chatId,
          user_id: 2,
          role: 'member',
          joined_at: new Date().toISOString(),
          user_name: 'User 2',
          user_email: 'user2@test.com'
        }
      ];

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: false
        }]) // getGroupChat
        .mockResolvedValueOnce([{ count: '1' }]) // member count
        .mockResolvedValueOnce([{ count: '0' }]) // unread count
        .mockResolvedValueOnce(mockMembers); // SELECT members

      // Act
      const result = await listGroupChatMembers(chatId, userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('admin');
    });
  });

  describe('addGroupChatMember', () => {
    it('should add member to chat', async () => {
      // Arrange
      const newUserId = 2;
      const role = 'member' as const;

      // SEQUÊNCIA DE CHAMADAS:
      // 1. addGroupChatMember - getGroupChat (SELECT group_chats WHERE id = $1)
      // 2. addGroupChatMember - getGroupChat (SELECT COUNT members)
      // 3. addGroupChatMember - getGroupChat (SELECT COUNT unread - userId fornecido como addedByUserId)
      // 4. addGroupChatMember - SELECT role (verificar permissão - apenas se is_private = true)
      // 5. addGroupChatMember - INSERT member

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: false,
          created_by: userId
        }]) // addGroupChatMember - getGroupChat (SELECT group_chats WHERE id = $1)
        .mockResolvedValueOnce([{ count: '1' }]) // addGroupChatMember - getGroupChat (SELECT COUNT members)
        .mockResolvedValueOnce([{ count: '0' }]) // addGroupChatMember - getGroupChat (SELECT COUNT unread - addedByUserId fornecido)
        .mockResolvedValueOnce([{
          id: 2,
          group_chat_id: chatId,
          user_id: newUserId,
          email: null,
          name: null,
          role,
          joined_at: new Date().toISOString(),
          last_read_at: null
        }]); // addGroupChatMember - INSERT member

      // Act
      const result = await addGroupChatMember(chatId, newUserId, undefined, undefined, role, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.user_id).toBe(newUserId);
    });

    it('should return null if user does not have permission', async () => {
      // Arrange
      // SEQUÊNCIA DE CHAMADAS:
      // 1. addGroupChatMember - getGroupChat (SELECT group_chats WHERE id = $1)
      // 2. addGroupChatMember - getGroupChat (verificar se é membro - apenas se is_private = true)
      // 3. addGroupChatMember - getGroupChat (SELECT COUNT members)
      // 4. addGroupChatMember - getGroupChat (SELECT COUNT unread - userId fornecido como addedByUserId)
      // 5. addGroupChatMember - SELECT role (verificar permissão - is_private = true)
      // Se não tiver permissão, retorna null antes do INSERT

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: true,
          created_by: 999 // Different user
        }]) // addGroupChatMember - getGroupChat (SELECT group_chats WHERE id = $1)
        .mockResolvedValueOnce([{
          id: 1,
          group_chat_id: chatId,
          user_id: userId,
          role: 'member'
        }]) // addGroupChatMember - getGroupChat (verificar se é membro - is_private = true, então verifica)
        .mockResolvedValueOnce([{ count: '1' }]) // addGroupChatMember - getGroupChat (SELECT COUNT members)
        .mockResolvedValueOnce([{ count: '0' }]) // addGroupChatMember - getGroupChat (SELECT COUNT unread - userId fornecido)
        .mockResolvedValueOnce([]); // addGroupChatMember - SELECT role (user is not admin)

      // Act
      const result = await addGroupChatMember(chatId, 2, undefined, undefined, 'member', userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read', async () => {
      // Arrange
      const messageIds = [1, 2];

      // SEQUÊNCIA DE CHAMADAS:
      // 1. markMessagesAsRead - getGroupChat (SELECT group_chats)
      // 2. markMessagesAsRead - getGroupChat (SELECT COUNT members)
      // 3. markMessagesAsRead - getGroupChat (SELECT COUNT unread)
      // 4. markMessagesAsRead - INSERT read for message 1
      // 5. markMessagesAsRead - INSERT read for message 2
      // 6. markMessagesAsRead - UPDATE last_read_at

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: chatId,
          name: 'Test Chat',
          is_private: false,
          created_by: userId
        }]) // markMessagesAsRead - getGroupChat (SELECT group_chats)
        .mockResolvedValueOnce([{ count: '1' }]) // markMessagesAsRead - getGroupChat (SELECT COUNT members)
        .mockResolvedValueOnce([{ count: '0' }]) // markMessagesAsRead - getGroupChat (SELECT COUNT unread)
        .mockResolvedValueOnce([]) // markMessagesAsRead - INSERT read for message 1
        .mockResolvedValueOnce([]) // markMessagesAsRead - INSERT read for message 2
        .mockResolvedValueOnce([]); // markMessagesAsRead - UPDATE last_read_at

      // Act
      const result = await markMessagesAsRead(chatId, messageIds, userId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user is not a member', async () => {
      // Arrange
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([]); // getGroupChat returns null

      // Act
      const result = await markMessagesAsRead(chatId, [1], userId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('editGroupMessage', () => {
    it('should edit message if user is author', async () => {
      // Arrange
      const messageId = 1;
      const newMessage = 'Updated message';

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: messageId,
          group_chat_id: chatId,
          sender_id: userId,
          sender_email: null,
          message: 'Original message',
          created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString() // 4 minutes ago
        }]) // SELECT message
        .mockResolvedValueOnce([{
          id: messageId,
          message: newMessage,
          edited_at: new Date().toISOString()
        }]); // UPDATE message

      // Act
      const result = await editGroupMessage(messageId, newMessage, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.message).toBe(newMessage);
    });

    it('should return null if user is not the author', async () => {
      // Arrange
      const messageId = 1;
      const newMessage = 'Updated message';

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: messageId,
          sender_id: 999, // Different user
          sender_email: null
        }]); // SELECT message

      // Act
      const result = await editGroupMessage(messageId, newMessage, userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteGroupMessage', () => {
    it('should delete message if user is author', async () => {
      // Arrange
      const messageId = 1;

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: messageId,
          group_chat_id: chatId,
          sender_id: userId,
          sender_email: null,
          group_id: chatId
        }]) // SELECT message with group
        .mockResolvedValueOnce([]); // UPDATE deleted_at

      // Act
      const result = await deleteGroupMessage(messageId, userId);

      // Assert
      expect(result).toBe(true);
    });

    it('should delete message if user is admin', async () => {
      // Arrange
      const messageId = 1;
      const otherUserId = 999;

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: messageId,
          group_chat_id: chatId,
          sender_id: otherUserId,
          sender_email: null,
          group_id: chatId
        }]) // SELECT message
        .mockResolvedValueOnce([{ role: 'admin' }]) // SELECT member (user is admin)
        .mockResolvedValueOnce([]); // UPDATE deleted_at

      // Act
      const result = await deleteGroupMessage(messageId, userId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user is not author or admin', async () => {
      // Arrange
      const messageId = 1;

      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{
          id: messageId,
          group_chat_id: chatId,
          sender_id: 999,
          sender_email: null,
          group_id: chatId
        }]) // SELECT message
        .mockResolvedValueOnce([]); // User is not admin

      // Act
      const result = await deleteGroupMessage(messageId, userId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
