'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Tabs, Avatar, Select, ScrollArea } from '@/components/ui';
import { Search, Filter, Download, Eye, MessageSquare, Clock, User, Star, FileText, Image, Phone, Video } from 'lucide-react';
import { toast } from 'sonner';

interface ChatConversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  agentName: string;
  agentAvatar: string;
  status: 'active' | 'resolved' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  lastMessage: string;
  messageCount: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // em minutos
  rating?: number;
  tags: string[];
  category: string;
  channel: 'chat' | 'email' | 'phone' | 'video';
}

interface ChatConversationsProps {
  onConversationSelect?: (conversation: ChatConversation) => void;
}

export default function ChatConversations({ onConversationSelect }: ChatConversationsProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: '1',
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerAvatar: '/avatars/customer1.jpg',
      agentName: 'João Silva',
      agentAvatar: '/avatars/joao.jpg',
      status: 'resolved',
      priority: 'high',
      subject: 'Problema com reserva de hotel',
      lastMessage: 'Reserva confirmada e enviada por email. Obrigado!',
      messageCount: 15,
      startTime: new Date(Date.now() - 86400000),
      endTime: new Date(Date.now() - 3600000),
      duration: 45,
      rating: 5,
      tags: ['reserva', 'hotel', 'problema'],
      category: 'Reservas',
      channel: 'chat',
    },
    {
      id: '2',
      customerName: 'Ana Costa',
      customerEmail: 'ana.costa@email.com',
      customerAvatar: '/avatars/customer2.jpg',
      agentName: 'Maria Santos',
      agentAvatar: '/avatars/maria.jpg',
      status: 'active',
      priority: 'medium',
      subject: 'Consulta sobre pacotes de viagem',
      lastMessage: 'Gostaria de mais informações sobre o pacote para Caldas Novas',
      messageCount: 8,
      startTime: new Date(Date.now() - 7200000),
      duration: 25,
      tags: ['consulta', 'pacotes', 'caldas novas'],
      category: 'Consultas',
      channel: 'chat',
    },
    {
      id: '3',
      customerName: 'Roberto Silva',
      customerEmail: 'roberto.silva@email.com',
      customerAvatar: '/avatars/customer3.jpg',
      agentName: 'Pedro Costa',
      agentAvatar: '/avatars/pedro.jpg',
      status: 'pending',
      priority: 'low',
      subject: 'Solicitação de reembolso',
      lastMessage: 'Aguardando aprovação do financeiro',
      messageCount: 12,
      startTime: new Date(Date.now() - 172800000),
      duration: 60,
      tags: ['reembolso', 'financeiro'],
      category: 'Financeiro',
      channel: 'email',
    },
    {
      id: '4',
      customerName: 'Fernanda Lima',
      customerEmail: 'fernanda.lima@email.com',
      customerAvatar: '/avatars/customer4.jpg',
      agentName: 'Ana Tech',
      agentAvatar: '/avatars/ana.jpg',
      status: 'closed',
      priority: 'urgent',
      subject: 'Erro no sistema de pagamento',
      lastMessage: 'Problema resolvido. Sistema funcionando normalmente',
      messageCount: 20,
      startTime: new Date(Date.now() - 259200000),
      endTime: new Date(Date.now() - 86400000),
      duration: 90,
      rating: 4,
      tags: ['erro', 'pagamento', 'sistema'],
      category: 'Suporte Técnico',
      channel: 'phone',
    },
    {
      id: '5',
      customerName: 'Lucas Mendes',
      customerEmail: 'lucas.mendes@email.com',
      customerAvatar: '/avatars/customer5.jpg',
      agentName: 'Bot RSV',
      agentAvatar: '/avatars/bot.jpg',
      status: 'resolved',
      priority: 'low',
      subject: 'Informações sobre check-in',
      lastMessage: 'Check-in disponível a partir das 14h. Documentos necessários enviados',
      messageCount: 6,
      startTime: new Date(Date.now() - 43200000),
      endTime: new Date(Date.now() - 1800000),
      duration: 10,
      rating: 4,
      tags: ['check-in', 'documentos', 'horário'],
      category: 'Check-in/Check-out',
      channel: 'chat',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conversation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || conversation.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || conversation.category === categoryFilter;
    const matchesChannel = channelFilter === 'all' || conversation.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesChannel;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.startTime.getTime() - a.startTime.getTime();
      case 'oldest':
        return a.startTime.getTime() - b.startTime.getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'duration':
        return b.duration - a.duration;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <FileText className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'resolved': return 'Resolvida';
      case 'pending': return 'Pendente';
      case 'closed': return 'Fechada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
    pending: conversations.filter(c => c.status === 'pending').length,
    closed: conversations.filter(c => c.status === 'closed').length,
    avgRating: (conversations.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / conversations.filter(c => c.rating).length).toFixed(1),
    avgDuration: (conversations.reduce((sum, c) => sum + c.duration, 0) / conversations.length).toFixed(0),
  };

  const handleExport = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Conversas</h2>
          <p className="text-gray-600">Gerencie e analise todas as conversas com clientes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duração Média</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDuration}min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">Todos os Status</option>
            <option value="active">Ativa</option>
            <option value="resolved">Resolvida</option>
            <option value="pending">Pendente</option>
            <option value="closed">Fechada</option>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <option value="recent">Mais Recentes</option>
            <option value="oldest">Mais Antigas</option>
            <option value="priority">Por Prioridade</option>
            <option value="duration">Por Duração</option>
            <option value="rating">Por Avaliação</option>
          </Select>
        </div>
      </div>

      {/* Tabs de Categorias */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Todas ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ativas ({stats.active})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'resolved'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Resolvidas ({stats.resolved})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pendentes ({stats.pending})
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {sortedConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onConversationSelect?.(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <img src={conversation.customerAvatar} alt={conversation.customerName} />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{conversation.customerName}</h3>
                            <Badge className={getStatusColor(conversation.status)}>
                              {getStatusLabel(conversation.status)}
                            </Badge>
                            <Badge className={getPriorityColor(conversation.priority)}>
                              {getPriorityLabel(conversation.priority)}
                            </Badge>
                            <div className="flex items-center space-x-1 text-gray-500">
                              {getChannelIcon(conversation.channel)}
                              <span className="text-xs capitalize">{conversation.channel}</span>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900 mb-1">{conversation.subject}</p>
                          <p className="text-sm text-gray-600 mb-2">{conversation.lastMessage}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Agente: {conversation.agentName}</span>
                            <span>•</span>
                            <span>{conversation.messageCount} mensagens</span>
                            <span>•</span>
                            <span>Duração: {formatDuration(conversation.duration)}</span>
                            <span>•</span>
                            <span>{formatDate(conversation.startTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {conversation.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {conversation.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{conversation.rating}</span>
                          </div>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
