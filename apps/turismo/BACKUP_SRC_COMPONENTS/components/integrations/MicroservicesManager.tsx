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
  Server,
  Cpu,
  Database,
  Network,
  Cloud,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Monitor,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  GitBranch,
  Package,
  Code,
  Terminal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Zap,
  Shield,
  Globe,
  Router,
  Users,
  Calendar,
  MapPin,
  Gauge,
  FileText,
  Link2,
  Workflow,
  Container,
  HardDrive,
  Memory
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
  RadialBar
} from 'recharts'

// Tipos para Microsserviços
interface Microservice {
  id: string
  name: string
  description: string
  version: string
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping' | 'deploying'
  health: 'healthy' | 'unhealthy' | 'degraded' | 'unknown'
  port: number
  instances: number
  activeInstances: number
  cpu: number
  memory: number
  disk: number
  uptime: string
  lastDeployed: string
  repository: string
  branch: string
  commit: string
  environment: 'development' | 'staging' | 'production'
  dependencies: string[]
  endpoints: string[]
  metrics: {
    requests: number
    errors: number
    responseTime: number
    throughput: number
  }
  logs: ServiceLog[]
  configs: Record<string, string>
}

interface ServiceLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source: string
  metadata?: Record<string, any>
}

interface ServiceMetrics {
  serviceId: string
  timestamp: string
  cpu: number
  memory: number
  requests: number
  errors: number
  responseTime: number
  diskUsage: number
  networkIn: number
  networkOut: number
}

interface DeploymentConfig {
  id: string
  serviceName: string
  strategy: 'blue_green' | 'rolling' | 'canary' | 'recreate'
  replicas: number
  autoScaling: {
    enabled: boolean
    minReplicas: number
    maxReplicas: number
    targetCPU: number
    targetMemory: number
  }
  resources: {
    cpu: string
    memory: string
    storage: string
  }
  healthCheck: {
    enabled: boolean
    path: string
    interval: number
    timeout: number
    retries: number
  }
  environment: Record<string, string>
}

interface ServiceTopology {
  services: {
    id: string
    name: string
    x: number
    y: number
    connections: string[]
  }[]
  connections: {
    from: string
    to: string
    type: 'http' | 'grpc' | 'message_queue' | 'database'
    latency: number
  }[]
}

const MicroservicesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedService, setSelectedService] = useState<Microservice | null>(null)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)

  // Dados mock para demonstração
  const [microservices] = useState<Microservice[]>([
    {
      id: '1',
      name: 'auth-service',
      description: 'Serviço de autenticação e autorização',
      version: 'v1.2.3',
      status: 'running',
      health: 'healthy',
      port: 3001,
      instances: 3,
      activeInstances: 3,
      cpu: 45,
      memory: 512,
      disk: 2048,
      uptime: '7d 14h 32m',
      lastDeployed: '2025-01-10T08:30:00Z',
      repository: 'https://github.com/company/auth-service',
      branch: 'main',
      commit: 'a1b2c3d4',
      environment: 'production',
      dependencies: ['redis', 'postgresql'],
      endpoints: ['/health', '/auth/login', '/auth/verify', '/auth/refresh'],
      metrics: {
        requests: 15678,
        errors: 23,
        responseTime: 145,
        throughput: 1200
      },
      logs: [],
      configs: {
        'JWT_SECRET': '***',
        'DB_HOST': 'auth-db.internal',
        'REDIS_URL': 'redis://auth-redis:6379'
      }
    },
    {
      id: '2',
      name: 'booking-service',
      description: 'Gerenciamento de reservas e disponibilidade',
      version: 'v2.1.0',
      status: 'running',
      health: 'healthy',
      port: 3002,
      instances: 5,
      activeInstances: 4,
      cpu: 67,
      memory: 1024,
      disk: 4096,
      uptime: '12d 8h 15m',
      lastDeployed: '2025-01-08T16:45:00Z',
      repository: 'https://github.com/company/booking-service',
      branch: 'main',
      commit: 'e5f6g7h8',
      environment: 'production',
      dependencies: ['postgresql', 'rabbitmq'],
      endpoints: ['/health', '/bookings', '/availability', '/rooms'],
      metrics: {
        requests: 23456,
        errors: 45,
        responseTime: 89,
        throughput: 2100
      },
      logs: [],
      configs: {
        'DB_HOST': 'booking-db.internal',
        'RABBITMQ_URL': 'amqp://booking-queue:5672'
      }
    },
    {
      id: '3',
      name: 'payment-service',
      description: 'Processamento de pagamentos e transações',
      version: 'v1.5.2',
      status: 'error',
      health: 'unhealthy',
      port: 3003,
      instances: 2,
      activeInstances: 1,
      cpu: 89,
      memory: 768,
      disk: 3072,
      uptime: '2d 4h 12m',
      lastDeployed: '2025-01-13T10:20:00Z',
      repository: 'https://github.com/company/payment-service',
      branch: 'hotfix/payment-gateway',
      commit: 'i9j0k1l2',
      environment: 'production',
      dependencies: ['postgresql', 'stripe-api'],
      endpoints: ['/health', '/payments', '/refunds', '/webhooks'],
      metrics: {
        requests: 8901,
        errors: 234,
        responseTime: 256,
        throughput: 450
      },
      logs: [],
      configs: {
        'STRIPE_SECRET_KEY': '***',
        'DB_HOST': 'payment-db.internal',
        'WEBHOOK_SECRET': '***'
      }
    },
    {
      id: '4',
      name: 'notification-service',
      description: 'Envio de notificações e mensagens',
      version: 'v1.0.8',
      status: 'running',
      health: 'degraded',
      port: 3004,
      instances: 2,
      activeInstances: 2,
      cpu: 23,
      memory: 384,
      disk: 1024,
      uptime: '5d 12h 45m',
      lastDeployed: '2025-01-11T14:15:00Z',
      repository: 'https://github.com/company/notification-service',
      branch: 'main',
      commit: 'm3n4o5p6',
      environment: 'production',
      dependencies: ['redis', 'sendgrid', 'firebase'],
      endpoints: ['/health', '/notifications', '/templates', '/delivery'],
      metrics: {
        requests: 34567,
        errors: 156,
        responseTime: 67,
        throughput: 3200
      },
      logs: [],
      configs: {
        'SENDGRID_API_KEY': '***',
        'FIREBASE_KEY': '***',
        'REDIS_URL': 'redis://notification-redis:6379'
      }
    },
    {
      id: '5',
      name: 'analytics-service',
      description: 'Coleta e processamento de dados analíticos',
      version: 'v3.0.1',
      status: 'deploying',
      health: 'unknown',
      port: 3005,
      instances: 4,
      activeInstances: 2,
      cpu: 12,
      memory: 2048,
      disk: 8192,
      uptime: '0d 0h 5m',
      lastDeployed: '2025-01-15T14:35:00Z',
      repository: 'https://github.com/company/analytics-service',
      branch: 'feature/real-time-analytics',
      commit: 'q7r8s9t0',
      environment: 'production',
      dependencies: ['clickhouse', 'kafka', 'elasticsearch'],
      endpoints: ['/health', '/events', '/metrics', '/dashboards'],
      metrics: {
        requests: 567,
        errors: 12,
        responseTime: 234,
        throughput: 890
      },
      logs: [],
      configs: {
        'CLICKHOUSE_HOST': 'analytics-db.internal',
        'KAFKA_BROKERS': 'kafka-1:9092,kafka-2:9092',
        'ELASTICSEARCH_URL': 'http://elasticsearch:9200'
      }
    }
  ])

  // Dados para gráficos
  const systemMetricsData = [
    { time: '00:00', cpu: 45, memory: 62, requests: 1200 },
    { time: '04:00', cpu: 34, memory: 58, requests: 890 },
    { time: '08:00', cpu: 67, memory: 71, requests: 2100 },
    { time: '12:00', cpu: 78, memory: 84, requests: 3400 },
    { time: '16:00', cpu: 56, memory: 67, requests: 2800 },
    { time: '20:00', cpu: 43, memory: 59, requests: 1650 }
  ]

  const serviceDistributionData = [
    { name: 'Running', value: 60, color: '#10b981' },
    { name: 'Deploying', value: 20, color: '#3b82f6' },
    { name: 'Error', value: 15, color: '#ef4444' },
    { name: 'Stopped', value: 5, color: '#6b7280' }
  ]

  const resourceUsageData = [
    { service: 'auth-service', cpu: 45, memory: 512 },
    { service: 'booking-service', cpu: 67, memory: 1024 },
    { service: 'payment-service', cpu: 89, memory: 768 },
    { service: 'notification-service', cpu: 23, memory: 384 },
    { service: 'analytics-service', cpu: 12, memory: 2048 }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'stopped': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'starting': return 'bg-blue-100 text-blue-800'
      case 'stopping': return 'bg-yellow-100 text-yellow-800'
      case 'deploying': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'unhealthy': return 'bg-red-100 text-red-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'unknown': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Play
      case 'stopped': return Square
      case 'error': return AlertTriangle
      case 'starting': return RefreshCw
      case 'stopping': return Pause
      case 'deploying': return Upload
      default: return Clock
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800'
      case 'staging': return 'bg-yellow-100 text-yellow-800'
      case 'development': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Microsserviços</h1>
          <p className="text-gray-600">Orquestração e monitoramento de arquitetura de microsserviços</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsDeployModalOpen(!isDeployModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Deploy Serviço
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Logs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="topology">Topologia</TabsTrigger>
          <TabsTrigger value="deployment">Deploy</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs dos Microsserviços */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Serviços</CardTitle>
                <Server className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {microservices.length}
                </div>
                <p className="text-xs text-gray-600">
                  {microservices.filter(s => s.status === 'running').length} em execução
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instâncias Ativas</CardTitle>
                <Container className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {microservices.reduce((sum, s) => sum + s.activeInstances, 0)}
                </div>
                <p className="text-xs text-gray-600">
                  de {microservices.reduce((sum, s) => sum + s.instances, 0)} configuradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Médio</CardTitle>
                <Cpu className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(microservices.reduce((sum, s) => sum + s.cpu, 0) / microservices.length)}%
                </div>
                <p className="text-xs text-gray-600">
                  Todos os serviços
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requisições/h</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(microservices.reduce((sum, s) => sum + s.metrics.requests, 0))}
                </div>
                <p className="text-xs text-gray-600">
                  Última hora
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Métricas do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas do Sistema</CardTitle>
              <CardDescription>Performance geral dos microsserviços</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={systemMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={3} name="Memória %" />
                  <Line type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={3} name="Requisições" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status dos Serviços */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {serviceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Uso de Recursos */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
                <CardDescription>CPU e Memória por serviço</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={resourceUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cpu" fill="#3b82f6" name="CPU %" />
                    <Bar dataKey="memory" fill="#10b981" name="Memória MB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Serviços com Problemas */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas e Problemas</CardTitle>
              <CardDescription>Serviços que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {microservices
                  .filter(s => s.status === 'error' || s.health === 'unhealthy' || s.health === 'degraded')
                  .map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">
                            Status: {service.status} • Health: {service.health}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Logs
                        </Button>
                        <Button variant="secondary" size="sm">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restart
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Lista de Microsserviços */}
          <div className="grid gap-6">
            {microservices.map((service) => {
              const StatusIcon = getStatusIcon(service.status)
              const instancesPercentage = (service.activeInstances / service.instances) * 100

              return (
                <Card key={service.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <Server className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{service.name}</h3>
                          <p className="text-gray-600">{service.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge>v{service.version}</Badge>
                            <Badge className={getEnvironmentColor(service.environment)}>
                              {service.environment}
                            </Badge>
                            <span className="text-sm text-gray-500">Port: {service.port}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(service.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {service.status}
                        </Badge>
                        <Badge className={getHealthColor(service.health)}>
                          {service.health}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Instâncias</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-blue-600">
                            {service.activeInstances}/{service.instances}
                          </p>
                          <Progress value={instancesPercentage} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">CPU</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-green-600">{service.cpu}%</p>
                          <Progress value={service.cpu} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Memória</p>
                        <p className="text-lg font-bold text-purple-600">{formatBytes(service.memory * 1024 * 1024)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Requests</p>
                        <p className="text-lg font-bold text-orange-600">{formatNumber(service.metrics.requests)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tempo Resp.</p>
                        <p className="text-lg font-bold text-red-600">{service.metrics.responseTime}ms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-lg font-bold text-indigo-600">{service.uptime}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Dependências:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.dependencies.map((dep, index) => (
                            <Badge key={index} variant="secondary">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Endpoints:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.endpoints.map((endpoint, index) => (
                            <Badge key={index} variant="secondary">
                              {endpoint}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Repositório:</span>
                          <span className="ml-2 font-mono text-blue-600">{service.repository}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Branch:</span>
                          <span className="ml-2 font-mono">{service.branch}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Commit:</span>
                          <span className="ml-2 font-mono">{service.commit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deploy:</span>
                          <span className="ml-2">{formatDateTime(service.lastDeployed)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Errors:</span>
                            <span className="ml-1 font-medium text-red-600">{service.metrics.errors}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Throughput:</span>
                            <span className="ml-1 font-medium">{service.metrics.throughput}/min</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Logs
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Monitor className="h-3 w-3 mr-1" />
                            Métricas
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
                          </Button>
                          {service.status === 'running' ? (
                            <Button variant="secondary" size="sm">
                              <Pause className="h-3 w-3 mr-1" />
                              Parar
                            </Button>
                          ) : (
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="topology" className="space-y-6">
          {/* Topologia dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>Topologia dos Microsserviços</CardTitle>
              <CardDescription>Mapa visual das conexões entre serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Simulação visual da topologia */}
                <div className="absolute inset-4">
                  {/* Auth Service */}
                  <div className="absolute top-4 left-1/4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Auth Service
                    <div className="text-xs opacity-75">:3001</div>
                  </div>
                  
                  {/* Booking Service */}
                  <div className="absolute top-1/3 right-1/4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Booking Service
                    <div className="text-xs opacity-75">:3002</div>
                  </div>
                  
                  {/* Payment Service */}
                  <div className="absolute bottom-1/3 left-1/3 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Payment Service
                    <div className="text-xs opacity-75">:3003</div>
                  </div>
                  
                  {/* Notification Service */}
                  <div className="absolute bottom-4 right-1/3 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Notification Service
                    <div className="text-xs opacity-75">:3004</div>
                  </div>
                  
                  {/* Analytics Service */}
                  <div className="absolute top-1/2 left-1/2 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Analytics Service
                    <div className="text-xs opacity-75">:3005</div>
                  </div>

                  {/* Linhas de conexão simuladas */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                      </marker>
                    </defs>
                    {/* Linhas conectando os serviços */}
                    <line x1="25%" y1="15%" x2="50%" y2="50%" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="75%" y1="35%" x2="50%" y2="50%" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="33%" y1="65%" x2="50%" y2="50%" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="67%" y1="85%" x2="50%" y2="50%" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                </div>
                
                <div className="text-center text-gray-500">
                  <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Topologia Visual dos Microsserviços</p>
                  <p className="text-xs">Conexões em tempo real entre os serviços</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Conectividade */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Conectividade</CardTitle>
              <CardDescription>Métricas de comunicação entre serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Conexões Ativas</h4>
                  <div className="text-3xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-600">Entre todos os serviços</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Latência Média</h4>
                  <div className="text-3xl font-bold text-green-600">45ms</div>
                  <div className="text-sm text-gray-600">Comunicação inter-serviços</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Taxa de Falha</h4>
                  <div className="text-3xl font-bold text-orange-600">0.3%</div>
                  <div className="text-sm text-gray-600">Conexões com erro</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          {/* Configuração de Deploy */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Deploy</CardTitle>
              <CardDescription>Estratégias e configurações de deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Estratégias de Deploy</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Blue/Green', description: 'Deploy paralelo com troca instantânea', active: false },
                        { name: 'Rolling Update', description: 'Atualização gradual das instâncias', active: true },
                        { name: 'Canary', description: 'Deploy incremental com validação', active: false },
                        { name: 'Recreate', description: 'Para e recria todas as instâncias', active: false }
                      ].map((strategy, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{strategy.name}</p>
                            <p className="text-sm text-gray-600">{strategy.description}</p>
                          </div>
                          <Badge className={strategy.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {strategy.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Auto Scaling</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <Badge className="bg-green-100 text-green-800">Habilitado</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>CPU Target</span>
                        <span className="font-medium">70%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Memory Target</span>
                        <span className="font-medium">80%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Min Replicas</span>
                        <span className="font-medium">2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max Replicas</span>
                        <span className="font-medium">10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Histórico de Deployments</h3>
                  <div className="space-y-3">
                    {[
                      { service: 'analytics-service', version: 'v3.0.1', status: 'success', time: '2025-01-15T14:35:00Z', duration: '3m 45s' },
                      { service: 'payment-service', version: 'v1.5.2', status: 'failed', time: '2025-01-13T10:20:00Z', duration: '1m 12s' },
                      { service: 'notification-service', version: 'v1.0.8', status: 'success', time: '2025-01-11T14:15:00Z', duration: '2m 30s' },
                      { service: 'booking-service', version: 'v2.1.0', status: 'success', time: '2025-01-08T16:45:00Z', duration: '4m 18s' }
                    ].map((deploy, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${deploy.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium">{deploy.service}</p>
                            <p className="text-sm text-gray-600">v{deploy.version}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-600">{formatDateTime(deploy.time)}</p>
                          <p className="font-medium">{deploy.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoramento Avançado */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Performance</CardTitle>
              <CardDescription>Métricas detalhadas dos microsserviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold mb-1">CPU Total</h4>
                    <div className="text-2xl font-bold text-blue-600">47%</div>
                    <Progress value={47} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Memory className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold mb-1">Memória Total</h4>
                    <div className="text-2xl font-bold text-green-600">4.7GB</div>
                    <Progress value={68} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold mb-1">Disco Total</h4>
                    <div className="text-2xl font-bold text-purple-600">18.4GB</div>
                    <Progress value={35} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Network className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-semibold mb-1">Network I/O</h4>
                    <div className="text-2xl font-bold text-orange-600">2.3MB/s</div>
                    <Progress value={23} className="mt-2 h-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Serviços com Alta Utilização</h4>
                  <div className="space-y-3">
                    {microservices
                      .filter(s => s.cpu > 60 || s.memory > 1000)
                      .map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 border-l-4 border-l-orange-500 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-gray-600">
                                CPU: {service.cpu}% • Memória: {formatBytes(service.memory * 1024 * 1024)}
                              </p>
                            </div>
                          </div>
                          <Button size="sm">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Escalar
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">SLA e Disponibilidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {microservices.slice(0, 4).map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">{service.name}</h5>
                          <Badge className={service.health === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {((1 - service.metrics.errors / service.metrics.requests) * 100).toFixed(2)}% SLA
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Uptime:</span>
                            <span className="font-medium">{service.uptime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Requests:</span>
                            <span className="font-medium">{formatNumber(service.metrics.requests)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Errors:</span>
                            <span className="font-medium text-red-600">{service.metrics.errors}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Response Time:</span>
                            <span className="font-medium">{service.metrics.responseTime}ms</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Sistema de Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Logs dos Microsserviços</CardTitle>
              <CardDescription>Monitoramento e análise de logs em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Selecionar serviço"
                    options={[
                      { value: 'all', label: 'Todos os Serviços' },
                      ...microservices.map(s => ({ value: s.id, label: s.name }))
                    ]}
                  />
                  <Select 
                    title="Nível de log"
                    options={[
                      { value: 'all', label: 'Todos os Níveis' },
                      { value: 'error', label: 'Error' },
                      { value: 'warn', label: 'Warning' },
                      { value: 'info', label: 'Info' },
                      { value: 'debug', label: 'Debug' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button variant="secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
                  <div className="space-y-1">
                    <div>[2025-01-15 14:35:42] <span className="text-blue-400">INFO</span> auth-service: User authentication successful for user_id=12345</div>
                    <div>[2025-01-15 14:35:41] <span className="text-yellow-400">WARN</span> payment-service: High response time detected: 256ms</div>
                    <div>[2025-01-15 14:35:40] <span className="text-red-400">ERROR</span> payment-service: Failed to connect to Stripe API: Connection timeout</div>
                    <div>[2025-01-15 14:35:39] <span className="text-blue-400">INFO</span> booking-service: New booking created: booking_id=BK789</div>
                    <div>[2025-01-15 14:35:38] <span className="text-blue-400">INFO</span> notification-service: Email sent successfully to user@example.com</div>
                    <div>[2025-01-15 14:35:37] <span className="text-yellow-400">WARN</span> analytics-service: Memory usage above 80%: 1638MB/2048MB</div>
                    <div>[2025-01-15 14:35:36] <span className="text-blue-400">INFO</span> auth-service: JWT token refreshed for user_id=67890</div>
                    <div>[2025-01-15 14:35:35] <span className="text-green-400">DEBUG</span> booking-service: Database query executed in 45ms</div>
                    <div>[2025-01-15 14:35:34] <span className="text-red-400">ERROR</span> notification-service: Failed to send push notification: Invalid device token</div>
                    <div>[2025-01-15 14:35:33] <span className="text-blue-400">INFO</span> analytics-service: Processing batch of 1000 events</div>
                    <div>[2025-01-15 14:35:32] <span className="text-yellow-400">WARN</span> auth-service: Rate limit exceeded for IP 192.168.1.100</div>
                    <div>[2025-01-15 14:35:31] <span className="text-blue-400">INFO</span> payment-service: Payment processed successfully: transaction_id=TX456</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Total Logs</span>
                      <span className="font-bold">12,345</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Errors (24h)</span>
                      <span className="font-bold text-red-600">23</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Warnings (24h)</span>
                      <span className="font-bold text-yellow-600">156</span>
                    </div>
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

export default MicroservicesManager
