'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calculator,
  PieChart,
  BarChart3,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  Percent,
  Globe,
  Users,
  Building,
  CreditCard,
  Wallet
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Cell, 
  AreaChart, 
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts'

// Tipos de dados para análise financeira
interface FinancialIndicator {
  id: string
  name: string
  value: number
  previousValue: number
  target?: number
  unit: 'currency' | 'percentage' | 'number'
  category: 'liquidez' | 'rentabilidade' | 'endividamento' | 'atividade'
  description: string
  formula: string
  interpretation: 'melhor-maior' | 'melhor-menor' | 'neutro'
}

interface CashFlowProjection {
  period: string
  entrada: number
  saida: number
  saldo: number
  acumulado: number
  confidence: number
}

interface FinancialRatio {
  name: string
  current: number
  benchmark: number
  industry: number
  status: 'excelente' | 'bom' | 'regular' | 'ruim'
}

interface ProfitabilityAnalysis {
  period: string
  receita: number
  custos: number
  despesasOperacionais: number
  despesasFinanceiras: number
  lucroOperacional: number
  lucroLiquido: number
  margemBruta: number
  margemOperacional: number
  margemLiquida: number
}

const FinancialAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('indicadores')
  const [selectedPeriod, setSelectedPeriod] = useState('anual')
  const [comparisonMode, setComparisonMode] = useState('periodo-anterior')

  // Dados mock para demonstração
  const [indicators] = useState<FinancialIndicator[]>([
    {
      id: '1',
      name: 'Liquidez Corrente',
      value: 2.5,
      previousValue: 2.1,
      target: 2.0,
      unit: 'number',
      category: 'liquidez',
      description: 'Capacidade da empresa de pagar suas obrigações de curto prazo',
      formula: 'Ativo Circulante ÷ Passivo Circulante',
      interpretation: 'melhor-maior'
    },
    {
      id: '2',
      name: 'ROE (Return on Equity)',
      value: 18.5,
      previousValue: 15.2,
      target: 20.0,
      unit: 'percentage',
      category: 'rentabilidade',
      description: 'Retorno sobre o patrimônio líquido',
      formula: 'Lucro Líquido ÷ Patrimônio Líquido × 100',
      interpretation: 'melhor-maior'
    },
    {
      id: '3',
      name: 'Margem EBITDA',
      value: 22.8,
      previousValue: 20.1,
      target: 25.0,
      unit: 'percentage',
      category: 'rentabilidade',
      description: 'Margem de lucro antes de juros, impostos, depreciação e amortização',
      formula: 'EBITDA ÷ Receita Líquida × 100',
      interpretation: 'melhor-maior'
    },
    {
      id: '4',
      name: 'Índice de Endividamento',
      value: 35.2,
      previousValue: 38.7,
      target: 30.0,
      unit: 'percentage',
      category: 'endividamento',
      description: 'Proporção de dívidas em relação ao patrimônio total',
      formula: 'Passivo Total ÷ Ativo Total × 100',
      interpretation: 'melhor-menor'
    },
    {
      id: '5',
      name: 'Giro do Ativo',
      value: 1.8,
      previousValue: 1.6,
      target: 2.0,
      unit: 'number',
      category: 'atividade',
      description: 'Eficiência na utilização dos ativos para gerar receita',
      formula: 'Receita Líquida ÷ Ativo Total',
      interpretation: 'melhor-maior'
    },
    {
      id: '6',
      name: 'Prazo Médio de Recebimento',
      value: 28,
      previousValue: 32,
      target: 25,
      unit: 'number',
      category: 'atividade',
      description: 'Tempo médio para receber das vendas a prazo (em dias)',
      formula: 'Contas a Receber ÷ Vendas × 365',
      interpretation: 'melhor-menor'
    }
  ])

  const [cashFlowProjections] = useState<CashFlowProjection[]>([
    { period: 'Jan 2025', entrada: 150000, saida: 120000, saldo: 30000, acumulado: 30000, confidence: 95 },
    { period: 'Fev 2025', entrada: 165000, saida: 125000, saldo: 40000, acumulado: 70000, confidence: 92 },
    { period: 'Mar 2025', entrada: 180000, saida: 135000, saldo: 45000, acumulado: 115000, confidence: 88 },
    { period: 'Abr 2025', entrada: 170000, saida: 140000, saldo: 30000, acumulado: 145000, confidence: 85 },
    { period: 'Mai 2025', entrada: 185000, saida: 145000, saldo: 40000, acumulado: 185000, confidence: 80 },
    { period: 'Jun 2025', entrada: 195000, saida: 150000, saldo: 45000, acumulado: 230000, confidence: 75 }
  ])

  const [financialRatios] = useState<FinancialRatio[]>([
    { name: 'Liquidez Corrente', current: 2.5, benchmark: 2.0, industry: 1.8, status: 'excelente' },
    { name: 'ROE', current: 18.5, benchmark: 15.0, industry: 12.5, status: 'excelente' },
    { name: 'ROA', current: 12.3, benchmark: 10.0, industry: 8.5, status: 'bom' },
    { name: 'Margem Líquida', current: 15.2, benchmark: 12.0, industry: 10.0, status: 'excelente' },
    { name: 'Debt-to-Equity', current: 0.52, benchmark: 0.60, industry: 0.75, status: 'bom' },
    { name: 'Current Ratio', current: 1.85, benchmark: 2.00, industry: 1.50, status: 'regular' }
  ])

  const [profitabilityData] = useState<ProfitabilityAnalysis[]>([
    {
      period: '2024 Q1',
      receita: 450000,
      custos: 225000,
      despesasOperacionais: 135000,
      despesasFinanceiras: 15000,
      lucroOperacional: 90000,
      lucroLiquido: 75000,
      margemBruta: 50.0,
      margemOperacional: 20.0,
      margemLiquida: 16.7
    },
    {
      period: '2024 Q2',
      receita: 520000,
      custos: 260000,
      despesasOperacionais: 145000,
      despesasFinanceiras: 18000,
      lucroOperacional: 115000,
      lucroLiquido: 97000,
      margemBruta: 50.0,
      margemOperacional: 22.1,
      margemLiquida: 18.7
    },
    {
      period: '2024 Q3',
      receita: 580000,
      custos: 290000,
      despesasOperacionais: 160000,
      despesasFinanceiras: 20000,
      lucroOperacional: 130000,
      lucroLiquida: 110000,
      margemBruta: 50.0,
      margemOperacional: 22.4,
      margemLiquida: 19.0
    },
    {
      period: '2024 Q4',
      receita: 650000,
      custos: 325000,
      despesasOperacionais: 175000,
      despesasFinanceiras: 22000,
      lucroOperacional: 150000,
      lucroLiquido: 128000,
      margemBruta: 50.0,
      margemOperacional: 23.1,
      margemLiquida: 19.7
    }
  ])

  // Dados para análise de tendências
  const trendData = [
    { mes: 'Jan', receita: 120000, despesas: 85000, lucro: 35000, roi: 15.2 },
    { mes: 'Fev', receita: 135000, despesas: 90000, lucro: 45000, roi: 16.8 },
    { mes: 'Mar', receita: 150000, despesas: 95000, lucro: 55000, roi: 18.1 },
    { mes: 'Abr', receita: 145000, despesas: 92000, lucro: 53000, roi: 17.9 },
    { mes: 'Mai', receita: 165000, despesas: 98000, lucro: 67000, roi: 19.5 },
    { mes: 'Jun', receita: 180000, despesas: 105000, lucro: 75000, roi: 20.8 }
  ]

  // Dados para análise de segmentos
  const segmentData = [
    { segment: 'Turismo Nacional', receita: 450000, custo: 225000, margem: 50.0, participacao: 35 },
    { segment: 'Turismo Internacional', receita: 380000, custo: 228000, margem: 40.0, participacao: 30 },
    { segment: 'Eventos Corporativos', receita: 320000, custo: 192000, margem: 40.0, participacao: 25 },
    { segment: 'Consultoria', receita: 125000, custo: 50000, margem: 60.0, participacao: 10 }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getIndicatorTrend = (current: number, previous: number, interpretation: string) => {
    const isImproving = interpretation === 'melhor-maior' 
      ? current > previous 
      : current < previous
    
    return {
      isImproving,
      change: ((current - previous) / previous) * 100,
      icon: isImproving ? ArrowUpRight : ArrowDownRight,
      color: isImproving ? 'text-green-600' : 'text-red-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelente': return 'bg-green-100 text-green-800'
      case 'bom': return 'bg-blue-100 text-blue-800'
      case 'regular': return 'bg-yellow-100 text-yellow-800'
      case 'ruim': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'liquidez': return Wallet
      case 'rentabilidade': return TrendingUp
      case 'endividamento': return CreditCard
      case 'atividade': return Activity
      default: return Calculator
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise Financeira</h1>
          <p className="text-gray-600">Indicadores e insights para tomada de decisão</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40" title="Selecionar período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="projecoes">Projeções</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="segmentos">Segmentos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="indicadores" className="space-y-6">
          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saúde Financeira</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Boa</div>
                <p className="text-xs text-gray-600">85% dos indicadores positivos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROE Atual</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">18.5%</div>
                <p className="text-xs text-gray-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                  +3.3% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Liquidez Corrente</CardTitle>
                <Wallet className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">2.5</div>
                <p className="text-xs text-gray-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                  +0.4 vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Endividamento</CardTitle>
                <CreditCard className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">35.2%</div>
                <p className="text-xs text-gray-600 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1 text-green-600" />
                  -3.5% vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Grid de Indicadores */}
          <div className="grid gap-6">
            {['liquidez', 'rentabilidade', 'endividamento', 'atividade'].map(category => {
              const categoryIndicators = indicators.filter(ind => ind.category === category)
              const CategoryIcon = getCategoryIcon(category)

              return (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="h-5 w-5" />
                      <CardTitle className="capitalize">{category}</CardTitle>
                    </div>
                    <CardDescription>
                      {category === 'liquidez' && 'Capacidade de pagamento de obrigações'}
                      {category === 'rentabilidade' && 'Capacidade de gerar lucros'}
                      {category === 'endividamento' && 'Estrutura de capital e dívidas'}
                      {category === 'atividade' && 'Eficiência operacional'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryIndicators.map(indicator => {
                        const trend = getIndicatorTrend(indicator.value, indicator.previousValue, indicator.interpretation)
                        const TrendIcon = trend.icon
                        const targetProgress = indicator.target 
                          ? (indicator.value / indicator.target) * 100 
                          : 100

                        return (
                          <div key={indicator.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{indicator.name}</h4>
                                <p className="text-sm text-gray-600">{indicator.description}</p>
                              </div>
                              <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-end space-x-2">
                                <span className="text-2xl font-bold">
                                  {indicator.unit === 'currency' && formatCurrency(indicator.value)}
                                  {indicator.unit === 'percentage' && formatPercentage(indicator.value)}
                                  {indicator.unit === 'number' && indicator.value.toFixed(2)}
                                </span>
                                <span className={`text-sm ${trend.color}`}>
                                  {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                                </span>
                              </div>

                              {indicator.target && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>Meta: {
                                      indicator.unit === 'currency' ? formatCurrency(indicator.target) :
                                      indicator.unit === 'percentage' ? formatPercentage(indicator.target) :
                                      indicator.target.toFixed(2)
                                    }</span>
                                    <span>{targetProgress.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={Math.min(targetProgress, 100)} className="h-2" />
                                </div>
                              )}

                              <div className="text-xs text-gray-500 mt-2">
                                <p className="font-medium">Fórmula:</p>
                                <p>{indicator.formula}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-6">
          {/* Gráfico de Tendências Principais */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução dos Indicadores Principais</CardTitle>
              <CardDescription>Tendência de receita, despesas e lucro ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'roi' ? `${value}%` : formatCurrency(Number(value)),
                    name === 'receita' ? 'Receita' :
                    name === 'despesas' ? 'Despesas' :
                    name === 'lucro' ? 'Lucro' : 'ROI'
                  ]} />
                  <Bar yAxisId="left" dataKey="receita" fill="#10b981" name="receita" />
                  <Bar yAxisId="left" dataKey="despesas" fill="#ef4444" name="despesas" />
                  <Bar yAxisId="left" dataKey="lucro" fill="#3b82f6" name="lucro" />
                  <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#f59e0b" strokeWidth={3} name="roi" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Análise de Lucratividade */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Lucratividade</CardTitle>
              <CardDescription>Evolução das margens de lucro por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={profitabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="margemBruta" stroke="#10b981" strokeWidth={2} name="Margem Bruta" />
                  <Line type="monotone" dataKey="margemOperacional" stroke="#3b82f6" strokeWidth={2} name="Margem Operacional" />
                  <Line type="monotone" dataKey="margemLiquida" stroke="#8b5cf6" strokeWidth={2} name="Margem Líquida" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Crescimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Crescimento de Receita</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 25.3 }]}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockwise
                        dataKey="value"
                        fill="#10b981"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">+25.3%</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">vs ano anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Crescimento do Lucro</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 32.1 }]}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockwise
                        dataKey="value"
                        fill="#3b82f6"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">+32.1%</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">vs ano anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Eficiência Operacional</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 88.5 }]}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockwise
                        dataKey="value"
                        fill="#f59e0b"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">88.5%</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">índice geral</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projecoes" className="space-y-6">
          {/* Projeção de Fluxo de Caixa */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
              <CardDescription>Previsão para os próximos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={cashFlowProjections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="entrada" fill="#10b981" name="Entradas" />
                  <Bar dataKey="saida" fill="#ef4444" name="Saídas" />
                  <Line type="monotone" dataKey="acumulado" stroke="#3b82f6" strokeWidth={3} name="Saldo Acumulado" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detalhes das Projeções */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes das Projeções</CardTitle>
              <CardDescription>Análise detalhada por período com nível de confiança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Período</th>
                      <th className="text-right py-2">Entradas</th>
                      <th className="text-right py-2">Saídas</th>
                      <th className="text-right py-2">Saldo</th>
                      <th className="text-right py-2">Acumulado</th>
                      <th className="text-right py-2">Confiança</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowProjections.map((projection, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">{projection.period}</td>
                        <td className="text-right py-3 text-green-600">{formatCurrency(projection.entrada)}</td>
                        <td className="text-right py-3 text-red-600">{formatCurrency(projection.saida)}</td>
                        <td className={`text-right py-3 font-medium ${projection.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(projection.saldo)}
                        </td>
                        <td className="text-right py-3 font-bold text-blue-600">{formatCurrency(projection.acumulado)}</td>
                        <td className="text-right py-3">
                          <div className="flex items-center justify-end space-x-2">
                            <Progress value={projection.confidence} className="w-16 h-2" />
                            <span className="text-sm">{projection.confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cenários de Projeção */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Cenário Otimista</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(280000)}
                </div>
                <p className="text-gray-600">Saldo em 6 meses</p>
                <p className="text-sm text-green-600 mt-2">+22% vs projeção base</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Probabilidade:</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Cenário Base</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(230000)}
                </div>
                <p className="text-gray-600">Saldo em 6 meses</p>
                <p className="text-sm text-blue-600 mt-2">Projeção mais provável</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Probabilidade:</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Cenário Pessimista</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {formatCurrency(180000)}
                </div>
                <p className="text-gray-600">Saldo em 6 meses</p>
                <p className="text-sm text-red-600 mt-2">-22% vs projeção base</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Probabilidade:</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          {/* Comparação com Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação com Benchmarks</CardTitle>
              <CardDescription>Seus indicadores vs mercado e melhores práticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {financialRatios.map((ratio, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{ratio.name}</h4>
                      <Badge className={getStatusColor(ratio.status)}>
                        {ratio.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sua empresa</span>
                        <span className="font-bold text-blue-600">
                          {ratio.name.includes('%') || ratio.name.includes('Margem') 
                            ? `${ratio.current}%` 
                            : ratio.current.toFixed(2)
                          }
                        </span>
                      </div>
                      <Progress value={(ratio.current / Math.max(ratio.current, ratio.benchmark, ratio.industry)) * 100} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Benchmark:</span>
                          <span className="font-medium">
                            {ratio.name.includes('%') || ratio.name.includes('Margem') 
                              ? `${ratio.benchmark}%` 
                              : ratio.benchmark.toFixed(2)
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Média do Setor:</span>
                          <span className="font-medium">
                            {ratio.name.includes('%') || ratio.name.includes('Margem') 
                              ? `${ratio.industry}%` 
                              : ratio.industry.toFixed(2)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ranking de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking no Setor</CardTitle>
                <CardDescription>Posição vs concorrentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Rentabilidade', position: 8, total: 50, percentile: 84 },
                    { metric: 'Liquidez', position: 12, total: 50, percentile: 76 },
                    { metric: 'Eficiência', position: 15, total: 50, percentile: 70 },
                    { metric: 'Crescimento', position: 6, total: 50, percentile: 88 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.metric}</p>
                        <p className="text-sm text-gray-600">
                          {item.position}º de {item.total} empresas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{item.percentile}º percentil</p>
                        <Progress value={item.percentile} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pontos Fortes e Fracos</CardTitle>
                <CardDescription>Análise comparativa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Pontos Fortes</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ROE 48% acima da média do setor
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Crescimento de receita consistente
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Baixo endividamento relativo
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Áreas de Melhoria</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        Liquidez corrente abaixo do benchmark
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        Giro de estoque pode melhorar
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        Prazo de recebimento acima da média
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segmentos" className="space-y-6">
          {/* Análise por Segmento */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Segmento de Negócio</CardTitle>
              <CardDescription>Análise de rentabilidade e participação por área</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={segmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="participacao" name="Participação %" />
                  <YAxis dataKey="margem" name="Margem %" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{data.segment}</p>
                            <p className="text-sm">Receita: {formatCurrency(data.receita)}</p>
                            <p className="text-sm">Margem: {data.margem}%</p>
                            <p className="text-sm">Participação: {data.participacao}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter name="Segmentos" dataKey="margem" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detalhes por Segmento */}
          <div className="grid gap-6">
            {segmentData.map((segment, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
              const lucro = segment.receita - segment.custo

              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${colors[index % colors.length]}`}>
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{segment.segment}</h3>
                          <p className="text-gray-600">{segment.participacao}% da receita total</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {segment.margem}% margem
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Receita</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(segment.receita)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Custo</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(segment.custo)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Lucro</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(lucro)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="text-lg font-bold text-purple-600">
                          {((lucro / segment.custo) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participação na receita total</span>
                        <span>{segment.participacao}%</span>
                      </div>
                      <Progress value={segment.participacao} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Insights Automáticos */}
          <Card>
            <CardHeader>
              <CardTitle>Insights e Recomendações</CardTitle>
              <CardDescription>Análises automáticas baseadas em IA financeira</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Oportunidade Identificada</h4>
                  </div>
                  <p className="text-green-700 mb-2">
                    O segmento de Consultoria apresenta a maior margem de lucro (60%) mas representa apenas 10% da receita.
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Recomendação: Investir em expansão deste segmento pode aumentar a rentabilidade geral em até 15%.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Tendência Positiva</h4>
                  </div>
                  <p className="text-blue-700 mb-2">
                    ROE cresceu 22% nos últimos 6 meses, superando o benchmark do setor.
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    Recomendação: Manter estratégias atuais e considerar acelerar investimentos.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Atenção Necessária</h4>
                  </div>
                  <p className="text-yellow-700 mb-2">
                    Prazo médio de recebimento (28 dias) está acima do ideal para o setor (25 dias).
                  </p>
                  <p className="text-sm text-yellow-600 font-medium">
                    Recomendação: Implementar políticas de cobrança mais ágeis ou oferecer descontos para pagamento à vista.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Projeção Estratégica</h4>
                  </div>
                  <p className="text-purple-700 mb-2">
                    Com base no crescimento atual, a empresa pode atingir {formatCurrency(2800000)} de receita anual.
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    Recomendação: Preparar infraestrutura para crescimento de 40% e revisar capacidade operacional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano de Ação */}
          <Card>
            <CardHeader>
              <CardTitle>Plano de Ação Recomendado</CardTitle>
              <CardDescription>Próximos passos para otimização financeira</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    priority: 'alta',
                    action: 'Otimizar gestão de recebíveis',
                    description: 'Implementar sistema de cobrança automatizada',
                    impact: 'Redução de 3-5 dias no PMR',
                    deadline: '30 dias'
                  },
                  {
                    priority: 'alta',
                    action: 'Expandir segmento de consultoria',
                    description: 'Contratar 2 consultores especializados',
                    impact: 'Aumento de 8-12% na margem geral',
                    deadline: '60 dias'
                  },
                  {
                    priority: 'media',
                    action: 'Renegociar contratos de fornecedores',
                    description: 'Revisar principais contratos para redução de custos',
                    impact: 'Economia de 5-8% nos custos operacionais',
                    deadline: '90 dias'
                  },
                  {
                    priority: 'baixa',
                    action: 'Implementar centro de custos detalhado',
                    description: 'Melhorar rastreabilidade de gastos por projeto',
                    impact: 'Melhoria na precisão de análises',
                    deadline: '120 dias'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      item.priority === 'alta' ? 'bg-red-500' :
                      item.priority === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.action}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <Badge variant="outline" className={
                          item.priority === 'alta' ? 'border-red-200 text-red-800' :
                          item.priority === 'media' ? 'border-yellow-200 text-yellow-800' :
                          'border-green-200 text-green-800'
                        }>
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Impacto esperado:</span>
                          <p className="font-medium">{item.impact}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Prazo:</span>
                          <p className="font-medium">{item.deadline}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Simulador de Cenários */}
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Impacto</CardTitle>
              <CardDescription>Simule o impacto de diferentes ações nos indicadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Cenário: Redução PMR em 5 dias</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Liquidez Corrente:</span>
                      <span className="font-medium text-green-600">2.5 → 2.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fluxo de Caixa:</span>
                      <span className="font-medium text-green-600">+{formatCurrency(45000)}</span>
                    </div>
                    <Button size="sm" className="w-full">Simular</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Cenário: Expansão Consultoria</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Margem Líquida:</span>
                      <span className="font-medium text-green-600">19.7% → 22.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ROE:</span>
                      <span className="font-medium text-green-600">18.5% → 21.2%</span>
                    </div>
                    <Button size="sm" className="w-full">Simular</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Cenário: Redução Custos 5%</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Margem Operacional:</span>
                      <span className="font-medium text-green-600">23.1% → 25.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lucro Anual:</span>
                      <span className="font-medium text-green-600">+{formatCurrency(125000)}</span>
                    </div>
                    <Button size="sm" className="w-full">Simular</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialAnalytics
