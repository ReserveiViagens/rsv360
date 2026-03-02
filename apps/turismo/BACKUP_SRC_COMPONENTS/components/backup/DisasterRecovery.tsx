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
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Activity,
  RefreshCw,
  Play,
  Pause,
  Stop,
  Settings,
  Calendar,
  Database,
  Server,
  Cloud,
  Archive,
  RotateCcw,
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
  Gauge,
  Users,
  Download,
  Upload,
  Save
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

// Tipos para Disaster Recovery
interface DisasterRecoveryPlan {
  id: string
  name: string
  description: string
  type: 'full_system' | 'database_only' | 'application_only' | 'partial'
  priority: 'critical' | 'high' | 'medium' | 'low'
  rto: number // Recovery Time Objective (minutes)
  rpo: number // Recovery Point Objective (minutes)
  scope: {
    systems: string[]
    databases: string[]
    applications: string[]
    networks: string[]
    storages: string[]
  }
  procedures: {
    step: number
    title: string
    description: string
    estimatedTime: number
    dependencies: string[]
    responsible: string
    automated: boolean
  }[]
  contacts: {
    primary: {
      name: string
      role: string
      phone: string
      email: string
    }
    secondary: {
      name: string
      role: string
      phone: string
      email: string
    }
    escalation: {
      name: string
      role: string
      phone: string
      email: string
    }
  }
  lastTest: {
    date: string
    duration: number
    status: 'success' | 'partial' | 'failed'
    issues: string[]
    improvements: string[]
  }
  status: 'active' | 'inactive' | 'testing' | 'updating'
  createdAt: string
  updatedAt: string
}

interface DisasterEvent {
  id: string
  title: string
  description: string
  severity: 'critical' | 'major' | 'moderate' | 'minor'
  category: 'hardware' | 'software' | 'network' | 'security' | 'natural' | 'human'
  status: 'ongoing' | 'resolved' | 'investigating' | 'escalated'
  detectedAt: string
  resolvedAt?: string
  duration?: number
  impactedSystems: string[]
  recoveryPlan?: string
  timeline: {
    timestamp: string
    event: string
    responsible: string
    status: 'completed' | 'in_progress' | 'pending' | 'failed'
  }[]
  metrics: {
    rto: number
    rpo: number
    actualRecoveryTime?: number
    dataLoss?: number
    downtime: number
    usersAffected: number
  }
  postMortem?: {
    rootCause: string
    lessons: string[]
    improvements: string[]
    preventiveMeasures: string[]
  }
}

interface BackupSite {
  id: string
  name: string
  type: 'hot' | 'warm' | 'cold'
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    region: string
    country: string
  }
  infrastructure: {
    servers: number
    storage: number // TB
    bandwidth: number // Mbps
    powerBackup: boolean
    redundantConnections: boolean
  }
  services: {
    database: boolean
    application: boolean
    storage: boolean
    network: boolean
  }
  status: 'active' | 'standby' | 'maintenance' | 'failed'
  lastSync: string
  syncStatus: 'in_sync' | 'lag' | 'failed'
  lag: number // minutes
  capacity: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  costs: {
    monthly: number
    perIncident: number
    currency: string
  }
}

interface RecoveryTest {
  id: string
  name: string
  planId: string
  planName: string
  type: 'full' | 'partial' | 'tabletop' | 'walkthrough'
  scope: string[]
  scheduledDate: string
  duration: number
  participants: {
    name: string
    role: string
    email: string
    attended: boolean
  }[]
  results: {
    rto: {
      target: number
      actual: number
      variance: number
    }
    rpo: {
      target: number
      actual: number
      variance: number
    }
    success: boolean
    issues: {
      severity: 'critical' | 'high' | 'medium' | 'low'
      description: string
      resolution: string
      status: 'open' | 'resolved'
    }[]
    improvements: string[]
    nextTestDate: string
  }
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  completedAt?: string
}

const DisasterRecovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPlan, setSelectedPlan] = useState<DisasterRecoveryPlan | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null)

  // Dados mock para demonstração
  const [recoveryPlans] = useState<DisasterRecoveryPlan[]>([
    {
      id: '1',
      name: 'Plano Completo de DR',
      description: 'Plano de recuperação para falha total do datacenter principal',
      type: 'full_system',
      priority: 'critical',
      rto: 240, // 4 horas
      rpo: 60,  // 1 hora
      scope: {
        systems: ['web-servers', 'app-servers', 'db-servers', 'load-balancers'],
        databases: ['postgresql-main', 'redis-cache', 'elasticsearch'],
        applications: ['onboarding-rsv', 'api-gateway', 'notification-service'],
        networks: ['primary-network', 'dmz', 'internal-network'],
        storages: ['primary-storage', 'backup-storage', 'archive-storage']
      },
      procedures: [
        {
          step: 1,
          title: 'Ativar Site Secundário',
          description: 'Inicializar infraestrutura no site de recuperação',
          estimatedTime: 30,
          dependencies: [],
          responsible: 'Equipe de Infraestrutura',
          automated: true
        },
        {
          step: 2,
          title: 'Restaurar Banco de Dados',
          description: 'Recuperar dados do último backup válido',
          estimatedTime: 90,
          dependencies: ['step-1'],
          responsible: 'DBA',
          automated: false
        },
        {
          step: 3,
          title: 'Deploy da Aplicação',
          description: 'Implementar última versão estável da aplicação',
          estimatedTime: 45,
          dependencies: ['step-2'],
          responsible: 'Equipe de DevOps',
          automated: true
        },
        {
          step: 4,
          title: 'Configurar Rede',
          description: 'Redirecionar tráfego para site secundário',
          estimatedTime: 30,
          dependencies: ['step-3'],
          responsible: 'Equipe de Rede',
          automated: false
        },
        {
          step: 5,
          title: 'Validar Sistema',
          description: 'Testes funcionais e de performance',
          estimatedTime: 45,
          dependencies: ['step-4'],
          responsible: 'Equipe de QA',
          automated: false
        }
      ],
      contacts: {
        primary: {
          name: 'João Silva',
          role: 'Coordenador de DR',
          phone: '+55 11 99999-9999',
          email: 'joao.silva@rsv.com'
        },
        secondary: {
          name: 'Maria Santos',
          role: 'Gerente de Infraestrutura',
          phone: '+55 11 88888-8888',
          email: 'maria.santos@rsv.com'
        },
        escalation: {
          name: 'Carlos Oliveira',
          role: 'Diretor de TI',
          phone: '+55 11 77777-7777',
          email: 'carlos.oliveira@rsv.com'
        }
      },
      lastTest: {
        date: '2024-12-15T09:00:00Z',
        duration: 195, // 3h15min
        status: 'success',
        issues: ['Lentidão na sincronização de dados'],
        improvements: ['Otimizar processo de backup', 'Melhorar documentação']
      },
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'DR Banco de Dados',
      description: 'Recuperação específica para falhas de banco de dados',
      type: 'database_only',
      priority: 'high',
      rto: 60,
      rpo: 15,
      scope: {
        systems: ['db-servers'],
        databases: ['postgresql-main', 'redis-cache'],
        applications: [],
        networks: [],
        storages: ['db-storage']
      },
      procedures: [
        {
          step: 1,
          title: 'Isolar Banco Corrompido',
          description: 'Desconectar banco principal e redirecionar tráfego',
          estimatedTime: 5,
          dependencies: [],
          responsible: 'DBA',
          automated: true
        },
        {
          step: 2,
          title: 'Ativar Replica Secundária',
          description: 'Promover replica secundária como principal',
          estimatedTime: 15,
          dependencies: ['step-1'],
          responsible: 'DBA',
          automated: true
        },
        {
          step: 3,
          title: 'Validar Integridade',
          description: 'Verificar consistência dos dados',
          estimatedTime: 30,
          dependencies: ['step-2'],
          responsible: 'DBA',
          automated: false
        },
        {
          step: 4,
          title: 'Reestabelecer Conexões',
          description: 'Reconectar aplicações ao novo banco principal',
          estimatedTime: 10,
          dependencies: ['step-3'],
          responsible: 'Equipe de DevOps',
          automated: true
        }
      ],
      contacts: {
        primary: {
          name: 'Ana Costa',
          role: 'DBA Senior',
          phone: '+55 11 66666-6666',
          email: 'ana.costa@rsv.com'
        },
        secondary: {
          name: 'Pedro Lima',
          role: 'DBA',
          phone: '+55 11 55555-5555',
          email: 'pedro.lima@rsv.com'
        },
        escalation: {
          name: 'Maria Santos',
          role: 'Gerente de Infraestrutura',
          phone: '+55 11 88888-8888',
          email: 'maria.santos@rsv.com'
        }
      },
      lastTest: {
        date: '2025-01-05T14:00:00Z',
        duration: 48,
        status: 'success',
        issues: [],
        improvements: ['Documentar novos procedimentos de validação']
      },
      status: 'active',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2025-01-05T15:00:00Z'
    }
  ])

  const [disasterEvents] = useState<DisasterEvent[]>([
    {
      id: '1',
      title: 'Falha do Datacenter Principal',
      description: 'Perda total de conectividade com o datacenter principal devido a incêndio',
      severity: 'critical',
      category: 'natural',
      status: 'resolved',
      detectedAt: '2024-11-15T03:30:00Z',
      resolvedAt: '2024-11-15T07:45:00Z',
      duration: 255, // 4h15min
      impactedSystems: ['web-servers', 'app-servers', 'db-servers', 'load-balancers'],
      recoveryPlan: '1',
      timeline: [
        {
          timestamp: '2024-11-15T03:30:00Z',
          event: 'Detecção inicial da falha',
          responsible: 'Sistema de Monitoramento',
          status: 'completed'
        },
        {
          timestamp: '2024-11-15T03:35:00Z',
          event: 'Ativação do plano de DR',
          responsible: 'João Silva',
          status: 'completed'
        },
        {
          timestamp: '2024-11-15T04:00:00Z',
          event: 'Site secundário ativado',
          responsible: 'Equipe de Infraestrutura',
          status: 'completed'
        },
        {
          timestamp: '2024-11-15T06:00:00Z',
          event: 'Aplicação restaurada',
          responsible: 'Equipe de DevOps',
          status: 'completed'
        },
        {
          timestamp: '2024-11-15T07:45:00Z',
          event: 'Sistema totalmente operacional',
          responsible: 'Equipe de QA',
          status: 'completed'
        }
      ],
      metrics: {
        rto: 240,
        rpo: 60,
        actualRecoveryTime: 255,
        dataLoss: 30, // 30 minutos de dados perdidos
        downtime: 255,
        usersAffected: 1250
      },
      postMortem: {
        rootCause: 'Incêndio no datacenter causado por falha elétrica',
        lessons: [
          'Necessidade de redundância geográfica',
          'Importância de testes regulares de DR',
          'Comunicação eficaz durante crises'
        ],
        improvements: [
          'Implementar site de DR em região diferente',
          'Reduzir RPO para 30 minutos',
          'Melhorar automação do processo'
        ],
        preventiveMeasures: [
          'Auditoria elétrica trimestral',
          'Sistema de supressão de incêndio melhorado',
          'Monitoramento ambiental 24/7'
        ]
      }
    }
  ])

  const [backupSites] = useState<BackupSite[]>([
    {
      id: '1',
      name: 'Site Secundário São Paulo',
      type: 'hot',
      location: {
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        coordinates: { lat: -23.5505, lng: -46.6333 },
        region: 'Sudeste',
        country: 'Brasil'
      },
      infrastructure: {
        servers: 8,
        storage: 50, // TB
        bandwidth: 1000, // Mbps
        powerBackup: true,
        redundantConnections: true
      },
      services: {
        database: true,
        application: true,
        storage: true,
        network: true
      },
      status: 'active',
      lastSync: '2025-01-15T14:30:00Z',
      syncStatus: 'in_sync',
      lag: 5, // minutes
      capacity: {
        cpu: 75,
        memory: 68,
        storage: 45,
        network: 32
      },
      costs: {
        monthly: 15000,
        perIncident: 2500,
        currency: 'BRL'
      }
    },
    {
      id: '2',
      name: 'Site Frio Brasília',
      type: 'cold',
      location: {
        address: 'SCS Quadra 2 - Brasília, DF',
        coordinates: { lat: -15.7942, lng: -47.8822 },
        region: 'Centro-Oeste',
        country: 'Brasil'
      },
      infrastructure: {
        servers: 4,
        storage: 100, // TB
        bandwidth: 500, // Mbps
        powerBackup: true,
        redundantConnections: false
      },
      services: {
        database: true,
        application: false,
        storage: true,
        network: false
      },
      status: 'standby',
      lastSync: '2025-01-15T12:00:00Z',
      syncStatus: 'lag',
      lag: 120, // minutes
      capacity: {
        cpu: 0,
        memory: 0,
        storage: 23,
        network: 0
      },
      costs: {
        monthly: 5000,
        perIncident: 8000,
        currency: 'BRL'
      }
    }
  ])

  const [recoveryTests] = useState<RecoveryTest[]>([
    {
      id: '1',
      name: 'Teste Trimestral Q4 2024',
      planId: '1',
      planName: 'Plano Completo de DR',
      type: 'full',
      scope: ['database', 'application', 'network'],
      scheduledDate: '2024-12-15T09:00:00Z',
      duration: 480, // 8 hours
      participants: [
        {
          name: 'João Silva',
          role: 'Coordenador de DR',
          email: 'joao.silva@rsv.com',
          attended: true
        },
        {
          name: 'Ana Costa',
          role: 'DBA Senior',
          email: 'ana.costa@rsv.com',
          attended: true
        },
        {
          name: 'Carlos DevOps',
          role: 'DevOps Engineer',
          email: 'carlos.devops@rsv.com',
          attended: false
        }
      ],
      results: {
        rto: {
          target: 240,
          actual: 195,
          variance: -45
        },
        rpo: {
          target: 60,
          actual: 30,
          variance: -30
        },
        success: true,
        issues: [
          {
            severity: 'medium',
            description: 'Lentidão na sincronização de dados',
            resolution: 'Otimização dos scripts de backup',
            status: 'resolved'
          }
        ],
        improvements: [
          'Automatizar mais etapas do processo',
          'Melhorar documentação dos procedimentos',
          'Treinar equipe de plantão'
        ],
        nextTestDate: '2025-03-15T09:00:00Z'
      },
      status: 'completed',
      createdAt: '2024-11-01T00:00:00Z',
      completedAt: '2024-12-15T17:00:00Z'
    }
  ])

  // Dados para gráficos
  const drMetricsData = [
    { month: 'Set', rto: 240, actual: 210, incidents: 0 },
    { month: 'Out', rto: 240, actual: 195, incidents: 1 },
    { month: 'Nov', rto: 240, actual: 255, incidents: 1 },
    { month: 'Dez', rto: 240, actual: 195, incidents: 0 },
    { month: 'Jan', rto: 240, actual: 180, incidents: 0 }
  ]

  const incidentsByCategory = [
    { name: 'Hardware', value: 35, color: '#ef4444' },
    { name: 'Software', value: 28, color: '#3b82f6' },
    { name: 'Rede', value: 22, color: '#10b981' },
    { name: 'Segurança', value: 10, color: '#f59e0b' },
    { name: 'Natural', value: 5, color: '#8b5cf6' }
  ]

  const siteStatusData = [
    { site: 'Principal', uptime: 99.8, performance: 95 },
    { site: 'Secundário SP', uptime: 99.9, performance: 92 },
    { site: 'Frio Brasília', uptime: 100, performance: 88 }
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
      case 'active': case 'success': case 'resolved': return 'bg-green-100 text-green-800'
      case 'ongoing': case 'in_progress': case 'testing': return 'bg-blue-100 text-blue-800'
      case 'failed': case 'critical': return 'bg-red-100 text-red-800'
      case 'scheduled': case 'standby': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': case 'major': return 'bg-orange-100 text-orange-800'
      case 'medium': case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'low': case 'minor': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />
      case 'low': return <Info className="h-4 w-4 text-green-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getSiteTypeColor = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-red-100 text-red-800'
      case 'warm': return 'bg-yellow-100 text-yellow-800'
      case 'cold': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateRTOCompliance = () => {
    const plans = recoveryPlans.filter(p => p.status === 'active')
    const testsWithinRTO = plans.filter(p => 
      p.lastTest.status === 'success' && 
      p.lastTest.duration <= p.rto
    ).length
    return Math.round((testsWithinRTO / plans.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disaster Recovery</h1>
          <p className="text-gray-600">Sistema avançado de recuperação de desastres e continuidade de negócios</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
          <Button variant="secondary">
            <Play className="w-4 h-4 mr-2" />
            Teste DR
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RTO Compliance</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {calculateRTOCompliance()}%
                </div>
                <p className="text-xs text-gray-600">
                  Planos dentro do RTO
                </p>
                <Progress value={calculateRTOCompliance()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {recoveryPlans.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {recoveryPlans.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sites Backup</CardTitle>
                <Server className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {backupSites.filter(s => s.status === 'active').length}
                </div>
                <p className="text-xs text-gray-600">
                  Sites operacionais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último Teste</CardTitle>
                <CheckCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {recoveryTests.filter(t => t.status === 'completed').length}
                </div>
                <p className="text-xs text-gray-600">
                  Testes realizados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de DR */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Recovery Time Objective (RTO)</CardTitle>
              <CardDescription>Comparação entre RTO planejado vs tempo real de recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={drMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="right" dataKey="incidents" fill="#ef4444" name="Incidentes" />
                  <Line yAxisId="left" type="monotone" dataKey="rto" stroke="#3b82f6" strokeWidth={2} name="RTO Planejado (min)" />
                  <Line yAxisId="left" type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Tempo Real (min)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidentes por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Incidentes por Categoria</CardTitle>
                <CardDescription>Distribuição dos tipos de incidentes históricos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incidentsByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {incidentsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status dos Sites */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Sites</CardTitle>
                <CardDescription>Uptime e performance dos sites de backup</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={siteStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="site" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="uptime" fill="#10b981" name="Uptime %" />
                    <Bar dataKey="performance" fill="#3b82f6" name="Performance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Planos de Recuperação Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Planos de Recuperação</CardTitle>
              <CardDescription>Visão geral dos planos de disaster recovery ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recoveryPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>RTO: {formatDuration(plan.rto)}</span>
                          <span>RPO: {formatDuration(plan.rpo)}</span>
                          <span>Última Atualização: {formatDateTime(plan.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getSeverityColor(plan.priority)}>
                        {getPriorityIcon(plan.priority)}
                        <span className="ml-1">{plan.priority}</span>
                      </Badge>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          {/* Planos de Recuperação Detalhados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Planos de Disaster Recovery</CardTitle>
                <CardDescription>Gerenciar planos de recuperação de desastres</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recoveryPlans.map((plan) => (
                  <Card key={plan.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Shield className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-gray-600">{plan.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Tipo: {plan.type}</span>
                              <span>•</span>
                              <span>RTO: {formatDuration(plan.rto)}</span>
                              <span>•</span>
                              <span>RPO: {formatDuration(plan.rpo)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(plan.priority)}>
                            {getPriorityIcon(plan.priority)}
                            <span className="ml-1">{plan.priority}</span>
                          </Badge>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Escopo do Plano</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Sistemas:</span>
                              <div className="mt-1">
                                {plan.scope.systems.slice(0, 2).map((system, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {system}
                                  </Badge>
                                ))}
                                {plan.scope.systems.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{plan.scope.systems.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Bancos:</span>
                              <div className="mt-1">
                                {plan.scope.databases.slice(0, 2).map((db, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {db}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Apps:</span>
                              <div className="mt-1">
                                {plan.scope.applications.slice(0, 2).map((app, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {app}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Redes:</span>
                              <div className="mt-1">
                                {plan.scope.networks.slice(0, 2).map((network, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {network}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Storage:</span>
                              <div className="mt-1">
                                {plan.scope.storages.slice(0, 2).map((storage, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                                    {storage}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Último Teste</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Data:</span>
                              <span className="ml-2 font-medium">{formatDateTime(plan.lastTest.date)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Duração:</span>
                              <span className="ml-2 font-medium">{formatDuration(plan.lastTest.duration)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <Badge className={getStatusColor(plan.lastTest.status)} size="sm">
                                {plan.lastTest.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-600">Issues:</span>
                              <span className="ml-2 font-medium">{plan.lastTest.issues.length}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Contatos de Emergência</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-2 bg-gray-50 rounded">
                              <span className="font-medium text-blue-600">Primário</span>
                              <div className="mt-1">
                                <div>{plan.contacts.primary.name}</div>
                                <div className="text-gray-600">{plan.contacts.primary.role}</div>
                                <div className="text-gray-600">{plan.contacts.primary.phone}</div>
                              </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <span className="font-medium text-green-600">Secundário</span>
                              <div className="mt-1">
                                <div>{plan.contacts.secondary.name}</div>
                                <div className="text-gray-600">{plan.contacts.secondary.role}</div>
                                <div className="text-gray-600">{plan.contacts.secondary.phone}</div>
                              </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <span className="font-medium text-red-600">Escalação</span>
                              <div className="mt-1">
                                <div>{plan.contacts.escalation.name}</div>
                                <div className="text-gray-600">{plan.contacts.escalation.role}</div>
                                <div className="text-gray-600">{plan.contacts.escalation.phone}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <span className="text-sm text-gray-500">
                          Criado em {formatDateTime(plan.createdAt)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Testar
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

        <TabsContent value="sites" className="space-y-6">
          {/* Sites de Backup */}
          <Card>
            <CardHeader>
              <CardTitle>Sites de Backup</CardTitle>
              <CardDescription>Locais de recuperação e backup para disaster recovery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupSites.map((site) => (
                  <Card key={site.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Server className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{site.name}</h4>
                            <p className="text-sm text-gray-600">{site.location.address}</p>
                            <p className="text-xs text-gray-500">{site.location.region}, {site.location.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSiteTypeColor(site.type)}>
                            {site.type}
                          </Badge>
                          <Badge className={getStatusColor(site.status)}>
                            {site.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Servers:</span>
                          <span className="ml-2 font-medium">{site.infrastructure.servers}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Storage:</span>
                          <span className="ml-2 font-medium">{site.infrastructure.storage} TB</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bandwidth:</span>
                          <span className="ml-2 font-medium">{site.infrastructure.bandwidth} Mbps</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sync Lag:</span>
                          <span className="ml-2 font-medium">{formatDuration(site.lag)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>{site.capacity.cpu}%</span>
                        </div>
                        <Progress value={site.capacity.cpu} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>{site.capacity.memory}%</span>
                        </div>
                        <Progress value={site.capacity.memory} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Storage Usage</span>
                          <span>{site.capacity.storage}%</span>
                        </div>
                        <Progress value={site.capacity.storage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex space-x-4">
                          {site.services.database && <Badge variant="secondary" className="text-xs">Database</Badge>}
                          {site.services.application && <Badge variant="secondary" className="text-xs">Application</Badge>}
                          {site.services.storage && <Badge variant="secondary" className="text-xs">Storage</Badge>}
                          {site.services.network && <Badge variant="secondary" className="text-xs">Network</Badge>}
                        </div>
                        <span className="text-gray-600">
                          Custo: {site.costs.currency} {site.costs.monthly.toLocaleString()}/mês
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t mt-3">
                        <span className="text-sm text-gray-500">
                          Última sincronização: {formatDateTime(site.lastSync)}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Activity className="h-3 w-3 mr-1" />
                            Monitor
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Settings className="h-3 w-3 mr-1" />
                            Config
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

        <TabsContent value="tests" className="space-y-6">
          {/* Testes de DR */}
          <Card>
            <CardHeader>
              <CardTitle>Testes de Disaster Recovery</CardTitle>
              <CardDescription>Histórico e planejamento de testes de DR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recoveryTests.map((test) => (
                  <Card key={test.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{test.name}</h4>
                          <p className="text-sm text-gray-600">Plano: {test.planName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(test.scheduledDate)} • {formatDuration(test.duration)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{test.type}</Badge>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>

                      {test.status === 'completed' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">RTO Target:</span>
                              <span className="ml-2 font-medium">{formatDuration(test.results.rto.target)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">RTO Actual:</span>
                              <span className={`ml-2 font-medium ${test.results.rto.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatDuration(test.results.rto.actual)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">RPO Target:</span>
                              <span className="ml-2 font-medium">{formatDuration(test.results.rpo.target)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">RPO Actual:</span>
                              <span className={`ml-2 font-medium ${test.results.rpo.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatDuration(test.results.rpo.actual)}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium">Participantes:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {test.participants.map((participant, index) => (
                                <Badge key={index} className={participant.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {participant.name}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {test.results.issues.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Issues Identificados:</span>
                              <div className="mt-1 space-y-1">
                                {test.results.issues.map((issue, index) => (
                                  <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                                    <Badge className={getSeverityColor(issue.severity)} size="sm">
                                      {issue.severity}
                                    </Badge>
                                    <span className="ml-2">{issue.description}</span>
                                    <div className="text-gray-600 mt-1">Resolução: {issue.resolution}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t mt-3">
                        <span className="text-sm text-gray-500">
                          Próximo teste: {test.results?.nextTestDate ? formatDateTime(test.results.nextTestDate) : 'A definir'}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Copy className="h-3 w-3 mr-1" />
                            Repetir
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

        <TabsContent value="incidents" className="space-y-6">
          {/* Histórico de Incidentes */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Incidentes</CardTitle>
              <CardDescription>Registro de incidentes e ações de recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {disasterEvents.map((event) => (
                  <Card key={event.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <p className="text-gray-600">{event.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Categoria: {event.category}</span>
                            <span>•</span>
                            <span>Detectado: {formatDateTime(event.detectedAt)}</span>
                            {event.resolvedAt && (
                              <>
                                <span>•</span>
                                <span>Resolvido: {formatDateTime(event.resolvedAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Downtime:</span>
                          <span className="ml-2 font-medium">{formatDuration(event.metrics.downtime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Usuários Afetados:</span>
                          <span className="ml-2 font-medium">{event.metrics.usersAffected.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">RTO Planejado:</span>
                          <span className="ml-2 font-medium">{formatDuration(event.metrics.rto)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo Real:</span>
                          <span className={`ml-2 font-medium ${event.metrics.actualRecoveryTime && event.metrics.actualRecoveryTime > event.metrics.rto ? 'text-red-600' : 'text-green-600'}`}>
                            {event.metrics.actualRecoveryTime ? formatDuration(event.metrics.actualRecoveryTime) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <span className="text-sm font-medium">Sistemas Impactados:</span>
                        <div className="flex flex-wrap gap-1">
                          {event.impactedSystems.map((system, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <span className="text-sm font-medium">Timeline do Incidente:</span>
                        <div className="space-y-2">
                          {event.timeline.map((item, index) => (
                            <div key={index} className="flex items-start space-x-3 text-sm">
                              <div className="flex-shrink-0 mt-1">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status).replace('text-', 'bg-')}`}></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span>{item.event}</span>
                                  <span className="text-gray-500">{formatDateTime(item.timestamp)}</span>
                                </div>
                                <div className="text-gray-600">Responsável: {item.responsible}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {event.postMortem && (
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Post-Mortem:</span>
                          <div className="text-sm">
                            <div><strong>Causa Raiz:</strong> {event.postMortem.rootCause}</div>
                            <div className="mt-2">
                              <strong>Lições Aprendidas:</strong>
                              <ul className="list-disc list-inside ml-4 mt-1">
                                {event.postMortem.lessons.map((lesson, index) => (
                                  <li key={index}>{lesson}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoramento de DR */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Disaster Recovery</CardTitle>
              <CardDescription>Status em tempo real dos sistemas de DR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Monitoramento Avançado de DR
                </h3>
                <p className="text-gray-600 mb-6">
                  Sistema de monitoramento contínuo de planos de recuperação, sites de backup e métricas de disponibilidade.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Alertas Automáticos</h4>
                    <p className="text-gray-600">Notificações instantâneas de falhas e problemas de sincronização</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Dashboards de Status</h4>
                    <p className="text-gray-600">Visão em tempo real do status de todos os sites e planos</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Relatórios de Compliance</h4>
                    <p className="text-gray-600">Relatórios automáticos de aderência aos RTO/RPO definidos</p>
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

export default DisasterRecovery
