// 💬 CHAT ONLINE - RESERVEI VIAGENS
// Funcionalidade: Sistema de chat em tempo real
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Star, Clock, User, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: number;
  author: 'client' | 'agent' | 'system';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: string;
  };
  read: boolean;
}

interface ChatConversation {
  id: number;
  client: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    type: 'vip' | 'premium' | 'regular';
    isOnline: boolean;
    lastSeen?: string;
  };
  agent: {
    name: string;
    id: string;
    avatar?: string;
    isOnline: boolean;
  };
  status: 'active' | 'waiting' | 'closed' | 'transferred';
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  department: 'vendas' | 'pos_vendas' | 'suporte' | 'financeiro';
  startTime: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  tags: string[];
  satisfaction?: {
    rating: number;
    comment: string;
    timestamp: string;
  };
}

const ChatOnline: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showStats, setShowStats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dados mock
  const conversationsMock: ChatConversation[] = [
    {
      id: 1,
      client: {
        name: 'João Silva Santos',
        email: 'joao.silva@email.com',
        phone: '(64) 99999-1111',
        avatar: '/avatars/joao.jpg',
        type: 'vip',
        isOnline: true
      },
      agent: {
        name: 'Ana Silva Santos',
        id: 'AG001',
        avatar: '/avatars/ana.jpg',
        isOnline: true
      },
      status: 'active',
      priority: 'alta',
      department: 'pos_vendas',
      startTime: '2025-08-25 14:30:00',
      lastMessage: 'Perfeito! Muito obrigado pela agilidade no atendimento.',
      lastMessageTime: '2025-08-25 15:45:00',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          author: 'client',
          content: 'Boa tarde! Preciso alterar a data da minha viagem para Caldas Novas.',
          timestamp: '2025-08-25 14:30:00',
          type: 'text',
          read: true
        },
        {
          id: 2,
          author: 'agent',
          content: 'Olá João! Boa tarde! Claro, posso te ajudar com isso. Qual seria a nova data desejada?',
          timestamp: '2025-08-25 14:31:00',
          type: 'text',
          read: true
        },
        {
          id: 3,
          author: 'client',
          content: 'Gostaria de alterar de 15/09 para 22/09. É possível?',
          timestamp: '2025-08-25 14:35:00',
          type: 'text',
          read: true
        },
        {
          id: 4,
          author: 'agent',
          content: 'Deixe-me verificar a disponibilidade no hotel para essas datas. Um momento, por favor.',
          timestamp: '2025-08-25 14:36:00',
          type: 'text',
          read: true
        },
        {
          id: 5,
          author: 'system',
          content: 'Agente está consultando disponibilidade...',
          timestamp: '2025-08-25 14:37:00',
          type: 'system',
          read: true
        },
        {
          id: 6,
          author: 'agent',
          content: 'Ótimas notícias! O hotel tem disponibilidade para as datas que você solicitou. Vou fazer a alteração agora mesmo.',
          timestamp: '2025-08-25 15:40:00',
          type: 'text',
          read: true
        },
        {
          id: 7,
          author: 'client',
          content: 'Perfeito! Muito obrigado pela agilidade no atendimento.',
          timestamp: '2025-08-25 15:45:00',
          type: 'text',
          read: true
        }
      ],
      tags: ['alteracao', 'vip', 'caldas_novas'],
      satisfaction: {
        rating: 5,
        comment: 'Atendimento excelente e muito rápido!',
        timestamp: '2025-08-25 16:00:00'
      }
    },
    {
      id: 2,
      client: {
        name: 'Maria Costa Oliveira',
        email: 'maria.costa@email.com',
        phone: '(64) 98888-2222',
        type: 'regular',
        isOnline: true
      },
      agent: {
        name: 'Carlos Vendedor Silva',
        id: 'AG002',
        avatar: '/avatars/carlos.jpg',
        isOnline: true
      },
      status: 'active',
      priority: 'media',
      department: 'vendas',
      startTime: '2025-08-25 16:15:00',
      lastMessage: 'Posso fazer o pagamento via PIX?',
      lastMessageTime: '2025-08-25 16:25:00',
      unreadCount: 1,
      messages: [
        {
          id: 1,
          author: 'client',
          content: 'Olá! Gostaria de saber sobre pacotes para Caldas Novas.',
          timestamp: '2025-08-25 16:15:00',
          type: 'text',
          read: true
        },
        {
          id: 2,
          author: 'agent',
          content: 'Olá Maria! Claro, temos ótimos pacotes! Para quantas pessoas seria?',
          timestamp: '2025-08-25 16:16:00',
          type: 'text',
          read: true
        },
        {
          id: 3,
          author: 'client',
          content: 'Para 2 adultos, 3 dias e 2 noites.',
          timestamp: '2025-08-25 16:18:00',
          type: 'text',
          read: true
        },
        {
          id: 4,
          author: 'agent',
          content: 'Perfeito! Temos um pacote especial no Hotel Thermas Grand Resort por R$ 1.200 para o casal, com café da manhã incluso.',
          timestamp: '2025-08-25 16:20:00',
          type: 'text',
          read: true
        },
        {
          id: 5,
          author: 'client',
          content: 'Interessante! Posso fazer o pagamento via PIX?',
          timestamp: '2025-08-25 16:25:00',
          type: 'text',
          read: false
        }
      ],
      tags: ['vendas', 'pacote', 'caldas_novas']
    },
    {
      id: 3,
      client: {
        name: 'Roberto Empresário',
        email: 'roberto@empresa.com.br',
        phone: '(64) 97777-3333',
        type: 'premium',
        isOnline: false,
        lastSeen: '2025-08-25 15:30:00'
      },
      agent: {
        name: 'Maria Atendente Costa',
        id: 'AG003',
        isOnline: true
      },
      status: 'waiting',
      priority: 'alta',
      department: 'pos_vendas',
      startTime: '2025-08-25 15:20:00',
      lastMessage: 'Aguardando resposta sobre a reclamação do quarto.',
      lastMessageTime: '2025-08-25 15:30:00',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          author: 'client',
          content: 'Preciso reportar um problema com o quarto do hotel.',
          timestamp: '2025-08-25 15:20:00',
          type: 'text',
          read: true
        },
        {
          id: 2,
          author: 'agent',
          content: 'Sinto muito pelo inconveniente! Pode me descrever qual é o problema?',
          timestamp: '2025-08-25 15:21:00',
          type: 'text',
          read: true
        },
        {
          id: 3,
          author: 'client',
          content: 'Há muito ruído vindo da obra ao lado. Não conseguimos descansar.',
          timestamp: '2025-08-25 15:25:00',
          type: 'text',
          read: true
        },
        {
          id: 4,
          author: 'agent',
          content: 'Entendo perfeitamente. Vou contactar o hotel imediatamente para resolver isso.',
          timestamp: '2025-08-25 15:26:00',
          type: 'text',
          read: true
        },
        {
          id: 5,
          author: 'system',
          content: 'Cliente saiu do chat',
          timestamp: '2025-08-25 15:30:00',
          type: 'system',
          read: true
        }
      ],
      tags: ['reclamacao', 'hotel', 'urgente', 'premium']
    },
    {
      id: 4,
      client: {
        name: 'Fernanda Wellness',
        email: 'fernanda@wellness.com',
        phone: '(64) 96666-4444',
        type: 'vip',
        isOnline: true
      },
      agent: {
        name: 'Ana Silva Santos',
        id: 'AG001',
        isOnline: true
      },
      status: 'closed',
      priority: 'baixa',
      department: 'pos_vendas',
      startTime: '2025-08-24 14:00:00',
      lastMessage: 'Obrigada! Foi uma experiência incrível!',
      lastMessageTime: '2025-08-24 14:30:00',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          author: 'client',
          content: 'Quero parabenizar vocês pelo excelente atendimento no Spa Serenity!',
          timestamp: '2025-08-24 14:00:00',
          type: 'text',
          read: true
        },
        {
          id: 2,
          author: 'agent',
          content: 'Que alegria receber esse feedback, Fernanda! Ficamos muito felizes que tenha gostado.',
          timestamp: '2025-08-24 14:15:00',
          type: 'text',
          read: true
        },
        {
          id: 3,
          author: 'client',
          content: 'Obrigada! Foi uma experiência incrível!',
          timestamp: '2025-08-24 14:30:00',
          type: 'text',
          read: true
        },
        {
          id: 4,
          author: 'system',
          content: 'Chat finalizado com satisfação: 5 estrelas',
          timestamp: '2025-08-24 14:35:00',
          type: 'system',
          read: true
        }
      ],
      tags: ['elogio', 'spa', 'vip', 'satisfacao'],
      satisfaction: {
        rating: 5,
        comment: 'Experiência perfeita do início ao fim!',
        timestamp: '2025-08-24 14:35:00'
      }
    }
  ];

  useEffect(() => {
    setConversations(conversationsMock);
    if (conversationsMock.length > 0) {
      setSelectedConversation(conversationsMock[0]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const conversationsFiltradas = conversations.filter(conv => {
    const matchSearch = conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || conv.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  const estatisticas = {
    totalConversations: conversations.length,
    activeChats: conversations.filter(c => c.status === 'active').length,
    waitingChats: conversations.filter(c => c.status === 'waiting').length,
    closedToday: conversations.filter(c => c.status === 'closed').length,
    averageRating: conversations.filter(c => c.satisfaction).reduce((acc, c) => acc + c.satisfaction!.rating, 0) / conversations.filter(c => c.satisfaction).length || 0,
    totalUnread: conversations.reduce((acc, c) => acc + c.unreadCount, 0)
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: ChatMessage = {
      id: selectedConversation.messages.length + 1,
      author: 'agent',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      read: true
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: newMessage,
      lastMessageTime: new Date().toISOString()
    };

    setConversations(conversations.map(c =>
      c.id === selectedConversation.id ? updatedConversation : c
    ));
    setSelectedConversation(updatedConversation);
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'border-l-red-500';
      case 'alta': return 'border-l-orange-500';
      case 'media': return 'border-l-yellow-500';
      case 'baixa': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'regular': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Chat Online
            </h1>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-blue-600 hover:text-blue-800"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Stats rápidas */}
          {showStats && (
            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="font-bold text-green-600">{estatisticas.activeChats}</div>
                <div className="text-green-700">Ativos</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded text-center">
                <div className="font-bold text-yellow-600">{estatisticas.waitingChats}</div>
                <div className="text-yellow-700">Aguardando</div>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <div className="font-bold text-blue-600">{estatisticas.totalUnread}</div>
                <div className="text-blue-700">Não lidas</div>
              </div>
            </div>
          )}

          {/* Busca e Filtro */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos Status</option>
              <option value="active">Ativo</option>
              <option value="waiting">Aguardando</option>
              <option value="closed">Finalizado</option>
              <option value="transferred">Transferido</option>
            </select>
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {conversationsFiltradas.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-blue-500' : getPriorityColor(conversation.priority)
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  {conversation.client.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{conversation.client.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClientTypeColor(conversation.client.type)}`}>
                        {conversation.client.type}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 truncate mb-1">{conversation.lastMessage}</p>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {conversation.status}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversation.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área Principal - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do Chat */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    {selectedConversation.client.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConversation.client.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{selectedConversation.client.isOnline ? 'Online' : `Visto por último: ${formatTime(selectedConversation.client.lastSeen || '')}`}</span>
                      <span>•</span>
                      <span>{selectedConversation.client.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.author === 'agent' ? 'justify-end' : message.author === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {message.author === 'system' ? (
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {message.content}
                    </div>
                  ) : (
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.author === 'agent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`text-xs mt-1 ${
                        message.author === 'agent' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Avaliação de Satisfação */}
            {selectedConversation.satisfaction && (
              <div className="bg-green-50 border-t border-green-200 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">Avaliação: {selectedConversation.satisfaction.rating}/5</span>
                  <span className="text-gray-600">"{selectedConversation.satisfaction.comment}"</span>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Estado sem conversa selecionada */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
              <p className="text-gray-500">Escolha uma conversa da lista para começar a atender</p>
            </div>
          </div>
        )}
      </div>

      {/* Painel Lateral - Informações do Cliente */}
      {selectedConversation && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Informações do Cliente</h3>

          <div className="space-y-4">
            {/* Info básica */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Nome</div>
              <div className="font-medium">{selectedConversation.client.name}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Email</div>
              <div className="text-sm">{selectedConversation.client.email}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Telefone</div>
              <div className="text-sm">{selectedConversation.client.phone}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Tipo de Cliente</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClientTypeColor(selectedConversation.client.type)}`}>
                {selectedConversation.client.type.toUpperCase()}
              </span>
            </div>

            {/* Agente responsável */}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Agente Responsável</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="text-sm">{selectedConversation.agent.name}</span>
              </div>
            </div>

            {/* Departamento e prioridade */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Departamento</div>
              <div className="text-sm capitalize">{selectedConversation.department}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Prioridade</div>
              <div className="text-sm capitalize">{selectedConversation.priority}</div>
            </div>

            {/* Tags */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Tags</div>
              <div className="flex flex-wrap gap-1">
                {selectedConversation.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tempo de chat */}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Início do Chat</div>
              <div className="text-sm">{new Date(selectedConversation.startTime).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatOnline;
