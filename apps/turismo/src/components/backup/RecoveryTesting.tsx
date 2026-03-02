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
  Play,
  Pause,
  Stop,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Activity,
  Settings,
  Calendar,
  Database,
  Server,
  Cloud,
  Shield,
  Archive,
  RotateCcw,
  TrendingUp,
  TrendingDown,
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
  Gauge,
  Users,
  Download,
  Upload,
  Save,
  Network,
  TestTube,
  ClipboardCheck,
  Bug,
  Wrench
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

// Tipos para Recovery Testing
interface RecoveryTest {
  id: string
  name: string
  description: string
  type: 'full_recovery' | 'partial_recovery' | 'point_in_time' | 'cross_region' | 'performance' | 'data_integrity'
  priority: 'critical' | 'high' | 'medium' | 'low'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand'
  scope: {
    systems: string[]
    databases: string[]
    applications: string[]
    dataVolume: number // GB
    estimatedDuration: number // minutes
  }
  schedule: {
    enabled: boolean
    nextRun: string
    lastRun?: string
    cronExpression?: string
  }
  configuration: {
    restorePoint: string
    targetEnvironment: 'staging' | 'test' | 'isolated'
    automatedValidation: boolean
    rollbackEnabled: boolean
    notifyOnCompletion: boolean
    timeoutMinutes: number
  }
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
  results?: {
    startTime: string
    endTime: string
    duration: number
    success: boolean
    rtoActual: number // minutes
    rpoActual: number // minutes
    dataIntegrity: number // percentage
    performanceScore: number // percentage
    issues: TestIssue[]
    metrics: TestMetrics
  }
  participants: {
    name: string
    role: string
    email: string
    required: boolean
  }[]
  createdAt: string
  updatedAt: string
}

interface TestIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'data_loss' | 'performance' | 'connectivity' | 'validation' | 'timeout' | 'configuration'
  title: string
  description: string
  impact: string
  recommendation: string
  status: 'open' | 'resolved' | 'investigating' | 'deferred'
  assignedTo?: string
  resolvedAt?: string
}

interface TestMetrics {
  dataValidated: number // GB
  recordsValidated: number
  queriesExecuted: number
  connectionsEstablished: number
  responseTime: {
    average: number // ms
    min: number
    max: number
    p95: number
  }
  throughput: {
    reads: number // ops/sec
    writes: number // ops/sec
  }
  resources: {
    cpuUsage: number // percentage
    memoryUsage: number // percentage
    diskUsage: number // percentage
    networkUsage: number // percentage
  }
}

interface TestTemplate {
  id: string
  name: string
  description: string
  type: 'full_recovery' | 'partial_recovery' | 'point_in_time' | 'cross_region' | 'performance' | 'data_integrity'
  steps: {
    order: number
    title: string
    description: string
    automated: boolean
    estimatedDuration: number
    validation: string[]
    dependencies: string[]
  }[]
  validations: {
    name: string
    type: 'sql_query' | 'api_call' | 'file_check' | 'service_health' | 'data_consistency'
    criteria: string
    expected: string
    timeout: number
  }[]
  requirements: {
    minCpu: number
    minMemory: number // GB
    minDisk: number // GB
    minNetwork: number // Mbps
  }
  isDefault: boolean
  createdAt: string
}

interface TestEnvironment {
  id: string
  name: string
  type: 'staging' | 'test' | 'isolated' | 'production_like'
  status: 'available' | 'in_use' | 'maintenance' | 'failed'
  configuration: {
    servers: number
    totalCpu: number
    totalMemory: number // GB
    totalStorage: number // GB
    networkBandwidth: number // Mbps
  }
  currentTest?: string
  lastUsed?: string
  utilizationHistory: {
    timestamp: string
    cpuUsage: number
    memoryUsage: number
    storageUsage: number
  }[]
  location: string
  costs: {
    hourly: number
    daily: number
    currency: string
  }
}

const RecoveryTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTest, setSelectedTest] = useState<RecoveryTest | null>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)

  // Dados mock para demonstração
  const [recoveryTests] = useState<RecoveryTest[]>([
    {
      id: '1',
      name: 'Teste Completo de DR',
      description: 'Teste de recuperação completa do sistema incluindo banco de dados e aplicações',
      type: 'full_recovery',
      priority: 'critical',
      frequency: 'monthly',
      scope: {
        systems: ['web-servers', 'app-servers', 'db-servers', 'load-balancers'],
        databases: ['postgresql-main', 'redis-cache'],
        applications: ['onboarding-rsv', 'api-gateway'],
        dataVolume: 2.5,
        estimatedDuration: 240
      },
      schedule: {
        enabled: true,
        nextRun: '2025-02-15T02:00:00Z',
        lastRun: '2025-01-15T02:00:00Z',
        cronExpression: '0 2 15 * *'
      },
      configuration: {
        restorePoint: '2025-01-14T23:59:59Z',
        targetEnvironment: 'test',
        automatedValidation: true,
        rollbackEnabled: true,
        notifyOnCompletion: true,
        timeoutMinutes: 300
      },
      status: 'completed',
      results: {
        startTime: '2025-01-15T02:00:00Z',
        endTime: '2025-01-15T05:45:00Z',
        duration: 225, // 3h45min
        success: true,
        rtoActual: 225,
        rpoActual: 15,
        dataIntegrity: 99.8,
        performanceScore: 92,
        issues: [
          {
            id: 'issue-1',
            severity: 'medium',
            category: 'performance',
            title: 'Consultas SQL lentas',
            description: 'Algumas consultas complexas apresentaram tempo de resposta acima do esperado',
            impact: 'Degradação de performance em 15% nas consultas de relatórios',
            recommendation: 'Otimizar índices nas tabelas de analytics',
            status: 'open'
          }
        ],
        metrics: {
          dataValidated: 2.48,
          recordsValidated: 45000000,
          queriesExecuted: 15420,
          connectionsEstablished: 1250,
          responseTime: {
            average: 145,
            min: 12,
            max: 3450,
            p95: 580
          },
          throughput: {
            reads: 2850,
            writes: 1240
          },
          resources: {
            cpuUsage: 68,
            memoryUsage: 72,
            diskUsage: 45,
            networkUsage: 32
          }
        }
      },
      participants: [
        {
          name: 'João Silva',
          role: 'Coordenador de DR',
          email: 'joao.silva@rsv.com',
          required: true
        },
        {
          name: 'Ana Costa',
          role: 'DBA Senior',
          email: 'ana.costa@rsv.com',
          required: true
        },
        {
          name: 'Pedro Lima',
          role: 'DevOps Engineer',
          email: 'pedro.lima@rsv.com',
          required: false
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-15T05:45:00Z'
    },
    {
      id: '2',
      name: 'Teste de Integridade de Dados',
      description: 'Validação da integridade e consistência dos dados após recuperação',
      type: 'data_integrity',
      priority: 'high',
      frequency: 'weekly',
      scope: {
        systems: ['db-servers'],
        databases: ['postgresql-main'],
        applications: [],
        dataVolume: 2.5,
        estimatedDuration: 60
      },
      schedule: {
        enabled: true,
        nextRun: '2025-01-22T01:00:00Z',
        lastRun: '2025-01-15T01:00:00Z',
        cronExpression: '0 1 * * 1'
      },
      configuration: {
        restorePoint: '2025-01-14T23:59:59Z',
        targetEnvironment: 'test',
        automatedValidation: true,
        rollbackEnabled: false,
        notifyOnCompletion: true,
        timeoutMinutes: 90
      },
      status: 'completed',
      results: {
        startTime: '2025-01-15T01:00:00Z',
        endTime: '2025-01-15T01:52:00Z',
        duration: 52,
        success: true,
        rtoActual: 52,
        rpoActual: 5,
        dataIntegrity: 100,
        performanceScore: 95,
        issues: [],
        metrics: {
          dataValidated: 2.5,
          recordsValidated: 45123456,
          queriesExecuted: 8750,
          connectionsEstablished: 125,
          responseTime: {
            average: 85,
            min: 8,
            max: 450,
            p95: 220
          },
          throughput: {
            reads: 3250,
            writes: 0
          },
          resources: {
            cpuUsage: 45,
            memoryUsage: 38,
            diskUsage: 25,
            networkUsage: 18
          }
        }
      },
      participants: [
        {
          name: 'Ana Costa',
          role: 'DBA Senior',
          email: 'ana.costa@rsv.com',
          required: true
        }
      ],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2025-01-15T01:52:00Z'
    },
    {
      id: '3',
      name: 'Teste Cross-Region',
      description: 'Teste de recuperação entre regiões geográficas',
      type: 'cross_region',
      priority: 'high',
      frequency: 'quarterly',
      scope: {
        systems: ['web-servers', 'app-servers', 'db-servers'],
        databases: ['postgresql-main'],
        applications: ['onboarding-rsv'],
        dataVolume: 2.5,
        estimatedDuration: 180
      },
      schedule: {
        enabled: true,
        nextRun: '2025-04-01T03:00:00Z',
        cronExpression: '0 3 1 */3 *'
      },
      configuration: {
        restorePoint: '2025-01-14T23:59:59Z',
        targetEnvironment: 'isolated',
        automatedValidation: true,
        rollbackEnabled: true,
        notifyOnCompletion: true,
        timeoutMinutes: 240
      },
      status: 'scheduled',
      participants: [
        {
          name: 'João Silva',
          role: 'Coordenador de DR',
          email: 'joao.silva@rsv.com',
          required: true
        },
        {
          name: 'Maria Santos',
          role: 'Gerente de Infraestrutura',
          email: 'maria.santos@rsv.com',
          required: true
        }
      ],
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-12-15T00:00:00Z'
    }
  ])

  const [testTemplates] = useState<TestTemplate[]>([
    {
      id: '1',
      name: 'Template de Recuperação Completa',
      description: 'Template padrão para testes de recuperação completa do sistema',
      type: 'full_recovery',
      steps: [
        {
          order: 1,
          title: 'Preparar Ambiente de Teste',
          description: 'Verificar disponibilidade e preparar ambiente isolado',
          automated: true,
          estimatedDuration: 15,
          validation: ['environment_health', 'resource_availability'],
          dependencies: []
        },
        {
          order: 2,
          title: 'Restaurar Backup Principal',
          description: 'Restaurar backup do banco de dados principal',
          automated: true,
          estimatedDuration: 90,
          validation: ['data_integrity', 'schema_validation'],
          dependencies: ['step-1']
        },
        {
          order: 3,
          title: 'Deploy da Aplicação',
          description: 'Implementar aplicação no ambiente de teste',
          automated: true,
          estimatedDuration: 30,
          validation: ['application_health', 'service_availability'],
          dependencies: ['step-2']
        },
        {
          order: 4,
          title: 'Testes de Conectividade',
          description: 'Validar conectividade entre componentes',
          automated: true,
          estimatedDuration: 15,
          validation: ['network_connectivity', 'service_communication'],
          dependencies: ['step-3']
        },
        {
          order: 5,
          title: 'Validação Funcional',
          description: 'Executar testes funcionais críticos',
          automated: false,
          estimatedDuration: 60,
          validation: ['functional_tests', 'business_logic'],
          dependencies: ['step-4']
        }
      ],
      validations: [
        {
          name: 'Integridade do Banco',
          type: 'sql_query',
          criteria: 'SELECT COUNT(*) FROM users WHERE created_at IS NULL',
          expected: '0',
          timeout: 30
        },
        {
          name: 'Health Check API',
          type: 'api_call',
          criteria: 'GET /health',
          expected: '200',
          timeout: 10
        },
        {
          name: 'Consistência de Dados',
          type: 'data_consistency',
          criteria: 'cross_table_references',
          expected: '100%',
          timeout: 120
        }
      ],
      requirements: {
        minCpu: 8,
        minMemory: 16,
        minDisk: 100,
        minNetwork: 1000
      },
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ])

  const [testEnvironments] = useState<TestEnvironment[]>([
    {
      id: '1',
      name: 'Test Environment 1',
      type: 'test',
      status: 'available',
      configuration: {
        servers: 4,
        totalCpu: 32,
        totalMemory: 128,
        totalStorage: 2000,
        networkBandwidth: 10000
      },
      utilizationHistory: [
        { timestamp: '2025-01-15T10:00:00Z', cpuUsage: 25, memoryUsage: 30, storageUsage: 45 },
        { timestamp: '2025-01-15T11:00:00Z', cpuUsage: 65, memoryUsage: 70, storageUsage: 47 },
        { timestamp: '2025-01-15T12:00:00Z', cpuUsage: 45, memoryUsage: 55, storageUsage: 46 },
        { timestamp: '2025-01-15T13:00:00Z', cpuUsage: 20, memoryUsage: 25, storageUsage: 45 },
        { timestamp: '2025-01-15T14:00:00Z', cpuUsage: 15, memoryUsage: 20, storageUsage: 45 }
      ],
      location: 'us-east-1',
      costs: {
        hourly: 12.50,
        daily: 300,
        currency: 'USD'
      },
      lastUsed: '2025-01-15T05:45:00Z'
    },
    {
      id: '2',
      name: 'Isolated Environment',
      type: 'isolated',
      status: 'maintenance',
      configuration: {
        servers: 6,
        totalCpu: 48,
        totalMemory: 192,
        totalStorage: 4000,
        networkBandwidth: 10000
      },
      utilizationHistory: [
        { timestamp: '2025-01-15T10:00:00Z', cpuUsage: 0, memoryUsage: 0, storageUsage: 12 },
        { timestamp: '2025-01-15T11:00:00Z', cpuUsage: 0, memoryUsage: 0, storageUsage: 12 },
        { timestamp: '2025-01-15T12:00:00Z', cpuUsage: 0, memoryUsage: 0, storageUsage: 12 },
        { timestamp: '2025-01-15T13:00:00Z', cpuUsage: 0, memoryUsage: 0, storageUsage: 12 },
        { timestamp: '2025-01-15T14:00:00Z', cpuUsage: 0, memoryUsage: 0, storageUsage: 12 }
      ],
      location: 'us-west-2',
      costs: {
        hourly: 18.75,
        daily: 450,
        currency: 'USD'
      }
    }
  ])

  // Dados para gráficos
  const testTrendsData = [
    { month: 'Set', successful: 12, failed: 1, avgDuration: 180 },
    { month: 'Out', successful: 14, failed: 0, avgDuration: 165 },
    { month: 'Nov', successful: 11, failed: 2, avgDuration: 195 },
    { month: 'Dez', successful: 13, failed: 1, avgDuration: 175 },
    { month: 'Jan', successful: 15, failed: 0, avgDuration: 160 }
  ]

  const testTypeDistribution = [
    { name: 'Full Recovery', value: 45, color: '#3b82f6' },
    { name: 'Data Integrity', value: 25, color: '#10b981' },
    { name: 'Performance', value: 15, color: '#f59e0b' },
    { name: 'Cross Region', value: 10, color: '#ef4444' },
    { name: 'Point in Time', value: 5, color: '#8b5cf6' }
  ]

  const performanceMetricsData = [
    { test: 'Full Recovery', rto: 225, rpo: 15, integrity: 99.8, performance: 92 },
    { test: 'Data Integrity', rto: 52, rpo: 5, integrity: 100, performance: 95 },
    { test: 'Performance', rto: 45, rpo: 2, integrity: 99.9, performance: 88 },
    { test: 'Cross Region', rto: 185, rpo: 30, integrity: 99.5, performance: 85 }
  ]

  const environmentUtilizationData = [
    { time: '10:00', env1: 25, env2: 0 },
    { time: '11:00', env1: 65, env2: 0 },
    { time: '12:00', env1: 45, env2: 0 },
    { time: '13:00', env1: 20, env2: 0 },
    { time: '14:00', env1: 15, env2: 0 }
  ]

  // Funções auxiliares
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    } else {
      return `${remainingMinutes}m`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'available': case 'resolved': return 'bg-green-100 text-green-800'
      case 'running': case 'in_use': case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'failed': case 'critical': return 'bg-red-100 text-red-800'
      case 'scheduled': case 'open': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': case 'paused': case 'maintenance': case 'deferred': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'running': return <Play className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'cancelled': return <Stop className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full_recovery': return 'bg-blue-100 text-blue-800'
      case 'data_integrity': return 'bg-green-100 text-green-800'
      case 'performance': return 'bg-yellow-100 text-yellow-800'
      case 'cross_region': return 'bg-red-100 text-red-800'
      case 'point_in_time': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
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

  const getTestSuccessRate = () => {
    const completedTests = recoveryTests.filter(t => t.status === 'completed')
    const successfulTests = completedTests.filter(t => t.results?.success)
    return completedTests.length > 0 ? Math.round((successfulTests.length / completedTests.length) * 100) : 0
  }

  const getAverageRTO = () => {
    const completedTests = recoveryTests.filter(t => t.status === 'completed' && t.results)
    const totalRTO = completedTests.reduce((sum, t) => sum + (t.results?.rtoActual || 0), 0)
    return completedTests.length > 0 ? Math.round(totalRTO / completedTests.length) : 0
  }

  const getAverageDataIntegrity = () => {
    const completedTests = recoveryTests.filter(t => t.status === 'completed' && t.results)
    const totalIntegrity = completedTests.reduce((sum, t) => sum + (t.results?.dataIntegrity || 0), 0)
    return completedTests.length > 0 ? Math.round((totalIntegrity / completedTests.length) * 10) / 10 : 0
  }

  const getActiveIssues = () => {
    return recoveryTests.reduce((total, test) => {
      return total + (test.results?.issues.filter(i => i.status === 'open').length || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testes de Recuperação</h1>
          <p className="text-gray-600">Sistema automatizado de testes de backup e recuperação</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Teste
          </Button>
          <Button variant="secondary">
            <Play className="w-4 h-4 mr-2" />
            Executar Agora
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="environments">Ambientes</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {getTestSuccessRate()}%
                </div>
                <p className="text-xs text-gray-600">
                  Testes bem-sucedidos
                </p>
                <Progress value={getTestSuccessRate()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RTO Médio</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(getAverageRTO())}
                </div>
                <p className="text-xs text-gray-600">
                  Tempo de recuperação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Integridade</CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {getAverageDataIntegrity()}%
                </div>
                <p className="text-xs text-gray-600">
                  Integridade dos dados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Abertas</CardTitle>
                <Bug className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getActiveIssues()}
                </div>
                <p className="text-xs text-gray-600">
                  Problemas pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tendências de Testes */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Testes de Recuperação</CardTitle>
              <CardDescription>Histórico de execução e performance dos testes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={testTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="successful" fill="#10b981" name="Sucessos" />
                  <Bar yAxisId="left" dataKey="failed" fill="#ef4444" name="Falhas" />
                  <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="#3b82f6" strokeWidth={2} name="Duração Média (min)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Teste</CardTitle>
                <CardDescription>Frequência dos diferentes tipos de teste</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={testTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {testTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Utilização de Ambientes */}
            <Card>
              <CardHeader>
                <CardTitle>Utilização de Ambientes</CardTitle>
                <CardDescription>CPU dos ambientes de teste</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={environmentUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="env1" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Test Env 1" />
                    <Area type="monotone" dataKey="env2" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Isolated Env" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Testes Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Testes Recentes</CardTitle>
              <CardDescription>Últimos testes executados e seus resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recoveryTests.filter(t => t.status === 'completed').slice(0, 3).map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TestTube className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{test.name}</h4>
                        <p className="text-sm text-gray-600">{test.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Duração: {formatDuration(test.results?.duration || 0)}</span>
                          <span>•</span>
                          <span>RTO: {formatDuration(test.results?.rtoActual || 0)}</span>
                          <span>•</span>
                          <span>Integridade: {test.results?.dataIntegrity}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getTypeColor(test.type)}>
                        {test.type}
                      </Badge>
                      <Badge className={getStatusColor(test.status)}>
                        {getStatusIcon(test.status)}
                        <span className="ml-1">{test.status}</span>
                      </Badge>
                      <div className="text-right text-sm">
                        <div className="font-medium">{test.results?.success ? 'Sucesso' : 'Falha'}</div>
                        <div className="text-gray-500">{formatDateTime(test.results?.endTime || '')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          {/* Lista de Testes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Testes de Recuperação</CardTitle>
                <CardDescription>Gerenciar e executar testes de backup e recuperação</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Teste
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recoveryTests.map((test) => (
                  <Card key={test.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <TestTube className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{test.name}</h3>
                            <p className="text-gray-600">{test.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Tipo: {test.type}</span>
                              <span>•</span>
                              <span>Frequência: {test.frequency}</span>
                              <span>•</span>
                              <span>Duração estimada: {formatDuration(test.scope.estimatedDuration)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(test.priority)}>
                            {test.priority}
                          </Badge>
                          <Badge className={getTypeColor(test.type)}>
                            {test.type}
                          </Badge>
                          <Badge className={getStatusColor(test.status)}>
                            {getStatusIcon(test.status)}
                            <span className="ml-1">{test.status}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Escopo do Teste</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Sistemas:</span>
                              <div className="mt-1">
                                {test.scope.systems.slice(0, 2).map((system, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {system}
                                  </Badge>
                                ))}
                                {test.scope.systems.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{test.scope.systems.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Bancos:</span>
                              <div className="mt-1">
                                {test.scope.databases.map((db, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {db}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Apps:</span>
                              <div className="mt-1">
                                {test.scope.applications.map((app, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {app}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Volume:</span>
                              <span className="ml-2 font-medium">{test.scope.dataVolume} GB</span>
                            </div>
                          </div>
                        </div>

                        {test.results && (
                          <div>
                            <h4 className="font-semibold mb-2">Últimos Resultados</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">RTO Atual:</span>
                                <span className="ml-2 font-medium">{formatDuration(test.results.rtoActual)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">RPO Atual:</span>
                                <span className="ml-2 font-medium">{formatDuration(test.results.rpoActual)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Integridade:</span>
                                <span className="ml-2 font-medium">{test.results.dataIntegrity}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Performance:</span>
                                <span className="ml-2 font-medium">{test.results.performanceScore}%</span>
                              </div>
                            </div>

                            {test.results.issues.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm font-medium text-orange-600">Issues Identificadas:</span>
                                <div className="mt-1 space-y-1">
                                  {test.results.issues.map((issue, index) => (
                                    <div key={index} className="text-xs p-2 bg-orange-50 rounded">
                                      <Badge className={getSeverityColor(issue.severity)} size="sm">
                                        {issue.severity}
                                      </Badge>
                                      <span className="ml-2">{issue.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2">Próxima Execução</h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {test.schedule.nextRun ? formatDateTime(test.schedule.nextRun) : 'Não agendado'}
                            </span>
                            <div className="flex space-x-1">
                              {test.schedule.enabled && (
                                <Badge variant="secondary" className="text-xs">Agendado</Badge>
                              )}
                              {test.configuration.automatedValidation && (
                                <Badge variant="secondary" className="text-xs">Auto-validação</Badge>
                              )}
                              {test.configuration.rollbackEnabled && (
                                <Badge variant="secondary" className="text-xs">Rollback</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <span className="text-sm text-gray-500">
                          Criado em {formatDateTime(test.createdAt)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Executar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Resultados
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Copy className="h-3 w-3 mr-1" />
                            Clonar
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

        <TabsContent value="templates" className="space-y-6">
          {/* Templates de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Templates de Teste</CardTitle>
              <CardDescription>Modelos pré-configurados para criação de testes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {testTemplates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <p className="text-gray-600">{template.description}</p>
                          <Badge className="mt-2" variant="secondary">
                            {template.type}
                          </Badge>
                          {template.isDefault && (
                            <Badge className="mt-2 ml-2 bg-blue-100 text-blue-800">
                              Padrão
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Etapas do Template ({template.steps.length})</h4>
                          <div className="space-y-2">
                            {template.steps.slice(0, 3).map((step, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                                  {step.order}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium">{step.title}</span>
                                  <span className="text-gray-600 ml-2">({formatDuration(step.estimatedDuration)})</span>
                                  {step.automated && (
                                    <Badge variant="secondary" className="text-xs ml-2">Auto</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            {template.steps.length > 3 && (
                              <div className="text-sm text-gray-500 ml-9">
                                +{template.steps.length - 3} etapas adicionais
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Requisitos de Recursos</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">CPU:</span>
                              <span className="ml-2 font-medium">{template.requirements.minCpu} cores</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Memória:</span>
                              <span className="ml-2 font-medium">{template.requirements.minMemory} GB</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Disco:</span>
                              <span className="ml-2 font-medium">{template.requirements.minDisk} GB</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Rede:</span>
                              <span className="ml-2 font-medium">{template.requirements.minNetwork} Mbps</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Validações ({template.validations.length})</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.validations.map((validation, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {validation.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <span className="text-sm text-gray-500">
                          Criado em {formatDateTime(template.createdAt)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Usar Template
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
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

        <TabsContent value="environments" className="space-y-6">
          {/* Ambientes de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Ambientes de Teste</CardTitle>
              <CardDescription>Infraestrutura disponível para execução de testes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testEnvironments.map((env) => (
                  <Card key={env.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Server className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{env.name}</h4>
                            <p className="text-sm text-gray-600">Tipo: {env.type}</p>
                            <p className="text-xs text-gray-500">Localização: {env.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(env.status)}>
                            {env.status}
                          </Badge>
                          {env.currentTest && (
                            <Badge variant="secondary" className="text-xs">
                              Em uso
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Servidores:</span>
                          <span className="ml-2 font-medium">{env.configuration.servers}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">CPU Total:</span>
                          <span className="ml-2 font-medium">{env.configuration.totalCpu} cores</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Memória Total:</span>
                          <span className="ml-2 font-medium">{env.configuration.totalMemory} GB</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Storage Total:</span>
                          <span className="ml-2 font-medium">{env.configuration.totalStorage} GB</span>
                        </div>
                      </div>

                      {env.utilizationHistory.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Utilização Atual</h5>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>CPU</span>
                                <span>{env.utilizationHistory[env.utilizationHistory.length - 1].cpuUsage}%</span>
                              </div>
                              <Progress value={env.utilizationHistory[env.utilizationHistory.length - 1].cpuUsage} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Memória</span>
                                <span>{env.utilizationHistory[env.utilizationHistory.length - 1].memoryUsage}%</span>
                              </div>
                              <Progress value={env.utilizationHistory[env.utilizationHistory.length - 1].memoryUsage} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Storage</span>
                                <span>{env.utilizationHistory[env.utilizationHistory.length - 1].storageUsage}%</span>
                              </div>
                              <Progress value={env.utilizationHistory[env.utilizationHistory.length - 1].storageUsage} className="h-2" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex space-x-4">
                          <span className="text-gray-600">
                            Custo: {env.costs.currency} {env.costs.hourly}/hora
                          </span>
                          {env.lastUsed && (
                            <span className="text-gray-600">
                              Último uso: {formatDateTime(env.lastUsed)}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary" disabled={env.status !== 'available'}>
                            <Play className="h-3 w-3 mr-1" />
                            Usar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Monitor className="h-3 w-3 mr-1" />
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

        <TabsContent value="results" className="space-y-6">
          {/* Resultados Detalhados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
              <CardDescription>Análise detalhada dos resultados de recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance vs Objetivos</CardTitle>
                    <CardDescription>Comparação entre RTO/RPO planejados vs executados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="test" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rto" fill="#3b82f6" name="RTO (min)" />
                        <Bar dataKey="rpo" fill="#10b981" name="RPO (min)" />
                        <Bar dataKey="integrity" fill="#f59e0b" name="Integridade %" />
                        <Bar dataKey="performance" fill="#8b5cf6" name="Performance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detalhes dos Testes Completados */}
                {recoveryTests.filter(t => t.status === 'completed').map((test) => (
                  <Card key={test.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{test.name}</h3>
                          <p className="text-gray-600">{test.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getTypeColor(test.type)}>{test.type}</Badge>
                            <Badge className={test.results?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {test.results?.success ? 'Sucesso' : 'Falha'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatDateTime(test.results?.endTime || '')}</div>
                          <div className="text-gray-500">Duração: {formatDuration(test.results?.duration || 0)}</div>
                        </div>
                      </div>

                      {test.results && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{formatDuration(test.results.rtoActual)}</div>
                              <div className="text-sm text-blue-800">RTO Executado</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{formatDuration(test.results.rpoActual)}</div>
                              <div className="text-sm text-green-800">RPO Executado</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">{test.results.dataIntegrity}%</div>
                              <div className="text-sm text-purple-800">Integridade</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">{test.results.performanceScore}%</div>
                              <div className="text-sm text-orange-800">Performance</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Métricas de Execução</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Dados Validados:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.dataValidated} GB</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Registros:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.recordsValidated.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Queries:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.queriesExecuted.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Conexões:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.connectionsEstablished.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Performance de Resposta</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Média:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.responseTime.average}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Mínimo:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.responseTime.min}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Máximo:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.responseTime.max}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600">P95:</span>
                                <span className="ml-2 font-medium">{test.results.metrics.responseTime.p95}ms</span>
                              </div>
                            </div>
                          </div>

                          {test.results.issues.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-orange-600">Issues Identificadas</h4>
                              <div className="space-y-2">
                                {test.results.issues.map((issue, index) => (
                                  <div key={index} className="p-3 bg-orange-50 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="font-medium">{issue.title}</h5>
                                      <Badge className={getSeverityColor(issue.severity)}>
                                        {issue.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                                    <div className="text-sm">
                                      <div><strong>Impacto:</strong> {issue.impact}</div>
                                      <div><strong>Recomendação:</strong> {issue.recommendation}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics de Testes */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Testes</CardTitle>
              <CardDescription>Análise histórica e tendências dos testes de recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics Avançados
                </h3>
                <p className="text-gray-600 mb-6">
                  Análise detalhada de tendências, padrões e insights dos testes de recuperação.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Análise de Tendências</h4>
                    <p className="text-gray-600">Identificação de padrões e melhorias ao longo do tempo</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Comparação de Performance</h4>
                    <p className="text-gray-600">Benchmarks e comparações entre diferentes tipos de teste</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Previsão de Falhas</h4>
                    <p className="text-gray-600">Análise preditiva para identificar possíveis problemas</p>
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

export default RecoveryTesting
