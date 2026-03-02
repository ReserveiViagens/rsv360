'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Progress } from '@/components/ui';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Clock, Play, Pause, RefreshCw, Download, Filter, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface ProcessInstance {
  id: string;
  name: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep: string;
  progress: number;
  startedAt: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  duration: number;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
}

interface ProcessMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  color: string;
}

interface ProcessAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  processId: string;
  processName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

interface ProcessMonitoringProps {
  onProcessSelect?: (process: ProcessInstance) => void;
}

export default function ProcessMonitoring({ onProcessSelect }: ProcessMonitoringProps) {
  const [processes, setProcesses] = useState<ProcessInstance[]>([
    {
      id: '1',
      name: 'Processamento de Reserva #12345',
      workflowId: 'workflow1',
      workflowName: 'Aprovação de Reservas',
      status: 'running',
      currentStep: 'Aprovação Financeira',
      progress: 75,
      startedAt: new Date(Date.now() - 3600000),
      estimatedCompletion: new Date(Date.now() + 7200000),
      duration: 3600,
      assignee: 'Ana Costa',
      priority: 'high',
      tags: ['Reserva', 'VIP', 'Aprovação'],
    },
    {
      id: '2',
      name: 'Processamento de Check-in #67890',
      workflowId: 'workflow2',
      workflowName: 'Check-in de Hóspedes',
      status: 'completed',
      currentStep: 'Check-in Concluído',
      progress: 100,
      startedAt: new Date(Date.now() - 1800000),
      actualCompletion: new Date(Date.now() - 900000),
      duration: 900,
      assignee: 'João Silva',
      priority: 'medium',
      tags: ['Check-in', 'Hóspede'],
    },
    {
      id: '3',
      name: 'Processamento de Pagamento #11111',
      workflowId: 'workflow3',
      workflowName: 'Processamento de Pagamentos',
      status: 'failed',
      currentStep: 'Validação de Cartão',
      progress: 45,
      startedAt: new Date(Date.now() - 5400000),
      duration: 5400,
      assignee: 'Maria Santos',
      priority: 'urgent',
      tags: ['Pagamento', 'Erro'],
    },
    {
      id: '4',
      name: 'Processamento de Reembolso #22222',
      workflowId: 'workflow4',
      workflowName: 'Processamento de Reembolsos',
      status: 'paused',
      currentStep: 'Aprovação de Reembolso',
      progress: 60,
      startedAt: new Date(Date.now() - 7200000),
      estimatedCompletion: new Date(Date.now() + 14400000),
      duration: 7200,
      assignee: 'Carlos Lima',
      priority: 'medium',
      tags: ['Reembolso', 'Pausado'],
    },
    {
      id: '5',
      name: 'Processamento de Upgrade #33333',
      workflowId: 'workflow5',
      workflowName: 'Processamento de Upgrades',
      status: 'running',
      currentStep: 'Verificação de Disponibilidade',
      progress: 30,
      startedAt: new Date(Date.now() - 1800000),
      estimatedCompletion: new Date(Date.now() + 4200000),
      duration: 1800,
      assignee: 'Roberto Alves',
      priority: 'low',
      tags: ['Upgrade', 'Quarto'],
    },
  ]);

  const [alerts, setAlerts] = useState<ProcessAlert[]>([
    {
      id: '1',
      type: 'error',
      title: 'Processo Falhou',
      message: 'O processo de pagamento #11111 falhou na validação de cartão',
      processId: '3',
      processName: 'Processamento de Pagamento #11111',
      severity: 'high',
      createdAt: new Date(Date.now() - 1800000),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Processo Pausado',
      message: 'O processo de reembolso #22222 foi pausado por 2 horas',
      processId: '4',
      processName: 'Processamento de Reembolso #22222',
      severity: 'medium',
      createdAt: new Date(Date.now() - 3600000),
      acknowledged: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Processo Lento',
      message: 'O processo de reserva #12345 está demorando mais que o esperado',
      processId: '1',
      processName: 'Processamento de Reserva #12345',
      severity: 'low',
      createdAt: new Date(Date.now() - 900000),
      acknowledged: true,
      acknowledgedBy: 'Admin',
      acknowledgedAt: new Date(Date.now() - 600000),
    },
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(process => {
        if (process.status === 'running' && process.progress < 100) {
          const newProgress = Math.min(100, process.progress + Math.random() * 5);
          return {
            ...process,
            progress: newProgress,
            duration: process.duration + 1,
            status: newProgress >= 100 ? 'completed' : 'running',
            actualCompletion: newProgress >= 100 ? new Date() : undefined,
          };
        }
        return process;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePauseProcess = (processId: string) => {
    setProcesses(prev => prev.map(process => 
      process.id === processId 
        ? { ...process, status: 'paused' as const, updatedAt: new Date() }
        : process
    ));
    toast.success('Processo pausado!');
  };

  const handleResumeProcess = (processId: string) => {
    setProcesses(prev => prev.map(process => 
      process.id === processId 
        ? { ...process, status: 'running' as const, updatedAt: new Date() }
        : process
    ));
    toast.success('Processo retomado!');
  };

  const handleCancelProcess = (processId: string) => {
    setProcesses(prev => prev.map(process => 
      process.id === processId 
        ? { ...process, status: 'cancelled' as const, updatedAt: new Date() }
        : process
    ));
    toast.success('Processo cancelado!');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedBy: 'Usuário Atual', acknowledgedAt: new Date() }
        : alert
    ));
    toast.success('Alerta reconhecido!');
  };

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         process.workflowName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || process.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'Em Execução';
      case 'completed': return 'Concluído';
      case 'failed': return 'Falhou';
      case 'paused': return 'Pausado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Eye className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeRemaining = (estimatedCompletion?: Date) => {
    if (!estimatedCompletion) return 'N/A';
    const now = new Date();
    const diff = estimatedCompletion.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Atrasado';
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const stats = {
    total: processes.length,
    running: processes.filter(p => p.status === 'running').length,
    completed: processes.filter(p => p.status === 'completed').length,
    failed: processes.filter(p => p.status === 'failed').length,
    paused: processes.filter(p => p.status === 'paused').length,
    cancelled: processes.filter(p => p.status === 'cancelled').length,
    alerts: alerts.filter(a => !a.acknowledged).length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
  };

  const performanceData = [
    { time: '00:00', processes: 12, completed: 8, failed: 1 },
    { time: '04:00', processes: 15, completed: 12, failed: 2 },
    { time: '08:00', processes: 28, completed: 20, failed: 3 },
    { time: '12:00', processes: 35, completed: 28, failed: 4 },
    { time: '16:00', processes: 42, completed: 35, failed: 5 },
    { time: '20:00', processes: 38, completed: 32, failed: 3 },
    { time: '24:00', processes: 25, completed: 22, failed: 2 },
  ];

  const workflowPerformance = [
    { name: 'Aprovação de Reservas', completed: 45, failed: 2, avgTime: 1800 },
    { name: 'Check-in de Hóspedes', completed: 78, failed: 1, avgTime: 900 },
    { name: 'Processamento de Pagamentos', completed: 32, failed: 5, avgTime: 1200 },
    { name: 'Processamento de Reembolsos', completed: 18, failed: 3, avgTime: 3600 },
    { name: 'Processamento de Upgrades', completed: 25, failed: 1, avgTime: 2400 },
  ];

  const statusDistribution = [
    { name: 'Em Execução', value: stats.running, color: '#3B82F6' },
    { name: 'Concluído', value: stats.completed, color: '#10B981' },
    { name: 'Falhou', value: stats.failed, color: '#EF4444' },
    { name: 'Pausado', value: stats.paused, color: '#F59E0B' },
    { name: 'Cancelado', value: stats.cancelled, color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Processos</h2>
          <p className="text-gray-600">Acompanhe em tempo real o status e performance dos processos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de exportação em desenvolvimento')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de configurações em desenvolvimento')}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Estatísticas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Execução</p>
              <p className="text-2xl font-bold text-gray-900">{stats.running}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Falharam</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alertas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar processos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">Todos os Status</option>
            <option value="running">Em Execução</option>
            <option value="completed">Concluído</option>
            <option value="failed">Falhou</option>
            <option value="paused">Pausado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <option value="all">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <option value="1h">Última Hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </Select>
        </div>
      </Card>

      {/* Conteúdo Principal */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-4">
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
                onClick={() => setActiveTab('processes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'processes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Processos ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alerts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Alertas ({stats.alerts})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Gráfico de Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance em Tempo Real</h3>
                  <Card className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="processes" stroke="#3B82F6" strokeWidth={2} name="Processos Ativos" />
                        <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Concluídos" />
                        <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} name="Falharam" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Distribuição de Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
                    <Card className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Workflow</h3>
                    <Card className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={workflowPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#10B981" name="Concluídos" />
                          <Bar dataKey="failed" fill="#EF4444" name="Falharam" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'processes' && (
              <div className="space-y-4">
                {filteredProcesses.map((process) => (
                  <div
                    key={process.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{process.name}</h3>
                          <Badge className={getStatusColor(process.status)}>
                            {getStatusLabel(process.status)}
                          </Badge>
                          <Badge className={getPriorityColor(process.priority)}>
                            {getPriorityLabel(process.priority)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Workflow:</span>
                            <p className="font-medium">{process.workflowName}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Passo Atual:</span>
                            <p className="font-medium">{process.currentStep}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Progresso:</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={process.progress} className="flex-1" />
                              <span className="text-sm font-medium">{process.progress}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Iniciado:</span>
                            <p className="text-sm">{process.startedAt.toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Duração:</span>
                            <p className="text-sm">{formatDuration(process.duration)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Tempo Restante:</span>
                            <p className="text-sm">{formatTimeRemaining(process.estimatedCompletion)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Responsável:</span>
                            <p className="text-sm">{process.assignee || 'Não atribuído'}</p>
                          </div>
                        </div>
                        
                        {process.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            {process.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {process.status === 'running' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePauseProcess(process.id)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelProcess(process.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {process.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeProcess(process.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onProcessSelect?.(process)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Alertas do Sistema</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={stats.criticalAlerts > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                      {stats.criticalAlerts} Críticos
                    </Badge>
                  </div>
                </div>
                
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${
                      alert.acknowledged 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.type)}`}>
                            {getAlertTypeIcon(alert.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {!alert.acknowledged && (
                                <Badge className="bg-red-100 text-red-800">Não Reconhecido</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Processo: {alert.processName}</span>
                          <span>Criado: {alert.createdAt.toLocaleString()}</span>
                          {alert.acknowledged && (
                            <>
                              <span>Reconhecido por: {alert.acknowledgedBy}</span>
                              <span>Em: {alert.acknowledgedAt?.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Reconhecer
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onProcessSelect?.(processes.find(p => p.id === alert.processId))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Análise de Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Tempo Médio de Execução</h4>
                    <div className="space-y-3">
                      {workflowPerformance.map((workflow) => (
                        <div key={workflow.name} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{workflow.name}</span>
                          <span className="font-medium">{formatDuration(workflow.avgTime)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Taxa de Sucesso</h4>
                    <div className="space-y-3">
                      {workflowPerformance.map((workflow) => {
                        const successRate = workflow.completed + workflow.failed > 0 
                          ? (workflow.completed / (workflow.completed + workflow.failed)) * 100 
                          : 0;
                        return (
                          <div key={workflow.name} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{workflow.name}</span>
                            <span className="font-medium">{successRate.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Mais análises e métricas avançadas estarão disponíveis em breve.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
