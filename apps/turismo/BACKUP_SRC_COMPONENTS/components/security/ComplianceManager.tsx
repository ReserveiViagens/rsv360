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
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Building,
  Globe,
  Scale,
  Eye,
  Edit,
  Download,
  Upload,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Plus,
  FileText,
  Bookmark,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Network,
  Cpu,
  Monitor,
  Smartphone,
  Laptop,
  Router,
  Cloud,
  HardDrive
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
  RadialBar
} from 'recharts'

// Tipos para Compliance Manager
interface ComplianceFramework {
  id: string
  name: string
  fullName: string
  type: 'regulation' | 'standard' | 'certification' | 'policy'
  category: 'data_protection' | 'security' | 'quality' | 'financial' | 'industry'
  jurisdiction: 'global' | 'eu' | 'us' | 'brazil' | 'regional'
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
  score: number
  lastAssessment: string
  nextReview: string
  requirements: ComplianceRequirement[]
  penalties: {
    financial: string
    operational: string
    reputational: string
  }
  implementation: {
    completed: number
    total: number
    inProgress: number
    notStarted: number
  }
  documentation: string[]
  responsible: string
  auditor: string
}

interface ComplianceRequirement {
  id: string
  frameworkId: string
  title: string
  description: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
  implementationDate: string
  lastReview: string
  evidence: string[]
  controls: string[]
  responsible: string
  effort: 'low' | 'medium' | 'high' | 'very_high'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  automationLevel: 'manual' | 'semi_automated' | 'automated'
}

interface ComplianceAudit {
  id: string
  frameworkId: string
  type: 'internal' | 'external' | 'certification' | 'regulatory'
  auditor: string
  startDate: string
  endDate: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  score: number
  recommendations: string[]
  actionPlan: string[]
  nextAudit: string
  certification: {
    issued: boolean
    validUntil: string
    certificate: string
  }
}

interface ComplianceRisk {
  id: string
  frameworkId: string
  title: string
  description: string
  category: 'operational' | 'financial' | 'legal' | 'reputational' | 'strategic'
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  riskScore: number
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'transferred'
  mitigation: {
    strategy: string
    actions: string[]
    responsible: string
    deadline: string
    budget: number
  }
  residualRisk: number
}

interface ComplianceReport {
  id: string
  title: string
  type: 'overview' | 'framework' | 'audit' | 'risk' | 'gap_analysis'
  generatedDate: string
  period: {
    start: string
    end: string
  }
  frameworks: string[]
  summary: {
    overallScore: number
    compliantFrameworks: number
    totalFrameworks: number
    criticalIssues: number
    recommendations: number
  }
  status: 'draft' | 'final' | 'approved' | 'published'
  recipients: string[]
}

const ComplianceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Dados mock para demonstração
  const [complianceFrameworks] = useState<ComplianceFramework[]>([
    {
      id: '1',
      name: 'LGPD',
      fullName: 'Lei Geral de Proteção de Dados',
      type: 'regulation',
      category: 'data_protection',
      jurisdiction: 'brazil',
      status: 'compliant',
      score: 95,
      lastAssessment: '2025-01-10T00:00:00Z',
      nextReview: '2025-04-10T00:00:00Z',
      requirements: [],
      penalties: {
        financial: 'Até 2% do faturamento ou R$ 50 milhões',
        operational: 'Suspensão das atividades',
        reputational: 'Publicização da infração'
      },
      implementation: {
        completed: 47,
        total: 50,
        inProgress: 2,
        notStarted: 1
      },
      documentation: ['Política de Privacidade', 'Registro de Atividades', 'DPO Designation'],
      responsible: 'Maria Santos - DPO',
      auditor: 'Auditoria Externa LGPD Ltda'
    },
    {
      id: '2',
      name: 'ISO 27001',
      fullName: 'ISO/IEC 27001:2013 - Sistema de Gestão de Segurança da Informação',
      type: 'standard',
      category: 'security',
      jurisdiction: 'global',
      status: 'in_progress',
      score: 88,
      lastAssessment: '2025-01-05T00:00:00Z',
      nextReview: '2025-07-05T00:00:00Z',
      requirements: [],
      penalties: {
        financial: 'Perda de certificação',
        operational: 'Impacto na confiança do cliente',
        reputational: 'Perda de vantagem competitiva'
      },
      implementation: {
        completed: 102,
        total: 114,
        inProgress: 8,
        notStarted: 4
      },
      documentation: ['ISMS Policy', 'Risk Assessment', 'SoA'],
      responsible: 'João Silva - CISO',
      auditor: 'Certificadora ISO Internacional'
    },
    {
      id: '3',
      name: 'SOC 2',
      fullName: 'Service Organization Control 2',
      type: 'standard',
      category: 'security',
      jurisdiction: 'us',
      status: 'compliant',
      score: 92,
      lastAssessment: '2024-12-15T00:00:00Z',
      nextReview: '2025-12-15T00:00:00Z',
      requirements: [],
      penalties: {
        financial: 'Perda de contratos',
        operational: 'Restrições de mercado',
        reputational: 'Perda de confiança'
      },
      implementation: {
        completed: 68,
        total: 72,
        inProgress: 3,
        notStarted: 1
      },
      documentation: ['SOC 2 Report', 'Control Documentation', 'Testing Evidence'],
      responsible: 'Ana Costa - Compliance Manager',
      auditor: 'Big Four Auditing Firm'
    },
    {
      id: '4',
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      type: 'regulation',
      category: 'data_protection',
      jurisdiction: 'eu',
      status: 'compliant',
      score: 91,
      lastAssessment: '2025-01-08T00:00:00Z',
      nextReview: '2025-04-08T00:00:00Z',
      requirements: [],
      penalties: {
        financial: 'Até 4% do faturamento global ou €20 milhões',
        operational: 'Suspensão do processamento',
        reputational: 'Publicização das infrações'
      },
      implementation: {
        completed: 82,
        total: 88,
        inProgress: 4,
        notStarted: 2
      },
      documentation: ['Privacy Policy', 'DPIA', 'Data Mapping'],
      responsible: 'Maria Santos - DPO',
      auditor: 'EU Data Protection Authority'
    },
    {
      id: '5',
      name: 'PCI DSS',
      fullName: 'Payment Card Industry Data Security Standard',
      type: 'standard',
      category: 'financial',
      jurisdiction: 'global',
      status: 'non_compliant',
      score: 78,
      lastAssessment: '2024-12-20T00:00:00Z',
      nextReview: '2025-03-20T00:00:00Z',
      requirements: [],
      penalties: {
        financial: 'Multas de US$ 5.000 a US$ 100.000/mês',
        operational: 'Suspensão do processamento de cartões',
        reputational: 'Perda de credibilidade'
      },
      implementation: {
        completed: 234,
        total: 300,
        inProgress: 45,
        notStarted: 21
      },
      documentation: ['SAQ', 'Network Diagram', 'Vulnerability Scans'],
      responsible: 'Carlos Oliveira - Payment Security',
      auditor: 'QSA Certified Auditor'
    }
  ])

  const [complianceAudits] = useState<ComplianceAudit[]>([
    {
      id: '1',
      frameworkId: '1',
      type: 'external',
      auditor: 'Auditoria Externa LGPD Ltda',
      startDate: '2025-01-05T00:00:00Z',
      endDate: '2025-01-15T00:00:00Z',
      status: 'completed',
      findings: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 8
      },
      score: 95,
      recommendations: [
        'Implementar sistema de backup automatizado',
        'Revisar política de retenção de dados',
        'Treinar equipe sobre novos procedimentos'
      ],
      actionPlan: [
        'Configurar backup automático até 31/01',
        'Atualizar política até 15/02',
        'Realizar treinamento até 28/02'
      ],
      nextAudit: '2025-04-10T00:00:00Z',
      certification: {
        issued: true,
        validUntil: '2026-01-15T00:00:00Z',
        certificate: 'LGPD-CERT-2025-001'
      }
    },
    {
      id: '2',
      frameworkId: '2',
      type: 'certification',
      auditor: 'Certificadora ISO Internacional',
      startDate: '2025-01-20T00:00:00Z',
      endDate: '2025-02-05T00:00:00Z',
      status: 'planned',
      findings: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      score: 0,
      recommendations: [],
      actionPlan: [],
      nextAudit: '2026-01-20T00:00:00Z',
      certification: {
        issued: false,
        validUntil: '',
        certificate: ''
      }
    }
  ])

  // Dados para gráficos
  const complianceScoreData = [
    { month: 'Jul', lgpd: 88, iso27001: 82, soc2: 89, gdpr: 86, pci: 72 },
    { month: 'Ago', lgpd: 91, iso27001: 84, soc2: 90, gdpr: 88, pci: 74 },
    { month: 'Set', lgpd: 93, iso27001: 86, soc2: 91, gdpr: 89, pci: 76 },
    { month: 'Out', lgpd: 94, iso27001: 87, soc2: 92, gdpr: 90, pci: 77 },
    { month: 'Nov', lgpd: 95, iso27001: 88, soc2: 92, gdpr: 91, pci: 78 },
    { month: 'Dez', lgpd: 95, iso27001: 88, soc2: 92, gdpr: 91, pci: 78 }
  ]

  const complianceStatusData = [
    { name: 'Compliant', value: 60, color: '#10b981' },
    { name: 'In Progress', value: 25, color: '#f59e0b' },
    { name: 'Non-Compliant', value: 10, color: '#ef4444' },
    { name: 'Not Applicable', value: 5, color: '#6b7280' }
  ]

  const riskDistributionData = [
    { category: 'Operacional', low: 45, medium: 23, high: 12, critical: 3 },
    { category: 'Financeiro', low: 38, medium: 28, high: 15, critical: 5 },
    { category: 'Legal', low: 42, medium: 25, high: 18, critical: 8 },
    { category: 'Reputacional', low: 35, medium: 32, high: 20, critical: 6 },
    { category: 'Estratégico', low: 40, medium: 30, high: 16, critical: 4 }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
      case 'planned':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'non_compliant':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'not_applicable':
      case 'final':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'regulation': return Scale
      case 'standard': return Award
      case 'certification': return Shield
      case 'policy': return FileText
      default: return FileCheck
    }
  }

  const getJurisdictionFlag = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'brazil': return '🇧🇷'
      case 'eu': return '🇪🇺'
      case 'us': return '🇺🇸'
      case 'global': return '🌍'
      default: return '🏴'
    }
  }

  const calculateOverallScore = () => {
    const scores = complianceFrameworks.map(f => f.score)
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  const getCompliantCount = () => {
    return complianceFrameworks.filter(f => f.status === 'compliant').length
  }

  const getCriticalIssues = () => {
    return complianceAudits.reduce((sum, audit) => sum + audit.findings.critical + audit.findings.high, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Compliance</h1>
          <p className="text-gray-600">Gestão de conformidade e regulamentações</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsReportModalOpen(!isReportModalOpen)}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs de Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
                <Award className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateOverallScore()}%
                </div>
                <p className="text-xs text-gray-600">
                  +2% vs mês anterior
                </p>
                <Progress value={calculateOverallScore()} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frameworks Conformes</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {getCompliantCount()}/{complianceFrameworks.length}
                </div>
                <p className="text-xs text-gray-600">
                  {((getCompliantCount() / complianceFrameworks.length) * 100).toFixed(0)}% conformidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questões Críticas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {getCriticalIssues()}
                </div>
                <p className="text-xs text-gray-600">
                  Requerem ação imediata
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas Auditorias</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {complianceAudits.filter(a => a.status === 'planned').length}
                </div>
                <p className="text-xs text-gray-600">
                  Próximos 30 dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Score de Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução dos Scores de Compliance</CardTitle>
              <CardDescription>Pontuação por framework ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={complianceScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="lgpd" stroke="#10b981" strokeWidth={3} name="LGPD" />
                  <Line type="monotone" dataKey="iso27001" stroke="#3b82f6" strokeWidth={3} name="ISO 27001" />
                  <Line type="monotone" dataKey="soc2" stroke="#8b5cf6" strokeWidth={3} name="SOC 2" />
                  <Line type="monotone" dataKey="gdpr" stroke="#f59e0b" strokeWidth={3} name="GDPR" />
                  <Line type="monotone" dataKey="pci" stroke="#ef4444" strokeWidth={3} name="PCI DSS" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status de Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Compliance</CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={complianceStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {complianceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Riscos */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Riscos</CardTitle>
                <CardDescription>Riscos por categoria e severidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="low" stackId="a" fill="#3b82f6" name="Baixo" />
                    <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Médio" />
                    <Bar dataKey="high" stackId="a" fill="#ef4444" name="Alto" />
                    <Bar dataKey="critical" stackId="a" fill="#991b1b" name="Crítico" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Frameworks Prioritários */}
          <Card>
            <CardHeader>
              <CardTitle>Frameworks Prioritários</CardTitle>
              <CardDescription>Frameworks que requerem atenção imediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {complianceFrameworks
                  .filter(f => f.status === 'non_compliant' || f.score < 85)
                  .map((framework) => {
                    const FrameworkIcon = getFrameworkIcon(framework.type)
                    const progress = (framework.implementation.completed / framework.implementation.total) * 100
                    
                    return (
                      <div key={framework.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getJurisdictionFlag(framework.jurisdiction)}</span>
                            <FrameworkIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{framework.name}</h4>
                            <p className="text-sm text-gray-600">{framework.fullName}</p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(framework.status)}>
                              {framework.status}
                            </Badge>
                            <span className="text-lg font-bold">{framework.score}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={progress} className="w-24 h-2" />
                            <span className="text-xs text-gray-500">
                              {framework.implementation.completed}/{framework.implementation.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Ações</CardTitle>
              <CardDescription>Tarefas urgentes de compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">PCI DSS - Implementação de criptografia</p>
                      <p className="text-sm text-gray-600">Prazo: 31/01/2025</p>
                    </div>
                  </div>
                  <Button size="sm">Visualizar</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">ISO 27001 - Auditoria de certificação</p>
                      <p className="text-sm text-gray-600">Início: 20/01/2025</p>
                    </div>
                  </div>
                  <Button size="sm">Preparar</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">LGPD - Revisão trimestral</p>
                      <p className="text-sm text-gray-600">Agendado: 10/04/2025</p>
                    </div>
                  </div>
                  <Button size="sm">Agendar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          {/* Lista de Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle>Frameworks de Compliance</CardTitle>
              <CardDescription>Gerenciamento de frameworks e regulamentações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar frameworks..." title="Buscar frameworks" />
                  <Select 
                    title="Filtrar por categoria"
                    options={[
                      { value: 'all', label: 'Todas as Categorias' },
                      { value: 'data_protection', label: 'Proteção de Dados' },
                      { value: 'security', label: 'Segurança' },
                      { value: 'quality', label: 'Qualidade' },
                      { value: 'financial', label: 'Financeiro' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'compliant', label: 'Conforme' },
                      { value: 'in_progress', label: 'Em Progresso' },
                      { value: 'non_compliant', label: 'Não Conforme' }
                    ]}
                  />
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                <div className="grid gap-6">
                  {complianceFrameworks.map((framework) => {
                    const FrameworkIcon = getFrameworkIcon(framework.type)
                    const progress = (framework.implementation.completed / framework.implementation.total) * 100
                    
                    return (
                      <Card key={framework.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getJurisdictionFlag(framework.jurisdiction)}</span>
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <FrameworkIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-xl">{framework.name}</h3>
                                <p className="text-gray-600">{framework.fullName}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge>{framework.type}</Badge>
                                  <Badge variant="secondary">{framework.category}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getStatusColor(framework.status)}>
                                  {framework.status}
                                </Badge>
                              </div>
                              <div className={`text-3xl font-bold ${
                                framework.score >= 90 ? 'text-green-600' :
                                framework.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {framework.score}%
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {framework.implementation.completed}
                              </div>
                              <p className="text-sm text-gray-600">Concluídos</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <div className="text-lg font-bold text-yellow-600">
                                {framework.implementation.inProgress}
                              </div>
                              <p className="text-sm text-gray-600">Em Progresso</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <div className="text-lg font-bold text-red-600">
                                {framework.implementation.notStarted}
                              </div>
                              <p className="text-sm text-gray-600">Não Iniciados</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {framework.implementation.total}
                              </div>
                              <p className="text-sm text-gray-600">Total</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Progresso de Implementação:</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={progress} className="flex-1 h-3" />
                                <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Responsável:</span>
                                <span className="ml-2 font-medium">{framework.responsible}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Auditor:</span>
                                <span className="ml-2 font-medium">{framework.auditor}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Última Avaliação:</span>
                                <span className="ml-2 font-medium">{formatDate(framework.lastAssessment)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Próxima Revisão:</span>
                                <span className="ml-2 font-medium">{formatDate(framework.nextReview)}</span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-2">Documentação:</p>
                              <div className="flex flex-wrap gap-2">
                                {framework.documentation.map((doc, index) => (
                                  <Badge key={index} variant="secondary">
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="text-xs text-gray-500">
                                Penalidades: {framework.penalties.financial}
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
                                  <FileText className="h-3 w-3 mr-1" />
                                  Relatório
                                </Button>
                              </div>
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

        <TabsContent value="audits" className="space-y-6">
          {/* Auditorias */}
          <Card>
            <CardHeader>
              <CardTitle>Auditorias de Compliance</CardTitle>
              <CardDescription>Histórico e agendamento de auditorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Select 
                      title="Filtrar por tipo"
                      options={[
                        { value: 'all', label: 'Todos os Tipos' },
                        { value: 'internal', label: 'Interna' },
                        { value: 'external', label: 'Externa' },
                        { value: 'certification', label: 'Certificação' },
                        { value: 'regulatory', label: 'Regulatória' }
                      ]}
                    />
                    <Select 
                      title="Filtrar por status"
                      options={[
                        { value: 'all', label: 'Todos os Status' },
                        { value: 'planned', label: 'Planejada' },
                        { value: 'in_progress', label: 'Em Andamento' },
                        { value: 'completed', label: 'Concluída' }
                      ]}
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Auditoria
                  </Button>
                </div>

                <div className="grid gap-4">
                  {complianceAudits.map((audit) => {
                    const framework = complianceFrameworks.find(f => f.id === audit.frameworkId)
                    if (!framework) return null
                    
                    return (
                      <Card key={audit.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Auditoria {framework.name} - {audit.type}
                              </h3>
                              <p className="text-gray-600">Auditor: {audit.auditor}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(audit.startDate)} - {formatDate(audit.endDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(audit.status)}>
                                {audit.status}
                              </Badge>
                              {audit.score > 0 && (
                                <div className={`text-2xl font-bold mt-2 ${
                                  audit.score >= 90 ? 'text-green-600' :
                                  audit.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {audit.score}%
                                </div>
                              )}
                            </div>
                          </div>

                          {audit.status === 'completed' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-lg font-bold text-red-600">
                                  {audit.findings.critical}
                                </div>
                                <p className="text-sm text-gray-600">Críticos</p>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600">
                                  {audit.findings.high}
                                </div>
                                <p className="text-sm text-gray-600">Altos</p>
                              </div>
                              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <div className="text-lg font-bold text-yellow-600">
                                  {audit.findings.medium}
                                </div>
                                <p className="text-sm text-gray-600">Médios</p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">
                                  {audit.findings.low}
                                </div>
                                <p className="text-sm text-gray-600">Baixos</p>
                              </div>
                            </div>
                          )}

                          {audit.recommendations.length > 0 && (
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Recomendações:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {audit.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600 mb-2">Plano de Ação:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {audit.actionPlan.map((action, index) => (
                                    <li key={index}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {audit.certification.issued && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Award className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-800">
                                    Certificação Emitida: {audit.certification.certificate}
                                  </p>
                                  <p className="text-sm text-green-600">
                                    Válida até: {formatDate(audit.certification.validUntil)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              Próxima auditoria: {formatDate(audit.nextAudit)}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Relatório
                              </Button>
                              {audit.status === 'planned' && (
                                <Button variant="secondary" size="sm">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                              )}
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

        <TabsContent value="risks" className="space-y-6">
          {/* Gestão de Riscos */}
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Riscos de Compliance</CardTitle>
              <CardDescription>Identificação, avaliação e mitigação de riscos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Riscos Identificados</h4>
                    <div className="text-3xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Riscos Críticos</h4>
                    <div className="text-3xl font-bold text-red-600">3</div>
                    <div className="text-sm text-gray-600">Requerem ação imediata</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Riscos Mitigados</h4>
                    <div className="text-3xl font-bold text-green-600">38</div>
                    <div className="text-sm text-gray-600">80% do total</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Riscos por Categoria</h4>
                  <div className="grid gap-4">
                    {[
                      {
                        category: 'Operacional',
                        description: 'Falhas em processos operacionais que podem impactar compliance',
                        riskLevel: 'medium',
                        count: 12,
                        mitigated: 9
                      },
                      {
                        category: 'Financeiro',
                        description: 'Riscos relacionados a penalidades e multas regulatórias',
                        riskLevel: 'high',
                        count: 8,
                        mitigated: 5
                      },
                      {
                        category: 'Legal',
                        description: 'Não conformidade com leis e regulamentações',
                        riskLevel: 'critical',
                        count: 15,
                        mitigated: 12
                      },
                      {
                        category: 'Reputacional',
                        description: 'Impacto na reputação devido a falhas de compliance',
                        riskLevel: 'high',
                        count: 7,
                        mitigated: 6
                      },
                      {
                        category: 'Estratégico',
                        description: 'Riscos que podem afetar objetivos estratégicos',
                        riskLevel: 'medium',
                        count: 5,
                        mitigated: 4
                      }
                    ].map((risk, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold">{risk.category}</h5>
                            <p className="text-sm text-gray-600">{risk.description}</p>
                          </div>
                          <Badge className={getPriorityColor(risk.riskLevel)}>
                            {risk.riskLevel}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{risk.count}</div>
                            <div className="text-xs text-gray-600">Total</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{risk.mitigated}</div>
                            <div className="text-xs text-gray-600">Mitigados</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600">{risk.count - risk.mitigated}</div>
                            <div className="text-xs text-gray-600">Pendentes</div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Mitigação</span>
                            <span className="text-sm">{((risk.mitigated / risk.count) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={(risk.mitigated / risk.count) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Compliance</CardTitle>
              <CardDescription>Geração e histórico de relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-24 flex-col">
                    <FileCheck className="h-8 w-8 mb-2" />
                    <span>Relatório Executivo</span>
                  </Button>
                  <Button variant="secondary" className="h-24 flex-col">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <span>Dashboard Gerencial</span>
                  </Button>
                  <Button variant="secondary" className="h-24 flex-col">
                    <Target className="h-8 w-8 mb-2" />
                    <span>Gap Analysis</span>
                  </Button>
                  <Button variant="secondary" className="h-24 flex-col">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <span>Relatório de Riscos</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Relatórios Recentes</h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Relatório Executivo Q4 2024',
                        type: 'overview',
                        date: '2025-01-15T00:00:00Z',
                        status: 'published',
                        frameworks: ['LGPD', 'GDPR', 'SOC 2']
                      },
                      {
                        title: 'Gap Analysis ISO 27001',
                        type: 'gap_analysis',
                        date: '2025-01-10T00:00:00Z',
                        status: 'final',
                        frameworks: ['ISO 27001']
                      },
                      {
                        title: 'Auditoria LGPD Janeiro 2025',
                        type: 'audit',
                        date: '2025-01-08T00:00:00Z',
                        status: 'approved',
                        frameworks: ['LGPD']
                      },
                      {
                        title: 'Avaliação de Riscos PCI DSS',
                        type: 'risk',
                        date: '2025-01-05T00:00:00Z',
                        status: 'draft',
                        frameworks: ['PCI DSS']
                      }
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-semibold">{report.title}</h5>
                          <p className="text-sm text-gray-600">
                            Gerado em {formatDate(report.date)} • Frameworks: {report.frameworks.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Button size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download
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

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendário de Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Compliance</CardTitle>
              <CardDescription>Cronograma de auditorias, revisões e prazos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Janeiro 2025</h4>
                    <div className="space-y-3">
                      <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-lg">
                        <p className="font-medium">ISO 27001 Auditoria</p>
                        <p className="text-sm text-gray-600">20-25 Jan</p>
                      </div>
                      <div className="p-3 border-l-4 border-l-green-500 bg-green-50 rounded-lg">
                        <p className="font-medium">LGPD Revisão Trimestral</p>
                        <p className="text-sm text-gray-600">30 Jan</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Fevereiro 2025</h4>
                    <div className="space-y-3">
                      <div className="p-3 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-lg">
                        <p className="font-medium">SOC 2 Type II</p>
                        <p className="text-sm text-gray-600">15 Fev</p>
                      </div>
                      <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50 rounded-lg">
                        <p className="font-medium">GDPR Assessment</p>
                        <p className="text-sm text-gray-600">28 Fev</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Março 2025</h4>
                    <div className="space-y-3">
                      <div className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                        <p className="font-medium">PCI DSS Compliance</p>
                        <p className="text-sm text-gray-600">15 Mar</p>
                      </div>
                      <div className="p-3 border-l-4 border-l-orange-500 bg-orange-50 rounded-lg">
                        <p className="font-medium">Relatório Anual</p>
                        <p className="text-sm text-gray-600">31 Mar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Próximos Prazos Críticos</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">PCI DSS - Implementação de criptografia</p>
                          <p className="text-sm text-gray-600">Prazo em 16 dias</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Crítico</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">ISO 27001 - Preparação para auditoria</p>
                          <p className="text-sm text-gray-600">Início em 5 dias</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Importante</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">LGPD - Revisão da política de privacidade</p>
                          <p className="text-sm text-gray-600">Prazo em 30 dias</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
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

export default ComplianceManager
