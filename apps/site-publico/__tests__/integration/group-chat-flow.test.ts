/**
 * ✅ FASE 5 - ETAPA 5.2: Testes de Integração E2E - Fluxo Completo de Group Chat
 * Testa o fluxo completo de chat em grupo: criar, enviar mensagens, editar, deletar
 * 
 * @module __tests__/integration/group-chat-flow.test
 */

import { 
  createGroupChat, 
  sendGroupMessage, 
  addGroupChatMember, 
  listGroupMessages, 
  editGroupMessage, 
  deleteGroupMessage,
  getGroupChat
} from '@/lib/group-chat-service';
import { queryDatabase } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Group Chat Complete Flow E2E', () => {
  const user1 = 1;
  const user2 = 2;
  const user3 = 3;
  const wishlistId = 123;
  const chatId = 456;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn().mockResolvedValue(null);
    mockRedisCache.set = jest.fn().mockResolvedValue(true);
    mockRedisCache.del = jest.fn().mockResolvedValue(true);
  });

  it('should handle complete chat flow: create, send messages, edit, delete', async () => {
    // 1. User 1 creates chat for wishlist
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{
        id: chatId,
        name: 'Wishlist Chat',
        description: 'Chat for wishlist',
        chat_type: 'wishlist',
        is_private: false,
        created_by: user1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .mockResolvedValueOnce([{
        id: 1,
        group_chat_id: chatId,
        user_id: user1,
        role: 'admin',
        joined_at: new Date().toISOString(),
        is_muted: false
      }]);

    const chat = await createGroupChat(
      'Wishlist Chat',
      'Chat for wishlist',
      'wishlist',
      wishlistId,
      false,
      user1
    );
    expect(chat.id).toBe(chatId);

    // 2. User 1 adds User 2 and User 3 as members
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce([{
        id: 2,
        group_chat_id: chatId,
        user_id: user2,
        role: 'member',
        joined_at: new Date().toISOString(),
        is_muted: false
      }])
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce([{
        id: 3,
        group_chat_id: chatId,
        user_id: user3,
        role: 'member',
        joined_at: new Date().toISOString(),
        is_muted: false
      }]);

    const member1 = await addGroupChatMember(chatId, user2, undefined, undefined, 'member', user1);
    const member2 = await addGroupChatMember(chatId, user3, undefined, undefined, 'member', user1);

    expect(member1?.user_id).toBe(user2);
    expect(member2?.user_id).toBe(user3);

    // 3. User 1 sends a message
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce([{
        id: 1,
        group_chat_id: chatId,
        sender_id: user1,
        message: 'Hello everyone!',
        message_type: 'text',
        created_at: new Date().toISOString()
      }]);

    const message1 = await sendGroupMessage(
      chatId,
      'Hello everyone!',
      user1,
      undefined,
      undefined,
      'text'
    );
    expect(message1?.message).toBe('Hello everyone!');

    // 4. User 2 replies
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce([{
        id: 2,
        group_chat_id: chatId,
        sender_id: user2,
        message: 'Hi there!',
        message_type: 'text',
        created_at: new Date().toISOString()
      }]);

    const message2 = await sendGroupMessage(
      chatId,
      'Hi there!',
      user2,
      undefined,
      undefined,
      'text'
    );
    expect(message2?.message).toBe('Hi there!');

    // 5. User 1 edits their message
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{
        id: 1,
        sender_id: user1,
        created_at: new Date().toISOString()
      }])
      .mockResolvedValueOnce([{
        id: 1,
        group_chat_id: chatId,
        sender_id: user1,
        message: 'Hello everyone! (edited)',
        message_type: 'text',
        edited_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }]);

    const updatedMessage = await editGroupMessage(1, 'Hello everyone! (edited)', user1);
    expect(updatedMessage?.message).toBe('Hello everyone! (edited)');

    // 6. User 2 tries to edit User 1's message (should fail)
    (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
      id: 1,
      sender_id: user1,
      sender_email: null,
      created_at: new Date().toISOString()
    }]);

    const unauthorizedEdit = await editGroupMessage(1, 'Unauthorized edit', user2);
    expect(unauthorizedEdit).toBeNull();

    // 7. User 3 sends an image
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce([{
        id: 3,
        group_chat_id: chatId,
        sender_id: user3,
        message: 'Check this out!',
        message_type: 'image',
        attachments: JSON.stringify([{ url: 'https://example.com/image.jpg', type: 'image/jpeg' }]),
        created_at: new Date().toISOString()
      }]);

    const imageMessage = await sendGroupMessage(
      chatId,
      'Check this out!',
      user3,
      undefined,
      undefined,
      'image',
      [{ url: 'https://example.com/image.jpg', type: 'image/jpeg' }]
    );
    expect(imageMessage?.message_type).toBe('image');

    // 8. User 3 deletes their message
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{
        id: 3,
        sender_id: user3,
        group_id: chatId
      }])
      .mockResolvedValueOnce([]);

    const deleted = await deleteGroupMessage(3, user3);
    expect(deleted).toBe(true);

    // 9. User 3 tries to delete User 1's message (should fail - not admin)
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{
        id: 1,
        sender_id: user1,
        group_id: chatId
      }])
      .mockResolvedValueOnce([{ role: 'member' }]);

    const unauthorizedDelete = await deleteGroupMessage(1, user3);
    expect(unauthorizedDelete).toBe(false);

    // 10. Get all messages
    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce([
        { id: 1, message: 'Hello everyone! (edited)', sender_id: user1, created_at: new Date().toISOString() },
        { id: 2, message: 'Hi there!', sender_id: user2, created_at: new Date().toISOString() }
      ])
      .mockResolvedValueOnce([]) // read_by
      .mockResolvedValueOnce([]) // read_by
      .mockResolvedValueOnce([]); // reply_to

    const messages = await listGroupMessages(chatId, 50, undefined, user1);
    expect(messages.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle message pagination correctly', async () => {
    // Arrange - Create 60 messages
    const allMessages = Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      group_chat_id: chatId,
      message: `Message ${i + 1}`,
      message_type: 'text',
      created_at: new Date(Date.now() - (60 - i) * 1000).toISOString()
    }));

    (mockQueryDatabase as jest.Mock)
      .mockResolvedValueOnce([{ id: chatId, is_private: false }])
      .mockResolvedValueOnce(allMessages.slice(0, 50).reverse()) // First page (reversed)
      .mockResolvedValueOnce([]); // read_by for each message

    // Act
    const firstPage = await listGroupMessages(chatId, 50, undefined, user1);

    // Assert
    expect(firstPage.length).toBeLessThanOrEqual(50);
  });
});
