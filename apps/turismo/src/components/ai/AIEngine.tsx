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
  Brain,
  Zap,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Database,
  Cpu,
  Network,
  Globe,
  Shield,
  Target,
  Lightbulb,
  Workflow,
  Filter,
  Search,
  Bot,
  MessageSquare,
  Users,
  BookOpen,
  Code,
  Layers
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, RadialBarChart, RadialBar } from 'recharts'

// Tipos de dados para o motor de IA
interface AIModel {
  id: string
  name: string
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer_vision' | 'reinforcement'
  status: 'training' | 'ready' | 'error' | 'deploying'
  accuracy: number
  lastTrained: string
  trainingData: number
  version: string
  description: string
  useCases: string[]
  performance: {
    precision: number
    recall: number
    f1Score: number
    latency: number
  }
}

interface AITask {
  id: string
  name: string
  type: 'data_analysis' | 'prediction' | 'classification' | 'optimization' | 'anomaly_detection'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  estimatedCompletion?: string
  result?: any
  modelUsed: string
  dataSource: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface AIInsight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation'
  confidence: number
  impact: 'low' | 'medium' | 'high'
  category: string
  generatedAt: string
  actionable: boolean
  relatedData: string[]
}

interface DataPipeline {
  id: string
  name: string
  source: string
  destination: string
  status: 'active' | 'paused' | 'error' | 'configuring'
  lastRun: string
  recordsProcessed: number
  errorRate: number
  schedule: string
  transformations: string[]
}

const AIEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [processingTasks, setProcessingTasks] = useState<string[]>([])

  // Dados mock para demonstração
  const [aiModels] = useState<AIModel[]>([
    {
      id: '1',
      name: 'Customer Behavior Predictor',
      type: 'classification',
      status: 'ready',
      accuracy: 87.5,
      lastTrained: '2025-01-15T10:30:00Z',
      trainingData: 15420,
      version: '2.1.0',
      description: 'Modelo para prever comportamento de compra de clientes',
      useCases: ['Recomendações de produtos', 'Segmentação de clientes', 'Previsão de churn'],
      performance: {
        precision: 0.85,
        recall: 0.82,
        f1Score: 0.83,
        latency: 45
      }
    },
    {
      id: '2',
      name: 'Revenue Forecasting Model',
      type: 'regression',
      status: 'ready',
      accuracy: 92.3,
      lastTrained: '2025-01-14T15:20:00Z',
      trainingData: 8750,
      version: '1.5.2',
      description: 'Modelo de previsão de receita baseado em dados históricos',
      useCases: ['Planejamento financeiro', 'Orçamento anual', 'Projeções de crescimento'],
      performance: {
        precision: 0.92,
        recall: 0.90,
        f1Score: 0.91,
        latency: 32
      }
    },
    {
      id: '3',
      name: 'Anomaly Detection System',
      type: 'clustering',
      status: 'training',
      accuracy: 78.2,
      lastTrained: '2025-01-13T09:15:00Z',
      trainingData: 25600,
      version: '3.0.0-beta',
      description: 'Sistema de detecção de anomalias em transações',
      useCases: ['Detecção de fraudes', 'Monitoramento de qualidade', 'Alertas automáticos'],
      performance: {
        precision: 0.78,
        recall: 0.75,
        f1Score: 0.76,
        latency: 28
      }
    },
    {
      id: '4',
      name: 'Natural Language Processor',
      type: 'nlp',
      status: 'ready',
      accuracy: 84.7,
      lastTrained: '2025-01-12T14:45:00Z',
      trainingData: 12300,
      version: '1.8.1',
      description: 'Processamento de linguagem natural para análise de feedback',
      useCases: ['Análise de sentimento', 'Classificação de texto', 'Chatbot inteligente'],
      performance: {
        precision: 0.84,
        recall: 0.86,
        f1Score: 0.85,
        latency: 52
      }
    }
  ])

  const [aiTasks] = useState<AITask[]>([
    {
      id: '1',
      name: 'Análise de Padrões de Venda Q4',
      type: 'data_analysis',
      status: 'completed',
      progress: 100,
      startTime: '2025-01-15T08:00:00Z',
      result: { insights: 15, patterns: 8, anomalies: 2 },
      modelUsed: 'Customer Behavior Predictor',
      dataSource: 'Sales Database',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Previsão de Receita - Janeiro 2025',
      type: 'prediction',
      status: 'processing',
      progress: 75,
      startTime: '2025-01-15T09:30:00Z',
      estimatedCompletion: '2025-01-15T11:00:00Z',
      modelUsed: 'Revenue Forecasting Model',
      dataSource: 'Financial System',
      priority: 'critical'
    },
    {
      id: '3',
      name: 'Detecção de Anomalias - Transações',
      type: 'anomaly_detection',
      status: 'queued',
      progress: 0,
      startTime: '2025-01-15T10:00:00Z',
      modelUsed: 'Anomaly Detection System',
      dataSource: 'Transaction Logs',
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Otimização de Rotas de Entrega',
      type: 'optimization',
      status: 'failed',
      progress: 45,
      startTime: '2025-01-14T16:20:00Z',
      modelUsed: 'Route Optimizer',
      dataSource: 'Logistics Database',
      priority: 'low'
    }
  ])

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      title: 'Oportunidade de Cross-selling Identificada',
      description: 'Clientes que compraram produto A têm 73% de probabilidade de comprar produto B nos próximos 30 dias',
      type: 'opportunity',
      confidence: 87.5,
      impact: 'high',
      category: 'Vendas',
      generatedAt: '2025-01-15T10:30:00Z',
      actionable: true,
      relatedData: ['customer_segments', 'purchase_history', 'product_affinity']
    },
    {
      id: '2',
      title: 'Risco de Churn Detectado',
      description: '127 clientes apresentam padrão de comportamento indicativo de cancelamento iminente',
      type: 'risk',
      confidence: 92.3,
      impact: 'high',
      category: 'Retenção',
      generatedAt: '2025-01-15T09:15:00Z',
      actionable: true,
      relatedData: ['customer_activity', 'engagement_metrics', 'support_tickets']
    },
    {
      id: '3',
      title: 'Tendência de Crescimento em Segmento Premium',
      description: 'Crescimento de 45% no interesse por produtos premium baseado em análise de comportamento',
      type: 'trend',
      confidence: 79.1,
      impact: 'medium',
      category: 'Mercado',
      generatedAt: '2025-01-15T08:45:00Z',
      actionable: true,
      relatedData: ['market_research', 'customer_preferences', 'sales_trends']
    },
    {
      id: '4',
      title: 'Anomalia em Padrão de Transações',
      description: 'Detectado aumento incomum de 340% em transações de valor baixo na região Sul',
      type: 'anomaly',
      confidence: 94.7,
      impact: 'medium',
      category: 'Operações',
      generatedAt: '2025-01-15T07:20:00Z',
      actionable: false,
      relatedData: ['transaction_logs', 'geographic_data', 'payment_methods']
    }
  ])

  const [dataPipelines] = useState<DataPipeline[]>([
    {
      id: '1',
      name: 'Sales Data Pipeline',
      source: 'CRM System',
      destination: 'Data Warehouse',
      status: 'active',
      lastRun: '2025-01-15T10:00:00Z',
      recordsProcessed: 15420,
      errorRate: 0.02,
      schedule: 'Hourly',
      transformations: ['Data cleaning', 'Normalization', 'Feature extraction']
    },
    {
      id: '2',
      name: 'Customer Behavior Pipeline',
      source: 'Web Analytics',
      destination: 'ML Models',
      status: 'active',
      lastRun: '2025-01-15T09:30:00Z',
      recordsProcessed: 8750,
      errorRate: 0.01,
      schedule: 'Real-time',
      transformations: ['Event aggregation', 'Sessionization', 'Feature engineering']
    },
    {
      id: '3',
      name: 'Financial Data Pipeline',
      source: 'ERP System',
      destination: 'Analytics Engine',
      status: 'error',
      lastRun: '2025-01-15T08:15:00Z',
      recordsProcessed: 3200,
      errorRate: 0.15,
      schedule: 'Daily',
      transformations: ['Currency conversion', 'Aggregation', 'Trend calculation']
    }
  ])

  // Dados para gráficos
  const modelPerformanceData = [
    { model: 'Customer Behavior', accuracy: 87.5, precision: 85, recall: 82, latency: 45 },
    { model: 'Revenue Forecast', accuracy: 92.3, precision: 92, recall: 90, latency: 32 },
    { model: 'Anomaly Detection', accuracy: 78.2, precision: 78, recall: 75, latency: 28 },
    { model: 'NLP Processor', accuracy: 84.7, precision: 84, recall: 86, latency: 52 }
  ]

  const aiUsageData = [
    { date: '2025-01-10', predictions: 1250, classifications: 890, analyses: 340, optimizations: 120 },
    { date: '2025-01-11', predictions: 1380, classifications: 920, analyses: 380, optimizations: 150 },
    { date: '2025-01-12', predictions: 1420, classifications: 1050, analyses: 420, optimizations: 180 },
    { date: '2025-01-13', predictions: 1680, classifications: 1150, analyses: 480, optimizations: 200 },
    { date: '2025-01-14', predictions: 1850, classifications: 1280, analyses: 520, optimizations: 240 },
    { date: '2025-01-15', predictions: 2100, classifications: 1450, analyses: 580, optimizations: 280 }
  ]

  const insightImpactData = [
    { category: 'Vendas', high: 8, medium: 12, low: 5 },
    { category: 'Operações', high: 5, medium: 15, low: 8 },
    { category: 'Financeiro', high: 12, medium: 8, low: 3 },
    { category: 'Marketing', high: 6, medium: 18, low: 10 },
    { category: 'RH', high: 3, medium: 9, low: 12 }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'training': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'deploying': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'queued': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'configuring': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return CheckCircle
      case 'training': return RefreshCw
      case 'error': return AlertTriangle
      case 'deploying': return Upload
      case 'completed': return CheckCircle
      case 'processing': return RefreshCw
      case 'queued': return Clock
      case 'failed': return AlertTriangle
      case 'active': return Activity
      case 'paused': return Pause
      case 'configuring': return Settings
      default: return Clock
    }
  }

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return Target
      case 'regression': return TrendingUp
      case 'clustering': return PieChart
      case 'nlp': return MessageSquare
      case 'computer_vision': return Eye
      case 'reinforcement': return Brain
      default: return Cpu
    }
  }

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-100 text-green-800 border-green-200'
      case 'risk': return 'bg-red-100 text-red-800 border-red-200'
      case 'trend': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'anomaly': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'recommendation': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleStartTask = (taskId: string) => {
    setProcessingTasks(prev => [...prev, taskId])
    // Simular processamento
    setTimeout(() => {
      setProcessingTasks(prev => prev.filter(id => id !== taskId))
    }, 5000)
  }

  const ModelForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model-name">Nome do Modelo</Label>
          <Input 
            id="model-name"
            placeholder="Ex: Customer Segmentation Model"
            title="Nome do modelo de IA"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model-type">Tipo de Modelo</Label>
          <Select>
            <SelectTrigger title="Selecionar tipo de modelo">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classification">Classificação</SelectItem>
              <SelectItem value="regression">Regressão</SelectItem>
              <SelectItem value="clustering">Clustering</SelectItem>
              <SelectItem value="nlp">Processamento de Linguagem Natural</SelectItem>
              <SelectItem value="computer_vision">Visão Computacional</SelectItem>
              <SelectItem value="reinforcement">Aprendizado por Reforço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model-description">Descrição</Label>
        <Textarea 
          id="model-description"
          placeholder="Descrição do modelo e seus casos de uso"
          title="Descrição detalhada do modelo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data-source">Fonte de Dados</Label>
          <Select>
            <SelectTrigger title="Selecionar fonte de dados">
              <SelectValue placeholder="Selecionar fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Dados de Vendas</SelectItem>
              <SelectItem value="customer">Dados de Clientes</SelectItem>
              <SelectItem value="financial">Dados Financeiros</SelectItem>
              <SelectItem value="operational">Dados Operacionais</SelectItem>
              <SelectItem value="external">Fontes Externas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="training-schedule">Cronograma de Treinamento</Label>
          <Select>
            <SelectTrigger title="Selecionar frequência de treinamento">
              <SelectValue placeholder="Selecionar frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  )

  const TaskForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-name">Nome da Tarefa</Label>
          <Input 
            id="task-name"
            placeholder="Ex: Análise de Comportamento do Cliente"
            title="Nome da tarefa de IA"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-type">Tipo de Tarefa</Label>
          <Select>
            <SelectTrigger title="Selecionar tipo de tarefa">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data_analysis">Análise de Dados</SelectItem>
              <SelectItem value="prediction">Predição</SelectItem>
              <SelectItem value="classification">Classificação</SelectItem>
              <SelectItem value="optimization">Otimização</SelectItem>
              <SelectItem value="anomaly_detection">Detecção de Anomalias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model-select">Modelo a Usar</Label>
          <Select>
            <SelectTrigger title="Selecionar modelo">
              <SelectValue placeholder="Selecionar modelo" />
            </SelectTrigger>
            <SelectContent>
              {aiModels.filter(m => m.status === 'ready').map(model => (
                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
              ))}
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
        <Label htmlFor="data-source-task">Fonte de Dados</Label>
        <Select>
          <SelectTrigger title="Selecionar fonte de dados">
            <SelectValue placeholder="Selecionar fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales_db">Base de Vendas</SelectItem>
            <SelectItem value="customer_db">Base de Clientes</SelectItem>
            <SelectItem value="financial_db">Sistema Financeiro</SelectItem>
            <SelectItem value="analytics_db">Analytics</SelectItem>
            <SelectItem value="external_api">APIs Externas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Motor de Inteligência Artificial</h1>
          <p className="text-gray-600">Sistema avançado de IA e automação inteligente</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isModelModalOpen} onOpenChange={setIsModelModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Brain className="w-4 h-4 mr-2" />
                Novo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Modelo de IA</DialogTitle>
                <DialogDescription>
                  Configure um novo modelo de machine learning
                </DialogDescription>
              </DialogHeader>
              <ModelForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModelModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsModelModalOpen(false)}>
                  Criar Modelo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Tarefa de IA</DialogTitle>
                <DialogDescription>
                  Configure uma nova tarefa de análise ou predição
                </DialogDescription>
              </DialogHeader>
              <TaskForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsTaskModalOpen(false)}>
                  Executar Tarefa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs do Sistema de IA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
                <Brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {aiModels.filter(m => m.status === 'ready').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {aiModels.length} modelos total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Hoje</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {aiTasks.length}
                </div>
                <p className="text-xs text-gray-600">
                  {aiTasks.filter(t => t.status === 'completed').length} concluídas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insights Gerados</CardTitle>
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {aiInsights.length}
                </div>
                <p className="text-xs text-gray-600">
                  {aiInsights.filter(i => i.actionable).length} acionáveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">
                  Todos os modelos ativos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Uso da IA */}
          <Card>
            <CardHeader>
              <CardTitle>Uso do Sistema de IA</CardTitle>
              <CardDescription>Evolução das execuções por tipo de tarefa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={aiUsageData}>
                  <defs>
                    <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClassifications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOptimizations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="predictions" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorPredictions)" 
                    name="Predições"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="classifications" 
                    stackId="1"
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorClassifications)" 
                    name="Classificações"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="analyses" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    fill="url(#colorAnalyses)" 
                    name="Análises"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="optimizations" 
                    stackId="1"
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorOptimizations)" 
                    name="Otimizações"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance dos Modelos */}
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Modelos</CardTitle>
              <CardDescription>Métricas de precisão, recall e latência</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Precisão %" />
                  <Bar dataKey="precision" fill="#10b981" name="Precision %" />
                  <Bar dataKey="recall" fill="#f59e0b" name="Recall %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Insights Recentes da IA</CardTitle>
              <CardDescription>Últimos insights gerados pelos modelos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className={`border-l-4 p-4 rounded-r-lg ${getInsightTypeColor(insight.type)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          Confiança: {insight.confidence}%
                        </Badge>
                        <Badge variant="outline" className={
                          insight.impact === 'high' ? 'border-red-300 text-red-700' :
                          insight.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }>
                          {insight.impact}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {insight.category} • {formatDateTime(insight.generatedAt)}
                      </span>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          Ver Ações
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* Lista de Modelos */}
          <div className="grid gap-6">
            {aiModels.map((model) => {
              const StatusIcon = getStatusIcon(model.status)
              const TypeIcon = getModelTypeIcon(model.type)

              return (
                <Card key={model.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getStatusColor(model.status).split(' ')[1]}`}>
                          <TypeIcon className={`h-6 w-6 ${getStatusColor(model.status).split(' ')[0]}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{model.name}</h3>
                          <p className="text-gray-600">{model.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500 capitalize">
                              {model.type.replace('_', ' ')} • v{model.version}
                            </span>
                            <span className="text-sm text-gray-500">
                              {model.trainingData.toLocaleString()} samples
                            </span>
                            <span className="text-sm text-gray-500">
                              Atualizado: {formatDateTime(model.lastTrained)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(model.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {model.status}
                        </Badge>
                        <Badge variant="outline">
                          {model.accuracy.toFixed(1)}% precisão
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Precision</p>
                        <p className="text-lg font-bold text-blue-600">{(model.performance.precision * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Recall</p>
                        <p className="text-lg font-bold text-green-600">{(model.performance.recall * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">F1-Score</p>
                        <p className="text-lg font-bold text-purple-600">{(model.performance.f1Score * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Latência</p>
                        <p className="text-lg font-bold text-orange-600">{model.performance.latency}ms</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Casos de Uso:</p>
                        <div className="flex flex-wrap gap-2">
                          {model.useCases.map((useCase, index) => (
                            <Badge key={index} variant="outline">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-2">
                          {model.status === 'ready' && (
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Executar
                            </Button>
                          )}
                          {model.status === 'training' && (
                            <Button size="sm" variant="outline" disabled>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Treinando...
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retreinar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Exportar
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Métricas
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

        <TabsContent value="tasks" className="space-y-6">
          {/* Fila de Tarefas */}
          <Card>
            <CardHeader>
              <CardTitle>Fila de Execução</CardTitle>
              <CardDescription>Tarefas de IA em execução e pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiTasks.map((task) => {
                  const StatusIcon = getStatusIcon(task.status)
                  const isProcessing = processingTasks.includes(task.id)

                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(task.status).split(' ')[1]}`}>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(task.status).split(' ')[0]} ${task.status === 'processing' || isProcessing ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-gray-600">
                            {task.modelUsed} • {task.dataSource}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Iniciado: {formatDateTime(task.startTime)}
                            </span>
                            {task.estimatedCompletion && (
                              <span className="text-xs text-gray-500">
                                Estimativa: {formatDateTime(task.estimatedCompletion)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={task.progress} className="w-24 h-2" />
                          <span className="text-sm">{task.progress}%</span>
                        </div>
                        {task.result && task.status === 'completed' && (
                          <div className="text-xs text-green-600">
                            {Object.entries(task.result).map(([key, value]) => (
                              <span key={key}>{key}: {value as string} </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {task.status === 'queued' && (
                          <Button size="sm" onClick={() => handleStartTask(task.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {task.status === 'processing' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3 mr-1" />
                            Pausar
                          </Button>
                        )}
                        {task.status === 'failed' && (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reexecutar
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Distribuição de Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto dos Insights por Categoria</CardTitle>
              <CardDescription>Distribuição de insights de alto, médio e baixo impacto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insightImpactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="high" fill="#ef4444" name="Alto Impacto" />
                  <Bar dataKey="medium" fill="#f59e0b" name="Médio Impacto" />
                  <Bar dataKey="low" fill="#10b981" name="Baixo Impacto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lista Detalhada de Insights */}
          <div className="grid gap-6">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getInsightTypeColor(insight.type).includes('green') ? 'border-l-green-500' : 
                getInsightTypeColor(insight.type).includes('red') ? 'border-l-red-500' :
                getInsightTypeColor(insight.type).includes('blue') ? 'border-l-blue-500' :
                getInsightTypeColor(insight.type).includes('yellow') ? 'border-l-yellow-500' :
                'border-l-purple-500'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-xl">{insight.title}</h3>
                      <p className="text-gray-600 mt-2">{insight.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getInsightTypeColor(insight.type)}>
                        {insight.type}
                      </Badge>
                      <Badge variant="outline" className={
                        insight.impact === 'high' ? 'border-red-300 text-red-700' :
                        insight.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }>
                        {insight.impact} impacto
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Confiança</p>
                      <div className="flex items-center justify-center space-x-2">
                        <Progress value={insight.confidence} className="w-16 h-2" />
                        <span className="text-lg font-bold text-blue-600">{insight.confidence}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Categoria</p>
                      <p className="text-lg font-bold">{insight.category}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Gerado em</p>
                      <p className="text-sm font-medium">{formatDateTime(insight.generatedAt)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Dados Relacionados:</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.relatedData.map((data, index) => (
                          <Badge key={index} variant="outline">
                            <Database className="h-3 w-3 mr-1" />
                            {data.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        {insight.actionable ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acionável
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Informativo
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {insight.actionable && (
                          <Button size="sm">
                            <Zap className="h-3 w-3 mr-1" />
                            Criar Ação
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Dados
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          {/* Pipelines de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Pipelines de Dados</CardTitle>
              <CardDescription>Fluxos de dados para alimentar os modelos de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataPipelines.map((pipeline) => {
                  const StatusIcon = getStatusIcon(pipeline.status)

                  return (
                    <div key={pipeline.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(pipeline.status).split(' ')[1]}`}>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(pipeline.status).split(' ')[0]}`} />
                        </div>
                        <div>
                          <p className="font-medium">{pipeline.name}</p>
                          <p className="text-sm text-gray-600">
                            {pipeline.source} → {pipeline.destination}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Última execução: {formatDateTime(pipeline.lastRun)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Cronograma: {pipeline.schedule}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(pipeline.status)}>
                          {pipeline.status}
                        </Badge>
                        <div className="text-sm">
                          <p>{pipeline.recordsProcessed.toLocaleString()} registros</p>
                          <p className={`${pipeline.errorRate < 0.05 ? 'text-green-600' : 'text-red-600'}`}>
                            {(pipeline.errorRate * 100).toFixed(2)}% erro
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {pipeline.status === 'active' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3 mr-1" />
                            Pausar
                          </Button>
                        )}
                        {pipeline.status === 'paused' && (
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Retomar
                          </Button>
                        )}
                        {pipeline.status === 'error' && (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reiniciar
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Configurações do Sistema de IA */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Motor de IA</CardTitle>
              <CardDescription>Configurações globais do sistema de inteligência artificial</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-concurrent-tasks">Tarefas Simultâneas</Label>
                    <Input 
                      id="max-concurrent-tasks"
                      type="number" 
                      defaultValue="5"
                      title="Número máximo de tarefas executando simultaneamente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-retention">Retenção de Modelos (dias)</Label>
                    <Input 
                      id="model-retention"
                      type="number" 
                      defaultValue="30"
                      title="Tempo de retenção de versões antigas dos modelos"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Configurações de Treinamento</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="auto-retrain"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Retreinamento automático quando performance degradar"
                      />
                      <Label htmlFor="auto-retrain">Retreinamento automático</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="data-validation"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Validação automática de qualidade dos dados"
                      />
                      <Label htmlFor="data-validation">Validação de dados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="model-versioning"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Versionamento automático de modelos"
                      />
                      <Label htmlFor="model-versioning">Versionamento de modelos</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Alertas e Monitoramento</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="performance-alerts"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Alertas quando performance cair abaixo do limite"
                      />
                      <Label htmlFor="performance-alerts">Alertas de performance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="resource-monitoring"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Monitoramento de uso de recursos computacionais"
                      />
                      <Label htmlFor="resource-monitoring">Monitoramento de recursos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="anomaly-alerts"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Alertas automáticos para anomalias detectadas"
                      />
                      <Label htmlFor="anomaly-alerts">Alertas de anomalias</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Segurança e Compliance</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="data-encryption"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Criptografia de dados sensíveis"
                      />
                      <Label htmlFor="data-encryption">Criptografia de dados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="audit-logging"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Log detalhado de todas as operações"
                      />
                      <Label htmlFor="audit-logging">Log de auditoria</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="model-explainability"
                        className="rounded border-gray-300"
                        title="Explicabilidade dos resultados dos modelos"
                      />
                      <Label htmlFor="model-explainability">Explicabilidade de modelos</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button>Salvar Configurações</Button>
                  <Button variant="outline">Restaurar Padrões</Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Config
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIEngine
