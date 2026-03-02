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
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  UserCheck,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Globe,
  Server,
  Database,
  Network,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Bug,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Users,
  User,
  UserX,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  Router,
  Cloud,
  FileText,
  Camera,
  Mic,
  Volume2,
  VolumeX
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

// Tipos para Security Center
interface SecurityThreat {
  id: string
  type: 'malware' | 'phishing' | 'ddos' | 'intrusion' | 'data_breach' | 'unauthorized_access' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved'
  timestamp: string
  source: string
  target: string
  description: string
  affectedSystems: string[]
  actionsTaken: string[]
  estimatedDamage: string
  mitigation: {
    automated: boolean
    manualSteps: string[]
    timeToResolve: string
  }
}

interface SecurityEvent {
  id: string
  timestamp: string
  type: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'data_access' | 'system_change' | 'alert'
  user: string
  source: string
  resource: string
  outcome: 'success' | 'failure' | 'blocked'
  riskLevel: 'low' | 'medium' | 'high'
  details: string
  ipAddress: string
  userAgent: string
  location: string
}

interface SecurityPolicy {
  id: string
  name: string
  category: 'access_control' | 'data_protection' | 'network_security' | 'compliance' | 'incident_response'
  description: string
  status: 'active' | 'inactive' | 'draft' | 'review'
  severity: 'mandatory' | 'recommended' | 'optional'
  lastUpdated: string
  compliance: string[]
  rules: {
    condition: string
    action: string
    notification: boolean
  }[]
  violations: number
  effectiveness: number
}

interface VulnerabilityAssessment {
  id: string
  target: string
  type: 'network' | 'application' | 'system' | 'database' | 'cloud'
  timestamp: string
  status: 'scanning' | 'completed' | 'failed'
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
  score: number
  recommendations: string[]
  nextScan: string
}

interface SecurityMetrics {
  overallScore: number
  threatsDetected: number
  threatsBlocked: number
  incidentsResolved: number
  complianceScore: number
  vulnerabilities: {
    total: number
    patched: number
    pending: number
  }
  uptime: number
  responseTime: number
}

const SecurityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedThreat, setSelectedThreat] = useState<SecurityThreat | null>(null)
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)

  // Dados mock para demonstração
  const [securityThreats] = useState<SecurityThreat[]>([
    {
      id: '1',
      type: 'ddos',
      severity: 'high',
      status: 'mitigated',
      timestamp: '2025-01-15T14:30:00Z',
      source: '203.0.113.45',
      target: 'api.onboardingrsv.com',
      description: 'Ataque DDoS detectado com 50,000 requests/segundo',
      affectedSystems: ['API Gateway', 'Load Balancer'],
      actionsTaken: ['Rate limiting ativado', 'IP bloqueado', 'CDN configurado'],
      estimatedDamage: 'Baixo - 5 minutos de latência aumentada',
      mitigation: {
        automated: true,
        manualSteps: ['Análise de logs', 'Verificação de integridade'],
        timeToResolve: '15 minutos'
      }
    },
    {
      id: '2',
      type: 'unauthorized_access',
      severity: 'critical',
      status: 'investigating',
      timestamp: '2025-01-15T13:45:00Z',
      source: '192.168.1.100',
      target: 'Admin Dashboard',
      description: 'Tentativa de acesso não autorizado com credenciais comprometidas',
      affectedSystems: ['Admin Panel', 'User Database'],
      actionsTaken: ['Conta bloqueada', 'Sessões encerradas', 'Logs preservados'],
      estimatedDamage: 'Médio - Dados sensíveis potencialmente expostos',
      mitigation: {
        automated: false,
        manualSteps: ['Investigação forense', 'Reset de senhas', 'Auditoria completa'],
        timeToResolve: '2-4 horas'
      }
    },
    {
      id: '3',
      type: 'malware',
      severity: 'medium',
      status: 'resolved',
      timestamp: '2025-01-15T12:15:00Z',
      source: 'email attachment',
      target: 'Workstation-007',
      description: 'Malware detectado em anexo de email',
      affectedSystems: ['Workstation-007'],
      actionsTaken: ['Arquivo quarentena', 'Scan completo', 'Sistema limpo'],
      estimatedDamage: 'Nenhum - Interceptado antes da execução',
      mitigation: {
        automated: true,
        manualSteps: ['Educação do usuário'],
        timeToResolve: '30 minutos'
      }
    },
    {
      id: '4',
      type: 'phishing',
      severity: 'high',
      status: 'detected',
      timestamp: '2025-01-15T11:30:00Z',
      source: 'external email',
      target: 'Multiple users',
      description: 'Campanha de phishing direcionada detectada',
      affectedSystems: ['Email System', 'User Accounts'],
      actionsTaken: ['Emails bloqueados', 'Usuários notificados'],
      estimatedDamage: 'Baixo - 3 usuários clicaram no link',
      mitigation: {
        automated: true,
        manualSteps: ['Treinamento de segurança', 'Verificação de contas'],
        timeToResolve: '1 hora'
      }
    }
  ])

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: '2025-01-15T14:35:00Z',
      type: 'failed_login',
      user: 'admin@rsv.com',
      source: 'Web Portal',
      resource: 'Admin Dashboard',
      outcome: 'blocked',
      riskLevel: 'high',
      details: 'Múltiplas tentativas de login falhadas',
      ipAddress: '203.0.113.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'São Paulo, BR'
    },
    {
      id: '2',
      timestamp: '2025-01-15T14:20:00Z',
      type: 'login',
      user: 'joao.silva@rsv.com',
      source: 'Mobile App',
      resource: 'User Dashboard',
      outcome: 'success',
      riskLevel: 'low',
      details: 'Login normal com 2FA',
      ipAddress: '192.168.1.50',
      userAgent: 'RSV Mobile App v1.2.0',
      location: 'Caldas Novas, GO'
    },
    {
      id: '3',
      timestamp: '2025-01-15T14:10:00Z',
      type: 'data_access',
      user: 'maria.santos@rsv.com',
      source: 'Web Portal',
      resource: 'Customer Database',
      outcome: 'success',
      riskLevel: 'medium',
      details: 'Acesso a dados sensíveis de clientes',
      ipAddress: '192.168.1.75',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Cuiabá, MT'
    },
    {
      id: '4',
      timestamp: '2025-01-15T13:55:00Z',
      type: 'permission_change',
      user: 'admin@rsv.com',
      source: 'Admin Panel',
      resource: 'User Permissions',
      outcome: 'success',
      riskLevel: 'high',
      details: 'Permissões de usuário alteradas',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Caldas Novas, GO'
    }
  ])

  const [vulnerabilityAssessments] = useState<VulnerabilityAssessment[]>([
    {
      id: '1',
      target: 'Web Application',
      type: 'application',
      timestamp: '2025-01-15T10:00:00Z',
      status: 'completed',
      vulnerabilities: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 12
      },
      score: 85,
      recommendations: [
        'Atualizar biblioteca de autenticação',
        'Implementar Content Security Policy',
        'Revisar validação de entrada'
      ],
      nextScan: '2025-01-22T10:00:00Z'
    },
    {
      id: '2',
      target: 'Network Infrastructure',
      type: 'network',
      timestamp: '2025-01-15T08:00:00Z',
      status: 'completed',
      vulnerabilities: {
        critical: 1,
        high: 3,
        medium: 8,
        low: 15
      },
      score: 78,
      recommendations: [
        'Atualizar firmware dos roteadores',
        'Configurar segmentação de rede',
        'Implementar monitoramento de tráfego'
      ],
      nextScan: '2025-01-29T08:00:00Z'
    },
    {
      id: '3',
      target: 'Database Servers',
      type: 'database',
      timestamp: '2025-01-15T06:00:00Z',
      status: 'completed',
      vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 8
      },
      score: 92,
      recommendations: [
        'Aplicar patches de segurança',
        'Revisar permissões de acesso',
        'Implementar criptografia em trânsito'
      ],
      nextScan: '2025-01-22T06:00:00Z'
    }
  ])

  // Dados para gráficos
  const securityMetricsData = [
    { time: '00:00', threats: 12, blocked: 11, resolved: 10 },
    { time: '04:00', threats: 8, blocked: 8, resolved: 7 },
    { time: '08:00', threats: 25, blocked: 23, resolved: 20 },
    { time: '12:00', threats: 45, blocked: 42, resolved: 38 },
    { time: '16:00', threats: 38, blocked: 35, resolved: 32 },
    { time: '20:00', threats: 22, blocked: 20, resolved: 18 }
  ]

  const threatTypesData = [
    { name: 'DDoS', value: 35, color: '#ef4444' },
    { name: 'Malware', value: 25, color: '#f97316' },
    { name: 'Phishing', value: 20, color: '#eab308' },
    { name: 'Intrusion', value: 15, color: '#3b82f6' },
    { name: 'Data Breach', value: 5, color: '#8b5cf6' }
  ]

  const complianceScoreData = [
    { framework: 'LGPD', score: 95, target: 100 },
    { framework: 'ISO 27001', score: 88, target: 95 },
    { framework: 'SOC 2', score: 82, target: 90 },
    { framework: 'GDPR', score: 91, target: 100 },
    { framework: 'PCI DSS', score: 78, target: 85 }
  ]

  const securityMetrics: SecurityMetrics = {
    overallScore: 87,
    threatsDetected: 156,
    threatsBlocked: 142,
    incidentsResolved: 98,
    complianceScore: 89,
    vulnerabilities: {
      total: 89,
      patched: 67,
      pending: 22
    },
    uptime: 99.8,
    responseTime: 2.3
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'success':
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'investigating':
      case 'scanning':
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      case 'detected':
      case 'failure':
      case 'blocked':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'mitigated':
      case 'draft':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'malware': return Bug
      case 'phishing': return Mail
      case 'ddos': return Zap
      case 'intrusion': return ShieldAlert
      case 'data_breach': return Database
      case 'unauthorized_access': return UserX
      case 'suspicious_activity': return Eye
      default: return AlertTriangle
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return User
      case 'logout': return UserX
      case 'failed_login': return XCircle
      case 'permission_change': return Key
      case 'data_access': return Database
      case 'system_change': return Settings
      case 'alert': return AlertTriangle
      default: return Activity
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Segurança</h1>
          <p className="text-gray-600">Monitoramento e gestão de segurança avançada</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsIncidentModalOpen(!isIncidentModalOpen)}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reportar Incidente
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="threats">Ameaças</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs de Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score de Segurança</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {securityMetrics.overallScore}%
                </div>
                <p className="text-xs text-gray-600">
                  +3% vs semana anterior
                </p>
                <Progress value={securityMetrics.overallScore} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ameaças Detectadas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(securityMetrics.threatsDetected)}
                </div>
                <p className="text-xs text-gray-600">
                  {formatNumber(securityMetrics.threatsBlocked)} bloqueadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {securityMetrics.complianceScore}%
                </div>
                <p className="text-xs text-gray-600">
                  5 frameworks ativos
                </p>
                <Progress value={securityMetrics.complianceScore} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
                <Bug className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {securityMetrics.vulnerabilities.pending}
                </div>
                <p className="text-xs text-gray-600">
                  {securityMetrics.vulnerabilities.patched} corrigidas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Métricas de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Segurança</CardTitle>
              <CardDescription>Ameaças detectadas e resolvidas nas últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={securityMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="threats" stackId="1" stroke="#ef4444" fill="#ef4444" name="Detectadas" />
                  <Area type="monotone" dataKey="blocked" stackId="2" stroke="#10b981" fill="#10b981" name="Bloqueadas" />
                  <Area type="monotone" dataKey="resolved" stackId="3" stroke="#3b82f6" fill="#3b82f6" name="Resolvidas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tipos de Ameaças */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Ameaças</CardTitle>
                <CardDescription>Distribuição das ameaças detectadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={threatTypesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {threatTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score de Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Score de Compliance</CardTitle>
                <CardDescription>Conformidade com frameworks de segurança</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={complianceScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="framework" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" name="Atual" />
                    <Bar dataKey="target" fill="#10b981" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ameaças Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Ameaças Críticas Recentes</CardTitle>
              <CardDescription>Incidentes de segurança que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityThreats
                  .filter(threat => threat.severity === 'critical' || threat.severity === 'high')
                  .slice(0, 3)
                  .map((threat) => {
                    const ThreatIcon = getThreatIcon(threat.type)
                    
                    return (
                      <div key={threat.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <ThreatIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{threat.description}</h4>
                            <p className="text-sm text-gray-600">
                              Origem: {threat.source} → Destino: {threat.target}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getSeverityColor(threat.severity)}>
                                {threat.severity}
                              </Badge>
                              <Badge className={getStatusColor(threat.status)}>
                                {threat.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(threat.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Estado atual dos componentes de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Proteção Ativa</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Firewall', status: 'active', icon: Shield },
                      { name: 'Antivírus', status: 'active', icon: ShieldCheck },
                      { name: 'IDS/IPS', status: 'active', icon: Eye },
                      { name: 'WAF', status: 'active', icon: Globe }
                    ].map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <component.icon className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{component.name}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Monitoramento</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'SIEM', status: 'active', value: '99.8%' },
                      { name: 'Log Analysis', status: 'active', value: '2.3M/day' },
                      { name: 'Threat Intel', status: 'active', value: 'Updated' },
                      { name: 'Vulnerability Scan', status: 'active', value: 'Daily' }
                    ].map((monitor, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{monitor.name}</span>
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{monitor.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Compliance</h4>
                  <div className="space-y-3">
                    {complianceScoreData.slice(0, 4).map((compliance, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{compliance.framework}</span>
                          <span className="text-sm font-bold">{compliance.score}%</span>
                        </div>
                        <Progress value={compliance.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          {/* Lista de Ameaças */}
          <Card>
            <CardHeader>
              <CardTitle>Ameaças de Segurança</CardTitle>
              <CardDescription>Monitoramento e gerenciamento de ameaças detectadas</CardDescription>
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
                      { value: 'detected', label: 'Detectada' },
                      { value: 'investigating', label: 'Investigando' },
                      { value: 'mitigated', label: 'Mitigada' },
                      { value: 'resolved', label: 'Resolvida' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="space-y-4">
                  {securityThreats.map((threat) => {
                    const ThreatIcon = getThreatIcon(threat.type)
                    
                    return (
                      <Card key={threat.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                threat.severity === 'critical' ? 'bg-red-100' :
                                threat.severity === 'high' ? 'bg-orange-100' :
                                threat.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                              }`}>
                                <ThreatIcon className={`h-6 w-6 ${
                                  threat.severity === 'critical' ? 'text-red-600' :
                                  threat.severity === 'high' ? 'text-orange-600' :
                                  threat.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{threat.description}</h3>
                                <p className="text-gray-600">ID: {threat.id} • Tipo: {threat.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(threat.severity)}>
                                {threat.severity}
                              </Badge>
                              <Badge className={getStatusColor(threat.status)}>
                                {threat.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Origem</p>
                              <p className="font-medium">{threat.source}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Destino</p>
                              <p className="font-medium">{threat.target}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Detectado em</p>
                              <p className="font-medium">{formatDateTime(threat.timestamp)}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Sistemas Afetados:</p>
                              <div className="flex flex-wrap gap-2">
                                {threat.affectedSystems.map((system, index) => (
                                  <Badge key={index} variant="secondary">
                                    {system}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-2">Ações Tomadas:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {threat.actionsTaken.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Dano Estimado:</p>
                                <p className="text-sm font-medium">{threat.estimatedDamage}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Tempo para Resolver:</p>
                                <p className="text-sm font-medium">{threat.mitigation.timeToResolve}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex items-center space-x-2">
                                <Badge className={threat.mitigation.automated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {threat.mitigation.automated ? 'Automático' : 'Manual'}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Detalhes
                                </Button>
                                <Button variant="secondary" size="sm">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Investigar
                                </Button>
                                {threat.status !== 'resolved' && (
                                  <Button size="sm">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolver
                                  </Button>
                                )}
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

        <TabsContent value="events" className="space-y-6">
          {/* Eventos de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Segurança</CardTitle>
              <CardDescription>Log de eventos e atividades do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar eventos..." title="Buscar eventos" />
                  <Select 
                    title="Filtrar por tipo"
                    options={[
                      { value: 'all', label: 'Todos os Tipos' },
                      { value: 'login', label: 'Login' },
                      { value: 'logout', label: 'Logout' },
                      { value: 'failed_login', label: 'Login Falhado' },
                      { value: 'permission_change', label: 'Mudança de Permissão' },
                      { value: 'data_access', label: 'Acesso a Dados' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por risco"
                    options={[
                      { value: 'all', label: 'Todos os Riscos' },
                      { value: 'high', label: 'Alto Risco' },
                      { value: 'medium', label: 'Médio Risco' },
                      { value: 'low', label: 'Baixo Risco' }
                    ]}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Timestamp</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Usuário</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Recurso</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Resultado</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Risco</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Localização</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityEvents.map((event) => {
                        const EventIcon = getEventIcon(event.type)
                        
                        return (
                          <tr key={event.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              {formatDateTime(event.timestamp)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <EventIcon className="h-4 w-4 text-gray-600" />
                                <span className="text-sm">{event.type}</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              {event.user}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              {event.resource}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge className={getStatusColor(event.outcome)}>
                                {event.outcome}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge className={getRiskColor(event.riskLevel)}>
                                {event.riskLevel}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              {event.location}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Button size="sm" variant="secondary">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-6">
          {/* Avaliações de Vulnerabilidade */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações de Vulnerabilidade</CardTitle>
              <CardDescription>Scans automáticos e análise de vulnerabilidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {vulnerabilityAssessments.map((assessment) => (
                  <Card key={assessment.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{assessment.target}</h3>
                          <p className="text-gray-600">Tipo: {assessment.type} • Score: {assessment.score}/100</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              assessment.score >= 90 ? 'text-green-600' :
                              assessment.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {assessment.score}
                            </div>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            {assessment.vulnerabilities.critical}
                          </div>
                          <p className="text-sm text-gray-600">Críticas</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">
                            {assessment.vulnerabilities.high}
                          </div>
                          <p className="text-sm text-gray-600">Altas</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">
                            {assessment.vulnerabilities.medium}
                          </div>
                          <p className="text-sm text-gray-600">Médias</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {assessment.vulnerabilities.low}
                          </div>
                          <p className="text-sm text-gray-600">Baixas</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Recomendações:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {assessment.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-sm text-gray-600">
                            <span>Último scan: {formatDateTime(assessment.timestamp)}</span>
                            <span className="mx-2">•</span>
                            <span>Próximo scan: {formatDateTime(assessment.nextScan)}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Escanear Agora
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Relatório
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          {/* Políticas de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Segurança</CardTitle>
              <CardDescription>Gerenciamento de políticas e regras de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Buscar políticas..." title="Buscar políticas" />
                    <Select 
                      title="Filtrar por categoria"
                      options={[
                        { value: 'all', label: 'Todas as Categorias' },
                        { value: 'access_control', label: 'Controle de Acesso' },
                        { value: 'data_protection', label: 'Proteção de Dados' },
                        { value: 'network_security', label: 'Segurança de Rede' },
                        { value: 'compliance', label: 'Compliance' }
                      ]}
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Política
                  </Button>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      name: 'Política de Senhas Fortes',
                      category: 'access_control',
                      status: 'active',
                      violations: 3,
                      effectiveness: 94,
                      description: 'Exigir senhas com pelo menos 12 caracteres, incluindo maiúsculas, minúsculas, números e símbolos'
                    },
                    {
                      name: 'Autenticação Multifator',
                      category: 'access_control',
                      status: 'active',
                      violations: 0,
                      effectiveness: 99,
                      description: 'Exigir 2FA para todos os acessos administrativos e dados sensíveis'
                    },
                    {
                      name: 'Criptografia de Dados',
                      category: 'data_protection',
                      status: 'active',
                      violations: 1,
                      effectiveness: 97,
                      description: 'Todos os dados sensíveis devem ser criptografados em repouso e em trânsito'
                    },
                    {
                      name: 'Bloqueio de IPs Suspeitos',
                      category: 'network_security',
                      status: 'active',
                      violations: 8,
                      effectiveness: 89,
                      description: 'Bloquear automaticamente IPs com comportamento suspeito ou múltiplas falhas de login'
                    }
                  ].map((policy, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{policy.name}</h3>
                          <p className="text-sm text-gray-600">{policy.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Categoria</p>
                          <p className="font-medium capitalize">{policy.category.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Violações</p>
                          <p className="font-medium text-red-600">{policy.violations}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Efetividade</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={policy.effectiveness} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{policy.effectiveness}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Settings className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="secondary">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Relatório
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoramento em Tempo Real */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>Visibilidade completa da segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold mb-1">Eventos/min</h4>
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <Progress value={82} className="mt-2 h-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold mb-1">Proteção Ativa</h4>
                  <div className="text-2xl font-bold text-green-600">99.8%</div>
                  <Progress value={99.8} className="mt-2 h-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-semibold mb-1">Alertas Ativos</h4>
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <Progress value={30} className="mt-2 h-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tráfego de Rede</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={securityMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="threats" stroke="#3b82f6" fill="#3b82f6" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CPU e Memória</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">CPU</span>
                          <span className="text-sm">45%</span>
                        </div>
                        <Progress value={45} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Memória</span>
                          <span className="text-sm">67%</span>
                        </div>
                        <Progress value={67} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Disco</span>
                          <span className="text-sm">23%</span>
                        </div>
                        <Progress value={23} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Rede</span>
                          <span className="text-sm">78%</span>
                        </div>
                        <Progress value={78} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Logs em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-auto">
                    <div className="space-y-1">
                      <div>[2025-01-15 14:35:42] <span className="text-blue-400">INFO</span> security: Firewall rule updated successfully</div>
                      <div>[2025-01-15 14:35:41] <span className="text-yellow-400">WARN</span> ids: Suspicious activity detected from IP 203.0.113.45</div>
                      <div>[2025-01-15 14:35:40] <span className="text-red-400">ALERT</span> auth: Failed login attempt for admin@rsv.com</div>
                      <div>[2025-01-15 14:35:39] <span className="text-blue-400">INFO</span> antivirus: Scheduled scan completed - 0 threats found</div>
                      <div>[2025-01-15 14:35:38] <span className="text-green-400">SUCCESS</span> backup: Security configuration backup created</div>
                      <div>[2025-01-15 14:35:37] <span className="text-yellow-400">WARN</span> compliance: LGPD audit requirement approaching deadline</div>
                      <div>[2025-01-15 14:35:36] <span className="text-blue-400">INFO</span> monitoring: System health check completed</div>
                      <div>[2025-01-15 14:35:35] <span className="text-red-400">ALERT</span> network: DDoS attack mitigated automatically</div>
                      <div>[2025-01-15 14:35:34] <span className="text-blue-400">INFO</span> encryption: Database encryption key rotated</div>
                      <div>[2025-01-15 14:35:33] <span className="text-green-400">SUCCESS</span> patch: Security update applied to all systems</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityCenter
