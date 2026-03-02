'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Paperclip, Pin, Search, Send, Reply } from '@/lib/lucide-icons';
import { useToast } from '@/components/providers/toast-wrapper';

interface EnhancedMessage {
  id: number;
  senderName?: string;
  message: string;
  messageType: string;
  reactions?: Array<{ emoji: string; users: Array<{ userId?: number; email?: string }> }>;
  replyTo?: EnhancedMessage;
  pinned: boolean;
  createdAt: string;
}

interface EnhancedGroupChatUIProps {
  groupChatId: number;
  userId?: number;
  userEmail?: string;
}

export function EnhancedGroupChatUI({ groupChatId, userId, userEmail }: EnhancedGroupChatUIProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Polling para novas mensagens (ou usar WebSocket)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [groupChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/group-chats/${groupChatId}/messages/enhanced`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/group-chats/${groupChatId}/messages/enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          senderId: userId,
          senderEmail: userEmail,
          replyToMessageId: replyTo,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setReplyTo(null);
        loadMessages();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    }
  };

  const addReaction = async (messageId: number, emoji: string) => {
    try {
      const response = await fetch(`/api/group-chats/${groupChatId}/messages/enhanced`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_reaction',
          messageId,
          userId,
          email: userEmail,
          emoji,
        }),
      });

      if (response.ok) {
        loadMessages();
      }
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) {
      loadMessages();
      return;
    }

    try {
      const response = await fetch(
        `/api/group-chats/${groupChatId}/messages/enhanced?q=${encodeURIComponent(searchQuery)}&action=search`
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chat em Grupo</span>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar mensagens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMessages()}
              className="w-48"
            />
            <Button size="sm" onClick={searchMessages}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.pinned ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'
              }`}
            >
              {message.pinned && (
                <div className="flex items-center gap-1 text-yellow-600 mb-1">
                  <Pin className="w-3 h-3" />
                  <span className="text-xs">Fixada</span>
                </div>
              )}
              {message.replyTo && (
                <div className="text-xs text-gray-500 mb-1 border-l-2 pl-2">
                  Respondendo a: {message.replyTo.senderName || 'Usuário'}
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{message.senderName || 'Anônimo'}</div>
                  <div className="text-sm">{message.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyTo(message.id)}
                  >
                    <Reply className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addReaction(message.id, '👍')}
                  >
                    <Smile className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {message.reactions.map((reaction, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="outline"
                      onClick={() => addReaction(message.id, reaction.emoji)}
                    >
                      {reaction.emoji} {reaction.users.length}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        {replyTo && (
          <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
            Respondendo a mensagem...
            <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
              Cancelar
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
          />
          <Button onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

