'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Switch } from '@/components/ui';
import { Plus, Settings, Play, Pause, Trash2, Save, Clock, Calendar, Zap, Repeat, AlertTriangle, CheckCircle, XCircle, Edit, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface AutomatedTask {
  id: string;
  name: string;
  description: string;
  type: 'scheduled' | 'triggered' | 'recurring' | 'conditional';
  status: 'active' | 'paused' | 'draft' | 'error';
  trigger: {
    type: 'time' | 'event' | 'condition' | 'webhook';
    value: string;
    schedule?: string;
    conditions?: string[];
  };
  actions: {
    type: 'email' | 'notification' | 'api_call' | 'database' | 'workflow';
    config: Record<string, any>;
  }[];
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successCount: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface TaskAutomationProps {
  onTaskSelect?: (task: AutomatedTask) => void;
}

export default function TaskAutomation({ onTaskSelect }: TaskAutomationProps) {
  const [tasks, setTasks] = useState<AutomatedTask[]>([
    {
      id: '1',
      name: 'Envio de Lembretes de Check-in',
      description: 'Envia lembretes automáticos para hóspedes 24h antes do check-in',
      type: 'scheduled',
      status: 'active',
      trigger: {
        type: 'time',
        value: '24h_before_checkin',
        schedule: '0 8 * * *', // 8h da manhã todos os dias
      },
      actions: [
        {
          type: 'email',
          config: {
            template: 'checkin_reminder',
            recipients: 'guest_email',
            subject: 'Lembrete de Check-in - Hotel RSV',
          },
        },
        {
          type: 'notification',
          config: {
            type: 'push',
            message: 'Lembrete de check-in enviado para {guest_name}',
          },
        },
      ],
      lastRun: new Date(Date.now() - 86400000),
      nextRun: new Date(Date.now() + 86400000),
      runCount: 45,
      successCount: 43,
      errorCount: 2,
      createdAt: new Date(Date.now() - 2592000000),
      updatedAt: new Date(Date.now() - 86400000),
      createdBy: 'Admin',
    },
    {
      id: '2',
      name: 'Atualização de Status de Reservas',
      description: 'Atualiza automaticamente o status das reservas baseado em regras de negócio',
      type: 'triggered',
      status: 'active',
      trigger: {
        type: 'event',
        value: 'reservation_created',
        conditions: ['payment_confirmed', 'availability_checked'],
      },
      actions: [
        {
          type: 'workflow',
          config: {
            workflow_id: 'reservation_processing',
            trigger_data: 'reservation_data',
          },
        },
        {
          type: 'database',
          config: {
            operation: 'update',
            table: 'reservations',
            fields: { status: 'confirmed', updated_at: 'now()' },
            where: 'id = {reservation_id}',
          },
        },
      ],
      lastRun: new Date(Date.now() - 3600000),
      nextRun: undefined,
      runCount: 156,
      successCount: 154,
      errorCount: 2,
      createdAt: new Date(Date.now() - 5184000000),
      updatedAt: new Date(Date.now() - 3600000),
      createdBy: 'Admin',
    },
    {
      id: '3',
      name: 'Relatório Diário de Ocupação',
      description: 'Gera e envia relatório diário de ocupação para gerentes',
      type: 'recurring',
      status: 'active',
      trigger: {
        type: 'time',
        value: 'daily_occupancy_report',
        schedule: '0 18 * * *', // 18h todos os dias
      },
      actions: [
        {
          type: 'api_call',
          config: {
            endpoint: '/api/reports/occupancy',
            method: 'POST',
            data: { date: 'yesterday', format: 'pdf' },
          },
        },
        {
          type: 'email',
          config: {
            template: 'occupancy_report',
            recipients: 'managers_list',
            subject: 'Relatório Diário de Ocupação - {date}',
            attachments: ['occupancy_report.pdf'],
          },
        },
      ],
      lastRun: new Date(Date.now() - 86400000),
      nextRun: new Date(Date.now() + 3600000),
      runCount: 30,
      successCount: 30,
      errorCount: 0,
      createdAt: new Date(Date.now() - 2592000000),
      updatedAt: new Date(Date.now() - 86400000),
      createdBy: 'Admin',
    },
    {
      id: '4',
      name: 'Limpeza de Dados Antigos',
      description: 'Remove dados antigos e logs para otimizar performance',
      type: 'conditional',
      status: 'paused',
      trigger: {
        type: 'condition',
        value: 'storage_usage > 80%',
        conditions: ['storage_usage > 80%', 'last_cleanup > 7_days'],
      },
      actions: [
        {
          type: 'database',
          config: {
            operation: 'delete',
            table: 'logs',
            where: 'created_at < now() - interval \'90 days\'',
          },
        },
        {
          type: 'notification',
          config: {
            type: 'email',
            recipients: 'admin_team',
            subject: 'Limpeza Automática de Dados Executada',
            message: 'Dados antigos foram removidos para otimizar storage',
          },
        },
      ],
      lastRun: new Date(Date.now() - 604800000),
      nextRun: undefined,
      runCount: 12,
      successCount: 12,
      errorCount: 0,
      createdAt: new Date(Date.now() - 7776000000),
      updatedAt: new Date(Date.now() - 604800000),
      createdBy: 'Admin',
    },
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreateTask = () => {
    const newTask: AutomatedTask = {
      id: Date.now().toString(),
      name: 'Nova Tarefa Automatizada',
      description: 'Descrição da nova tarefa automatizada',
      type: 'scheduled',
      status: 'draft',
      trigger: {
        type: 'time',
        value: 'custom_schedule',
        schedule: '0 9 * * *',
      },
      actions: [
        {
          type: 'notification',
          config: {
            type: 'email',
            recipients: 'admin@rsv.com',
            subject: 'Nova Tarefa',
            message: 'Esta é uma nova tarefa automatizada',
          },
        },
      ],
      runCount: 0,
      successCount: 0,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Usuário Atual',
    };

    setTasks(prev => [...prev, newTask]);
    toast.success('Nova tarefa automatizada criada!');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === 'active' ? 'paused' : 'active',
            updatedAt: new Date()
          }
        : task
    ));
    toast.success('Status da tarefa alterado!');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Tarefa excluída!');
  };

  const handleDuplicateTask = (task: AutomatedTask) => {
    const duplicated = {
      ...task,
      id: Date.now().toString(),
      name: `${task.name} (Cópia)`,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [...prev, duplicated]);
    toast.success('Tarefa duplicada!');
  };

  const handleRunTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            lastRun: new Date(),
            runCount: task.runCount + 1,
            updatedAt: new Date()
          }
        : task
    ));
    toast.success('Tarefa executada manualmente!');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'triggered': return 'bg-green-100 text-green-800';
      case 'recurring': return 'bg-purple-100 text-purple-800';
      case 'conditional': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'scheduled': return 'Agendada';
      case 'triggered': return 'Por Evento';
      case 'recurring': return 'Recorrente';
      case 'conditional': return 'Condicional';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'draft': return 'Rascunho';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'time': return <Clock className="h-4 w-4" />;
      case 'event': return <Zap className="h-4 w-4" />;
      case 'condition': return <AlertTriangle className="h-4 w-4" />;
      case 'webhook': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'active').length,
    paused: tasks.filter(t => t.status === 'paused').length,
    draft: tasks.filter(t => t.status === 'draft').length,
    error: tasks.filter(t => t.status === 'error').length,
    totalRuns: tasks.reduce((sum, t) => sum + t.runCount, 0),
    totalSuccess: tasks.reduce((sum, t) => sum + t.successCount, 0),
    totalErrors: tasks.reduce((sum, t) => sum + t.errorCount, 0),
  };

  const formatNextRun = (nextRun?: Date) => {
    if (!nextRun) return 'Não agendado';
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `em ${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `em ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `em ${minutes} min`;
    } else {
      return 'Agora';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automação de Tarefas</h2>
          <p className="text-gray-600">Configure e gerencie tarefas automatizadas do sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => toast.info('Funcionalidade de importação em desenvolvimento')}>
            <Copy className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Execuções</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRuns.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRuns > 0 ? Math.round((stats.totalSuccess / stats.totalRuns) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <option value="all">Todos os Tipos</option>
            <option value="scheduled">Agendadas</option>
            <option value="triggered">Por Evento</option>
            <option value="recurring">Recorrentes</option>
            <option value="conditional">Condicionais</option>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="paused">Pausadas</option>
            <option value="draft">Rascunho</option>
            <option value="error">Erro</option>
          </Select>
        </div>
      </Card>

      {/* Lista de Tarefas */}
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
                onClick={() => setActiveTab('scheduled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Agendadas
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'monitoring'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Monitoramento
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{task.name}</h3>
                          <Badge className={getTypeColor(task.type)}>
                            {getTypeLabel(task.type)}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            {getTriggerIcon(task.trigger.type)}
                            <span className="capitalize">{task.trigger.type}</span>
                          </div>
                          <span>•</span>
                          <span>Execuções: {task.runCount}</span>
                          <span>•</span>
                          <span>Sucessos: {task.successCount}</span>
                          <span>•</span>
                          <span>Erros: {task.errorCount}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {task.lastRun && (
                            <span>Última execução: {task.lastRun.toLocaleDateString()}</span>
                          )}
                          {task.nextRun && (
                            <span>Próxima execução: {formatNextRun(task.nextRun)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunTask(task.id)}
                          disabled={task.status !== 'active'}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        
                        <Switch
                          checked={task.status === 'active'}
                          onCheckedChange={() => handleToggleTask(task.id)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskSelect?.(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateTask(task)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'scheduled' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Agendadas</h3>
                {filteredTasks.filter(t => t.type === 'scheduled' || t.type === 'recurring').map((task) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Próxima execução: {formatNextRun(task.nextRun)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunTask(task.id)}
                          disabled={task.status !== 'active'}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoramento de Execução</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Performance Geral</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Sucesso:</span>
                        <span className="font-medium">
                          {stats.totalRuns > 0 ? Math.round((stats.totalSuccess / stats.totalRuns) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total de Execuções:</span>
                        <span className="font-medium">{stats.totalRuns.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Erros:</span>
                        <span className="font-medium text-red-600">{stats.totalErrors}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Status das Tarefas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ativas:</span>
                        <span className="font-medium text-green-600">{stats.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pausadas:</span>
                        <span className="font-medium text-yellow-600">{stats.paused}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rascunho:</span>
                        <span className="font-medium text-gray-600">{stats.draft}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Com Erro:</span>
                        <span className="font-medium text-red-600">{stats.error}</span>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Log de Execuções Recentes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      Sistema de logs em desenvolvimento. Em breve você poderá visualizar o histórico completo de execuções.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
