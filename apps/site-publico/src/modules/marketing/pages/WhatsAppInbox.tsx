'use client';

import { useState } from 'react';
import { useWhatsappConversations, useWhatsappMessages, useSendWhatsappMessage } from '../hooks/useMarketing';
import { WhatsappConversation } from '../types';

export default function WhatsAppInbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const { data: conversationsData, isLoading: loadingConversations } = useWhatsappConversations();
  const { data: messagesData } = useWhatsappMessages(selectedConversation || '', { limit: 50 });
  const sendMutation = useSendWhatsappMessage();

  const filteredConversations = conversationsData?.conversations?.filter((conv: WhatsappConversation) =>
    conv.phone.includes(searchFilter) || (conv.tags && conv.tags.some((tag: string) => tag.includes(searchFilter)))
  ) || [];

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return;

    await sendMutation.mutateAsync({
      conversationId: selectedConversation,
      data: { content: messageInput.trim() }
    });

    setMessageInput('');
  };

  const selectedConvData = conversationsData?.conversations?.find((c: WhatsappConversation) => c.id === selectedConversation);

  return (
    <div className="h-[calc(100vh-200px)] flex border rounded-lg overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-2">Conversas WhatsApp</h2>
          <input
            type="text"
            placeholder="Buscar por telefone ou tag..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-y-auto h-full">
          {loadingConversations ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Carregando conversas...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                  selectedConversation === conversation.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">📱 {conversation.phone}</p>
                  <span className={`w-2 h-2 rounded-full ${conversation.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                {conversation.lastMessageAt && (
                  <p className="text-xs text-muted-foreground">
                    Última: {new Date(conversation.lastMessageAt).toLocaleString('pt-BR')}
                  </p>
                )}
                {conversation.tags && conversation.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {conversation.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedConvData ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">📱 {selectedConvData.phone}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConvData.isActive ? 'Ativa' : 'Inativa'}
                </p>
              </div>
              <button className="text-red-600 hover:text-red-800 text-sm">
                Fechar Conversa
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesData?.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-muted/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border rounded px-3 py-2"
                  disabled={sendMutation.isPending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMutation.isPending}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {sendMutation.isPending ? '...' : 'Enviar'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">Escolha uma conversa do painel lateral para visualizar as mensagens.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}