'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { 
  Zap,
  Bot,
  Activity,
  Play,
  Pause,
  Square,
  Settings,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  Database,
  Network,
  Cpu,
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Workflow,
  GitBranch,
  Timer,
  Bell,
  Mail,
  MessageSquare,
  FileText,
  Code,
  Layers,
  Users,
  Building
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Cell } from 'recharts'

// Tipos para automação inteligente
interface AutomationRule {
  id: string
  name: string
  description: string
  category: 'workflow' | 'notification' | 'data_processing' | 'monitoring' | 'decision_making'
  trigger: {
    type: 'time' | 'event' | 'condition' | 'pattern' | 'threshold'
    condition: string
    parameters: Record<string, any>
  }
  actions: {
    type: 'notification' | 'api_call' | 'data_update' | 'workflow_trigger' | 'ai_analysis'
    target: string
    parameters: Record<string, any>
  }[]
  status: 'active' | 'paused' | 'error' | 'testing'
  executionCount: number
  successRate: number
  lastExecuted?: string
  aiLearning: boolean
  complexity: 'simple' | 'medium' | 'complex'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface AutomationExecution {
  id: string
  ruleId: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  result?: any
  error?: string
  duration?: number
  triggeredBy: string
  actionsExecuted: number
  resourcesUsed: {
    cpu: number
    memory: number
    apiCalls: number
  }
}

interface PatternDetection {
  id: string
  pattern: string
  description: string
  confidence: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular'
  lastDetected: string
  suggestedAction: string
  automationPotential: number
  impact: 'low' | 'medium' | 'high'
  dataSource: string
}

interface SmartSuggestion {
  id: string
  type: 'new_rule' | 'optimize_rule' | 'merge_rules' | 'disable_rule'
  title: string
  description: string
  confidence: number
  potentialSavings: {
    time: number // minutos por execução
    cost: number // valor em reais
    errors: number // percentual de redução de erros
  }
  complexity: 'low' | 'medium' | 'high'
  priority: number // 1-10
  relatedRules: string[]
}

const SmartAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [runningExecutions, setRunningExecutions] = useState<string[]>([])

  // Dados mock para demonstração
  const [automationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-backup Diário',
      description: 'Backup automático de dados críticos todos os dias às 2h da manhã',
      category: 'data_processing',
      trigger: {
        type: 'time',
        condition: 'daily_at_2am',
        parameters: { hour: 2, minute: 0, timezone: 'America/Sao_Paulo' }
      },
      actions: [
        {
          type: 'data_update',
          target: 'backup_service',
          parameters: { tables: ['users', 'transactions', 'projects'], compress: true }
        },
        {
          type: 'notification',
          target: 'admin_team',
          parameters: { channel: 'email', template: 'backup_complete' }
        }
      ],
      status: 'active',
      executionCount: 45,
      successRate: 97.8,
      lastExecuted: '2025-01-15T02:00:00Z',
      aiLearning: false,
      complexity: 'simple',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Detecção de Anomalias Inteligente',
      description: 'Monitora padrões anômalos em transações e dispara alertas automáticos',
      category: 'monitoring',
      trigger: {
        type: 'pattern',
        condition: 'anomaly_detected',
        parameters: { threshold: 2.5, window: '1h', confidence: 95 }
      },
      actions: [
        {
          type: 'ai_analysis',
          target: 'anomaly_analyzer',
          parameters: { deep_analysis: true, context_window: '24h' }
        },
        {
          type: 'notification',
          target: 'security_team',
          parameters: { channel: 'slack', urgency: 'high' }
        }
      ],
      status: 'active',
      executionCount: 12,
      successRate: 91.7,
      lastExecuted: '2025-01-15T14:30:00Z',
      aiLearning: true,
      complexity: 'complex',
      priority: 'critical'
    },
    {
      id: '3',
      name: 'Otimização de Recursos',
      description: 'Ajusta automaticamente alocação de recursos baseado na demanda',
      category: 'decision_making',
      trigger: {
        type: 'condition',
        condition: 'resource_utilization > 80%',
        parameters: { metric: 'cpu_usage', duration: '15m' }
      },
      actions: [
        {
          type: 'api_call',
          target: 'resource_manager',
          parameters: { action: 'scale_up', factor: 1.5 }
        }
      ],
      status: 'active',
      executionCount: 28,
      successRate: 89.3,
      lastExecuted: '2025-01-15T13:15:00Z',
      aiLearning: true,
      complexity: 'medium',
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Workflow de Aprovação Inteligente',
      description: 'Roteamento automático de aprovações baseado em valor e contexto',
      category: 'workflow',
      trigger: {
        type: 'event',
        condition: 'approval_request_created',
        parameters: { source: 'expense_system' }
      },
      actions: [
        {
          type: 'ai_analysis',
          target: 'approval_classifier',
          parameters: { classify_urgency: true, suggest_approver: true }
        },
        {
          type: 'workflow_trigger',
          target: 'approval_workflow',
          parameters: { auto_route: true }
        }
      ],
      status: 'testing',
      executionCount: 156,
      successRate: 94.2,
      lastExecuted: '2025-01-15T15:45:00Z',
      aiLearning: true,
      complexity: 'complex',
      priority: 'medium'
    },
    {
      id: '5',
      name: 'Limpeza Automática de Dados',
      description: 'Remove dados temporários e otimiza performance do banco',
      category: 'data_processing',
      trigger: {
        type: 'time',
        condition: 'weekly_sunday_3am',
        parameters: { day: 'sunday', hour: 3, minute: 0 }
      },
      actions: [
        {
          type: 'data_update',
          target: 'database_cleaner',
          parameters: { clean_temp_data: true, optimize_indexes: true }
        }
      ],
      status: 'paused',
      executionCount: 8,
      successRate: 100,
      lastExecuted: '2025-01-12T03:00:00Z',
      aiLearning: false,
      complexity: 'simple',
      priority: 'low'
    }
  ])

  const [executions] = useState<AutomationExecution[]>([
    {
      id: '1',
      ruleId: '1',
      startTime: '2025-01-15T02:00:00Z',
      endTime: '2025-01-15T02:05:32Z',
      status: 'completed',
      result: { files_backed_up: 1247, size_mb: 2843 },
      duration: 332,
      triggeredBy: 'scheduler',
      actionsExecuted: 2,
      resourcesUsed: { cpu: 15, memory: 256, apiCalls: 3 }
    },
    {
      id: '2',
      ruleId: '2',
      startTime: '2025-01-15T14:30:15Z',
      endTime: '2025-01-15T14:32:48Z',
      status: 'completed',
      result: { anomalies_found: 3, risk_level: 'medium' },
      duration: 153,
      triggeredBy: 'pattern_detector',
      actionsExecuted: 2,
      resourcesUsed: { cpu: 45, memory: 512, apiCalls: 8 }
    },
    {
      id: '3',
      ruleId: '3',
      startTime: '2025-01-15T13:15:00Z',
      status: 'running',
      triggeredBy: 'threshold_monitor',
      actionsExecuted: 0,
      resourcesUsed: { cpu: 25, memory: 128, apiCalls: 1 }
    },
    {
      id: '4',
      ruleId: '4',
      startTime: '2025-01-15T15:30:00Z',
      endTime: '2025-01-15T15:31:15Z',
      status: 'failed',
      error: 'API timeout: approval_service not responding',
      duration: 75,
      triggeredBy: 'expense_system',
      actionsExecuted: 1,
      resourcesUsed: { cpu: 10, memory: 64, apiCalls: 5 }
    }
  ])

  const [patterns] = useState<PatternDetection[]>([
    {
      id: '1',
      pattern: 'High CPU usage every Monday 9-11 AM',
      description: 'Pico consistente de uso de CPU nas manhãs de segunda-feira',
      confidence: 94.2,
      frequency: 'weekly',
      lastDetected: '2025-01-13T09:30:00Z',
      suggestedAction: 'Pré-alocar recursos extras nas manhãs de segunda',
      automationPotential: 85,
      impact: 'medium',
      dataSource: 'system_metrics'
    },
    {
      id: '2',
      pattern: 'Approval requests spike before month-end',
      description: 'Aumento de 340% em solicitações de aprovação nos últimos 3 dias do mês',
      confidence: 87.6,
      frequency: 'monthly',
      lastDetected: '2025-01-12T16:45:00Z',
      suggestedAction: 'Configurar workflow acelerado para final do mês',
      automationPotential: 92,
      impact: 'high',
      dataSource: 'workflow_system'
    },
    {
      id: '3',
      pattern: 'Database cleanup improves query performance by 23%',
      description: 'Limpeza semanal consistentemente melhora performance de consultas',
      confidence: 96.1,
      frequency: 'weekly',
      lastDetected: '2025-01-12T03:30:00Z',
      suggestedAction: 'Aumentar frequência de limpeza para 2x por semana',
      automationPotential: 78,
      impact: 'medium',
      dataSource: 'database_metrics'
    }
  ])

  const [suggestions] = useState<SmartSuggestion[]>([
    {
      id: '1',
      type: 'new_rule',
      title: 'Auto-escalar recursos nas manhãs de segunda',
      description: 'Criar regra para aumentar recursos automaticamente baseado no padrão detectado',
      confidence: 89.3,
      potentialSavings: { time: 45, cost: 120, errors: 25 },
      complexity: 'medium',
      priority: 8,
      relatedRules: ['3']
    },
    {
      id: '2',
      type: 'optimize_rule',
      title: 'Otimizar workflow de aprovação',
      description: 'Adicionar classificação por urgência para reduzir tempo de processamento',
      confidence: 92.7,
      potentialSavings: { time: 180, cost: 300, errors: 15 },
      complexity: 'high',
      priority: 9,
      relatedRules: ['4']
    },
    {
      id: '3',
      type: 'merge_rules',
      title: 'Consolidar regras de backup',
      description: 'Unificar backup de dados e limpeza em um único processo otimizado',
      confidence: 76.4,
      potentialSavings: { time: 90, cost: 50, errors: 10 },
      complexity: 'low',
      priority: 6,
      relatedRules: ['1', '5']
    }
  ])

  // Dados para gráficos
  const executionStatsData = [
    { day: 'Seg', execucoes: 45, sucessos: 42, falhas: 3, tempo_medio: 145 },
    { day: 'Ter', execucoes: 38, sucessos: 36, falhas: 2, tempo_medio: 132 },
    { day: 'Qua', execucoes: 52, sucessos: 49, falhas: 3, tempo_medio: 158 },
    { day: 'Qui', execucoes: 41, sucessos: 39, falhas: 2, tempo_medio: 140 },
    { day: 'Sex', execucoes: 35, sucessos: 34, falhas: 1, tempo_medio: 125 },
    { day: 'Sab', execucoes: 28, sucessos: 27, falhas: 1, tempo_medio: 110 },
    { day: 'Dom', execucoes: 22, sucessos: 22, falhas: 0, tempo_medio: 95 }
  ]

  const categoryDistributionData = [
    { name: 'Workflow', value: 32, color: '#3b82f6' },
    { name: 'Monitoring', value: 24, color: '#10b981' },
    { name: 'Data Processing', value: 28, color: '#f59e0b' },
    { name: 'Notifications', value: 16, color: '#8b5cf6' }
  ]

  const efficiencyTrendData = [
    { month: 'Set', manual_hours: 240, automated_hours: 180, savings: 60 },
    { month: 'Out', manual_hours: 280, automated_hours: 160, savings: 120 },
    { month: 'Nov', manual_hours: 320, automated_hours: 140, savings: 180 },
    { month: 'Dez', manual_hours: 300, automated_hours: 120, savings: 180 },
    { month: 'Jan', manual_hours: 350, automated_hours: 100, savings: 250 }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'testing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'paused': return Pause
      case 'error': return AlertTriangle
      case 'testing': return Settings
      case 'completed': return CheckCircle
      case 'running': return RefreshCw
      case 'failed': return AlertTriangle
      case 'cancelled': return Square
      default: return Clock
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow': return Workflow
      case 'notification': return Bell
      case 'data_processing': return Database
      case 'monitoring': return Activity
      case 'decision_making': return Target
      default: return Bot
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'complex': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleExecuteRule = (ruleId: string) => {
    setRunningExecutions(prev => [...prev, ruleId])
    // Simular execução
    setTimeout(() => {
      setRunningExecutions(prev => prev.filter(id => id !== ruleId))
    }, 3000)
  }

  const RuleForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rule-name">Nome da Regra</Label>
          <Input 
            id="rule-name"
            placeholder="Ex: Auto-backup Noturno"
            title="Nome da regra de automação"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-category">Categoria</Label>
          <Select>
            <SelectTrigger title="Selecionar categoria">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workflow">Workflow</SelectItem>
              <SelectItem value="notification">Notificação</SelectItem>
              <SelectItem value="data_processing">Processamento de Dados</SelectItem>
              <SelectItem value="monitoring">Monitoramento</SelectItem>
              <SelectItem value="decision_making">Tomada de Decisão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rule-description">Descrição</Label>
        <Textarea 
          id="rule-description"
          placeholder="Descreva o que esta regra faz e quando é executada"
          title="Descrição detalhada da regra"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trigger-type">Tipo de Gatilho</Label>
          <Select>
            <SelectTrigger title="Selecionar tipo de gatilho">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Tempo/Cronograma</SelectItem>
              <SelectItem value="event">Evento do Sistema</SelectItem>
              <SelectItem value="condition">Condição/Threshold</SelectItem>
              <SelectItem value="pattern">Padrão Detectado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select>
            <SelectTrigger title="Selecionar prioridade">
              <SelectValue placeholder="Selecionar prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trigger-condition">Condição do Gatilho</Label>
        <Input 
          id="trigger-condition"
          placeholder="Ex: daily_at_2am ou cpu_usage > 80%"
          title="Condição que dispara a regra"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actions">Ações (uma por linha)</Label>
        <Textarea 
          id="actions"
          placeholder="notification:admin_team&#10;backup:database&#10;api_call:scaling_service"
          title="Lista de ações a serem executadas"
        />
      </div>

      <div className="space-y-4">
        <Label>Configurações Avançadas</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="ai-learning"
              className="rounded border-gray-300"
              title="Permitir que IA aprenda e otimize esta regra"
            />
            <Label htmlFor="ai-learning">Aprendizado de máquina habilitado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="auto-retry"
              defaultChecked
              className="rounded border-gray-300"
              title="Tentar novamente automaticamente em caso de falha"
            />
            <Label htmlFor="auto-retry">Retry automático em falhas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="detailed-logging"
              defaultChecked
              className="rounded border-gray-300"
              title="Log detalhado de execuções"
            />
            <Label htmlFor="detailed-logging">Log detalhado</Label>
          </div>
        </div>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automação Inteligente</h1>
          <p className="text-gray-600">Sistema de automação baseado em IA e padrões</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Regra de Automação</DialogTitle>
                <DialogDescription>
                  Configure uma nova regra de automação inteligente
                </DialogDescription>
              </DialogHeader>
              <RuleForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsRuleModalOpen(false)}>
                  Criar Regra
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs da Automação */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
                <Bot className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {automationRules.filter(r => r.status === 'active').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {automationRules.length} regras
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(automationRules.reduce((sum, r) => sum + r.successRate, 0) / automationRules.length).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">
                  Média geral
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {executions.length}
                </div>
                <p className="text-xs text-gray-600">
                  {executions.filter(e => e.status === 'completed').length} concluídas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
                <Timer className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  4.2h
                </div>
                <p className="text-xs text-gray-600">
                  Hoje
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas de Execução */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Execução</CardTitle>
              <CardDescription>Performance das automações por dia da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={executionStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sucessos" fill="#10b981" name="Sucessos" />
                  <Bar dataKey="falhas" fill="#ef4444" name="Falhas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Tipos de automação mais utilizados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Eficiência ao Longo do Tempo */}
            <Card>
              <CardHeader>
                <CardTitle>Ganhos de Eficiência</CardTitle>
                <CardDescription>Redução de trabalho manual ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={efficiencyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}h`} />
                    <Area type="monotone" dataKey="manual_hours" stackId="1" fill="#ef4444" name="Manual" />
                    <Area type="monotone" dataKey="automated_hours" stackId="1" fill="#10b981" name="Automatizado" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Execuções em Tempo Real */}
          <Card>
            <CardHeader>
              <CardTitle>Execuções em Tempo Real</CardTitle>
              <CardDescription>Atividade atual das automações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.slice(0, 5).map((execution) => {
                  const rule = automationRules.find(r => r.id === execution.ruleId)
                  const StatusIcon = getStatusIcon(execution.status)
                  const isRunning = execution.status === 'running'

                  return (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-4 w-4 ${isRunning ? 'animate-spin text-blue-600' : 
                          execution.status === 'completed' ? 'text-green-600' : 
                          execution.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-medium">{rule?.name}</p>
                          <p className="text-sm text-gray-600">
                            Iniciado: {formatDateTime(execution.startTime)} • Por: {execution.triggeredBy}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        {execution.duration && (
                          <p className="text-sm text-gray-600 mt-1">
                            {execution.duration}s
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48" title="Filtrar por categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="notification">Notificação</SelectItem>
                    <SelectItem value="data_processing">Processamento de Dados</SelectItem>
                    <SelectItem value="monitoring">Monitoramento</SelectItem>
                    <SelectItem value="decision_making">Tomada de Decisão</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Regras */}
          <div className="grid gap-6">
            {automationRules
              .filter(rule => filterCategory === 'all' || rule.category === filterCategory)
              .map((rule) => {
                const StatusIcon = getStatusIcon(rule.status)
                const CategoryIcon = getCategoryIcon(rule.category)
                const isRunning = runningExecutions.includes(rule.id)

                return (
                  <Card key={rule.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(rule.status).split(' ')[1]}`}>
                            <CategoryIcon className={`h-6 w-6 ${getStatusColor(rule.status).split(' ')[0]}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl">{rule.name}</h3>
                            <p className="text-gray-600">{rule.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500 capitalize">
                                {rule.category.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                Gatilho: {rule.trigger.type}
                              </span>
                              <span className="text-sm text-gray-500">
                                {rule.executionCount} execuções
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(rule.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {rule.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(rule.priority)}>
                            {rule.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                          <p className="text-lg font-bold text-green-600">{rule.successRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Complexidade</p>
                          <p className={`text-lg font-bold ${getComplexityColor(rule.complexity)}`}>
                            {rule.complexity}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Ações</p>
                          <p className="text-lg font-bold text-blue-600">{rule.actions.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">IA Learning</p>
                          <p className={`text-lg font-bold ${rule.aiLearning ? 'text-purple-600' : 'text-gray-400'}`}>
                            {rule.aiLearning ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Condição do Gatilho:</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {rule.trigger.condition}
                          </code>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Ações Configuradas:</p>
                          <div className="flex flex-wrap gap-2">
                            {rule.actions.map((action, index) => (
                              <Badge key={index} variant="outline">
                                {action.type}: {action.target}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-sm text-gray-500">
                            {rule.lastExecuted ? `Última execução: ${formatDateTime(rule.lastExecuted)}` : 'Nunca executado'}
                          </div>
                          <div className="flex space-x-2">
                            {rule.status === 'active' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleExecuteRule(rule.id)}
                                  disabled={isRunning}
                                >
                                  {isRunning ? (
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Play className="h-3 w-3 mr-1" />
                                  )}
                                  {isRunning ? 'Executando...' : 'Executar'}
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pausar
                                </Button>
                              </>
                            )}
                            {rule.status === 'paused' && (
                              <Button size="sm">
                                <Play className="h-3 w-3 mr-1" />
                                Reativar
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Configurar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          {/* Histórico de Execuções */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
              <CardDescription>Todas as execuções das regras de automação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => {
                  const rule = automationRules.find(r => r.id === execution.ruleId)
                  const StatusIcon = getStatusIcon(execution.status)

                  return (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <StatusIcon className={`h-4 w-4 ${
                          execution.status === 'running' ? 'animate-spin text-blue-600' :
                          execution.status === 'completed' ? 'text-green-600' :
                          execution.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-medium">{rule?.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(execution.startTime)} • Disparado por: {execution.triggeredBy}
                          </p>
                          {execution.error && (
                            <p className="text-sm text-red-600 mt-1">{execution.error}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {execution.duration ? `${execution.duration}s` : 'Em execução'}
                        </div>
                        <div className="text-xs text-gray-500">
                          CPU: {execution.resourcesUsed.cpu}% • RAM: {execution.resourcesUsed.memory}MB
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Log
                        </Button>
                        {execution.result && (
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Resultado
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          {/* Padrões Detectados */}
          <Card>
            <CardHeader>
              <CardTitle>Padrões Detectados pela IA</CardTitle>
              <CardDescription>Padrões identificados automaticamente nos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{pattern.pattern}</h4>
                        <p className="text-gray-600 mt-1">{pattern.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {pattern.confidence}% confiança
                        </Badge>
                        <Badge variant="outline" className={
                          pattern.impact === 'high' ? 'border-red-300 text-red-700' :
                          pattern.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }>
                          {pattern.impact} impacto
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Frequência</p>
                        <p className="text-lg font-bold capitalize">{pattern.frequency}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Último Detectado</p>
                        <p className="text-sm font-medium">{formatDateTime(pattern.lastDetected)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Potencial de Automação</p>
                        <div className="flex items-center justify-center space-x-2">
                          <Progress value={pattern.automationPotential} className="w-16 h-2" />
                          <span className="text-sm font-bold">{pattern.automationPotential}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Fonte</p>
                        <p className="text-sm font-medium">{pattern.dataSource}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Ação Sugerida:</p>
                        <p className="text-sm text-blue-700">{pattern.suggestedAction}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Detectado em: {pattern.dataSource}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Zap className="h-3 w-3 mr-1" />
                            Criar Automação
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Analisar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          {/* Sugestões da IA */}
          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Otimização</CardTitle>
              <CardDescription>Recomendações baseadas em IA para melhorar automações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                        <p className="text-gray-600 mt-1">{suggestion.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {suggestion.confidence}% confiança
                        </Badge>
                        <Badge variant="outline" className={
                          suggestion.priority >= 8 ? 'border-red-300 text-red-700' :
                          suggestion.priority >= 6 ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }>
                          Prioridade {suggestion.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Economia de Tempo</p>
                        <p className="text-lg font-bold text-green-600">{suggestion.potentialSavings.time} min</p>
                        <p className="text-xs text-gray-500">por execução</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Economia de Custo</p>
                        <p className="text-lg font-bold text-blue-600">R$ {suggestion.potentialSavings.cost}</p>
                        <p className="text-xs text-gray-500">por mês</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Redução de Erros</p>
                        <p className="text-lg font-bold text-purple-600">{suggestion.potentialSavings.errors}%</p>
                        <p className="text-xs text-gray-500">menos erros</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Regras Relacionadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.relatedRules.map((ruleId, index) => {
                            const rule = automationRules.find(r => r.id === ruleId)
                            return (
                              <Badge key={index} variant="outline">
                                {rule?.name || ruleId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Complexidade: <span className={`font-medium ${getComplexityColor(suggestion.complexity)}`}>
                              {suggestion.complexity}
                            </span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Tipo: <span className="font-medium">
                              {suggestion.type.replace('_', ' ')}
                            </span>
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Implementar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Simular
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Descartar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Avançados */}
          <Card>
            <CardHeader>
              <CardTitle>Tempo Médio de Execução</CardTitle>
              <CardDescription>Performance das execuções ao longo da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={executionStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}s`} />
                  <Line type="monotone" dataKey="tempo_medio" stroke="#3b82f6" strokeWidth={3} name="Tempo Médio" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI da Automação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tempo economizado (mensal)</span>
                    <span className="font-bold text-green-600">120h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Custo evitado (mensal)</span>
                    <span className="font-bold text-green-600">R$ 12.800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Redução de erros</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ROI total</span>
                    <span className="font-bold text-blue-600">340%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Disponibilidade do sistema</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={99.8} className="w-20" />
                      <span className="text-sm font-bold">99.8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de sucesso geral</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={94.2} className="w-20" />
                      <span className="text-sm font-bold">94.2%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tempo médio de resposta</span>
                    <span className="font-bold">142ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Regras com IA ativa</span>
                    <span className="font-bold">60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SmartAutomation
