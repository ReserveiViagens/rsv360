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
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  Shield,
  Eye,
  EyeOff,
  Settings,
  Clock,
  Calendar,
  MapPin,
  Smartphone,
  Laptop,
  Monitor,
  Globe,
  Building,
  Department,
  Crown,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Fingerprint,
  Scan,
  Wifi,
  WifiOff,
  Database,
  Server,
  Network,
  Router,
  Cloud,
  HardDrive,
  Cpu,
  Memory,
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
  RadialBar
} from 'recharts'

// Tipos para Access Control Manager
interface AccessUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  department: string
  position: string
  status: 'active' | 'inactive' | 'suspended' | 'locked'
  lastLogin: string
  createdAt: string
  updatedAt: string
  roles: string[]
  permissions: string[]
  groups: string[]
  mfaEnabled: boolean
  mfaMethods: string[]
  accessLevel: 'basic' | 'elevated' | 'privileged' | 'administrative'
  loginAttempts: number
  passwordLastChanged: string
  sessionTimeout: number
  ipRestrictions: string[]
  timeRestrictions: {
    enabled: boolean
    allowedHours: string
    allowedDays: string[]
  }
  deviceRestrictions: {
    enabled: boolean
    allowedDevices: string[]
    registeredDevices: AccessDevice[]
  }
}

interface AccessRole {
  id: string
  name: string
  description: string
  category: 'system' | 'business' | 'technical' | 'custom'
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  permissions: string[]
  inheritFrom: string[]
  assignedUsers: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  isDefault: boolean
  expiresAt?: string
  approvalRequired: boolean
  maxUsers: number
}

interface AccessPermission {
  id: string
  name: string
  description: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin'
  scope: 'global' | 'organization' | 'department' | 'team' | 'personal'
  category: 'system' | 'data' | 'api' | 'ui' | 'report'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  requiresMfa: boolean
  requiresApproval: boolean
  isRevocable: boolean
  validUntil?: string
}

interface AccessGroup {
  id: string
  name: string
  description: string
  type: 'department' | 'project' | 'security' | 'custom'
  members: string[]
  roles: string[]
  permissions: string[]
  manager: string
  createdAt: string
  isActive: boolean
  policies: string[]
}

interface AccessSession {
  id: string
  userId: string
  deviceId: string
  ipAddress: string
  userAgent: string
  location: string
  startTime: string
  lastActivity: string
  status: 'active' | 'expired' | 'terminated'
  authenticationType: 'password' | 'mfa' | 'sso' | 'biometric'
  riskScore: number
  activities: AccessActivity[]
}

interface AccessDevice {
  id: string
  userId: string
  name: string
  type: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'server'
  os: string
  browser: string
  fingerprint: string
  lastSeen: string
  isApproved: boolean
  isTrusted: boolean
  location: string
  riskScore: number
}

interface AccessPolicy {
  id: string
  name: string
  description: string
  type: 'authentication' | 'authorization' | 'password' | 'session' | 'device'
  rules: {
    condition: string
    action: string
    severity: 'low' | 'medium' | 'high'
  }[]
  isActive: boolean
  appliesTo: 'all' | 'roles' | 'groups' | 'users'
  targets: string[]
  exceptions: string[]
  createdAt: string
  lastModified: string
}

interface AccessActivity {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
  success: boolean
  riskLevel: 'low' | 'medium' | 'high'
  details: string
}

const AccessControlManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

  // Dados mock para demonstração
  const [accessUsers] = useState<AccessUser[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@rsv.com',
      firstName: 'João',
      lastName: 'Silva',
      department: 'TI',
      position: 'Administrador de Sistemas',
      status: 'active',
      lastLogin: '2025-01-15T14:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z',
      roles: ['admin', 'system_admin'],
      permissions: ['*'],
      groups: ['administrators', 'it_team'],
      mfaEnabled: true,
      mfaMethods: ['totp', 'sms'],
      accessLevel: 'administrative',
      loginAttempts: 0,
      passwordLastChanged: '2024-12-15T00:00:00Z',
      sessionTimeout: 480,
      ipRestrictions: ['192.168.1.0/24'],
      timeRestrictions: {
        enabled: false,
        allowedHours: '08:00-18:00',
        allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri']
      },
      deviceRestrictions: {
        enabled: false,
        allowedDevices: [],
        registeredDevices: []
      }
    },
    {
      id: '2',
      username: 'maria.santos',
      email: 'maria.santos@rsv.com',
      firstName: 'Maria',
      lastName: 'Santos',
      department: 'Vendas',
      position: 'Gerente de Vendas',
      status: 'active',
      lastLogin: '2025-01-15T13:45:00Z',
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2025-01-15T13:45:00Z',
      roles: ['sales_manager', 'user'],
      permissions: ['sales.read', 'sales.write', 'customers.read', 'reports.read'],
      groups: ['sales_team', 'managers'],
      mfaEnabled: true,
      mfaMethods: ['totp'],
      accessLevel: 'elevated',
      loginAttempts: 0,
      passwordLastChanged: '2024-11-20T00:00:00Z',
      sessionTimeout: 240,
      ipRestrictions: [],
      timeRestrictions: {
        enabled: true,
        allowedHours: '07:00-19:00',
        allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      },
      deviceRestrictions: {
        enabled: true,
        allowedDevices: ['desktop', 'laptop', 'mobile'],
        registeredDevices: []
      }
    },
    {
      id: '3',
      username: 'carlos.oliveira',
      email: 'carlos.oliveira@rsv.com',
      firstName: 'Carlos',
      lastName: 'Oliveira',
      department: 'Financeiro',
      position: 'Analista Financeiro',
      status: 'active',
      lastLogin: '2025-01-15T12:20:00Z',
      createdAt: '2024-03-10T00:00:00Z',
      updatedAt: '2025-01-15T12:20:00Z',
      roles: ['finance_analyst', 'user'],
      permissions: ['finance.read', 'finance.write', 'reports.read'],
      groups: ['finance_team'],
      mfaEnabled: false,
      mfaMethods: [],
      accessLevel: 'basic',
      loginAttempts: 2,
      passwordLastChanged: '2024-09-10T00:00:00Z',
      sessionTimeout: 120,
      ipRestrictions: [],
      timeRestrictions: {
        enabled: true,
        allowedHours: '08:00-17:00',
        allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri']
      },
      deviceRestrictions: {
        enabled: false,
        allowedDevices: [],
        registeredDevices: []
      }
    },
    {
      id: '4',
      username: 'ana.costa',
      email: 'ana.costa@rsv.com',
      firstName: 'Ana',
      lastName: 'Costa',
      department: 'RH',
      position: 'Analista de RH',
      status: 'suspended',
      lastLogin: '2025-01-10T16:30:00Z',
      createdAt: '2024-04-20T00:00:00Z',
      updatedAt: '2025-01-12T09:00:00Z',
      roles: ['hr_analyst', 'user'],
      permissions: ['hr.read', 'hr.write', 'users.read'],
      groups: ['hr_team'],
      mfaEnabled: true,
      mfaMethods: ['totp'],
      accessLevel: 'basic',
      loginAttempts: 5,
      passwordLastChanged: '2024-10-05T00:00:00Z',
      sessionTimeout: 180,
      ipRestrictions: [],
      timeRestrictions: {
        enabled: true,
        allowedHours: '08:00-18:00',
        allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri']
      },
      deviceRestrictions: {
        enabled: false,
        allowedDevices: [],
        registeredDevices: []
      }
    }
  ])

  const [accessRoles] = useState<AccessRole[]>([
    {
      id: '1',
      name: 'admin',
      description: 'Administrador do sistema com acesso total',
      category: 'system',
      level: 'expert',
      permissions: ['*'],
      inheritFrom: [],
      assignedUsers: ['1'],
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isActive: true,
      isDefault: true,
      approvalRequired: true,
      maxUsers: 2
    },
    {
      id: '2',
      name: 'sales_manager',
      description: 'Gerente de vendas com acesso aos dados de vendas e clientes',
      category: 'business',
      level: 'advanced',
      permissions: ['sales.*', 'customers.read', 'reports.read'],
      inheritFrom: ['user'],
      assignedUsers: ['2'],
      createdBy: '1',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-06-15T00:00:00Z',
      isActive: true,
      isDefault: false,
      approvalRequired: true,
      maxUsers: 5
    },
    {
      id: '3',
      name: 'finance_analyst',
      description: 'Analista financeiro com acesso aos dados financeiros',
      category: 'business',
      level: 'intermediate',
      permissions: ['finance.read', 'finance.write', 'reports.read'],
      inheritFrom: ['user'],
      assignedUsers: ['3'],
      createdBy: '1',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-08-01T00:00:00Z',
      isActive: true,
      isDefault: false,
      approvalRequired: false,
      maxUsers: 10
    },
    {
      id: '4',
      name: 'user',
      description: 'Usuário básico com acesso limitado',
      category: 'system',
      level: 'basic',
      permissions: ['profile.read', 'profile.write'],
      inheritFrom: [],
      assignedUsers: ['2', '3', '4'],
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isActive: true,
      isDefault: true,
      approvalRequired: false,
      maxUsers: 1000
    }
  ])

  const [accessSessions] = useState<AccessSession[]>([
    {
      id: '1',
      userId: '1',
      deviceId: 'dev_001',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Caldas Novas, GO',
      startTime: '2025-01-15T08:00:00Z',
      lastActivity: '2025-01-15T14:30:00Z',
      status: 'active',
      authenticationType: 'mfa',
      riskScore: 15,
      activities: []
    },
    {
      id: '2',
      userId: '2',
      deviceId: 'dev_002',
      ipAddress: '192.168.1.25',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'Cuiabá, MT',
      startTime: '2025-01-15T07:30:00Z',
      lastActivity: '2025-01-15T13:45:00Z',
      status: 'active',
      authenticationType: 'mfa',
      riskScore: 25,
      activities: []
    },
    {
      id: '3',
      userId: '3',
      deviceId: 'dev_003',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'São Paulo, SP',
      startTime: '2025-01-15T09:00:00Z',
      lastActivity: '2025-01-15T12:20:00Z',
      status: 'expired',
      authenticationType: 'password',
      riskScore: 65,
      activities: []
    }
  ])

  // Dados para gráficos
  const userActivityData = [
    { hour: '00:00', active: 12, failed: 2, mfa: 8 },
    { hour: '04:00', active: 5, failed: 1, mfa: 3 },
    { hour: '08:00', active: 45, failed: 8, mfa: 35 },
    { hour: '12:00', active: 67, failed: 12, mfa: 52 },
    { hour: '16:00', active: 52, failed: 6, mfa: 41 },
    { hour: '20:00', active: 23, failed: 3, mfa: 18 }
  ]

  const accessLevelDistribution = [
    { name: 'Básico', value: 70, color: '#3b82f6' },
    { name: 'Elevado', value: 20, color: '#10b981' },
    { name: 'Privilegiado', value: 8, color: '#f59e0b' },
    { name: 'Administrativo', value: 2, color: '#ef4444' }
  ]

  const roleUsageData = [
    { role: 'user', count: 150, percentage: 75 },
    { role: 'sales_manager', count: 25, percentage: 12.5 },
    { role: 'finance_analyst', count: 20, percentage: 10 },
    { role: 'admin', count: 5, percentage: 2.5 }
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
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      case 'locked': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      case 'terminated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'elevated': return 'bg-green-100 text-green-800'
      case 'privileged': return 'bg-yellow-100 text-yellow-800'
      case 'administrative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 20) return 'bg-green-100 text-green-800'
    if (riskScore <= 50) return 'bg-yellow-100 text-yellow-800'
    if (riskScore <= 80) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return XCircle
      case 'suspended': return Clock
      case 'locked': return Lock
      default: return User
    }
  }

  const getMfaIcon = (method: string) => {
    switch (method) {
      case 'totp': return Smartphone
      case 'sms': return Phone
      case 'biometric': return Fingerprint
      default: return Key
    }
  }

  const calculateMetrics = () => {
    const totalUsers = accessUsers.length
    const activeUsers = accessUsers.filter(u => u.status === 'active').length
    const mfaEnabledUsers = accessUsers.filter(u => u.mfaEnabled).length
    const activeSessions = accessSessions.filter(s => s.status === 'active').length

    return {
      totalUsers,
      activeUsers,
      mfaEnabledUsers,
      activeSessions,
      mfaAdoption: (mfaEnabledUsers / totalUsers) * 100
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Controle de Acesso</h1>
          <p className="text-gray-600">Gestão avançada de usuários, permissões e controle de acesso</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsUserModalOpen(!isUserModalOpen)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
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
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Perfis</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs de Controle de Acesso */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.activeUsers}
                </div>
                <p className="text-xs text-gray-600">
                  de {metrics.totalUsers} usuários
                </p>
                <Progress value={(metrics.activeUsers / metrics.totalUsers) * 100} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MFA Habilitado</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.mfaAdoption.toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.mfaEnabledUsers} usuários
                </p>
                <Progress value={metrics.mfaAdoption} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.activeSessions}
                </div>
                <p className="text-xs text-gray-600">
                  Conectados agora
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Perfis Ativos</CardTitle>
                <Crown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {accessRoles.filter(r => r.isActive).length}
                </div>
                <p className="text-xs text-gray-600">
                  de {accessRoles.length} perfis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Atividade de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade de Usuários</CardTitle>
              <CardDescription>Logins ativos, falhas e autenticação MFA por hora</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="active" stackId="1" stroke="#10b981" fill="#10b981" name="Ativos" />
                  <Area type="monotone" dataKey="mfa" stackId="2" stroke="#3b82f6" fill="#3b82f6" name="MFA" />
                  <Area type="monotone" dataKey="failed" stackId="3" stroke="#ef4444" fill="#ef4444" name="Falhas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Nível de Acesso */}
            <Card>
              <CardHeader>
                <CardTitle>Níveis de Acesso</CardTitle>
                <CardDescription>Distribuição de usuários por nível</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={accessLevelDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {accessLevelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Uso de Perfis */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Perfis</CardTitle>
                <CardDescription>Distribuição de usuários por perfil</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roleUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Usuários" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Usuários que Requerem Atenção */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários que Requerem Atenção</CardTitle>
              <CardDescription>Usuários com problemas de segurança ou acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessUsers
                  .filter(user => 
                    user.status === 'suspended' || 
                    user.status === 'locked' ||
                    !user.mfaEnabled ||
                    user.loginAttempts > 3
                  )
                  .map((user) => {
                    const StatusIcon = getStatusIcon(user.status)
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <StatusIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-gray-600">{user.email} • {user.department}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                              {!user.mfaEnabled && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  MFA Desabilitado
                                </Badge>
                              )}
                              {user.loginAttempts > 3 && (
                                <Badge className="bg-red-100 text-red-800">
                                  {user.loginAttempts} tentativas
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                          {user.status === 'suspended' && (
                            <Button size="sm">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Reativar
                            </Button>
                          )}
                          {user.status === 'locked' && (
                            <Button size="sm">
                              <Unlock className="h-3 w-3 mr-1" />
                              Desbloquear
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Lista de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>Controle de usuários e suas permissões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar usuários..." title="Buscar usuários" />
                  <Select 
                    title="Filtrar por departamento"
                    options={[
                      { value: 'all', label: 'Todos os Departamentos' },
                      { value: 'ti', label: 'TI' },
                      { value: 'vendas', label: 'Vendas' },
                      { value: 'financeiro', label: 'Financeiro' },
                      { value: 'rh', label: 'RH' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'active', label: 'Ativo' },
                      { value: 'inactive', label: 'Inativo' },
                      { value: 'suspended', label: 'Suspenso' },
                      { value: 'locked', label: 'Bloqueado' }
                    ]}
                  />
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Usuário</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Departamento</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Nível de Acesso</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">MFA</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Último Login</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessUsers.map((user) => {
                        const StatusIcon = getStatusIcon(user.status)
                        
                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <StatusIcon className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div>
                                <p className="font-medium">{user.department}</p>
                                <p className="text-sm text-gray-600">{user.position}</p>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge className={getAccessLevelColor(user.accessLevel)}>
                                {user.accessLevel}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex items-center space-x-2">
                                {user.mfaEnabled ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm">
                                  {user.mfaEnabled ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              {formatDateTime(user.lastLogin)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex space-x-1">
                                <Button size="sm" variant="secondary">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="secondary">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="secondary">
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
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

        <TabsContent value="roles" className="space-y-6">
          {/* Gestão de Perfis */}
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Perfis e Permissões</CardTitle>
              <CardDescription>Configuração de perfis de acesso e permissões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Buscar perfis..." title="Buscar perfis" />
                    <Select 
                      title="Filtrar por categoria"
                      options={[
                        { value: 'all', label: 'Todas as Categorias' },
                        { value: 'system', label: 'Sistema' },
                        { value: 'business', label: 'Negócio' },
                        { value: 'technical', label: 'Técnico' },
                        { value: 'custom', label: 'Personalizado' }
                      ]}
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Perfil
                  </Button>
                </div>

                <div className="grid gap-4">
                  {accessRoles.map((role) => (
                    <Card key={role.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <Crown className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl">{role.name}</h3>
                              <p className="text-gray-600">{role.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge>{role.category}</Badge>
                                <Badge variant="secondary">{role.level}</Badge>
                                {role.isDefault && (
                                  <Badge className="bg-blue-100 text-blue-800">Padrão</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={role.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {role.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <div className="mt-2 text-sm text-gray-600">
                              {role.assignedUsers.length} usuários
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Usuários Atribuídos</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold">{role.assignedUsers.length}</span>
                              <span className="text-sm text-gray-500">/ {role.maxUsers}</span>
                              <Progress 
                                value={(role.assignedUsers.length / role.maxUsers) * 100} 
                                className="flex-1 h-2" 
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Permissões</p>
                            <p className="text-lg font-bold">{role.permissions.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Aprovação Requerida</p>
                            <div className="flex items-center space-x-2">
                              {role.approvalRequired ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">
                                {role.approvalRequired ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Permissões:</p>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions.slice(0, 5).map((permission, index) => (
                                <Badge key={index} variant="secondary">
                                  {permission}
                                </Badge>
                              ))}
                              {role.permissions.length > 5 && (
                                <Badge variant="secondary">
                                  +{role.permissions.length - 5} mais
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Criado por:</span>
                              <span className="ml-2 font-medium">{role.createdBy}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Criado em:</span>
                              <span className="ml-2 font-medium">{formatDate(role.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-xs text-gray-500">
                              Última atualização: {formatDate(role.updatedAt)}
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
                                <Users className="h-3 w-3 mr-1" />
                                Usuários
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

        <TabsContent value="sessions" className="space-y-6">
          {/* Sessões Ativas */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões de Usuários</CardTitle>
              <CardDescription>Monitoramento de sessões ativas e histórico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    title="Filtrar por status"
                    options={[
                      { value: 'all', label: 'Todos os Status' },
                      { value: 'active', label: 'Ativas' },
                      { value: 'expired', label: 'Expiradas' },
                      { value: 'terminated', label: 'Terminadas' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por usuário"
                    options={[
                      { value: 'all', label: 'Todos os Usuários' },
                      ...accessUsers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))
                    ]}
                  />
                  <Button variant="secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="grid gap-4">
                  {accessSessions.map((session) => {
                    const user = accessUsers.find(u => u.id === session.userId)
                    if (!user) return null

                    return (
                      <Card key={session.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <Monitor className="h-6 w-6 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  IP: {session.ipAddress} • {session.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(session.status)}>
                                {session.status}
                              </Badge>
                              <div className="mt-2">
                                <Badge className={getRiskColor(session.riskScore)}>
                                  Risco: {session.riskScore}%
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Início da Sessão</p>
                              <p className="font-medium">{formatDateTime(session.startTime)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Última Atividade</p>
                              <p className="font-medium">{formatDateTime(session.lastActivity)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Autenticação</p>
                              <div className="flex items-center space-x-2">
                                {session.authenticationType === 'mfa' && (
                                  <Shield className="h-4 w-4 text-green-600" />
                                )}
                                <span className="font-medium">{session.authenticationType}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Dispositivo</p>
                              <p className="font-medium">{session.deviceId}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-600">User Agent:</p>
                              <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                                {session.userAgent}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-sm text-gray-500">
                              Sessão ID: {session.id}
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                              {session.status === 'active' && (
                                <Button variant="secondary" size="sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Terminar
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

        <TabsContent value="policies" className="space-y-6">
          {/* Políticas de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Controle de Acesso</CardTitle>
              <CardDescription>Configuração de políticas e regras de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Políticas Ativas</h4>
                    <div className="text-3xl font-bold text-green-600">15</div>
                    <div className="text-sm text-gray-600">Funcionando</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Violações Hoje</h4>
                    <div className="text-3xl font-bold text-red-600">3</div>
                    <div className="text-sm text-gray-600">Detectadas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Usuários Afetados</h4>
                    <div className="text-3xl font-bold text-blue-600">142</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Políticas Configuradas</h4>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Política
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {[
                      {
                        name: 'Política de Senhas Fortes',
                        type: 'password',
                        status: 'active',
                        violations: 0,
                        description: 'Exige senhas com pelo menos 12 caracteres, incluindo maiúsculas, minúsculas, números e símbolos'
                      },
                      {
                        name: 'Autenticação Multifator Obrigatória',
                        type: 'authentication',
                        status: 'active',
                        violations: 2,
                        description: 'Requer 2FA para todos os acessos a dados sensíveis e funções administrativas'
                      },
                      {
                        name: 'Restrição de Horário de Acesso',
                        type: 'session',
                        status: 'active',
                        violations: 1,
                        description: 'Permite acesso apenas durante horário comercial (8h-18h) para usuários não-administrativos'
                      },
                      {
                        name: 'Bloqueio por Tentativas Falhadas',
                        type: 'authentication',
                        status: 'active',
                        violations: 0,
                        description: 'Bloqueia conta após 5 tentativas consecutivas de login falhadas'
                      },
                      {
                        name: 'Controle de Dispositivos',
                        type: 'device',
                        status: 'inactive',
                        violations: 0,
                        description: 'Permite acesso apenas de dispositivos registrados e aprovados'
                      }
                    ].map((policy, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold">{policy.name}</h5>
                            <p className="text-sm text-gray-600">{policy.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(policy.status)}>
                              {policy.status}
                            </Badge>
                            {policy.violations > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {policy.violations} violações
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{policy.type}</Badge>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="secondary">
                              <Eye className="h-3 w-3 mr-1" />
                              Visualizar
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button size="sm" variant="secondary">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Relatório
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Trilha de Auditoria */}
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria</CardTitle>
              <CardDescription>Log de todas as atividades de controle de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Buscar atividades..." title="Buscar atividades" />
                  <Select 
                    title="Filtrar por ação"
                    options={[
                      { value: 'all', label: 'Todas as Ações' },
                      { value: 'login', label: 'Login' },
                      { value: 'logout', label: 'Logout' },
                      { value: 'password_change', label: 'Mudança de Senha' },
                      { value: 'permission_grant', label: 'Concessão de Permissão' },
                      { value: 'role_assignment', label: 'Atribuição de Perfil' }
                    ]}
                  />
                  <Select 
                    title="Filtrar por usuário"
                    options={[
                      { value: 'all', label: 'Todos os Usuários' },
                      ...accessUsers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))
                    ]}
                  />
                  <Button variant="secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      timestamp: '2025-01-15T14:30:00Z',
                      user: 'João Silva',
                      action: 'login',
                      resource: 'Admin Dashboard',
                      result: 'success',
                      details: 'Login com MFA via TOTP',
                      ip: '192.168.1.10'
                    },
                    {
                      timestamp: '2025-01-15T14:25:00Z',
                      user: 'Maria Santos',
                      action: 'permission_grant',
                      resource: 'Sales Reports',
                      result: 'success',
                      details: 'Permissão concedida para acessar relatórios de vendas',
                      ip: '192.168.1.25'
                    },
                    {
                      timestamp: '2025-01-15T14:20:00Z',
                      user: 'Carlos Oliveira',
                      action: 'password_change',
                      resource: 'User Profile',
                      result: 'success',
                      details: 'Senha alterada pelo próprio usuário',
                      ip: '203.0.113.45'
                    },
                    {
                      timestamp: '2025-01-15T14:15:00Z',
                      user: 'admin',
                      action: 'role_assignment',
                      resource: 'Ana Costa',
                      result: 'success',
                      details: 'Perfil hr_analyst atribuído ao usuário',
                      ip: '192.168.1.10'
                    },
                    {
                      timestamp: '2025-01-15T14:10:00Z',
                      user: 'Ana Costa',
                      action: 'login',
                      resource: 'HR Portal',
                      result: 'failed',
                      details: 'Tentativa de login com senha incorreta',
                      ip: '203.0.113.60'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.result === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {activity.user} - {activity.action}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.resource} • {activity.details}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(activity.timestamp)} • IP: {activity.ip}
                          </p>
                        </div>
                      </div>
                      <Badge className={activity.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {activity.result}
                      </Badge>
                    </div>
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

export default AccessControlManager
