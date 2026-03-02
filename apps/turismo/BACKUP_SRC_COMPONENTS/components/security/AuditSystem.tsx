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
  FileSearch,
  Activity,
  Eye,
  Clock,
  Calendar,
  User,
  Users,
  Database,
  Server,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Globe,
  Laptop,
  Smartphone,
  Monitor,
  Building,
  MapPin,
  Phone,
  Mail,
  Key,
  Lock,
  Unlock,
  Fingerprint,
  Code,
  FileText,
  Archive,
  Trash2,
  Plus,
  Edit,
  ExternalLink,
  Router,
  Cloud,
  HardDrive,
  Cpu,
  Memory,
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
  Scatter
} from 'recharts'

// Tipos para Audit System
interface AuditLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'critical' | 'debug'
  category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'security' | 'compliance' | 'user_action'
  event: string
  description: string
  userId?: string
  userName?: string
  sessionId?: string
  ipAddress: string
  userAgent?: string
  location?: string
  resource: string
  action: string
  outcome: 'success' | 'failure' | 'blocked' | 'error'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  metadata: Record<string, any>
  tags: string[]
  correlationId?: string
  parentLogId?: string
  duration?: number
  responseCode?: number
  dataSize?: number
}

interface AuditRule {
  id: string
  name: string
  description: string
  category: 'compliance' | 'security' | 'performance' | 'business' | 'custom'
  conditions: {
    field: string
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex'
    value: string
  }[]
  actions: {
    type: 'alert' | 'block' | 'log' | 'notify' | 'escalate'
    parameters: Record<string, any>
  }[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  createdBy: string
  createdAt: string
  lastTriggered?: string
  triggerCount: number
}

interface AuditReport {
  id: string
  title: string
  type: 'summary' | 'detailed' | 'compliance' | 'security' | 'performance' | 'custom'
  period: {
    start: string
    end: string
  }
  filters: Record<string, any>
  status: 'generating' | 'completed' | 'failed' | 'scheduled'
  generatedAt?: string
  generatedBy: string
  fileSize?: number
  format: 'pdf' | 'csv' | 'json' | 'excel'
  downloadUrl?: string
  recipients: string[]
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    nextRun: string
  }
}

interface AuditAlert {
  id: string
  ruleId: string
  ruleName: string
  logId: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  title: string
  description: string
  affectedResources: string[]
  recommendedActions: string[]
  metadata: Record<string, any>
  escalatedAt?: string
  resolvedAt?: string
  notes: string[]
}

interface AuditMetrics {
  totalLogs: number
  logsToday: number
  alertsOpen: number
  complianceScore: number
  securityIncidents: number
  failedAttempts: number
  topRisks: string[]
  performanceMetrics: {
    avgResponseTime: number
    errorRate: number
    uptime: number
  }
}

const AuditSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Dados mock para demonstração
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2025-01-15T14:35:42Z',
      level: 'info',
      category: 'authentication',
      event: 'user_login',
      description: 'Usuário realizou login com sucesso',
      userId: 'user_001',
      userName: 'João Silva',
      sessionId: 'sess_001',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Caldas Novas, GO',
      resource: 'auth_service',
      action: 'login',
      outcome: 'success',
      riskLevel: 'low',
      metadata: {
        authMethod: 'mfa',
        deviceId: 'dev_001',
        loginAttempts: 1
      },
      tags: ['authentication', 'success'],
      duration: 1200,
      responseCode: 200
    },
    {
      id: '2',
      timestamp: '2025-01-15T14:34:15Z',
      level: 'warn',
      category: 'security',
      event: 'suspicious_activity',
      description: 'Múltiplas tentativas de login falhadas detectadas',
      userId: 'user_002',
      userName: 'Maria Santos',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'São Paulo, SP',
      resource: 'auth_service',
      action: 'login_attempt',
      outcome: 'blocked',
      riskLevel: 'high',
      metadata: {
        attemptCount: 5,
        timeWindow: '5min',
        blocked: true
      },
      tags: ['security', 'blocked', 'suspicious'],
      duration: 500,
      responseCode: 429
    },
    {
      id: '3',
      timestamp: '2025-01-15T14:32:08Z',
      level: 'error',
      category: 'system',
      event: 'database_error',
      description: 'Falha na conexão com banco de dados',
      resource: 'database_service',
      action: 'query_execution',
      outcome: 'error',
      riskLevel: 'critical',
      ipAddress: '10.0.1.5',
      metadata: {
        errorCode: 'DB_CONNECTION_TIMEOUT',
        queryDuration: 30000,
        affectedTables: ['users', 'sessions']
      },
      tags: ['database', 'error', 'critical'],
      duration: 30000,
      responseCode: 500
    },
    {
      id: '4',
      timestamp: '2025-01-15T14:30:22Z',
      level: 'info',
      category: 'data_access',
      event: 'data_export',
      description: 'Usuário exportou relatório de clientes',
      userId: 'user_003',
      userName: 'Carlos Oliveira',
      sessionId: 'sess_003',
      ipAddress: '192.168.1.25',
      location: 'Cuiabá, MT',
      resource: 'reports_service',
      action: 'export',
      outcome: 'success',
      riskLevel: 'medium',
      metadata: {
        reportType: 'customer_data',
        recordCount: 1500,
        format: 'csv'
      },
      tags: ['data_export', 'report', 'compliance'],
      duration: 5000,
      responseCode: 200,
      dataSize: 2048576
    },
    {
      id: '5',
      timestamp: '2025-01-15T14:28:33Z',
      level: 'critical',
      category: 'security',
      event: 'unauthorized_access',
      description: 'Tentativa de acesso não autorizado a dados sensíveis',
      userId: 'user_004',
      userName: 'Ana Costa',
      sessionId: 'sess_004',
      ipAddress: '203.0.113.67',
      location: 'Brasília, DF',
      resource: 'customer_data',
      action: 'access_attempt',
      outcome: 'blocked',
      riskLevel: 'critical',
      metadata: {
        attemptedResource: '/api/customers/sensitive',
        requiredPermission: 'data.admin',
        userPermissions: ['data.read'],
        blockedBy: 'rbac_system'
      },
      tags: ['security', 'unauthorized', 'blocked'],
      duration: 100,
      responseCode: 403
    }
  ])

  const [auditRules] = useState<AuditRule[]>([
    {
      id: '1',
      name: 'Múltiplas Tentativas de Login',
      description: 'Detecta quando um usuário falha no login mais de 5 vezes em 5 minutos',
      category: 'security',
      conditions: [
        { field: 'event', operator: 'equals', value: 'login_attempt' },
        { field: 'outcome', operator: 'equals', value: 'failure' },
        { field: 'count', operator: 'greater_than', value: '5' }
      ],
      actions: [
        { type: 'block', parameters: { duration: '30min' } },
        { type: 'alert', parameters: { severity: 'high' } },
        { type: 'notify', parameters: { recipients: ['security@rsv.com'] } }
      ],
      severity: 'high',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      lastTriggered: '2025-01-15T14:34:15Z',
      triggerCount: 23
    },
    {
      id: '2',
      name: 'Acesso a Dados Sensíveis',
      description: 'Monitora acessos a dados de clientes e informações financeiras',
      category: 'compliance',
      conditions: [
        { field: 'resource', operator: 'contains', value: 'customer_data' },
        { field: 'action', operator: 'equals', value: 'access' }
      ],
      actions: [
        { type: 'log', parameters: { level: 'info' } },
        { type: 'notify', parameters: { recipients: ['dpo@rsv.com'] } }
      ],
      severity: 'medium',
      isActive: true,
      createdBy: 'compliance_manager',
      createdAt: '2024-02-15T00:00:00Z',
      lastTriggered: '2025-01-15T14:30:22Z',
      triggerCount: 456
    },
    {
      id: '3',
      name: 'Acesso Fora do Horário',
      description: 'Detecta acessos fora do horário comercial (18h-8h)',
      category: 'security',
      conditions: [
        { field: 'timestamp', operator: 'regex', value: '(T1[8-9]|T2[0-3]|T0[0-7])' },
        { field: 'userId', operator: 'regex', value: '^(?!admin).*' }
      ],
      actions: [
        { type: 'alert', parameters: { severity: 'medium' } },
        { type: 'log', parameters: { level: 'warn' } }
      ],
      severity: 'medium',
      isActive: true,
      createdBy: 'security_admin',
      createdAt: '2024-03-10T00:00:00Z',
      triggerCount: 78
    }
  ])

  const [auditAlerts] = useState<AuditAlert[]>([
    {
      id: '1',
      ruleId: '1',
      ruleName: 'Múltiplas Tentativas de Login',
      logId: '2',
      timestamp: '2025-01-15T14:34:15Z',
      severity: 'high',
      status: 'open',
      title: 'Múltiplas tentativas de login falhadas',
      description: 'Usuário Maria Santos teve 5 tentativas de login falhadas em 5 minutos',
      affectedResources: ['auth_service'],
      recommendedActions: [
        'Verificar se o usuário esqueceu a senha',
        'Investigar possível tentativa de invasão',
        'Considerar reset de senha obrigatório'
      ],
      metadata: {
        userId: 'user_002',
        ipAddress: '203.0.113.45',
        attemptCount: 5
      },
      notes: []
    },
    {
      id: '2',
      ruleId: '3',
      ruleName: 'Acesso Fora do Horário',
      logId: '5',
      timestamp: '2025-01-15T14:28:33Z',
      severity: 'medium',
      status: 'investigating',
      assignedTo: 'security_analyst',
      title: 'Acesso não autorizado fora do horário',
      description: 'Usuário Ana Costa tentou acessar dados sensíveis fora do horário permitido',
      affectedResources: ['customer_data'],
      recommendedActions: [
        'Confirmar necessidade de acesso',
        'Verificar autorização do supervisor',
        'Revisar permissões do usuário'
      ],
      metadata: {
        userId: 'user_004',
        resource: '/api/customers/sensitive'
      },
      notes: ['Usuário contatado para esclarecimentos', 'Aguardando resposta do supervisor']
    }
  ])

  // Dados para gráficos
  const logVolumeData = [
    { hour: '00:00', total: 1250, errors: 45, warnings: 120, info: 1085 },
    { hour: '04:00', total: 890, errors: 23, warnings: 67, info: 800 },
    { hour: '08:00', total: 3400, errors: 156, warnings: 340, info: 2904 },
    { hour: '12:00', total: 4800, errors: 234, warnings: 480, info: 4086 },
    { hour: '16:00', total: 3900, errors: 189, warnings: 390, info: 3321 },
    { hour: '20:00', total: 2200, errors: 67, warnings: 220, info: 1913 }
  ]

  const categoryDistribution = [
    { name: 'Authentication', value: 35, color: '#3b82f6' },
    { name: 'Data Access', value: 25, color: '#10b981' },
    { name: 'System', value: 20, color: '#f59e0b' },
    { name: 'Security', value: 15, color: '#ef4444' },
    { name: 'Compliance', value: 5, color: '#8b5cf6' }
  ]

  const riskLevelData = [
    { level: 'Low', count: 15678, percentage: 70 },
    { level: 'Medium', count: 4567, percentage: 20 },
    { level: 'High', count: 1890, percentage: 8 },
    { level: 'Critical', count: 445, percentage: 2 }
  ]

  const complianceMetricsData = [
    { framework: 'LGPD', score: 95, logs: 1234 },
    { framework: 'GDPR', score: 92, logs: 987 },
    { framework: 'SOC 2', score: 89, logs: 756 },
    { framework: 'ISO 27001', score: 87, logs: 654 },
    { framework: 'PCI DSS', score: 82, logs: 543 }
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
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warn': return 'bg-yellow-100 text-yellow-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'debug': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failure': return 'bg-red-100 text-red-800'
      case 'blocked': return 'bg-orange-100 text-orange-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'false_positive': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return Key
      case 'authorization': return Shield
      case 'data_access': return Database
      case 'system': return Server
      case 'security': return Shield
      case 'compliance': return FileText
      case 'user_action': return User
      default: return Activity
    }
  }

  const calculateMetrics = (): AuditMetrics => {
    const today = new Date().toISOString().split('T')[0]
    const logsToday = auditLogs.filter(log => log.timestamp.startsWith(today)).length
    
    return {
      totalLogs: auditLogs.length,
      logsToday,
      alertsOpen: auditAlerts.filter(a => a.status === 'open').length,
      complianceScore: 89,
      securityIncidents: auditLogs.filter(log => log.category === 'security' && log.riskLevel === 'critical').length,
      failedAttempts: auditLogs.filter(log => log.outcome === 'failure').length,
      topRisks: ['Acesso não autorizado', 'Falhas de autenticação', 'Violações de dados'],
      performanceMetrics: {
        avgResponseTime: auditLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / auditLogs.length,
        errorRate: (auditLogs.filter(log => log.level === 'error').length / auditLogs.length) * 100,
        uptime: 99.8
      }
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Auditoria</h1>
          <p className="text-gray-600">Monitoramento, logs e análise de auditoria avançada</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsReportModalOpen(!isReportModalOpen)}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs de Auditoria */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
                <FileSearch className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(metrics.totalLogs)}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.logsToday} hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Abertos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.alertsOpen}
                </div>
                <p className="text-xs text-gray-600">
                  Requerem ação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Compliance</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.complianceScore}%
                </div>
                <p className="text-xs text-gray-600">
                  Conformidade geral
                </p>
                <Progress value={metrics.complianceScore} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidentes Críticos</CardTitle>
                <XCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.securityIncidents}
                </div>
                <p className="text-xs text-gray-600">
                  Últimas 24h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Volume de Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Logs</CardTitle>
              <CardDescription>Distribuição de logs por nível nas últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={logVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="errors" stackId="1" stroke="#ef4444" fill="#ef4444" name="Erros" />
                  <Area type="monotone" dataKey="warnings" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Avisos" />
                  <Area type="monotone" dataKey="info" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Informações" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Logs por Categoria</CardTitle>
                <CardDescription>Distribuição de eventos auditados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Níveis de Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Níveis de Risco</CardTitle>
                <CardDescription>Distribuição de eventos por nível de risco</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskLevelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Eventos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alertas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Críticos Recentes</CardTitle>
              <CardDescription>Alertas que requerem atenção imediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditAlerts
                  .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
                  .slice(0, 3)
                  .map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getRiskColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Investigar
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Indicadores de performance do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Tempo de Resposta Médio</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.performanceMetrics.avgResponseTime.toFixed(0)}ms
                  </div>
                  <Progress value={75} className="mt-2 h-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Taxa de Erro</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.performanceMetrics.errorRate.toFixed(1)}%
                  </div>
                  <Progress value={metrics.performanceMetrics.errorRate} className="mt-2 h-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Uptime</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.performanceMetrics.uptime}%
                  </div>
                  <Progress value={metrics.performanceMetrics.uptime} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Sistema de Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>Visualização e análise detalhada de logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar logs..." title="Buscar logs" />
                  <Select 
                    title="Filtrar por nível"
                    options={[
                      { value: 'all', label: 'Todos os Níveis' },
                      { value: 'critical', label: 'Crítico' },
                      { value: 'error', label: 'Erro' },
                      { value: 'warn', label: 'Aviso' },
                      { value: 'info', label: 'Informação' },
                      { value: 'debug', label: 'Debug' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por categoria"
                    options={[
                      { value: 'all', label: 'Todas as Categorias' },
                      { value: 'authentication', label: 'Autenticação' },
                      { value: 'authorization', label: 'Autorização' },
                      { value: 'data_access', label: 'Acesso a Dados' },
                      { value: 'system', label: 'Sistema' },
                      { value: 'security', label: 'Segurança' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="space-y-3">
                  {auditLogs.map((log) => {
                    const CategoryIcon = getCategoryIcon(log.category)
                    
                    return (
                      <Card key={log.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                log.level === 'critical' || log.level === 'error' ? 'bg-red-100' :
                                log.level === 'warn' ? 'bg-yellow-100' : 'bg-blue-100'
                              }`}>
                                <CategoryIcon className={`h-5 w-5 ${
                                  log.level === 'critical' || log.level === 'error' ? 'text-red-600' :
                                  log.level === 'warn' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{log.event}</h4>
                                <p className="text-sm text-gray-600">{log.description}</p>
                                {log.userName && (
                                  <p className="text-xs text-gray-500">
                                    Usuário: {log.userName} ({log.userId})
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getLevelColor(log.level)}>
                                {log.level}
                              </Badge>
                              <Badge className={getOutcomeColor(log.outcome)}>
                                {log.outcome}
                              </Badge>
                              <Badge className={getRiskColor(log.riskLevel)}>
                                {log.riskLevel}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-gray-600">Timestamp:</span>
                              <span className="ml-2 font-medium">{formatDateTime(log.timestamp)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">IP:</span>
                              <span className="ml-2 font-medium">{log.ipAddress}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Recurso:</span>
                              <span className="ml-2 font-medium">{log.resource}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ação:</span>
                              <span className="ml-2 font-medium">{log.action}</span>
                            </div>
                          </div>

                          {log.duration && (
                            <div className="mb-3 text-sm">
                              <span className="text-gray-600">Duração:</span>
                              <span className="ml-2 font-medium">{log.duration}ms</span>
                              {log.responseCode && (
                                <>
                                  <span className="text-gray-600 ml-4">Código:</span>
                                  <span className="ml-2 font-medium">{log.responseCode}</span>
                                </>
                              )}
                              {log.dataSize && (
                                <>
                                  <span className="text-gray-600 ml-4">Tamanho:</span>
                                  <span className="ml-2 font-medium">{formatBytes(log.dataSize)}</span>
                                </>
                              )}
                            </div>
                          )}

                          {Object.keys(log.metadata).length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">Metadados:</p>
                              <div className="bg-gray-50 border rounded-lg p-3">
                                <pre className="text-xs text-gray-800 overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              {log.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Code className="h-3 w-3 mr-1" />
                                Raw
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

        <TabsContent value="alerts" className="space-y-6">
          {/* Sistema de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Auditoria</CardTitle>
              <CardDescription>Gestão e investigação de alertas</CardDescription>
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
                      { value: 'open', label: 'Aberto' },
                      { value: 'investigating', label: 'Investigando' },
                      { value: 'resolved', label: 'Resolvido' },
                      { value: 'false_positive', label: 'Falso Positivo' }
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="grid gap-4">
                  {auditAlerts.map((alert) => (
                    <Card key={alert.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-gray-600">{alert.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Regra: {alert.ruleName} • Log ID: {alert.logId}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getRiskColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(alert.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Recursos Afetados:</p>
                            <div className="flex flex-wrap gap-2">
                              {alert.affectedResources.map((resource, index) => (
                                <Badge key={index} variant="secondary">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Ações Recomendadas:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {alert.recommendedActions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>

                          {alert.notes.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Notas de Investigação:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {alert.notes.map((note, index) => (
                                  <li key={index}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {alert.assignedTo && (
                              <div>
                                <span className="text-gray-600">Atribuído a:</span>
                                <span className="ml-2 font-medium">{alert.assignedTo}</span>
                              </div>
                            )}
                            {alert.resolvedAt && (
                              <div>
                                <span className="text-gray-600">Resolvido em:</span>
                                <span className="ml-2 font-medium">{formatDateTime(alert.resolvedAt)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              ID: {alert.id}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Investigar
                              </Button>
                              {alert.status === 'open' && (
                                <Button size="sm">
                                  <User className="h-3 w-3 mr-1" />
                                  Atribuir
                                </Button>
                              )}
                              {alert.status !== 'resolved' && (
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

        <TabsContent value="rules" className="space-y-6">
          {/* Regras de Auditoria */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Auditoria</CardTitle>
              <CardDescription>Configuração de regras automáticas de detecção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Select 
                      title="Filtrar por categoria"
                      options={[
                        { value: 'all', label: 'Todas as Categorias' },
                        { value: 'security', label: 'Segurança' },
                        { value: 'compliance', label: 'Compliance' },
                        { value: 'performance', label: 'Performance' },
                        { value: 'business', label: 'Negócio' }
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
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                </div>

                <div className="grid gap-4">
                  {auditRules.map((rule) => (
                    <Card key={rule.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <p className="text-gray-600">{rule.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getRiskColor(rule.severity)}>
                                {rule.severity}
                              </Badge>
                              <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {rule.isActive ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Disparada: {rule.triggerCount}x
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Condições:</p>
                            <div className="space-y-1">
                              {rule.conditions.map((condition, index) => (
                                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                  <code>
                                    {condition.field} {condition.operator} "{condition.value}"
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Ações:</p>
                            <div className="flex flex-wrap gap-2">
                              {rule.actions.map((action, index) => (
                                <Badge key={index} variant="secondary">
                                  {action.type}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Categoria:</span>
                              <span className="ml-2 font-medium">{rule.category}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Criado por:</span>
                              <span className="ml-2 font-medium">{rule.createdBy}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Criado em:</span>
                              <span className="ml-2 font-medium">{formatDate(rule.createdAt)}</span>
                            </div>
                          </div>

                          {rule.lastTriggered && (
                            <div className="text-sm">
                              <span className="text-gray-600">Último disparo:</span>
                              <span className="ml-2 font-medium">{formatDateTime(rule.lastTriggered)}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <Badge variant="secondary">{rule.category}</Badge>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Relatórios de Auditoria */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Auditoria</CardTitle>
              <CardDescription>Geração e histórico de relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-24 flex-col">
                    <FileText className="h-8 w-8 mb-2" />
                    <span>Relatório Resumo</span>
                  </Button>
                  <Button variant="secondary" className="h-24 flex-col">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <span>Análise Detalhada</span>
                  </Button>
                  <Button variant="secondary" className="h-24 flex-col">
                    <Shield className="h-8 w-8 mb-2" />
                    <span>Relatório Segurança</span>
                  </Button>
                  <Button variant="secondary" className="h-24 flex-col">
                    <CheckCircle className="h-8 w-8 mb-2" />
                    <span>Compliance Report</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Relatórios Recentes</h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Relatório de Segurança - Janeiro 2025',
                        type: 'security',
                        status: 'completed',
                        generatedAt: '2025-01-15T10:00:00Z',
                        fileSize: 2048576,
                        format: 'pdf'
                      },
                      {
                        title: 'Análise de Compliance Q4 2024',
                        type: 'compliance',
                        status: 'completed',
                        generatedAt: '2025-01-10T08:00:00Z',
                        fileSize: 5242880,
                        format: 'excel'
                      },
                      {
                        title: 'Resumo Executivo - Dezembro 2024',
                        type: 'summary',
                        status: 'generating',
                        generatedAt: '2025-01-14T16:00:00Z',
                        fileSize: 0,
                        format: 'pdf'
                      },
                      {
                        title: 'Logs de Atividade - Semanal',
                        type: 'detailed',
                        status: 'scheduled',
                        generatedAt: '2025-01-12T06:00:00Z',
                        fileSize: 10485760,
                        format: 'csv'
                      }
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-semibold">{report.title}</h5>
                          <p className="text-sm text-gray-600">
                            Gerado em {formatDateTime(report.generatedAt)} • {report.format.toUpperCase()}
                            {report.fileSize > 0 && ` • ${formatBytes(report.fileSize)}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          {report.status === 'completed' && (
                            <Button size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Relatórios Programados</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Relatório Diário de Segurança', frequency: 'daily', nextRun: '2025-01-16T06:00:00Z' },
                      { name: 'Resumo Semanal de Compliance', frequency: 'weekly', nextRun: '2025-01-20T08:00:00Z' },
                      { name: 'Análise Mensal de Performance', frequency: 'monthly', nextRun: '2025-02-01T10:00:00Z' }
                    ].map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-semibold">{schedule.name}</h5>
                          <p className="text-sm text-gray-600">
                            Frequência: {schedule.frequency} • Próxima execução: {formatDateTime(schedule.nextRun)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Play className="h-3 w-3 mr-1" />
                            Executar
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

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance e Auditoria */}
          <Card>
            <CardHeader>
              <CardTitle>Auditoria de Compliance</CardTitle>
              <CardDescription>Monitoramento de conformidade regulatória</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Score Geral</h4>
                    <div className="text-3xl font-bold text-green-600">{metrics.complianceScore}%</div>
                    <Progress value={metrics.complianceScore} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Frameworks</h4>
                    <div className="text-3xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-gray-600">Monitorados</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Violações</h4>
                    <div className="text-3xl font-bold text-red-600">3</div>
                    <div className="text-sm text-gray-600">Esta semana</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Auditoria</h4>
                    <div className="text-3xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">Dias até próxima</div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas por Framework</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={complianceMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="framework" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#10b981" name="Score %" />
                        <Bar dataKey="logs" fill="#3b82f6" name="Logs Auditoria" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Frameworks de Compliance</h4>
                  <div className="grid gap-4">
                    {complianceMetricsData.map((framework, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-semibold">{framework.framework}</h5>
                          <p className="text-sm text-gray-600">
                            {framework.logs} logs de auditoria registrados
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            framework.score >= 90 ? 'text-green-600' :
                            framework.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {framework.score}%
                          </div>
                          <Progress value={framework.score} className="w-24 h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Eventos de Compliance Recentes</h4>
                  <div className="space-y-3">
                    {auditLogs
                      .filter(log => log.category === 'compliance')
                      .slice(0, 3)
                      .map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{log.event}</p>
                              <p className="text-sm text-gray-600">{log.description}</p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(log.timestamp)} • {log.userName}
                              </p>
                            </div>
                          </div>
                          <Badge className={getOutcomeColor(log.outcome)}>
                            {log.outcome}
                          </Badge>
                        </div>
                      ))}
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

export default AuditSystem
