'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Badge, Tabs } from '@/components/ui';
import { TrendingUp, TrendingDown, Users, MessageSquare, Clock, Star, Download, Calendar, Filter, BarChart3, LineChart, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface ChatMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface TimeSeriesData {
  date: string;
  chats: number;
  messages: number;
  avgResponseTime: number;
  satisfaction: number;
}

interface AgentPerformance {
  name: string;
  chats: number;
  avgResponseTime: number;
  satisfaction: number;
  resolutionRate: number;
}

interface ChatAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function ChatAnalytics({ timeRange = '30d' }: ChatAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeTab, setActiveTab] = useState('overview');

  // Dados simulados para métricas
  const metrics: ChatMetric[] = [
    {
      name: 'Total de Chats',
      value: 1247,
      change: 12.5,
      trend: 'up',
      color: 'bg-blue-500',
    },
    {
      name: 'Taxa de Resolução',
      value: 94.2,
      change: 2.1,
      trend: 'up',
      color: 'bg-green-500',
    },
    {
      name: 'Tempo Médio de Resposta',
      value: 2.3,
      change: -8.7,
      trend: 'down',
      color: 'bg-yellow-500',
    },
    {
      name: 'Satisfação do Cliente',
      value: 4.7,
      change: 0.3,
      trend: 'up',
      color: 'bg-purple-500',
    },
    {
      name: 'Agentes Ativos',
      value: 8,
      change: 0,
      trend: 'stable',
      color: 'bg-indigo-500',
    },
    {
      name: 'Chats Simultâneos',
      value: 23,
      change: 15.2,
      trend: 'up',
      color: 'bg-pink-500',
    },
  ];

  // Dados simulados para série temporal
  const timeSeriesData: TimeSeriesData[] = [
    { date: '01/08', chats: 45, messages: 234, avgResponseTime: 2.1, satisfaction: 4.6 },
    { date: '02/08', chats: 52, messages: 287, avgResponseTime: 1.9, satisfaction: 4.7 },
    { date: '03/08', chats: 48, messages: 256, avgResponseTime: 2.3, satisfaction: 4.5 },
    { date: '04/08', chats: 61, messages: 312, avgResponseTime: 2.0, satisfaction: 4.8 },
    { date: '05/08', chats: 58, messages: 298, avgResponseTime: 1.8, satisfaction: 4.9 },
    { date: '06/08', chats: 67, messages: 345, avgResponseTime: 2.2, satisfaction: 4.7 },
    { date: '07/08', chats: 73, messages: 378, avgResponseTime: 2.4, satisfaction: 4.6 },
  ];

  // Dados simulados para performance dos agentes
  const agentPerformance: AgentPerformance[] = [
    { name: 'João Silva', chats: 156, avgResponseTime: 1.8, satisfaction: 4.9, resolutionRate: 96.2 },
    { name: 'Maria Santos', chats: 142, avgResponseTime: 2.1, satisfaction: 4.8, resolutionRate: 94.7 },
    { name: 'Pedro Costa', chats: 128, avgResponseTime: 2.5, satisfaction: 4.6, resolutionRate: 92.1 },
    { name: 'Ana Tech', chats: 134, avgResponseTime: 2.0, satisfaction: 4.7, resolutionRate: 95.3 },
    { name: 'Bot RSV', chats: 687, avgResponseTime: 0.5, satisfaction: 4.2, resolutionRate: 89.4 },
  ];

  // Dados simulados para distribuição por categoria
  const categoryData = [
    { name: 'Reservas', value: 35, color: '#3B82F6' },
    { name: 'Suporte Técnico', value: 25, color: '#10B981' },
    { name: 'Pagamentos', value: 20, color: '#F59E0B' },
    { name: 'Check-in/Check-out', value: 15, color: '#8B5CF6' },
    { name: 'Outros', value: 5, color: '#EF4444' },
  ];

  // Dados simulados para distribuição por canal
  const channelData = [
    { name: 'Chat', value: 65, color: '#3B82F6' },
    { name: 'Email', value: 20, color: '#10B981' },
    { name: 'Telefone', value: 12, color: '#F59E0B' },
    { name: 'Vídeo', value: 3, color: '#8B5CF6' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 text-gray-400">—</div>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleExport = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics do Chat</h2>
          <p className="text-gray-600">Métricas e insights sobre o desempenho do atendimento</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-gray-500">vs período anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                <div className={`w-8 h-8 rounded-lg ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs de Analytics */}
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
                  Performance dos Agentes
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'trends'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tendências
                </button>
                <button
                  onClick={() => setActiveTab('distribution')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'distribution'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Distribuição
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Volume de Chats */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume de Chats</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="chats" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Tempo Médio de Resposta */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tempo Médio de Resposta</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgResponseTime" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribuição por Categoria */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Distribuição por Canal */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Canal</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance dos Agentes - Chats */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume de Chats por Agente</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={agentPerformance} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="chats" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Performance dos Agentes - Satisfação */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfação por Agente</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={agentPerformance} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="satisfaction" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Tabela de Performance */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total de Chats
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tempo Médio (min)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Satisfação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Taxa de Resolução
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {agentPerformance.map((agent, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {agent.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(agent.chats)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agent.avgResponseTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span>{agent.satisfaction}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatPercentage(agent.resolutionRate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tendência de Mensagens */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume de Mensagens</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="messages" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Tendência de Satisfação */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução da Satisfação</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Análise de Tendências */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Tendências</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-600 font-medium">Crescimento</p>
                      <p className="text-2xl font-bold text-green-700">+15.2%</p>
                      <p className="text-xs text-green-600">Volume de chats</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-600 font-medium">Melhoria</p>
                      <p className="text-2xl font-bold text-blue-700">-8.7%</p>
                      <p className="text-xs text-blue-600">Tempo de resposta</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-600 font-medium">Estabilidade</p>
                      <p className="text-2xl font-bold text-purple-700">4.7</p>
                      <p className="text-xs text-purple-600">Satisfação média</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'distribution' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribuição por Hora do Dia */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade por Hora</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { hour: '8h', chats: 12, messages: 45 },
                        { hour: '9h', chats: 18, messages: 67 },
                        { hour: '10h', chats: 25, messages: 89 },
                        { hour: '11h', chats: 22, messages: 78 },
                        { hour: '12h', chats: 15, messages: 56 },
                        { hour: '13h', chats: 20, messages: 72 },
                        { hour: '14h', chats: 28, messages: 95 },
                        { hour: '15h', chats: 32, messages: 108 },
                        { hour: '16h', chats: 26, messages: 87 },
                        { hour: '17h', chats: 18, messages: 63 },
                        { hour: '18h', chats: 12, messages: 41 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="chats" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Distribuição por Dia da Semana */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade por Dia da Semana</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { day: 'Seg', chats: 45, messages: 156 },
                        { day: 'Ter', chats: 52, messages: 187 },
                        { day: 'Qua', chats: 48, messages: 169 },
                        { day: 'Qui', chats: 61, messages: 212 },
                        { day: 'Sex', chats: 58, messages: 198 },
                        { day: 'Sáb', chats: 35, messages: 123 },
                        { day: 'Dom', chats: 28, messages: 98 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="chats" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Resumo de Distribuição */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Distribuição</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Pico de Atividade</p>
                      <p className="text-xl font-bold text-blue-700">15h</p>
                      <p className="text-xs text-blue-600">32 chats</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Dia Mais Ativo</p>
                      <p className="text-xl font-bold text-green-700">Quinta</p>
                      <p className="text-xs text-green-600">61 chats</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">Categoria Principal</p>
                      <p className="text-xl font-bold text-yellow-700">Reservas</p>
                      <p className="text-xs text-yellow-600">35%</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Canal Preferido</p>
                      <p className="text-xl font-bold text-purple-700">Chat</p>
                      <p className="text-xs text-purple-600">65%</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
