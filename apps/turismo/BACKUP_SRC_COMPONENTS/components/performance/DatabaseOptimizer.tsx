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
  Database,
  Server,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Cpu,
  Memory,
  HardDrive,
  Target,
  Gauge,
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
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Archive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Code,
  FileText,
  Folder,
  FolderOpen,
  Calendar,
  Timer,
  Users,
  User,
  Building,
  MapPin,
  Network,
  Globe,
  Cloud,
  Router,
  Shield,
  Lock,
  Unlock,
  Key,
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
  Mail,
  Phone
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

// Tipos para Database Optimizer
interface DatabaseInstance {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'oracle'
  version: string
  environment: 'production' | 'staging' | 'development' | 'testing'
  status: 'online' | 'offline' | 'maintenance' | 'error'
  host: string
  port: number
  size: number
  connections: {
    current: number
    max: number
    utilization: number
  }
  performance: {
    queryTime: number
    throughput: number
    cacheHitRate: number
    lockWaitTime: number
    deadlocks: number
  }
  resources: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    ioOperations: number
    networkThroughput: number
  }
  configuration: {
    bufferPoolSize: string
    maxConnections: number
    queryTimeout: number
    logLevel: string
    autoVacuum: boolean
  }
  lastBackup: string
  lastOptimized: string
  optimization: {
    score: number
    recommendations: number
    appliedRecommendations: number
  }
}

interface QueryPerformance {
  id: string
  query: string
  queryHash: string
  database: string
  table: string
  type: 'select' | 'insert' | 'update' | 'delete' | 'create' | 'alter'
  executionCount: number
  avgExecutionTime: number
  maxExecutionTime: number
  minExecutionTime: number
  totalExecutionTime: number
  lastExecuted: string
  slowQuery: boolean
  indexRecommendations: string[]
  optimizationSuggestions: string[]
  queryPlan: {
    cost: number
    rows: number
    loops: number
    bufferHits: number
    bufferReads: number
  }
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface DatabaseIndex {
  id: string
  name: string
  table: string
  database: string
  type: 'btree' | 'hash' | 'gist' | 'gin' | 'unique' | 'partial'
  columns: string[]
  size: number
  usage: {
    scans: number
    tuplesRead: number
    tuplesReturned: number
    efficiency: number
  }
  isActive: boolean
  createdAt: string
  lastUsed: string
  maintenanceNeeded: boolean
  recommendations: string[]
  status: 'healthy' | 'unused' | 'redundant' | 'fragmented' | 'missing'
}

interface OptimizationRule {
  id: string
  name: string
  description: string
  category: 'performance' | 'storage' | 'maintenance' | 'security' | 'configuration'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  isAutomatic: boolean
  conditions: {
    metric: string
    operator: 'greater_than' | 'less_than' | 'equals' | 'between'
    value: number | number[]
    timeframe?: string
  }[]
  actions: {
    type: 'reindex' | 'vacuum' | 'analyze' | 'cache_clear' | 'config_update' | 'alert'
    parameters: Record<string, any>
    rollbackPossible: boolean
  }[]
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
    maintenanceWindow: boolean
  }
  metrics: {
    triggered: number
    successful: number
    failed: number
    lastTriggered?: string
    averageImpact: number
  }
  impact: {
    performanceGain: number
    storageReduction: number
    maintenanceReduction: number
  }
}

interface MaintenanceTask {
  id: string
  name: string
  description: string
  type: 'vacuum' | 'reindex' | 'analyze' | 'backup' | 'cleanup' | 'update_stats'
  database: string
  table?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  duration?: number
  estimatedDuration: number
  impact: {
    lockLevel: 'none' | 'shared' | 'exclusive'
    downtime: boolean
    performanceImpact: 'none' | 'low' | 'medium' | 'high'
  }
  results?: {
    rowsProcessed: number
    spaceSaved: number
    performanceImprovement: number
    errors: string[]
  }
  dependencies: string[]
  autoScheduled: boolean
}

const DatabaseOptimizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInstance | null>(null)
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false)

  // Dados mock para demonstração
  const [databases] = useState<DatabaseInstance[]>([
    {
      id: '1',
      name: 'Production DB',
      type: 'postgresql',
      version: '15.2',
      environment: 'production',
      status: 'online',
      host: 'db-prod-01.rsv.com',
      port: 5432,
      size: 2147483648,
      connections: {
        current: 85,
        max: 200,
        utilization: 42.5
      },
      performance: {
        queryTime: 156,
        throughput: 1247,
        cacheHitRate: 94.8,
        lockWaitTime: 2.3,
        deadlocks: 0
      },
      resources: {
        cpuUsage: 68,
        memoryUsage: 72,
        diskUsage: 45,
        ioOperations: 8547,
        networkThroughput: 2.4
      },
      configuration: {
        bufferPoolSize: '2GB',
        maxConnections: 200,
        queryTimeout: 30000,
        logLevel: 'info',
        autoVacuum: true
      },
      lastBackup: '2025-01-15T02:00:00Z',
      lastOptimized: '2025-01-10T14:30:00Z',
      optimization: {
        score: 87,
        recommendations: 8,
        appliedRecommendations: 6
      }
    },
    {
      id: '2',
      name: 'Analytics DB',
      type: 'mysql',
      version: '8.0.33',
      environment: 'production',
      status: 'online',
      host: 'db-analytics-01.rsv.com',
      port: 3306,
      size: 5368709120,
      connections: {
        current: 23,
        max: 100,
        utilization: 23
      },
      performance: {
        queryTime: 89,
        throughput: 456,
        cacheHitRate: 91.2,
        lockWaitTime: 1.1,
        deadlocks: 2
      },
      resources: {
        cpuUsage: 34,
        memoryUsage: 56,
        diskUsage: 78,
        ioOperations: 3421,
        networkThroughput: 1.8
      },
      configuration: {
        bufferPoolSize: '4GB',
        maxConnections: 100,
        queryTimeout: 60000,
        logLevel: 'warning',
        autoVacuum: false
      },
      lastBackup: '2025-01-15T03:00:00Z',
      lastOptimized: '2025-01-12T09:15:00Z',
      optimization: {
        score: 72,
        recommendations: 12,
        appliedRecommendations: 4
      }
    },
    {
      id: '3',
      name: 'Cache Redis',
      type: 'redis',
      version: '7.0.5',
      environment: 'production',
      status: 'online',
      host: 'redis-01.rsv.com',
      port: 6379,
      size: 1073741824,
      connections: {
        current: 145,
        max: 1000,
        utilization: 14.5
      },
      performance: {
        queryTime: 0.8,
        throughput: 15672,
        cacheHitRate: 96.7,
        lockWaitTime: 0,
        deadlocks: 0
      },
      resources: {
        cpuUsage: 12,
        memoryUsage: 78,
        diskUsage: 0,
        ioOperations: 0,
        networkThroughput: 5.2
      },
      configuration: {
        bufferPoolSize: '1GB',
        maxConnections: 1000,
        queryTimeout: 5000,
        logLevel: 'notice',
        autoVacuum: false
      },
      lastBackup: '2025-01-15T01:00:00Z',
      lastOptimized: '2025-01-14T16:00:00Z',
      optimization: {
        score: 95,
        recommendations: 2,
        appliedRecommendations: 2
      }
    }
  ])

  const [slowQueries] = useState<QueryPerformance[]>([
    {
      id: '1',
      query: 'SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.created_at > ? ORDER BY u.created_at DESC LIMIT 50',
      queryHash: 'a1b2c3d4e5f6',
      database: 'production_db',
      table: 'users',
      type: 'select',
      executionCount: 2847,
      avgExecutionTime: 1250,
      maxExecutionTime: 5600,
      minExecutionTime: 245,
      totalExecutionTime: 3558750,
      lastExecuted: '2025-01-15T14:42:00Z',
      slowQuery: true,
      indexRecommendations: [
        'CREATE INDEX idx_users_created_at ON users(created_at)',
        'CREATE INDEX idx_profiles_user_id ON profiles(user_id)'
      ],
      optimizationSuggestions: [
        'Add index on created_at column',
        'Consider adding covering index',
        'Review JOIN strategy'
      ],
      queryPlan: {
        cost: 1247.89,
        rows: 2847,
        loops: 1,
        bufferHits: 12450,
        bufferReads: 567
      },
      impactLevel: 'high'
    },
    {
      id: '2',
      query: 'UPDATE orders SET status = ? WHERE customer_id = ? AND created_at BETWEEN ? AND ?',
      queryHash: 'b2c3d4e5f6a1',
      database: 'production_db',
      table: 'orders',
      type: 'update',
      executionCount: 856,
      avgExecutionTime: 890,
      maxExecutionTime: 3400,
      minExecutionTime: 123,
      totalExecutionTime: 761840,
      lastExecuted: '2025-01-15T14:38:00Z',
      slowQuery: true,
      indexRecommendations: [
        'CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at)'
      ],
      optimizationSuggestions: [
        'Add composite index',
        'Consider partitioning by date',
        'Batch updates when possible'
      ],
      queryPlan: {
        cost: 567.34,
        rows: 156,
        loops: 1,
        bufferHits: 3421,
        bufferReads: 234
      },
      impactLevel: 'medium'
    }
  ])

  const [indices] = useState<DatabaseIndex[]>([
    {
      id: '1',
      name: 'idx_users_email',
      table: 'users',
      database: 'production_db',
      type: 'unique',
      columns: ['email'],
      size: 45678901,
      usage: {
        scans: 15672,
        tuplesRead: 234567,
        tuplesReturned: 15672,
        efficiency: 94.8
      },
      isActive: true,
      createdAt: '2024-06-15T00:00:00Z',
      lastUsed: '2025-01-15T14:45:00Z',
      maintenanceNeeded: false,
      recommendations: [],
      status: 'healthy'
    },
    {
      id: '2',
      name: 'idx_orders_status',
      table: 'orders',
      database: 'production_db',
      type: 'btree',
      columns: ['status'],
      size: 23456789,
      usage: {
        scans: 234,
        tuplesRead: 45678,
        tuplesReturned: 234,
        efficiency: 12.3
      },
      isActive: true,
      createdAt: '2024-03-20T00:00:00Z',
      lastUsed: '2025-01-12T08:30:00Z',
      maintenanceNeeded: true,
      recommendations: [
        'Consider dropping - low usage',
        'Rewrite queries to use composite index instead'
      ],
      status: 'unused'
    },
    {
      id: '3',
      name: 'idx_products_category_price',
      table: 'products',
      database: 'production_db',
      type: 'btree',
      columns: ['category_id', 'price'],
      size: 12345678,
      usage: {
        scans: 8567,
        tuplesRead: 156789,
        tuplesReturned: 8567,
        efficiency: 87.6
      },
      isActive: true,
      createdAt: '2024-08-10T00:00:00Z',
      lastUsed: '2025-01-15T14:20:00Z',
      maintenanceNeeded: false,
      recommendations: [],
      status: 'healthy'
    }
  ])

  const [optimizationRules] = useState<OptimizationRule[]>([
    {
      id: '1',
      name: 'Auto Vacuum Trigger',
      description: 'Dispara VACUUM automático quando tabelas têm muitos dead tuples',
      category: 'maintenance',
      priority: 'high',
      isActive: true,
      isAutomatic: true,
      conditions: [
        { metric: 'dead_tuples_ratio', operator: 'greater_than', value: 20, timeframe: '1h' },
        { metric: 'table_size', operator: 'greater_than', value: 1000000 }
      ],
      actions: [
        {
          type: 'vacuum',
          parameters: { analyze: true, verbose: false },
          rollbackPossible: false
        }
      ],
      schedule: {
        enabled: true,
        cron: '0 2 * * *',
        timezone: 'America/Sao_Paulo',
        maintenanceWindow: true
      },
      metrics: {
        triggered: 23,
        successful: 22,
        failed: 1,
        lastTriggered: '2025-01-15T02:00:00Z',
        averageImpact: 15.7
      },
      impact: {
        performanceGain: 12.5,
        storageReduction: 8.3,
        maintenanceReduction: 25.0
      }
    },
    {
      id: '2',
      name: 'Slow Query Alert',
      description: 'Alerta quando queries excedem threshold de tempo',
      category: 'performance',
      priority: 'medium',
      isActive: true,
      isAutomatic: false,
      conditions: [
        { metric: 'avg_execution_time', operator: 'greater_than', value: 1000 },
        { metric: 'execution_count', operator: 'greater_than', value: 100, timeframe: '1h' }
      ],
      actions: [
        {
          type: 'alert',
          parameters: { severity: 'warning', channels: ['email', 'slack'] },
          rollbackPossible: false
        }
      ],
      metrics: {
        triggered: 156,
        successful: 156,
        failed: 0,
        lastTriggered: '2025-01-15T14:30:00Z',
        averageImpact: 0
      },
      impact: {
        performanceGain: 0,
        storageReduction: 0,
        maintenanceReduction: 0
      }
    }
  ])

  const [maintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      name: 'Full Database Vacuum',
      description: 'Vacuum completo da base de dados production',
      type: 'vacuum',
      database: 'production_db',
      priority: 'high',
      status: 'pending',
      progress: 0,
      scheduledAt: '2025-01-16T02:00:00Z',
      estimatedDuration: 3600,
      impact: {
        lockLevel: 'shared',
        downtime: false,
        performanceImpact: 'medium'
      },
      dependencies: [],
      autoScheduled: true
    },
    {
      id: '2',
      name: 'Reindex Users Table',
      description: 'Reconstruir índices da tabela users',
      type: 'reindex',
      database: 'production_db',
      table: 'users',
      priority: 'medium',
      status: 'completed',
      progress: 100,
      scheduledAt: '2025-01-14T01:00:00Z',
      startedAt: '2025-01-14T01:00:00Z',
      completedAt: '2025-01-14T01:45:00Z',
      duration: 2700,
      estimatedDuration: 3000,
      impact: {
        lockLevel: 'exclusive',
        downtime: true,
        performanceImpact: 'high'
      },
      results: {
        rowsProcessed: 2847562,
        spaceSaved: 234567890,
        performanceImprovement: 23.5,
        errors: []
      },
      dependencies: [],
      autoScheduled: false
    }
  ])

  // Dados para gráficos
  const performanceMetrics = [
    { time: '10:00', queryTime: 145, throughput: 1156, cacheHit: 93.2, connections: 78 },
    { time: '11:00', queryTime: 162, throughput: 1234, cacheHit: 94.1, connections: 82 },
    { time: '12:00', queryTime: 189, throughput: 1456, cacheHit: 95.3, connections: 91 },
    { time: '13:00', queryTime: 172, throughput: 1389, cacheHit: 94.8, connections: 87 },
    { time: '14:00', queryTime: 156, throughput: 1247, cacheHit: 94.8, connections: 85 }
  ]

  const resourceUtilization = [
    { resource: 'CPU', production: 68, analytics: 34, cache: 12 },
    { resource: 'Memory', production: 72, analytics: 56, cache: 78 },
    { resource: 'Disk', production: 45, analytics: 78, cache: 0 },
    { resource: 'I/O', production: 85, analytics: 34, cache: 0 }
  ]

  const queryDistribution = [
    { type: 'SELECT', count: 15672, percentage: 78.2 },
    { type: 'INSERT', count: 2847, percentage: 14.2 },
    { type: 'UPDATE', count: 1234, percentage: 6.2 },
    { type: 'DELETE', count: 278, percentage: 1.4 }
  ]

  const slowQueriesTrend = [
    { hour: '10:00', count: 23, avgTime: 1156 },
    { hour: '11:00', count: 34, avgTime: 1289 },
    { hour: '12:00', count: 45, avgTime: 1567 },
    { hour: '13:00', count: 38, avgTime: 1423 },
    { hour: '14:00', count: 29, avgTime: 1250 }
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

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': case 'healthy': case 'completed': return 'bg-green-100 text-green-800'
      case 'maintenance': case 'pending': case 'running': return 'bg-yellow-100 text-yellow-800'
      case 'offline': case 'error': case 'failed': case 'fragmented': return 'bg-red-100 text-red-800'
      case 'unused': case 'redundant': case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'missing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'postgresql': return 'bg-blue-100 text-blue-800'
      case 'mysql': return 'bg-orange-100 text-orange-800'
      case 'mongodb': return 'bg-green-100 text-green-800'
      case 'redis': return 'bg-red-100 text-red-800'
      case 'elasticsearch': return 'bg-yellow-100 text-yellow-800'
      case 'oracle': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDbTypeIcon = (type: string) => {
    return Database // Todos usam o ícone de database por simplicidade
  }

  const calculateAverageOptimizationScore = () => {
    const total = databases.reduce((sum, db) => sum + db.optimization.score, 0)
    return databases.length > 0 ? total / databases.length : 0
  }

  const getTotalSlowQueries = () => {
    return slowQueries.filter(q => q.slowQuery).length
  }

  const getActiveMaintenanceTasks = () => {
    return maintenanceTasks.filter(t => t.status === 'running' || t.status === 'pending').length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Otimizador de Banco de Dados</h1>
          <p className="text-gray-600">Otimização inteligente e monitoramento de performance de bancos de dados</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsOptimizationModalOpen(!isOptimizationModalOpen)}>
            <Zap className="w-4 h-4 mr-2" />
            Otimizar Agora
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
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="indexes">Índices</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs de Database Optimization */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score de Otimização</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {calculateAverageOptimizationScore().toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600">
                  Média dos bancos
                </p>
                <Progress value={calculateAverageOptimizationScore()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queries Lentas</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getTotalSlowQueries()}
                </div>
                <p className="text-xs text-gray-600">
                  Requerem otimização
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bancos Online</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {databases.filter(db => db.status === 'online').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {databases.length} totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Ativas</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {getActiveMaintenanceTasks()}
                </div>
                <p className="text-xs text-gray-600">
                  Manutenção em andamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Performance dos bancos de dados nas últimas horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="throughput" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Throughput" />
                  <Line yAxisId="left" type="monotone" dataKey="queryTime" stroke="#ef4444" strokeWidth={2} name="Query Time (ms)" />
                  <Line yAxisId="right" type="monotone" dataKey="cacheHit" stroke="#3b82f6" strokeWidth={2} name="Cache Hit %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Utilização de Recursos */}
            <Card>
              <CardHeader>
                <CardTitle>Utilização de Recursos</CardTitle>
                <CardDescription>Uso de recursos por banco de dados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={resourceUtilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="resource" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="production" fill="#3b82f6" name="Production DB" />
                    <Bar dataKey="analytics" fill="#10b981" name="Analytics DB" />
                    <Bar dataKey="cache" fill="#ef4444" name="Cache Redis" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Queries</CardTitle>
                <CardDescription>Tipos de queries executadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={queryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                    >
                      {queryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#3b82f6' :
                          index === 1 ? '#10b981' :
                          index === 2 ? '#f59e0b' : '#ef4444'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status dos Bancos */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Bancos de Dados</CardTitle>
              <CardDescription>Visão geral da saúde e performance dos bancos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databases.map((db) => {
                  const DbIcon = getDbTypeIcon(db.type)
                  
                  return (
                    <div key={db.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          db.type === 'postgresql' ? 'bg-blue-100' :
                          db.type === 'mysql' ? 'bg-orange-100' :
                          db.type === 'redis' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <DbIcon className={`h-6 w-6 ${
                            db.type === 'postgresql' ? 'text-blue-600' :
                            db.type === 'mysql' ? 'text-orange-600' :
                            db.type === 'redis' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{db.name}</h4>
                          <p className="text-sm text-gray-600">{db.host}:{db.port} • {db.version}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Queries: {db.performance.queryTime}ms avg
                            </span>
                            <span className="text-xs text-gray-500">
                              Cache: {db.performance.cacheHitRate}%
                            </span>
                            <span className="text-xs text-gray-500">
                              Conexões: {db.connections.current}/{db.connections.max}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {db.optimization.score}%
                          </div>
                          <p className="text-xs text-gray-600">Score</p>
                        </div>
                        <Badge className={getStatusColor(db.status)}>
                          {db.status}
                        </Badge>
                        <Badge className={getTypeColor(db.type)}>
                          {db.type}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="databases" className="space-y-6">
          {/* Gerenciamento de Databases */}
          <Card>
            <CardHeader>
              <CardTitle>Bancos de Dados</CardTitle>
              <CardDescription>Monitoramento e otimização de instâncias de banco</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'postgresql', label: 'PostgreSQL' },
                      { value: 'mysql', label: 'MySQL' },
                      { value: 'mongodb', label: 'MongoDB' },
                      { value: 'redis', label: 'Redis' },
                      { value: 'elasticsearch', label: 'Elasticsearch' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por ambiente"
                    options={[
                      { value: 'all', label: 'Todos os Ambientes' },
                      { value: 'production', label: 'Produção' },
                      { value: 'staging', label: 'Staging' },
                      { value: 'development', label: 'Desenvolvimento' },
                      { value: 'testing', label: 'Teste' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Banco
                  </Button>
                </div>

                <div className="grid gap-6">
                  {databases.map((db) => {
                    const DbIcon = getDbTypeIcon(db.type)
                    
                    return (
                      <Card key={db.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                db.type === 'postgresql' ? 'bg-blue-100' :
                                db.type === 'mysql' ? 'bg-orange-100' :
                                db.type === 'redis' ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                <DbIcon className={`h-6 w-6 ${
                                  db.type === 'postgresql' ? 'text-blue-600' :
                                  db.type === 'mysql' ? 'text-orange-600' :
                                  db.type === 'redis' ? 'text-red-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{db.name}</h3>
                                <p className="text-gray-600">{db.host}:{db.port}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={getTypeColor(db.type)}>
                                    {db.type} {db.version}
                                  </Badge>
                                  <Badge className={getStatusColor(db.status)}>
                                    {db.status}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {db.environment}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 mb-2">
                                {db.optimization.score}%
                              </div>
                              <p className="text-xs text-gray-600">Score de Otimização</p>
                              <Progress value={db.optimization.score} className="w-24 h-2 mt-1" />
                            </div>
                          </div>

                          {/* Métricas de Performance */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {db.performance.queryTime}ms
                              </div>
                              <div className="text-xs text-gray-600">Query Time</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {formatNumber(db.performance.throughput)}
                              </div>
                              <div className="text-xs text-gray-600">Throughput</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {db.performance.cacheHitRate}%
                              </div>
                              <div className="text-xs text-gray-600">Cache Hit</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {db.connections.current}/{db.connections.max}
                              </div>
                              <div className="text-xs text-gray-600">Conexões</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-red-600">
                                {formatBytes(db.size)}
                              </div>
                              <div className="text-xs text-gray-600">Tamanho</div>
                            </div>
                          </div>

                          {/* Uso de Recursos */}
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3">Uso de Recursos:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">CPU:</span>
                                  <span className="text-sm font-medium">{db.resources.cpuUsage}%</span>
                                </div>
                                <Progress value={db.resources.cpuUsage} className="h-2" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Memory:</span>
                                  <span className="text-sm font-medium">{db.resources.memoryUsage}%</span>
                                </div>
                                <Progress value={db.resources.memoryUsage} className="h-2" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Disk:</span>
                                  <span className="text-sm font-medium">{db.resources.diskUsage}%</span>
                                </div>
                                <Progress value={db.resources.diskUsage} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Otimização */}
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3">Otimização:</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Recomendações:</span>
                                  <span className="ml-2 font-medium">{db.optimization.recommendations}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Aplicadas:</span>
                                  <span className="ml-2 font-medium">{db.optimization.appliedRecommendations}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Última Otimização:</span>
                                  <span className="ml-2 font-medium">{formatDateTime(db.lastOptimized)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                Último backup: {formatDateTime(db.lastBackup)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Zap className="h-3 w-3 mr-1" />
                                Otimizar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Métricas
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

        <TabsContent value="queries" className="space-y-6">
          {/* Análise de Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Queries</CardTitle>
              <CardDescription>Monitoramento e otimização de queries lentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar queries..." title="Buscar queries" />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'select', label: 'SELECT' },
                      { value: 'insert', label: 'INSERT' },
                      { value: 'update', label: 'UPDATE' },
                      { value: 'delete', label: 'DELETE' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por impacto"
                    options={[
                      { value: 'all', label: 'Todos os Impactos' },
                      { value: 'critical', label: 'Crítico' },
                      { value: 'high', label: 'Alto' },
                      { value: 'medium', label: 'Médio' },
                      { value: 'low', label: 'Baixo' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="space-y-3">
                  {slowQueries.map((query) => (
                    <Card key={query.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getTypeColor(query.type)}>
                                {query.type.toUpperCase()}
                              </Badge>
                              <Badge className={getImpactColor(query.impactLevel)}>
                                {query.impactLevel}
                              </Badge>
                              {query.slowQuery && (
                                <Badge className="bg-red-100 text-red-800">
                                  Slow Query
                                </Badge>
                              )}
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <code className="text-sm text-gray-800 break-all">
                                {query.query}
                              </code>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>Database:</strong> {query.database}</p>
                              <p><strong>Table:</strong> {query.table}</p>
                              <p><strong>Hash:</strong> {query.queryHash}</p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-red-600">
                              {query.avgExecutionTime}ms
                            </div>
                            <p className="text-xs text-gray-600">Tempo Médio</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-600">Execuções:</span>
                            <span className="ml-2 font-medium">{formatNumber(query.executionCount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tempo Total:</span>
                            <span className="ml-2 font-medium">{formatDuration(Math.floor(query.totalExecutionTime / 1000))}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tempo Máx:</span>
                            <span className="ml-2 font-medium">{query.maxExecutionTime}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tempo Mín:</span>
                            <span className="ml-2 font-medium">{query.minExecutionTime}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Última Exec:</span>
                            <span className="ml-2 font-medium">{formatDateTime(query.lastExecuted)}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h5 className="font-semibold mb-2">Query Plan:</h5>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Cost:</span>
                                <span className="ml-2 font-medium">{query.queryPlan.cost.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Rows:</span>
                                <span className="ml-2 font-medium">{formatNumber(query.queryPlan.rows)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Buffer Hits:</span>
                                <span className="ml-2 font-medium">{formatNumber(query.queryPlan.bufferHits)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {query.indexRecommendations.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-semibold mb-2">Recomendações de Índices:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {query.indexRecommendations.map((rec, index) => (
                                <li key={index} className="text-gray-700">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {query.optimizationSuggestions.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-semibold mb-2">Sugestões de Otimização:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {query.optimizationSuggestions.map((suggestion, index) => (
                                <li key={index} className="text-gray-700">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">
                            ID: {query.id}
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Query Plan
                            </Button>
                            <Button size="sm">
                              <Zap className="h-3 w-3 mr-1" />
                              Otimizar
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
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

          {/* Tendência de Queries Lentas */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Queries Lentas</CardTitle>
              <CardDescription>Evolução das queries lentas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={slowQueriesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" fill="#ef4444" name="Quantidade" />
                  <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#3b82f6" strokeWidth={2} name="Tempo Médio (ms)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes" className="space-y-6">
          {/* Gerenciamento de Índices */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Índices</CardTitle>
              <CardDescription>Monitoramento e otimização de índices de banco de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar índices..." title="Buscar índices" />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'healthy', label: 'Saudável' },
                      { value: 'unused', label: 'Não Utilizado' },
                      { value: 'redundant', label: 'Redundante' },
                      { value: 'fragmented', label: 'Fragmentado' },
                      { value: 'missing', label: 'Ausente' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'btree', label: 'B-Tree' },
                      { value: 'hash', label: 'Hash' },
                      { value: 'unique', label: 'Unique' },
                      { value: 'partial', label: 'Partial' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Índice
                  </Button>
                </div>

                <div className="space-y-3">
                  {indices.map((index) => (
                    <Card key={index.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{index.name}</h4>
                            <p className="text-sm text-gray-600">
                              {index.database}.{index.table} • Colunas: {index.columns.join(', ')}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getTypeColor(index.type)}>
                                {index.type}
                              </Badge>
                              <Badge className={getStatusColor(index.status)}>
                                {index.status}
                              </Badge>
                              {index.maintenanceNeeded && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Manutenção Necessária
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {formatBytes(index.size)}
                            </div>
                            <p className="text-xs text-gray-600">Tamanho</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-600">Scans:</span>
                            <span className="ml-2 font-medium">{formatNumber(index.usage.scans)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Eficiência:</span>
                            <span className="ml-2 font-medium">{index.usage.efficiency.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Último Uso:</span>
                            <span className="ml-2 font-medium">{formatDateTime(index.lastUsed)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Criado:</span>
                            <span className="ml-2 font-medium">{formatDateTime(index.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Eficiência do Índice:</span>
                            <span className="text-sm font-medium">{index.usage.efficiency.toFixed(1)}%</span>
                          </div>
                          <Progress value={index.usage.efficiency} className="h-2" />
                        </div>

                        {index.recommendations.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-semibold mb-2">Recomendações:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {index.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="text-gray-700">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">
                            {index.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Análise
                            </Button>
                            {index.maintenanceNeeded && (
                              <Button size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Reindex
                              </Button>
                            )}
                            <Button variant="secondary" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            {index.status === 'unused' && (
                              <Button variant="secondary" size="sm">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remover
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

        <TabsContent value="rules" className="space-y-6">
          {/* Regras de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Otimização</CardTitle>
              <CardDescription>Automação de tarefas de otimização e manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por categoria"
                    options={[
                      { value: 'all', label: 'Todas as Categorias' },
                      { value: 'performance', label: 'Performance' },
                      { value: 'storage', label: 'Armazenamento' },
                      { value: 'maintenance', label: 'Manutenção' },
                      { value: 'security', label: 'Segurança' },
                      { value: 'configuration', label: 'Configuração' }
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
                              <Badge className={getPriorityColor(rule.priority)}>
                                {rule.priority}
                              </Badge>
                              <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {rule.isActive ? 'Ativa' : 'Inativa'}
                              </Badge>
                              <Badge className={rule.isAutomatic ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                                {rule.isAutomatic ? 'Automática' : 'Manual'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {rule.category}
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
                                    {condition.timeframe && ` (${condition.timeframe})`}
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
                                  {action.rollbackPossible && ' (reversível)'}
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
                              <span className="text-gray-600">Performance:</span>
                              <span className="ml-2 font-medium text-green-600">+{rule.impact.performanceGain}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Armazenamento:</span>
                              <span className="ml-2 font-medium text-blue-600">-{rule.impact.storageReduction}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Manutenção:</span>
                              <span className="ml-2 font-medium text-purple-600">-{rule.impact.maintenanceReduction}%</span>
                            </div>
                          </div>
                        </div>

                        {rule.schedule && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Agendamento:</h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                              <p><strong>Cron:</strong> {rule.schedule.cron}</p>
                              <p><strong>Timezone:</strong> {rule.schedule.timezone}</p>
                              <p><strong>Janela de Manutenção:</strong> {rule.schedule.maintenanceWindow ? 'Sim' : 'Não'}</p>
                            </div>
                          </div>
                        )}

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

        <TabsContent value="maintenance" className="space-y-6">
          {/* Tarefas de Manutenção */}
          <Card>
            <CardHeader>
              <CardTitle>Tarefas de Manutenção</CardTitle>
              <CardDescription>Agendamento e execução de tarefas de manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'vacuum', label: 'Vacuum' },
                      { value: 'reindex', label: 'Reindex' },
                      { value: 'analyze', label: 'Analyze' },
                      { value: 'backup', label: 'Backup' },
                      { value: 'cleanup', label: 'Cleanup' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'pending', label: 'Pendente' },
                      { value: 'running', label: 'Executando' },
                      { value: 'completed', label: 'Concluída' },
                      { value: 'failed', label: 'Falhou' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Tarefa
                  </Button>
                </div>

                <div className="grid gap-4">
                  {maintenanceTasks.map((task) => (
                    <Card key={task.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{task.name}</h3>
                            <p className="text-gray-600">{task.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Database: {task.database}
                              {task.table && ` • Table: ${task.table}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {task.type}
                            </div>
                          </div>
                        </div>

                        {task.status === 'running' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Progresso:</span>
                              <span className="text-sm font-medium">{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Agendado:</span>
                            <span className="ml-2 font-medium">{formatDateTime(task.scheduledAt)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duração Estimada:</span>
                            <span className="ml-2 font-medium">{formatDuration(task.estimatedDuration)}</span>
                          </div>
                          {task.duration && (
                            <div>
                              <span className="text-gray-600">Duração Real:</span>
                              <span className="ml-2 font-medium">{formatDuration(task.duration)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Automático:</span>
                            <span className="ml-2 font-medium">{task.autoScheduled ? 'Sim' : 'Não'}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Impacto:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <span className="text-gray-600">Lock Level:</span>
                                <Badge className={
                                  task.impact.lockLevel === 'none' ? 'bg-green-100 text-green-800' :
                                  task.impact.lockLevel === 'shared' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {task.impact.lockLevel}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-gray-600">Downtime:</span>
                                <span className="ml-2 font-medium">{task.impact.downtime ? 'Sim' : 'Não'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Impacto Performance:</span>
                                <Badge className={getImpactColor(task.impact.performanceImpact)}>
                                  {task.impact.performanceImpact}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {task.results && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Resultados:</h4>
                            <div className="bg-green-50 p-3 rounded-lg text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-gray-600">Linhas Processadas:</span>
                                  <span className="ml-2 font-medium">{formatNumber(task.results.rowsProcessed)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Espaço Economizado:</span>
                                  <span className="ml-2 font-medium">{formatBytes(task.results.spaceSaved)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Melhoria Performance:</span>
                                  <span className="ml-2 font-medium text-green-600">+{task.results.performanceImprovement}%</span>
                                </div>
                              </div>
                              {task.results.errors.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-gray-600">Erros:</span>
                                  <ul className="list-disc list-inside mt-1">
                                    {task.results.errors.map((error, index) => (
                                      <li key={index} className="text-red-600">{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <Badge variant="secondary">{task.type}</Badge>
                          <div className="flex space-x-2">
                            {task.status === 'pending' && (
                              <Button size="sm">
                                <Play className="h-3 w-3 mr-1" />
                                Executar Agora
                              </Button>
                            )}
                            {task.status === 'running' && (
                              <Button size="sm" variant="secondary">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            )}
                            <Button variant="secondary" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                            {(task.status === 'pending' || task.status === 'failed') && (
                              <Button variant="secondary" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
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
      </Tabs>
    </div>
  )
}

export default DatabaseOptimizer
