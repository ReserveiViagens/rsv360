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
  Activity,
  BarChart3,
  Cpu,
  Database,
  HardDrive,
  Memory,
  Network,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Monitor,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Target,
  Layers,
  Globe,
  Router,
  Cloud,
  Wifi,
  WifiOff,
  Timer,
  Thermometer,
  Battery,
  Signal,
  Eye,
  EyeOff,
  Calendar,
  User,
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  FileText,
  Code,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Archive,
  Bookmark,
  Star,
  Heart,
  Share,
  Copy,
  Link,
  Lock,
  Unlock
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

// Tipos para Performance Center
interface PerformanceMetric {
  id: string
  name: string
  category: 'system' | 'application' | 'database' | 'network' | 'user'
  value: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  historicalData: {
    timestamp: string
    value: number
  }[]
}

interface SystemResource {
  id: string
  name: string
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'cache'
  usage: number
  capacity: number
  utilization: number
  status: 'healthy' | 'warning' | 'critical'
  location: string
  specifications: {
    cores?: number
    frequency?: string
    size?: string
    bandwidth?: string
    connections?: number
  }
  metrics: {
    avgLoad: number
    peakLoad: number
    availability: number
    responseTime: number
  }
  alerts: number
  lastMaintenance: string
  nextMaintenance: string
}

interface PerformanceTest {
  id: string
  name: string
  type: 'load' | 'stress' | 'volume' | 'endurance' | 'spike' | 'configuration'
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  duration: number
  progress: number
  target: {
    users: number
    requests: number
    duration: string
    rampUp: string
  }
  results?: {
    avgResponseTime: number
    maxResponseTime: number
    minResponseTime: number
    throughput: number
    errorRate: number
    successRate: number
    bottlenecks: string[]
  }
  configuration: {
    testData: string
    environment: string
    scenarios: string[]
  }
  reports: string[]
}

interface OptimizationRule {
  id: string
  name: string
  description: string
  category: 'caching' | 'database' | 'frontend' | 'api' | 'infrastructure'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  conditions: {
    metric: string
    operator: 'greater_than' | 'less_than' | 'equals' | 'between'
    value: number | number[]
  }[]
  actions: {
    type: 'scale' | 'cache' | 'redirect' | 'optimize' | 'alert'
    parameters: Record<string, any>
  }[]
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  metrics: {
    triggered: number
    successful: number
    failed: number
    lastTriggered?: string
  }
  impact: {
    estimatedImprovement: number
    costReduction: number
    userExperience: string
  }
}

interface PerformanceAlert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  category: 'performance' | 'availability' | 'security' | 'capacity'
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  affectedSystems: string[]
  metrics: {
    current: number
    threshold: number
    impact: string
  }
  assignedTo?: string
  escalationLevel: number
  autoResolve: boolean
  dependencies: string[]
  recommendations: string[]
  relatedIncidents: string[]
}

const PerformanceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  // Dados mock para demonstração
  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      id: '1',
      name: 'Response Time',
      category: 'application',
      value: 245,
      unit: 'ms',
      threshold: { warning: 500, critical: 1000 },
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '2025-01-15T14:45:00Z',
      description: 'Tempo médio de resposta das APIs',
      impact: 'high',
      recommendations: [
        'Implementar cache Redis',
        'Otimizar consultas de banco',
        'Usar CDN para assets estáticos'
      ],
      historicalData: [
        { timestamp: '2025-01-15T10:00:00Z', value: 230 },
        { timestamp: '2025-01-15T11:00:00Z', value: 245 },
        { timestamp: '2025-01-15T12:00:00Z', value: 260 },
        { timestamp: '2025-01-15T13:00:00Z', value: 235 },
        { timestamp: '2025-01-15T14:00:00Z', value: 245 }
      ]
    },
    {
      id: '2',
      name: 'CPU Usage',
      category: 'system',
      value: 68,
      unit: '%',
      threshold: { warning: 70, critical: 85 },
      status: 'warning',
      trend: 'up',
      lastUpdated: '2025-01-15T14:45:00Z',
      description: 'Utilização média da CPU nos servidores',
      impact: 'medium',
      recommendations: [
        'Escalar horizontalmente',
        'Otimizar algoritmos pesados',
        'Implementar load balancing'
      ],
      historicalData: [
        { timestamp: '2025-01-15T10:00:00Z', value: 45 },
        { timestamp: '2025-01-15T11:00:00Z', value: 52 },
        { timestamp: '2025-01-15T12:00:00Z', value: 61 },
        { timestamp: '2025-01-15T13:00:00Z', value: 65 },
        { timestamp: '2025-01-15T14:00:00Z', value: 68 }
      ]
    },
    {
      id: '3',
      name: 'Memory Usage',
      category: 'system',
      value: 72,
      unit: '%',
      threshold: { warning: 80, critical: 90 },
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '2025-01-15T14:45:00Z',
      description: 'Utilização de memória RAM',
      impact: 'medium',
      recommendations: [
        'Implementar garbage collection otimizado',
        'Revisar memory leaks',
        'Otimizar cache em memória'
      ],
      historicalData: [
        { timestamp: '2025-01-15T10:00:00Z', value: 70 },
        { timestamp: '2025-01-15T11:00:00Z', value: 71 },
        { timestamp: '2025-01-15T12:00:00Z', value: 73 },
        { timestamp: '2025-01-15T13:00:00Z', value: 72 },
        { timestamp: '2025-01-15T14:00:00Z', value: 72 }
      ]
    },
    {
      id: '4',
      name: 'Database Response',
      category: 'database',
      value: 89,
      unit: 'ms',
      threshold: { warning: 100, critical: 200 },
      status: 'healthy',
      trend: 'down',
      lastUpdated: '2025-01-15T14:45:00Z',
      description: 'Tempo de resposta do banco de dados',
      impact: 'high',
      recommendations: [
        'Criar índices otimizados',
        'Implementar connection pooling',
        'Otimizar queries complexas'
      ],
      historicalData: [
        { timestamp: '2025-01-15T10:00:00Z', value: 95 },
        { timestamp: '2025-01-15T11:00:00Z', value: 92 },
        { timestamp: '2025-01-15T12:00:00Z', value: 90 },
        { timestamp: '2025-01-15T13:00:00Z', value: 88 },
        { timestamp: '2025-01-15T14:00:00Z', value: 89 }
      ]
    },
    {
      id: '5',
      name: 'Throughput',
      category: 'application',
      value: 1847,
      unit: 'req/min',
      threshold: { warning: 1500, critical: 1000 },
      status: 'healthy',
      trend: 'up',
      lastUpdated: '2025-01-15T14:45:00Z',
      description: 'Taxa de processamento de requisições',
      impact: 'high',
      recommendations: [
        'Implementar rate limiting',
        'Otimizar processamento assíncrono',
        'Usar message queues'
      ],
      historicalData: [
        { timestamp: '2025-01-15T10:00:00Z', value: 1650 },
        { timestamp: '2025-01-15T11:00:00Z', value: 1720 },
        { timestamp: '2025-01-15T12:00:00Z', value: 1780 },
        { timestamp: '2025-01-15T13:00:00Z', value: 1820 },
        { timestamp: '2025-01-15T14:00:00Z', value: 1847 }
      ]
    }
  ])

  const [systemResources] = useState<SystemResource[]>([
    {
      id: '1',
      name: 'Web Server 01',
      type: 'cpu',
      usage: 68,
      capacity: 100,
      utilization: 68,
      status: 'warning',
      location: 'US-East-1',
      specifications: {
        cores: 8,
        frequency: '3.2 GHz',
        size: '32 GB RAM'
      },
      metrics: {
        avgLoad: 2.4,
        peakLoad: 4.8,
        availability: 99.8,
        responseTime: 245
      },
      alerts: 2,
      lastMaintenance: '2024-12-15T00:00:00Z',
      nextMaintenance: '2025-02-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Database Primary',
      type: 'database',
      usage: 45,
      capacity: 100,
      utilization: 45,
      status: 'healthy',
      location: 'US-East-1',
      specifications: {
        size: '2 TB SSD',
        connections: 200,
        bandwidth: '10 Gbps'
      },
      metrics: {
        avgLoad: 1.2,
        peakLoad: 3.1,
        availability: 99.9,
        responseTime: 89
      },
      alerts: 0,
      lastMaintenance: '2024-11-30T00:00:00Z',
      nextMaintenance: '2025-01-30T00:00:00Z'
    },
    {
      id: '3',
      name: 'Redis Cache',
      type: 'cache',
      usage: 34,
      capacity: 100,
      utilization: 34,
      status: 'healthy',
      location: 'US-East-1',
      specifications: {
        size: '16 GB',
        connections: 1000
      },
      metrics: {
        avgLoad: 0.8,
        peakLoad: 2.3,
        availability: 99.95,
        responseTime: 1.2
      },
      alerts: 0,
      lastMaintenance: '2025-01-01T00:00:00Z',
      nextMaintenance: '2025-03-01T00:00:00Z'
    }
  ])

  const [performanceTests] = useState<PerformanceTest[]>([
    {
      id: '1',
      name: 'Load Test - Black Friday Simulation',
      type: 'load',
      status: 'completed',
      startTime: '2025-01-14T10:00:00Z',
      endTime: '2025-01-14T12:00:00Z',
      duration: 120,
      progress: 100,
      target: {
        users: 5000,
        requests: 100000,
        duration: '2h',
        rampUp: '10min'
      },
      results: {
        avgResponseTime: 340,
        maxResponseTime: 1250,
        minResponseTime: 45,
        throughput: 850,
        errorRate: 0.8,
        successRate: 99.2,
        bottlenecks: ['Database connection pool', 'Image processing API']
      },
      configuration: {
        testData: 'production-like-dataset',
        environment: 'staging',
        scenarios: ['Browse products', 'Add to cart', 'Checkout', 'Payment']
      },
      reports: ['load-test-report.pdf', 'performance-analysis.xlsx']
    },
    {
      id: '2',
      name: 'API Stress Test',
      type: 'stress',
      status: 'running',
      startTime: '2025-01-15T14:00:00Z',
      duration: 60,
      progress: 75,
      target: {
        users: 10000,
        requests: 500000,
        duration: '1h',
        rampUp: '5min'
      },
      configuration: {
        testData: 'api-test-suite',
        environment: 'load-testing',
        scenarios: ['User authentication', 'Data retrieval', 'Data modification']
      },
      reports: []
    }
  ])

  const [optimizationRules] = useState<OptimizationRule[]>([
    {
      id: '1',
      name: 'Auto-scale on CPU Usage',
      description: 'Automaticamente escala recursos quando CPU ultrapassa 70%',
      category: 'infrastructure',
      priority: 'high',
      isActive: true,
      conditions: [
        { metric: 'cpu_usage', operator: 'greater_than', value: 70 }
      ],
      actions: [
        { type: 'scale', parameters: { direction: 'up', instances: 2 } },
        { type: 'alert', parameters: { recipients: ['ops@rsv.com'] } }
      ],
      metrics: {
        triggered: 12,
        successful: 11,
        failed: 1,
        lastTriggered: '2025-01-14T16:30:00Z'
      },
      impact: {
        estimatedImprovement: 25,
        costReduction: 15,
        userExperience: 'Improved response times during peak loads'
      }
    },
    {
      id: '2',
      name: 'Cache Warm-up Strategy',
      description: 'Pré-carrega cache com dados frequentemente acessados',
      category: 'caching',
      priority: 'medium',
      isActive: true,
      conditions: [
        { metric: 'cache_hit_rate', operator: 'less_than', value: 80 }
      ],
      actions: [
        { type: 'cache', parameters: { strategy: 'warm-up', data: 'popular_items' } }
      ],
      schedule: {
        enabled: true,
        cron: '0 */6 * * *',
        timezone: 'America/Sao_Paulo'
      },
      metrics: {
        triggered: 8,
        successful: 8,
        failed: 0,
        lastTriggered: '2025-01-15T06:00:00Z'
      },
      impact: {
        estimatedImprovement: 30,
        costReduction: 20,
        userExperience: 'Faster page loads and better user experience'
      }
    }
  ])

  const [performanceAlerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      title: 'High CPU Usage Detected',
      description: 'CPU usage on Web Server 01 has exceeded 70% for more than 10 minutes',
      severity: 'warning',
      category: 'performance',
      status: 'acknowledged',
      createdAt: '2025-01-15T14:30:00Z',
      updatedAt: '2025-01-15T14:35:00Z',
      affectedSystems: ['web-server-01', 'load-balancer'],
      metrics: {
        current: 68,
        threshold: 70,
        impact: 'Response times may increase during peak traffic'
      },
      assignedTo: 'ops-team',
      escalationLevel: 1,
      autoResolve: false,
      dependencies: ['database-primary', 'redis-cache'],
      recommendations: [
        'Scale horizontally by adding more instances',
        'Optimize resource-intensive operations',
        'Review recent code deployments'
      ],
      relatedIncidents: []
    },
    {
      id: '2',
      title: 'Database Query Performance Degradation',
      description: 'Average database response time has increased by 15% in the last hour',
      severity: 'critical',
      category: 'performance',
      status: 'investigating',
      createdAt: '2025-01-15T13:45:00Z',
      updatedAt: '2025-01-15T14:15:00Z',
      affectedSystems: ['database-primary', 'api-gateway'],
      metrics: {
        current: 89,
        threshold: 100,
        impact: 'API response times affected, user experience degraded'
      },
      assignedTo: 'database-team',
      escalationLevel: 2,
      autoResolve: true,
      dependencies: ['storage-volume', 'network-connection'],
      recommendations: [
        'Analyze slow query logs',
        'Check for lock contention',
        'Review indexing strategy'
      ],
      relatedIncidents: ['inc-2025-001']
    }
  ])

  // Dados para gráficos
  const performanceTrends = [
    { time: '10:00', responseTime: 230, throughput: 1650, cpuUsage: 45, memoryUsage: 70 },
    { time: '11:00', responseTime: 245, throughput: 1720, cpuUsage: 52, memoryUsage: 71 },
    { time: '12:00', responseTime: 260, throughput: 1780, cpuUsage: 61, memoryUsage: 73 },
    { time: '13:00', responseTime: 235, throughput: 1820, cpuUsage: 65, memoryUsage: 72 },
    { time: '14:00', responseTime: 245, throughput: 1847, cpuUsage: 68, memoryUsage: 72 }
  ]

  const resourceUtilization = [
    { name: 'CPU', usage: 68, capacity: 100, status: 'warning' },
    { name: 'Memory', usage: 72, capacity: 100, status: 'healthy' },
    { name: 'Disk', usage: 45, capacity: 100, status: 'healthy' },
    { name: 'Network', usage: 34, capacity: 100, status: 'healthy' }
  ]

  const responseTimeDistribution = [
    { range: '0-100ms', count: 45, percentage: 30 },
    { range: '100-200ms', count: 52, percentage: 35 },
    { range: '200-500ms', count: 38, percentage: 25 },
    { range: '500ms+', count: 15, percentage: 10 }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': case 'resolved': return 'bg-green-100 text-green-800'
      case 'warning': case 'acknowledged': case 'running': return 'bg-yellow-100 text-yellow-800'
      case 'critical': case 'failed': case 'investigating': return 'bg-red-100 text-red-800'
      case 'unknown': case 'scheduled': case 'open': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      case 'emergency': return 'bg-purple-100 text-purple-800'
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return Cpu
      case 'memory': return Memory
      case 'disk': return HardDrive
      case 'network': return Network
      case 'database': return Database
      case 'cache': return Layers
      default: return Server
    }
  }

  const calculateOverallHealth = () => {
    const healthyCount = performanceMetrics.filter(m => m.status === 'healthy').length
    const totalCount = performanceMetrics.length
    return Math.round((healthyCount / totalCount) * 100)
  }

  const getAverageResponseTime = () => {
    const responseTimeMetric = performanceMetrics.find(m => m.name === 'Response Time')
    return responseTimeMetric ? responseTimeMetric.value : 0
  }

  const getTotalAlerts = () => {
    return performanceAlerts.filter(a => a.status === 'open').length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Performance</h1>
          <p className="text-gray-600">Monitoramento e otimização de performance do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsTestModalOpen(!isTestModalOpen)}>
            <Play className="w-4 h-4 mr-2" />
            Novo Teste
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs de Performance */}
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
                <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {getAverageResponseTime()}ms
                </div>
                <p className="text-xs text-gray-600">
                  Média das APIs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  1,847
                </div>
                <p className="text-xs text-gray-600">
                  req/min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {getTotalAlerts()}
                </div>
                <p className="text-xs text-gray-600">
                  Requerem atenção
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Performance</CardTitle>
              <CardDescription>Métricas principais nas últimas horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="throughput" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Throughput" />
                  <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} name="Response Time (ms)" />
                  <Bar yAxisId="right" dataKey="cpuUsage" fill="#ef4444" name="CPU Usage %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Utilização de Recursos */}
            <Card>
              <CardHeader>
                <CardTitle>Utilização de Recursos</CardTitle>
                <CardDescription>Status atual dos recursos do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceUtilization.map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{resource.name}</span>
                        <span className="text-sm text-gray-600">{resource.usage}%</span>
                      </div>
                      <Progress 
                        value={resource.usage} 
                        className={`h-2 ${
                          resource.usage > 80 ? 'bg-red-100' :
                          resource.usage > 60 ? 'bg-yellow-100' : 'bg-green-100'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Tempo de Resposta */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Response Time</CardTitle>
                <CardDescription>Distribuição dos tempos de resposta</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={responseTimeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3b82f6" name="Porcentagem" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alertas Críticos */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Críticos Recentes</CardTitle>
              <CardDescription>Alertas que requerem atenção imediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceAlerts
                  .filter(alert => alert.severity === 'critical' || alert.severity === 'warning')
                  .slice(0, 3)
                  .map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(alert.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Investigar
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {/* Métricas Detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Monitoramento detalhado de todas as métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar métricas..." title="Buscar métricas" />
                  <Select 
                    title="Filtrar por categoria"
                    options={[
                      { value: 'all', label: 'Todas as Categorias' },
                      { value: 'system', label: 'Sistema' },
                      { value: 'application', label: 'Aplicação' },
                      { value: 'database', label: 'Banco de Dados' },
                      { value: 'network', label: 'Rede' },
                      { value: 'user', label: 'Usuário' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'healthy', label: 'Saudável' },
                      { value: 'warning', label: 'Atenção' },
                      { value: 'critical', label: 'Crítico' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="grid gap-4">
                  {performanceMetrics.map((metric) => (
                    <Card key={metric.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-3 rounded-lg ${
                              metric.category === 'system' ? 'bg-blue-100' :
                              metric.category === 'application' ? 'bg-green-100' :
                              metric.category === 'database' ? 'bg-purple-100' :
                              metric.category === 'network' ? 'bg-orange-100' :
                              'bg-gray-100'
                            }`}>
                              {metric.category === 'system' ? (
                                <Server className="h-6 w-6 text-blue-600" />
                              ) : metric.category === 'application' ? (
                                <Code className="h-6 w-6 text-green-600" />
                              ) : metric.category === 'database' ? (
                                <Database className="h-6 w-6 text-purple-600" />
                              ) : metric.category === 'network' ? (
                                <Network className="h-6 w-6 text-orange-600" />
                              ) : (
                                <Activity className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{metric.name}</h3>
                              <p className="text-gray-600">{metric.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold mb-2 ${
                              metric.status === 'healthy' ? 'text-green-600' :
                              metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {metric.value} {metric.unit}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(metric.status)}>
                                {metric.status}
                              </Badge>
                              {getTrendIcon(metric.trend)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600">Limite Aviso:</span>
                            <span className="ml-2 font-medium">{metric.threshold.warning} {metric.unit}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Limite Crítico:</span>
                            <span className="ml-2 font-medium">{metric.threshold.critical} {metric.unit}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Último Update:</span>
                            <span className="ml-2 font-medium">{formatDateTime(metric.lastUpdated)}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Recomendações:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {metric.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <Badge className={
                            metric.impact === 'critical' ? 'bg-red-100 text-red-800' :
                            metric.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                            metric.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            Impacto: {metric.impact}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Histórico
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Configurar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Recursos do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos do Sistema</CardTitle>
              <CardDescription>Monitoramento e gestão de recursos de infraestrutura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'cpu', label: 'CPU' },
                      { value: 'memory', label: 'Memória' },
                      { value: 'disk', label: 'Disco' },
                      { value: 'network', label: 'Rede' },
                      { value: 'database', label: 'Banco de Dados' },
                      { value: 'cache', label: 'Cache' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por localização"
                    options={[
                      { value: 'all', label: 'Todas as Localizações' },
                      { value: 'us-east-1', label: 'US East 1' },
                      { value: 'us-west-2', label: 'US West 2' },
                      { value: 'eu-west-1', label: 'EU West 1' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Recurso
                  </Button>
                </div>

                <div className="grid gap-6">
                  {systemResources.map((resource) => {
                    const ResourceIcon = getResourceIcon(resource.type)
                    
                    return (
                      <Card key={resource.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                resource.type === 'cpu' ? 'bg-blue-100' :
                                resource.type === 'database' ? 'bg-purple-100' :
                                resource.type === 'cache' ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <ResourceIcon className={`h-6 w-6 ${
                                  resource.type === 'cpu' ? 'text-blue-600' :
                                  resource.type === 'database' ? 'text-purple-600' :
                                  resource.type === 'cache' ? 'text-green-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{resource.name}</h3>
                                <p className="text-gray-600">{resource.location}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm">
                                  {Object.entries(resource.specifications).map(([key, value]) => (
                                    <span key={key} className="text-gray-500">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold mb-2 ${
                                resource.status === 'healthy' ? 'text-green-600' :
                                resource.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {resource.utilization}%
                              </div>
                              <Badge className={getStatusColor(resource.status)}>
                                {resource.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Utilização</span>
                              <span className="text-sm font-medium">{resource.utilization}%</span>
                            </div>
                            <Progress value={resource.utilization} className="h-2" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div>
                              <span className="text-gray-600">Carga Média:</span>
                              <span className="ml-2 font-medium">{resource.metrics.avgLoad}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pico de Carga:</span>
                              <span className="ml-2 font-medium">{resource.metrics.peakLoad}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Disponibilidade:</span>
                              <span className="ml-2 font-medium">{resource.metrics.availability}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Response Time:</span>
                              <span className="ml-2 font-medium">{resource.metrics.responseTime}ms</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              {resource.alerts > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                  {resource.alerts} alertas
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                Última manutenção: {formatDateTime(resource.lastMaintenance)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Monitor className="h-3 w-3 mr-1" />
                                Monitorar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Settings className="h-3 w-3 mr-1" />
                                Configurar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          {/* Testes de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Testes de Performance</CardTitle>
              <CardDescription>Execução e gestão de testes de carga e stress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'load', label: 'Teste de Carga' },
                      { value: 'stress', label: 'Teste de Stress' },
                      { value: 'volume', label: 'Teste de Volume' },
                      { value: 'endurance', label: 'Teste de Resistência' },
                      { value: 'spike', label: 'Teste de Pico' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'scheduled', label: 'Agendado' },
                      { value: 'running', label: 'Executando' },
                      { value: 'completed', label: 'Concluído' },
                      { value: 'failed', label: 'Falhou' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Teste
                  </Button>
                </div>

                <div className="grid gap-6">
                  {performanceTests.map((test) => (
                    <Card key={test.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{test.name}</h3>
                            <p className="text-gray-600">
                              Tipo: {test.type} • Ambiente: {test.configuration.environment}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(test.status)}>
                              {test.status}
                            </Badge>
                            {test.status === 'running' && (
                              <div className="mt-2">
                                <Progress value={test.progress} className="w-24 h-2" />
                                <span className="text-xs text-gray-500">{test.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Usuários:</span>
                            <span className="ml-2 font-medium">{formatNumber(test.target.users)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Requisições:</span>
                            <span className="ml-2 font-medium">{formatNumber(test.target.requests)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duração:</span>
                            <span className="ml-2 font-medium">{test.target.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ramp-up:</span>
                            <span className="ml-2 font-medium">{test.target.rampUp}</span>
                          </div>
                        </div>

                        {test.results && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Resultados:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Response Time Médio:</span>
                                <span className="ml-2 font-medium">{test.results.avgResponseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Throughput:</span>
                                <span className="ml-2 font-medium">{test.results.throughput} req/s</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Taxa de Sucesso:</span>
                                <span className="ml-2 font-medium">{test.results.successRate}%</span>
                              </div>
                            </div>
                            {test.results.bottlenecks.length > 0 && (
                              <div className="mt-3">
                                <h5 className="font-medium mb-1">Gargalos Identificados:</h5>
                                <ul className="list-disc list-inside text-sm">
                                  {test.results.bottlenecks.map((bottleneck, index) => (
                                    <li key={index}>{bottleneck}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Cenários de Teste:</h4>
                          <div className="flex flex-wrap gap-2">
                            {test.configuration.scenarios.map((scenario, index) => (
                              <Badge key={index} variant="secondary">
                                {scenario}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">
                            Iniciado: {formatDateTime(test.startTime)}
                            {test.endTime && ` • Concluído: ${formatDateTime(test.endTime)}`}
                          </span>
                          <div className="flex space-x-2">
                            {test.status === 'running' && (
                              <Button size="sm" variant="secondary">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            )}
                            <Button size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                            {test.reports.length > 0 && (
                              <Button variant="secondary" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Relatórios
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Regras de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Otimização</CardTitle>
              <CardDescription>Automação e regras para otimização de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por categoria"
                    options={[
                      { value: 'all', label: 'Todas as Categorias' },
                      { value: 'caching', label: 'Cache' },
                      { value: 'database', label: 'Banco de Dados' },
                      { value: 'frontend', label: 'Frontend' },
                      { value: 'api', label: 'API' },
                      { value: 'infrastructure', label: 'Infraestrutura' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por prioridade"
                    options={[
                      { value: 'all', label: 'Todas as Prioridades' },
                      { value: 'critical', label: 'Crítica' },
                      { value: 'high', label: 'Alta' },
                      { value: 'medium', label: 'Média' },
                      { value: 'low', label: 'Baixa' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                </div>

                <div className="grid gap-4">
                  {optimizationRules.map((rule) => (
                    <Card key={rule.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <p className="text-gray-600">{rule.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={
                                rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {rule.priority}
                              </Badge>
                              <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {rule.isActive ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Categoria: {rule.category}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <h4 className="font-semibold mb-2">Condições:</h4>
                            <div className="space-y-1">
                              {rule.conditions.map((condition, index) => (
                                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                  <code>
                                    {condition.metric} {condition.operator} {
                                      Array.isArray(condition.value) 
                                        ? condition.value.join(' - ') 
                                        : condition.value
                                    }
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Ações:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rule.actions.map((action, index) => (
                                <Badge key={index} variant="secondary">
                                  {action.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Disparada:</span>
                            <span className="ml-2 font-medium">{rule.metrics.triggered}x</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sucessos:</span>
                            <span className="ml-2 font-medium">{rule.metrics.successful}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Falhas:</span>
                            <span className="ml-2 font-medium">{rule.metrics.failed}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Último Disparo:</span>
                            <span className="ml-2 font-medium">
                              {rule.metrics.lastTriggered ? formatDateTime(rule.metrics.lastTriggered) : 'Nunca'}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Impacto Estimado:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Melhoria:</span>
                              <span className="ml-2 font-medium text-green-600">+{rule.impact.estimatedImprovement}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Redução de Custo:</span>
                              <span className="ml-2 font-medium text-blue-600">{rule.impact.costReduction}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">UX:</span>
                              <span className="ml-2 font-medium">{rule.impact.userExperience}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <Badge variant="secondary">{rule.category}</Badge>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Executar
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button variant="secondary" size="sm">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Estatísticas
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alertas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Performance</CardTitle>
              <CardDescription>Monitoramento e gestão de alertas de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por severidade"
                    options={[
                      { value: 'all', label: 'Todas as Severidades' },
                      { value: 'info', label: 'Informação' },
                      { value: 'warning', label: 'Atenção' },
                      { value: 'critical', label: 'Crítico' },
                      { value: 'emergency', label: 'Emergência' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'open', label: 'Aberto' },
                      { value: 'acknowledged', label: 'Reconhecido' },
                      { value: 'investigating', label: 'Investigando' },
                      { value: 'resolved', label: 'Resolvido' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="grid gap-4">
                  {performanceAlerts.map((alert) => (
                    <Card key={alert.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-gray-600">{alert.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(alert.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Sistemas Afetados:</p>
                            <div className="flex flex-wrap gap-2">
                              {alert.affectedSystems.map((system, index) => (
                                <Badge key={index} variant="secondary">
                                  {system}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Valor Atual:</span>
                              <span className="ml-2 font-medium">{alert.metrics.current}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Limite:</span>
                              <span className="ml-2 font-medium">{alert.metrics.threshold}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Escalação:</span>
                              <span className="ml-2 font-medium">Nível {alert.escalationLevel}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Recomendações:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {alert.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Impacto:</strong> {alert.metrics.impact}
                            </p>
                            {alert.assignedTo && (
                              <p className="text-sm text-gray-600">
                                <strong>Atribuído a:</strong> {alert.assignedTo}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              ID: {alert.id}
                            </span>
                            <div className="flex space-x-2">
                              {alert.status === 'open' && (
                                <Button size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Reconhecer
                                </Button>
                              )}
                              <Button variant="secondary" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Investigar
                              </Button>
                              {alert.status !== 'resolved' && (
                                <Button variant="secondary" size="sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Resolver
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PerformanceCenter
