'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Avatar, Switch, Select } from '@/components/ui';
import { Plus, Search, Edit, Trash2, MessageSquare, Clock, Users, Star, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ChatAgent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'supervisor' | 'agent' | 'bot';
  status: 'online' | 'offline' | 'away' | 'busy';
  skills: string[];
  maxConcurrentChats: number;
  currentChats: number;
  rating: number;
  totalChats: number;
  avgResponseTime: number;
  isActive: boolean;
  lastActive: Date;
}

interface ChatAgentsProps {
  onAgentSelect?: (agent: ChatAgent) => void;
}

export default function ChatAgents({ onAgentSelect }: ChatAgentsProps) {
  const [agents, setAgents] = useState<ChatAgent[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@rsv.com',
      avatar: '/avatars/joao.jpg',
      role: 'admin',
      status: 'online',
      skills: ['Reservas', 'Pagamentos', 'Suporte Técnico'],
      maxConcurrentChats: 5,
      currentChats: 2,
      rating: 4.8,
      totalChats: 1250,
      avgResponseTime: 2.5,
      isActive: true,
      lastActive: new Date(),
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@rsv.com',
      avatar: '/avatars/maria.jpg',
      role: 'supervisor',
      status: 'online',
      skills: ['Gestão de Clientes', 'Relatórios', 'Treinamento'],
      maxConcurrentChats: 8,
      currentChats: 4,
      rating: 4.9,
      totalChats: 2100,
      avgResponseTime: 1.8,
      isActive: true,
      lastActive: new Date(),
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro.costa@rsv.com',
      avatar: '/avatars/pedro.jpg',
      role: 'agent',
      status: 'away',
      skills: ['Reservas', 'Check-in/Check-out'],
      maxConcurrentChats: 3,
      currentChats: 0,
      rating: 4.6,
      totalChats: 850,
      avgResponseTime: 3.2,
      isActive: true,
      lastActive: new Date(Date.now() - 1800000),
    },
    {
      id: '4',
      name: 'Ana Tech',
      email: 'ana.tech@rsv.com',
      avatar: '/avatars/ana.jpg',
      role: 'agent',
      status: 'busy',
      skills: ['Suporte Técnico', 'Integrações'],
      maxConcurrentChats: 4,
      currentChats: 4,
      rating: 4.7,
      totalChats: 1100,
      avgResponseTime: 2.1,
      isActive: true,
      lastActive: new Date(),
    },
    {
      id: '5',
      name: 'Bot RSV',
      email: 'bot@rsv.com',
      avatar: '/avatars/bot.jpg',
      role: 'bot',
      status: 'online',
      skills: ['FAQ', 'Reservas Simples', 'Informações Básicas'],
      maxConcurrentChats: 50,
      currentChats: 15,
      rating: 4.2,
      totalChats: 5000,
      avgResponseTime: 0.5,
      isActive: true,
      lastActive: new Date(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesRole = roleFilter === 'all' || agent.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = (agentId: string, newStatus: ChatAgent['status']) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status: newStatus } : agent
    ));
    toast.success('Status do agente atualizado!');
  };

  const handleActiveToggle = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, isActive: !agent.isActive } : agent
    ));
    toast.success('Status do agente alterado!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'bot': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'agent': return 'Agente';
      case 'bot': return 'Bot';
      default: return role;
    }
  };

  const stats = {
    totalAgents: agents.length,
    onlineAgents: agents.filter(a => a.status === 'online').length,
    activeAgents: agents.filter(a => a.isActive).length,
    totalChats: agents.reduce((sum, a) => sum + a.totalChats, 0),
    avgRating: (agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Agentes</h2>
          <p className="text-gray-600">Gerencie sua equipe de atendimento ao cliente</p>
        </div>
        <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Agentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onlineAgents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Chats</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalChats.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar agentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">Todos os Status</option>
            <option value="online">Online</option>
            <option value="away">Ausente</option>
            <option value="busy">Ocupado</option>
            <option value="offline">Offline</option>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <option value="all">Todas as Funções</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="agent">Agente</option>
            <option value="bot">Bot</option>
          </Select>
        </div>
      </Card>

      {/* Lista de Agentes */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'performance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'skills'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Habilidades
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <img src={agent.avatar} alt={agent.name} />
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getRoleColor(agent.role)}>
                            {getRoleLabel(agent.role)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {agent.currentChats}/{agent.maxConcurrentChats} chats
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{agent.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">{agent.totalChats} chats</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={agent.status}
                          onValueChange={(value: ChatAgent['status']) => handleStatusChange(agent.id, value)}
                        >
                          <option value="online">Online</option>
                          <option value="away">Ausente</option>
                          <option value="busy">Ocupado</option>
                          <option value="offline">Offline</option>
                        </Select>
                        
                        <Switch
                          checked={agent.isActive}
                          onCheckedChange={() => handleActiveToggle(agent.id)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAgentSelect?.(agent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{agent.name}</h4>
                      <Badge className={getRoleColor(agent.role)}>
                        {getRoleLabel(agent.role)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{agent.totalChats}</p>
                        <p className="text-sm text-gray-500">Total de Chats</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{agent.rating}</p>
                        <p className="text-sm text-gray-500">Avaliação</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{agent.avgResponseTime}s</p>
                        <p className="text-sm text-gray-500">Tempo Médio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{agent.currentChats}</p>
                        <p className="text-sm text-gray-500">Chats Ativos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{agent.name}</h4>
                      <Badge className={getRoleColor(agent.role)}>
                        {getRoleLabel(agent.role)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Habilidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
