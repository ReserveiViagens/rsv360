'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

import { Progress } from '@/components/ui/Progress'
import { 
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Cpu,
  Database,
  Network,
  DollarSign,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Gauge,
  Layers,
  Building,
  Workflow,
  Timer,
  PieChart,
  Globe,
  Code
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts'

// Tipos para motor de otimização
interface OptimizationRule {
  id: string
  name: string
  description: string
  category: 'performance' | 'cost' | 'resource' | 'workflow' | 'quality'
  target: {
    metric: string
    current_value: number
    target_value: number
    unit: string
  }
  algorithm: 'genetic' | 'gradient_descent' | 'simulated_annealing' | 'particle_swarm' | 'reinforcement_learning'
  status: 'active' | 'paused' | 'optimizing' | 'completed' | 'error'
  constraints: {
    min_value?: number
    max_value?: number
    conditions: string[]
  }
  parameters: Record<string, number>
  lastOptimization: string
  improvement: number // percentual de melhoria
  iterations: number
  convergence: number // 0-100%
}

interface OptimizationExecution {
  id: string
  ruleId: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  currentIteration: number
  totalIterations: number
  bestValue: number
  currentValue: number
  parameters: Record<string, number>
  improvements: {
    iteration: number
    value: number
    parameters: Record<string, number>
  }[]
  resourceUsage: {
    cpu: number
    memory: number
    time: number
  }
}

interface OptimizationTarget {
  id: string
  name: string
  type: 'maximize' | 'minimize'
  current_value: number
  optimal_value?: number
  unit: string
  description: string
  factors: string[]
  business_impact: 'low' | 'medium' | 'high' | 'critical'
  optimization_potential: number // 0-100%
}

interface OptimizationInsight {
  id: string
  type: 'bottleneck' | 'opportunity' | 'recommendation' | 'warning'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  potential_savings: {
    cost: number
    time: number
    efficiency: number
  }
  affected_areas: string[]
  recommended_actions: string[]
  confidence: number
}

const OptimizationEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<OptimizationRule | null>(null)
  const [runningOptimizations, setRunningOptimizations] = useState<string[]>([])

  // Dados mock para demonstração
  const [optimizationRules] = useState<OptimizationRule[]>([
    {
      id: '1',
      name: 'Otimização de Performance de Database',
      description: 'Otimizar queries e índices para melhorar tempo de resposta',
      category: 'performance',
      target: {
        metric: 'avg_query_time',
        current_value: 450,
        target_value: 200,
        unit: 'ms'
      },
      algorithm: 'genetic',
      status: 'active',
      constraints: {
        min_value: 100,
        max_value: 1000,
        conditions: ['memory_usage < 80%', 'cpu_usage < 70%']
      },
      parameters: {
        cache_size: 512,
        index_optimization: 85,
        connection_pool: 20
      },
      lastOptimization: '2025-01-15T10:30:00Z',
      improvement: 34.5,
      iterations: 247,
      convergence: 92.3
    },
    {
      id: '2',
      name: 'Otimização de Custos de Infraestrutura',
      description: 'Reduzir custos de cloud mantendo performance',
      category: 'cost',
      target: {
        metric: 'monthly_cost',
        current_value: 8500,
        target_value: 6000,
        unit: 'BRL'
      },
      algorithm: 'particle_swarm',
      status: 'optimizing',
      constraints: {
        min_value: 5000,
        conditions: ['availability > 99.5%', 'response_time < 500ms']
      },
      parameters: {
        server_count: 12,
        instance_type: 2,
        auto_scaling: 75
      },
      lastOptimization: '2025-01-15T09:15:00Z',
      improvement: 18.7,
      iterations: 156,
      convergence: 67.8
    },
    {
      id: '3',
      name: 'Otimização de Workflow de Aprovação',
      description: 'Acelerar processo de aprovação de despesas',
      category: 'workflow',
      target: {
        metric: 'approval_time',
        current_value: 4.2,
        target_value: 2.0,
        unit: 'dias'
      },
      algorithm: 'reinforcement_learning',
      status: 'completed',
      constraints: {
        min_value: 1.0,
        max_value: 7.0,
        conditions: ['accuracy > 95%', 'compliance = 100%']
      },
      parameters: {
        automation_level: 65,
        parallel_paths: 3,
        ai_classification: 88
      },
      lastOptimization: '2025-01-14T16:45:00Z',
      improvement: 52.4,
      iterations: 89,
      convergence: 98.1
    },
    {
      id: '4',
      name: 'Otimização de Alocação de Recursos',
      description: 'Balancear carga de trabalho entre equipes',
      category: 'resource',
      target: {
        metric: 'team_utilization',
        current_value: 68.5,
        target_value: 85.0,
        unit: '%'
      },
      algorithm: 'simulated_annealing',
      status: 'paused',
      constraints: {
        min_value: 60,
        max_value: 95,
        conditions: ['overtime < 10%', 'satisfaction > 4.0']
      },
      parameters: {
        skill_matching: 78,
        workload_balance: 72,
        priority_weight: 65
      },
      lastOptimization: '2025-01-13T14:20:00Z',
      improvement: 24.1,
      iterations: 134,
      convergence: 76.4
    }
  ])

  const [optimizationTargets] = useState<OptimizationTarget[]>([
    {
      id: '1',
      name: 'Tempo de Resposta da API',
      type: 'minimize',
      current_value: 245,
      optimal_value: 150,
      unit: 'ms',
      description: 'Tempo médio de resposta das APIs principais',
      factors: ['cache_hit_rate', 'database_performance', 'network_latency'],
      business_impact: 'high',
      optimization_potential: 85
    },
    {
      id: '2',
      name: 'Taxa de Conversão',
      type: 'maximize',
      current_value: 12.3,
      optimal_value: 18.5,
      unit: '%',
      description: 'Percentual de visitantes que fazem reservas',
      factors: ['ux_optimization', 'pricing_strategy', 'recommendation_engine'],
      business_impact: 'critical',
      optimization_potential: 92
    },
    {
      id: '3',
      name: 'Custo por Aquisição',
      type: 'minimize',
      current_value: 285,
      optimal_value: 180,
      unit: 'BRL',
      description: 'Custo médio para adquirir um novo cliente',
      factors: ['marketing_efficiency', 'channel_optimization', 'targeting_accuracy'],
      business_impact: 'high',
      optimization_potential: 78
    },
    {
      id: '4',
      name: 'Satisfação do Cliente',
      type: 'maximize',
      current_value: 4.2,
      optimal_value: 4.8,
      unit: '/5',
      description: 'Score médio de satisfação dos clientes',
      factors: ['service_quality', 'response_time', 'personalization'],
      business_impact: 'critical',
      optimization_potential: 65
    }
  ])

  const [executions] = useState<OptimizationExecution[]>([
    {
      id: '1',
      ruleId: '1',
      startTime: '2025-01-15T10:30:00Z',
      status: 'running',
      currentIteration: 156,
      totalIterations: 200,
      bestValue: 312,
      currentValue: 325,
      parameters: { cache_size: 768, index_optimization: 92, connection_pool: 25 },
      improvements: [
        { iteration: 50, value: 420, parameters: { cache_size: 512, index_optimization: 75, connection_pool: 20 } },
        { iteration: 100, value: 385, parameters: { cache_size: 640, index_optimization: 82, connection_pool: 22 } },
        { iteration: 150, value: 340, parameters: { cache_size: 720, index_optimization: 88, connection_pool: 24 } }
      ],
      resourceUsage: { cpu: 35, memory: 512, time: 1247 }
    },
    {
      id: '2',
      ruleId: '2',
      startTime: '2025-01-15T09:15:00Z',
      status: 'running',
      currentIteration: 89,
      totalIterations: 150,
      bestValue: 6890,
      currentValue: 7120,
      parameters: { server_count: 10, instance_type: 2, auto_scaling: 80 },
      improvements: [
        { iteration: 25, value: 8100, parameters: { server_count: 12, instance_type: 2, auto_scaling: 70 } },
        { iteration: 50, value: 7450, parameters: { server_count: 11, instance_type: 2, auto_scaling: 75 } },
        { iteration: 75, value: 7020, parameters: { server_count: 10, instance_type: 2, auto_scaling: 78 } }
      ],
      resourceUsage: { cpu: 28, memory: 256, time: 2145 }
    }
  ])

  const [insights] = useState<OptimizationInsight[]>([
    {
      id: '1',
      type: 'bottleneck',
      title: 'Gargalo no Processamento de Pagamentos',
      description: 'Sistema de pagamento está limitando a capacidade de processamento em horários de pico',
      impact: 'high',
      effort: 'medium',
      potential_savings: { cost: 15000, time: 120, efficiency: 35 },
      affected_areas: ['checkout', 'customer_experience', 'revenue'],
      recommended_actions: [
        'Implementar cache de validação de cartões',
        'Otimizar conexões com gateway de pagamento',
        'Adicionar fallback para múltiplos provedores'
      ],
      confidence: 87.3
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Oportunidade de Otimização de CPU',
      description: 'Servidores operando com baixa utilização em 60% do tempo',
      impact: 'medium',
      effort: 'low',
      potential_savings: { cost: 8500, time: 0, efficiency: 25 },
      affected_areas: ['infrastructure', 'costs'],
      recommended_actions: [
        'Implementar auto-scaling mais agressivo',
        'Consolidar workloads em horários de baixo uso',
        'Migrar para instâncias menores durante off-peak'
      ],
      confidence: 92.1
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Implementar Cache Inteligente',
      description: 'IA detectou padrões de acesso que podem ser otimizados com cache preditivo',
      impact: 'high',
      effort: 'high',
      potential_savings: { cost: 12000, time: 200, efficiency: 45 },
      affected_areas: ['performance', 'user_experience', 'costs'],
      recommended_actions: [
        'Desenvolver algoritmo de cache preditivo',
        'Implementar warming automático de cache',
        'Configurar invalidação inteligente'
      ],
      confidence: 78.9
    }
  ])

  // Dados para gráficos
  const optimizationTrendData = [
    { week: 'Sem 1', performance: 65, cost: 8500, efficiency: 70 },
    { week: 'Sem 2', performance: 68, cost: 8200, efficiency: 73 },
    { week: 'Sem 3', performance: 72, cost: 7800, efficiency: 76 },
    { week: 'Sem 4', performance: 76, cost: 7400, efficiency: 80 },
    { week: 'Sem 5', performance: 79, cost: 7100, efficiency: 83 },
    { week: 'Sem 6', performance: 82, cost: 6900, efficiency: 86 }
  ]

  const categoryDistributionData = [
    { name: 'Performance', value: 35, color: '#3b82f6' },
    { name: 'Custo', value: 28, color: '#10b981' },
    { name: 'Recursos', value: 22, color: '#f59e0b' },
    { name: 'Workflow', value: 15, color: '#8b5cf6' }
  ]

  const roiData = [
    { metric: 'Redução de Custos', before: 10000, after: 7500, roi: 25 },
    { metric: 'Tempo de Resposta', before: 450, after: 280, roi: 38 },
    { metric: 'Utilização de CPU', before: 65, after: 85, roi: 31 },
    { metric: 'Satisfação Cliente', before: 3.8, after: 4.4, roi: 16 }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'optimizing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'error': return 'bg-red-100 text-red-800'
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
      case 'optimizing': return RefreshCw
      case 'completed': return CheckCircle
      case 'error': return AlertTriangle
      case 'running': return RefreshCw
      case 'failed': return AlertTriangle
      case 'cancelled': return Clock
      default: return Clock
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return Zap
      case 'cost': return DollarSign
      case 'resource': return Cpu
      case 'workflow': return Workflow
      case 'quality': return Target
      default: return Settings
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'bottleneck': return 'border-red-300 bg-red-50'
      case 'opportunity': return 'border-green-300 bg-green-50'
      case 'recommendation': return 'border-blue-300 bg-blue-50'
      case 'warning': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const handleStartOptimization = (ruleId: string) => {
    setRunningOptimizations(prev => [...prev, ruleId])
    // Simular otimização
    setTimeout(() => {
      setRunningOptimizations(prev => prev.filter(id => id !== ruleId))
    }, 5000)
  }

  const RuleForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="rule-name" className="text-sm font-medium">Nome da Regra</label>
          <Input 
            id="rule-name"
            placeholder="Ex: Otimização de Performance"
            title="Nome da regra de otimização"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="rule-category" className="text-sm font-medium">Categoria</label>
          <Select 
            title="Selecionar categoria"
            options={[
              { value: 'performance', label: 'Performance' },
              { value: 'cost', label: 'Custo' },
              { value: 'resource', label: 'Recursos' },
              { value: 'workflow', label: 'Workflow' },
              { value: 'quality', label: 'Qualidade' }
            ]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="rule-description" className="text-sm font-medium">Descrição</label>
        <Textarea 
          id="rule-description"
          placeholder="Descreva o objetivo desta otimização"
          title="Descrição detalhada da regra"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="target-metric" className="text-sm font-medium">Métrica Alvo</label>
          <Input 
            id="target-metric"
            placeholder="Ex: response_time"
            title="Métrica que será otimizada"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="current-value" className="text-sm font-medium">Valor Atual</label>
          <Input 
            id="current-value"
            type="number" 
            placeholder="450"
            title="Valor atual da métrica"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="target-value" className="text-sm font-medium">Valor Alvo</label>
          <Input 
            id="target-value"
            type="number" 
            placeholder="200"
            title="Valor desejado da métrica"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="algorithm" className="text-sm font-medium">Algoritmo</label>
          <Select
            title="Selecionar algoritmo de otimização"
            options={[
              { value: 'genetic', label: 'Algoritmo Genético' },
              { value: 'gradient_descent', label: 'Gradient Descent' },
              { value: 'simulated_annealing', label: 'Simulated Annealing' },
              { value: 'particle_swarm', label: 'Particle Swarm' },
              { value: 'reinforcement_learning', label: 'Reinforcement Learning' }
            ]}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="unit" className="text-sm font-medium">Unidade</label>
          <Input 
            id="unit"
            placeholder="ms, %, BRL, etc."
            title="Unidade de medida da métrica"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="constraints" className="text-sm font-medium">Restrições (uma por linha)</label>
        <Textarea 
          id="constraints"
          placeholder="memory_usage < 80%&#10;cpu_usage < 70%&#10;availability > 99%"
          title="Restrições que devem ser respeitadas"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="parameters" className="text-sm font-medium">Parâmetros Iniciais (JSON)</label>
        <Textarea 
          id="parameters"
          placeholder='{"cache_size": 512, "connections": 20}'
          title="Parâmetros iniciais em formato JSON"
        />
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Motor de Otimização</h1>
          <p className="text-gray-600">Otimização automática de processos e recursos</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsRuleModalOpen(!isRuleModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="targets">Alvos</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs de Otimização */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {optimizationRules.filter(r => r.status === 'active').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {optimizationRules.length} regras
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhoria Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(optimizationRules.reduce((sum, r) => sum + r.improvement, 0) / optimizationRules.length).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">
                  Todas as otimizações
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
                <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(125000)}
                </div>
                <p className="text-xs text-gray-600">
                  Este mês
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tendências de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Otimização</CardTitle>
              <CardDescription>Evolução das métricas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={optimizationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} name="Performance %" />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} name="Eficiência %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Otimizações por Categoria</CardTitle>
                <CardDescription>Distribuição das regras ativas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ROI das Otimizações */}
            <Card>
              <CardHeader>
                <CardTitle>ROI das Otimizações</CardTitle>
                <CardDescription>Retorno sobre investimento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="roi" fill="#10b981" name="ROI %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alvos de Otimização Principais */}
          <Card>
            <CardHeader>
              <CardTitle>Principais Alvos de Otimização</CardTitle>
              <CardDescription>Métricas com maior potencial de melhoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationTargets.slice(0, 4).map((target) => {
                  const progress = target.optimal_value 
                    ? ((target.current_value / target.optimal_value) * 100)
                    : target.optimization_potential
                  const isMaximize = target.type === 'maximize'
                  
                  return (
                    <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getImpactColor(target.business_impact).includes('red') ? 'bg-red-100' :
                          getImpactColor(target.business_impact).includes('orange') ? 'bg-orange-100' :
                          getImpactColor(target.business_impact).includes('yellow') ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          {isMaximize ? (
                            <ArrowUp className={`h-4 w-4 ${getImpactColor(target.business_impact)}`} />
                          ) : (
                            <ArrowDown className={`h-4 w-4 ${getImpactColor(target.business_impact)}`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{target.name}</p>
                          <p className="text-sm text-gray-600">{target.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold">
                          {target.current_value} {target.unit}
                        </div>
                        {target.optimal_value && (
                          <div className="text-sm text-gray-600">
                            Meta: {target.optimal_value} {target.unit}
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Progress value={target.optimization_potential} className="w-20 h-2" />
                          <span className="text-sm font-medium">{target.optimization_potential}%</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="secondary" className={getImpactColor(target.business_impact)}>
                          {target.business_impact}
                        </Badge>
                        <Button size="sm">
                          <Zap className="h-3 w-3 mr-1" />
                          Otimizar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {/* Lista de Regras */}
          <div className="grid gap-6">
            {optimizationRules.map((rule) => {
              const StatusIcon = getStatusIcon(rule.status)
              const CategoryIcon = getCategoryIcon(rule.category)
              const isRunning = runningOptimizations.includes(rule.id)
              const progressToTarget = ((rule.target.current_value - rule.target.target_value) / rule.target.current_value) * 100

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
                              {rule.category} • {rule.algorithm.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {rule.iterations} iterações
                            </span>
                            <span className="text-sm text-gray-500">
                              Última: {formatDateTime(rule.lastOptimization)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(rule.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {rule.status}
                        </Badge>
                        <Badge>
                          +{rule.improvement}% melhoria
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Atual</p>
                        <p className="text-lg font-bold text-blue-600">
                          {rule.target.current_value} {rule.target.unit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Meta</p>
                        <p className="text-lg font-bold text-green-600">
                          {rule.target.target_value} {rule.target.unit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Convergência</p>
                        <p className="text-lg font-bold text-purple-600">{rule.convergence}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Melhoria</p>
                        <p className="text-lg font-bold text-orange-600">+{rule.improvement}%</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Progresso para Meta:</p>
                        <Progress value={Math.abs(progressToTarget)} className="h-3" />
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Parâmetros Atuais:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(rule.parameters).map(([key, value]) => (
                            <Badge key={key}>
                              {key.replace('_', ' ')}: {value}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Restrições:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.constraints.conditions.map((condition, index) => (
                            <Badge key={index} className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-2">
                          {rule.status === 'active' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStartOptimization(rule.id)}
                                disabled={isRunning}
                              >
                                {isRunning ? (
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Play className="h-3 w-3 mr-1" />
                                )}
                                {isRunning ? 'Otimizando...' : 'Executar'}
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            </>
                          )}
                          {rule.status === 'paused' && (
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Retomar
                            </Button>
                          )}
                          <Button variant="secondary" size="sm">
                            <Gauge className="h-3 w-3 mr-1" />
                            Ajustar
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Histórico
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
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

        <TabsContent value="targets" className="space-y-6">
          {/* Alvos de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle>Alvos de Otimização</CardTitle>
              <CardDescription>Métricas disponíveis para otimização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {optimizationTargets.map((target) => (
                  <Card key={target.id} className={`border-l-4 ${
                    target.business_impact === 'critical' ? 'border-l-red-500' :
                    target.business_impact === 'high' ? 'border-l-orange-500' :
                    target.business_impact === 'medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-xl">{target.name}</h3>
                          <p className="text-gray-600 mt-2">{target.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={getImpactColor(target.business_impact)}>
                            {target.business_impact}
                          </Badge>
                          <Badge variant="secondary">
                            {target.type === 'maximize' ? 'Maximizar' : 'Minimizar'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Valor Atual</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {target.current_value} {target.unit}
                          </p>
                        </div>
                        {target.optimal_value && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Valor Ótimo</p>
                            <p className="text-2xl font-bold text-green-600">
                              {target.optimal_value} {target.unit}
                            </p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Potencial</p>
                          <div className="flex items-center justify-center space-x-2">
                            <Progress value={target.optimization_potential} className="w-16 h-3" />
                            <span className="text-lg font-bold text-purple-600">
                              {target.optimization_potential}%
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Impacto</p>
                          <p className={`text-lg font-bold ${getImpactColor(target.business_impact)}`}>
                            {target.business_impact}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Fatores Influenciadores:</p>
                          <div className="flex flex-wrap gap-2">
                            {target.factors.map((factor, index) => (
                              <Badge key={index} variant="secondary">
                                {factor.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">
                            Impacto no Negócio: <span className="font-medium capitalize">{target.business_impact}</span>
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Criar Regra
                            </Button>
                            <Button variant="secondary" size="sm">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Analisar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          {/* Execuções em Andamento */}
          <Card>
            <CardHeader>
              <CardTitle>Execuções de Otimização</CardTitle>
              <CardDescription>Otimizações em andamento e histórico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => {
                  const rule = optimizationRules.find(r => r.id === execution.ruleId)
                  const progressPercentage = (execution.currentIteration / execution.totalIterations) * 100
                  const improvement = ((rule?.target.current_value! - execution.bestValue) / rule?.target.current_value!) * 100

                  return (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{rule?.name}</h4>
                          <p className="text-gray-600">{rule?.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Iniciado: {formatDateTime(execution.startTime)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Iteração: {execution.currentIteration}/{execution.totalIterations}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Melhor Valor</p>
                          <p className="text-lg font-bold text-green-600">
                            {execution.bestValue} {rule?.target.unit}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Valor Atual</p>
                          <p className="text-lg font-bold text-blue-600">
                            {execution.currentValue} {rule?.target.unit}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Melhoria</p>
                          <p className="text-lg font-bold text-purple-600">
                            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Progresso</p>
                          <div className="flex items-center justify-center space-x-2">
                            <Progress value={progressPercentage} className="w-16 h-2" />
                            <span className="text-sm font-bold">{progressPercentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Parâmetros Atuais:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(execution.parameters).map(([key, value]) => (
                              <Badge key={key} variant="secondary">
                                {key.replace('_', ' ')}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">CPU:</span>
                            <span className="ml-2 font-medium">{execution.resourceUsage.cpu}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Memória:</span>
                            <span className="ml-2 font-medium">{execution.resourceUsage.memory}MB</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tempo:</span>
                            <span className="ml-2 font-medium">{Math.floor(execution.resourceUsage.time / 60)}min</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">
                            {execution.improvements.length} melhorias encontradas
                          </span>
                          <div className="flex space-x-2">
                            {execution.status === 'running' && (
                              <Button variant="secondary" size="sm">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            )}
                            <Button variant="secondary" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Insights de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle>Insights de Otimização</CardTitle>
              <CardDescription>Oportunidades e recomendações identificadas pela IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className={`border-l-4 rounded-lg p-4 ${getInsightTypeColor(insight.type)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{insight.title}</h4>
                        <p className="text-gray-600 mt-1">{insight.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {insight.confidence}% confiança
                        </Badge>
                        <Badge variant="secondary" className={
                          insight.impact === 'high' ? 'border-red-300 text-red-700' :
                          insight.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }>
                          {insight.impact} impacto
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <p className="text-sm text-gray-600">Economia de Custo</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(insight.potential_savings.cost)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <p className="text-sm text-gray-600">Economia de Tempo</p>
                        <p className="text-lg font-bold text-blue-600">
                          {insight.potential_savings.time}h/mês
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <p className="text-sm text-gray-600">Ganho de Eficiência</p>
                        <p className="text-lg font-bold text-purple-600">
                          +{insight.potential_savings.efficiency}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Áreas Afetadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {insight.affected_areas.map((area, index) => (
                            <Badge key={index} variant="secondary">
                              {area.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Ações Recomendadas:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {insight.recommended_actions.map((action, index) => (
                            <li key={index} className="text-gray-700">{action}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Esforço: <span className="font-medium">{insight.effort}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Tipo: <span className="font-medium capitalize">{insight.type}</span>
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Lightbulb className="h-3 w-3 mr-1" />
                            Implementar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Simular
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
              <CardTitle>Custos vs Performance</CardTitle>
              <CardDescription>Evolução da relação custo-benefício</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={optimizationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'cost' ? formatCurrency(Number(value)) : `${value}%`,
                    name === 'cost' ? 'Custo' : name === 'performance' ? 'Performance' : 'Eficiência'
                  ]} />
                  <Area type="monotone" dataKey="cost" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="cost" />
                  <Area type="monotone" dataKey="performance" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="performance" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência por Algoritmo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Genetic Algorithm', efficiency: 92, color: 'bg-blue-500' },
                    { name: 'Particle Swarm', efficiency: 87, color: 'bg-green-500' },
                    { name: 'Simulated Annealing', efficiency: 84, color: 'bg-purple-500' },
                    { name: 'Reinforcement Learning', efficiency: 89, color: 'bg-orange-500' }
                  ].map((algo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{algo.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${algo.color}`}
                            data-width={algo.efficiency}
                          />
                        </div>
                        <span className="text-sm font-bold">{algo.efficiency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>CPU Médio</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={32} className="w-20" />
                      <span className="text-sm font-bold">32%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memória Média</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm font-bold">384MB</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tempo Médio</span>
                    <span className="text-sm font-bold">24min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Sucesso</span>
                    <span className="text-sm font-bold text-green-600">94.2%</span>
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

export default OptimizationEngine
