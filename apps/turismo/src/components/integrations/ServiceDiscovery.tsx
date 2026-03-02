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
  Search,
  Server,
  Network,
  Globe,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  MapPin,
  Cpu,
  Database,
  Cloud,
  Router,
  Shield,
  Zap,
  Settings,
  Code,
  Terminal,
  Monitor,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Play,
  Pause,
  Square,
  GitBranch,
  Package,
  Layers,
  Container,
  HardDrive,
  Memory,
  Gauge,
  Link2,
  Workflow,
  FileText,
  Copy
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
  Scatter
} from 'recharts'

// Tipos para Service Discovery
interface ServiceInstance {
  id: string
  name: string
  version: string
  host: string
  port: number
  protocol: 'http' | 'https' | 'grpc' | 'tcp' | 'udp'
  status: 'healthy' | 'unhealthy' | 'unknown' | 'starting' | 'stopping'
  health: {
    endpoint: string
    interval: number
    timeout: number
    lastCheck: string
    consecutiveFailures: number
  }
  metadata: {
    environment: 'development' | 'staging' | 'production'
    datacenter: string
    zone: string
    tags: string[]
    weight: number
  }
  metrics: {
    cpu: number
    memory: number
    requests: number
    errors: number
    latency: number
    uptime: string
  }
  endpoints: string[]
  dependencies: string[]
  registeredAt: string
  lastHeartbeat: string
}

interface ServiceRegistry {
  id: string
  name: string
  type: 'consul' | 'etcd' | 'eureka' | 'zookeeper' | 'kubernetes' | 'custom'
  url: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  services: number
  lastSync: string
  config: Record<string, any>
}

interface ServiceMesh {
  id: string
  name: string
  type: 'istio' | 'linkerd' | 'consul_connect' | 'envoy' | 'custom'
  status: 'active' | 'inactive' | 'deploying' | 'error'
  services: string[]
  policies: {
    traffic: number
    security: number
    observability: number
  }
  metrics: {
    successRate: number
    avgLatency: number
    requests: number
    errors: number
  }
}

interface LoadBalancer {
  id: string
  name: string
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'random'
  targets: {
    serviceId: string
    weight: number
    health: 'healthy' | 'unhealthy'
    activeConnections: number
  }[]
  status: 'active' | 'inactive' | 'error'
  metrics: {
    totalRequests: number
    requestsPerSecond: number
    errorRate: number
    avgResponseTime: number
  }
}

interface CircuitBreaker {
  id: string
  serviceId: string
  status: 'closed' | 'open' | 'half_open'
  config: {
    failureThreshold: number
    recoveryTimeout: number
    successThreshold: number
  }
  metrics: {
    failures: number
    successes: number
    totalRequests: number
    lastStateChange: string
  }
}

const ServiceDiscovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedService, setSelectedService] = useState<ServiceInstance | null>(null)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)

  // Dados mock para demonstração
  const [serviceInstances] = useState<ServiceInstance[]>([
    {
      id: '1',
      name: 'auth-service',
      version: 'v1.2.3',
      host: '10.0.1.10',
      port: 8080,
      protocol: 'https',
      status: 'healthy',
      health: {
        endpoint: '/health',
        interval: 30,
        timeout: 5,
        lastCheck: '2025-01-15T14:30:00Z',
        consecutiveFailures: 0
      },
      metadata: {
        environment: 'production',
        datacenter: 'us-east-1',
        zone: 'us-east-1a',
        tags: ['authentication', 'security', 'api'],
        weight: 100
      },
      metrics: {
        cpu: 45,
        memory: 512,
        requests: 1234,
        errors: 5,
        latency: 145,
        uptime: '7d 14h 32m'
      },
      endpoints: ['/health', '/auth/login', '/auth/verify', '/auth/refresh'],
      dependencies: ['redis-cache', 'user-db'],
      registeredAt: '2025-01-08T10:00:00Z',
      lastHeartbeat: '2025-01-15T14:29:55Z'
    },
    {
      id: '2',
      name: 'booking-service',
      version: 'v2.1.0',
      host: '10.0.1.20',
      port: 8080,
      protocol: 'https',
      status: 'healthy',
      health: {
        endpoint: '/health',
        interval: 30,
        timeout: 5,
        lastCheck: '2025-01-15T14:29:45Z',
        consecutiveFailures: 0
      },
      metadata: {
        environment: 'production',
        datacenter: 'us-east-1',
        zone: 'us-east-1b',
        tags: ['booking', 'reservations', 'api'],
        weight: 150
      },
      metrics: {
        cpu: 67,
        memory: 1024,
        requests: 2345,
        errors: 12,
        latency: 89,
        uptime: '12d 8h 15m'
      },
      endpoints: ['/health', '/bookings', '/availability', '/rooms'],
      dependencies: ['booking-db', 'payment-service'],
      registeredAt: '2025-01-03T15:30:00Z',
      lastHeartbeat: '2025-01-15T14:29:40Z'
    },
    {
      id: '3',
      name: 'payment-service',
      version: 'v1.5.2',
      host: '10.0.1.30',
      port: 8080,
      protocol: 'https',
      status: 'unhealthy',
      health: {
        endpoint: '/health',
        interval: 30,
        timeout: 5,
        lastCheck: '2025-01-15T14:28:30Z',
        consecutiveFailures: 3
      },
      metadata: {
        environment: 'production',
        datacenter: 'us-east-1',
        zone: 'us-east-1c',
        tags: ['payment', 'finance', 'api'],
        weight: 75
      },
      metrics: {
        cpu: 89,
        memory: 768,
        requests: 890,
        errors: 89,
        latency: 234,
        uptime: '2d 4h 12m'
      },
      endpoints: ['/health', '/payments', '/refunds', '/webhooks'],
      dependencies: ['payment-db', 'stripe-api'],
      registeredAt: '2025-01-13T09:00:00Z',
      lastHeartbeat: '2025-01-15T14:27:30Z'
    },
    {
      id: '4',
      name: 'notification-service',
      version: 'v1.0.8',
      host: '10.0.1.40',
      port: 8080,
      protocol: 'https',
      status: 'healthy',
      health: {
        endpoint: '/health',
        interval: 30,
        timeout: 5,
        lastCheck: '2025-01-15T14:30:15Z',
        consecutiveFailures: 0
      },
      metadata: {
        environment: 'production',
        datacenter: 'us-east-1',
        zone: 'us-east-1a',
        tags: ['notification', 'messaging', 'api'],
        weight: 100
      },
      metrics: {
        cpu: 23,
        memory: 384,
        requests: 3456,
        errors: 23,
        latency: 67,
        uptime: '5d 12h 45m'
      },
      endpoints: ['/health', '/notifications', '/templates', '/delivery'],
      dependencies: ['redis-cache', 'sendgrid-api'],
      registeredAt: '2025-01-10T12:00:00Z',
      lastHeartbeat: '2025-01-15T14:30:10Z'
    },
    {
      id: '5',
      name: 'analytics-service',
      version: 'v3.0.1',
      host: '10.0.1.50',
      port: 8080,
      protocol: 'https',
      status: 'starting',
      health: {
        endpoint: '/health',
        interval: 30,
        timeout: 5,
        lastCheck: '2025-01-15T14:25:00Z',
        consecutiveFailures: 1
      },
      metadata: {
        environment: 'production',
        datacenter: 'us-east-1',
        zone: 'us-east-1b',
        tags: ['analytics', 'data', 'api'],
        weight: 50
      },
      metrics: {
        cpu: 12,
        memory: 2048,
        requests: 567,
        errors: 12,
        latency: 123,
        uptime: '0d 0h 15m'
      },
      endpoints: ['/health', '/events', '/metrics', '/dashboards'],
      dependencies: ['clickhouse-db', 'kafka-cluster'],
      registeredAt: '2025-01-15T14:10:00Z',
      lastHeartbeat: '2025-01-15T14:29:30Z'
    }
  ])

  const [serviceRegistries] = useState<ServiceRegistry[]>([
    {
      id: '1',
      name: 'Consul Cluster',
      type: 'consul',
      url: 'https://consul.internal:8500',
      status: 'connected',
      services: 15,
      lastSync: '2025-01-15T14:30:00Z',
      config: {
        datacenter: 'dc1',
        acl_enabled: true,
        encryption: true
      }
    },
    {
      id: '2',
      name: 'Kubernetes API',
      type: 'kubernetes',
      url: 'https://k8s-api.internal:6443',
      status: 'connected',
      services: 23,
      lastSync: '2025-01-15T14:29:45Z',
      config: {
        namespace: 'production',
        label_selector: 'app.kubernetes.io/managed-by=helm'
      }
    },
    {
      id: '3',
      name: 'Eureka Server',
      type: 'eureka',
      url: 'http://eureka.internal:8761',
      status: 'disconnected',
      services: 0,
      lastSync: '2025-01-15T13:45:00Z',
      config: {
        prefer_ip_address: true,
        lease_renewal_interval: 30
      }
    }
  ])

  const [loadBalancers] = useState<LoadBalancer[]>([
    {
      id: '1',
      name: 'Auth Service LB',
      algorithm: 'round_robin',
      targets: [
        { serviceId: '1', weight: 100, health: 'healthy', activeConnections: 45 },
        { serviceId: '1-backup', weight: 50, health: 'healthy', activeConnections: 23 }
      ],
      status: 'active',
      metrics: {
        totalRequests: 12345,
        requestsPerSecond: 67,
        errorRate: 0.5,
        avgResponseTime: 145
      }
    },
    {
      id: '2',
      name: 'Booking Service LB',
      algorithm: 'least_connections',
      targets: [
        { serviceId: '2', weight: 100, health: 'healthy', activeConnections: 89 },
        { serviceId: '2-replica', weight: 100, health: 'healthy', activeConnections: 76 }
      ],
      status: 'active',
      metrics: {
        totalRequests: 23456,
        requestsPerSecond: 124,
        errorRate: 0.3,
        avgResponseTime: 89
      }
    }
  ])

  // Dados para gráficos
  const serviceHealthData = [
    { time: '00:00', healthy: 4, unhealthy: 1, unknown: 0 },
    { time: '04:00', healthy: 5, unhealthy: 0, unknown: 0 },
    { time: '08:00', healthy: 4, unhealthy: 1, unknown: 0 },
    { time: '12:00', healthy: 3, unhealthy: 2, unknown: 0 },
    { time: '16:00', healthy: 4, unhealthy: 1, unknown: 0 },
    { time: '20:00', healthy: 5, unhealthy: 0, unknown: 0 }
  ]

  const discoveryMetricsData = [
    { hour: '00:00', registrations: 12, deregistrations: 2, healthChecks: 450 },
    { hour: '04:00', registrations: 5, deregistrations: 1, healthChecks: 380 },
    { hour: '08:00', registrations: 23, deregistrations: 4, healthChecks: 520 },
    { hour: '12:00', registrations: 34, deregistrations: 8, healthChecks: 680 },
    { hour: '16:00', registrations: 28, deregistrations: 3, healthChecks: 590 },
    { hour: '20:00', registrations: 15, deregistrations: 5, healthChecks: 460 }
  ]

  const serviceDistribution = [
    { name: 'Healthy', value: 80, color: '#10b981' },
    { name: 'Unhealthy', value: 15, color: '#ef4444' },
    { name: 'Starting', value: 3, color: '#f59e0b' },
    { name: 'Unknown', value: 2, color: '#6b7280' }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'unhealthy':
      case 'disconnected':
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'unknown':
      case 'syncing':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'starting':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800'
      case 'stopping':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return CheckCircle
      case 'unhealthy':
      case 'disconnected':
      case 'error':
        return AlertTriangle
      case 'unknown':
      case 'syncing':
      case 'inactive':
        return Clock
      case 'starting':
      case 'deploying':
        return RefreshCw
      case 'stopping':
        return Square
      default:
        return Clock
    }
  }

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'https':
      case 'http':
        return Globe
      case 'grpc':
        return Code
      case 'tcp':
      case 'udp':
        return Network
      default:
        return Network
    }
  }

  const getRegistryIcon = (type: string) => {
    switch (type) {
      case 'consul':
        return Database
      case 'kubernetes':
        return Container
      case 'eureka':
        return Server
      case 'etcd':
        return Database
      case 'zookeeper':
        return Database
      default:
        return Server
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Discovery</h1>
          <p className="text-gray-600">Descoberta automática e registro de serviços distribuídos</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsServiceModalOpen(!isServiceModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar Serviço
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="registries">Registries</TabsTrigger>
          <TabsTrigger value="topology">Topologia</TabsTrigger>
          <TabsTrigger value="loadbalancing">Load Balancing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs do Service Discovery */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Serviços Registrados</CardTitle>
                <Server className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {serviceInstances.length}
                </div>
                <p className="text-xs text-gray-600">
                  {serviceInstances.filter(s => s.status === 'healthy').length} saudáveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registries Ativas</CardTitle>
                <Database className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {serviceRegistries.filter(r => r.status === 'connected').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {serviceRegistries.length} configuradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Checks</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(2847)}
                </div>
                <p className="text-xs text-gray-600">
                  Última hora
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
                <Gauge className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">99.7%</div>
                <p className="text-xs text-gray-600">
                  Últimas 24h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Saúde dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>Estado dos Serviços</CardTitle>
              <CardDescription>Status de saúde ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={serviceHealthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="healthy" stackId="1" stroke="#10b981" fill="#10b981" name="Saudáveis" />
                  <Area type="monotone" dataKey="unhealthy" stackId="1" stroke="#ef4444" fill="#ef4444" name="Com Problemas" />
                  <Area type="monotone" dataKey="unknown" stackId="1" stroke="#6b7280" fill="#6b7280" name="Desconhecidos" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Discovery */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Discovery</CardTitle>
                <CardDescription>Atividade de registro e descoberta</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={discoveryMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={3} name="Registros" />
                    <Line type="monotone" dataKey="healthChecks" stroke="#10b981" strokeWidth={3} name="Health Checks" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Estado atual dos serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service Registries Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Service Registries</CardTitle>
              <CardDescription>Estado das conexões com registros de serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {serviceRegistries.map((registry) => {
                  const StatusIcon = getStatusIcon(registry.status)
                  const RegistryIcon = getRegistryIcon(registry.type)

                  return (
                    <div key={registry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <RegistryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{registry.name}</h4>
                          <p className="text-sm text-gray-600">{registry.url}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(registry.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {registry.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {registry.services} serviços
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Último sync: {formatDateTime(registry.lastSync)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Lista de Serviços */}
          <div className="grid gap-6">
            {serviceInstances.map((service) => {
              const StatusIcon = getStatusIcon(service.status)
              const ProtocolIcon = getProtocolIcon(service.protocol)
              const healthPercentage = ((service.metrics.requests - service.metrics.errors) / service.metrics.requests) * 100

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
                          <div className="flex items-center space-x-2 mt-1">
                            <ProtocolIcon className="h-4 w-4 text-gray-500" />
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {service.protocol}://{service.host}:{service.port}
                            </code>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge>v{service.version}</Badge>
                            <Badge variant="secondary">{service.metadata.environment}</Badge>
                            <Badge variant="secondary">{service.metadata.datacenter}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(service.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {service.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">CPU</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-blue-600">{service.metrics.cpu}%</p>
                          <Progress value={service.metrics.cpu} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Memória</p>
                        <p className="text-lg font-bold text-green-600">{service.metrics.memory}MB</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Requests</p>
                        <p className="text-lg font-bold text-purple-600">{formatNumber(service.metrics.requests)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Errors</p>
                        <p className="text-lg font-bold text-red-600">{service.metrics.errors}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Latência</p>
                        <p className="text-lg font-bold text-orange-600">{service.metrics.latency}ms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Health</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-indigo-600">{healthPercentage.toFixed(1)}%</p>
                          <Progress value={healthPercentage} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
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
                        <p className="text-sm text-gray-600 mb-2">Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {service.metadata.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Zona:</span>
                          <span className="ml-2 font-medium">{service.metadata.zone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Peso:</span>
                          <span className="ml-2 font-medium">{service.metadata.weight}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uptime:</span>
                          <span className="ml-2 font-medium">{service.metrics.uptime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Health Check:</span>
                          <span className="ml-2 font-medium">
                            {service.health.consecutiveFailures === 0 ? 'OK' : `${service.health.consecutiveFailures} falhas`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-500">
                          Registrado: {formatDateTime(service.registeredAt)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Activity className="h-3 w-3 mr-1" />
                            Health Check
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Logs
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Monitor className="h-3 w-3 mr-1" />
                            Métricas
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
        </TabsContent>

        <TabsContent value="registries" className="space-y-6">
          {/* Service Registries */}
          <Card>
            <CardHeader>
              <CardTitle>Service Registries</CardTitle>
              <CardDescription>Gerenciar conexões com registros de serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {serviceRegistries.map((registry) => {
                  const StatusIcon = getStatusIcon(registry.status)
                  const RegistryIcon = getRegistryIcon(registry.type)

                  return (
                    <Card key={registry.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <RegistryIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl">{registry.name}</h3>
                              <p className="text-gray-600">{registry.url}</p>
                              <Badge className="mt-2">{registry.type}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(registry.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {registry.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Serviços Registrados</p>
                            <p className="text-2xl font-bold text-blue-600">{registry.services}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Último Sync</p>
                            <p className="text-sm font-medium">{formatDateTime(registry.lastSync)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Tipo</p>
                            <p className="font-medium capitalize">{registry.type}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Configuração:</p>
                            <div className="bg-gray-50 border rounded-lg p-3">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {JSON.stringify(registry.config, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              Status: {registry.status}
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
                                <Eye className="h-3 w-3 mr-1" />
                                Logs
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

        <TabsContent value="topology" className="space-y-6">
          {/* Topologia dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>Topologia dos Serviços</CardTitle>
              <CardDescription>Mapa visual da arquitetura de serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-4">
                  {/* Service Nodes */}
                  <div className="absolute top-4 left-1/4 bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                    <Server className="h-4 w-4 inline mr-2" />
                    Auth Service
                    <div className="text-xs opacity-75">v1.2.3 • Healthy</div>
                  </div>
                  
                  <div className="absolute top-1/3 right-1/4 bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                    <Server className="h-4 w-4 inline mr-2" />
                    Booking Service
                    <div className="text-xs opacity-75">v2.1.0 • Healthy</div>
                  </div>
                  
                  <div className="absolute bottom-1/3 left-1/3 bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                    <Server className="h-4 w-4 inline mr-2" />
                    Payment Service
                    <div className="text-xs opacity-75">v1.5.2 • Unhealthy</div>
                  </div>
                  
                  <div className="absolute bottom-4 right-1/3 bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                    <Server className="h-4 w-4 inline mr-2" />
                    Notification Service
                    <div className="text-xs opacity-75">v1.0.8 • Healthy</div>
                  </div>
                  
                  <div className="absolute top-1/2 left-1/2 bg-yellow-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                    <Server className="h-4 w-4 inline mr-2" />
                    Analytics Service
                    <div className="text-xs opacity-75">v3.0.1 • Starting</div>
                  </div>

                  {/* Load Balancer */}
                  <div className="absolute top-8 left-1/2 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium">
                    <Router className="h-4 w-4 inline mr-2" />
                    Load Balancer
                    <div className="text-xs opacity-75">API Gateway</div>
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                      </marker>
                    </defs>
                    <line x1="50%" y1="15%" x2="25%" y2="25%" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="50%" y1="15%" x2="75%" y2="35%" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="50%" y1="15%" x2="33%" y2="65%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="15%" x2="67%" y2="85%" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                </div>
                
                <div className="text-center text-gray-500">
                  <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Topologia de Serviços em Tempo Real</p>
                  <p className="text-xs">Conexões e dependências entre microsserviços</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Conectividade */}
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Dependências</CardTitle>
              <CardDescription>Relações entre serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Serviço</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Auth</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Booking</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Payment</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Notification</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Analytics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceInstances.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{service.name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {service.dependencies.includes('redis-cache') ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto" />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {service.dependencies.includes('booking-db') ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto" />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {service.dependencies.includes('payment-service') || service.dependencies.includes('stripe-api') ? (
                            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto" />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {service.dependencies.includes('sendgrid-api') ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto" />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {service.dependencies.includes('clickhouse-db') || service.dependencies.includes('kafka-cluster') ? (
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Dependência Ativa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Dependência com Problema</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Dependência Iniciando</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                  <span>Sem Dependência</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loadbalancing" className="space-y-6">
          {/* Load Balancers */}
          <Card>
            <CardHeader>
              <CardTitle>Load Balancers</CardTitle>
              <CardDescription>Balanceamento de carga entre instâncias de serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {loadBalancers.map((lb) => (
                  <Card key={lb.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <Router className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl">{lb.name}</h3>
                            <p className="text-gray-600">Algoritmo: {lb.algorithm.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(lb.status)}>
                          {lb.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Requests Total</p>
                          <p className="text-lg font-bold text-blue-600">{formatNumber(lb.metrics.totalRequests)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">RPS</p>
                          <p className="text-lg font-bold text-green-600">{lb.metrics.requestsPerSecond}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Taxa Erro</p>
                          <p className="text-lg font-bold text-red-600">{lb.metrics.errorRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Tempo Resp.</p>
                          <p className="text-lg font-bold text-purple-600">{lb.metrics.avgResponseTime}ms</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-3">Targets:</p>
                        <div className="space-y-2">
                          {lb.targets.map((target, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${target.health === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-medium">{target.serviceId}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Peso:</span>
                                  <span className="ml-1 font-medium">{target.weight}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Conexões:</span>
                                  <span className="ml-1 font-medium">{target.activeConnections}</span>
                                </div>
                                <Badge className={target.health === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {target.health}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Circuit Breakers */}
          <Card>
            <CardHeader>
              <CardTitle>Circuit Breakers</CardTitle>
              <CardDescription>Proteção contra falhas em cascata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {serviceInstances.slice(0, 3).map((service, index) => {
                  const circuitStatus = index === 2 ? 'open' : index === 1 ? 'half_open' : 'closed'
                  const failures = index === 2 ? 15 : index === 1 ? 3 : 0
                  
                  return (
                    <div key={service.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{service.name}</h4>
                        <Badge className={
                          circuitStatus === 'closed' ? 'bg-green-100 text-green-800' :
                          circuitStatus === 'open' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {circuitStatus}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Falhas:</span>
                          <span className="font-medium text-red-600">{failures}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sucessos:</span>
                          <span className="font-medium text-green-600">{service.metrics.requests - service.metrics.errors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">{service.metrics.requests}</span>
                        </div>
                        <Progress value={(failures / 10) * 100} className="h-2 mt-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoramento em Tempo Real */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>Métricas e alertas do service discovery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Search className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold mb-1">Descobertas/min</h4>
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <Progress value={76} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold mb-1">Health Checks/min</h4>
                    <div className="text-2xl font-bold text-green-600">487</div>
                    <Progress value={95} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-semibold mb-1">Alertas Ativos</h4>
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <Progress value={40} className="mt-2 h-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Alertas Recentes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Serviço não responsivo</p>
                          <p className="text-sm text-gray-600">payment-service falhou em 3 health checks consecutivos</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">há 2 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Alta latência detectada</p>
                          <p className="text-sm text-gray-600">analytics-service com tempo de resposta acima de 200ms</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">há 5 min</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Estatísticas por Zona</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['us-east-1a', 'us-east-1b', 'us-east-1c'].map((zone, index) => {
                      const services = serviceInstances.filter(s => s.metadata.zone === zone)
                      const healthyServices = services.filter(s => s.status === 'healthy').length
                      
                      return (
                        <div key={zone} className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-3">{zone}</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-medium">{services.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Saudáveis:</span>
                              <span className="font-medium text-green-600">{healthyServices}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxa Saúde:</span>
                              <span className="font-medium">
                                {services.length > 0 ? ((healthyServices / services.length) * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={services.length > 0 ? (healthyServices / services.length) * 100 : 0} 
                              className="h-2 mt-2" 
                            />
                          </div>
                        </div>
                      )
                    })}
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

export default ServiceDiscovery
