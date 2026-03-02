'use client';
import React, { useState } from 'react';
import { Card, Button, Tabs, Badge } from '@/components/ui';
import { MessageSquare, Users, History, BarChart3, Settings, Phone, Video, FileText, Image, Smile, Star, Clock, TrendingUp } from 'lucide-react';
import { ChatSystem, ChatAgents, ChatConversations, ChatAnalytics } from '@/components/chat';

export default function ChatSystemTest() {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentUserId] = useState('current-user-123');

  const tabs = [
    {
      id: 'chat',
      label: 'Sistema de Chat',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Chat interno em tempo real com salas de conversa',
      component: <ChatSystem currentUserId={currentUserId} />,
    },
    {
      id: 'agents',
      label: 'Gestão de Agentes',
      icon: <Users className="h-4 w-4" />,
      description: 'Gestão completa da equipe de atendimento',
      component: <ChatAgents />,
    },
    {
      id: 'conversations',
      label: 'Histórico de Conversas',
      icon: <History className="h-4 w-4" />,
      description: 'Histórico e gestão de todas as conversas',
      component: <ChatConversations />,
    },
    {
      id: 'analytics',
      label: 'Analytics do Chat',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Métricas e insights sobre o desempenho',
      component: <ChatAnalytics />,
    },
  ];

  const features = [
    {
      title: 'Chat em Tempo Real',
      description: 'Comunicação instantânea entre equipes e clientes',
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      features: ['Salas de conversa', 'Mensagens em tempo real', 'Upload de arquivos', 'Emojis e reações'],
    },
    {
      title: 'Gestão de Agentes',
      description: 'Controle completo sobre a equipe de atendimento',
      icon: <Users className="h-6 w-6 text-green-600" />,
      features: ['Perfis de agentes', 'Controle de status', 'Gestão de habilidades', 'Métricas de performance'],
    },
    {
      title: 'Histórico Completo',
      description: 'Rastreamento de todas as conversas e interações',
      icon: <History className="h-6 w-6 text-purple-600" />,
      description: ['Busca avançada', 'Filtros por categoria', 'Tags e prioridades', 'Exportação de dados'],
    },
    {
      title: 'Analytics Avançados',
      description: 'Insights detalhados sobre o desempenho do atendimento',
      icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
      features: ['Métricas em tempo real', 'Gráficos interativos', 'Tendências e padrões', 'Relatórios personalizados'],
    },
  ];

  const benefits = [
    {
      title: 'Comunicação Eficiente',
      description: 'Equipes conectadas em tempo real para melhor colaboração',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
    },
    {
      title: 'Atendimento Profissional',
      description: 'Sistema robusto para gestão de suporte ao cliente',
      icon: <Star className="h-5 w-5 text-yellow-600" />,
    },
    {
      title: 'Produtividade Aumentada',
      description: 'Ferramentas que aceleram a resolução de problemas',
      icon: <Clock className="h-5 w-5 text-blue-600" />,
    },
    {
      title: 'Insights Valiosos',
      description: 'Dados para melhorar continuamente o atendimento',
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Sistema de Chat Interno</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo de comunicação interna e atendimento ao cliente com chat em tempo real, 
            gestão de agentes, histórico de conversas e analytics avançados.
          </p>
        </div>

        {/* Features Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Funcionalidades Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Benefícios do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Demonstração Interativa</h2>
            <p className="text-gray-600">
              Teste todas as funcionalidades do sistema de chat interno
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
          </Card>
        </div>

        {/* Technical Details */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Detalhes Técnicos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tecnologias Utilizadas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Frontend Framework</span>
                  <Badge variant="secondary">React + TypeScript</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">UI Components</span>
                  <Badge variant="secondary">Shadcn/UI + Tailwind</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Charts</span>
                  <Badge variant="secondary">Recharts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">State Management</span>
                  <Badge variant="secondary">React Hooks</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Real-time</span>
                  <Badge variant="secondary">WebSocket Ready</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidades Implementadas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Chat em Tempo Real</span>
                  <Badge className="bg-green-100 text-green-800">✅ Completo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gestão de Agentes</span>
                  <Badge className="bg-green-100 text-green-800">✅ Completo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Histórico de Conversas</span>
                  <Badge className="bg-green-100 text-green-800">✅ Completo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analytics Avançados</span>
                  <Badge className="bg-green-100 text-green-800">✅ Completo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upload de Arquivos</span>
                  <Badge className="bg-green-100 text-green-800">✅ Completo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Métricas de Performance</span>
                  <Badge className="bg-green-100 text-green-800">✅ Completo</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Integration Info */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sistema Pronto para Integração
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              O sistema de chat interno está completamente implementado e pronto para ser integrado 
              ao sistema principal RSV. Todas as funcionalidades estão funcionais e podem ser 
              conectadas a APIs reais e WebSockets para comunicação em tempo real.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Chat em Tempo Real</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Gestão de Agentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Analytics Completos</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
