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
  Save,
  Download,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Stop,
  Settings,
  Calendar,
  Database,
  Server,
  Cloud,
  Shield,
  Archive,
  RotateCcw,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Folder,
  HardDrive,
  Monitor,
  Globe,
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
  Gauge
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

// Tipos para Backup Center
interface BackupJob {
  id: string
  name: string
  description: string
  type: 'full' | 'incremental' | 'differential' | 'snapshot'
  source: {
    type: 'database' | 'filesystem' | 'application' | 'cloud'
    path: string
    size: number
  }
  destination: {
    type: 'local' | 'cloud' | 'remote' | 'hybrid'
    path: string
    encryption: boolean
    compression: boolean
  }
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    time: string
    enabled: boolean
    nextRun: string
  }
  retention: {
    policy: 'time_based' | 'version_based' | 'space_based'
    value: number
    unit: 'days' | 'weeks' | 'months' | 'versions' | 'gb'
  }
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused'
  lastRun: {
    timestamp: string
    duration: number
    size: number
    status: 'success' | 'failed' | 'partial'
    errorMessage?: string
  }
  metrics: {
    successRate: number
    averageDuration: number
    totalBackups: number
    totalSize: number
    compressionRatio: number
  }
  createdAt: string
  updatedAt: string
}

interface BackupHistory {
  id: string
  jobId: string
  jobName: string
  timestamp: string
  type: 'full' | 'incremental' | 'differential' | 'snapshot'
  status: 'success' | 'failed' | 'partial'
  duration: number
  originalSize: number
  compressedSize: number
  compressionRatio: number
  location: string
  checksum: string
  errorDetails?: string
  isRestorable: boolean
}

interface RestorePoint {
  id: string
  name: string
  description: string
  timestamp: string
  type: 'automatic' | 'manual' | 'milestone'
  dataSize: number
  location: string
  status: 'available' | 'corrupted' | 'expired' | 'archived'
  dependencies: string[]
  metadata: {
    dbVersion: string
    appVersion: string
    configHash: string
    userCount: number
  }
  restoreTime: number
  verificationStatus: 'verified' | 'pending' | 'failed'
}

interface BackupStorage {
  id: string
  name: string
  type: 'local' | 'aws_s3' | 'google_cloud' | 'azure_blob' | 'ftp' | 'sftp'
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  capacity: {
    total: number
    used: number
    available: number
  }
  performance: {
    readSpeed: number
    writeSpeed: number
    latency: number
  }
  configuration: {
    endpoint: string
    region?: string
    bucket?: string
    encryption: boolean
    compression: boolean
  }
  costs: {
    storage: number
    transfer: number
    requests: number
    currency: string
  }
  lastSync: string
  errorCount: number
}

const BackupCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null)
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)

  // Dados mock para demonstração
  const [backupJobs] = useState<BackupJob[]>([
    {
      id: '1',
      name: 'Database Full Backup',
      description: 'Backup completo do banco de dados principal',
      type: 'full',
      source: {
        type: 'database',
        path: 'postgresql://localhost:5432/onboarding_rsv',
        size: 2.5 * 1024 * 1024 * 1024 // 2.5GB
      },
      destination: {
        type: 'cloud',
        path: 's3://rsv-backups/database/',
        encryption: true,
        compression: true
      },
      schedule: {
        frequency: 'daily',
        time: '02:00',
        enabled: true,
        nextRun: '2025-01-16T02:00:00Z'
      },
      retention: {
        policy: 'time_based',
        value: 30,
        unit: 'days'
      },
      status: 'completed',
      lastRun: {
        timestamp: '2025-01-15T02:00:00Z',
        duration: 1800, // 30 minutos
        size: 2.1 * 1024 * 1024 * 1024, // 2.1GB comprimido
        status: 'success'
      },
      metrics: {
        successRate: 98.5,
        averageDuration: 1650,
        totalBackups: 387,
        totalSize: 850 * 1024 * 1024 * 1024, // 850GB
        compressionRatio: 0.84
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-15T02:30:00Z'
    },
    {
      id: '2',
      name: 'Application Files Backup',
      description: 'Backup incremental dos arquivos da aplicação',
      type: 'incremental',
      source: {
        type: 'filesystem',
        path: '/var/www/onboarding-rsv/',
        size: 1.2 * 1024 * 1024 * 1024 // 1.2GB
      },
      destination: {
        type: 'hybrid',
        path: 'local:/backups/app/ + s3://rsv-backups/app/',
        encryption: true,
        compression: true
      },
      schedule: {
        frequency: 'daily',
        time: '01:00',
        enabled: true,
        nextRun: '2025-01-16T01:00:00Z'
      },
      retention: {
        policy: 'version_based',
        value: 50,
        unit: 'versions'
      },
      status: 'running',
      lastRun: {
        timestamp: '2025-01-15T01:00:00Z',
        duration: 450,
        size: 89 * 1024 * 1024, // 89MB incremental
        status: 'success'
      },
      metrics: {
        successRate: 99.2,
        averageDuration: 420,
        totalBackups: 425,
        totalSize: 45 * 1024 * 1024 * 1024, // 45GB
        compressionRatio: 0.76
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-15T01:15:00Z'
    },
    {
      id: '3',
      name: 'Configuration Snapshot',
      description: 'Snapshot das configurações do sistema',
      type: 'snapshot',
      source: {
        type: 'application',
        path: '/etc/onboarding-rsv/config/',
        size: 25 * 1024 * 1024 // 25MB
      },
      destination: {
        type: 'local',
        path: '/var/backups/config/',
        encryption: false,
        compression: true
      },
      schedule: {
        frequency: 'weekly',
        time: '00:00',
        enabled: true,
        nextRun: '2025-01-19T00:00:00Z'
      },
      retention: {
        policy: 'version_based',
        value: 20,
        unit: 'versions'
      },
      status: 'scheduled',
      lastRun: {
        timestamp: '2025-01-12T00:00:00Z',
        duration: 30,
        size: 18 * 1024 * 1024, // 18MB comprimido
        status: 'success'
      },
      metrics: {
        successRate: 100,
        averageDuration: 28,
        totalBackups: 156,
        totalSize: 3.2 * 1024 * 1024 * 1024, // 3.2GB
        compressionRatio: 0.72
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-12T00:01:00Z'
    }
  ])

  const [backupHistory] = useState<BackupHistory[]>([
    {
      id: 'h1',
      jobId: '1',
      jobName: 'Database Full Backup',
      timestamp: '2025-01-15T02:00:00Z',
      type: 'full',
      status: 'success',
      duration: 1800,
      originalSize: 2.5 * 1024 * 1024 * 1024,
      compressedSize: 2.1 * 1024 * 1024 * 1024,
      compressionRatio: 0.84,
      location: 's3://rsv-backups/database/2025-01-15-02-00-00.sql.gz',
      checksum: 'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      isRestorable: true
    },
    {
      id: 'h2',
      jobId: '2',
      jobName: 'Application Files Backup',
      timestamp: '2025-01-15T01:00:00Z',
      type: 'incremental',
      status: 'success',
      duration: 450,
      originalSize: 120 * 1024 * 1024,
      compressedSize: 89 * 1024 * 1024,
      compressionRatio: 0.74,
      location: 's3://rsv-backups/app/2025-01-15-01-00-00.tar.gz',
      checksum: 'sha256:b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
      isRestorable: true
    },
    {
      id: 'h3',
      jobId: '1',
      jobName: 'Database Full Backup',
      timestamp: '2025-01-14T02:00:00Z',
      type: 'full',
      status: 'failed',
      duration: 3600,
      originalSize: 2.5 * 1024 * 1024 * 1024,
      compressedSize: 0,
      compressionRatio: 0,
      location: '',
      checksum: '',
      errorDetails: 'Connection timeout to S3 bucket',
      isRestorable: false
    }
  ])

  const [restorePoints] = useState<RestorePoint[]>([
    {
      id: 'rp1',
      name: 'Pre-Migration Milestone',
      description: 'Ponto de restauração antes da migração para v2.0',
      timestamp: '2025-01-10T00:00:00Z',
      type: 'milestone',
      dataSize: 2.8 * 1024 * 1024 * 1024,
      location: 's3://rsv-backups/milestones/pre-migration-v2.tar.gz',
      status: 'available',
      dependencies: ['database', 'application', 'config'],
      metadata: {
        dbVersion: '13.8',
        appVersion: '1.9.5',
        configHash: 'abc123def456',
        userCount: 1247
      },
      restoreTime: 900,
      verificationStatus: 'verified'
    },
    {
      id: 'rp2',
      name: 'Daily Snapshot',
      description: 'Snapshot automático diário',
      timestamp: '2025-01-15T02:30:00Z',
      type: 'automatic',
      dataSize: 2.1 * 1024 * 1024 * 1024,
      location: 's3://rsv-backups/daily/2025-01-15.tar.gz',
      status: 'available',
      dependencies: ['database'],
      metadata: {
        dbVersion: '13.8',
        appVersion: '2.0.1',
        configHash: 'def456ghi789',
        userCount: 1289
      },
      restoreTime: 720,
      verificationStatus: 'verified'
    }
  ])

  const [storageLocations] = useState<BackupStorage[]>([
    {
      id: 's1',
      name: 'AWS S3 Primary',
      type: 'aws_s3',
      status: 'active',
      capacity: {
        total: 1000 * 1024 * 1024 * 1024, // 1TB
        used: 387 * 1024 * 1024 * 1024,   // 387GB
        available: 613 * 1024 * 1024 * 1024 // 613GB
      },
      performance: {
        readSpeed: 125, // MB/s
        writeSpeed: 98,  // MB/s
        latency: 15      // ms
      },
      configuration: {
        endpoint: 's3.amazonaws.com',
        region: 'us-east-1',
        bucket: 'rsv-backups',
        encryption: true,
        compression: true
      },
      costs: {
        storage: 8.97,
        transfer: 2.34,
        requests: 0.45,
        currency: 'USD'
      },
      lastSync: '2025-01-15T02:30:15Z',
      errorCount: 0
    },
    {
      id: 's2',
      name: 'Local NAS',
      type: 'local',
      status: 'active',
      capacity: {
        total: 4 * 1024 * 1024 * 1024 * 1024, // 4TB
        used: 1.2 * 1024 * 1024 * 1024 * 1024, // 1.2TB
        available: 2.8 * 1024 * 1024 * 1024 * 1024 // 2.8TB
      },
      performance: {
        readSpeed: 210, // MB/s
        writeSpeed: 185, // MB/s
        latency: 2       // ms
      },
      configuration: {
        endpoint: '192.168.1.100',
        encryption: true,
        compression: false
      },
      costs: {
        storage: 0,
        transfer: 0,
        requests: 0,
        currency: 'USD'
      },
      lastSync: '2025-01-15T01:15:30Z',
      errorCount: 2
    }
  ])

  // Dados para gráficos
  const backupTrendsData = [
    { date: '2025-01-09', successful: 8, failed: 0, size: 2.1 },
    { date: '2025-01-10', successful: 9, failed: 0, size: 2.3 },
    { date: '2025-01-11', successful: 8, failed: 1, size: 1.8 },
    { date: '2025-01-12', successful: 9, failed: 0, size: 2.2 },
    { date: '2025-01-13', successful: 8, failed: 0, size: 2.0 },
    { date: '2025-01-14', successful: 7, failed: 2, size: 1.5 },
    { date: '2025-01-15', successful: 9, failed: 0, size: 2.4 }
  ]

  const storageUsageData = [
    { name: 'Database', value: 387, color: '#3b82f6' },
    { name: 'Application', value: 45, color: '#10b981' },
    { name: 'Configuration', value: 3.2, color: '#f59e0b' },
    { name: 'Logs', value: 12.8, color: '#ef4444' },
    { name: 'Media', value: 156, color: '#8b5cf6' }
  ]

  const performanceData = [
    { time: '00:00', readSpeed: 210, writeSpeed: 185, latency: 2 },
    { time: '01:00', readSpeed: 125, writeSpeed: 98, latency: 15 },
    { time: '02:00', readSpeed: 118, writeSpeed: 95, latency: 18 },
    { time: '03:00', readSpeed: 130, writeSpeed: 102, latency: 12 },
    { time: '04:00', readSpeed: 215, writeSpeed: 188, latency: 3 }
  ]

  // Funções auxiliares
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-gray-100 text-gray-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />
      case 'completed': case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'partial': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getOverallHealth = () => {
    const activeJobs = backupJobs.filter(job => job.schedule.enabled).length
    const successfulJobs = backupJobs.filter(job => job.lastRun.status === 'success').length
    return Math.round((successfulJobs / activeJobs) * 100)
  }

  const getTotalBackupSize = () => {
    return backupJobs.reduce((total, job) => total + job.metrics.totalSize, 0)
  }

  const getAverageCompressionRatio = () => {
    const avgRatio = backupJobs.reduce((total, job) => total + job.metrics.compressionRatio, 0) / backupJobs.length
    return Math.round(avgRatio * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Backup</h1>
          <p className="text-gray-600">Sistema inteligente de backup e recuperação de dados</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreateJobOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Job
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
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="restore">Restauração</TabsTrigger>
          <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
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
                  {getOverallHealth()}%
                </div>
                <p className="text-xs text-gray-600">
                  Backups funcionando
                </p>
                <Progress value={getOverallHealth()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Ativos</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {backupJobs.filter(job => job.schedule.enabled).length}
                </div>
                <p className="text-xs text-gray-600">
                  de {backupJobs.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
                <Database className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatBytes(getTotalBackupSize())}
                </div>
                <p className="text-xs text-gray-600">
                  Dados protegidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compressão</CardTitle>
                <Archive className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getAverageCompressionRatio()}%
                </div>
                <p className="text-xs text-gray-600">
                  Taxa média
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tendências de Backup */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Backup</CardTitle>
              <CardDescription>Histórico de backups realizados nos últimos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={backupTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="successful" fill="#10b981" name="Sucessos" />
                  <Bar yAxisId="left" dataKey="failed" fill="#ef4444" name="Falhas" />
                  <Line yAxisId="right" type="monotone" dataKey="size" stroke="#3b82f6" strokeWidth={2} name="Tamanho (GB)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uso de Armazenamento */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Armazenamento</CardTitle>
                <CardDescription>Uso do espaço por tipo de backup</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={storageUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatBytes(value * 1024 * 1024 * 1024)}`}
                    >
                      {storageUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatBytes(value * 1024 * 1024 * 1024)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance de Armazenamento */}
            <Card>
              <CardHeader>
                <CardTitle>Performance de I/O</CardTitle>
                <CardDescription>Velocidade de leitura e escrita</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="readSpeed" stroke="#10b981" strokeWidth={2} name="Leitura (MB/s)" />
                    <Line type="monotone" dataKey="writeSpeed" stroke="#3b82f6" strokeWidth={2} name="Escrita (MB/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Jobs em Execução */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs Ativos</CardTitle>
              <CardDescription>Backups atualmente em execução ou agendados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupJobs.filter(job => job.status === 'running' || job.status === 'scheduled').map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{job.name}</h4>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1">{job.status}</span>
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Próximo: {formatDateTime(job.schedule.nextRun)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {/* Lista de Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Jobs de Backup</CardTitle>
                <CardDescription>Gerenciar e monitorar jobs de backup</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupJobs.map((job) => (
                  <Card key={job.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Database className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{job.name}</h3>
                            <p className="text-gray-600">{job.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Tipo: {job.type}</span>
                              <span>•</span>
                              <span>Fonte: {job.source.type}</span>
                              <span>•</span>
                              <span>Destino: {job.destination.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1">{job.status}</span>
                          </Badge>
                          <Button size="sm" variant="secondary">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                          <div className="text-lg font-semibold text-green-600">
                            {job.metrics.successRate}%
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Último Backup</span>
                          <div className="text-lg font-semibold">
                            {formatBytes(job.lastRun.size)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Duração Média</span>
                          <div className="text-lg font-semibold">
                            {formatDuration(job.metrics.averageDuration)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Total Protegido</span>
                          <div className="text-lg font-semibold">
                            {formatBytes(job.metrics.totalSize)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Próxima Execução:</span>
                          <span className="font-medium">{formatDateTime(job.schedule.nextRun)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Retenção:</span>
                          <span className="font-medium">{job.retention.value} {job.retention.unit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Compressão:</span>
                          <span className="font-medium">{Math.round(job.metrics.compressionRatio * 100)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <span className="text-sm text-gray-500">
                          Criado em {formatDateTime(job.createdAt)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <Play className="h-3 w-3 mr-1" />
                            Executar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
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

        <TabsContent value="history" className="space-y-6">
          {/* Histórico de Backups */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Backups</CardTitle>
              <CardDescription>Registro detalhado de todos os backups realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                  <span>Job</span>
                  <span>Data/Hora</span>
                  <span>Tipo</span>
                  <span>Status</span>
                  <span>Duração</span>
                  <span>Tamanho</span>
                  <span>Compressão</span>
                  <span>Ações</span>
                </div>
                {backupHistory.map((backup) => (
                  <div key={backup.id} className="grid grid-cols-8 gap-4 py-3 border-b items-center">
                    <span className="font-medium">{backup.jobName}</span>
                    <span className="text-sm">{formatDateTime(backup.timestamp)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {backup.type}
                    </Badge>
                    <Badge className={getStatusColor(backup.status)}>
                      {getStatusIcon(backup.status)}
                      <span className="ml-1">{backup.status}</span>
                    </Badge>
                    <span className="text-sm">{formatDuration(backup.duration)}</span>
                    <span className="text-sm">{formatBytes(backup.compressedSize)}</span>
                    <span className="text-sm">{Math.round(backup.compressionRatio * 100)}%</span>
                    <div className="flex space-x-1">
                      {backup.isRestorable && (
                        <Button size="sm" variant="secondary">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="secondary">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Info className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          {/* Pontos de Restauração */}
          <Card>
            <CardHeader>
              <CardTitle>Pontos de Restauração</CardTitle>
              <CardDescription>Pontos de restauração disponíveis para recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restorePoints.map((point) => (
                  <Card key={point.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{point.name}</h4>
                          <p className="text-sm text-gray-600">{point.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(point.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(point.status)}>
                            {point.status}
                          </Badge>
                          <Badge variant="secondary">
                            {point.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Tamanho:</span>
                          <span className="ml-2 font-medium">{formatBytes(point.dataSize)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo de Restore:</span>
                          <span className="ml-2 font-medium">{formatDuration(point.restoreTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">App Version:</span>
                          <span className="ml-2 font-medium">{point.metadata.appVersion}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Usuários:</span>
                          <span className="ml-2 font-medium">{point.metadata.userCount}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-1">
                          {point.dependencies.map((dep, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restaurar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Download className="h-3 w-3 mr-1" />
                            Download
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

        <TabsContent value="storage" className="space-y-6">
          {/* Locais de Armazenamento */}
          <Card>
            <CardHeader>
              <CardTitle>Locais de Armazenamento</CardTitle>
              <CardDescription>Gerenciar destinos de backup e armazenamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageLocations.map((storage) => (
                  <Card key={storage.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {storage.type === 'local' ? (
                              <HardDrive className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Cloud className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">{storage.name}</h4>
                            <p className="text-sm text-gray-600">{storage.type}</p>
                            <p className="text-xs text-gray-500">{storage.configuration.endpoint}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(storage.status)}>
                          {storage.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Uso do Armazenamento</span>
                            <span>
                              {formatBytes(storage.capacity.used)} / {formatBytes(storage.capacity.total)}
                            </span>
                          </div>
                          <Progress 
                            value={(storage.capacity.used / storage.capacity.total) * 100} 
                            className="h-2" 
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Leitura:</span>
                            <span className="ml-2 font-medium">{storage.performance.readSpeed} MB/s</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Escrita:</span>
                            <span className="ml-2 font-medium">{storage.performance.writeSpeed} MB/s</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Latência:</span>
                            <span className="ml-2 font-medium">{storage.performance.latency} ms</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Custo Mensal:</span>
                            <span className="ml-2 font-medium">
                              ${(storage.costs.storage + storage.costs.transfer + storage.costs.requests).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t mt-3">
                        <span className="text-sm text-gray-500">
                          Última sincronização: {formatDateTime(storage.lastSync)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Activity className="h-3 w-3 mr-1" />
                            Teste
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

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoramento em Tempo Real */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>Acompanhe o status e performance dos backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Monitoramento Avançado
                </h3>
                <p className="text-gray-600 mb-6">
                  Sistema de monitoramento em tempo real com alertas e métricas detalhadas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Alertas Inteligentes</h4>
                    <p className="text-gray-600">Notificações automáticas de falhas e problemas</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Métricas em Tempo Real</h4>
                    <p className="text-gray-600">Dashboard ao vivo de performance e status</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Relatórios Automáticos</h4>
                    <p className="text-gray-600">Relatórios periódicos de saúde do sistema</p>
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

export default BackupCenter
