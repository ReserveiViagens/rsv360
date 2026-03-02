'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Settings,
  RefreshCw,
  Database,
  FileText,
  Download,
  Upload,
  Sync,
  BarChart3,
  Activity,
  Shield,
  Key,
  Server,
  Cloud,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  PlayCircle,
  StopCircle,
  Calendar,
  Filter,
  Search,
  FileSpreadsheet,
  FileX,
  FileCheck
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell } from 'recharts'

// Tipos de dados para integração contábil
interface AccountingSystem {
  id: string
  name: string
  type: 'cloud' | 'desktop' | 'web'
  provider: string
  status: 'conectado' | 'desconectado' | 'erro' | 'sincronizando'
  lastSync: string
  apiEndpoint?: string
  credentials: {
    encrypted: boolean
    expiresAt?: string
  }
  features: string[]
  syncSettings: {
    automatic: boolean
    frequency: 'tempo-real' | 'horario' | 'diario' | 'semanal'
    lastRun?: string
    nextRun?: string
  }
  dataMapping: {
    accounts: boolean
    transactions: boolean
    customers: boolean
    suppliers: boolean
    products: boolean
  }
}

interface SyncRecord {
  id: string
  systemId: string
  timestamp: string
  status: 'sucesso' | 'erro' | 'parcial' | 'em-andamento'
  recordsProcessed: number
  recordsTotal: number
  duration: number
  errors: string[]
  summary: {
    created: number
    updated: number
    failed: number
  }
}

interface AccountingData {
  accounts: {
    code: string
    name: string
    type: 'ativo' | 'passivo' | 'receita' | 'despesa' | 'patrimonio'
    balance: number
    lastUpdate: string
  }[]
  transactions: {
    id: string
    date: string
    description: string
    account: string
    debit: number
    credit: number
    reference: string
  }[]
}

const AccountingIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sistemas')
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<AccountingSystem | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Dados mock para demonstração
  const [systems] = useState<AccountingSystem[]>([
    {
      id: '1',
      name: 'ContábilMax Pro',
      type: 'cloud',
      provider: 'ContábilMax',
      status: 'conectado',
      lastSync: '2025-01-15T10:30:00Z',
      apiEndpoint: 'https://api.contabilmax.com.br/v2',
      credentials: { encrypted: true, expiresAt: '2025-12-31' },
      features: ['Plano de Contas', 'Lançamentos', 'Balancetes', 'DRE', 'Relatórios'],
      syncSettings: {
        automatic: true,
        frequency: 'horario',
        lastRun: '2025-01-15T10:30:00Z',
        nextRun: '2025-01-15T11:30:00Z'
      },
      dataMapping: {
        accounts: true,
        transactions: true,
        customers: true,
        suppliers: true,
        products: false
      }
    },
    {
      id: '2',
      name: 'Alterdata Fiscal',
      type: 'desktop',
      provider: 'Alterdata',
      status: 'desconectado',
      lastSync: '2025-01-10T15:45:00Z',
      credentials: { encrypted: true },
      features: ['Escrituração Fiscal', 'SPED', 'Apuração de Impostos'],
      syncSettings: {
        automatic: false,
        frequency: 'diario'
      },
      dataMapping: {
        accounts: true,
        transactions: true,
        customers: false,
        suppliers: false,
        products: false
      }
    },
    {
      id: '3',
      name: 'QuickBooks Online',
      type: 'cloud',
      provider: 'Intuit',
      status: 'erro',
      lastSync: '2025-01-12T08:20:00Z',
      apiEndpoint: 'https://sandbox-quickbooks.api.intuit.com/v3',
      credentials: { encrypted: true, expiresAt: '2025-06-30' },
      features: ['Chart of Accounts', 'Transactions', 'Invoicing', 'Reports'],
      syncSettings: {
        automatic: true,
        frequency: 'tempo-real',
        lastRun: '2025-01-12T08:20:00Z'
      },
      dataMapping: {
        accounts: true,
        transactions: true,
        customers: true,
        suppliers: true,
        products: true
      }
    }
  ])

  const [syncHistory] = useState<SyncRecord[]>([
    {
      id: '1',
      systemId: '1',
      timestamp: '2025-01-15T10:30:00Z',
      status: 'sucesso',
      recordsProcessed: 1250,
      recordsTotal: 1250,
      duration: 45,
      errors: [],
      summary: { created: 25, updated: 1200, failed: 0 }
    },
    {
      id: '2',
      systemId: '3',
      timestamp: '2025-01-12T08:20:00Z',
      status: 'erro',
      recordsProcessed: 0,
      recordsTotal: 850,
      duration: 5,
      errors: ['Authentication failed', 'API rate limit exceeded'],
      summary: { created: 0, updated: 0, failed: 850 }
    },
    {
      id: '3',
      systemId: '1',
      timestamp: '2025-01-14T14:15:00Z',
      status: 'parcial',
      recordsProcessed: 980,
      recordsTotal: 1100,
      duration: 62,
      errors: ['Invalid account code: 1.1.1.001', 'Duplicate transaction ID: TRX-12345'],
      summary: { created: 15, updated: 965, failed: 120 }
    }
  ])

  const [accountingData] = useState<AccountingData>({
    accounts: [
      { code: '1.1.1.001', name: 'Caixa Geral', type: 'ativo', balance: 25000, lastUpdate: '2025-01-15T10:30:00Z' },
      { code: '1.1.2.001', name: 'Banco Conta Corrente', type: 'ativo', balance: 180000, lastUpdate: '2025-01-15T10:30:00Z' },
      { code: '3.1.1.001', name: 'Receita de Vendas', type: 'receita', balance: 350000, lastUpdate: '2025-01-15T10:30:00Z' },
      { code: '4.1.1.001', name: 'Despesas Operacionais', type: 'despesa', balance: 125000, lastUpdate: '2025-01-15T10:30:00Z' },
      { code: '2.1.1.001', name: 'Fornecedores a Pagar', type: 'passivo', balance: 45000, lastUpdate: '2025-01-15T10:30:00Z' }
    ],
    transactions: [
      {
        id: 'TRX-001',
        date: '2025-01-15',
        description: 'Venda de serviços',
        account: '3.1.1.001',
        debit: 0,
        credit: 15000,
        reference: 'NF-001'
      },
      {
        id: 'TRX-002',
        date: '2025-01-15',
        description: 'Pagamento de fornecedor',
        account: '2.1.1.001',
        debit: 5000,
        credit: 0,
        reference: 'PAG-001'
      }
    ]
  })

  // Dados para gráficos
  const syncPerformanceData = [
    { date: '2025-01-10', sucessos: 8, erros: 2, parciais: 1 },
    { date: '2025-01-11', sucessos: 12, erros: 0, parciais: 0 },
    { date: '2025-01-12', sucessos: 6, erros: 3, parciais: 2 },
    { date: '2025-01-13', sucessos: 10, erros: 1, parciais: 1 },
    { date: '2025-01-14', sucessos: 15, erros: 0, parciais: 1 },
    { date: '2025-01-15', sucessos: 9, erros: 1, parciais: 0 }
  ]

  const dataVolumeChart = [
    { sistema: 'ContábilMax', transacoes: 1250, contas: 45, clientes: 120 },
    { sistema: 'Alterdata', transacoes: 850, contas: 38, clientes: 95 },
    { sistema: 'QuickBooks', transacoes: 950, contas: 52, clientes: 140 }
  ]

  const systemStatusData = [
    { name: 'Conectados', value: 1, color: '#10b981' },
    { name: 'Desconectados', value: 1, color: '#f59e0b' },
    { name: 'Com Erro', value: 1, color: '#ef4444' }
  ]

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado': return CheckCircle
      case 'desconectado': return AlertCircle
      case 'erro': return AlertTriangle
      case 'sincronizando': return RefreshCw
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado': return 'text-green-600 bg-green-100'
      case 'desconectado': return 'text-yellow-600 bg-yellow-100'
      case 'erro': return 'text-red-600 bg-red-100'
      case 'sincronizando': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso': return 'bg-green-100 text-green-800'
      case 'erro': return 'bg-red-100 text-red-800'
      case 'parcial': return 'bg-yellow-100 text-yellow-800'
      case 'em-andamento': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleConnect = async (systemId: string) => {
    setIsConnecting(true)
    // Simular processo de conexão
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
  }

  const SystemForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="system-name">Nome do Sistema</Label>
          <Input 
            id="system-name"
            placeholder="Ex: Sistema Contábil XYZ"
            title="Nome identificador do sistema"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="system-provider">Fornecedor</Label>
          <Input 
            id="system-provider"
            placeholder="Ex: Empresa ABC"
            title="Nome do fornecedor do sistema"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="system-type">Tipo de Sistema</Label>
          <Select>
            <SelectTrigger title="Selecionar tipo de sistema">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cloud">Cloud/SaaS</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="web">Web Application</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sync-frequency">Frequência de Sincronização</Label>
          <Select>
            <SelectTrigger title="Selecionar frequência">
              <SelectValue placeholder="Selecionar frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tempo-real">Tempo Real</SelectItem>
              <SelectItem value="horario">A cada hora</SelectItem>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-endpoint">Endpoint da API</Label>
        <Input 
          id="api-endpoint"
          placeholder="https://api.sistema.com.br/v1"
          title="URL do endpoint da API"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Chave da API</Label>
          <Input 
            id="api-key"
            type="password"
            placeholder="••••••••••••••••"
            title="Chave de autenticação da API"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-secret">Secret Key</Label>
          <Input 
            id="api-secret"
            type="password"
            placeholder="••••••••••••••••"
            title="Chave secreta da API"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Dados para Sincronização</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'accounts', label: 'Plano de Contas' },
            { key: 'transactions', label: 'Lançamentos' },
            { key: 'customers', label: 'Clientes' },
            { key: 'suppliers', label: 'Fornecedores' },
            { key: 'products', label: 'Produtos/Serviços' }
          ].map(item => (
            <div key={item.key} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={item.key}
                className="rounded border-gray-300"
                title={`Sincronizar ${item.label}`}
              />
              <Label htmlFor={item.key} className="text-sm">{item.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integração Contábil</h1>
          <p className="text-gray-600">Conecte e sincronize com sistemas contábeis</p>
        </div>
        <Dialog open={isSystemModalOpen} onOpenChange={setIsSystemModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Sistema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Sistema Contábil</DialogTitle>
              <DialogDescription>
                Configure a integração com um novo sistema contábil
              </DialogDescription>
            </DialogHeader>
            <SystemForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSystemModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsSystemModalOpen(false)}>
                Adicionar Sistema
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sistemas">Sistemas</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="sistemas" className="space-y-6">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistemas Conectados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {systems.filter(s => s.status === 'conectado').length}
                </div>
                <p className="text-xs text-gray-600">
                  de {systems.length} sistemas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {systems.filter(s => s.lastSync).length > 0 ? 'Hoje' : 'Nunca'}
                </div>
                <p className="text-xs text-gray-600">
                  {systems.filter(s => s.lastSync).length > 0 
                    ? formatDateTime(Math.max(...systems.filter(s => s.lastSync).map(s => new Date(s.lastSync!).getTime())).toString())
                    : 'Nenhuma sincronização'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registros Sincronizados</CardTitle>
                <Database className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {syncHistory.reduce((sum, record) => sum + record.recordsProcessed, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  Este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {syncHistory.length > 0 
                    ? Math.round((syncHistory.filter(r => r.status === 'sucesso').length / syncHistory.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-xs text-gray-600">
                  Últimas 30 sincronizações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Sistemas */}
          <div className="grid gap-6">
            {systems.map((system) => {
              const StatusIcon = getStatusIcon(system.status)
              const statusColor = getStatusColor(system.status)

              return (
                <Card key={system.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${statusColor.split(' ')[1]}`}>
                          {system.type === 'cloud' && <Cloud className={`h-6 w-6 ${statusColor.split(' ')[0]}`} />}
                          {system.type === 'desktop' && <Server className={`h-6 w-6 ${statusColor.split(' ')[0]}`} />}
                          {system.type === 'web' && <Database className={`h-6 w-6 ${statusColor.split(' ')[0]}`} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{system.name}</h3>
                          <p className="text-gray-600">{system.provider} • {system.type}</p>
                          {system.lastSync && (
                            <p className="text-sm text-gray-500">
                              Última sincronização: {formatDateTime(system.lastSync)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColor}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {system.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Features</p>
                        <p className="font-medium">{system.features.length} funcionalidades</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sincronização</p>
                        <p className="font-medium">
                          {system.syncSettings.automatic ? 'Automática' : 'Manual'} • {system.syncSettings.frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dados Mapeados</p>
                        <p className="font-medium">
                          {Object.values(system.dataMapping).filter(Boolean).length} de {Object.keys(system.dataMapping).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Credenciais</p>
                        <p className="font-medium flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-green-600" />
                          {system.credentials.encrypted ? 'Criptografadas' : 'Não criptografadas'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Funcionalidades Disponíveis</p>
                        <div className="flex flex-wrap gap-2">
                          {system.features.map((feature, index) => (
                            <Badge key={index} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-2">
                          {system.status === 'conectado' ? (
                            <Button variant="outline" size="sm">
                              <StopCircle className="h-3 w-3 mr-1" />
                              Desconectar
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleConnect(system.id)}
                              disabled={isConnecting}
                            >
                              {isConnecting ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <PlayCircle className="h-3 w-3 mr-1" />
                              )}
                              Conectar
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Sync className="h-3 w-3 mr-1" />
                            Sincronizar Agora
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurar
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Relatórios
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="sincronizacao" className="space-y-6">
          {/* Histórico de Sincronizações */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronizações</CardTitle>
              <CardDescription>Últimas execuções de sincronização de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncHistory.map((record) => {
                  const system = systems.find(s => s.id === record.systemId)
                  const successRate = record.recordsTotal > 0 ? (record.summary.created + record.summary.updated) / record.recordsTotal * 100 : 0

                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getSyncStatusColor(record.status).split(' ')[1]}`}>
                          {record.status === 'sucesso' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {record.status === 'erro' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {record.status === 'parcial' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                          {record.status === 'em-andamento' && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                        </div>
                        <div>
                          <p className="font-medium">{system?.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(record.timestamp)} • {record.duration}s
                          </p>
                          <p className="text-sm text-gray-600">
                            {record.recordsProcessed.toLocaleString()} de {record.recordsTotal.toLocaleString()} registros
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge className={getSyncStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          Taxa de Sucesso: {successRate.toFixed(1)}%
                        </div>
                        {record.recordsTotal > 0 && (
                          <Progress value={successRate} className="w-24 h-2" />
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-1 ml-4">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <span className="block font-medium text-green-600">{record.summary.created}</span>
                            <span className="text-gray-500">Criados</span>
                          </div>
                          <div className="text-center">
                            <span className="block font-medium text-blue-600">{record.summary.updated}</span>
                            <span className="text-gray-500">Atualizados</span>
                          </div>
                          <div className="text-center">
                            <span className="block font-medium text-red-600">{record.summary.failed}</span>
                            <span className="text-gray-500">Falhas</span>
                          </div>
                        </div>
                        {record.errors.length > 0 && (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Erros ({record.errors.length})
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance de Sincronização</CardTitle>
              <CardDescription>Histórico de sucessos e falhas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={syncPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sucessos" fill="#10b981" name="Sucessos" />
                  <Bar dataKey="erros" fill="#ef4444" name="Erros" />
                  <Bar dataKey="parciais" fill="#f59e0b" name="Parciais" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados" className="space-y-6">
          {/* Dados Contábeis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano de Contas</CardTitle>
                <CardDescription>{accountingData.accounts.length} contas sincronizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accountingData.accounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{account.code} - {account.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{account.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(account.lastUpdate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Lançamentos</CardTitle>
                <CardDescription>{accountingData.transactions.length} transações recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accountingData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.credit > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.credit > 0 ? (
                            <FileCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <FileX className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.account} • {transaction.date}
                          </p>
                          <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.credit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.credit > 0 ? 'C' : 'D'} R$ {(transaction.credit || transaction.debit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volume de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Dados por Sistema</CardTitle>
              <CardDescription>Quantidade de registros sincronizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataVolumeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sistema" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transacoes" fill="#3b82f6" name="Transações" />
                  <Bar dataKey="contas" fill="#10b981" name="Contas" />
                  <Bar dataKey="clientes" fill="#f59e0b" name="Clientes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-4">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar Dados
            </Button>
            <Button variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Relatório Contábil
            </Button>
            <Button variant="outline">
              <Sync className="w-4 h-4 mr-2" />
              Sincronizar Tudo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="monitoramento" className="space-y-6">
          {/* Status dos Sistemas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Sistemas</CardTitle>
                <CardDescription>Distribuição do status atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={systemStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {systemStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>Indicadores de saúde dos sistemas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Disponibilidade Geral</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={95} className="w-24" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Sucesso</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={88} className="w-24" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tempo Médio de Resposta</span>
                    <span className="text-sm font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Última Falha</span>
                    <span className="text-sm text-gray-600">Há 2 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas e Notificações */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Ativos</CardTitle>
              <CardDescription>Situações que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">QuickBooks Online - Falha de Conexão</p>
                    <p className="text-sm text-red-700">
                      Sistema fora do ar há 3 horas. Última tentativa de sincronização falhou.
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Resolver
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">Alterdata Fiscal - Credenciais Expirando</p>
                    <p className="text-sm text-yellow-700">
                      Credenciais de API expiram em 15 dias. Renove para manter a sincronização.
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Renovar
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">ContábilMax Pro - Sincronização Lenta</p>
                    <p className="text-sm text-blue-700">
                      Últimas sincronizações estão demorando mais que o normal (60s+ vs 30s médio).
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Investigar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configurações globais do sistema de integração</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout de Conexão (segundos)</Label>
                    <Input 
                      id="timeout"
                      type="number" 
                      defaultValue="30"
                      title="Tempo limite para conexões de API"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retry-attempts">Tentativas de Retry</Label>
                    <Input 
                      id="retry-attempts"
                      type="number" 
                      defaultValue="3"
                      title="Número de tentativas em caso de falha"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Configurações de Segurança</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="encrypt-credentials"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Criptografar credenciais armazenadas"
                      />
                      <Label htmlFor="encrypt-credentials">Criptografar credenciais armazenadas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="enable-audit-log"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Registrar todas as atividades de sincronização"
                      />
                      <Label htmlFor="enable-audit-log">Log de auditoria detalhado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="validate-ssl"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Validar certificados SSL/TLS"
                      />
                      <Label htmlFor="validate-ssl">Validação SSL/TLS obrigatória</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Notificações</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="notify-errors"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Notificar sobre erros de sincronização"
                      />
                      <Label htmlFor="notify-errors">Notificar sobre erros de sincronização</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="notify-success"
                        className="rounded border-gray-300"
                        title="Notificar sobre sincronizações bem-sucedidas"
                      />
                      <Label htmlFor="notify-success">Notificar sobre sincronizações bem-sucedidas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="daily-report"
                        defaultChecked
                        className="rounded border-gray-300"
                        title="Enviar relatório diário de sincronizações"
                      />
                      <Label htmlFor="daily-report">Relatório diário por email</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button>Salvar Configurações</Button>
                  <Button variant="outline">Restaurar Padrões</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AccountingIntegration
