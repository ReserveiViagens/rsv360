/**
 * ✅ COMPONENTE: Chat Room
 * Componente React para chat em tempo real usando WebSocket
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { getWebSocketClient } from '@/lib/websocket-client';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: number;
  user_name: string;
  message: string;
  timestamp: string;
  type?: string;
}

interface ChatRoomProps {
  roomId: string;
  userId: number;
  userName: string;
  token: string;
}

export function ChatRoom({ roomId, userId, userName, token }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsClient = getWebSocketClient();

  useEffect(() => {
    // Conectar WebSocket
    wsClient.connect(token).then(() => {
      setIsConnected(true);
      wsClient.joinChatRoom(roomId);

      // Escutar mensagens
      wsClient.on('chat:message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      // Escutar indicadores de digitação
      wsClient.on('chat:typing', (data: { user_id: number; user_name: string; typing: boolean }) => {
        if (data.user_id === userId) return; // Ignorar próprio indicador

        setIsTyping(prev => {
          const next = new Set(prev);
          if (data.typing) {
            next.add(data.user_id);
          } else {
            next.delete(data.user_id);
          }
          return next;
        });
      });

      // Escutar usuários entrando/saindo
      wsClient.on('chat:user_joined', (data) => {
        addSystemMessage(`${data.user_name} entrou no chat`);
      });

      wsClient.on('chat:user_left', (data) => {
        addSystemMessage(`${data.user_name} saiu do chat`);
      });
    }).catch(error => {
      console.error('Erro ao conectar WebSocket:', error);
    });

    return () => {
      wsClient.leaveChatRoom(roomId);
      wsClient.off('chat:message');
      wsClient.off('chat:typing');
      wsClient.off('chat:user_joined');
      wsClient.off('chat:user_left');
    };
  }, [roomId, token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addSystemMessage = (text: string) => {
    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      room_id: roomId,
      user_id: 0,
      user_name: 'Sistema',
      message: text,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    wsClient.sendChatMessage(roomId, newMessage);
    setNewMessage('');
    
    // Parar indicador de digitação
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    wsClient.setTyping(roomId, false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Indicar que está digitando
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    wsClient.setTyping(roomId, true);

    // Parar indicador após 3 segundos sem digitar
    typingTimeoutRef.current = setTimeout(() => {
      wsClient.setTyping(roomId, false);
    }, 3000);
  };

  const typingUsers = Array.from(isTyping).map(userId => {
    // Em produção, buscar nome do usuário
    return `Usuário ${userId}`;
  });

  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold">Chat - Room {roomId}</h3>
        <p className="text-sm text-gray-600">
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.user_id === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.type === 'system'
                  ? 'bg-gray-200 text-gray-600 text-center mx-auto text-sm'
                  : msg.user_id === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.type !== 'system' && (
                <div className="text-xs font-semibold mb-1">
                  {msg.user_name}
                </div>
              )}
              <div>{msg.message}</div>
              <div className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.join(', ')} está(ão) digitando...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

