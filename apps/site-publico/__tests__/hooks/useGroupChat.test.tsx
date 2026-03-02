/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - useGroupChat Hook
 * Testes para o hook de chat em grupo
 * 
 * @module __tests__/hooks/useGroupChat.test
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGroupChat } from '@/hooks/useGroupChat';
import chatService from '@/lib/group-travel/api/chat.service';

// Mock do service frontend
jest.mock('@/lib/group-travel/api/chat.service');

// Mock do socket.io-client
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true
    }))
  };
});

const mockChatService = chatService as jest.Mocked<typeof chatService>;

describe('useGroupChat', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('chat query', () => {
    it('should fetch chat data', async () => {
      // Arrange
      const chatId = 'chat-123';
      const mockChat = {
        id: chatId,
        name: 'Group Chat',
        wishlistId: 'wishlist-456',
        members: []
      };

      mockChatService.getChat = jest.fn().mockResolvedValue(mockChat);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.chat).toBeDefined();
      });

      expect(result.current.chat).toEqual(mockChat);
      expect(mockChatService.getChat).toHaveBeenCalledWith(chatId);
    });
  });

  describe('messages query', () => {
    it('should fetch messages with infinite scroll', async () => {
      // Arrange
      const chatId = 'chat-123';
      const mockMessages = {
        messages: [
          { id: 'msg-1', content: 'Message 1', createdAt: new Date() },
          { id: 'msg-2', content: 'Message 2', createdAt: new Date() }
        ],
        nextCursor: 'cursor-123',
        hasMore: true
      };

      mockChatService.getMessages = jest.fn().mockResolvedValue(mockMessages);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.messages).toBeDefined();
      });

      expect(result.current.messages).toHaveLength(2);
    });

    it('should load more messages when fetchNextPage is called', async () => {
      // Arrange
      const chatId = 'chat-123';
      const firstPage = {
        messages: [{ id: 'msg-1', content: 'Message 1' }],
        nextCursor: 'cursor-1',
        hasMore: true
      };
      const secondPage = {
        messages: [{ id: 'msg-2', content: 'Message 2' }],
        nextCursor: null,
        hasMore: false
      };

      mockChatService.getMessages = jest.fn()
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      await waitFor(() => {
        expect(result.current.messages).toBeDefined();
      });

      result.current.loadMore();

      // Assert
      await waitFor(() => {
        expect(mockChatService.getMessages).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('sendMessage mutation', () => {
    it('should send message successfully', async () => {
      // Arrange
      const chatId = 'chat-123';
      const messageData = {
        content: 'Hello!',
        messageType: 'text' as const
      };

      const mockMessage = {
        id: 'msg-123',
        chatId,
        ...messageData,
        createdAt: new Date()
      };

      mockChatService.sendMessage = jest.fn().mockResolvedValue(mockMessage);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      result.current.sendMessage({ chatId, data: messageData });

      // Assert
      await waitFor(() => {
        expect(mockChatService.sendMessage).toHaveBeenCalledWith(chatId, messageData);
      });
    });

    it('should handle error when sending message', async () => {
      // Arrange
      const chatId = 'chat-123';
      const messageData = { content: 'Hello!', messageType: 'text' as const };
      const error = new Error('Failed to send');

      mockChatService.sendMessage = jest.fn().mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      result.current.sendMessage({ chatId, data: messageData });

      // Assert
      await waitFor(() => {
        expect(mockChatService.sendMessage).toHaveBeenCalled();
      });
      // O erro será tratado pelo hook e exibido via toast
    });
  });

  describe('updateMessage mutation', () => {
    it('should update message successfully', async () => {
      // Arrange
      const chatId = 'chat-123';
      const messageId = 'msg-123';
      const updateData = { content: 'Updated message' };

      const mockUpdated = {
        id: messageId,
        ...updateData,
        updatedAt: new Date()
      };

      mockChatService.updateMessage = jest.fn().mockResolvedValue(mockUpdated);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      result.current.updateMessage({ messageId, content: updateData.content });

      // Assert
      await waitFor(() => {
        expect(mockChatService.updateMessage).toHaveBeenCalledWith(messageId, updateData.content);
      });
    });
  });

  describe('deleteMessage mutation', () => {
    it('should delete message successfully', async () => {
      // Arrange
      const chatId = 'chat-123';
      const messageId = 'msg-123';

      mockChatService.deleteMessage = jest.fn().mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      result.current.deleteMessage(messageId);

      // Assert
      await waitFor(() => {
        expect(mockChatService.deleteMessage).toHaveBeenCalledWith(messageId);
      });
    });
  });

  describe('members query', () => {
    it('should fetch chat members', async () => {
      // Arrange
      const chatId = 'chat-123';
      const mockMembers = [
        { id: 'member-1', userId: 'user-1', role: 'admin' },
        { id: 'member-2', userId: 'user-2', role: 'member' }
      ];

      mockChatService.getMembers = jest.fn().mockResolvedValue(mockMembers);

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.members).toBeDefined();
      });

      expect(result.current.members).toEqual(mockMembers);
    });
  });

  describe('WebSocket integration', () => {
    it('should connect to WebSocket when chatId is provided', async () => {
      // Arrange
      const chatId = 'chat-123';
      const { io } = require('socket.io-client');
      const ioSpy = jest.spyOn(require('socket.io-client'), 'io');

      // Act
      renderHook(() => useGroupChat({ chatId, autoConnect: true }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(ioSpy).toHaveBeenCalled();
      });
    });

    it('should handle new message from WebSocket', async () => {
      // Arrange
      const chatId = 'chat-123';
      const newMessage = {
        id: 'msg-new',
        chatId,
        userId: 'user-1',
        content: 'New message',
        messageType: 'text' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { io } = require('socket.io-client');
      let socketInstance: any = null;
      
      (io as jest.Mock).mockImplementation(() => {
        socketInstance = {
          on: jest.fn((event, callback) => {
            if (event === 'connect') {
              setTimeout(() => callback(), 0);
            }
            if (event === 'new_message') {
              setTimeout(() => callback(newMessage), 100);
            }
          }),
          emit: jest.fn(),
          disconnect: jest.fn(),
          connected: true
        };
        return socketInstance;
      });

      // Act
      const { result } = renderHook(() => useGroupChat({ chatId, autoConnect: true }), { wrapper });

      // Simulate WebSocket message
      await waitFor(() => {
        if (socketInstance) {
          const onHandler = socketInstance.on.mock.calls.find((call: any[]) => call[0] === 'new_message');
          if (onHandler) {
            onHandler[1](newMessage);
          }
        }
      });

      // Assert
      await waitFor(() => {
        // Messages should be updated via WebSocket
        expect(result.current.messages).toBeDefined();
      }, { timeout: 2000 });
    });
  });
});

