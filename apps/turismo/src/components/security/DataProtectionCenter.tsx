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
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Database,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Users,
  Globe,
  Trash2,
  Archive,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Info,
  Fingerprint,
  Cpu,
  HardDrive,
  Cloud,
  Server,
  Network,
  Router,
  Wifi,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  History,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  FileCheck,
  FileLock,
  FileX,
  Folder,
  FolderOpen,
  Code,
  ExternalLink,
  Bell,
  BellOff,
  Warning,
  ShieldCheck,
  ShieldAlert,
  Scan,
  Target,
  Zap,
  Layers
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

// Tipos para Data Protection Center
interface DataAsset {
  id: string
  name: string
  type: 'database' | 'file' | 'api' | 'service' | 'backup' | 'log'
  location: string
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
  owner: string
  steward: string
  createdAt: string
  lastAccessed: string
  size: number
  recordCount?: number
  sensitiveFields: string[]
  encryptionStatus: 'encrypted' | 'unencrypted' | 'partial'
  backupStatus: 'active' | 'inactive' | 'failed'
  retentionPeriod: number
  tags: string[]
  complianceFrameworks: string[]
  accessLog: {
    userId: string
    userName: string
    timestamp: string
    action: string
    ipAddress: string
  }[]
  riskScore: number
  lastAudit: string
  vulnerabilities: number
}

interface PrivacyRequest {
  id: string
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection'
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled'
  requestorId: string
  requestorName: string
  requestorEmail: string
  submittedAt: string
  processedAt?: string
  completedAt?: string
  description: string
  dataSubjects: string[]
  affectedAssets: string[]
  legalBasis: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  estimatedCompletion?: string
  actualEffort?: number
  notes: string[]
  attachments: string[]
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: string
}

interface DataFlow {
  id: string
  name: string
  source: {
    name: string
    type: 'internal' | 'external'
    location: string
  }
  destination: {
    name: string
    type: 'internal' | 'external'
    location: string
  }
  dataTypes: string[]
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand'
  encryption: 'in-transit' | 'at-rest' | 'both' | 'none'
  volume: number
  lastTransfer: string
  status: 'active' | 'inactive' | 'error'
  complianceStatus: 'compliant' | 'non-compliant' | 'review-required'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  monitoringEnabled: boolean
  alerts: number
  legalBasis: string[]
  purpose: string
  retentionPeriod: number
}

interface DataSubject {
  id: string
  identifier: string
  type: 'customer' | 'employee' | 'partner' | 'vendor' | 'other'
  status: 'active' | 'inactive' | 'deleted'
  jurisdiction: string
  consentStatus: {
    marketing: boolean
    analytics: boolean
    profiling: boolean
    thirdParty: boolean
    updatedAt: string
  }
  dataCategories: string[]
  lastActivity: string
  requestHistory: string[]
  riskProfile: 'low' | 'medium' | 'high'
  specialCategories: string[]
  retentionPeriod: number
  deletionScheduled?: string
}

interface BreachIncident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'reported'
  detectedAt: string
  reportedAt?: string
  containedAt?: string
  resolvedAt?: string
  affectedAssets: string[]
  affectedSubjects: number
  dataTypes: string[]
  rootCause?: string
  impact: {
    financial: number
    reputation: 'low' | 'medium' | 'high'
    regulatory: 'none' | 'warning' | 'fine' | 'investigation'
  }
  containmentActions: string[]
  preventionMeasures: string[]
  reportedToAuthorities: boolean
  reportedToSubjects: boolean
  assignedTo: string
  estimatedCost: number
  actualCost?: number
  lessonsLearned: string[]
  timeline: {
    timestamp: string
    action: string
    actor: string
  }[]
}

interface ComplianceFramework {
  id: string
  name: string
  description: string
  type: 'privacy' | 'security' | 'industry' | 'regional'
  requirements: {
    id: string
    title: string
    description: string
    status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable'
    evidence: string[]
    lastAssessment: string
    nextAssessment: string
    owner: string
  }[]
  overallScore: number
  lastAudit: string
  nextAudit: string
  certificationStatus: 'none' | 'in-progress' | 'certified' | 'expired'
  certificationExpiry?: string
}

const DataProtectionCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  // Dados mock para demonstração
  const [dataAssets] = useState<DataAsset[]>([
    {
      id: '1',
      name: 'Sistema de CRM',
      type: 'database',
      location: 'AWS RDS - us-east-1',
      classification: 'confidential',
      owner: 'João Silva',
      steward: 'Maria Santos',
      createdAt: '2024-01-15T00:00:00Z',
      lastAccessed: '2025-01-15T14:30:00Z',
      size: 2147483648,
      recordCount: 50000,
      sensitiveFields: ['cpf', 'email', 'telefone', 'endereco'],
      encryptionStatus: 'encrypted',
      backupStatus: 'active',
      retentionPeriod: 7,
      tags: ['customer-data', 'production', 'critical'],
      complianceFrameworks: ['LGPD', 'GDPR'],
      accessLog: [
        {
          userId: 'user_001',
          userName: 'Admin User',
          timestamp: '2025-01-15T14:30:00Z',
          action: 'query',
          ipAddress: '192.168.1.10'
        }
      ],
      riskScore: 85,
      lastAudit: '2024-12-01T00:00:00Z',
      vulnerabilities: 2
    },
    {
      id: '2',
      name: 'Logs de Aplicação',
      type: 'log',
      location: 'ELK Stack - Cluster Principal',
      classification: 'internal',
      owner: 'Carlos Oliveira',
      steward: 'Ana Costa',
      createdAt: '2024-03-01T00:00:00Z',
      lastAccessed: '2025-01-15T15:00:00Z',
      size: 1073741824,
      sensitiveFields: ['user_id', 'session_id', 'ip_address'],
      encryptionStatus: 'partial',
      backupStatus: 'active',
      retentionPeriod: 90,
      tags: ['logs', 'monitoring', 'analytics'],
      complianceFrameworks: ['SOC2', 'ISO27001'],
      accessLog: [],
      riskScore: 45,
      lastAudit: '2024-11-15T00:00:00Z',
      vulnerabilities: 0
    },
    {
      id: '3',
      name: 'Backup Financeiro',
      type: 'backup',
      location: 'Azure Blob Storage',
      classification: 'restricted',
      owner: 'Financial Team',
      steward: 'Roberto Lima',
      createdAt: '2024-02-01T00:00:00Z',
      lastAccessed: '2025-01-10T08:00:00Z',
      size: 5368709120,
      recordCount: 25000,
      sensitiveFields: ['account_number', 'balance', 'transaction_history'],
      encryptionStatus: 'encrypted',
      backupStatus: 'active',
      retentionPeriod: 2555,
      tags: ['financial', 'backup', 'archived'],
      complianceFrameworks: ['PCI-DSS', 'SOX'],
      accessLog: [],
      riskScore: 95,
      lastAudit: '2024-10-01T00:00:00Z',
      vulnerabilities: 1
    }
  ])

  const [privacyRequests] = useState<PrivacyRequest[]>([
    {
      id: '1',
      type: 'erasure',
      status: 'processing',
      requestorId: 'subj_001',
      requestorName: 'Maria Silva',
      requestorEmail: 'maria.silva@example.com',
      submittedAt: '2025-01-10T10:00:00Z',
      processedAt: '2025-01-11T09:00:00Z',
      description: 'Solicitação de exclusão de todos os dados pessoais devido ao encerramento de conta',
      dataSubjects: ['maria.silva@example.com'],
      affectedAssets: ['crm-database', 'marketing-system', 'support-tickets'],
      legalBasis: 'Art. 18, III LGPD',
      priority: 'high',
      assignedTo: 'data-protection-team',
      estimatedCompletion: '2025-01-17T17:00:00Z',
      notes: ['Verificação de identidade concluída', 'Mapeamento de dados em andamento'],
      attachments: ['identity-verification.pdf'],
      approvalRequired: true
    },
    {
      id: '2',
      type: 'access',
      status: 'completed',
      requestorId: 'subj_002',
      requestorName: 'João Santos',
      requestorEmail: 'joao.santos@example.com',
      submittedAt: '2025-01-05T14:30:00Z',
      processedAt: '2025-01-06T10:00:00Z',
      completedAt: '2025-01-08T16:00:00Z',
      description: 'Solicitação de acesso aos dados pessoais armazenados',
      dataSubjects: ['joao.santos@example.com'],
      affectedAssets: ['crm-database', 'order-history'],
      legalBasis: 'Art. 18, II LGPD',
      priority: 'medium',
      assignedTo: 'customer-service',
      actualEffort: 4,
      notes: ['Relatório gerado e enviado ao titular'],
      attachments: ['data-export.pdf'],
      approvalRequired: false,
      approvedBy: 'dpo-manager',
      approvedAt: '2025-01-06T11:00:00Z'
    }
  ])

  const [breachIncidents] = useState<BreachIncident[]>([
    {
      id: '1',
      title: 'Acesso não autorizado ao banco de dados de clientes',
      description: 'Detecção de acesso suspeito ao banco de dados de clientes durante horário não comercial',
      severity: 'high',
      status: 'contained',
      detectedAt: '2025-01-14T22:15:00Z',
      reportedAt: '2025-01-15T08:00:00Z',
      containedAt: '2025-01-15T10:30:00Z',
      affectedAssets: ['crm-database'],
      affectedSubjects: 1250,
      dataTypes: ['personal-data', 'contact-info', 'financial-data'],
      rootCause: 'Credenciais comprometidas',
      impact: {
        financial: 50000,
        reputation: 'medium',
        regulatory: 'investigation'
      },
      containmentActions: [
        'Bloqueio imediato das credenciais comprometidas',
        'Isolamento do sistema afetado',
        'Análise forense iniciada'
      ],
      preventionMeasures: [
        'Implementação de MFA obrigatório',
        'Monitoramento de acesso 24/7',
        'Auditoria de permissões'
      ],
      reportedToAuthorities: true,
      reportedToSubjects: false,
      assignedTo: 'security-incident-team',
      estimatedCost: 75000,
      lessonsLearned: ['Necessidade de MFA em todos os acessos administrativos'],
      timeline: [
        {
          timestamp: '2025-01-14T22:15:00Z',
          action: 'Detecção automática de acesso suspeito',
          actor: 'monitoring-system'
        },
        {
          timestamp: '2025-01-15T08:00:00Z',
          action: 'Escalação para equipe de segurança',
          actor: 'security-analyst'
        }
      ]
    }
  ])

  const [complianceFrameworks] = useState<ComplianceFramework[]>([
    {
      id: '1',
      name: 'LGPD',
      description: 'Lei Geral de Proteção de Dados Pessoais',
      type: 'privacy',
      requirements: [
        {
          id: 'lgpd-01',
          title: 'Base Legal para Tratamento',
          description: 'Verificação de base legal válida para todo tratamento de dados',
          status: 'compliant',
          evidence: ['consent-records.xlsx', 'legal-basis-mapping.pdf'],
          lastAssessment: '2024-12-15T00:00:00Z',
          nextAssessment: '2025-03-15T00:00:00Z',
          owner: 'legal-team'
        },
        {
          id: 'lgpd-02',
          title: 'Direitos dos Titulares',
          description: 'Implementação de mecanismos para exercício dos direitos',
          status: 'compliant',
          evidence: ['privacy-portal.png', 'request-process.pdf'],
          lastAssessment: '2024-12-15T00:00:00Z',
          nextAssessment: '2025-03-15T00:00:00Z',
          owner: 'privacy-team'
        },
        {
          id: 'lgpd-03',
          title: 'Segurança e Proteção',
          description: 'Medidas técnicas e organizacionais de segurança',
          status: 'partial',
          evidence: ['security-assessment.pdf'],
          lastAssessment: '2024-11-30T00:00:00Z',
          nextAssessment: '2025-02-28T00:00:00Z',
          owner: 'security-team'
        }
      ],
      overallScore: 85,
      lastAudit: '2024-12-15T00:00:00Z',
      nextAudit: '2025-06-15T00:00:00Z',
      certificationStatus: 'in-progress'
    },
    {
      id: '2',
      name: 'ISO 27001',
      description: 'Sistema de Gestão de Segurança da Informação',
      type: 'security',
      requirements: [
        {
          id: 'iso-01',
          title: 'Política de Segurança',
          description: 'Estabelecimento e manutenção de política de segurança',
          status: 'compliant',
          evidence: ['security-policy.pdf'],
          lastAssessment: '2024-10-01T00:00:00Z',
          nextAssessment: '2025-04-01T00:00:00Z',
          owner: 'security-team'
        }
      ],
      overallScore: 78,
      lastAudit: '2024-10-01T00:00:00Z',
      nextAudit: '2025-10-01T00:00:00Z',
      certificationStatus: 'certified',
      certificationExpiry: '2025-10-01T00:00:00Z'
    }
  ])

  // Dados para gráficos
  const dataVolumeData = [
    { month: 'Jul', volume: 45.2, growth: 5.2 },
    { month: 'Ago', volume: 47.8, growth: 5.8 },
    { month: 'Set', volume: 51.2, growth: 7.1 },
    { month: 'Out', volume: 48.9, growth: -4.5 },
    { month: 'Nov', volume: 52.3, growth: 6.9 },
    { month: 'Dez', volume: 56.7, growth: 8.4 }
  ]

  const classificationDistribution = [
    { name: 'Público', value: 25, color: '#10b981' },
    { name: 'Interno', value: 35, color: '#3b82f6' },
    { name: 'Confidencial', value: 30, color: '#f59e0b' },
    { name: 'Restrito', value: 10, color: '#ef4444' }
  ]

  const requestTypeData = [
    { type: 'Acesso', count: 45, avgTime: 3.2 },
    { type: 'Retificação', count: 28, avgTime: 2.8 },
    { type: 'Exclusão', count: 15, avgTime: 7.5 },
    { type: 'Portabilidade', count: 8, avgTime: 5.1 },
    { type: 'Restrição', count: 12, avgTime: 4.3 }
  ]

  const riskAssessmentData = [
    { asset: 'CRM Database', risk: 85, vulnerabilities: 2 },
    { asset: 'Financial Backup', risk: 95, vulnerabilities: 1 },
    { asset: 'Application Logs', risk: 45, vulnerabilities: 0 },
    { asset: 'User Analytics', risk: 65, vulnerabilities: 3 },
    { asset: 'Email Archive', risk: 72, vulnerabilities: 1 }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'confidential': return 'bg-yellow-100 text-yellow-800'
      case 'restricted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEncryptionColor = (status: string) => {
    switch (status) {
      case 'encrypted': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'unencrypted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'compliant': case 'completed': case 'contained': case 'resolved': 
        return 'bg-green-100 text-green-800'
      case 'processing': case 'investigating': case 'partial': case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending': case 'detected':
        return 'bg-blue-100 text-blue-800'
      case 'failed': case 'non-compliant': case 'rejected': case 'error':
        return 'bg-red-100 text-red-800'
      case 'inactive': case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'bg-red-100 text-red-800'
    if (risk >= 60) return 'bg-orange-100 text-orange-800'
    if (risk >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return Database
      case 'file': return FileText
      case 'api': return Code
      case 'service': return Server
      case 'backup': return Archive
      case 'log': return Activity
      default: return Folder
    }
  }

  const calculateMetrics = () => {
    const totalAssets = dataAssets.length
    const encryptedAssets = dataAssets.filter(a => a.encryptionStatus === 'encrypted').length
    const totalRequests = privacyRequests.length
    const pendingRequests = privacyRequests.filter(r => r.status === 'pending').length
    const totalBreaches = breachIncidents.length
    const activeBreaches = breachIncidents.filter(b => ['detected', 'investigating', 'contained'].includes(b.status)).length
    
    return {
      totalAssets,
      encryptedAssets,
      encryptionRate: (encryptedAssets / totalAssets) * 100,
      totalRequests,
      pendingRequests,
      totalBreaches,
      activeBreaches,
      avgComplianceScore: complianceFrameworks.reduce((sum, f) => sum + f.overallScore, 0) / complianceFrameworks.length
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Proteção de Dados</h1>
          <p className="text-gray-600">Gestão de privacidade, proteção de dados e compliance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsRequestModalOpen(!isRequestModalOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
          <Button variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            Relatório LGPD
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Ativos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="subjects">Titulares</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="flows">Fluxos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs de Proteção de Dados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos Protegidos</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.totalAssets}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.encryptionRate.toFixed(0)}% criptografados
                </p>
                <Progress value={metrics.encryptionRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitações</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.totalRequests}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.pendingRequests} pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.totalBreaches}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.activeBreaches} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Compliance</CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.avgComplianceScore.toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600">
                  Média dos frameworks
                </p>
                <Progress value={metrics.avgComplianceScore} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Volume de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Dados</CardTitle>
              <CardDescription>Crescimento do volume de dados armazenados (TB)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dataVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Volume (TB)" />
                  <Line type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} name="Crescimento %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classificação de Dados */}
            <Card>
              <CardHeader>
                <CardTitle>Classificação de Dados</CardTitle>
                <CardDescription>Distribuição por nível de classificação</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={classificationDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {classificationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise de Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Risco</CardTitle>
                <CardDescription>Score de risco vs vulnerabilidades por ativo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart data={riskAssessmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="risk" name="Score de Risco" />
                    <YAxis dataKey="vulnerabilities" name="Vulnerabilidades" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="vulnerabilities" fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Solicitações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Privacidade Recentes</CardTitle>
              <CardDescription>Últimas solicitações dos titulares de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacyRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        request.type === 'erasure' ? 'bg-red-100' :
                        request.type === 'access' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {request.type === 'erasure' ? (
                          <Trash2 className="h-5 w-5 text-red-600" />
                        ) : request.type === 'access' ? (
                          <Eye className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Edit className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{request.type.toUpperCase()}</h4>
                        <p className="text-sm text-gray-600">{request.description}</p>
                        <p className="text-xs text-gray-500">
                          Por: {request.requestorName} • {formatDateTime(request.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={
                        request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {request.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Incidentes Críticos */}
          <Card>
            <CardHeader>
              <CardTitle>Incidentes de Segurança</CardTitle>
              <CardDescription>Incidentes recentes de violação de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breachIncidents.slice(0, 2).map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{incident.title}</h4>
                        <p className="text-sm text-gray-600">{incident.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Titulares Afetados:</span>
                        <span className="ml-2 font-medium">{formatNumber(incident.affectedSubjects)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Detectado em:</span>
                        <span className="ml-2 font-medium">{formatDateTime(incident.detectedAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Custo Estimado:</span>
                        <span className="ml-2 font-medium">R$ {formatNumber(incident.estimatedCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          {/* Gestão de Ativos de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Inventário de Ativos de Dados</CardTitle>
              <CardDescription>Gestão e classificação de ativos que contêm dados pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar ativos..." title="Buscar ativos" />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'database', label: 'Banco de Dados' },
                      { value: 'file', label: 'Arquivo' },
                      { value: 'api', label: 'API' },
                      { value: 'service', label: 'Serviço' },
                      { value: 'backup', label: 'Backup' },
                      { value: 'log', label: 'Log' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por classificação"
                    options={[
                      { value: 'all', label: 'Todas as Classificações' },
                      { value: 'public', label: 'Público' },
                      { value: 'internal', label: 'Interno' },
                      { value: 'confidential', label: 'Confidencial' },
                      { value: 'restricted', label: 'Restrito' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Ativo
                  </Button>
                </div>

                <div className="space-y-3">
                  {dataAssets.map((asset) => {
                    const TypeIcon = getTypeIcon(asset.type)
                    
                    return (
                      <Card key={asset.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                asset.type === 'database' ? 'bg-blue-100' :
                                asset.type === 'backup' ? 'bg-purple-100' : 'bg-gray-100'
                              }`}>
                                <TypeIcon className={`h-5 w-5 ${
                                  asset.type === 'database' ? 'text-blue-600' :
                                  asset.type === 'backup' ? 'text-purple-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{asset.name}</h4>
                                <p className="text-sm text-gray-600">{asset.location}</p>
                                <p className="text-xs text-gray-500">
                                  Proprietário: {asset.owner} • Curador: {asset.steward}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getClassificationColor(asset.classification)}>
                                {asset.classification}
                              </Badge>
                              <Badge className={getEncryptionColor(asset.encryptionStatus)}>
                                {asset.encryptionStatus}
                              </Badge>
                              <Badge className={getRiskColor(asset.riskScore)}>
                                Risco: {asset.riskScore}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-gray-600">Tamanho:</span>
                              <span className="ml-2 font-medium">{formatBytes(asset.size)}</span>
                            </div>
                            {asset.recordCount && (
                              <div>
                                <span className="text-gray-600">Registros:</span>
                                <span className="ml-2 font-medium">{formatNumber(asset.recordCount)}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Retenção:</span>
                              <span className="ml-2 font-medium">{asset.retentionPeriod} anos</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Último Acesso:</span>
                              <span className="ml-2 font-medium">{formatDateTime(asset.lastAccessed)}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Campos Sensíveis:</p>
                            <div className="flex flex-wrap gap-2">
                              {asset.sensitiveFields.map((field, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Frameworks de Compliance:</p>
                            <div className="flex flex-wrap gap-2">
                              {asset.complianceFrameworks.map((framework, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {framework}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              {asset.vulnerabilities > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                  {asset.vulnerabilities} vulnerabilidades
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                Última auditoria: {formatDate(asset.lastAudit)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <History className="h-3 w-3 mr-1" />
                                Log de Acesso
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

        <TabsContent value="requests" className="space-y-6">
          {/* Solicitações de Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Privacidade</CardTitle>
              <CardDescription>Gestão de direitos dos titulares de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'access', label: 'Acesso' },
                      { value: 'portability', label: 'Portabilidade' },
                      { value: 'rectification', label: 'Retificação' },
                      { value: 'erasure', label: 'Exclusão' },
                      { value: 'restriction', label: 'Restrição' },
                      { value: 'objection', label: 'Objeção' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'pending', label: 'Pendente' },
                      { value: 'processing', label: 'Processando' },
                      { value: 'completed', label: 'Concluída' },
                      { value: 'rejected', label: 'Rejeitada' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Solicitação
                  </Button>
                </div>

                <div className="grid gap-4">
                  {privacyRequests.map((request) => (
                    <Card key={request.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              Solicitação de {request.type.toUpperCase()}
                            </h3>
                            <p className="text-gray-600">{request.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Solicitante: {request.requestorName} ({request.requestorEmail})
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                              <Badge className={
                                request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {request.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(request.submittedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Base Legal:</p>
                            <Badge variant="secondary">{request.legalBasis}</Badge>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Ativos Afetados:</p>
                            <div className="flex flex-wrap gap-2">
                              {request.affectedAssets.map((asset, index) => (
                                <Badge key={index} variant="secondary">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {request.notes.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Notas:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {request.notes.map((note, index) => (
                                  <li key={index}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {request.assignedTo && (
                              <div>
                                <span className="text-gray-600">Atribuído a:</span>
                                <span className="ml-2 font-medium">{request.assignedTo}</span>
                              </div>
                            )}
                            {request.estimatedCompletion && (
                              <div>
                                <span className="text-gray-600">Prazo Estimado:</span>
                                <span className="ml-2 font-medium">{formatDateTime(request.estimatedCompletion)}</span>
                              </div>
                            )}
                            {request.completedAt && (
                              <div>
                                <span className="text-gray-600">Concluída em:</span>
                                <span className="ml-2 font-medium">{formatDateTime(request.completedAt)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              ID: {request.id}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizar
                              </Button>
                              {request.status === 'pending' && (
                                <Button size="sm">
                                  <User className="h-3 w-3 mr-1" />
                                  Processar
                                </Button>
                              )}
                              {request.status !== 'completed' && (
                                <Button variant="secondary" size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Concluir
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Estatísticas de Solicitações */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas de Solicitações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={requestTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis yAxisId="count" orientation="left" />
                        <YAxis yAxisId="time" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="count" dataKey="count" fill="#3b82f6" name="Quantidade" />
                        <Bar yAxisId="time" dataKey="avgTime" fill="#10b981" name="Tempo Médio (dias)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          {/* Gestão de Titulares */}
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Titulares de Dados</CardTitle>
              <CardDescription>Informações sobre titulares e gestão de consentimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gestão de Titulares
                </h3>
                <p className="text-gray-600 mb-6">
                  Funcionalidade em desenvolvimento. Esta seção incluirá gestão completa de titulares de dados,
                  consentimentos, preferências de privacidade e histórico de interações.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Registro de Consentimentos</h4>
                    <p className="text-gray-600">Gestão de consentimentos granulares por finalidade</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Preferências de Privacidade</h4>
                    <p className="text-gray-600">Portal do titular para gerenciar suas preferências</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Histórico de Atividades</h4>
                    <p className="text-gray-600">Rastreamento completo das interações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          {/* Gestão de Incidentes */}
          <Card>
            <CardHeader>
              <CardTitle>Incidentes de Violação de Dados</CardTitle>
              <CardDescription>Gestão e resposta a incidentes de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por severidade"
                    options={[
                      { value: 'all', label: 'Todas as Severidades' },
                      { value: 'critical', label: 'Crítica' },
                      { value: 'high', label: 'Alta' },
                      { value: 'medium', label: 'Média' },
                      { value: 'low', label: 'Baixa' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'detected', label: 'Detectado' },
                      { value: 'investigating', label: 'Investigando' },
                      { value: 'contained', label: 'Contido' },
                      { value: 'resolved', label: 'Resolvido' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Incidente
                  </Button>
                </div>

                <div className="grid gap-6">
                  {breachIncidents.map((incident) => (
                    <Card key={incident.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{incident.title}</h3>
                            <p className="text-gray-600">{incident.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getSeverityColor(incident.severity)}>
                                {incident.severity}
                              </Badge>
                              <Badge className={getStatusColor(incident.status)}>
                                {incident.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              Detectado: {formatDateTime(incident.detectedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Titulares Afetados:</span>
                            <span className="ml-2 font-medium text-red-600">
                              {formatNumber(incident.affectedSubjects)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Custo Estimado:</span>
                            <span className="ml-2 font-medium">
                              R$ {formatNumber(incident.estimatedCost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Impacto Financeiro:</span>
                            <span className="ml-2 font-medium">
                              R$ {formatNumber(incident.impact.financial)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Atribuído a:</span>
                            <span className="ml-2 font-medium">{incident.assignedTo}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Ativos Afetados:</p>
                            <div className="flex flex-wrap gap-2">
                              {incident.affectedAssets.map((asset, index) => (
                                <Badge key={index} variant="secondary">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Tipos de Dados:</p>
                            <div className="flex flex-wrap gap-2">
                              {incident.dataTypes.map((type, index) => (
                                <Badge key={index} variant="secondary">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Ações de Contenção:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {incident.containmentActions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Medidas Preventivas:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {incident.preventionMeasures.map((measure, index) => (
                                <li key={index}>{measure}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Reportado às Autoridades:</span>
                              <span className={`ml-2 font-medium ${
                                incident.reportedToAuthorities ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {incident.reportedToAuthorities ? 'Sim' : 'Não'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Notificação aos Titulares:</span>
                              <span className={`ml-2 font-medium ${
                                incident.reportedToSubjects ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {incident.reportedToSubjects ? 'Sim' : 'Não'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Impacto Reputacional:</span>
                              <span className="ml-2 font-medium">{incident.impact.reputation}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              ID: {incident.id}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Timeline
                              </Button>
                              <Button size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                Relatório
                              </Button>
                              {incident.status !== 'resolved' && (
                                <Button variant="secondary" size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolver
                                </Button>
                              )}
                            </div>
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

        <TabsContent value="compliance" className="space-y-6">
          {/* Gestão de Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Frameworks de Compliance</CardTitle>
              <CardDescription>Monitoramento de conformidade regulatória</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {complianceFrameworks.map((framework) => (
                  <Card key={framework.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{framework.name}</h3>
                          <p className="text-gray-600">{framework.description}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold mb-2 ${
                            framework.overallScore >= 90 ? 'text-green-600' :
                            framework.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {framework.overallScore}%
                          </div>
                          <Badge className={getStatusColor(framework.certificationStatus)}>
                            {framework.certificationStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progresso Geral</span>
                          <span className="text-sm font-medium">{framework.overallScore}%</span>
                        </div>
                        <Progress value={framework.overallScore} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Requisitos:</h4>
                        {framework.requirements.map((req) => (
                          <div key={req.id} className="flex items-start justify-between p-3 border rounded-lg">
                            <div>
                              <h5 className="font-semibold">{req.title}</h5>
                              <p className="text-sm text-gray-600">{req.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Responsável: {req.owner} • Última avaliação: {formatDate(req.lastAssessment)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(req.status)}>
                              {req.status}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-600">Última Auditoria:</span>
                          <span className="ml-2 font-medium">{formatDate(framework.lastAudit)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Próxima Auditoria:</span>
                          <span className="ml-2 font-medium">{formatDate(framework.nextAudit)}</span>
                        </div>
                        {framework.certificationExpiry && (
                          <div>
                            <span className="text-gray-600">Vencimento Certificação:</span>
                            <span className="ml-2 font-medium">{formatDate(framework.certificationExpiry)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          {/* Fluxos de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxos de Dados</CardTitle>
              <CardDescription>Mapeamento e monitoramento de fluxos de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mapeamento de Fluxos
                </h3>
                <p className="text-gray-600 mb-6">
                  Funcionalidade em desenvolvimento. Esta seção incluirá visualização interativa de fluxos de dados,
                  monitoramento em tempo real e análise de conformidade.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Visualização Interativa</h4>
                    <p className="text-gray-600">Mapa visual dos fluxos de dados entre sistemas</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Monitoramento em Tempo Real</h4>
                    <p className="text-gray-600">Alertas e métricas de performance dos fluxos</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Análise de Conformidade</h4>
                    <p className="text-gray-600">Verificação automática de conformidade dos fluxos</p>
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

export default DataProtectionCenter
