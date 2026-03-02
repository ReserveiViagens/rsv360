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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Target,
  Zap,
  Clock,
  Calendar,
  Download,
  Upload,
  Database,
  Server,
  Cloud,
  Archive,
  RefreshCw,
  Settings,
  Eye,
  Filter,
  Search,
  FileText,
  PieChart,
  LineChart,
  AreaChart,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Star,
  Bookmark,
  Share,
  ExternalLink,
  Maximize,
  Minimize,
  Copy,
  Edit,
  Trash2,
  Plus,
  Save,
  Users,
  Building,
  Globe,
  Shield,
  Lock,
  Network,
  Router,
  Monitor,
  HardDrive,
  Memory,
  Cpu,
  Wifi
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart as RechartsAreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart,
  RechartsTooltip
} from 'recharts'

// Tipos para Backup Analytics
interface BackupAnalytics {
  period: {
    start: string
    end: string
    type: 'day' | 'week' | 'month' | 'quarter' | 'year'
  }
  overview: {
    totalBackups: number
    successfulBackups: number
    failedBackups: number
    totalDataBackedUp: number // GB
    averageBackupTime: number // minutes
    successRate: number // percentage
    compressionRatio: number // percentage
    costSavings: number // currency
  }
  trends: {
    timestamp: string
    backupsExecuted: number
    dataVolume: number // GB
    duration: number // minutes
    successRate: number // percentage
    cost: number
  }[]
  performance: {
    avgThroughput: number // MB/s
    avgCompressionRatio: number // percentage
    avgRecoveryTime: number // minutes
    uptimePercentage: number
    errorRate: number // errors/hour
  }
  storage: {
    totalUsed: number // GB
    totalAvailable: number // GB
    distributionByType: {
      database: number
      application: number
      files: number
      logs: number
      media: number
    }
    distributionByLocation: {
      local: number
      cloud: number
      hybrid: number
    }
    costAnalysis: {
      storageCost: number
      transferCost: number
      operationalCost: number
      totalCost: number
      currency: string
    }
  }
  reliability: {
    mtbf: number // Mean Time Between Failures (hours)
    mttr: number // Mean Time To Recovery (minutes)
    availabilityPercentage: number
    rtoCompliance: number // percentage
    rpoCompliance: number // percentage
  }
  security: {
    encryptedBackups: number
    unencryptedBackups: number
    accessAudits: number
    securityIncidents: number
    complianceScore: number // percentage
  }
}

interface BackupReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom'
  description: string
  generatedAt: string
  period: {
    start: string
    end: string
  }
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  sections: string[]
  status: 'generating' | 'completed' | 'failed' | 'scheduled'
  size: number // bytes
  downloadUrl?: string
}

interface BackupKPI {
  id: string
  name: string
  description: string
  value: number
  unit: string
  target: number
  status: 'on_track' | 'at_risk' | 'critical'
  trend: 'up' | 'down' | 'stable'
  category: 'performance' | 'reliability' | 'cost' | 'security'
  lastUpdated: string
}

interface BackupForecast {
  period: string
  predictedDataGrowth: number // GB
  predictedCosts: number
  predictedStorageNeeds: number // GB
  confidence: number // percentage
  factors: string[]
}

const BackupAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedMetric, setSelectedMetric] = useState('all')

  // Dados mock para demonstração
  const [analytics] = useState<BackupAnalytics>({
    period: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-31T23:59:59Z',
      type: 'month'
    },
    overview: {
      totalBackups: 1247,
      successfulBackups: 1215,
      failedBackups: 32,
      totalDataBackedUp: 3480, // GB
      averageBackupTime: 28,
      successRate: 97.4,
      compressionRatio: 78,
      costSavings: 12450
    },
    trends: [
      { timestamp: '2025-01-01', backupsExecuted: 42, dataVolume: 125, duration: 28, successRate: 95.2, cost: 340 },
      { timestamp: '2025-01-02', backupsExecuted: 38, dataVolume: 118, duration: 26, successRate: 97.4, cost: 325 },
      { timestamp: '2025-01-03', backupsExecuted: 45, dataVolume: 132, duration: 31, successRate: 95.6, cost: 365 },
      { timestamp: '2025-01-04', backupsExecuted: 41, dataVolume: 128, duration: 29, successRate: 97.6, cost: 355 },
      { timestamp: '2025-01-05', backupsExecuted: 43, dataVolume: 130, duration: 27, successRate: 98.8, cost: 360 },
      { timestamp: '2025-01-06', backupsExecuted: 39, dataVolume: 115, duration: 25, successRate: 97.4, cost: 318 },
      { timestamp: '2025-01-07', backupsExecuted: 44, dataVolume: 135, duration: 30, successRate: 95.5, cost: 375 }
    ],
    performance: {
      avgThroughput: 125, // MB/s
      avgCompressionRatio: 78,
      avgRecoveryTime: 15,
      uptimePercentage: 99.8,
      errorRate: 0.2
    },
    storage: {
      totalUsed: 2450, // GB
      totalAvailable: 5000, // GB
      distributionByType: {
        database: 1200,
        application: 580,
        files: 420,
        logs: 180,
        media: 70
      },
      distributionByLocation: {
        local: 980,
        cloud: 1250,
        hybrid: 220
      },
      costAnalysis: {
        storageCost: 850,
        transferCost: 320,
        operationalCost: 180,
        totalCost: 1350,
        currency: 'USD'
      }
    },
    reliability: {
      mtbf: 720, // hours
      mttr: 12, // minutes
      availabilityPercentage: 99.83,
      rtoCompliance: 95.2,
      rpoCompliance: 98.7
    },
    security: {
      encryptedBackups: 1215,
      unencryptedBackups: 32,
      accessAudits: 450,
      securityIncidents: 2,
      complianceScore: 96.5
    }
  })

  const [backupReports] = useState<BackupReport[]>([
    {
      id: '1',
      name: 'Relatório Mensal de Backup - Janeiro 2025',
      type: 'monthly',
      description: 'Relatório completo de atividades de backup do mês',
      generatedAt: '2025-02-01T00:00:00Z',
      period: {
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-31T23:59:59Z'
      },
      recipients: ['admin@rsv.com', 'backup-team@rsv.com'],
      format: 'pdf',
      sections: ['overview', 'performance', 'storage', 'reliability', 'security'],
      status: 'completed',
      size: 2485000, // bytes
      downloadUrl: '/reports/backup-monthly-jan-2025.pdf'
    },
    {
      id: '2',
      name: 'Relatório Semanal de Performance',
      type: 'weekly',
      description: 'Análise semanal de performance de backup',
      generatedAt: '2025-01-29T00:00:00Z',
      period: {
        start: '2025-01-22T00:00:00Z',
        end: '2025-01-28T23:59:59Z'
      },
      recipients: ['performance-team@rsv.com'],
      format: 'excel',
      sections: ['performance', 'trends'],
      status: 'completed',
      size: 1250000,
      downloadUrl: '/reports/backup-weekly-performance.xlsx'
    },
    {
      id: '3',
      name: 'Relatório de Custos Q1 2025',
      type: 'quarterly',
      description: 'Análise de custos trimestrais',
      generatedAt: '2025-01-31T00:00:00Z',
      period: {
        start: '2025-01-01T00:00:00Z',
        end: '2025-03-31T23:59:59Z'
      },
      recipients: ['finance@rsv.com', 'admin@rsv.com'],
      format: 'pdf',
      sections: ['storage', 'costs'],
      status: 'generating',
      size: 0
    }
  ])

  const [backupKPIs] = useState<BackupKPI[]>([
    {
      id: '1',
      name: 'Taxa de Sucesso',
      description: 'Percentual de backups executados com sucesso',
      value: 97.4,
      unit: '%',
      target: 99.0,
      status: 'at_risk',
      trend: 'up',
      category: 'reliability',
      lastUpdated: '2025-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Tempo Médio de Backup',
      description: 'Duração média dos backups executados',
      value: 28,
      unit: 'min',
      target: 30,
      status: 'on_track',
      trend: 'down',
      category: 'performance',
      lastUpdated: '2025-01-15T14:30:00Z'
    },
    {
      id: '3',
      name: 'Economia de Armazenamento',
      description: 'Economia através de compressão',
      value: 78,
      unit: '%',
      target: 75,
      status: 'on_track',
      trend: 'up',
      category: 'cost',
      lastUpdated: '2025-01-15T14:30:00Z'
    },
    {
      id: '4',
      name: 'RTO Compliance',
      description: 'Aderência aos objetivos de tempo de recuperação',
      value: 95.2,
      unit: '%',
      target: 95.0,
      status: 'on_track',
      trend: 'stable',
      category: 'reliability',
      lastUpdated: '2025-01-15T14:30:00Z'
    },
    {
      id: '5',
      name: 'Score de Segurança',
      description: 'Pontuação geral de segurança dos backups',
      value: 96.5,
      unit: '%',
      target: 95.0,
      status: 'on_track',
      trend: 'up',
      category: 'security',
      lastUpdated: '2025-01-15T14:30:00Z'
    },
    {
      id: '6',
      name: 'Custo por GB',
      description: 'Custo médio por GB de dados protegidos',
      value: 0.38,
      unit: 'USD',
      target: 0.40,
      status: 'on_track',
      trend: 'down',
      category: 'cost',
      lastUpdated: '2025-01-15T14:30:00Z'
    }
  ])

  const [forecasts] = useState<BackupForecast[]>([
    {
      period: 'Fev 2025',
      predictedDataGrowth: 3650,
      predictedCosts: 1420,
      predictedStorageNeeds: 2580,
      confidence: 87,
      factors: ['Crescimento histórico', 'Novos projetos', 'Sazonalidade']
    },
    {
      period: 'Mar 2025',
      predictedDataGrowth: 3820,
      predictedCosts: 1485,
      predictedStorageNeeds: 2720,
      confidence: 82,
      factors: ['Crescimento histórico', 'Expansão prevista', 'Migração de dados']
    },
    {
      period: 'Abr 2025',
      predictedDataGrowth: 4010,
      predictedCosts: 1560,
      predictedStorageNeeds: 2890,
      confidence: 78,
      factors: ['Projeção de crescimento', 'Novos clientes', 'Aumento de transações']
    }
  ])

  // Dados para gráficos
  const performanceTrendData = analytics.trends.map(trend => ({
    date: new Date(trend.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    backups: trend.backupsExecuted,
    data: trend.dataVolume,
    duration: trend.duration,
    success: trend.successRate,
    cost: trend.cost
  }))

  const storageDistributionByType = Object.entries(analytics.storage.distributionByType).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: {
      database: '#3b82f6',
      application: '#10b981',
      files: '#f59e0b',
      logs: '#ef4444',
      media: '#8b5cf6'
    }[key] || '#6b7280'
  }))

  const storageDistributionByLocation = Object.entries(analytics.storage.distributionByLocation).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: {
      local: '#3b82f6',
      cloud: '#10b981',
      hybrid: '#f59e0b'
    }[key] || '#6b7280'
  }))

  const costAnalysisData = Object.entries(analytics.storage.costAnalysis)
    .filter(([key]) => key !== 'totalCost' && key !== 'currency')
    .map(([key, value]) => ({
      name: key.replace('Cost', '').charAt(0).toUpperCase() + key.replace('Cost', '').slice(1),
      value: value as number,
      color: {
        storage: '#3b82f6',
        transfer: '#10b981',
        operational: '#f59e0b'
      }[key.replace('Cost', '')] || '#6b7280'
    }))

  const reliabilityMetricsData = [
    { name: 'MTBF', value: analytics.reliability.mtbf, unit: 'hours', target: 600 },
    { name: 'MTTR', value: analytics.reliability.mttr, unit: 'minutes', target: 15 },
    { name: 'Disponibilidade', value: analytics.reliability.availabilityPercentage, unit: '%', target: 99.5 },
    { name: 'RTO Compliance', value: analytics.reliability.rtoCompliance, unit: '%', target: 95 },
    { name: 'RPO Compliance', value: analytics.reliability.rpoCompliance, unit: '%', target: 95 }
  ]

  const securityMetricsData = [
    { name: 'Backups Criptografados', value: analytics.security.encryptedBackups },
    { name: 'Backups Não Criptografados', value: analytics.security.unencryptedBackups },
    { name: 'Auditorias de Acesso', value: analytics.security.accessAudits },
    { name: 'Incidentes de Segurança', value: analytics.security.securityIncidents }
  ]

  const forecastData = forecasts.map(f => ({
    period: f.period,
    dataGrowth: f.predictedDataGrowth,
    costs: f.predictedCosts,
    storage: f.predictedStorageNeeds,
    confidence: f.confidence
  }))

  // Funções auxiliares
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': case 'completed': return 'bg-green-100 text-green-800'
      case 'at_risk': case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'critical': case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-800'
      case 'reliability': return 'bg-green-100 text-green-800'
      case 'cost': return 'bg-yellow-100 text-yellow-800'
      case 'security': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics de Backup</h1>
          <p className="text-gray-600">Análise avançada e insights de performance de backup</p>
        </div>
        <div className="flex space-x-2">
          <Select 
            title="Período"
            options={[
              { value: 'day', label: 'Hoje' },
              { value: 'week', label: 'Última Semana' },
              { value: 'month', label: 'Último Mês' },
              { value: 'quarter', label: 'Último Trimestre' },
              { value: 'year', label: 'Último Ano' }
            ]}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          <TabsTrigger value="reliability">Confiabilidade</TabsTrigger>
          <TabsTrigger value="forecasts">Previsões</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analytics.overview.totalBackups)}
                </div>
                <p className="text-xs text-gray-600">
                  {formatNumber(analytics.overview.successfulBackups)} sucessos
                </p>
                <Progress 
                  value={(analytics.overview.successfulBackups / analytics.overview.totalBackups) * 100} 
                  className="mt-2 h-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.overview.successRate}%
                </div>
                <p className="text-xs text-gray-600">
                  {formatNumber(analytics.overview.failedBackups)} falhas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dados Protegidos</CardTitle>
                <Archive className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.overview.totalDataBackedUp} GB
                </div>
                <p className="text-xs text-gray-600">
                  {analytics.overview.compressionRatio}% compressão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analytics.overview.costSavings)}
                </div>
                <p className="text-xs text-gray-600">
                  Por compressão
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KPIs Secundários */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores Chave de Performance</CardTitle>
              <CardDescription>Monitoramento dos principais KPIs de backup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {backupKPIs.map((kpi) => (
                  <Card key={kpi.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{kpi.name}</h4>
                          <p className="text-sm text-gray-600">{kpi.description}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(kpi.trend)}
                          <Badge className={getStatusColor(kpi.status)} size="sm">
                            {kpi.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {kpi.value} {kpi.unit}
                          </span>
                          <Badge className={getCategoryColor(kpi.category)} size="sm">
                            {kpi.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Meta: {kpi.target} {kpi.unit}</span>
                          <span>
                            {kpi.value >= kpi.target ? 
                              `+${((kpi.value / kpi.target - 1) * 100).toFixed(1)}%` : 
                              `${((kpi.value / kpi.target - 1) * 100).toFixed(1)}%`
                            }
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-3">
                        Atualizado: {formatDateTime(kpi.lastUpdated)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendências Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Backup</CardTitle>
              <CardDescription>Evolução das métricas de backup ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="backups" fill="#3b82f6" name="Backups Executados" />
                  <Line yAxisId="left" type="monotone" dataKey="data" stroke="#10b981" strokeWidth={2} name="Volume (GB)" />
                  <Line yAxisId="right" type="monotone" dataKey="success" stroke="#f59e0b" strokeWidth={2} name="Taxa Sucesso %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput Médio</CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.performance.avgThroughput} MB/s
                </div>
                <p className="text-xs text-gray-600">
                  Velocidade de transferência
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compressão</CardTitle>
                <Archive className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.performance.avgCompressionRatio}%
                </div>
                <p className="text-xs text-gray-600">
                  Economia de espaço
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Recovery</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.performance.avgRecoveryTime} min
                </div>
                <p className="text-xs text-gray-600">
                  Tempo médio de recuperação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.performance.uptimePercentage}%
                </div>
                <p className="text-xs text-gray-600">
                  Disponibilidade do sistema
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Performance Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance Detalhada</CardTitle>
              <CardDescription>Métricas de performance ao longo do período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="duration" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Duração (min)" />
                  <Line yAxisId="right" type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Taxa Sucesso %" />
                  <Bar yAxisId="left" dataKey="data" fill="#3b82f6" name="Volume (GB)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Duração</CardTitle>
                <CardDescription>Tempo de execução dos backups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#3b82f6" name="Duração (min)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
                <CardDescription>Evolução da taxa de sucesso</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsAreaChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="success" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Taxa Sucesso %" />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          {/* Estatísticas de Armazenamento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
                <HardDrive className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.storage.totalUsed} GB
                </div>
                <p className="text-xs text-gray-600">
                  de {analytics.storage.totalAvailable} GB total
                </p>
                <Progress 
                  value={(analytics.storage.totalUsed / analytics.storage.totalAvailable) * 100} 
                  className="mt-2 h-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.storage.costAnalysis.totalCost)}
                </div>
                <p className="text-xs text-gray-600">
                  Mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo por GB</CardTitle>
                <TrendingDown className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analytics.storage.costAnalysis.totalCost / analytics.storage.totalUsed)}
                </div>
                <p className="text-xs text-gray-600">
                  Por GB protegido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <Archive className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.performance.avgCompressionRatio}%
                </div>
                <p className="text-xs text-gray-600">
                  Por compressão
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Análise de Distribuição */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <CardDescription>Uso de armazenamento por tipo de dados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={storageDistributionByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value} GB`}
                    >
                      {storageDistributionByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} GB`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Local</CardTitle>
                <CardDescription>Uso de armazenamento por localização</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={storageDistributionByLocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value} GB`}
                    >
                      {storageDistributionByLocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} GB`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Análise de Custos */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Custos</CardTitle>
              <CardDescription>Breakdown detalhado dos custos de armazenamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={costAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Bar dataKey="value" name="Custo">
                      {costAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <h4 className="font-semibold">Detalhamento de Custos</h4>
                  {Object.entries(analytics.storage.costAnalysis).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace('Cost', '').replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium">
                        {typeof value === 'number' ? formatCurrency(value) : value}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total Mensal:</span>
                      <span>{formatCurrency(analytics.storage.costAnalysis.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reliability" className="space-y-6">
          {/* Métricas de Confiabilidade */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {reliabilityMetricsData.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Gauge className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {metric.value} {metric.unit}
                  </div>
                  <p className="text-xs text-gray-600">
                    Meta: {metric.target} {metric.unit}
                  </p>
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="mt-2 h-2" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Análise de Confiabilidade */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Confiabilidade</CardTitle>
              <CardDescription>Métricas detalhadas de disponibilidade e confiabilidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={reliabilityMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Valor Atual" />
                  <Bar dataKey="target" fill="#10b981" name="Meta" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Segurança</CardTitle>
              <CardDescription>Análise de segurança e compliance dos backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Indicadores de Segurança</h4>
                  {securityMetricsData.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{metric.name}:</span>
                      <span className="font-medium">{formatNumber(metric.value)}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-medium">Score de Compliance:</span>
                      <span className="text-blue-900 font-bold">{analytics.security.complianceScore}%</span>
                    </div>
                    <Progress value={analytics.security.complianceScore} className="mt-2 h-2" />
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Criptografados', value: analytics.security.encryptedBackups, color: '#10b981' },
                        { name: 'Não Criptografados', value: analytics.security.unencryptedBackups, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          {/* Previsões */}
          <Card>
            <CardHeader>
              <CardTitle>Previsões de Crescimento</CardTitle>
              <CardDescription>Projeções de crescimento de dados e custos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="dataGrowth" fill="#3b82f6" name="Crescimento de Dados (GB)" />
                  <Line yAxisId="left" type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Custos (USD)" />
                  <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confiança %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detalhes das Previsões */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecasts.map((forecast, index) => (
              <Card key={index} className="border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{forecast.period}</h3>
                    <Badge className={forecast.confidence >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {forecast.confidence}% confiança
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Crescimento de Dados:</span>
                      <span className="font-medium">{forecast.predictedDataGrowth} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Custos Previstos:</span>
                      <span className="font-medium">{formatCurrency(forecast.predictedCosts)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Necessidade de Storage:</span>
                      <span className="font-medium">{forecast.predictedStorageNeeds} GB</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Fatores Considerados:</h4>
                    <div className="space-y-1">
                      {forecast.factors.map((factor, factorIndex) => (
                        <Badge key={factorIndex} variant="secondary" className="text-xs mr-1">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações Baseadas em Previsões</CardTitle>
              <CardDescription>Ações recomendadas com base nas projeções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-2">Planejamento de Capacidade</h4>
                  <p className="text-blue-800 text-sm">
                    Com base no crescimento projetado de {forecastData[0]?.dataGrowth} GB para o próximo mês, 
                    recomendamos aumentar a capacidade de armazenamento em 20% para evitar limitações.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 mb-2">Otimização de Custos</h4>
                  <p className="text-green-800 text-sm">
                    Implementar políticas de retenção mais agressivas para dados antigos pode reduzir 
                    custos em até 15% sem impactar a disponibilidade dos dados críticos.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-yellow-900 mb-2">Monitoramento Intensivo</h4>
                  <p className="text-yellow-800 text-sm">
                    O crescimento acelerado previsto requer monitoramento mais frequente das métricas 
                    de performance para identificar gargalos antes que afetem o sistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Lista de Relatórios */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Relatórios de Backup</CardTitle>
                <CardDescription>Relatórios automáticos e personalizados</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupReports.map((report) => (
                  <Card key={report.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{report.name}</h4>
                          <p className="text-sm text-gray-600">{report.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Tipo: {report.type}</span>
                            <span>•</span>
                            <span>Formato: {report.format.toUpperCase()}</span>
                            <span>•</span>
                            <span>Período: {formatDateTime(report.period.start)} - {formatDateTime(report.period.end)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="secondary">
                            {report.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Gerado em:</span>
                          <span className="font-medium">{formatDateTime(report.generatedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tamanho:</span>
                          <span className="font-medium">{formatBytes(report.size)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Destinatários:</span>
                          <span className="font-medium">{report.recipients.length} pessoa(s)</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Seções:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.sections.map((section, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {section}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t mt-3">
                        <div className="flex space-x-1">
                          {report.recipients.slice(0, 2).map((recipient, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {recipient.split('@')[0]}
                            </Badge>
                          ))}
                          {report.recipients.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{report.recipients.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {report.status === 'completed' && report.downloadUrl && (
                            <Button size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button size="sm" variant="secondary">
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Share className="h-3 w-3 mr-1" />
                            Compartilhar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Templates de Relatório */}
          <Card>
            <CardHeader>
              <CardTitle>Templates de Relatório</CardTitle>
              <CardDescription>Modelos pré-configurados para diferentes tipos de relatório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold">Relatório Executivo</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Visão geral para executivos com KPIs principais e tendências
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Overview</Badge>
                      <Badge variant="secondary" className="text-xs">KPIs</Badge>
                      <Badge variant="secondary" className="text-xs">Custos</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Gauge className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold">Relatório Técnico</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Análise detalhada para equipes técnicas com métricas específicas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Performance</Badge>
                      <Badge variant="secondary" className="text-xs">Reliability</Badge>
                      <Badge variant="secondary" className="text-xs">Security</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold">Relatório de Compliance</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Conformidade e auditoria para requisitos regulatórios
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Compliance</Badge>
                      <Badge variant="secondary" className="text-xs">Audit</Badge>
                      <Badge variant="secondary" className="text-xs">Security</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BackupAnalytics
