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
  Layers,
  Database,
  Zap,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Copy,
  Archive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Server,
  HardDrive,
  Memory,
  Network,
  Cpu,
  Timer,
  Target,
  Gauge,
  Router,
  Cloud,
  Globe,
  Lock,
  Unlock,
  Key,
  Shield,
  Code,
  FileText,
  Folder,
  FolderOpen,
  Calendar,
  User,
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Share,
  Link,
  Star,
  Heart,
  Bookmark,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Maximize,
  Minimize
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

// Tipos para Cache Manager
interface CacheInstance {
  id: string
  name: string
  type: 'redis' | 'memcached' | 'elasticsearch' | 'cdn' | 'browser' | 'application'
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  location: string
  version: string
  configuration: {
    maxMemory: string
    evictionPolicy: string
    persistence: boolean
    clustering: boolean
    ssl: boolean
  }
  metrics: {
    hitRate: number
    missRate: number
    evictionRate: number
    memoryUsage: number
    cpuUsage: number
    connections: number
    operations: number
    latency: number
  }
  capacity: {
    totalMemory: number
    usedMemory: number
    availableMemory: number
    keys: number
    maxKeys: number
  }
  uptime: string
  lastRestart: string
  alerts: number
}

interface CacheKey {
  id: string
  key: string
  type: 'string' | 'hash' | 'list' | 'set' | 'zset' | 'stream' | 'json'
  size: number
  ttl: number
  expires: string
  lastAccessed: string
  accessCount: number
  memoryUsage: number
  tags: string[]
  namespace: string
  pattern?: string
  isHot: boolean
  compressionRatio?: number
}

interface CacheRule {
  id: string
  name: string
  description: string
  type: 'ttl' | 'pattern' | 'size' | 'access' | 'invalidation' | 'warming'
  isActive: boolean
  priority: number
  conditions: {
    field: string
    operator: 'equals' | 'contains' | 'starts_with' | 'regex' | 'greater_than' | 'less_than'
    value: string | number
  }[]
  actions: {
    type: 'cache' | 'evict' | 'refresh' | 'compress' | 'replicate'
    ttl?: number
    compression?: string
    replication?: string[]
  }[]
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  metrics: {
    applied: number
    successful: number
    failed: number
    lastApplied?: string
  }
  performance: {
    hitRateImprovement: number
    latencyReduction: number
    memoryOptimization: number
  }
}

interface CacheStrategy {
  id: string
  name: string
  description: string
  type: 'cache-aside' | 'write-through' | 'write-behind' | 'refresh-ahead' | 'read-through'
  applicability: string[]
  configuration: {
    defaultTtl: number
    maxSize: string
    evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random' | 'ttl'
    compression: boolean
    serialization: 'json' | 'binary' | 'msgpack' | 'avro'
  }
  performance: {
    expectedHitRate: number
    latencyReduction: number
    throughputIncrease: number
    costReduction: number
  }
  pros: string[]
  cons: string[]
  useCases: string[]
  implementation: {
    complexity: 'low' | 'medium' | 'high'
    effort: string
    risks: string[]
  }
}

interface CacheAnalytics {
  timeRange: string
  totalHits: number
  totalMisses: number
  hitRate: number
  avgLatency: number
  peakLatency: number
  memoryEfficiency: number
  costSavings: number
  topKeys: {
    key: string
    hits: number
    size: number
    namespace: string
  }[]
  patterns: {
    pattern: string
    frequency: number
    hitRate: number
    avgSize: number
  }[]
  recommendations: {
    type: 'optimization' | 'configuration' | 'strategy' | 'capacity'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    impact: string
    effort: string
  }[]
}

const CacheManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedInstance, setSelectedInstance] = useState<CacheInstance | null>(null)
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)

  // Dados mock para demonstração
  const [cacheInstances] = useState<CacheInstance[]>([
    {
      id: '1',
      name: 'Redis Primary',
      type: 'redis',
      status: 'healthy',
      location: 'US-East-1a',
      version: '7.0.5',
      configuration: {
        maxMemory: '16GB',
        evictionPolicy: 'allkeys-lru',
        persistence: true,
        clustering: true,
        ssl: true
      },
      metrics: {
        hitRate: 94.8,
        missRate: 5.2,
        evictionRate: 0.8,
        memoryUsage: 78,
        cpuUsage: 12,
        connections: 145,
        operations: 8547,
        latency: 0.8
      },
      capacity: {
        totalMemory: 16384,
        usedMemory: 12780,
        availableMemory: 3604,
        keys: 2847562,
        maxKeys: 5000000
      },
      uptime: '45d 12h 30m',
      lastRestart: '2024-11-30T08:00:00Z',
      alerts: 0
    },
    {
      id: '2',
      name: 'CDN Cache',
      type: 'cdn',
      status: 'healthy',
      location: 'Global',
      version: 'CloudFlare',
      configuration: {
        maxMemory: 'Unlimited',
        evictionPolicy: 'smart',
        persistence: false,
        clustering: true,
        ssl: true
      },
      metrics: {
        hitRate: 87.3,
        missRate: 12.7,
        evictionRate: 0.0,
        memoryUsage: 0,
        cpuUsage: 0,
        connections: 0,
        operations: 15240,
        latency: 45
      },
      capacity: {
        totalMemory: 0,
        usedMemory: 0,
        availableMemory: 0,
        keys: 0,
        maxKeys: 0
      },
      uptime: '99.9%',
      lastRestart: '2024-10-15T00:00:00Z',
      alerts: 0
    },
    {
      id: '3',
      name: 'Application Cache',
      type: 'application',
      status: 'warning',
      location: 'Local',
      version: 'Node.js LRU',
      configuration: {
        maxMemory: '2GB',
        evictionPolicy: 'lru',
        persistence: false,
        clustering: false,
        ssl: false
      },
      metrics: {
        hitRate: 72.4,
        missRate: 27.6,
        evictionRate: 15.2,
        memoryUsage: 89,
        cpuUsage: 5,
        connections: 0,
        operations: 3421,
        latency: 2.1
      },
      capacity: {
        totalMemory: 2048,
        usedMemory: 1823,
        availableMemory: 225,
        keys: 45672,
        maxKeys: 100000
      },
      uptime: '12d 5h 15m',
      lastRestart: '2025-01-03T14:20:00Z',
      alerts: 2
    }
  ])

  const [cacheKeys] = useState<CacheKey[]>([
    {
      id: '1',
      key: 'user:profile:12345',
      type: 'hash',
      size: 2048,
      ttl: 3600,
      expires: '2025-01-15T15:45:00Z',
      lastAccessed: '2025-01-15T14:30:00Z',
      accessCount: 247,
      memoryUsage: 2048,
      tags: ['user', 'profile', 'hot'],
      namespace: 'users',
      isHot: true,
      compressionRatio: 0.65
    },
    {
      id: '2',
      key: 'session:auth:token:abc123',
      type: 'string',
      size: 512,
      ttl: 1800,
      expires: '2025-01-15T15:15:00Z',
      lastAccessed: '2025-01-15T14:44:00Z',
      accessCount: 89,
      memoryUsage: 512,
      tags: ['session', 'auth'],
      namespace: 'sessions',
      isHot: true
    },
    {
      id: '3',
      key: 'product:catalog:electronics',
      type: 'list',
      size: 15360,
      ttl: 7200,
      expires: '2025-01-15T16:45:00Z',
      lastAccessed: '2025-01-15T13:22:00Z',
      accessCount: 156,
      memoryUsage: 15360,
      tags: ['product', 'catalog'],
      namespace: 'products',
      isHot: false,
      compressionRatio: 0.42
    },
    {
      id: '4',
      key: 'analytics:daily:2025-01-15',
      type: 'json',
      size: 8192,
      ttl: 86400,
      expires: '2025-01-16T14:45:00Z',
      lastAccessed: '2025-01-15T14:45:00Z',
      accessCount: 23,
      memoryUsage: 8192,
      tags: ['analytics', 'daily'],
      namespace: 'analytics',
      isHot: false
    }
  ])

  const [cacheRules] = useState<CacheRule[]>([
    {
      id: '1',
      name: 'User Profile Hot Cache',
      description: 'Mantém perfis de usuários ativos em cache com TTL otimizado',
      type: 'warming',
      isActive: true,
      priority: 1,
      conditions: [
        { field: 'namespace', operator: 'equals', value: 'users' },
        { field: 'accessCount', operator: 'greater_than', value: 100 }
      ],
      actions: [
        { type: 'cache', ttl: 7200, compression: 'gzip' },
        { type: 'replicate', replication: ['redis-replica-1', 'redis-replica-2'] }
      ],
      metrics: {
        applied: 1247,
        successful: 1235,
        failed: 12,
        lastApplied: '2025-01-15T14:30:00Z'
      },
      performance: {
        hitRateImprovement: 15.2,
        latencyReduction: 45,
        memoryOptimization: 23
      }
    },
    {
      id: '2',
      name: 'Session Auto-Refresh',
      description: 'Renova automaticamente sessões ativas próximas do vencimento',
      type: 'ttl',
      isActive: true,
      priority: 2,
      conditions: [
        { field: 'namespace', operator: 'equals', value: 'sessions' },
        { field: 'ttl', operator: 'less_than', value: 300 }
      ],
      actions: [
        { type: 'refresh', ttl: 1800 }
      ],
      schedule: {
        enabled: true,
        cron: '*/5 * * * *',
        timezone: 'America/Sao_Paulo'
      },
      metrics: {
        applied: 456,
        successful: 450,
        failed: 6,
        lastApplied: '2025-01-15T14:45:00Z'
      },
      performance: {
        hitRateImprovement: 8.7,
        latencyReduction: 20,
        memoryOptimization: 12
      }
    },
    {
      id: '3',
      name: 'Large Object Compression',
      description: 'Comprime automaticamente objetos maiores que 5KB',
      type: 'size',
      isActive: true,
      priority: 3,
      conditions: [
        { field: 'size', operator: 'greater_than', value: 5120 }
      ],
      actions: [
        { type: 'compress', compression: 'lz4' }
      ],
      metrics: {
        applied: 234,
        successful: 229,
        failed: 5,
        lastApplied: '2025-01-15T13:15:00Z'
      },
      performance: {
        hitRateImprovement: 3.4,
        latencyReduction: 12,
        memoryOptimization: 42
      }
    }
  ])

  const [cacheStrategies] = useState<CacheStrategy[]>([
    {
      id: '1',
      name: 'Cache-Aside (Lazy Loading)',
      description: 'Aplicação gerencia o cache, carregando dados sob demanda',
      type: 'cache-aside',
      applicability: ['Read-heavy workloads', 'Tolerance for cache misses', 'Simple implementation'],
      configuration: {
        defaultTtl: 3600,
        maxSize: '10GB',
        evictionPolicy: 'lru',
        compression: true,
        serialization: 'json'
      },
      performance: {
        expectedHitRate: 85,
        latencyReduction: 60,
        throughputIncrease: 40,
        costReduction: 25
      },
      pros: [
        'Simples de implementar',
        'Falha graciosamente',
        'Dados sempre consistentes no cache',
        'Flexibilidade no que cachear'
      ],
      cons: [
        'Cache miss penalty',
        'Código complexo para invalidação',
        'Possível inconsistência temporária'
      ],
      useCases: [
        'APIs de consulta',
        'Dashboards analíticos',
        'Catálogos de produtos',
        'Perfis de usuário'
      ],
      implementation: {
        complexity: 'low',
        effort: '1-2 semanas',
        risks: ['Cache stampede', 'Stale data']
      }
    },
    {
      id: '2',
      name: 'Write-Through',
      description: 'Dados são escritos simultaneamente no cache e banco de dados',
      type: 'write-through',
      applicability: ['Strong consistency required', 'Write-heavy workloads', 'Immediate read consistency'],
      configuration: {
        defaultTtl: 7200,
        maxSize: '20GB',
        evictionPolicy: 'lfu',
        compression: true,
        serialization: 'binary'
      },
      performance: {
        expectedHitRate: 92,
        latencyReduction: 75,
        throughputIncrease: 30,
        costReduction: 35
      },
      pros: [
        'Dados sempre atualizados',
        'Reduz latência de leitura',
        'Consistência garantida',
        'Proteção contra falhas'
      ],
      cons: [
        'Latência maior na escrita',
        'Complexidade adicional',
        'Pode cachear dados desnecessários'
      ],
      useCases: [
        'Sistemas financeiros',
        'Inventário em tempo real',
        'Configurações de sistema',
        'Dados críticos de negócio'
      ],
      implementation: {
        complexity: 'medium',
        effort: '2-4 semanas',
        risks: ['Write amplification', 'Cache bloat']
      }
    },
    {
      id: '3',
      name: 'Refresh-Ahead',
      description: 'Cache é atualizado proativamente antes da expiração',
      type: 'refresh-ahead',
      applicability: ['Predictable access patterns', 'High availability requirements', 'Expensive computations'],
      configuration: {
        defaultTtl: 14400,
        maxSize: '15GB',
        evictionPolicy: 'ttl',
        compression: false,
        serialization: 'msgpack'
      },
      performance: {
        expectedHitRate: 98,
        latencyReduction: 90,
        throughputIncrease: 70,
        costReduction: 45
      },
      pros: [
        'Latência consistentemente baixa',
        'Alto hit rate',
        'Melhor experiência do usuário',
        'Reduz carga no backend'
      ],
      cons: [
        'Uso adicional de recursos',
        'Complexidade de implementação',
        'Pode renovar dados desnecessários'
      ],
      useCases: [
        'Dados de sessão',
        'Configurações frequentes',
        'Dados de lookup',
        'Reports pré-computados'
      ],
      implementation: {
        complexity: 'high',
        effort: '3-6 semanas',
        risks: ['Resource overhead', 'Timing complexity']
      }
    }
  ])

  // Dados para gráficos
  const cacheMetricsTrend = [
    { time: '10:00', hitRate: 89.2, missRate: 10.8, evictions: 12, latency: 1.2 },
    { time: '11:00', hitRate: 91.5, missRate: 8.5, evictions: 8, latency: 0.9 },
    { time: '12:00', hitRate: 94.1, missRate: 5.9, evictions: 15, latency: 0.8 },
    { time: '13:00', hitRate: 92.8, missRate: 7.2, evictions: 11, latency: 1.1 },
    { time: '14:00', hitRate: 94.8, missRate: 5.2, evictions: 9, latency: 0.8 }
  ]

  const cacheTypeDistribution = [
    { name: 'Redis', usage: 45, color: '#dc2626' },
    { name: 'CDN', usage: 30, color: '#2563eb' },
    { name: 'Application', usage: 15, color: '#16a34a' },
    { name: 'Browser', usage: 10, color: '#ca8a04' }
  ]

  const keyTypeAnalysis = [
    { type: 'hash', count: 1247, avgSize: 2048, hitRate: 94.2 },
    { type: 'string', count: 3456, avgSize: 512, hitRate: 91.8 },
    { type: 'list', count: 789, avgSize: 8192, hitRate: 87.3 },
    { type: 'json', count: 1123, avgSize: 4096, hitRate: 89.6 },
    { type: 'set', count: 567, avgSize: 1024, hitRate: 85.7 }
  ]

  const namespaceMetrics = [
    { namespace: 'users', keys: 1247, hitRate: 94.8, memory: 2.5 },
    { namespace: 'sessions', keys: 3456, hitRate: 91.2, memory: 1.7 },
    { namespace: 'products', keys: 789, hitRate: 87.9, memory: 6.4 },
    { namespace: 'analytics', keys: 456, hitRate: 83.2, memory: 3.7 }
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
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'redis': return 'bg-red-100 text-red-800'
      case 'memcached': return 'bg-blue-100 text-blue-800'
      case 'cdn': return 'bg-purple-100 text-purple-800'
      case 'application': return 'bg-green-100 text-green-800'
      case 'browser': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-red-100 text-red-800'
    if (priority <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'redis': case 'memcached': return Database
      case 'cdn': return Cloud
      case 'application': return Server
      case 'browser': return Globe
      default: return Layers
    }
  }

  const getKeyTypeIcon = (type: string) => {
    switch (type) {
      case 'hash': return Code
      case 'string': return FileText
      case 'list': return Folder
      case 'set': return Archive
      case 'json': return Code
      default: return Database
    }
  }

  const calculateOverallHitRate = () => {
    const totalHits = cacheInstances.reduce((sum, instance) => {
      return sum + (instance.metrics.operations * instance.metrics.hitRate / 100)
    }, 0)
    const totalOperations = cacheInstances.reduce((sum, instance) => sum + instance.metrics.operations, 0)
    return totalOperations > 0 ? (totalHits / totalOperations) * 100 : 0
  }

  const getTotalMemoryUsage = () => {
    return cacheInstances.reduce((sum, instance) => sum + instance.capacity.usedMemory, 0)
  }

  const getActiveRulesCount = () => {
    return cacheRules.filter(rule => rule.isActive).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Cache</h1>
          <p className="text-gray-600">Sistema avançado de cache e otimização de performance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsRuleModalOpen(!isRuleModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
          <Button variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instances">Instâncias</TabsTrigger>
          <TabsTrigger value="keys">Chaves</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="strategies">Estratégias</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs de Cache */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hit Rate Geral</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(calculateOverallHitRate())}
                </div>
                <p className="text-xs text-gray-600">
                  Eficiência do cache
                </p>
                <Progress value={calculateOverallHitRate()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memória Utilizada</CardTitle>
                <Memory className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatBytes(getTotalMemoryUsage() * 1024 * 1024)}
                </div>
                <p className="text-xs text-gray-600">
                  Total em todas as instâncias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instâncias Ativas</CardTitle>
                <Server className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {cacheInstances.filter(i => i.status === 'healthy').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {cacheInstances.length} totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
                <Settings className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getActiveRulesCount()}
                </div>
                <p className="text-xs text-gray-600">
                  Otimizações automáticas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Métricas de Cache */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Cache em Tempo Real</CardTitle>
              <CardDescription>Performance do cache nas últimas horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={cacheMetricsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="hitRate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Hit Rate %" />
                  <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} name="Latência (ms)" />
                  <Bar yAxisId="left" dataKey="evictions" fill="#ef4444" name="Evictions" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Tipo de Cache */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <CardDescription>Uso de memória por tipo de cache</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={cacheTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="usage"
                      label={({ name, usage }) => `${name}: ${usage}%`}
                    >
                      {cacheTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise por Namespace */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Namespace</CardTitle>
                <CardDescription>Hit rate e uso de memória por namespace</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={namespaceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="namespace" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="hitRate" fill="#3b82f6" name="Hit Rate %" />
                    <Bar yAxisId="right" dataKey="memory" fill="#10b981" name="Memória (GB)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status das Instâncias */}
          <Card>
            <CardHeader>
              <CardTitle>Status das Instâncias de Cache</CardTitle>
              <CardDescription>Visão geral do status e métricas das instâncias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheInstances.map((instance) => {
                  const TypeIcon = getTypeIcon(instance.type)
                  
                  return (
                    <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          instance.type === 'redis' ? 'bg-red-100' :
                          instance.type === 'cdn' ? 'bg-purple-100' :
                          instance.type === 'application' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <TypeIcon className={`h-6 w-6 ${
                            instance.type === 'redis' ? 'text-red-600' :
                            instance.type === 'cdn' ? 'text-purple-600' :
                            instance.type === 'application' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{instance.name}</h4>
                          <p className="text-sm text-gray-600">{instance.location} • {instance.version}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Hit Rate: {formatPercentage(instance.metrics.hitRate)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Latência: {instance.metrics.latency}ms
                            </span>
                            <span className="text-xs text-gray-500">
                              Uptime: {instance.uptime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatBytes(instance.capacity.usedMemory * 1024 * 1024)}
                          </div>
                          <Progress value={instance.metrics.memoryUsage} className="w-20 h-2 mt-1" />
                        </div>
                        <Badge className={getStatusColor(instance.status)}>
                          {instance.status}
                        </Badge>
                        {instance.alerts > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            {instance.alerts} alertas
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          {/* Gerenciamento de Instâncias */}
          <Card>
            <CardHeader>
              <CardTitle>Instâncias de Cache</CardTitle>
              <CardDescription>Monitoramento e configuração das instâncias de cache</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'redis', label: 'Redis' },
                      { value: 'memcached', label: 'Memcached' },
                      { value: 'cdn', label: 'CDN' },
                      { value: 'application', label: 'Application' },
                      { value: 'browser', label: 'Browser' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'healthy', label: 'Saudável' },
                      { value: 'warning', label: 'Atenção' },
                      { value: 'critical', label: 'Crítico' },
                      { value: 'offline', label: 'Offline' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Instância
                  </Button>
                </div>

                <div className="grid gap-6">
                  {cacheInstances.map((instance) => {
                    const TypeIcon = getTypeIcon(instance.type)
                    
                    return (
                      <Card key={instance.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                instance.type === 'redis' ? 'bg-red-100' :
                                instance.type === 'cdn' ? 'bg-purple-100' :
                                instance.type === 'application' ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <TypeIcon className={`h-6 w-6 ${
                                  instance.type === 'redis' ? 'text-red-600' :
                                  instance.type === 'cdn' ? 'text-purple-600' :
                                  instance.type === 'application' ? 'text-green-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{instance.name}</h3>
                                <p className="text-gray-600">{instance.location} • Version {instance.version}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={getTypeColor(instance.type)}>
                                    {instance.type}
                                  </Badge>
                                  <Badge className={getStatusColor(instance.status)}>
                                    {instance.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 mb-2">
                                {formatPercentage(instance.metrics.hitRate)}
                              </div>
                              <p className="text-xs text-gray-600">Hit Rate</p>
                            </div>
                          </div>

                          {/* Métricas Principais */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {instance.metrics.latency}ms
                              </div>
                              <div className="text-xs text-gray-600">Latência</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {formatNumber(instance.metrics.operations)}
                              </div>
                              <div className="text-xs text-gray-600">Operações/min</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {instance.metrics.connections}
                              </div>
                              <div className="text-xs text-gray-600">Conexões</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {formatNumber(instance.capacity.keys)}
                              </div>
                              <div className="text-xs text-gray-600">Chaves</div>
                            </div>
                          </div>

                          {/* Uso de Memória */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Uso de Memória</span>
                              <span className="text-sm text-gray-600">
                                {formatBytes(instance.capacity.usedMemory * 1024 * 1024)} / {instance.configuration.maxMemory}
                              </span>
                            </div>
                            <Progress value={instance.metrics.memoryUsage} className="h-3" />
                            <div className="text-xs text-gray-500 mt-1">
                              {formatPercentage(instance.metrics.memoryUsage)} utilizado
                            </div>
                          </div>

                          {/* Configurações */}
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3">Configurações:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Política de Eviction:</span>
                                <span className="ml-2 font-medium">{instance.configuration.evictionPolicy}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Persistência:</span>
                                <span className="ml-2 font-medium">
                                  {instance.configuration.persistence ? 'Habilitada' : 'Desabilitada'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Clustering:</span>
                                <span className="ml-2 font-medium">
                                  {instance.configuration.clustering ? 'Habilitado' : 'Desabilitado'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">SSL:</span>
                                <span className="ml-2 font-medium">
                                  {instance.configuration.ssl ? 'Habilitado' : 'Desabilitado'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                              {instance.alerts > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                  {instance.alerts} alertas
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                Uptime: {instance.uptime}
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
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Restart
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

        <TabsContent value="keys" className="space-y-6">
          {/* Gerenciamento de Chaves */}
          <Card>
            <CardHeader>
              <CardTitle>Chaves de Cache</CardTitle>
              <CardDescription>Visualização e gestão das chaves armazenadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar chaves..." title="Buscar chaves" />
                  <Select 
                    title="Filtrar por namespace"
                    options={[
                      { value: 'all', label: 'Todos os Namespaces' },
                      { value: 'users', label: 'Users' },
                      { value: 'sessions', label: 'Sessions' },
                      { value: 'products', label: 'Products' },
                      { value: 'analytics', label: 'Analytics' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'string', label: 'String' },
                      { value: 'hash', label: 'Hash' },
                      { value: 'list', label: 'List' },
                      { value: 'set', label: 'Set' },
                      { value: 'json', label: 'JSON' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="space-y-3">
                  {cacheKeys.map((key) => {
                    const TypeIcon = getKeyTypeIcon(key.type)
                    
                    return (
                      <Card key={key.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                key.type === 'hash' ? 'bg-blue-100' :
                                key.type === 'string' ? 'bg-green-100' :
                                key.type === 'list' ? 'bg-purple-100' :
                                key.type === 'json' ? 'bg-orange-100' : 'bg-gray-100'
                              }`}>
                                <TypeIcon className={`h-5 w-5 ${
                                  key.type === 'hash' ? 'text-blue-600' :
                                  key.type === 'string' ? 'text-green-600' :
                                  key.type === 'list' ? 'text-purple-600' :
                                  key.type === 'json' ? 'text-orange-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{key.key}</h4>
                                <p className="text-sm text-gray-600">
                                  Namespace: {key.namespace} • Tipo: {key.type}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {key.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {formatBytes(key.size)}
                              </div>
                              {key.isHot && (
                                <Badge className="bg-red-100 text-red-800">
                                  🔥 Hot
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-gray-600">TTL:</span>
                              <span className="ml-2 font-medium">{key.ttl}s</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Acessos:</span>
                              <span className="ml-2 font-medium">{formatNumber(key.accessCount)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Último Acesso:</span>
                              <span className="ml-2 font-medium">{formatDateTime(key.lastAccessed)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Expira:</span>
                              <span className="ml-2 font-medium">{formatDateTime(key.expires)}</span>
                            </div>
                          </div>

                          {key.compressionRatio && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Compressão:</span>
                                <span className="text-sm font-medium">
                                  {formatPercentage(key.compressionRatio * 100)} redução
                                </span>
                              </div>
                              <Progress value={key.compressionRatio * 100} className="h-2 mt-1" />
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              ID: {key.id}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Copy className="h-3 w-3 mr-1" />
                                Duplicar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Renovar TTL
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remover
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

          {/* Análise de Tipos de Chave */}
          <Card>
            <CardHeader>
              <CardTitle>Análise por Tipo de Chave</CardTitle>
              <CardDescription>Performance e distribuição dos tipos de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={keyTypeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Quantidade" />
                  <Bar yAxisId="right" dataKey="hitRate" fill="#10b981" name="Hit Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {/* Regras de Cache */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Cache</CardTitle>
              <CardDescription>Automação e otimização de políticas de cache</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'ttl', label: 'TTL' },
                      { value: 'pattern', label: 'Pattern' },
                      { value: 'size', label: 'Size' },
                      { value: 'access', label: 'Access' },
                      { value: 'warming', label: 'Warming' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'active', label: 'Ativas' },
                      { value: 'inactive', label: 'Inativas' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                </div>

                <div className="grid gap-4">
                  {cacheRules.map((rule) => (
                    <Card key={rule.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <p className="text-gray-600">{rule.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getPriorityColor(rule.priority)}>
                                Prioridade {rule.priority}
                              </Badge>
                              <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {rule.isActive ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Tipo: {rule.type}
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
                                    {condition.field} {condition.operator} {condition.value}
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
                                  {action.ttl && ` (TTL: ${action.ttl}s)`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Aplicada:</span>
                            <span className="ml-2 font-medium">{formatNumber(rule.metrics.applied)}x</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sucessos:</span>
                            <span className="ml-2 font-medium">{formatNumber(rule.metrics.successful)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Falhas:</span>
                            <span className="ml-2 font-medium">{rule.metrics.failed}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Última Aplicação:</span>
                            <span className="ml-2 font-medium">
                              {rule.metrics.lastApplied ? formatDateTime(rule.metrics.lastApplied) : 'Nunca'}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Impacto na Performance:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Hit Rate:</span>
                              <span className="ml-2 font-medium text-green-600">
                                +{formatPercentage(rule.performance.hitRateImprovement)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Latência:</span>
                              <span className="ml-2 font-medium text-blue-600">
                                -{rule.performance.latencyReduction}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Memória:</span>
                              <span className="ml-2 font-medium text-purple-600">
                                -{rule.performance.memoryOptimization}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {rule.schedule && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Agendamento:</h4>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm">
                                <strong>Cron:</strong> {rule.schedule.cron}
                              </p>
                              <p className="text-sm">
                                <strong>Timezone:</strong> {rule.schedule.timezone}
                              </p>
                              <p className="text-sm">
                                <strong>Status:</strong> {rule.schedule.enabled ? 'Habilitado' : 'Desabilitado'}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <Badge variant="secondary">{rule.type}</Badge>
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

        <TabsContent value="strategies" className="space-y-6">
          {/* Estratégias de Cache */}
          <Card>
            <CardHeader>
              <CardTitle>Estratégias de Cache</CardTitle>
              <CardDescription>Padrões e estratégias de implementação de cache</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cacheStrategies.map((strategy) => (
                  <Card key={strategy.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{strategy.name}</h3>
                          <p className="text-gray-600">{strategy.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            strategy.implementation.complexity === 'low' ? 'bg-green-100 text-green-800' :
                            strategy.implementation.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {strategy.implementation.complexity}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {strategy.performance.expectedHitRate}%
                          </div>
                          <div className="text-xs text-gray-600">Expected Hit Rate</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            -{strategy.performance.latencyReduction}%
                          </div>
                          <div className="text-xs text-gray-600">Redução de Latência</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            +{strategy.performance.throughputIncrease}%
                          </div>
                          <div className="text-xs text-gray-600">Aumento de Throughput</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">
                            -{strategy.performance.costReduction}%
                          </div>
                          <div className="text-xs text-gray-600">Redução de Custo</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2 text-green-700">Prós:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {strategy.pros.map((pro, index) => (
                              <li key={index}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-red-700">Contras:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {strategy.cons.map((con, index) => (
                              <li key={index}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Aplicabilidade:</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.applicability.map((item, index) => (
                              <Badge key={index} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Casos de Uso:</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.useCases.map((useCase, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Configuração Padrão:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">TTL Padrão:</span>
                                <span className="ml-2 font-medium">{strategy.configuration.defaultTtl}s</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Tamanho Máximo:</span>
                                <span className="ml-2 font-medium">{strategy.configuration.maxSize}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Política de Eviction:</span>
                                <span className="ml-2 font-medium">{strategy.configuration.evictionPolicy}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Serialização:</span>
                                <span className="ml-2 font-medium">{strategy.configuration.serialization}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Implementação:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Esforço:</span>
                              <span className="ml-2 font-medium">{strategy.implementation.effort}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Complexidade:</span>
                              <span className="ml-2 font-medium">{strategy.implementation.complexity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Riscos:</span>
                              <span className="ml-2 font-medium">{strategy.implementation.risks.length} identificados</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Badge variant="secondary">{strategy.type}</Badge>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Implementar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Copy className="h-3 w-3 mr-1" />
                            Template
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

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics de Cache */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Cache</CardTitle>
              <CardDescription>Análise detalhada de performance e uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">2.4M</div>
                    <div className="text-sm text-gray-600">Total de Hits</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">156K</div>
                    <div className="text-sm text-gray-600">Total de Misses</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">93.9%</div>
                    <div className="text-sm text-gray-600">Hit Rate Médio</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">$2,450</div>
                    <div className="text-sm text-gray-600">Economia Mensal</div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analytics Avançadas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Funcionalidade em desenvolvimento. Esta seção incluirá análises detalhadas de performance,
                    recomendações inteligentes e insights de otimização.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Análise de Padrões</h4>
                      <p className="text-gray-600">Identificação automática de padrões de acesso</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Previsão de Demanda</h4>
                      <p className="text-gray-600">Machine learning para prever picos de tráfego</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Otimização Automática</h4>
                      <p className="text-gray-600">Sugestões inteligentes de otimização</p>
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

export default CacheManager
