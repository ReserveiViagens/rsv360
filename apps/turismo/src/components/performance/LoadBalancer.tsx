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
  Router,
  Server,
  Network,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Gauge,
  Clock,
  Cpu,
  Memory,
  HardDrive,
  Globe,
  Cloud,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Archive,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Code,
  FileText,
  Folder,
  Users,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Timer,
  Layers,
  ExternalLink,
  Share,
  Link,
  Star,
  Heart,
  Bookmark,
  Maximize,
  Minimize,
  RotateCcw,
  Wifi,
  WifiOff
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
  ComposedChart
} from 'recharts'

// Tipos para Load Balancer
interface LoadBalancer {
  id: string
  name: string
  type: 'application' | 'network' | 'classic' | 'gateway'
  algorithm: 'round-robin' | 'weighted' | 'least-connections' | 'ip-hash' | 'url-hash' | 'health-based'
  status: 'active' | 'inactive' | 'maintenance' | 'error'
  location: string
  provider: 'aws' | 'azure' | 'gcp' | 'cloudflare' | 'nginx' | 'haproxy' | 'custom'
  configuration: {
    protocol: 'http' | 'https' | 'tcp' | 'udp'
    port: number
    sslTermination: boolean
    sessionAffinity: boolean
    healthCheck: {
      enabled: boolean
      interval: number
      timeout: number
      healthyThreshold: number
      unhealthyThreshold: number
      path?: string
    }
    connectionDraining: {
      enabled: boolean
      timeout: number
    }
  }
  metrics: {
    totalRequests: number
    activeConnections: number
    requestsPerSecond: number
    avgResponseTime: number
    errorRate: number
    throughput: number
    uptime: number
    dataTransferred: number
  }
  targets: LoadBalancerTarget[]
  rules: LoadBalancerRule[]
  createdAt: string
  lastModified: string
}

interface LoadBalancerTarget {
  id: string
  name: string
  type: 'instance' | 'ip' | 'container' | 'lambda' | 'service'
  address: string
  port: number
  weight: number
  status: 'healthy' | 'unhealthy' | 'draining' | 'unknown'
  availability: 'available' | 'unavailable' | 'maintenance'
  metrics: {
    requests: number
    connections: number
    responseTime: number
    errorRate: number
    cpuUsage: number
    memoryUsage: number
  }
  healthCheck: {
    status: 'passing' | 'failing' | 'unknown'
    lastCheck: string
    responseTime: number
    consecutiveFailures: number
  }
  tags: string[]
  region: string
  zone: string
}

interface LoadBalancerRule {
  id: string
  name: string
  description: string
  priority: number
  isActive: boolean
  type: 'forward' | 'redirect' | 'fixed-response' | 'authenticate'
  conditions: {
    field: 'host-header' | 'path-pattern' | 'source-ip' | 'query-string' | 'http-header'
    operator: 'equals' | 'contains' | 'starts-with' | 'ends-with' | 'regex'
    values: string[]
  }[]
  actions: {
    type: 'forward' | 'redirect' | 'fixed-response'
    targetGroupArn?: string
    redirectConfig?: {
      protocol: string
      port: string
      host: string
      path: string
      query: string
      statusCode: number
    }
    fixedResponseConfig?: {
      statusCode: number
      contentType: string
      messageBody: string
    }
  }[]
  metrics: {
    matchedRequests: number
    forwardedRequests: number
    redirectedRequests: number
    lastMatched?: string
  }
}

interface TrafficPattern {
  id: string
  name: string
  description: string
  pattern: 'geographic' | 'temporal' | 'user-based' | 'content-based' | 'device-based'
  rules: {
    condition: string
    weight: number
    targets: string[]
  }[]
  isActive: boolean
  metrics: {
    totalRequests: number
    distribution: {
      targetId: string
      percentage: number
      requests: number
    }[]
  }
  schedule?: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
}

interface FailoverConfig {
  id: string
  name: string
  primaryTargets: string[]
  secondaryTargets: string[]
  tertiary?: string[]
  failoverCriteria: {
    healthCheckFailures: number
    responseTimeThreshold: number
    errorRateThreshold: number
    connectionFailures: number
  }
  autoFailback: {
    enabled: boolean
    healthyDuration: number
    verificationChecks: number
  }
  notifications: {
    enabled: boolean
    channels: ('email' | 'sms' | 'webhook' | 'slack')[]
    recipients: string[]
  }
  lastFailover?: {
    timestamp: string
    reason: string
    fromTargets: string[]
    toTargets: string[]
    duration: number
  }
}

const LoadBalancer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBalancer, setSelectedBalancer] = useState<LoadBalancer | null>(null)
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)

  // Dados mock para demonstração
  const [loadBalancers] = useState<LoadBalancer[]>([
    {
      id: '1',
      name: 'Web Application LB',
      type: 'application',
      algorithm: 'round-robin',
      status: 'active',
      location: 'US-East-1',
      provider: 'aws',
      configuration: {
        protocol: 'https',
        port: 443,
        sslTermination: true,
        sessionAffinity: false,
        healthCheck: {
          enabled: true,
          interval: 30,
          timeout: 5,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
          path: '/health'
        },
        connectionDraining: {
          enabled: true,
          timeout: 300
        }
      },
      metrics: {
        totalRequests: 2847592,
        activeConnections: 1247,
        requestsPerSecond: 847,
        avgResponseTime: 156,
        errorRate: 0.8,
        throughput: 2.4,
        uptime: 99.9,
        dataTransferred: 8547123456
      },
      targets: [
        {
          id: 't1',
          name: 'Web Server 01',
          type: 'instance',
          address: '10.0.1.10',
          port: 80,
          weight: 100,
          status: 'healthy',
          availability: 'available',
          metrics: {
            requests: 856432,
            connections: 412,
            responseTime: 142,
            errorRate: 0.5,
            cpuUsage: 65,
            memoryUsage: 72
          },
          healthCheck: {
            status: 'passing',
            lastCheck: '2025-01-15T14:45:00Z',
            responseTime: 45,
            consecutiveFailures: 0
          },
          tags: ['production', 'web'],
          region: 'us-east-1',
          zone: 'us-east-1a'
        },
        {
          id: 't2',
          name: 'Web Server 02',
          type: 'instance',
          address: '10.0.1.11',
          port: 80,
          weight: 100,
          status: 'healthy',
          availability: 'available',
          metrics: {
            requests: 923847,
            connections: 445,
            responseTime: 138,
            errorRate: 0.3,
            cpuUsage: 58,
            memoryUsage: 69
          },
          healthCheck: {
            status: 'passing',
            lastCheck: '2025-01-15T14:45:00Z',
            responseTime: 42,
            consecutiveFailures: 0
          },
          tags: ['production', 'web'],
          region: 'us-east-1',
          zone: 'us-east-1b'
        },
        {
          id: 't3',
          name: 'Web Server 03',
          type: 'instance',
          address: '10.0.1.12',
          port: 80,
          weight: 50,
          status: 'unhealthy',
          availability: 'maintenance',
          metrics: {
            requests: 0,
            connections: 0,
            responseTime: 0,
            errorRate: 0,
            cpuUsage: 0,
            memoryUsage: 0
          },
          healthCheck: {
            status: 'failing',
            lastCheck: '2025-01-15T14:43:00Z',
            responseTime: 0,
            consecutiveFailures: 5
          },
          tags: ['production', 'web', 'maintenance'],
          region: 'us-east-1',
          zone: 'us-east-1c'
        }
      ],
      rules: [
        {
          id: 'r1',
          name: 'API Traffic',
          description: 'Route API traffic to specific backend servers',
          priority: 100,
          isActive: true,
          type: 'forward',
          conditions: [
            {
              field: 'path-pattern',
              operator: 'starts-with',
              values: ['/api/*']
            }
          ],
          actions: [
            {
              type: 'forward',
              targetGroupArn: 'api-servers'
            }
          ],
          metrics: {
            matchedRequests: 456789,
            forwardedRequests: 456234,
            redirectedRequests: 0,
            lastMatched: '2025-01-15T14:44:32Z'
          }
        }
      ],
      createdAt: '2024-06-15T00:00:00Z',
      lastModified: '2025-01-10T12:30:00Z'
    },
    {
      id: '2',
      name: 'API Gateway LB',
      type: 'network',
      algorithm: 'least-connections',
      status: 'active',
      location: 'US-West-2',
      provider: 'nginx',
      configuration: {
        protocol: 'https',
        port: 443,
        sslTermination: true,
        sessionAffinity: true,
        healthCheck: {
          enabled: true,
          interval: 15,
          timeout: 3,
          healthyThreshold: 3,
          unhealthyThreshold: 2,
          path: '/health'
        },
        connectionDraining: {
          enabled: true,
          timeout: 180
        }
      },
      metrics: {
        totalRequests: 1234567,
        activeConnections: 723,
        requestsPerSecond: 432,
        avgResponseTime: 89,
        errorRate: 0.3,
        throughput: 1.8,
        uptime: 99.95,
        dataTransferred: 4567890123
      },
      targets: [
        {
          id: 't4',
          name: 'API Server 01',
          type: 'container',
          address: '10.0.2.10',
          port: 8080,
          weight: 100,
          status: 'healthy',
          availability: 'available',
          metrics: {
            requests: 567890,
            connections: 234,
            responseTime: 87,
            errorRate: 0.2,
            cpuUsage: 45,
            memoryUsage: 62
          },
          healthCheck: {
            status: 'passing',
            lastCheck: '2025-01-15T14:45:00Z',
            responseTime: 23,
            consecutiveFailures: 0
          },
          tags: ['api', 'production'],
          region: 'us-west-2',
          zone: 'us-west-2a'
        },
        {
          id: 't5',
          name: 'API Server 02',
          type: 'container',
          address: '10.0.2.11',
          port: 8080,
          weight: 100,
          status: 'healthy',
          availability: 'available',
          metrics: {
            requests: 666677,
            connections: 289,
            responseTime: 91,
            errorRate: 0.4,
            cpuUsage: 52,
            memoryUsage: 58
          },
          healthCheck: {
            status: 'passing',
            lastCheck: '2025-01-15T14:45:00Z',
            responseTime: 26,
            consecutiveFailures: 0
          },
          tags: ['api', 'production'],
          region: 'us-west-2',
          zone: 'us-west-2b'
        }
      ],
      rules: [],
      createdAt: '2024-08-20T00:00:00Z',
      lastModified: '2025-01-08T09:15:00Z'
    }
  ])

  const [trafficPatterns] = useState<TrafficPattern[]>([
    {
      id: '1',
      name: 'Geographic Distribution',
      description: 'Route traffic based on geographic location',
      pattern: 'geographic',
      rules: [
        { condition: 'region=us-east', weight: 60, targets: ['t1', 't2'] },
        { condition: 'region=us-west', weight: 30, targets: ['t4', 't5'] },
        { condition: 'region=eu', weight: 10, targets: ['t1'] }
      ],
      isActive: true,
      metrics: {
        totalRequests: 1500000,
        distribution: [
          { targetId: 't1', percentage: 35, requests: 525000 },
          { targetId: 't2', percentage: 35, requests: 525000 },
          { targetId: 't4', percentage: 20, requests: 300000 },
          { targetId: 't5', percentage: 10, requests: 150000 }
        ]
      }
    },
    {
      id: '2',
      name: 'Peak Hours Distribution',
      description: 'Adjust traffic distribution during peak hours',
      pattern: 'temporal',
      rules: [
        { condition: 'time=peak', weight: 80, targets: ['t1', 't2', 't4'] },
        { condition: 'time=off-peak', weight: 50, targets: ['t1', 't2'] }
      ],
      isActive: true,
      metrics: {
        totalRequests: 2000000,
        distribution: [
          { targetId: 't1', percentage: 40, requests: 800000 },
          { targetId: 't2', percentage: 40, requests: 800000 },
          { targetId: 't4', percentage: 20, requests: 400000 }
        ]
      },
      schedule: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'America/Sao_Paulo'
      }
    }
  ])

  const [failoverConfigs] = useState<FailoverConfig[]>([
    {
      id: '1',
      name: 'Primary-Secondary Failover',
      primaryTargets: ['t1', 't2'],
      secondaryTargets: ['t4', 't5'],
      failoverCriteria: {
        healthCheckFailures: 3,
        responseTimeThreshold: 5000,
        errorRateThreshold: 10,
        connectionFailures: 5
      },
      autoFailback: {
        enabled: true,
        healthyDuration: 300,
        verificationChecks: 5
      },
      notifications: {
        enabled: true,
        channels: ['email', 'slack'],
        recipients: ['ops@rsv.com', '#alerts']
      },
      lastFailover: {
        timestamp: '2024-12-20T15:30:00Z',
        reason: 'Primary target health check failures',
        fromTargets: ['t1'],
        toTargets: ['t4'],
        duration: 180
      }
    }
  ])

  // Dados para gráficos
  const trafficDistribution = [
    { time: '10:00', server1: 856, server2: 923, server3: 0, total: 1779 },
    { time: '11:00', server1: 934, server2: 1012, server3: 0, total: 1946 },
    { time: '12:00', server1: 1245, server2: 1389, server3: 0, total: 2634 },
    { time: '13:00', server1: 1123, server2: 1267, server3: 0, total: 2390 },
    { time: '14:00', server1: 1067, server2: 1198, server3: 0, total: 2265 }
  ]

  const responseTimeMetrics = [
    { target: 'Web Server 01', avgTime: 142, p95: 285, p99: 450 },
    { target: 'Web Server 02', avgTime: 138, p95: 275, p99: 420 },
    { target: 'API Server 01', avgTime: 87, p95: 165, p99: 280 },
    { target: 'API Server 02', avgTime: 91, p95: 178, p99: 295 }
  ]

  const loadDistribution = [
    { name: 'Web Server 01', load: 35, color: '#3b82f6' },
    { name: 'Web Server 02', load: 40, color: '#10b981' },
    { name: 'API Server 01', load: 15, color: '#f59e0b' },
    { name: 'API Server 02', load: 10, color: '#ef4444' }
  ]

  const healthMetrics = [
    { zone: 'us-east-1a', healthy: 95, unhealthy: 5 },
    { zone: 'us-east-1b', healthy: 98, unhealthy: 2 },
    { zone: 'us-west-2a', healthy: 92, unhealthy: 8 },
    { zone: 'us-west-2b', healthy: 97, unhealthy: 3 }
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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': case 'available': case 'passing': return 'bg-green-100 text-green-800'
      case 'inactive': case 'maintenance': case 'draining': return 'bg-yellow-100 text-yellow-800'
      case 'error': case 'unhealthy': case 'unavailable': case 'failing': return 'bg-red-100 text-red-800'
      case 'unknown': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws': return 'bg-orange-100 text-orange-800'
      case 'azure': return 'bg-blue-100 text-blue-800'
      case 'gcp': return 'bg-green-100 text-green-800'
      case 'cloudflare': return 'bg-purple-100 text-purple-800'
      case 'nginx': return 'bg-red-100 text-red-800'
      case 'haproxy': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application': return Globe
      case 'network': return Network
      case 'classic': return Server
      case 'gateway': return Router
      default: return Router
    }
  }

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'instance': return Server
      case 'container': return Archive
      case 'lambda': return Zap
      case 'service': return Cloud
      default: return Globe
    }
  }

  const calculateTotalRequests = () => {
    return loadBalancers.reduce((sum, lb) => sum + lb.metrics.totalRequests, 0)
  }

  const calculateAverageResponseTime = () => {
    const total = loadBalancers.reduce((sum, lb) => sum + lb.metrics.avgResponseTime, 0)
    return loadBalancers.length > 0 ? total / loadBalancers.length : 0
  }

  const getHealthyTargetsCount = () => {
    return loadBalancers.reduce((sum, lb) => {
      return sum + lb.targets.filter(t => t.status === 'healthy').length
    }, 0)
  }

  const getTotalTargetsCount = () => {
    return loadBalancers.reduce((sum, lb) => sum + lb.targets.length, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Load Balancer</h1>
          <p className="text-gray-600">Gerenciamento e monitoramento de balanceamento de carga</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsRuleModalOpen(!isRuleModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
          <Button variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balancers">Balanceadores</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="failover">Failover</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs de Load Balancer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(calculateTotalRequests())}
                </div>
                <p className="text-xs text-gray-600">
                  Requisições processadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {calculateAverageResponseTime().toFixed(0)}ms
                </div>
                <p className="text-xs text-gray-600">
                  Tempo médio de resposta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Targets Saudáveis</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {getHealthyTargetsCount()}/{getTotalTargetsCount()}
                </div>
                <p className="text-xs text-gray-600">
                  Targets disponíveis
                </p>
                <Progress 
                  value={(getHealthyTargetsCount() / getTotalTargetsCount()) * 100} 
                  className="mt-2 h-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balanceadores</CardTitle>
                <Router className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loadBalancers.filter(lb => lb.status === 'active').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {loadBalancers.length} ativos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Distribuição de Tráfego */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Tráfego</CardTitle>
              <CardDescription>Distribuição de requisições entre servidores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trafficDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="server1" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Web Server 01" />
                  <Area type="monotone" dataKey="server2" stackId="1" stroke="#10b981" fill="#10b981" name="Web Server 02" />
                  <Area type="monotone" dataKey="server3" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Web Server 03" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição de Carga */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Carga</CardTitle>
                <CardDescription>Percentual de carga por servidor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={loadDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="load"
                      label={({ name, load }) => `${name}: ${load}%`}
                    >
                      {loadDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tempo de Resposta por Target */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time por Target</CardTitle>
                <CardDescription>Métricas de latência detalhadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={responseTimeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="target" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="#3b82f6" name="Médio" />
                    <Bar dataKey="p95" fill="#f59e0b" name="P95" />
                    <Bar dataKey="p99" fill="#ef4444" name="P99" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status dos Load Balancers */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Load Balancers</CardTitle>
              <CardDescription>Visão geral dos balanceadores configurados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadBalancers.map((lb) => {
                  const TypeIcon = getTypeIcon(lb.type)
                  
                  return (
                    <div key={lb.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          lb.type === 'application' ? 'bg-blue-100' :
                          lb.type === 'network' ? 'bg-green-100' :
                          lb.type === 'gateway' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <TypeIcon className={`h-6 w-6 ${
                            lb.type === 'application' ? 'text-blue-600' :
                            lb.type === 'network' ? 'text-green-600' :
                            lb.type === 'gateway' ? 'text-purple-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{lb.name}</h4>
                          <p className="text-sm text-gray-600">{lb.location} • {lb.algorithm}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              RPS: {formatNumber(lb.metrics.requestsPerSecond)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Latência: {lb.metrics.avgResponseTime}ms
                            </span>
                            <span className="text-xs text-gray-500">
                              Uptime: {formatPercentage(lb.metrics.uptime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {lb.targets.filter(t => t.status === 'healthy').length}/{lb.targets.length}
                          </div>
                          <p className="text-xs text-gray-600">Targets healthy</p>
                        </div>
                        <Badge className={getStatusColor(lb.status)}>
                          {lb.status}
                        </Badge>
                        <Badge className={getProviderColor(lb.provider)}>
                          {lb.provider}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balancers" className="space-y-6">
          {/* Gerenciamento de Load Balancers */}
          <Card>
            <CardHeader>
              <CardTitle>Load Balancers</CardTitle>
              <CardDescription>Configuração e monitoramento dos balanceadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'application', label: 'Application' },
                      { value: 'network', label: 'Network' },
                      { value: 'classic', label: 'Classic' },
                      { value: 'gateway', label: 'Gateway' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por provider"
                    options={[
                      { value: 'all', label: 'Todos os Providers' },
                      { value: 'aws', label: 'AWS' },
                      { value: 'azure', label: 'Azure' },
                      { value: 'gcp', label: 'GCP' },
                      { value: 'nginx', label: 'Nginx' },
                      { value: 'haproxy', label: 'HAProxy' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Load Balancer
                  </Button>
                </div>

                <div className="grid gap-6">
                  {loadBalancers.map((lb) => {
                    const TypeIcon = getTypeIcon(lb.type)
                    
                    return (
                      <Card key={lb.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                lb.type === 'application' ? 'bg-blue-100' :
                                lb.type === 'network' ? 'bg-green-100' :
                                lb.type === 'gateway' ? 'bg-purple-100' : 'bg-gray-100'
                              }`}>
                                <TypeIcon className={`h-6 w-6 ${
                                  lb.type === 'application' ? 'text-blue-600' :
                                  lb.type === 'network' ? 'text-green-600' :
                                  lb.type === 'gateway' ? 'text-purple-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{lb.name}</h3>
                                <p className="text-gray-600">{lb.location}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={getProviderColor(lb.provider)}>
                                    {lb.provider}
                                  </Badge>
                                  <Badge className={getStatusColor(lb.status)}>
                                    {lb.status}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {lb.algorithm}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 mb-2">
                                {formatPercentage(lb.metrics.uptime)}
                              </div>
                              <p className="text-xs text-gray-600">Uptime</p>
                            </div>
                          </div>

                          {/* Métricas Principais */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {formatNumber(lb.metrics.requestsPerSecond)}
                              </div>
                              <div className="text-xs text-gray-600">RPS</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {lb.metrics.avgResponseTime}ms
                              </div>
                              <div className="text-xs text-gray-600">Latência Média</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {formatNumber(lb.metrics.activeConnections)}
                              </div>
                              <div className="text-xs text-gray-600">Conexões Ativas</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {formatPercentage(lb.metrics.errorRate)}
                              </div>
                              <div className="text-xs text-gray-600">Taxa de Erro</div>
                            </div>
                          </div>

                          {/* Configurações */}
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3">Configurações:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Protocol:</span>
                                <span className="ml-2 font-medium">{lb.configuration.protocol}:{lb.configuration.port}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">SSL Termination:</span>
                                <span className="ml-2 font-medium">
                                  {lb.configuration.sslTermination ? 'Habilitado' : 'Desabilitado'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Session Affinity:</span>
                                <span className="ml-2 font-medium">
                                  {lb.configuration.sessionAffinity ? 'Habilitado' : 'Desabilitado'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Health Check:</span>
                                <span className="ml-2 font-medium">
                                  {lb.configuration.healthCheck.enabled ? 'Habilitado' : 'Desabilitado'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Targets */}
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3">
                              Targets ({lb.targets.filter(t => t.status === 'healthy').length}/{lb.targets.length} healthy):
                            </h4>
                            <div className="space-y-2">
                              {lb.targets.map((target) => {
                                const TargetIcon = getTargetTypeIcon(target.type)
                                
                                return (
                                  <div key={target.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <TargetIcon className="h-4 w-4 text-gray-600" />
                                      <div>
                                        <span className="font-medium">{target.name}</span>
                                        <span className="text-sm text-gray-600 ml-2">
                                          {target.address}:{target.port}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-gray-600">
                                        Weight: {target.weight}
                                      </span>
                                      <Badge className={getStatusColor(target.status)}>
                                        {target.status}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                Criado: {formatDateTime(lb.createdAt)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Modificado: {formatDateTime(lb.lastModified)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Métricas
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Settings className="h-3 w-3 mr-1" />
                                Configurar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
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

        <TabsContent value="targets" className="space-y-6">
          {/* Gerenciamento de Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Targets</CardTitle>
              <CardDescription>Monitoramento de servidores backend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar targets..." title="Buscar targets" />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'healthy', label: 'Saudável' },
                      { value: 'unhealthy', label: 'Não Saudável' },
                      { value: 'draining', label: 'Draining' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'instance', label: 'Instance' },
                      { value: 'container', label: 'Container' },
                      { value: 'lambda', label: 'Lambda' },
                      { value: 'service', label: 'Service' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Target
                  </Button>
                </div>

                <div className="space-y-3">
                  {loadBalancers.flatMap(lb => 
                    lb.targets.map((target, index) => {
                      const TargetIcon = getTargetTypeIcon(target.type)
                      
                      return (
                        <Card key={`${lb.id}-${target.id}`} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  target.type === 'instance' ? 'bg-blue-100' :
                                  target.type === 'container' ? 'bg-green-100' :
                                  target.type === 'lambda' ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}>
                                  <TargetIcon className={`h-5 w-5 ${
                                    target.type === 'instance' ? 'text-blue-600' :
                                    target.type === 'container' ? 'text-green-600' :
                                    target.type === 'lambda' ? 'text-yellow-600' : 'text-gray-600'
                                  }`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{target.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {target.address}:{target.port} • {target.region}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {target.tags.map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={getStatusColor(target.status)}>
                                    {target.status}
                                  </Badge>
                                  <Badge className={getStatusColor(target.availability)}>
                                    {target.availability}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Weight: {target.weight}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                              <div>
                                <span className="text-gray-600">Requests:</span>
                                <span className="ml-2 font-medium">{formatNumber(target.metrics.requests)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Conexões:</span>
                                <span className="ml-2 font-medium">{target.metrics.connections}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Response Time:</span>
                                <span className="ml-2 font-medium">{target.metrics.responseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Error Rate:</span>
                                <span className="ml-2 font-medium">{formatPercentage(target.metrics.errorRate)}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">CPU Usage:</span>
                                  <span className="text-sm font-medium">{target.metrics.cpuUsage}%</span>
                                </div>
                                <Progress value={target.metrics.cpuUsage} className="h-2" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Memory Usage:</span>
                                  <span className="text-sm font-medium">{target.metrics.memoryUsage}%</span>
                                </div>
                                <Progress value={target.metrics.memoryUsage} className="h-2" />
                              </div>
                            </div>

                            <div className="mb-3">
                              <h5 className="font-semibold mb-2">Health Check:</h5>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Status:</span>
                                    <Badge className={getStatusColor(target.healthCheck.status)} size="sm">
                                      {target.healthCheck.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Response Time:</span>
                                    <span className="ml-2 font-medium">{target.healthCheck.responseTime}ms</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Failures:</span>
                                    <span className="ml-2 font-medium">{target.healthCheck.consecutiveFailures}</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Último check: {formatDateTime(target.healthCheck.lastCheck)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <span className="text-sm text-gray-500">
                                Load Balancer: {lb.name}
                              </span>
                              <div className="flex space-x-2">
                                <Button size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Detalhes
                                </Button>
                                <Button variant="secondary" size="sm">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Health Check
                                </Button>
                                {target.status === 'healthy' && (
                                  <Button variant="secondary" size="sm">
                                    <Pause className="h-3 w-3 mr-1" />
                                    Drain
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Status por Zone */}
          <Card>
            <CardHeader>
              <CardTitle>Health Status por Zone</CardTitle>
              <CardDescription>Distribuição de saúde dos targets por zona</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={healthMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="healthy" fill="#10b981" name="Healthy %" />
                  <Bar dataKey="unhealthy" fill="#ef4444" name="Unhealthy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {/* Regras de Routing */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Routing</CardTitle>
              <CardDescription>Configuração de regras de roteamento de tráfego</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Regras de Routing
                </h3>
                <p className="text-gray-600 mb-6">
                  Funcionalidade em desenvolvimento. Esta seção incluirá configuração avançada de regras de roteamento,
                  condições complexas e ações personalizadas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Path-based Routing</h4>
                    <p className="text-gray-600">Roteamento baseado em caminhos de URL</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Host-based Routing</h4>
                    <p className="text-gray-600">Roteamento baseado em host headers</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Weighted Routing</h4>
                    <p className="text-gray-600">Distribuição ponderada de tráfego</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          {/* Padrões de Tráfego */}
          <Card>
            <CardHeader>
              <CardTitle>Padrões de Tráfego</CardTitle>
              <CardDescription>Configuração de distribuição inteligente de tráfego</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trafficPatterns.map((pattern) => (
                  <Card key={pattern.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{pattern.name}</h3>
                          <p className="text-gray-600">{pattern.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={pattern.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {pattern.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {pattern.pattern}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Regras de Distribuição:</h4>
                          <div className="space-y-2">
                            {pattern.rules.map((rule, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium">{rule.condition}</span>
                                  <div className="text-sm text-gray-600">
                                    Targets: {rule.targets.join(', ')}
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {rule.weight}% weight
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Distribuição Atual:</h4>
                          <div className="space-y-2">
                            {pattern.metrics.distribution.map((dist, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm">{dist.targetId}</span>
                                <div className="flex items-center space-x-2">
                                  <Progress value={dist.percentage} className="w-24 h-2" />
                                  <span className="text-sm font-medium">{dist.percentage}%</span>
                                  <span className="text-xs text-gray-500">
                                    ({formatNumber(dist.requests)} req)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {pattern.schedule && (
                          <div>
                            <h4 className="font-semibold mb-2">Agendamento:</h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                              <p><strong>Horário:</strong> {pattern.schedule.startTime} - {pattern.schedule.endTime}</p>
                              <p><strong>Timezone:</strong> {pattern.schedule.timezone}</p>
                              <p><strong>Status:</strong> {pattern.schedule.enabled ? 'Habilitado' : 'Desabilitado'}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          Total: {formatNumber(pattern.metrics.totalRequests)} requests
                        </div>
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
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Estatísticas
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failover" className="space-y-6">
          {/* Configuração de Failover */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Failover</CardTitle>
              <CardDescription>Configuração de failover automático e recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {failoverConfigs.map((config) => (
                  <Card key={config.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{config.name}</h3>
                          <p className="text-gray-600">
                            Configuração de failover entre grupos de targets
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Ativo
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Configuração de Targets:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 border rounded-lg">
                              <h5 className="font-medium text-green-700 mb-2">Primary</h5>
                              <ul className="text-sm space-y-1">
                                {config.primaryTargets.map((target, index) => (
                                  <li key={index}>{target}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <h5 className="font-medium text-yellow-700 mb-2">Secondary</h5>
                              <ul className="text-sm space-y-1">
                                {config.secondaryTargets.map((target, index) => (
                                  <li key={index}>{target}</li>
                                ))}
                              </ul>
                            </div>
                            {config.tertiary && (
                              <div className="p-3 border rounded-lg">
                                <h5 className="font-medium text-red-700 mb-2">Tertiary</h5>
                                <ul className="text-sm space-y-1">
                                  {config.tertiary.map((target, index) => (
                                    <li key={index}>{target}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Critérios de Failover:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Health Check Failures:</span>
                              <span className="ml-2 font-medium">{config.failoverCriteria.healthCheckFailures}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Response Time Threshold:</span>
                              <span className="ml-2 font-medium">{config.failoverCriteria.responseTimeThreshold}ms</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Error Rate Threshold:</span>
                              <span className="ml-2 font-medium">{config.failoverCriteria.errorRateThreshold}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Connection Failures:</span>
                              <span className="ml-2 font-medium">{config.failoverCriteria.connectionFailures}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Auto Failback:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Habilitado:</span>
                                <span className="ml-2 font-medium">
                                  {config.autoFailback.enabled ? 'Sim' : 'Não'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Duração Saudável:</span>
                                <span className="ml-2 font-medium">{config.autoFailback.healthyDuration}s</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Checks de Verificação:</span>
                                <span className="ml-2 font-medium">{config.autoFailback.verificationChecks}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {config.lastFailover && (
                          <div>
                            <h4 className="font-semibold mb-2">Último Failover:</h4>
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Timestamp:</span>
                                  <span className="ml-2 font-medium">{formatDateTime(config.lastFailover.timestamp)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Duração:</span>
                                  <span className="ml-2 font-medium">{config.lastFailover.duration}s</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="text-gray-600">Motivo:</span>
                                  <span className="ml-2 font-medium">{config.lastFailover.reason}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">De:</span>
                                  <span className="ml-2 font-medium">{config.lastFailover.fromTargets.join(', ')}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Para:</span>
                                  <span className="ml-2 font-medium">{config.lastFailover.toTargets.join(', ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2">Notificações:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm">
                              <p><strong>Habilitado:</strong> {config.notifications.enabled ? 'Sim' : 'Não'}</p>
                              <p><strong>Canais:</strong> {config.notifications.channels.join(', ')}</p>
                              <p><strong>Destinatários:</strong> {config.notifications.recipients.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Badge variant="secondary">automatic</Badge>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Testar Failover
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <History className="h-3 w-3 mr-1" />
                            Histórico
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LoadBalancer
