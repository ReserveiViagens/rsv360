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
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Target,
  Zap,
  Clock,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Database,
  Server,
  Cloud,
  Globe,
  Users,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share,
  ExternalLink,
  Maximize,
  Minimize,
  Play,
  Pause,
  Stop,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Calendar,
  Timer,
  MapPin,
  Building,
  Phone,
  Mail,
  User,
  Code,
  FileText,
  Folder,
  Archive,
  Layers,
  Router,
  Shield,
  Lock,
  Key,
  Star,
  Heart,
  Bookmark
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
  PieChart, 
  Cell,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart,
  RechartsTooltip
} from 'recharts'

// Tipos para Metrics Dashboard
interface MetricWidget {
  id: string
  title: string
  type: 'kpi' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'gauge' | 'table' | 'heatmap' | 'scatter'
  size: 'small' | 'medium' | 'large' | 'extra_large'
  position: { x: number; y: number; w: number; h: number }
  dataSource: string
  configuration: {
    metrics: string[]
    timeRange: string
    refreshInterval: number
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
    filters?: Record<string, any>
    thresholds?: {
      warning: number
      critical: number
    }
    colors?: string[]
  }
  isVisible: boolean
  isEditable: boolean
  createdAt: string
  updatedAt: string
}

interface Dashboard {
  id: string
  name: string
  description: string
  category: 'system' | 'application' | 'business' | 'custom'
  isPublic: boolean
  owner: string
  widgets: MetricWidget[]
  tags: string[]
  lastViewed: string
  viewCount: number
  sharedWith: string[]
  autoRefresh: {
    enabled: boolean
    interval: number
  }
  alerts: {
    enabled: boolean
    rules: AlertRule[]
  }
}

interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  enabled: boolean
  notifications: {
    email: boolean
    slack: boolean
    webhook: boolean
  }
  lastTriggered?: string
  triggerCount: number
}

interface MetricData {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  description: string
  unit: string
  category: 'system' | 'application' | 'network' | 'database' | 'custom'
  source: string
  data: MetricData[]
  currentValue: number
  trend: 'up' | 'down' | 'stable'
  status: 'healthy' | 'warning' | 'critical'
  thresholds: {
    warning: number
    critical: number
  }
}

const MetricsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Dados mock para demonstração
  const [dashboards] = useState<Dashboard[]>([
    {
      id: '1',
      name: 'System Performance',
      description: 'Monitoramento geral de performance do sistema',
      category: 'system',
      isPublic: true,
      owner: 'admin',
      widgets: [
        {
          id: 'w1',
          title: 'CPU Usage',
          type: 'gauge',
          size: 'medium',
          position: { x: 0, y: 0, w: 2, h: 2 },
          dataSource: 'system_metrics',
          configuration: {
            metrics: ['cpu_usage'],
            timeRange: '1h',
            refreshInterval: 30,
            aggregation: 'avg',
            thresholds: { warning: 70, critical: 85 },
            colors: ['#10b981', '#f59e0b', '#ef4444']
          },
          isVisible: true,
          isEditable: true,
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z'
        },
        {
          id: 'w2',
          title: 'Memory Usage',
          type: 'line_chart',
          size: 'large',
          position: { x: 2, y: 0, w: 4, h: 2 },
          dataSource: 'system_metrics',
          configuration: {
            metrics: ['memory_usage', 'swap_usage'],
            timeRange: '6h',
            refreshInterval: 60,
            aggregation: 'avg',
            colors: ['#3b82f6', '#8b5cf6']
          },
          isVisible: true,
          isEditable: true,
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z'
        }
      ],
      tags: ['system', 'performance', 'monitoring'],
      lastViewed: '2025-01-15T14:45:00Z',
      viewCount: 1247,
      sharedWith: ['team-ops', 'team-dev'],
      autoRefresh: {
        enabled: true,
        interval: 30
      },
      alerts: {
        enabled: true,
        rules: [
          {
            id: 'a1',
            name: 'High CPU Usage',
            metric: 'cpu_usage',
            condition: 'greater_than',
            threshold: 85,
            severity: 'critical',
            enabled: true,
            notifications: {
              email: true,
              slack: true,
              webhook: false
            },
            lastTriggered: '2025-01-14T16:30:00Z',
            triggerCount: 12
          }
        ]
      }
    },
    {
      id: '2',
      name: 'Application Metrics',
      description: 'Métricas de performance da aplicação',
      category: 'application',
      isPublic: false,
      owner: 'dev-team',
      widgets: [
        {
          id: 'w3',
          title: 'Response Time',
          type: 'line_chart',
          size: 'large',
          position: { x: 0, y: 0, w: 6, h: 3 },
          dataSource: 'application_metrics',
          configuration: {
            metrics: ['avg_response_time', 'p95_response_time'],
            timeRange: '24h',
            refreshInterval: 120,
            aggregation: 'avg',
            colors: ['#10b981', '#f59e0b']
          },
          isVisible: true,
          isEditable: true,
          createdAt: '2025-01-12T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z'
        },
        {
          id: 'w4',
          title: 'Error Rate',
          type: 'bar_chart',
          size: 'medium',
          position: { x: 0, y: 3, w: 3, h: 2 },
          dataSource: 'application_metrics',
          configuration: {
            metrics: ['error_rate'],
            timeRange: '6h',
            refreshInterval: 60,
            aggregation: 'sum',
            colors: ['#ef4444']
          },
          isVisible: true,
          isEditable: true,
          createdAt: '2025-01-12T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z'
        }
      ],
      tags: ['application', 'performance', 'errors'],
      lastViewed: '2025-01-15T13:20:00Z',
      viewCount: 856,
      sharedWith: ['team-dev'],
      autoRefresh: {
        enabled: true,
        interval: 60
      },
      alerts: {
        enabled: true,
        rules: []
      }
    }
  ])

  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'CPU Usage',
      description: 'Percentual de utilização da CPU',
      unit: '%',
      category: 'system',
      source: 'system_monitor',
      data: [
        { timestamp: '2025-01-15T10:00:00Z', value: 45 },
        { timestamp: '2025-01-15T11:00:00Z', value: 52 },
        { timestamp: '2025-01-15T12:00:00Z', value: 61 },
        { timestamp: '2025-01-15T13:00:00Z', value: 68 },
        { timestamp: '2025-01-15T14:00:00Z', value: 72 }
      ],
      currentValue: 72,
      trend: 'up',
      status: 'warning',
      thresholds: { warning: 70, critical: 85 }
    },
    {
      name: 'Memory Usage',
      description: 'Utilização de memória RAM',
      unit: '%',
      category: 'system',
      source: 'system_monitor',
      data: [
        { timestamp: '2025-01-15T10:00:00Z', value: 68 },
        { timestamp: '2025-01-15T11:00:00Z', value: 71 },
        { timestamp: '2025-01-15T12:00:00Z', value: 69 },
        { timestamp: '2025-01-15T13:00:00Z', value: 73 },
        { timestamp: '2025-01-15T14:00:00Z', value: 75 }
      ],
      currentValue: 75,
      trend: 'up',
      status: 'healthy',
      thresholds: { warning: 80, critical: 90 }
    },
    {
      name: 'Response Time',
      description: 'Tempo médio de resposta da API',
      unit: 'ms',
      category: 'application',
      source: 'api_monitor',
      data: [
        { timestamp: '2025-01-15T10:00:00Z', value: 245 },
        { timestamp: '2025-01-15T11:00:00Z', value: 267 },
        { timestamp: '2025-01-15T12:00:00Z', value: 189 },
        { timestamp: '2025-01-15T13:00:00Z', value: 234 },
        { timestamp: '2025-01-15T14:00:00Z', value: 198 }
      ],
      currentValue: 198,
      trend: 'down',
      status: 'healthy',
      thresholds: { warning: 500, critical: 1000 }
    },
    {
      name: 'Database Connections',
      description: 'Número de conexões ativas no banco',
      unit: 'count',
      category: 'database',
      source: 'db_monitor',
      data: [
        { timestamp: '2025-01-15T10:00:00Z', value: 78 },
        { timestamp: '2025-01-15T11:00:00Z', value: 82 },
        { timestamp: '2025-01-15T12:00:00Z', value: 91 },
        { timestamp: '2025-01-15T13:00:00Z', value: 87 },
        { timestamp: '2025-01-15T14:00:00Z', value: 85 }
      ],
      currentValue: 85,
      trend: 'stable',
      status: 'healthy',
      thresholds: { warning: 150, critical: 180 }
    },
    {
      name: 'Network Throughput',
      description: 'Taxa de transferência de rede',
      unit: 'Mbps',
      category: 'network',
      source: 'network_monitor',
      data: [
        { timestamp: '2025-01-15T10:00:00Z', value: 15.6 },
        { timestamp: '2025-01-15T11:00:00Z', value: 18.3 },
        { timestamp: '2025-01-15T12:00:00Z', value: 24.7 },
        { timestamp: '2025-01-15T13:00:00Z', value: 22.1 },
        { timestamp: '2025-01-15T14:00:00Z', value: 19.8 }
      ],
      currentValue: 19.8,
      trend: 'down',
      status: 'healthy',
      thresholds: { warning: 80, critical: 95 }
    }
  ])

  // Dados para widgets demo
  const systemOverviewData = [
    { time: '10:00', cpu: 45, memory: 68, disk: 34, network: 15.6 },
    { time: '11:00', cpu: 52, memory: 71, disk: 36, network: 18.3 },
    { time: '12:00', cpu: 61, memory: 69, disk: 38, network: 24.7 },
    { time: '13:00', cpu: 68, memory: 73, disk: 35, network: 22.1 },
    { time: '14:00', cpu: 72, memory: 75, disk: 37, network: 19.8 }
  ]

  const applicationMetricsData = [
    { time: '10:00', responseTime: 245, throughput: 1567, errors: 12 },
    { time: '11:00', responseTime: 267, throughput: 1789, errors: 8 },
    { time: '12:00', responseTime: 189, throughput: 2134, errors: 15 },
    { time: '13:00', responseTime: 234, throughput: 1923, errors: 6 },
    { time: '14:00', responseTime: 198, throughput: 1845, errors: 4 }
  ]

  const resourceDistribution = [
    { name: 'CPU', value: 72, color: '#ef4444' },
    { name: 'Memory', value: 75, color: '#3b82f6' },
    { name: 'Disk', value: 37, color: '#10b981' },
    { name: 'Network', value: 20, color: '#f59e0b' }
  ]

  const alertsData = [
    { severity: 'Critical', count: 3, color: '#ef4444' },
    { severity: 'Warning', count: 12, color: '#f59e0b' },
    { severity: 'Info', count: 24, color: '#3b82f6' }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatMetricValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`
    if (unit === 'ms') return `${value.toFixed(0)}ms`
    if (unit === 'Mbps') return `${value.toFixed(1)} Mbps`
    return `${value.toFixed(0)} ${unit}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800'
      case 'application': return 'bg-green-100 text-green-800'
      case 'business': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWidgetTypeIcon = (type: string) => {
    switch (type) {
      case 'kpi': return Target
      case 'line_chart': return TrendingUp
      case 'bar_chart': return BarChart3
      case 'pie_chart': return Activity
      case 'gauge': return Gauge
      case 'table': return FileText
      default: return Activity
    }
  }

  const calculateOverallHealth = () => {
    const healthyCount = performanceMetrics.filter(m => m.status === 'healthy').length
    return Math.round((healthyCount / performanceMetrics.length) * 100)
  }

  const getActiveAlertsCount = () => {
    return dashboards.reduce((total, dashboard) => {
      return total + dashboard.alerts.rules.filter(rule => rule.enabled).length
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Métricas</h1>
          <p className="text-gray-600">Visualização avançada de métricas e KPIs de performance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsEditMode(!isEditMode)}>
            <Edit className="w-4 h-4 mr-2" />
            {isEditMode ? 'Sair do Edit' : 'Editar'}
          </Button>
          <Button variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="application">Aplicação</TabsTrigger>
          <TabsTrigger value="custom">Customizado</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saúde Geral</CardTitle>
                <Gauge className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {calculateOverallHealth()}%
                </div>
                <p className="text-xs text-gray-600">
                  Sistema operacional
                </p>
                <Progress value={calculateOverallHealth()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboards.length}
                </div>
                <p className="text-xs text-gray-600">
                  Dashboards configurados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Métricas Ativas</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.length}
                </div>
                <p className="text-xs text-gray-600">
                  Sendo monitoradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getActiveAlertsCount()}
                </div>
                <p className="text-xs text-gray-600">
                  Regras ativas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Visão Geral do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas do Sistema</CardTitle>
              <CardDescription>Visão consolidada das principais métricas de sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={systemOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="memory" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Memory %" />
                  <Bar yAxisId="left" dataKey="cpu" fill="#ef4444" name="CPU %" />
                  <Line yAxisId="right" type="monotone" dataKey="network" stroke="#10b981" strokeWidth={2} name="Network (Mbps)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição de Recursos */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Recursos</CardTitle>
                <CardDescription>Utilização atual dos recursos do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={resourceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {resourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alertas por Severidade */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas por Severidade</CardTitle>
                <CardDescription>Distribuição dos alertas ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={alertsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Quantidade">
                      {alertsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Dashboards */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboards Disponíveis</CardTitle>
              <CardDescription>Acesso rápido aos dashboards configurados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboards.map((dashboard) => (
                  <Card key={dashboard.id} className="border cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{dashboard.name}</h4>
                          <p className="text-sm text-gray-600">{dashboard.description}</p>
                        </div>
                        <Badge className={getCategoryColor(dashboard.category)}>
                          {dashboard.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Widgets:</span>
                          <span className="font-medium">{dashboard.widgets.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Visualizações:</span>
                          <span className="font-medium">{formatNumber(dashboard.viewCount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Último acesso:</span>
                          <span className="font-medium">{formatDateTime(dashboard.lastViewed)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t mt-3">
                        <div className="flex space-x-1">
                          {dashboard.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-1">
                          {dashboard.autoRefresh.enabled && (
                            <RefreshCw className="h-4 w-4 text-green-600" />
                          )}
                          {dashboard.alerts.enabled && (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          )}
                          {dashboard.isPublic && (
                            <Globe className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* Dashboard de Sistema */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dashboard do Sistema</CardTitle>
                <CardDescription>Métricas de performance e recursos do sistema</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm" variant="secondary">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {performanceMetrics
                  .filter(metric => metric.category === 'system')
                  .map((metric) => (
                    <Card key={metric.name} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{metric.name}</h4>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <div className="text-2xl font-bold mb-2">
                          {formatMetricValue(metric.currentValue, metric.unit)}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                          <span className="text-xs text-gray-600">{metric.source}</span>
                        </div>
                        <Progress 
                          value={metric.unit === '%' ? metric.currentValue : (metric.currentValue / metric.thresholds.critical) * 100} 
                          className="mt-2 h-2" 
                        />
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CPU e Memória</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={systemOverviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} name="Memory %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Disk I/O</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={systemOverviewData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="disk" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Disk %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Network Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={systemOverviewData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="network" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Network (Mbps)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          {/* Dashboard da Aplicação */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dashboard da Aplicação</CardTitle>
                <CardDescription>Métricas de performance e comportamento da aplicação</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="secondary">
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {performanceMetrics
                  .filter(metric => metric.category === 'application')
                  .map((metric) => (
                    <Card key={metric.name} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{metric.name}</h4>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <div className="text-2xl font-bold mb-2">
                          {formatMetricValue(metric.currentValue, metric.unit)}
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time & Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={applicationMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="right" dataKey="throughput" fill="#10b981" name="Throughput" />
                        <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} name="Response Time (ms)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={applicationMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Errors" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Dashboard Customizado */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Customizado</CardTitle>
              <CardDescription>Crie e personalize seus próprios dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dashboard Builder
                </h3>
                <p className="text-gray-600 mb-6">
                  Funcionalidade em desenvolvimento. Em breve você poderá criar dashboards personalizados
                  com drag & drop, widgets customizáveis e métricas sob medida.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Drag & Drop Builder</h4>
                    <p className="text-gray-600">Interface visual para criação de dashboards</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Widgets Customizáveis</h4>
                    <p className="text-gray-600">Variedade de tipos de gráficos e visualizações</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Métricas Personalizadas</h4>
                    <p className="text-gray-600">Crie suas próprias métricas e KPIs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Sistema de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Alertas</CardTitle>
              <CardDescription>Configuração e monitoramento de alertas de métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por severidade"
                    options={[
                      { value: 'all', label: 'Todas as Severidades' },
                      { value: 'critical', label: 'Crítico' },
                      { value: 'warning', label: 'Atenção' },
                      { value: 'info', label: 'Informação' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'enabled', label: 'Habilitados' },
                      { value: 'disabled', label: 'Desabilitados' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Alerta
                  </Button>
                </div>

                <div className="grid gap-4">
                  {dashboards.flatMap(dashboard => 
                    dashboard.alerts.rules.map((alert, index) => (
                      <Card key={`${dashboard.id}-${alert.id}`} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{alert.name}</h4>
                              <p className="text-sm text-gray-600">
                                {alert.metric} {alert.condition} {alert.threshold}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Dashboard: {dashboard.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} size="sm">
                                {alert.enabled ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-gray-600">Disparos:</span>
                              <span className="ml-2 font-medium">{alert.triggerCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2 font-medium">{alert.notifications.email ? 'Sim' : 'Não'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Slack:</span>
                              <span className="ml-2 font-medium">{alert.notifications.slack ? 'Sim' : 'Não'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Último Disparo:</span>
                              <span className="ml-2 font-medium">
                                {alert.lastTriggered ? formatDateTime(alert.lastTriggered) : 'Nunca'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              ID: {alert.id}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Settings className="h-3 w-3 mr-1" />
                                Configurar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {dashboards.every(d => d.alerts.rules.length === 0) && (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum Alerta Configurado
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Configure alertas para ser notificado quando métricas importantes ultrapassarem limites.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Alerta
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Alertas</CardTitle>
              <CardDescription>Análise de alertas e notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {getActiveAlertsCount()}
                  </div>
                  <div className="text-sm text-gray-600">Alertas Ativos</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">Notificações Enviadas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">23</div>
                  <div className="text-sm text-gray-600">Alertas Críticos</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">98.5%</div>
                  <div className="text-sm text-gray-600">Taxa de Entrega</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MetricsDashboard
