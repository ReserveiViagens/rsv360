'use client'

import React, { useState } from 'react'
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
  TrendingUp,
  Brain,
  Target,
  Eye,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Download,
  Upload,
  Filter,
  Search,
  Database,
  Layers,
  Network,
  Cpu,
  Globe,
  ArrowRight,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Calculator
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
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
  ScatterChart, 
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar
} from 'recharts'

// Tipos para análise preditiva
interface PredictiveModel {
  id: string
  name: string
  type: 'time_series' | 'regression' | 'classification' | 'clustering' | 'neural_network'
  target: string
  accuracy: number
  status: 'training' | 'ready' | 'predicting' | 'error'
  lastTrained: string
  features: string[]
  horizon: number // dias de previsão
  confidenceInterval: number
  algorithm: string
  dataSource: string
}

interface Prediction {
  id: string
  modelId: string
  targetMetric: string
  timeframe: string
  predictedValue: number
  confidenceLower: number
  confidenceUpper: number
  actualValue?: number
  accuracy?: number
  generatedAt: string
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
  factors: string[]
}

interface Scenario {
  id: string
  name: string
  description: string
  parameters: Record<string, number>
  predictions: {
    metric: string
    value: number
    change: number
  }[]
  probability: number
  impact: 'low' | 'medium' | 'high'
  createdAt: string
}

interface TrendAnalysis {
  metric: string
  direction: 'up' | 'down' | 'stable'
  strength: number // 0-100
  seasonality: boolean
  cyclical: boolean
  trend_coefficient: number
  r_squared: number
  forecast_horizon: number
  confidence: number
}

const PredictiveAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30-days')

  // Dados mock para demonstração
  const [models] = useState<PredictiveModel[]>([
    {
      id: '1',
      name: 'Revenue Forecaster',
      type: 'time_series',
      target: 'monthly_revenue',
      accuracy: 94.2,
      status: 'ready',
      lastTrained: '2025-01-15T09:00:00Z',
      features: ['historical_revenue', 'seasonality', 'marketing_spend', 'customer_count'],
      horizon: 90,
      confidenceInterval: 95,
      algorithm: 'ARIMA with External Regressors',
      dataSource: 'Financial Database'
    },
    {
      id: '2',
      name: 'Customer Churn Predictor',
      type: 'classification',
      target: 'churn_probability',
      accuracy: 87.5,
      status: 'ready',
      lastTrained: '2025-01-14T14:30:00Z',
      features: ['engagement_score', 'support_tickets', 'payment_history', 'usage_patterns'],
      horizon: 30,
      confidenceInterval: 90,
      algorithm: 'Random Forest',
      dataSource: 'Customer Database'
    },
    {
      id: '3',
      name: 'Demand Forecaster',
      type: 'regression',
      target: 'product_demand',
      accuracy: 89.1,
      status: 'predicting',
      lastTrained: '2025-01-13T11:15:00Z',
      features: ['seasonal_trends', 'price_elasticity', 'competitor_activity', 'economic_indicators'],
      horizon: 60,
      confidenceInterval: 85,
      algorithm: 'Gradient Boosting',
      dataSource: 'Sales & Market Data'
    },
    {
      id: '4',
      name: 'Risk Assessment Model',
      type: 'neural_network',
      target: 'risk_score',
      accuracy: 91.7,
      status: 'training',
      lastTrained: '2025-01-12T16:45:00Z',
      features: ['financial_ratios', 'market_volatility', 'credit_history', 'industry_factors'],
      horizon: 180,
      confidenceInterval: 92,
      algorithm: 'Deep Neural Network',
      dataSource: 'Risk Management System'
    }
  ])

  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      modelId: '1',
      targetMetric: 'Revenue Mensal',
      timeframe: 'Fevereiro 2025',
      predictedValue: 285000,
      confidenceLower: 265000,
      confidenceUpper: 305000,
      generatedAt: '2025-01-15T10:00:00Z',
      scenario: 'realistic',
      factors: ['Crescimento histórico', 'Campanhas de marketing', 'Sazonalidade']
    },
    {
      id: '2',
      modelId: '2',
      targetMetric: 'Taxa de Churn',
      timeframe: 'Próximos 30 dias',
      predictedValue: 5.2,
      confidenceLower: 4.1,
      confidenceUpper: 6.8,
      actualValue: 4.9,
      accuracy: 94.2,
      generatedAt: '2025-01-15T08:30:00Z',
      scenario: 'realistic',
      factors: ['Padrões de engajamento', 'Histórico de suporte', 'Ciclo de vida do cliente']
    },
    {
      id: '3',
      modelId: '3',
      targetMetric: 'Demanda de Produtos',
      timeframe: 'Q1 2025',
      predictedValue: 1520,
      confidenceLower: 1380,
      confidenceUpper: 1680,
      generatedAt: '2025-01-15T09:15:00Z',
      scenario: 'optimistic',
      factors: ['Tendências sazonais', 'Lançamentos de produtos', 'Estratégia de preços']
    }
  ])

  const [scenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Cenário Base 2025',
      description: 'Projeção baseada nas tendências atuais sem mudanças significativas',
      parameters: {
        market_growth: 3.5,
        marketing_budget: 50000,
        team_size: 25,
        price_increase: 0
      },
      predictions: [
        { metric: 'Revenue Anual', value: 3200000, change: 15.2 },
        { metric: 'Novos Clientes', value: 450, change: 12.8 },
        { metric: 'Churn Rate', value: 4.8, change: -8.5 }
      ],
      probability: 65,
      impact: 'medium',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Cenário Agressivo',
      description: 'Crescimento acelerado com investimento significativo em marketing e expansão',
      parameters: {
        market_growth: 5.8,
        marketing_budget: 120000,
        team_size: 40,
        price_increase: 8
      },
      predictions: [
        { metric: 'Revenue Anual', value: 4800000, change: 72.4 },
        { metric: 'Novos Clientes', value: 720, change: 80.0 },
        { metric: 'Churn Rate', value: 6.2, change: 12.7 }
      ],
      probability: 25,
      impact: 'high',
      createdAt: '2025-01-15T09:30:00Z'
    },
    {
      id: '3',
      name: 'Cenário Conservador',
      description: 'Crescimento moderado com foco em eficiência e redução de custos',
      parameters: {
        market_growth: 1.2,
        marketing_budget: 30000,
        team_size: 20,
        price_increase: 3
      },
      predictions: [
        { metric: 'Revenue Anual', value: 2950000, change: 6.1 },
        { metric: 'Novos Clientes', value: 320, change: -20.0 },
        { metric: 'Churn Rate', value: 3.8, change: -26.2 }
      ],
      probability: 35,
      impact: 'low',
      createdAt: '2025-01-15T11:00:00Z'
    }
  ])

  const [trendAnalyses] = useState<TrendAnalysis[]>([
    {
      metric: 'Revenue',
      direction: 'up',
      strength: 85,
      seasonality: true,
      cyclical: false,
      trend_coefficient: 0.12,
      r_squared: 0.94,
      forecast_horizon: 90,
      confidence: 92
    },
    {
      metric: 'Customer Acquisition',
      direction: 'up',
      strength: 72,
      seasonality: true,
      cyclical: true,
      trend_coefficient: 0.08,
      r_squared: 0.87,
      forecast_horizon: 60,
      confidence: 85
    },
    {
      metric: 'Operational Costs',
      direction: 'stable',
      strength: 45,
      seasonality: false,
      cyclical: false,
      trend_coefficient: 0.02,
      r_squared: 0.65,
      forecast_horizon: 120,
      confidence: 78
    }
  ])

  // Dados para gráficos
  const revenueForcastData = [
    { month: 'Set 2024', actual: 180000, predicted: null, lower: null, upper: null },
    { month: 'Out 2024', actual: 195000, predicted: null, lower: null, upper: null },
    { month: 'Nov 2024', actual: 210000, predicted: null, lower: null, upper: null },
    { month: 'Dez 2024', actual: 245000, predicted: null, lower: null, upper: null },
    { month: 'Jan 2025', actual: 220000, predicted: 218000, lower: 205000, upper: 235000 },
    { month: 'Fev 2025', actual: null, predicted: 285000, lower: 265000, upper: 305000 },
    { month: 'Mar 2025', actual: null, predicted: 298000, lower: 275000, upper: 320000 },
    { month: 'Abr 2025', actual: null, predicted: 315000, lower: 290000, upper: 340000 },
    { month: 'Mai 2025', actual: null, predicted: 335000, lower: 305000, upper: 365000 },
    { month: 'Jun 2025', actual: null, predicted: 350000, lower: 320000, upper: 380000 }
  ]

  const churnPredictionData = [
    { week: 'Sem 1', actual: 4.2, predicted: 4.1, threshold: 5.0 },
    { week: 'Sem 2', actual: 3.8, predicted: 3.9, threshold: 5.0 },
    { week: 'Sem 3', actual: 5.1, predicted: 4.8, threshold: 5.0 },
    { week: 'Sem 4', actual: 4.6, predicted: 4.5, threshold: 5.0 },
    { week: 'Sem 5', actual: null, predicted: 5.2, threshold: 5.0 },
    { week: 'Sem 6', actual: null, predicted: 4.9, threshold: 5.0 },
    { week: 'Sem 7', actual: null, predicted: 4.7, threshold: 5.0 },
    { week: 'Sem 8', actual: null, predicted: 4.5, threshold: 5.0 }
  ]

  const scenarioComparisonData = [
    { metric: 'Revenue', base: 3200000, aggressive: 4800000, conservative: 2950000 },
    { metric: 'Customers', base: 450, aggressive: 720, conservative: 320 },
    { metric: 'Costs', base: 1800000, aggressive: 2400000, conservative: 1600000 },
    { metric: 'Profit', base: 1400000, aggressive: 2400000, conservative: 1350000 }
  ]

  const modelAccuracyData = models.map(model => ({
    name: model.name,
    accuracy: model.accuracy,
    confidence: model.confidenceInterval,
    horizon: model.horizon
  }))

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
      case 'ready': return 'bg-green-100 text-green-800'
      case 'training': return 'bg-blue-100 text-blue-800'
      case 'predicting': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return CheckCircle
      case 'training': return RefreshCw
      case 'predicting': return Activity
      case 'error': return AlertTriangle
      default: return Clock
    }
  }

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'time_series': return LineChart
      case 'regression': return TrendingUp
      case 'classification': return Target
      case 'clustering': return Network
      case 'neural_network': return Brain
      default: return BarChart3
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      case 'stable': return Activity
      default: return Activity
    }
  }

  const getScenarioColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-300 bg-red-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      case 'low': return 'border-green-300 bg-green-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const ModelForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model-name">Nome do Modelo</Label>
          <Input 
            id="model-name"
            placeholder="Ex: Sales Forecaster"
            title="Nome do modelo preditivo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model-type">Tipo de Modelo</Label>
          <Select>
            <SelectTrigger title="Selecionar tipo de modelo">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time_series">Série Temporal</SelectItem>
              <SelectItem value="regression">Regressão</SelectItem>
              <SelectItem value="classification">Classificação</SelectItem>
              <SelectItem value="clustering">Clustering</SelectItem>
              <SelectItem value="neural_network">Rede Neural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target-variable">Variável Alvo</Label>
          <Input 
            id="target-variable"
            placeholder="Ex: monthly_revenue"
            title="Variável que será predita"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="forecast-horizon">Horizonte de Previsão (dias)</Label>
          <Input 
            id="forecast-horizon"
            type="number" 
            placeholder="90"
            title="Quantos dias no futuro prever"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Features/Variáveis</Label>
        <Textarea 
          id="features"
          placeholder="Lista as variáveis que influenciam a predição (uma por linha)"
          title="Variáveis independentes do modelo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="algorithm">Algoritmo</Label>
          <Select>
            <SelectTrigger title="Selecionar algoritmo">
              <SelectValue placeholder="Selecionar algoritmo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arima">ARIMA</SelectItem>
              <SelectItem value="prophet">Prophet</SelectItem>
              <SelectItem value="lstm">LSTM</SelectItem>
              <SelectItem value="random_forest">Random Forest</SelectItem>
              <SelectItem value="gradient_boost">Gradient Boosting</SelectItem>
              <SelectItem value="neural_network">Deep Neural Network</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confidence-interval">Intervalo de Confiança (%)</Label>
          <Input 
            id="confidence-interval"
            type="number" 
            placeholder="95"
            min="80"
            max="99"
            title="Intervalo de confiança para as predições"
          />
        </div>
      </div>
    </form>
  )

  const ScenarioForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="scenario-name">Nome do Cenário</Label>
        <Input 
          id="scenario-name"
          placeholder="Ex: Expansão Agressiva Q2"
          title="Nome do cenário de análise"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario-description">Descrição</Label>
        <Textarea 
          id="scenario-description"
          placeholder="Descreva as condições e premissas deste cenário"
          title="Descrição detalhada do cenário"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="market-growth">Crescimento de Mercado (%)</Label>
          <Input 
            id="market-growth"
            type="number" 
            placeholder="3.5"
            step="0.1"
            title="Taxa de crescimento do mercado"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marketing-budget">Orçamento Marketing</Label>
          <Input 
            id="marketing-budget"
            type="number" 
            placeholder="50000"
            title="Orçamento de marketing para o período"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="team-size">Tamanho da Equipe</Label>
          <Input 
            id="team-size"
            type="number" 
            placeholder="25"
            title="Número de funcionários"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price-change">Mudança de Preço (%)</Label>
          <Input 
            id="price-change"
            type="number" 
            placeholder="0"
            step="0.1"
            title="Percentual de mudança nos preços"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="probability">Probabilidade (%)</Label>
        <Input 
          id="probability"
          type="number" 
          placeholder="65"
          min="1"
          max="100"
          title="Probabilidade de ocorrência do cenário"
        />
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise Preditiva</h1>
          <p className="text-gray-600">Modelos de machine learning para previsões e cenários</p>
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
                <DialogTitle>Criar Modelo Preditivo</DialogTitle>
                <DialogDescription>
                  Configure um novo modelo de predição
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
          
          <Dialog open={isScenarioModalOpen} onOpenChange={setIsScenarioModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Novo Cenário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Cenário de Análise</DialogTitle>
                <DialogDescription>
                  Configure um novo cenário para simulação
                </DialogDescription>
              </DialogHeader>
              <ScenarioForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsScenarioModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsScenarioModalOpen(false)}>
                  Criar Cenário
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
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs das Predições */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
                <Brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {models.filter(m => m.status === 'ready').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {models.length} modelos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">
                  Todos os modelos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predições Ativas</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {predictions.length}
                </div>
                <p className="text-xs text-gray-600">
                  Geradas hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cenários</CardTitle>
                <Calculator className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {scenarios.length}
                </div>
                <p className="text-xs text-gray-600">
                  Simulações ativas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Previsão de Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Revenue</CardTitle>
              <CardDescription>Predição dos próximos 6 meses com intervalos de confiança</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={revenueForcastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value ? formatCurrency(Number(value)) : 'N/A'} />
                  <Area 
                    dataKey="upper" 
                    fill="#3b82f6" 
                    fillOpacity={0.1} 
                    stroke="none"
                    name="Limite Superior"
                  />
                  <Area 
                    dataKey="lower" 
                    fill="#ffffff" 
                    fillOpacity={1} 
                    stroke="none"
                    name="Limite Inferior"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                    name="Valor Real"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                    name="Predição"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Previsão de Churn */}
          <Card>
            <CardHeader>
              <CardTitle>Predição de Taxa de Churn</CardTitle>
              <CardDescription>Monitoramento semanal com threshold de alerta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={churnPredictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="threshold" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Threshold"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                    name="Real"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                    name="Predito"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparação de Cenários */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Cenários</CardTitle>
              <CardDescription>Impacto dos diferentes cenários nas métricas chave</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scenarioComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip formatter={(value) => 
                    typeof value === 'number' && value > 1000 ? formatCurrency(value) : value
                  } />
                  <Bar dataKey="conservative" fill="#10b981" name="Conservador" />
                  <Bar dataKey="base" fill="#3b82f6" name="Base" />
                  <Bar dataKey="aggressive" fill="#f59e0b" name="Agressivo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* Lista de Modelos */}
          <div className="grid gap-6">
            {models.map((model) => {
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
                          <p className="text-gray-600 capitalize">
                            {model.type.replace('_', ' ')} • {model.algorithm}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Target: {model.target}
                            </span>
                            <span className="text-sm text-gray-500">
                              Horizonte: {model.horizon} dias
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
                          {model.accuracy}% precisão
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Precisão</p>
                        <p className="text-lg font-bold text-blue-600">{model.accuracy}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Confiança</p>
                        <p className="text-lg font-bold text-green-600">{model.confidenceInterval}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Features</p>
                        <p className="text-lg font-bold text-purple-600">{model.features.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Fonte</p>
                        <p className="text-sm font-medium text-gray-700">{model.dataSource}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Features Utilizadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {model.features.map((feature, index) => (
                            <Badge key={index} variant="outline">
                              {feature.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-2">
                          {model.status === 'ready' && (
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Executar Predição
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
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Métricas
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Exportar
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

        <TabsContent value="predictions" className="space-y-6">
          {/* Predições Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Predições Ativas</CardTitle>
              <CardDescription>Últimas predições geradas pelos modelos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction) => {
                  const model = models.find(m => m.id === prediction.modelId)
                  const errorMargin = ((prediction.confidenceUpper - prediction.confidenceLower) / prediction.predictedValue) * 100

                  return (
                    <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full bg-${prediction.scenario === 'optimistic' ? 'green' : prediction.scenario === 'pessimistic' ? 'red' : 'blue'}-100`}>
                          <TrendingUp className={`h-4 w-4 text-${prediction.scenario === 'optimistic' ? 'green' : prediction.scenario === 'pessimistic' ? 'red' : 'blue'}-600`} />
                        </div>
                        <div>
                          <p className="font-medium">{prediction.targetMetric}</p>
                          <p className="text-sm text-gray-600">
                            {model?.name} • {prediction.timeframe}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Gerado: {formatDateTime(prediction.generatedAt)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Margem: ±{errorMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold text-blue-600">
                          {prediction.targetMetric.includes('Revenue') || prediction.targetMetric.includes('Custo') 
                            ? formatCurrency(prediction.predictedValue) 
                            : `${prediction.predictedValue}${prediction.targetMetric.includes('Taxa') ? '%' : ''}`
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          {prediction.targetMetric.includes('Revenue') || prediction.targetMetric.includes('Custo')
                            ? `${formatCurrency(prediction.confidenceLower)} - ${formatCurrency(prediction.confidenceUpper)}`
                            : `${prediction.confidenceLower} - ${prediction.confidenceUpper}${prediction.targetMetric.includes('Taxa') ? '%' : ''}`
                          }
                        </div>
                        {prediction.actualValue && (
                          <div className="text-sm">
                            <span className="text-green-600">Real: {prediction.actualValue}</span>
                            <span className="text-gray-500 ml-2">({prediction.accuracy}% precisão)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-1 ml-4">
                        <Badge variant="outline" className={`text-${prediction.scenario === 'optimistic' ? 'green' : prediction.scenario === 'pessimistic' ? 'red' : 'blue'}-700`}>
                          {prediction.scenario}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Fatores das Predições */}
          <Card>
            <CardHeader>
              <CardTitle>Fatores Influenciadores</CardTitle>
              <CardDescription>Principais variáveis que impactam as predições</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{prediction.targetMetric}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {prediction.factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Lista de Cenários */}
          <div className="grid gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className={`border-l-4 ${getScenarioColor(scenario.impact)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-xl">{scenario.name}</h3>
                      <p className="text-gray-600 mt-2">{scenario.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {scenario.probability}% probabilidade
                      </Badge>
                      <Badge variant="outline" className={
                        scenario.impact === 'high' ? 'border-red-300 text-red-700' :
                        scenario.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }>
                        {scenario.impact} impacto
                      </Badge>
                    </div>
                  </div>

                  {/* Parâmetros do Cenário */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {Object.entries(scenario.parameters).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-lg font-bold">
                          {key.includes('budget') ? formatCurrency(value) : 
                           key.includes('growth') || key.includes('increase') ? `${value}%` : 
                           value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Predições do Cenário */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold">Impacto Previsto:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {scenario.predictions.map((pred, index) => (
                        <div key={index} className="text-center p-3 bg-white rounded-lg border">
                          <p className="text-sm text-gray-600">{pred.metric}</p>
                          <p className="text-lg font-bold">
                            {pred.metric.includes('Revenue') || pred.metric.includes('Custo') 
                              ? formatCurrency(pred.value) 
                              : `${pred.value}${pred.metric.includes('Rate') ? '%' : ''}`
                            }
                          </p>
                          <p className={`text-sm ${pred.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {pred.change >= 0 ? '+' : ''}{pred.change.toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-gray-500">
                      Criado em: {formatDateTime(scenario.createdAt)}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Simular
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Análise de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>Padrões detectados automaticamente nos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendAnalyses.map((trend, index) => {
                  const TrendIcon = getTrendIcon(trend.direction)

                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          trend.direction === 'up' ? 'bg-green-100' : 
                          trend.direction === 'down' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <TrendIcon className={`h-4 w-4 ${
                            trend.direction === 'up' ? 'text-green-600' : 
                            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{trend.metric}</p>
                          <p className="text-sm text-gray-600">
                            Tendência {trend.direction === 'up' ? 'crescente' : trend.direction === 'down' ? 'decrescente' : 'estável'}
                            {trend.seasonality && ' • Sazonal'}
                            {trend.cyclical && ' • Cíclico'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Força</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={trend.strength} className="w-16 h-2" />
                            <span className="text-sm font-medium">{trend.strength}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">R²</p>
                          <p className="text-sm font-bold">{trend.r_squared.toFixed(3)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confiança</p>
                          <p className="text-sm font-bold">{trend.confidence}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Horizonte</p>
                          <p className="text-sm font-bold">{trend.forecast_horizon} dias</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Analisar
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Projetar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          {/* Validação dos Modelos */}
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Modelos</CardTitle>
              <CardDescription>Métricas de precisão e validação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Precisão %" />
                  <Bar dataKey="confidence" fill="#10b981" name="Confiança %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas Detalhadas */}
          <div className="grid gap-6">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>Métricas de validação e performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Precisão</p>
                      <div className="text-2xl font-bold text-blue-600">{model.accuracy}%</div>
                      <Progress value={model.accuracy} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Confiança</p>
                      <div className="text-2xl font-bold text-green-600">{model.confidenceInterval}%</div>
                      <Progress value={model.confidenceInterval} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Horizonte</p>
                      <div className="text-2xl font-bold text-purple-600">{model.horizon}</div>
                      <p className="text-xs text-gray-500">dias</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Features</p>
                      <div className="text-2xl font-bold text-orange-600">{model.features.length}</div>
                      <p className="text-xs text-gray-500">variáveis</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PredictiveAnalytics
