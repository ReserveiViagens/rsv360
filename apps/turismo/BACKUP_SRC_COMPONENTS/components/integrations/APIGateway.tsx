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
  Globe,
  Zap,
  Shield,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Key,
  Lock,
  Unlock,
  Server,
  Database,
  Cloud,
  Network,
  Router,
  Layers,
  Code,
  Monitor,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Gauge,
  Terminal,
  FileText,
  Link2,
  Webhook,
  GitBranch,
  Cpu
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
  RadialBarChart,
  RadialBar
} from 'recharts'

// Tipos para API Gateway
interface APIEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  service: string
  version: string
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated'
  authentication: 'none' | 'api_key' | 'oauth2' | 'jwt' | 'basic'
  rateLimit: {
    requests: number
    window: string
    current: number
  }
  responseTime: number
  uptime: number
  lastCall: string
  totalCalls: number
  errorRate: number
  documentation: string
  tags: string[]
}

interface APIRoute {
  id: string
  path: string
  method: string
  description: string
  parameters: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  responses: {
    code: number
    description: string
    example: string
  }[]
  middleware: string[]
  rateLimiting: boolean
  caching: boolean
  authentication: boolean
}

interface APIMetrics {
  id: string
  endpointId: string
  timestamp: string
  responseTime: number
  statusCode: number
  requestSize: number
  responseSize: number
  userAgent: string
  ipAddress: string
  error?: string
}

interface APIConfiguration {
  id: string
  name: string
  baseUrl: string
  timeout: number
  retries: number
  circuitBreaker: {
    enabled: boolean
    threshold: number
    timeout: number
  }
  loadBalancing: {
    enabled: boolean
    strategy: 'round_robin' | 'least_connections' | 'weighted'
    servers: string[]
  }
  caching: {
    enabled: boolean
    ttl: number
    strategy: 'memory' | 'redis' | 'database'
  }
  monitoring: {
    enabled: boolean
    alertThresholds: {
      responseTime: number
      errorRate: number
      uptime: number
    }
  }
}

interface ExternalService {
  id: string
  name: string
  provider: string
  category: 'payment' | 'email' | 'sms' | 'storage' | 'analytics' | 'maps' | 'social' | 'other'
  status: 'connected' | 'disconnected' | 'error' | 'configuring'
  apiKey: string
  baseUrl: string
  documentation: string
  version: string
  lastSync: string
  totalRequests: number
  successRate: number
  avgResponseTime: number
  monthlyQuota: number
  usedQuota: number
  features: string[]
}

const APIGateway: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  // Dados mock para demonstração
  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'User Authentication API',
      url: '/api/v1/auth',
      method: 'POST',
      service: 'Auth Service',
      version: 'v1.2.0',
      status: 'active',
      authentication: 'jwt',
      rateLimit: {
        requests: 1000,
        window: '1h',
        current: 234
      },
      responseTime: 145,
      uptime: 99.8,
      lastCall: '2025-01-15T14:30:00Z',
      totalCalls: 15678,
      errorRate: 0.5,
      documentation: '/docs/auth',
      tags: ['authentication', 'security', 'users']
    },
    {
      id: '2',
      name: 'Booking Management API',
      url: '/api/v2/bookings',
      method: 'GET',
      service: 'Booking Service',
      version: 'v2.1.0',
      status: 'active',
      authentication: 'api_key',
      rateLimit: {
        requests: 500,
        window: '1h',
        current: 123
      },
      responseTime: 89,
      uptime: 99.9,
      lastCall: '2025-01-15T14:25:00Z',
      totalCalls: 23456,
      errorRate: 0.2,
      documentation: '/docs/bookings',
      tags: ['bookings', 'reservations', 'hotel']
    },
    {
      id: '3',
      name: 'Payment Processing API',
      url: '/api/v1/payments',
      method: 'POST',
      service: 'Payment Service',
      version: 'v1.5.0',
      status: 'maintenance',
      authentication: 'oauth2',
      rateLimit: {
        requests: 200,
        window: '1h',
        current: 45
      },
      responseTime: 234,
      uptime: 98.7,
      lastCall: '2025-01-15T13:45:00Z',
      totalCalls: 8901,
      errorRate: 1.2,
      documentation: '/docs/payments',
      tags: ['payments', 'finance', 'transactions']
    },
    {
      id: '4',
      name: 'Notification Service API',
      url: '/api/v1/notifications',
      method: 'POST',
      service: 'Notification Service',
      version: 'v1.0.0',
      status: 'active',
      authentication: 'api_key',
      rateLimit: {
        requests: 2000,
        window: '1h',
        current: 567
      },
      responseTime: 67,
      uptime: 99.5,
      lastCall: '2025-01-15T14:28:00Z',
      totalCalls: 34567,
      errorRate: 0.8,
      documentation: '/docs/notifications',
      tags: ['notifications', 'messaging', 'alerts']
    }
  ])

  const [externalServices] = useState<ExternalService[]>([
    {
      id: '1',
      name: 'Stripe Payment Gateway',
      provider: 'Stripe',
      category: 'payment',
      status: 'connected',
      apiKey: 'sk_live_***********',
      baseUrl: 'https://api.stripe.com',
      documentation: 'https://stripe.com/docs',
      version: '2023-10-16',
      lastSync: '2025-01-15T14:00:00Z',
      totalRequests: 12345,
      successRate: 99.8,
      avgResponseTime: 156,
      monthlyQuota: 100000,
      usedQuota: 12345,
      features: ['payments', 'subscriptions', 'invoices', 'customers']
    },
    {
      id: '2',
      name: 'SendGrid Email Service',
      provider: 'SendGrid',
      category: 'email',
      status: 'connected',
      apiKey: 'SG.***********',
      baseUrl: 'https://api.sendgrid.com',
      documentation: 'https://docs.sendgrid.com',
      version: 'v3',
      lastSync: '2025-01-15T13:45:00Z',
      totalRequests: 8901,
      successRate: 99.2,
      avgResponseTime: 89,
      monthlyQuota: 50000,
      usedQuota: 8901,
      features: ['transactional_email', 'marketing_campaigns', 'templates']
    },
    {
      id: '3',
      name: 'Google Maps API',
      provider: 'Google',
      category: 'maps',
      status: 'connected',
      apiKey: 'AIza***********',
      baseUrl: 'https://maps.googleapis.com',
      documentation: 'https://developers.google.com/maps',
      version: 'v1',
      lastSync: '2025-01-15T14:15:00Z',
      totalRequests: 5678,
      successRate: 99.9,
      avgResponseTime: 123,
      monthlyQuota: 25000,
      usedQuota: 5678,
      features: ['geocoding', 'directions', 'places', 'maps']
    },
    {
      id: '4',
      name: 'AWS S3 Storage',
      provider: 'Amazon',
      category: 'storage',
      status: 'error',
      apiKey: 'AKIA***********',
      baseUrl: 'https://s3.amazonaws.com',
      documentation: 'https://docs.aws.amazon.com/s3',
      version: '2006-03-01',
      lastSync: '2025-01-15T12:30:00Z',
      totalRequests: 3456,
      successRate: 97.8,
      avgResponseTime: 234,
      monthlyQuota: 1000000,
      usedQuota: 345600,
      features: ['file_storage', 'cdn', 'backup', 'static_hosting']
    }
  ])

  // Dados para gráficos
  const apiMetricsData = [
    { time: '00:00', requests: 145, errors: 2, responseTime: 156 },
    { time: '04:00', requests: 89, errors: 1, responseTime: 134 },
    { time: '08:00', requests: 267, errors: 5, responseTime: 178 },
    { time: '12:00', requests: 456, errors: 8, responseTime: 203 },
    { time: '16:00', requests: 389, errors: 3, responseTime: 167 },
    { time: '20:00', requests: 234, errors: 4, responseTime: 189 }
  ]

  const endpointUsageData = [
    { name: 'Auth API', requests: 15678, errors: 78 },
    { name: 'Booking API', requests: 23456, errors: 47 },
    { name: 'Payment API', requests: 8901, errors: 107 },
    { name: 'Notification API', requests: 34567, errors: 276 }
  ]

  const statusDistributionData = [
    { name: 'Ativo', value: 75, color: '#10b981' },
    { name: 'Manutenção', value: 15, color: '#f59e0b' },
    { name: 'Inativo', value: 8, color: '#ef4444' },
    { name: 'Depreciado', value: 2, color: '#6b7280' }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'connected': 
        return 'bg-green-100 text-green-800'
      case 'inactive': 
      case 'disconnected': 
        return 'bg-gray-100 text-gray-800'
      case 'maintenance': 
      case 'configuring': 
        return 'bg-yellow-100 text-yellow-800'
      case 'deprecated': 
      case 'error': 
        return 'bg-red-100 text-red-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': 
      case 'connected': 
        return CheckCircle
      case 'inactive': 
      case 'disconnected': 
        return Clock
      case 'maintenance': 
      case 'configuring': 
        return Settings
      case 'deprecated': 
      case 'error': 
        return AlertTriangle
      default: 
        return Clock
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'POST': return 'bg-green-100 text-green-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'PATCH': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return Database
      case 'email': return ArrowUpDown
      case 'sms': return ArrowUpDown
      case 'storage': return Cloud
      case 'analytics': return BarChart3
      case 'maps': return MapPin
      case 'social': return Users
      default: return Globe
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Gateway</h1>
          <p className="text-gray-600">Gateway centralizado para gerenciar APIs externas e microsserviços</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsConfigModalOpen(!isConfigModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova API
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="routing">Roteamento</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs do Gateway */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de APIs</CardTitle>
                <Globe className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {endpoints.length + externalServices.length}
                </div>
                <p className="text-xs text-gray-600">
                  {endpoints.filter(e => e.status === 'active').length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requisições/Hora</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(2456)}
                </div>
                <p className="text-xs text-gray-600">
                  +12% vs hora anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
                <Zap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">156ms</div>
                <p className="text-xs text-gray-600">
                  Média últimas 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">0.7%</div>
                <p className="text-xs text-gray-600">
                  Últimas 24 horas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Métricas */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance das APIs</CardTitle>
              <CardDescription>Requisições e tempo de resposta ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={apiMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} name="Requisições" />
                  <Line type="monotone" dataKey="responseTime" stroke="#10b981" strokeWidth={3} name="Tempo Resposta (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uso por Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle>Uso por Endpoint</CardTitle>
                <CardDescription>Requisições e erros por API</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={endpointUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3b82f6" name="Requisições" />
                    <Bar dataKey="errors" fill="#ef4444" name="Erros" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status das APIs */}
            <Card>
              <CardHeader>
                <CardTitle>Status das APIs</CardTitle>
                <CardDescription>Distribuição dos status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Serviços Externos */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Externos Conectados</CardTitle>
              <CardDescription>Status das integrações com APIs externas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {externalServices.slice(0, 4).map((service) => {
                  const StatusIcon = getStatusIcon(service.status)
                  const CategoryIcon = getCategoryIcon(service.category)
                  const quotaPercentage = (service.usedQuota / service.monthlyQuota) * 100

                  return (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CategoryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.provider} - {service.category}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(service.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {service.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {service.successRate}% sucesso
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={quotaPercentage} className="w-20 h-2" />
                          <span className="text-xs text-gray-500">
                            {formatNumber(service.usedQuota)}/{formatNumber(service.monthlyQuota)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {/* Lista de Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints da API</CardTitle>
              <CardDescription>Gerenciar endpoints internos e roteamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => {
                  const StatusIcon = getStatusIcon(endpoint.status)
                  const rateLimitPercentage = (endpoint.rateLimit.current / endpoint.rateLimit.requests) * 100

                  return (
                    <Card key={endpoint.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Badge className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {endpoint.url}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(endpoint.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {endpoint.status}
                            </Badge>
                            <Badge>v{endpoint.version}</Badge>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-semibold text-lg">{endpoint.name}</h3>
                          <p className="text-gray-600">{endpoint.service}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Tempo Resposta</p>
                            <p className="text-lg font-bold text-green-600">{endpoint.responseTime}ms</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Uptime</p>
                            <p className="text-lg font-bold text-blue-600">{endpoint.uptime}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Calls</p>
                            <p className="text-lg font-bold text-purple-600">{formatNumber(endpoint.totalCalls)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Taxa Erro</p>
                            <p className="text-lg font-bold text-orange-600">{endpoint.errorRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Rate Limit</p>
                            <div className="flex items-center justify-center space-x-1">
                              <Progress value={rateLimitPercentage} className="w-12 h-2" />
                              <span className="text-xs text-gray-500">
                                {endpoint.rateLimit.current}/{endpoint.rateLimit.requests}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Autenticação:</p>
                            <Badge>{endpoint.authentication}</Badge>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Tags:</p>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              Última chamada: {formatDateTime(endpoint.lastCall)}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Logs
                              </Button>
                              <Button variant="secondary" size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                Docs
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Serviços Externos */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Externos</CardTitle>
              <CardDescription>Integração com APIs de terceiros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {externalServices.map((service) => {
                  const StatusIcon = getStatusIcon(service.status)
                  const CategoryIcon = getCategoryIcon(service.category)
                  const quotaPercentage = (service.usedQuota / service.monthlyQuota) * 100

                  return (
                    <Card key={service.id} className="border rounded-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <CategoryIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl">{service.name}</h3>
                              <p className="text-gray-600">{service.provider} • {service.category}</p>
                              <p className="text-sm text-gray-500 mt-1">v{service.version}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(service.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {service.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Requisições</p>
                            <p className="text-lg font-bold text-blue-600">{formatNumber(service.totalRequests)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Taxa Sucesso</p>
                            <p className="text-lg font-bold text-green-600">{service.successRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Tempo Resp.</p>
                            <p className="text-lg font-bold text-purple-600">{service.avgResponseTime}ms</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Quota Mensal</p>
                            <div className="space-y-1">
                              <Progress value={quotaPercentage} className="h-3" />
                              <p className="text-xs text-gray-500">
                                {formatNumber(service.usedQuota)} / {formatNumber(service.monthlyQuota)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Funcionalidades:</p>
                            <div className="flex flex-wrap gap-2">
                              {service.features.map((feature, index) => (
                                <Badge key={index} variant="secondary">
                                  {feature.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">API Key:</span>
                              <span className="ml-2 font-mono">{service.apiKey}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Base URL:</span>
                              <span className="ml-2 font-mono text-blue-600">{service.baseUrl}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              Última sincronização: {formatDateTime(service.lastSync)}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Sincronizar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Settings className="h-3 w-3 mr-1" />
                                Configurar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                Documentação
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          {/* Configuração de Roteamento */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Roteamento</CardTitle>
              <CardDescription>Gerenciar rotas e balanceamento de carga</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Load Balancer</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Round Robin</p>
                          <p className="text-sm text-gray-600">Distribuição sequencial</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Least Connections</p>
                          <p className="text-sm text-gray-600">Menor número de conexões</p>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Weighted</p>
                          <p className="text-sm text-gray-600">Baseado em pesos</p>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Circuit Breaker</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <Badge className="bg-green-100 text-green-800">Closed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Threshold</span>
                        <span className="font-medium">50%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Timeout</span>
                        <span className="font-medium">30s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Falhas Recentes</span>
                        <span className="font-medium text-green-600">2/50</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Servidores Backend</h3>
                  <div className="grid gap-3">
                    {[
                      { id: 1, url: 'https://api-1.example.com', status: 'healthy', load: 45, responseTime: 123 },
                      { id: 2, url: 'https://api-2.example.com', status: 'healthy', load: 67, responseTime: 156 },
                      { id: 3, url: 'https://api-3.example.com', status: 'unhealthy', load: 0, responseTime: 0 },
                      { id: 4, url: 'https://api-4.example.com', status: 'healthy', load: 34, responseTime: 98 }
                    ].map((server) => (
                      <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${server.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <code className="font-mono text-sm">{server.url}</code>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-600">Carga</p>
                            <p className="font-bold">{server.load}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Resposta</p>
                            <p className="font-bold">{server.responseTime}ms</p>
                          </div>
                          <Badge className={server.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {server.status}
                          </Badge>
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
          {/* Monitoramento em Tempo Real */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>Métricas e alertas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Requisições por Minuto</h4>
                    <div className="text-3xl font-bold text-blue-600">456</div>
                    <div className="text-sm text-gray-600">+5.2% vs última hora</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Latência Média</h4>
                    <div className="text-3xl font-bold text-green-600">156ms</div>
                    <div className="text-sm text-gray-600">-2.1% vs última hora</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Taxa de Erro</h4>
                    <div className="text-3xl font-bold text-orange-600">0.7%</div>
                    <div className="text-sm text-gray-600">+0.1% vs última hora</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Alertas Ativos</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Alta latência detectada</p>
                          <p className="text-sm text-gray-600">Payment Service - 234ms (limite: 200ms)</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">há 2 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Serviço indisponível</p>
                          <p className="text-sm text-gray-600">AWS S3 Storage - Falha na conexão</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">há 5 min</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Top Endpoints por Uso</h4>
                  <div className="space-y-2">
                    {endpoints.map((endpoint, index) => (
                      <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{endpoint.name}</p>
                            <p className="text-sm text-gray-600">{endpoint.url}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatNumber(endpoint.totalCalls)}</p>
                          <p className="text-sm text-gray-600">requisições</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Autenticação, autorização e controle de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Métodos de Autenticação</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'API Key', count: 12, icon: Key },
                        { name: 'OAuth 2.0', count: 8, icon: Shield },
                        { name: 'JWT Token', count: 15, icon: Lock },
                        { name: 'Basic Auth', count: 3, icon: Unlock }
                      ].map((auth, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <auth.icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">{auth.name}</span>
                          </div>
                          <Badge>{auth.count} APIs</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Rate Limiting</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Limite Global</span>
                          <Badge>1000/hora</Badge>
                        </div>
                        <Progress value={23} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">234/1000 requisições</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Por IP</span>
                          <Badge>100/hora</Badge>
                        </div>
                        <Progress value={45} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">45/100 requisições</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Por Usuário</span>
                          <Badge>200/hora</Badge>
                        </div>
                        <Progress value={67} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">134/200 requisições</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Logs de Segurança</h3>
                  <div className="space-y-2">
                    {[
                      { time: '14:30:25', event: 'Rate limit exceeded', ip: '192.168.1.100', severity: 'warning' },
                      { time: '14:28:15', event: 'Invalid API key', ip: '203.0.113.25', severity: 'error' },
                      { time: '14:25:42', event: 'Successful authentication', ip: '198.51.100.14', severity: 'info' },
                      { time: '14:22:18', event: 'Blocked suspicious request', ip: '203.0.113.50', severity: 'error' }
                    ].map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            log.severity === 'error' ? 'bg-red-500' :
                            log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="font-mono text-sm">{log.time}</span>
                          <span>{log.event}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-gray-600">{log.ip}</span>
                          <Badge className={
                            log.severity === 'error' ? 'bg-red-100 text-red-800' :
                            log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }>
                            {log.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
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

export default APIGateway
