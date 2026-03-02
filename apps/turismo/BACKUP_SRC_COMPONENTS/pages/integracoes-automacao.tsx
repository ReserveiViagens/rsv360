'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import {
  Zap,
  Settings,
  Play,
  Pause,
  Clock,
  GitBranch,
  Filter,
  Send,
  MessageSquare,
  Mail,
  Bell,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  Copy,
  ArrowRight,
  ArrowDown,
  Calendar,
  User,
  CreditCard,
  FileText,
  Target,
  Globe,
  Smartphone,
  Code,
  Workflow,
  Bot,
  Cpu,
  Network,
  Info
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  trigger: {
    type: 'event' | 'schedule' | 'condition';
    event?: string;
    schedule?: string;
    condition?: Record<string, any>;
  };
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
    logical_operator?: 'AND' | 'OR';
  }>;
  actions: Array<{
    type: string;
    service: string;
    config: Record<string, any>;
    delay?: number;
  }>;
  execution_count: number;
  success_count: number;
  failure_count: number;
  last_executed: string;
  last_success: string;
  created_at: string;
  updated_at: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'booking' | 'customer' | 'payment' | 'marketing' | 'support';
  popularity: number;
  trigger: any;
  conditions: any[];
  actions: any[];
  estimated_time_saved: string;
}

interface AutomationExecution {
  id: string;
  rule_id: string;
  status: 'success' | 'failed' | 'running' | 'cancelled';
  trigger_data: Record<string, any>;
  actions_executed: number;
  total_actions: number;
  execution_time: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'welcome_email',
    name: 'Email de Boas-vindas',
    description: 'Enviar email automático para novos clientes cadastrados',
    category: 'customer',
    popularity: 95,
    trigger: { type: 'event', event: 'customer.created' },
    conditions: [],
    actions: [
      { type: 'send_email', service: 'sendgrid', config: { template: 'welcome' } }
    ],
    estimated_time_saved: '2h/semana'
  },
  {
    id: 'booking_confirmation',
    name: 'Confirmação de Reserva',
    description: 'Enviar SMS e email quando uma reserva for confirmada',
    category: 'booking',
    popularity: 92,
    trigger: { type: 'event', event: 'booking.confirmed' },
    conditions: [],
    actions: [
      { type: 'send_email', service: 'sendgrid', config: { template: 'booking_confirmation' } },
      { type: 'send_sms', service: 'twilio', config: { message: 'Sua reserva foi confirmada!' }, delay: 300 }
    ],
    estimated_time_saved: '5h/semana'
  },
  {
    id: 'payment_reminder',
    name: 'Lembrete de Pagamento',
    description: 'Lembrar clientes sobre pagamentos pendentes',
    category: 'payment',
    popularity: 88,
    trigger: { type: 'schedule', schedule: 'daily' },
    conditions: [
      { field: 'payment.status', operator: 'equals', value: 'pending' },
      { field: 'payment.due_date', operator: 'less_than', value: '3_days' }
    ],
    actions: [
      { type: 'send_email', service: 'sendgrid', config: { template: 'payment_reminder' } }
    ],
    estimated_time_saved: '3h/semana'
  },
  {
    id: 'review_request',
    name: 'Solicitar Avaliação',
    description: 'Pedir avaliação após check-out do cliente',
    category: 'marketing',
    popularity: 85,
    trigger: { type: 'schedule', schedule: 'daily' },
    conditions: [
      { field: 'booking.status', operator: 'equals', value: 'completed' },
      { field: 'booking.checkout_date', operator: 'between', value: '1_day_ago' }
    ],
    actions: [
      { type: 'send_email', service: 'sendgrid', config: { template: 'review_request' } },
      { type: 'create_task', service: 'internal', config: { type: 'follow_up', assignee: 'auto' }, delay: 259200 }
    ],
    estimated_time_saved: '4h/semana'
  },
  {
    id: 'backup_daily',
    name: 'Backup Diário',
    description: 'Backup automático dos dados importantes',
    category: 'support',
    popularity: 78,
    trigger: { type: 'schedule', schedule: '0 2 * * *' },
    conditions: [],
    actions: [
      { type: 'backup_database', service: 'internal', config: { tables: 'all' } },
      { type: 'upload_to_cloud', service: 'cloudinary', config: { folder: 'backups' } },
      { type: 'send_notification', service: 'slack', config: { channel: 'admin' } }
    ],
    estimated_time_saved: '2h/dia'
  }
];

const MOCK_RULES: AutomationRule[] = [
  {
    id: '1',
    name: 'Email de Boas-vindas',
    description: 'Enviar email automático para novos clientes',
    status: 'active',
    trigger: {
      type: 'event',
      event: 'customer.created'
    },
    conditions: [],
    actions: [
      {
        type: 'send_email',
        service: 'sendgrid',
        config: {
          template: 'welcome_template',
          subject: 'Bem-vindo à Reservei Viagens!'
        }
      }
    ],
    execution_count: 47,
    success_count: 46,
    failure_count: 1,
    last_executed: '2025-01-08 14:30:00',
    last_success: '2025-01-08 14:30:00',
    created_at: '2024-01-15',
    updated_at: '2025-01-08'
  },
  {
    id: '2',
    name: 'Confirmação de Reserva',
    description: 'Notificações automáticas quando reserva é confirmada',
    status: 'active',
    trigger: {
      type: 'event',
      event: 'booking.confirmed'
    },
    conditions: [
      {
        field: 'booking.amount',
        operator: 'greater_than',
        value: 500
      }
    ],
    actions: [
      {
        type: 'send_email',
        service: 'sendgrid',
        config: {
          template: 'booking_confirmation',
          subject: 'Reserva Confirmada!'
        }
      },
      {
        type: 'send_sms',
        service: 'twilio',
        config: {
          message: 'Sua reserva foi confirmada! Detalhes por email.'
        },
        delay: 300
      }
    ],
    execution_count: 23,
    success_count: 22,
    failure_count: 1,
    last_executed: '2025-01-08 12:15:00',
    last_success: '2025-01-08 12:15:00',
    created_at: '2024-02-20',
    updated_at: '2025-01-08'
  },
  {
    id: '3',
    name: 'Backup Noturno',
    description: 'Backup automático dos dados às 2h da manhã',
    status: 'active',
    trigger: {
      type: 'schedule',
      schedule: '0 2 * * *'
    },
    conditions: [],
    actions: [
      {
        type: 'backup_database',
        service: 'internal',
        config: {
          tables: ['bookings', 'customers', 'payments']
        }
      },
      {
        type: 'send_notification',
        service: 'slack',
        config: {
          channel: '#admin',
          message: 'Backup diário concluído com sucesso'
        },
        delay: 60
      }
    ],
    execution_count: 45,
    success_count: 44,
    failure_count: 1,
    last_executed: '2025-01-08 02:00:00',
    last_success: '2025-01-08 02:00:00',
    created_at: '2024-01-20',
    updated_at: '2025-01-08'
  },
  {
    id: '4',
    name: 'Lembrete de Pagamento',
    description: 'Lembrar clientes sobre pagamentos vencendo',
    status: 'inactive',
    trigger: {
      type: 'schedule',
      schedule: 'daily'
    },
    conditions: [
      {
        field: 'payment.status',
        operator: 'equals',
        value: 'pending'
      },
      {
        field: 'payment.due_date',
        operator: 'less_than',
        value: '3_days',
        logical_operator: 'AND'
      }
    ],
    actions: [
      {
        type: 'send_email',
        service: 'sendgrid',
        config: {
          template: 'payment_reminder',
          subject: 'Lembrete: Pagamento Pendente'
        }
      }
    ],
    execution_count: 12,
    success_count: 10,
    failure_count: 2,
    last_executed: '2025-01-05 09:00:00',
    last_success: '2025-01-05 09:00:00',
    created_at: '2024-03-10',
    updated_at: '2025-01-05'
  }
];

const MOCK_EXECUTIONS: AutomationExecution[] = [
  {
    id: '1',
    rule_id: '1',
    status: 'success',
    trigger_data: {
      customer_id: 'cust_123',
      customer_name: 'João Silva',
      customer_email: 'joao@exemplo.com'
    },
    actions_executed: 1,
    total_actions: 1,
    execution_time: 2340,
    started_at: '2025-01-08 14:30:00',
    completed_at: '2025-01-08 14:30:02'
  },
  {
    id: '2',
    rule_id: '2',
    status: 'success',
    trigger_data: {
      booking_id: 'book_456',
      customer_name: 'Maria Santos',
      amount: 1500.00
    },
    actions_executed: 2,
    total_actions: 2,
    execution_time: 4560,
    started_at: '2025-01-08 12:15:00',
    completed_at: '2025-01-08 12:15:05'
  },
  {
    id: '3',
    rule_id: '3',
    status: 'success',
    trigger_data: {
      scheduled_time: '2025-01-08 02:00:00'
    },
    actions_executed: 2,
    total_actions: 2,
    execution_time: 125000,
    started_at: '2025-01-08 02:00:00',
    completed_at: '2025-01-08 02:02:05'
  },
  {
    id: '4',
    rule_id: '4',
    status: 'failed',
    trigger_data: {
      payments_found: 3
    },
    actions_executed: 0,
    total_actions: 1,
    execution_time: 1200,
    error_message: 'SendGrid API error: Invalid template ID',
    started_at: '2025-01-05 09:00:00'
  }
];

export default function IntegracoesAutomacao() {
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);
  const [templates] = useState<AutomationTemplate[]>(AUTOMATION_TEMPLATES);
  const [executions] = useState<AutomationExecution[]>(MOCK_EXECUTIONS);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredRules = rules.filter(rule => {
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'testing':
        return 'text-blue-600';
      case 'inactive':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      testing: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Ativo',
      testing: 'Testando',
      inactive: 'Inativo',
      error: 'Erro',
      success: 'Sucesso',
      failed: 'Falhou',
      running: 'Executando',
      cancelled: 'Cancelado'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking':
        return '📅';
      case 'customer':
        return '👤';
      case 'payment':
        return '💳';
      case 'marketing':
        return '📢';
      case 'support':
        return '🛠️';
      default:
        return '⚡';
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Zap className="h-4 w-4" />;
      case 'schedule':
        return <Clock className="h-4 w-4" />;
      case 'condition':
        return <Filter className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email':
        return <Mail className="h-4 w-4" />;
      case 'send_sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'send_notification':
        return <Bell className="h-4 w-4" />;
      case 'backup_database':
        return <Database className="h-4 w-4" />;
      case 'create_task':
        return <FileText className="h-4 w-4" />;
      case 'upload_to_cloud':
        return <Globe className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? {
            ...rule,
            status: rule.status === 'active' ? 'inactive' : 'active'
          }
        : rule
    ));
  };

  const handleCreateFromTemplate = (template: AutomationTemplate) => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      status: 'inactive',
      trigger: template.trigger,
      conditions: template.conditions,
      actions: template.actions,
      execution_count: 0,
      success_count: 0,
      failure_count: 0,
      last_executed: '',
      last_success: '',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    setRules(prev => [...prev, newRule]);
    alert('Regra de automação criada com sucesso!');
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Tem certeza que deseja deletar esta regra de automação?')) {
      setRules(prev => prev.filter(r => r.id !== ruleId));
      if (selectedRule?.id === ruleId) {
        setSelectedRule(null);
      }
    }
  };

  const testRule = async (rule: AutomationRule) => {
    alert(`Testando regra: ${rule.name}...`);
    // Implementar lógica de teste
  };

  const getTotalExecutions = () => {
    return rules.reduce((total, rule) => total + rule.execution_count, 0);
  };

  const getTotalSuccessRate = () => {
    const totalExecutions = getTotalExecutions();
    const totalSuccesses = rules.reduce((total, rule) => total + rule.success_count, 0);
    return totalExecutions > 0 ? Math.round((totalSuccesses / totalExecutions) * 100) : 0;
  };

  const getTimeSaved = () => {
    return rules.filter(r => r.status === 'active').length * 2; // Mock: 2h por regra ativa
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🤖 Automação RSV 360
            </h1>
            <p className="text-gray-600">
              Configure automações inteligentes para otimizar processos
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button
              onClick={() => setActiveTab('templates')}
              variant="outline"
            >
              <Bot className="h-4 w-4 mr-2" />
              Ver Templates
            </Button>
            <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Automação
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Regras Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rules.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Execuções Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalExecutions()}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalSuccessRate()}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tempo Economizado</p>
                  <p className="text-2xl font-bold text-gray-900">{getTimeSaved()}h/sem</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Workflow className="h-4 w-4 mr-2" />
              Minhas Regras
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Bot className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="executions">
              <Cpu className="h-4 w-4 mr-2" />
              Execuções
            </TabsTrigger>
            <TabsTrigger value="builder">
              <Code className="h-4 w-4 mr-2" />
              Construtor
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status das Regras */}
              <Card>
                <CardHeader>
                  <CardTitle>Status das Regras</CardTitle>
                  <CardDescription>Resumo do status de todas as regras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getTriggerIcon(rule.trigger.type)}
                            <span className="text-sm text-gray-600">
                              {rule.trigger.type === 'event' ? rule.trigger.event :
                               rule.trigger.type === 'schedule' ? rule.trigger.schedule : 'Condição'}
                            </span>
                            {getStatusBadge(rule.status)}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {rule.execution_count} execuções
                          </p>
                          <p className={`text-xs ${getStatusColor(rule.status)}`}>
                            {rule.success_count}/{rule.execution_count} sucessos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Execuções Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Execuções Recentes</CardTitle>
                  <CardDescription>Últimas automações executadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {executions.slice(0, 5).map(execution => {
                      const rule = rules.find(r => r.id === execution.rule_id);
                      return (
                        <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <h4 className="font-medium">{rule?.name}</h4>
                            <p className="text-sm text-gray-600">{execution.started_at}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusBadge(execution.status)}
                            <span className="text-xs text-gray-600">
                              {execution.execution_time}ms
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Minhas Regras */}
          <TabsContent value="rules">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Regras */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle>Regras de Automação</CardTitle>

                      <div className="flex gap-2">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                            <SelectItem value="error">Erro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredRules.map(rule => (
                        <div
                          key={rule.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedRule?.id === rule.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedRule(rule)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                              <p className="text-sm text-gray-600">{rule.description}</p>

                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1">
                                  {getTriggerIcon(rule.trigger.type)}
                                  <span className="text-xs text-gray-500">Trigger</span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <Filter className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {rule.conditions.length} condições
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {rule.actions.length} ações
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 mt-2">
                                {getStatusBadge(rule.status)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testRule(rule);
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRuleStatus(rule.id);
                                }}
                              >
                                {rule.status === 'active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRule(rule.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Execuções:</span> {rule.execution_count}
                            </div>
                            <div>
                              <span className="font-medium">Sucessos:</span> {rule.success_count}
                            </div>
                            <div>
                              <span className="font-medium">Última:</span> {rule.last_executed || 'Nunca'}
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredRules.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nenhuma regra encontrada com os filtros aplicados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes da Regra */}
              <div className="lg:col-span-1">
                {selectedRule ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes da Regra</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2">Trigger</h5>
                        <div className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {getTriggerIcon(selectedRule.trigger.type)}
                            <span className="text-sm font-medium capitalize">
                              {selectedRule.trigger.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {selectedRule.trigger.event || selectedRule.trigger.schedule || 'Condição personalizada'}
                          </p>
                        </div>
                      </div>

                      {selectedRule.conditions.length > 0 && (
                        <div>
                          <h5 className="font-semibold mb-2">Condições ({selectedRule.conditions.length})</h5>
                          <div className="space-y-2">
                            {selectedRule.conditions.map((condition, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                                <span className="font-medium">{condition.field}</span> {condition.operator} {condition.value}
                                {condition.logical_operator && (
                                  <span className="text-blue-600 ml-2">{condition.logical_operator}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-semibold mb-2">Ações ({selectedRule.actions.length})</h5>
                        <div className="space-y-2">
                          {selectedRule.actions.map((action, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                {getActionIcon(action.type)}
                                <span className="text-sm font-medium">{action.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {action.service}
                                </Badge>
                              </div>
                              {action.delay && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Delay: {action.delay}s
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-2">Estatísticas</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total de Execuções:</span>
                            <span className="font-medium">{selectedRule.execution_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sucessos:</span>
                            <span className="font-medium text-green-600">{selectedRule.success_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Falhas:</span>
                            <span className="font-medium text-red-600">{selectedRule.failure_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de Sucesso:</span>
                            <span className="font-medium">
                              {selectedRule.execution_count > 0
                                ? Math.round((selectedRule.success_count / selectedRule.execution_count) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Selecione uma regra para ver os detalhes
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Automação</CardTitle>
                <CardDescription>
                  Templates pré-configurados para automatizar processos comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium">{template.popularity}%</span>
                              <span className="text-xs text-gray-500">popular</span>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-sm mb-2">Economiza:</h5>
                            <Badge variant="outline" className="text-green-600">
                              {template.estimated_time_saved}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              {getTriggerIcon(template.trigger.type)}
                              <span>1 trigger</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Filter className="h-3 w-3" />
                              <span>{template.conditions.length} condições</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ArrowRight className="h-3 w-3" />
                              <span>{template.actions.length} ações</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleCreateFromTemplate(template)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Usar Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execuções */}
          <TabsContent value="executions">
            <Card>
              <CardHeader>
                <CardTitle>Log de Execuções</CardTitle>
                <CardDescription>Histórico detalhado de todas as execuções</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.map(execution => {
                    const rule = rules.find(r => r.id === execution.rule_id);
                    return (
                      <div key={execution.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{rule?.name}</h4>
                            {getStatusBadge(execution.status)}
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{execution.execution_time}ms</span>
                            <span>{execution.actions_executed}/{execution.total_actions} ações</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium mb-1">Dados do Trigger:</h5>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(execution.trigger_data, null, 2)}
                            </pre>
                          </div>

                          {execution.error_message && (
                            <div>
                              <h5 className="font-medium mb-1 text-red-600">Erro:</h5>
                              <div className="bg-red-50 p-2 rounded text-xs text-red-800">
                                {execution.error_message}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                          <span>Iniciado: {execution.started_at}</span>
                          {execution.completed_at && (
                            <span>Concluído: {execution.completed_at}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {executions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>Nenhuma execução registrada ainda.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Construtor */}
          <TabsContent value="builder">
            <Card>
              <CardHeader>
                <CardTitle>Construtor de Automação</CardTitle>
                <CardDescription>
                  Crie regras personalizadas de automação visualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Construtor Visual
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Interface drag-and-drop para criar automações personalizadas
                    </p>
                    <Button>
                      <Code className="h-4 w-4 mr-2" />
                      Abrir Construtor
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Funcionalidades do Construtor:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded">
                        <h5 className="font-medium mb-2">🎯 Triggers Visuais</h5>
                        <p className="text-sm text-gray-600">
                          Configure triggers de eventos, agendamentos e condições com interface visual
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded">
                        <h5 className="font-medium mb-2">🔀 Fluxos Condicionais</h5>
                        <p className="text-sm text-gray-600">
                          Crie lógicas complexas com condições IF/ELSE, loops e branches
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded">
                        <h5 className="font-medium mb-2">⚡ Ações Integradas</h5>
                        <p className="text-sm text-gray-600">
                          Conecte com todos os serviços configurados com drag-and-drop
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded">
                        <h5 className="font-medium mb-2">🧪 Teste em Tempo Real</h5>
                        <p className="text-sm text-gray-600">
                          Execute e teste suas automações diretamente no construtor
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rodapé com informações */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <div className="text-blue-800">
                <p className="font-medium">Automação Inteligente:</p>
                <p className="text-sm">
                  Configure automações para otimizar processos repetitivos e melhorar a eficiência operacional.
                  Use templates prontos ou crie regras personalizadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
