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
  RefreshCw,
  Database,
  Server,
  Cloud,
  Globe,
  Zap,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Stop,
  Settings,
  Calendar,
  Archive,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Folder,
  HardDrive,
  Monitor,
  Lock,
  Key,
  Eye,
  EyeOff,
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
  Info,
  Warning,
  Timer,
  MapPin,
  Building,
  Phone,
  Mail,
  User,
  Code,
  Layers,
  Router,
  Star,
  Heart,
  Bookmark,
  Target,
  Gauge,
  Users,
  Download,
  Upload,
  Save,
  Shield,
  Network,
  ArrowRight,
  ArrowLeft
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

// Tipos para Data Replication
interface ReplicationChannel {
  id: string
  name: string
  description: string
  type: 'synchronous' | 'asynchronous' | 'semi_synchronous'
  status: 'active' | 'paused' | 'error' | 'syncing' | 'disconnected'
  source: {
    type: 'database' | 'filesystem' | 'application' | 'stream'
    host: string
    port?: number
    database?: string
    path?: string
    size: number
  }
  target: {
    type: 'database' | 'filesystem' | 'application' | 'stream'
    host: string
    port?: number
    database?: string
    path?: string
    region?: string
  }
  configuration: {
    batchSize: number
    compressionEnabled: boolean
    encryptionEnabled: boolean
    conflictResolution: 'source_wins' | 'target_wins' | 'timestamp' | 'manual'
    retryAttempts: number
    retryDelay: number
    maxLag: number // seconds
  }
  metrics: {
    lag: number // seconds
    throughput: number // records/sec
    errorRate: number // errors/minute
    bytesTransferred: number
    recordsTransferred: number
    lastSyncTime: string
    averageLatency: number // ms
    uptime: number // percentage
  }
  monitoring: {
    alertsEnabled: boolean
    thresholds: {
      maxLag: number
      maxErrorRate: number
      minThroughput: number
    }
    notifications: {
      email: boolean
      slack: boolean
      webhook: boolean
    }
  }
  schedule: {
    enabled: boolean
    frequency: 'continuous' | 'hourly' | 'daily' | 'weekly'
    time?: string
    nextRun?: string
  }
  createdAt: string
  updatedAt: string
}

interface ReplicationConflict {
  id: string
  channelId: string
  channelName: string
  timestamp: string
  table: string
  record: string
  conflictType: 'insert' | 'update' | 'delete' | 'schema'
  sourceValue: any
  targetValue: any
  resolution: 'pending' | 'resolved' | 'ignored'
  resolvedBy?: string
  resolvedAt?: string
  resolutionMethod: 'source_wins' | 'target_wins' | 'merge' | 'manual'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ReplicationMetrics {
  channelId: string
  timestamp: string
  lag: number
  throughput: number
  errorCount: number
  bytesPerSecond: number
  recordsPerSecond: number
  cpuUsage: number
  memoryUsage: number
  networkUsage: number
}

interface ReplicationTopology {
  id: string
  name: string
  description: string
  type: 'master_slave' | 'master_master' | 'multi_master' | 'hub_spoke' | 'mesh'
  nodes: {
    id: string
    name: string
    type: 'master' | 'slave' | 'peer'
    host: string
    region: string
    status: 'online' | 'offline' | 'degraded' | 'maintenance'
    connections: string[]
    load: number
    lag: number
  }[]
  channels: string[]
  status: 'healthy' | 'degraded' | 'critical' | 'offline'
  created: string
  updated: string
}

const DataReplication: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChannel, setSelectedChannel] = useState<ReplicationChannel | null>(null)
  const [selectedTopology, setSelectedTopology] = useState<ReplicationTopology | null>(null)

  // Dados mock para demonstração
  const [replicationChannels] = useState<ReplicationChannel[]>([
    {
      id: '1',
      name: 'Primary to Backup DB',
      description: 'Replicação em tempo real do banco principal para backup',
      type: 'asynchronous',
      status: 'active',
      source: {
        type: 'database',
        host: 'db-primary.rsv.com',
        port: 5432,
        database: 'onboarding_rsv',
        size: 2.5 * 1024 * 1024 * 1024 // 2.5GB
      },
      target: {
        type: 'database',
        host: 'db-backup.rsv.com',
        port: 5432,
        database: 'onboarding_rsv_backup',
        region: 'us-east-2'
      },
      configuration: {
        batchSize: 1000,
        compressionEnabled: true,
        encryptionEnabled: true,
        conflictResolution: 'source_wins',
        retryAttempts: 3,
        retryDelay: 5,
        maxLag: 60
      },
      metrics: {
        lag: 15, // 15 seconds
        throughput: 1250, // records/sec
        errorRate: 0.02, // errors/minute
        bytesTransferred: 850 * 1024 * 1024 * 1024, // 850GB
        recordsTransferred: 45000000,
        lastSyncTime: '2025-01-15T14:30:15Z',
        averageLatency: 45, // ms
        uptime: 99.8
      },
      monitoring: {
        alertsEnabled: true,
        thresholds: {
          maxLag: 60,
          maxErrorRate: 1,
          minThroughput: 500
        },
        notifications: {
          email: true,
          slack: true,
          webhook: false
        }
      },
      schedule: {
        enabled: true,
        frequency: 'continuous'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-15T14:30:15Z'
    },
    {
      id: '2',
      name: 'Analytics Data Stream',
      description: 'Stream de dados para o data warehouse de analytics',
      type: 'asynchronous',
      status: 'active',
      source: {
        type: 'application',
        host: 'app-primary.rsv.com',
        path: '/api/events',
        size: 150 * 1024 * 1024 // 150MB
      },
      target: {
        type: 'database',
        host: 'analytics-db.rsv.com',
        port: 5432,
        database: 'analytics_warehouse',
        region: 'us-west-1'
      },
      configuration: {
        batchSize: 500,
        compressionEnabled: true,
        encryptionEnabled: true,
        conflictResolution: 'timestamp',
        retryAttempts: 5,
        retryDelay: 10,
        maxLag: 300
      },
      metrics: {
        lag: 45,
        throughput: 850,
        errorRate: 0.08,
        bytesTransferred: 125 * 1024 * 1024 * 1024, // 125GB
        recordsTransferred: 15000000,
        lastSyncTime: '2025-01-15T14:28:30Z',
        averageLatency: 120,
        uptime: 99.5
      },
      monitoring: {
        alertsEnabled: true,
        thresholds: {
          maxLag: 300,
          maxErrorRate: 2,
          minThroughput: 200
        },
        notifications: {
          email: true,
          slack: false,
          webhook: true
        }
      },
      schedule: {
        enabled: true,
        frequency: 'continuous'
      },
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2025-01-15T14:28:30Z'
    },
    {
      id: '3',
      name: 'Cross-Region Sync',
      description: 'Sincronização entre regiões para disaster recovery',
      type: 'semi_synchronous',
      status: 'syncing',
      source: {
        type: 'database',
        host: 'db-us-east.rsv.com',
        port: 5432,
        database: 'onboarding_rsv',
        size: 2.5 * 1024 * 1024 * 1024
      },
      target: {
        type: 'database',
        host: 'db-eu-west.rsv.com',
        port: 5432,
        database: 'onboarding_rsv_eu',
        region: 'eu-west-1'
      },
      configuration: {
        batchSize: 800,
        compressionEnabled: true,
        encryptionEnabled: true,
        conflictResolution: 'manual',
        retryAttempts: 3,
        retryDelay: 15,
        maxLag: 120
      },
      metrics: {
        lag: 95,
        throughput: 650,
        errorRate: 0.15,
        bytesTransferred: 420 * 1024 * 1024 * 1024, // 420GB
        recordsTransferred: 22000000,
        lastSyncTime: '2025-01-15T14:25:45Z',
        averageLatency: 185,
        uptime: 98.2
      },
      monitoring: {
        alertsEnabled: true,
        thresholds: {
          maxLag: 120,
          maxErrorRate: 0.5,
          minThroughput: 300
        },
        notifications: {
          email: true,
          slack: true,
          webhook: true
        }
      },
      schedule: {
        enabled: true,
        frequency: 'continuous'
      },
      createdAt: '2024-09-01T00:00:00Z',
      updatedAt: '2025-01-15T14:25:45Z'
    }
  ])

  const [replicationConflicts] = useState<ReplicationConflict[]>([
    {
      id: '1',
      channelId: '3',
      channelName: 'Cross-Region Sync',
      timestamp: '2025-01-15T13:45:20Z',
      table: 'users',
      record: 'user_id:1247',
      conflictType: 'update',
      sourceValue: { name: 'João Silva Santos', updated_at: '2025-01-15T13:45:15Z' },
      targetValue: { name: 'João Santos', updated_at: '2025-01-15T13:45:10Z' },
      resolution: 'pending',
      resolutionMethod: 'manual',
      severity: 'medium'
    },
    {
      id: '2',
      channelId: '2',
      channelName: 'Analytics Data Stream',
      timestamp: '2025-01-15T12:30:15Z',
      table: 'events',
      record: 'event_id:789456',
      conflictType: 'insert',
      sourceValue: { event_type: 'login', user_id: 1247, timestamp: '2025-01-15T12:30:10Z' },
      targetValue: null,
      resolution: 'resolved',
      resolvedBy: 'auto-resolver',
      resolvedAt: '2025-01-15T12:30:25Z',
      resolutionMethod: 'source_wins',
      severity: 'low'
    }
  ])

  const [replicationTopologies] = useState<ReplicationTopology[]>([
    {
      id: '1',
      name: 'Global Primary-Replica',
      description: 'Topologia principal com replicas em múltiplas regiões',
      type: 'master_slave',
      nodes: [
        {
          id: 'master-1',
          name: 'Primary US-East',
          type: 'master',
          host: 'db-us-east.rsv.com',
          region: 'us-east-1',
          status: 'online',
          connections: ['slave-1', 'slave-2'],
          load: 75,
          lag: 0
        },
        {
          id: 'slave-1',
          name: 'Replica US-West',
          type: 'slave',
          host: 'db-us-west.rsv.com',
          region: 'us-west-1',
          status: 'online',
          connections: ['master-1'],
          load: 45,
          lag: 15
        },
        {
          id: 'slave-2',
          name: 'Replica EU-West',
          type: 'slave',
          host: 'db-eu-west.rsv.com',
          region: 'eu-west-1',
          status: 'degraded',
          connections: ['master-1'],
          load: 68,
          lag: 95
        }
      ],
      channels: ['1', '3'],
      status: 'degraded',
      created: '2024-01-01T00:00:00Z',
      updated: '2025-01-15T14:25:45Z'
    }
  ])

  // Dados para gráficos
  const lagTrendsData = [
    { time: '14:00', primary: 12, analytics: 35, crossRegion: 85 },
    { time: '14:05', primary: 15, analytics: 42, crossRegion: 92 },
    { time: '14:10', primary: 18, analytics: 38, crossRegion: 88 },
    { time: '14:15', primary: 14, analytics: 45, crossRegion: 95 },
    { time: '14:20', primary: 16, analytics: 41, crossRegion: 90 },
    { time: '14:25', primary: 13, analytics: 43, crossRegion: 95 },
    { time: '14:30', primary: 15, analytics: 45, crossRegion: 95 }
  ]

  const throughputData = [
    { time: '14:00', records: 1180, bytes: 95 },
    { time: '14:05', records: 1220, bytes: 102 },
    { time: '14:10', records: 1150, bytes: 88 },
    { time: '14:15', records: 1300, bytes: 115 },
    { time: '14:20', records: 1250, bytes: 105 },
    { time: '14:25', records: 1180, bytes: 98 },
    { time: '14:30', records: 1250, bytes: 108 }
  ]

  const channelStatusData = [
    { name: 'Active', value: 2, color: '#10b981' },
    { name: 'Syncing', value: 1, color: '#3b82f6' },
    { name: 'Error', value: 0, color: '#ef4444' },
    { name: 'Paused', value: 0, color: '#f59e0b' }
  ]

  const errorDistributionData = [
    { category: 'Network', count: 12, color: '#ef4444' },
    { category: 'Timeout', count: 8, color: '#f59e0b' },
    { category: 'Data', count: 5, color: '#3b82f6' },
    { category: 'Auth', count: 3, color: '#8b5cf6' },
    { category: 'Other', count: 2, color: '#10b981' }
  ]

  // Funções auxiliares
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'online': case 'resolved': return 'bg-green-100 text-green-800'
      case 'syncing': case 'degraded': case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'error': case 'critical': case 'offline': return 'bg-red-100 text-red-800'
      case 'paused': case 'maintenance': return 'bg-gray-100 text-gray-800'
      case 'disconnected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'online': return <CheckCircle className="h-4 w-4" />
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'error': case 'offline': return <XCircle className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'synchronous': return 'bg-red-100 text-red-800'
      case 'asynchronous': return 'bg-blue-100 text-blue-800'
      case 'semi_synchronous': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthScore = () => {
    const activeChannels = replicationChannels.filter(c => c.status === 'active' || c.status === 'syncing').length
    const totalChannels = replicationChannels.length
    return Math.round((activeChannels / totalChannels) * 100)
  }

  const getTotalThroughput = () => {
    return replicationChannels.reduce((total, channel) => total + channel.metrics.throughput, 0)
  }

  const getAverageLag = () => {
    const totalLag = replicationChannels.reduce((total, channel) => total + channel.metrics.lag, 0)
    return Math.round(totalLag / replicationChannels.length)
  }

  const getTotalErrors = () => {
    return replicationChannels.reduce((total, channel) => total + channel.metrics.errorRate, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Replicação de Dados</h1>
          <p className="text-gray-600">Sistema avançado de replicação de dados em tempo real</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Canal
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
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="topology">Topologia</TabsTrigger>
          <TabsTrigger value="conflicts">Conflitos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                  {getHealthScore()}%
                </div>
                <p className="text-xs text-gray-600">
                  Canais funcionando
                </p>
                <Progress value={getHealthScore()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(getTotalThroughput())}
                </div>
                <p className="text-xs text-gray-600">
                  Registros/segundo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lag Médio</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getAverageLag()}s
                </div>
                <p className="text-xs text-gray-600">
                  Atraso de sincronização
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {getTotalErrors().toFixed(2)}
                </div>
                <p className="text-xs text-gray-600">
                  Erros/minuto
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tendências de Lag */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Lag de Replicação</CardTitle>
              <CardDescription>Monitoramento do atraso de sincronização por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lagTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="primary" stroke="#10b981" strokeWidth={2} name="Primary DB (s)" />
                  <Line type="monotone" dataKey="analytics" stroke="#3b82f6" strokeWidth={2} name="Analytics (s)" />
                  <Line type="monotone" dataKey="crossRegion" stroke="#f59e0b" strokeWidth={2} name="Cross-Region (s)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Throughput */}
            <Card>
              <CardHeader>
                <CardTitle>Throughput de Replicação</CardTitle>
                <CardDescription>Volume de dados transferidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="records" fill="#3b82f6" name="Registros/seg" />
                    <Line yAxisId="right" type="monotone" dataKey="bytes" stroke="#10b981" strokeWidth={2} name="MB/seg" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status dos Canais */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Canais</CardTitle>
                <CardDescription>Distribuição por status de replicação</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={channelStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {channelStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Canais de Replicação Ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Canais de Replicação</CardTitle>
              <CardDescription>Status em tempo real dos canais de replicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {replicationChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{channel.name}</h4>
                        <p className="text-sm text-gray-600">{channel.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Tipo: {channel.type}</span>
                          <span>•</span>
                          <span>Lag: {channel.metrics.lag}s</span>
                          <span>•</span>
                          <span>Throughput: {formatNumber(channel.metrics.throughput)}/s</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getTypeColor(channel.type)}>
                        {channel.type}
                      </Badge>
                      <Badge className={getStatusColor(channel.status)}>
                        {getStatusIcon(channel.status)}
                        <span className="ml-1">{channel.status}</span>
                      </Badge>
                      <div className="text-right text-sm">
                        <div className="font-medium">{channel.metrics.uptime}%</div>
                        <div className="text-gray-500">Uptime</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          {/* Canais Detalhados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Canais de Replicação</CardTitle>
                <CardDescription>Gerenciar e monitorar canais de replicação de dados</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Canal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {replicationChannels.map((channel) => (
                  <Card key={channel.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Database className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{channel.name}</h3>
                            <p className="text-gray-600">{channel.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Tipo: {channel.type}</span>
                              <span>•</span>
                              <span>Fonte: {channel.source.type}</span>
                              <span>•</span>
                              <span>Destino: {channel.target.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(channel.type)}>
                            {channel.type}
                          </Badge>
                          <Badge className={getStatusColor(channel.status)}>
                            {getStatusIcon(channel.status)}
                            <span className="ml-1">{channel.status}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* Conexão Source -> Target */}
                      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium">{channel.source.host}</div>
                          <div className="text-gray-600">{channel.source.database || channel.source.path}</div>
                          <div className="text-xs text-gray-500">Fonte • {formatBytes(channel.source.size)}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                          <div className="text-xs text-center">
                            <div className="font-medium">{channel.metrics.lag}s lag</div>
                            <div className="text-gray-500">{formatNumber(channel.metrics.throughput)}/s</div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-sm text-right">
                          <div className="font-medium">{channel.target.host}</div>
                          <div className="text-gray-600">{channel.target.database || channel.target.path}</div>
                          <div className="text-xs text-gray-500">Destino • {channel.target.region}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Throughput</span>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatNumber(channel.metrics.throughput)}/s
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Lag</span>
                          <div className="text-lg font-semibold text-orange-600">
                            {channel.metrics.lag}s
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Uptime</span>
                          <div className="text-lg font-semibold text-green-600">
                            {channel.metrics.uptime}%
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Erros</span>
                          <div className="text-lg font-semibold text-red-600">
                            {channel.metrics.errorRate}/min
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Dados Transferidos:</span>
                          <span className="font-medium">{formatBytes(channel.metrics.bytesTransferred)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Registros Transferidos:</span>
                          <span className="font-medium">{formatNumber(channel.metrics.recordsTransferred)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Última Sincronização:</span>
                          <span className="font-medium">{formatDateTime(channel.metrics.lastSyncTime)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Latência Média:</span>
                          <span className="font-medium">{channel.metrics.averageLatency}ms</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <span className="text-sm text-gray-500">
                          Criado em {formatDateTime(channel.createdAt)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Pause className="h-3 w-3 mr-1" />
                            Pausar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Monitor
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

        <TabsContent value="topology" className="space-y-6">
          {/* Topologia de Replicação */}
          <Card>
            <CardHeader>
              <CardTitle>Topologia de Replicação</CardTitle>
              <CardDescription>Visualização da arquitetura de replicação de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {replicationTopologies.map((topology) => (
                  <Card key={topology.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{topology.name}</h3>
                          <p className="text-gray-600">{topology.description}</p>
                          <Badge className="mt-2" variant="secondary">
                            {topology.type}
                          </Badge>
                        </div>
                        <Badge className={getStatusColor(topology.status)}>
                          {topology.status}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Nodes da Topologia</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {topology.nodes.map((node) => (
                            <Card key={node.id} className="border bg-gray-50">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium">{node.name}</h5>
                                    <p className="text-sm text-gray-600">{node.host}</p>
                                  </div>
                                  <Badge className={getStatusColor(node.status)} size="sm">
                                    {node.status}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Tipo:</span>
                                    <Badge variant="secondary" size="sm">{node.type}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Região:</span>
                                    <span>{node.region}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Load:</span>
                                    <span>{node.load}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Lag:</span>
                                    <span className={node.lag > 60 ? 'text-red-600' : 'text-green-600'}>
                                      {node.lag}s
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <Progress value={node.load} className="h-2" />
                                  <span className="text-xs text-gray-500">CPU Load</span>
                                </div>

                                <div className="mt-2">
                                  <span className="text-xs text-gray-600">Conexões:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {node.connections.map((conn, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {conn}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <span className="text-sm text-gray-500">
                          Última atualização: {formatDateTime(topology.updated)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizar
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

        <TabsContent value="conflicts" className="space-y-6">
          {/* Conflitos de Replicação */}
          <Card>
            <CardHeader>
              <CardTitle>Conflitos de Replicação</CardTitle>
              <CardDescription>Gerenciar conflitos de dados durante a replicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {replicationConflicts.map((conflict) => (
                  <Card key={conflict.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">Conflito em {conflict.table}</h4>
                          <p className="text-sm text-gray-600">Canal: {conflict.channelName}</p>
                          <p className="text-sm text-gray-600">Registro: {conflict.record}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(conflict.timestamp)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(conflict.severity)}>
                            {conflict.severity}
                          </Badge>
                          <Badge className={getStatusColor(conflict.resolution)}>
                            {conflict.resolution}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Valor Fonte</h5>
                          <pre className="text-xs text-blue-800 bg-blue-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(conflict.sourceValue, null, 2)}
                          </pre>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h5 className="font-medium text-orange-900 mb-2">Valor Destino</h5>
                          <pre className="text-xs text-orange-800 bg-orange-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(conflict.targetValue, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex space-x-4">
                          <span className="text-gray-600">Tipo: <strong>{conflict.conflictType}</strong></span>
                          <span className="text-gray-600">Método: <strong>{conflict.resolutionMethod}</strong></span>
                          {conflict.resolvedBy && (
                            <span className="text-gray-600">Resolvido por: <strong>{conflict.resolvedBy}</strong></span>
                          )}
                        </div>
                        {conflict.resolution === 'pending' && (
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Fonte
                            </Button>
                            <Button size="sm" variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Destino
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Edit className="h-3 w-3 mr-1" />
                              Manual
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {replicationConflicts.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum Conflito Ativo
                    </h3>
                    <p className="text-gray-600">
                      Todos os conflitos de replicação foram resolvidos com sucesso.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoramento Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Replicação</CardTitle>
              <CardDescription>Métricas detalhadas e alertas de replicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Monitoramento Avançado
                </h3>
                <p className="text-gray-600 mb-6">
                  Sistema de monitoramento em tempo real com alertas inteligentes e métricas detalhadas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Alertas Inteligentes</h4>
                    <p className="text-gray-600">Notificações automáticas de problemas de lag e falhas</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Métricas em Tempo Real</h4>
                    <p className="text-gray-600">Dashboard ao vivo de throughput, lag e errors</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Análise de Performance</h4>
                    <p className="text-gray-600">Análise detalhada de gargalos e otimizações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics de Replicação */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Replicação</CardTitle>
              <CardDescription>Análise histórica e tendências de replicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Distribuição de Erros */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Erros</CardTitle>
                    <CardDescription>Análise dos tipos de erros mais comuns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={errorDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Quantidade">
                          {errorDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Estatísticas Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatBytes(replicationChannels.reduce((total, channel) => total + channel.metrics.bytesTransferred, 0))}
                      </div>
                      <div className="text-sm text-gray-600">Total Transferido</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(replicationChannels.reduce((total, channel) => total + channel.metrics.recordsTransferred, 0))}
                      </div>
                      <div className="text-sm text-gray-600">Registros Processados</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(replicationChannels.reduce((total, channel) => total + channel.metrics.uptime, 0) / replicationChannels.length * 100) / 100}%
                      </div>
                      <div className="text-sm text-gray-600">Uptime Médio</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {replicationConflicts.filter(c => c.resolution === 'resolved').length}
                      </div>
                      <div className="text-sm text-gray-600">Conflitos Resolvidos</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DataReplication
