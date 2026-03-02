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
  Webhook,
  Send,
  Archive,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Code,
  Globe,
  Shield,
  Key,
  Lock,
  Unlock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  TrendingUp,
  Settings,
  Bell,
  MessageSquare,
  Zap,
  Router,
  Database,
  Server,
  Network,
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Copy,
  ExternalLink,
  GitBranch
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
  Pie
} from 'recharts'

// Tipos para Webhook Manager
interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  status: 'active' | 'inactive' | 'failed' | 'testing'
  events: string[]
  description: string
  authentication: {
    type: 'none' | 'bearer' | 'api_key' | 'signature' | 'oauth2'
    credentials?: string
    secret?: string
  }
  headers: Record<string, string>
  retryPolicy: {
    enabled: boolean
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    delayMs: number
  }
  timeout: number
  successRate: number
  lastTriggered: string
  totalDeliveries: number
  failedDeliveries: number
  avgResponseTime: number
  createdAt: string
  updatedAt: string
}

interface WebhookEvent {
  id: string
  type: string
  timestamp: string
  payload: Record<string, any>
  endpoints: string[]
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'retry'
  attempts: number
  lastAttempt: string
  responseCode?: number
  responseTime?: number
  errorMessage?: string
  source: string
}

interface WebhookDelivery {
  id: string
  eventId: string
  endpointId: string
  timestamp: string
  status: 'success' | 'failed' | 'timeout' | 'retry'
  httpStatus: number
  responseTime: number
  responseBody?: string
  errorMessage?: string
  attempt: number
  nextRetry?: string
}

interface WebhookSubscription {
  id: string
  service: string
  events: string[]
  endpoint: string
  filters: Record<string, any>
  active: boolean
  createdAt: string
}

const WebhookManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null)
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false)

  // Dados mock para demonstração
  const [webhookEndpoints] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Payment Notifications',
      url: 'https://api.example.com/webhooks/payments',
      method: 'POST',
      status: 'active',
      events: ['payment.created', 'payment.completed', 'payment.failed'],
      description: 'Notificações de eventos de pagamento para sistema externo',
      authentication: {
        type: 'signature',
        secret: 'whsec_***'
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OnboardingRSV-Webhook/1.0'
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        delayMs: 1000
      },
      timeout: 30000,
      successRate: 98.5,
      lastTriggered: '2025-01-15T14:30:00Z',
      totalDeliveries: 1234,
      failedDeliveries: 18,
      avgResponseTime: 145,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Booking Updates',
      url: 'https://partner.hotel.com/api/bookings/webhook',
      method: 'POST',
      status: 'active',
      events: ['booking.created', 'booking.updated', 'booking.cancelled'],
      description: 'Sincronização de reservas com sistema do parceiro',
      authentication: {
        type: 'api_key',
        credentials: 'Bearer sk_live_***'
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_live_***'
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 5,
        backoffStrategy: 'linear',
        delayMs: 2000
      },
      timeout: 15000,
      successRate: 96.2,
      lastTriggered: '2025-01-15T14:25:00Z',
      totalDeliveries: 2567,
      failedDeliveries: 98,
      avgResponseTime: 89,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-14T16:30:00Z'
    },
    {
      id: '3',
      name: 'User Events',
      url: 'https://analytics.company.com/events',
      method: 'POST',
      status: 'failed',
      events: ['user.registered', 'user.login', 'user.updated'],
      description: 'Eventos de usuário para sistema de analytics',
      authentication: {
        type: 'bearer',
        credentials: 'Bearer jwt_token_***'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 2,
        backoffStrategy: 'exponential',
        delayMs: 500
      },
      timeout: 10000,
      successRate: 67.3,
      lastTriggered: '2025-01-15T13:45:00Z',
      totalDeliveries: 890,
      failedDeliveries: 291,
      avgResponseTime: 234,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-15T13:45:00Z'
    },
    {
      id: '4',
      name: 'Notification Service',
      url: 'https://notifications.internal.com/webhook',
      method: 'POST',
      status: 'testing',
      events: ['notification.sent', 'notification.delivered', 'notification.failed'],
      description: 'Webhook interno para rastreamento de notificações',
      authentication: {
        type: 'signature',
        secret: 'internal_secret_***'
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Service': 'webhook-manager'
      },
      retryPolicy: {
        enabled: false,
        maxRetries: 0,
        backoffStrategy: 'linear',
        delayMs: 0
      },
      timeout: 5000,
      successRate: 100,
      lastTriggered: '2025-01-15T14:00:00Z',
      totalDeliveries: 45,
      failedDeliveries: 0,
      avgResponseTime: 67,
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T14:00:00Z'
    }
  ])

  const [webhookEvents] = useState<WebhookEvent[]>([
    {
      id: '1',
      type: 'payment.completed',
      timestamp: '2025-01-15T14:30:00Z',
      payload: {
        payment_id: 'pay_123',
        amount: 10000,
        currency: 'BRL',
        customer_id: 'cus_456'
      },
      endpoints: ['1', '2'],
      status: 'delivered',
      attempts: 1,
      lastAttempt: '2025-01-15T14:30:05Z',
      responseCode: 200,
      responseTime: 145,
      source: 'payment-service'
    },
    {
      id: '2',
      type: 'booking.created',
      timestamp: '2025-01-15T14:25:00Z',
      payload: {
        booking_id: 'book_789',
        customer_id: 'cus_456',
        room_id: 'room_101',
        check_in: '2025-01-20',
        check_out: '2025-01-25'
      },
      endpoints: ['2'],
      status: 'delivered',
      attempts: 1,
      lastAttempt: '2025-01-15T14:25:03Z',
      responseCode: 200,
      responseTime: 89,
      source: 'booking-service'
    },
    {
      id: '3',
      type: 'user.registered',
      timestamp: '2025-01-15T14:20:00Z',
      payload: {
        user_id: 'user_789',
        email: 'user@example.com',
        plan: 'premium'
      },
      endpoints: ['3'],
      status: 'failed',
      attempts: 3,
      lastAttempt: '2025-01-15T14:22:00Z',
      responseCode: 500,
      errorMessage: 'Internal Server Error',
      source: 'auth-service'
    },
    {
      id: '4',
      type: 'notification.sent',
      timestamp: '2025-01-15T14:15:00Z',
      payload: {
        notification_id: 'notif_123',
        user_id: 'user_456',
        type: 'email',
        status: 'delivered'
      },
      endpoints: ['4'],
      status: 'delivered',
      attempts: 1,
      lastAttempt: '2025-01-15T14:15:02Z',
      responseCode: 200,
      responseTime: 67,
      source: 'notification-service'
    }
  ])

  // Dados para gráficos
  const deliveryStatsData = [
    { hour: '00:00', delivered: 45, failed: 2, pending: 1 },
    { hour: '04:00', delivered: 23, failed: 1, pending: 0 },
    { hour: '08:00', delivered: 89, failed: 5, pending: 3 },
    { hour: '12:00', delivered: 156, failed: 8, pending: 4 },
    { hour: '16:00', delivered: 134, failed: 3, pending: 2 },
    { hour: '20:00', delivered: 67, failed: 4, pending: 1 }
  ]

  const endpointPerformanceData = [
    { name: 'Payment Notifications', success: 98.5, avgTime: 145 },
    { name: 'Booking Updates', success: 96.2, avgTime: 89 },
    { name: 'User Events', success: 67.3, avgTime: 234 },
    { name: 'Notification Service', success: 100, avgTime: 67 }
  ]

  const eventTypeDistribution = [
    { name: 'Payment Events', value: 45, color: '#3b82f6' },
    { name: 'Booking Events', value: 30, color: '#10b981' },
    { name: 'User Events', value: 15, color: '#f59e0b' },
    { name: 'Notification Events', value: 10, color: '#8b5cf6' }
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
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'inactive':
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
      case 'timeout':
        return 'bg-red-100 text-red-800'
      case 'testing':
      case 'processing':
      case 'retry':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
      case 'success':
        return CheckCircle
      case 'inactive':
      case 'pending':
        return Clock
      case 'failed':
      case 'timeout':
        return AlertTriangle
      case 'testing':
      case 'processing':
      case 'retry':
        return RefreshCw
      default:
        return Clock
    }
  }

  const getAuthIcon = (authType: string) => {
    switch (authType) {
      case 'none': return Unlock
      case 'bearer': return Key
      case 'api_key': return Key
      case 'signature': return Shield
      case 'oauth2': return Lock
      default: return Lock
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Webhooks</h1>
          <p className="text-gray-600">Sistema de webhooks bidirecionais para integração em tempo real</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsEndpointModalOpen(!isEndpointModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Webhook
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="deliveries">Entregas</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs dos Webhooks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Endpoints Ativos</CardTitle>
                <Webhook className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {webhookEndpoints.filter(e => e.status === 'active').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {webhookEndpoints.length} configurados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
                <Send className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(webhookEndpoints.reduce((sum, e) => sum + e.totalDeliveries, 0))}
                </div>
                <p className="text-xs text-gray-600">
                  {webhookEndpoints.reduce((sum, e) => sum + e.failedDeliveries, 0)} falharam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(webhookEndpoints.reduce((sum, e) => sum + e.successRate, 0) / webhookEndpoints.length).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">
                  Média geral
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(webhookEndpoints.reduce((sum, e) => sum + e.avgResponseTime, 0) / webhookEndpoints.length)}ms
                </div>
                <p className="text-xs text-gray-600">
                  Tempo médio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Entrega</CardTitle>
              <CardDescription>Entregas de webhooks nas últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={deliveryStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="delivered" stackId="1" stroke="#10b981" fill="#10b981" name="Entregues" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" name="Falharam" />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Pendentes" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance dos Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Endpoints</CardTitle>
                <CardDescription>Taxa de sucesso por endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={endpointPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="success" fill="#10b981" name="Taxa Sucesso %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Eventos */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Eventos</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={eventTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {eventTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Endpoints com Problemas */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints com Problemas</CardTitle>
              <CardDescription>Webhooks que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhookEndpoints
                  .filter(e => e.status === 'failed' || e.successRate < 95)
                  .map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">{endpoint.name}</p>
                          <p className="text-sm text-gray-600">
                            Taxa de sucesso: {endpoint.successRate}% • Falhas: {endpoint.failedDeliveries}
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
                          Testar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {/* Lista de Endpoints */}
          <div className="grid gap-6">
            {webhookEndpoints.map((endpoint) => {
              const StatusIcon = getStatusIcon(endpoint.status)
              const AuthIcon = getAuthIcon(endpoint.authentication.type)
              const successRate = endpoint.successRate

              return (
                <Card key={endpoint.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <Webhook className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{endpoint.name}</h3>
                          <p className="text-gray-600">{endpoint.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                              {endpoint.method}
                            </code>
                            <span className="text-sm text-gray-500">{endpoint.url}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(endpoint.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {endpoint.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Taxa Sucesso</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-green-600">{successRate}%</p>
                          <Progress value={successRate} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Entregas</p>
                        <p className="text-lg font-bold text-blue-600">{formatNumber(endpoint.totalDeliveries)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Falhas</p>
                        <p className="text-lg font-bold text-red-600">{endpoint.failedDeliveries}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tempo Resp.</p>
                        <p className="text-lg font-bold text-purple-600">{endpoint.avgResponseTime}ms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Timeout</p>
                        <p className="text-lg font-bold text-orange-600">{endpoint.timeout/1000}s</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Eventos:</p>
                        <div className="flex flex-wrap gap-2">
                          {endpoint.events.map((event, index) => (
                            <Badge key={index} variant="secondary">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Autenticação:</p>
                          <div className="flex items-center space-x-2">
                            <AuthIcon className="h-4 w-4 text-gray-600" />
                            <Badge>{endpoint.authentication.type}</Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Retry Policy:</p>
                          <Badge className={endpoint.retryPolicy.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {endpoint.retryPolicy.enabled ? `${endpoint.retryPolicy.maxRetries} retries` : 'Disabled'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Headers Customizados:</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <code className="text-sm">
                            {Object.entries(endpoint.headers).map(([key, value]) => (
                              <div key={key}>{key}: {value}</div>
                            ))}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-500">
                          Último disparo: {formatDateTime(endpoint.lastTriggered)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Send className="h-3 w-3 mr-1" />
                            Testar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Logs
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicar
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

        <TabsContent value="events" className="space-y-6">
          {/* Lista de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Webhook</CardTitle>
              <CardDescription>Histórico de eventos enviados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'delivered', label: 'Entregues' },
                      { value: 'failed', label: 'Falharam' },
                      { value: 'pending', label: 'Pendentes' },
                      { value: 'retry', label: 'Tentando Novamente' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'payment', label: 'Pagamentos' },
                      { value: 'booking', label: 'Reservas' },
                      { value: 'user', label: 'Usuários' },
                      { value: 'notification', label: 'Notificações' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="space-y-3">
                  {webhookEvents.map((event) => {
                    const StatusIcon = getStatusIcon(event.status)

                    return (
                      <Card key={event.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Bell className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{event.type}</h4>
                                <p className="text-sm text-gray-600">ID: {event.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(event.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {event.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(event.timestamp)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Tentativas</p>
                              <p className="font-medium">{event.attempts}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Última Tentativa</p>
                              <p className="font-medium">{formatDateTime(event.lastAttempt)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Origem</p>
                              <p className="font-medium">{event.source}</p>
                            </div>
                          </div>

                          {event.responseCode && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-600">Código HTTP</p>
                                <Badge className={event.responseCode === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {event.responseCode}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Tempo de Resposta</p>
                                <p className="font-medium">{event.responseTime}ms</p>
                              </div>
                            </div>
                          )}

                          {event.errorMessage && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">Erro:</p>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">{event.errorMessage}</p>
                              </div>
                            </div>
                          )}

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Payload:</p>
                            <div className="bg-gray-50 border rounded-lg p-3">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {JSON.stringify(event.payload, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                Endpoints: {event.endpoints.length}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Reenviar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
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

        <TabsContent value="deliveries" className="space-y-6">
          {/* Log de Entregas */}
          <Card>
            <CardHeader>
              <CardTitle>Log de Entregas</CardTitle>
              <CardDescription>Rastreamento detalhado de cada entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Total Entregas</h4>
                    <div className="text-2xl font-bold text-blue-600">4,736</div>
                    <div className="text-sm text-gray-600">Últimas 24h</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Sucessos</h4>
                    <div className="text-2xl font-bold text-green-600">4,558</div>
                    <div className="text-sm text-gray-600">96.2% taxa</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Falhas</h4>
                    <div className="text-2xl font-bold text-red-600">178</div>
                    <div className="text-sm text-gray-600">3.8% taxa</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Tempo Médio</h4>
                    <div className="text-2xl font-bold text-purple-600">156ms</div>
                    <div className="text-sm text-gray-600">Resposta</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Filtros Avançados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input placeholder="Pesquisar por ID do evento" title="Pesquisar evento" />
                    <Select 
                      title="Filtrar por endpoint"
                      options={[
                        { value: 'all', label: 'Todos os Endpoints' },
                        ...webhookEndpoints.map(e => ({ value: e.id, label: e.name }))
                      ]}
                    />
                    <Select 
                      title="Filtrar por status"
                      options={[
                        { value: 'all', label: 'Todos os Status' },
                        { value: 'success', label: 'Sucessos' },
                        { value: 'failed', label: 'Falhas' },
                        { value: 'timeout', label: 'Timeouts' },
                        { value: 'retry', label: 'Tentativas' }
                      ]}
                    />
                    <Button>
                      <Filter className="h-4 w-4 mr-2" />
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Timestamp</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Evento</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Endpoint</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">HTTP</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tempo</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tentativa</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: '14:30:05', event: 'payment.completed', endpoint: 'Payment Notifications', status: 'success', http: 200, responseTime: 145, attempt: 1 },
                        { time: '14:25:03', event: 'booking.created', endpoint: 'Booking Updates', status: 'success', http: 200, responseTime: 89, attempt: 1 },
                        { time: '14:22:00', event: 'user.registered', endpoint: 'User Events', status: 'failed', http: 500, responseTime: 234, attempt: 3 },
                        { time: '14:15:02', event: 'notification.sent', endpoint: 'Notification Service', status: 'success', http: 200, responseTime: 67, attempt: 1 }
                      ].map((delivery, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm">{delivery.time}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm font-mono">{delivery.event}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{delivery.endpoint}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge className={getStatusColor(delivery.status)}>
                              {delivery.status}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge className={delivery.http === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {delivery.http}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{delivery.responseTime}ms</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{delivery.attempt}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Button size="sm" variant="secondary">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <CardDescription>Métricas de performance dos webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold mb-1">Entregas/min</h4>
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <Progress value={47} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold mb-1">Taxa Sucesso</h4>
                    <div className="text-2xl font-bold text-green-600">96.2%</div>
                    <Progress value={96.2} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold mb-1">Latência P95</h4>
                    <div className="text-2xl font-bold text-purple-600">234ms</div>
                    <Progress value={65} className="mt-2 h-2" />
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
                          <p className="text-sm text-gray-600">User Events endpoint - 456ms (limite: 300ms)</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">há 2 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Taxa de falha alta</p>
                          <p className="text-sm text-gray-600">User Events - 32.7% de falhas nas últimas 2 horas</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">há 5 min</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Métricas por Endpoint</h4>
                  <div className="grid gap-4">
                    {webhookEndpoints.map((endpoint) => (
                      <div key={endpoint.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">{endpoint.name}</h5>
                          <Badge className={getStatusColor(endpoint.status)}>
                            {endpoint.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Entregas/h</p>
                            <p className="font-bold">{Math.round(endpoint.totalDeliveries / 24)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Taxa Sucesso</p>
                            <p className="font-bold text-green-600">{endpoint.successRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tempo Resp.</p>
                            <p className="font-bold">{endpoint.avgResponseTime}ms</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Último</p>
                            <p className="font-bold">{formatDateTime(endpoint.lastTriggered).split(' ')[1]}</p>
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

        <TabsContent value="security" className="space-y-6">
          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Autenticação e validação de webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Métodos de Autenticação</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Signature Validation', count: 2, icon: Shield, description: 'Validação por assinatura HMAC' },
                        { name: 'API Key', count: 1, icon: Key, description: 'Chave de API no header' },
                        { name: 'Bearer Token', count: 1, icon: Lock, description: 'Token JWT ou Bearer' },
                        { name: 'None', count: 0, icon: Unlock, description: 'Sem autenticação' }
                      ].map((auth, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <auth.icon className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{auth.name}</p>
                              <p className="text-sm text-gray-600">{auth.description}</p>
                            </div>
                          </div>
                          <Badge>{auth.count} endpoints</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Configurações de Segurança</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Rate Limiting</p>
                          <p className="text-sm text-gray-600">Limite de requisições por endpoint</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">IP Whitelist</p>
                          <p className="text-sm text-gray-600">Restrição por endereço IP</p>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">SSL/TLS Validation</p>
                          <p className="text-sm text-gray-600">Validação de certificados</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Payload Encryption</p>
                          <p className="text-sm text-gray-600">Criptografia do payload</p>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Logs de Segurança</h3>
                  <div className="space-y-2">
                    {[
                      { time: '14:30:25', event: 'Signature validation failed', endpoint: 'User Events', severity: 'error' },
                      { time: '14:28:15', event: 'Rate limit exceeded', endpoint: 'Payment Notifications', severity: 'warning' },
                      { time: '14:25:42', event: 'Successful webhook delivery', endpoint: 'Booking Updates', severity: 'info' },
                      { time: '14:22:18', event: 'SSL certificate validated', endpoint: 'Notification Service', severity: 'info' }
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
                          <span className="text-sm text-gray-600">{log.endpoint}</span>
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

                <div>
                  <h3 className="font-semibold text-lg mb-4">Validação de Endpoints</h3>
                  <div className="grid gap-3">
                    {webhookEndpoints.map((endpoint) => (
                      <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{endpoint.name}</p>
                            <p className="text-sm text-gray-600">{endpoint.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={endpoint.authentication.type !== 'none' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {endpoint.authentication.type}
                          </Badge>
                          <Button size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validar
                          </Button>
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

export default WebhookManager
