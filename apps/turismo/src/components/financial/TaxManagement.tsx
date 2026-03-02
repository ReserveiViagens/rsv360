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
  FileText, 
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Shield,
  Building,
  Percent,
  DollarSign,
  BarChart3,
  TrendingUp,
  Archive,
  BookOpen,
  Settings,
  Globe,
  AlertCircle,
  CheckSquare,
  XCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell } from 'recharts'

// Tipos de dados para gestão fiscal
interface TaxObligation {
  id: string
  name: string
  type: 'federal' | 'estadual' | 'municipal'
  category: 'PIS' | 'COFINS' | 'ICMS' | 'ISS' | 'IRPJ' | 'CSLL' | 'IPI' | 'INSS' | 'FGTS'
  dueDate: string
  period: string
  amount: number
  status: 'pendente' | 'pago' | 'vencido' | 'parcelado'
  paymentDate?: string
  reference: string
  penalty?: number
  interest?: number
  description: string
}

interface TaxReturn {
  id: string
  type: 'SPED_FISCAL' | 'SPED_CONTRIBUICOES' | 'ECF' | 'EFD_REINF' | 'DCTF' | 'DIRF' | 'DEFIS'
  period: string
  dueDate: string
  status: 'nao_iniciado' | 'em_andamento' | 'validado' | 'transmitido' | 'processado' | 'rejeitado'
  protocol?: string
  transmissionDate?: string
  validationErrors: string[]
  fileSize?: number
  recordCount?: number
  description: string
}

interface TaxRule {
  id: string
  name: string
  type: 'aliquota' | 'base_calculo' | 'isencao' | 'reducao'
  category: string
  description: string
  rate?: number
  conditions: string[]
  validFrom: string
  validTo?: string
  status: 'ativo' | 'inativo' | 'suspenso'
  source: string
}

interface ComplianceItem {
  id: string
  requirement: string
  description: string
  category: 'obrigacao_principal' | 'obrigacao_acessoria' | 'documentacao' | 'controle'
  status: 'conforme' | 'nao_conforme' | 'em_avaliacao' | 'nao_aplicavel'
  lastReview: string
  nextReview: string
  responsible: string
  priority: 'alta' | 'media' | 'baixa'
  evidence?: string[]
}

const TaxManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('obrigacoes')
  const [isObligationModalOpen, setIsObligationModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('2024')
  const [filterStatus, setFilterStatus] = useState('todos')

  // Dados mock para demonstração
  const [obligations] = useState<TaxObligation[]>([
    {
      id: '1',
      name: 'PIS/COFINS - Janeiro 2025',
      type: 'federal',
      category: 'PIS',
      dueDate: '2025-02-25',
      period: '2025-01',
      amount: 15800,
      status: 'pendente',
      reference: 'DCTF-WEB-JAN-2025',
      description: 'Contribuição para PIS/COFINS referente ao mês de janeiro'
    },
    {
      id: '2',
      name: 'ICMS - Janeiro 2025',
      type: 'estadual',
      category: 'ICMS',
      dueDate: '2025-02-20',
      period: '2025-01',
      amount: 28500,
      status: 'pendente',
      reference: 'GIA-ICMS-JAN-2025',
      description: 'Imposto sobre Circulação de Mercadorias e Serviços'
    },
    {
      id: '3',
      name: 'ISS - Janeiro 2025',
      type: 'municipal',
      category: 'ISS',
      dueDate: '2025-02-15',
      period: '2025-01',
      amount: 8200,
      status: 'pago',
      paymentDate: '2025-02-10',
      reference: 'DAM-ISS-JAN-2025',
      description: 'Imposto sobre Serviços de Qualquer Natureza'
    },
    {
      id: '4',
      name: 'IRPJ/CSLL - 4º Trimestre 2024',
      type: 'federal',
      category: 'IRPJ',
      dueDate: '2025-01-31',
      period: '2024-Q4',
      amount: 45000,
      status: 'vencido',
      reference: 'DCTF-IRPJ-Q4-2024',
      penalty: 2250,
      interest: 1350,
      description: 'Imposto de Renda Pessoa Jurídica e Contribuição Social'
    },
    {
      id: '5',
      name: 'INSS - Janeiro 2025',
      type: 'federal',
      category: 'INSS',
      dueDate: '2025-02-20',
      period: '2025-01',
      amount: 12400,
      status: 'parcelado',
      reference: 'GPS-INSS-JAN-2025',
      description: 'Contribuição Previdenciária'
    }
  ])

  const [taxReturns] = useState<TaxReturn[]>([
    {
      id: '1',
      type: 'SPED_FISCAL',
      period: '2024-12',
      dueDate: '2025-01-31',
      status: 'transmitido',
      protocol: 'SP240001234567890',
      transmissionDate: '2025-01-25',
      validationErrors: [],
      fileSize: 2048,
      recordCount: 15420,
      description: 'Escrituração Fiscal Digital - EFD ICMS/IPI'
    },
    {
      id: '2',
      type: 'ECF',
      period: '2024',
      dueDate: '2025-07-31',
      status: 'em_andamento',
      validationErrors: ['Divergência na apuração do IRPJ', 'Falta informação sobre investimentos'],
      description: 'Escrituração Contábil Fiscal'
    },
    {
      id: '3',
      type: 'SPED_CONTRIBUICOES',
      period: '2024-12',
      dueDate: '2025-02-28',
      status: 'validado',
      validationErrors: [],
      fileSize: 1536,
      recordCount: 8750,
      description: 'SPED PIS/COFINS'
    },
    {
      id: '4',
      type: 'DIRF',
      period: '2024',
      dueDate: '2025-02-28',
      status: 'nao_iniciado',
      validationErrors: [],
      description: 'Declaração do Imposto de Renda Retido na Fonte'
    }
  ])

  const [taxRules] = useState<TaxRule[]>([
    {
      id: '1',
      name: 'PIS/COFINS - Regime Não Cumulativo',
      type: 'aliquota',
      category: 'PIS/COFINS',
      description: 'Alíquotas para empresas no regime não cumulativo',
      rate: 9.25,
      conditions: ['Receita bruta anual > R$ 78 milhões', 'Pessoa jurídica tributada pelo lucro real'],
      validFrom: '2024-01-01',
      status: 'ativo',
      source: 'Lei 10.833/2003'
    },
    {
      id: '2',
      name: 'ICMS - Operações Interestaduais',
      type: 'aliquota',
      category: 'ICMS',
      description: 'Alíquotas para operações entre estados',
      rate: 12.0,
      conditions: ['Operação interestadual', 'Contribuinte destinatário'],
      validFrom: '2024-01-01',
      status: 'ativo',
      source: 'Convênio ICMS 52/2017'
    },
    {
      id: '3',
      name: 'ISS - Serviços de Turismo',
      type: 'aliquota',
      category: 'ISS',
      description: 'Alíquota específica para serviços de turismo',
      rate: 3.0,
      conditions: ['Serviços de agência de turismo', 'Município de São Paulo'],
      validFrom: '2024-01-01',
      status: 'ativo',
      source: 'Lei Municipal 13.701/2003'
    }
  ])

  const [complianceItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      requirement: 'Escrituração do Livro de Apuração do Lucro Real - LALUR',
      description: 'Manutenção e escrituração do LALUR conforme legislação',
      category: 'obrigacao_principal',
      status: 'conforme',
      lastReview: '2025-01-15',
      nextReview: '2025-04-15',
      responsible: 'Contador Responsável',
      priority: 'alta',
      evidence: ['LALUR_2024.pdf', 'Balancete_Dezembro_2024.pdf']
    },
    {
      id: '2',
      requirement: 'Controle de Estoque Fiscal',
      description: 'Manutenção de controles adequados de estoque para fins fiscais',
      category: 'controle',
      status: 'nao_conforme',
      lastReview: '2025-01-10',
      nextReview: '2025-02-10',
      responsible: 'Coordenador Fiscal',
      priority: 'alta',
      evidence: []
    },
    {
      id: '3',
      requirement: 'Arquivo de Documentos Fiscais',
      description: 'Arquivo e guarda de documentos fiscais pelo prazo legal',
      category: 'documentacao',
      status: 'conforme',
      lastReview: '2025-01-05',
      nextReview: '2025-07-05',
      responsible: 'Assistente Fiscal',
      priority: 'media',
      evidence: ['Politica_Arquivo_Fiscal.pdf']
    },
    {
      id: '4',
      requirement: 'Cálculo e Recolhimento de Substituição Tributária',
      description: 'Procedimentos de ST quando aplicável',
      category: 'obrigacao_principal',
      status: 'nao_aplicavel',
      lastReview: '2025-01-01',
      nextReview: '2025-12-31',
      responsible: 'Analista Fiscal',
      priority: 'baixa',
      evidence: []
    }
  ])

  // Dados para gráficos
  const taxTrendData = [
    { mes: 'Jul 2024', federal: 45000, estadual: 28000, municipal: 8500, total: 81500 },
    { mes: 'Ago 2024', federal: 48000, estadual: 30000, municipal: 9000, total: 87000 },
    { mes: 'Set 2024', federal: 46500, estadual: 29000, municipal: 8800, total: 84300 },
    { mes: 'Out 2024', federal: 52000, estadual: 32000, municipal: 9500, total: 93500 },
    { mes: 'Nov 2024', federal: 49000, estadual: 31000, municipal: 9200, total: 89200 },
    { mes: 'Dez 2024', federal: 55000, estadual: 34000, municipal: 10000, total: 99000 }
  ]

  const obligationStatusData = [
    { name: 'Pendentes', value: 2, color: '#f59e0b' },
    { name: 'Pagas', value: 1, color: '#10b981' },
    { name: 'Vencidas', value: 1, color: '#ef4444' },
    { name: 'Parceladas', value: 1, color: '#3b82f6' }
  ]

  const complianceStatusData = [
    { name: 'Conforme', value: 2, color: '#10b981' },
    { name: 'Não Conforme', value: 1, color: '#ef4444' },
    { name: 'Em Avaliação', value: 0, color: '#f59e0b' },
    { name: 'Não Aplicável', value: 1, color: '#6b7280' }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'pago': return 'bg-green-100 text-green-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      case 'parcelado': return 'bg-blue-100 text-blue-800'
      case 'transmitido': return 'bg-green-100 text-green-800'
      case 'em_andamento': return 'bg-blue-100 text-blue-800'
      case 'validado': return 'bg-green-100 text-green-800'
      case 'rejeitado': return 'bg-red-100 text-red-800'
      case 'nao_iniciado': return 'bg-gray-100 text-gray-800'
      case 'conforme': return 'bg-green-100 text-green-800'
      case 'nao_conforme': return 'bg-red-100 text-red-800'
      case 'em_avaliacao': return 'bg-yellow-100 text-yellow-800'
      case 'nao_aplicavel': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return Clock
      case 'pago': return CheckCircle
      case 'vencido': return AlertTriangle
      case 'parcelado': return Calendar
      case 'transmitido': return CheckCircle
      case 'em_andamento': return Clock
      case 'validado': return CheckSquare
      case 'rejeitado': return XCircle
      case 'nao_iniciado': return AlertCircle
      case 'conforme': return CheckCircle
      case 'nao_conforme': return AlertTriangle
      case 'em_avaliacao': return Clock
      case 'nao_aplicavel': return XCircle
      default: return AlertCircle
    }
  }

  const getTaxTypeIcon = (type: string) => {
    switch (type) {
      case 'federal': return Building
      case 'estadual': return Globe
      case 'municipal': return Building
      default: return FileText
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'border-red-500 bg-red-50'
      case 'media': return 'border-yellow-500 bg-yellow-50'
      case 'baixa': return 'border-green-500 bg-green-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const ObligationForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="obligation-name">Nome da Obrigação</Label>
          <Input 
            id="obligation-name"
            placeholder="Ex: ICMS - Janeiro 2025"
            title="Nome da obrigação tributária"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="obligation-amount">Valor</Label>
          <Input 
            id="obligation-amount"
            type="number" 
            placeholder="0,00"
            title="Valor da obrigação"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax-type">Esfera</Label>
          <Select>
            <SelectTrigger title="Selecionar esfera tributária">
              <SelectValue placeholder="Selecionar esfera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="federal">Federal</SelectItem>
              <SelectItem value="estadual">Estadual</SelectItem>
              <SelectItem value="municipal">Municipal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-category">Categoria</Label>
          <Select>
            <SelectTrigger title="Selecionar categoria do imposto">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PIS">PIS</SelectItem>
              <SelectItem value="COFINS">COFINS</SelectItem>
              <SelectItem value="ICMS">ICMS</SelectItem>
              <SelectItem value="ISS">ISS</SelectItem>
              <SelectItem value="IRPJ">IRPJ</SelectItem>
              <SelectItem value="CSLL">CSLL</SelectItem>
              <SelectItem value="IPI">IPI</SelectItem>
              <SelectItem value="INSS">INSS</SelectItem>
              <SelectItem value="FGTS">FGTS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-date">Data de Vencimento</Label>
          <Input 
            id="due-date"
            type="date"
            title="Data de vencimento da obrigação"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="period">Período de Referência</Label>
          <Input 
            id="period"
            placeholder="Ex: 2025-01"
            title="Período de referência da obrigação"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference">Referência/Código</Label>
          <Input 
            id="reference"
            placeholder="Ex: DCTF-WEB-JAN-2025"
            title="Código de referência da obrigação"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description"
          placeholder="Descrição detalhada da obrigação tributária"
          title="Descrição da obrigação"
        />
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Fiscal e Tributária</h1>
          <p className="text-gray-600">Controle completo de obrigações e compliance fiscal</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isObligationModalOpen} onOpenChange={setIsObligationModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Obrigação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Obrigação Tributária</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova obrigação fiscal
                </DialogDescription>
              </DialogHeader>
              <ObligationForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsObligationModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsObligationModalOpen(false)}>
                  Salvar Obrigação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Relatório Fiscal
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="obrigacoes">Obrigações</TabsTrigger>
          <TabsTrigger value="declaracoes">Declarações</TabsTrigger>
          <TabsTrigger value="regras">Regras Fiscais</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="obrigacoes" className="space-y-6">
          {/* Resumo das Obrigações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(obligations.filter(o => ['pendente', 'vencido'].includes(o.status)).reduce((sum, o) => sum + o.amount + (o.penalty || 0) + (o.interest || 0), 0))}
                </div>
                <p className="text-xs text-gray-600">
                  {obligations.filter(o => ['pendente', 'vencido'].includes(o.status)).length} obrigações pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {obligations.filter(o => o.status === 'vencido').length}
                </div>
                <p className="text-xs text-gray-600">
                  {formatCurrency(obligations.filter(o => o.status === 'vencido').reduce((sum, o) => sum + (o.penalty || 0) + (o.interest || 0), 0))} em multas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Vencimentos</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {obligations.filter(o => o.status === 'pendente' && new Date(o.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <p className="text-xs text-gray-600">
                  Nos próximos 7 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagas este Mês</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(obligations.filter(o => o.status === 'pago').reduce((sum, o) => sum + o.amount, 0))}
                </div>
                <p className="text-xs text-gray-600">
                  {obligations.filter(o => o.status === 'pago').length} obrigações cumpridas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48" title="Filtrar por status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="pago">Pagas</SelectItem>
                    <SelectItem value="vencido">Vencidas</SelectItem>
                    <SelectItem value="parcelado">Parceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48" title="Filtrar por período">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="todos">Todos os períodos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Obrigações */}
          <div className="grid gap-6">
            {obligations.filter(o => filterStatus === 'todos' || o.status === filterStatus).map((obligation) => {
              const StatusIcon = getStatusIcon(obligation.status)
              const TypeIcon = getTaxTypeIcon(obligation.type)
              const isOverdue = new Date(obligation.dueDate) < new Date() && obligation.status === 'pendente'
              const daysTodue = Math.ceil((new Date(obligation.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

              return (
                <Card key={obligation.id} className={`overflow-hidden ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getStatusColor(obligation.status).split(' ')[1]}`}>
                          <TypeIcon className={`h-6 w-6 ${getStatusColor(obligation.status).split(' ')[0]}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{obligation.name}</h3>
                          <p className="text-gray-600">{obligation.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500 capitalize">
                              {obligation.type} • {obligation.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              Período: {obligation.period}
                            </span>
                            <span className="text-sm text-gray-500">
                              Ref: {obligation.reference}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(obligation.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {obligation.status.replace('_', ' ')}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">
                            Vencida
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Principal</p>
                        <p className="text-lg font-bold">{formatCurrency(obligation.amount)}</p>
                      </div>
                      {obligation.penalty && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Multa</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(obligation.penalty)}</p>
                        </div>
                      )}
                      {obligation.interest && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Juros</p>
                          <p className="text-lg font-bold text-orange-600">{formatCurrency(obligation.interest)}</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(obligation.amount + (obligation.penalty || 0) + (obligation.interest || 0))}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Vencimento: {formatDate(obligation.dueDate)}
                        </span>
                        {obligation.status === 'pendente' && (
                          <span className={`text-sm ${daysTodue < 0 ? 'text-red-600' : daysTodue <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {daysTodue < 0 ? `${Math.abs(daysTodue)} dias em atraso` : 
                             daysTodue === 0 ? 'Vence hoje' :
                             `${daysTodue} dias restantes`}
                          </span>
                        )}
                        {obligation.paymentDate && (
                          <span className="text-sm text-green-600">
                            Pago em: {formatDate(obligation.paymentDate)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-2">
                          {obligation.status === 'pendente' && (
                            <>
                              <Button size="sm">
                                <Send className="h-3 w-3 mr-1" />
                                Pagar
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                Agendar
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Boleto/DARE
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calculator className="h-3 w-3 mr-1" />
                            Calcular
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
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

        <TabsContent value="declaracoes" className="space-y-6">
          {/* Status das Declarações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transmitidas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {taxReturns.filter(t => t.status === 'transmitido').length}
                </div>
                <p className="text-xs text-gray-600">Este período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {taxReturns.filter(t => t.status === 'em_andamento').length}
                </div>
                <p className="text-xs text-gray-600">Sendo elaboradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {taxReturns.filter(t => t.status === 'nao_iniciado').length}
                </div>
                <p className="text-xs text-gray-600">Não iniciadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Erros</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {taxReturns.filter(t => t.validationErrors.length > 0).length}
                </div>
                <p className="text-xs text-gray-600">Requerem atenção</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Declarações */}
          <Card>
            <CardHeader>
              <CardTitle>Declarações e Obrigações Acessórias</CardTitle>
              <CardDescription>Status das principais declarações fiscais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxReturns.map((taxReturn) => {
                  const StatusIcon = getStatusIcon(taxReturn.status)
                  const isNearDue = new Date(taxReturn.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                  return (
                    <div key={taxReturn.id} className={`flex items-center justify-between p-4 border rounded-lg ${isNearDue && taxReturn.status === 'nao_iniciado' ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(taxReturn.status).split(' ')[1]}`}>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(taxReturn.status).split(' ')[0]}`} />
                        </div>
                        <div>
                          <p className="font-medium">{taxReturn.type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">{taxReturn.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Período: {taxReturn.period}
                            </span>
                            <span className="text-xs text-gray-500">
                              Vencimento: {formatDate(taxReturn.dueDate)}
                            </span>
                            {taxReturn.protocol && (
                              <span className="text-xs text-gray-500">
                                Protocolo: {taxReturn.protocol}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(taxReturn.status)}>
                          {taxReturn.status.replace('_', ' ')}
                        </Badge>
                        {taxReturn.validationErrors.length > 0 && (
                          <div className="text-xs text-red-600">
                            {taxReturn.validationErrors.length} erro(s)
                          </div>
                        )}
                        {taxReturn.recordCount && (
                          <div className="text-xs text-gray-500">
                            {taxReturn.recordCount.toLocaleString()} registros
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {taxReturn.status === 'nao_iniciado' && (
                          <Button size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {taxReturn.status === 'em_andamento' && (
                          <Button size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Continuar
                          </Button>
                        )}
                        {taxReturn.status === 'validado' && (
                          <Button size="sm">
                            <Send className="h-3 w-3 mr-1" />
                            Transmitir
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                        {taxReturn.validationErrors.length > 0 && (
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Ver Erros
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

        <TabsContent value="regras" className="space-y-6">
          {/* Regras Fiscais */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Regras e Legislação Fiscal</CardTitle>
                <CardDescription>Alíquotas e regras aplicáveis ao negócio</CardDescription>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Regra
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(rule.status)}>
                          {rule.status}
                        </Badge>
                        {rule.rate && (
                          <Badge variant="outline">
                            <Percent className="h-3 w-3 mr-1" />
                            {rule.rate}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Categoria:</p>
                        <p className="font-medium">{rule.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fonte Legal:</p>
                        <p className="font-medium">{rule.source}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Condições de Aplicação:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <li key={index} className="text-gray-700">{condition}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-gray-500">
                        Vigência: {formatDate(rule.validFrom)} {rule.validTo && `até ${formatDate(rule.validTo)}`}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Legislação
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Dashboard de Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status de Compliance</CardTitle>
                <CardDescription>Distribuição dos requisitos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
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

            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Taxa de Conformidade</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-24" />
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Itens Críticos</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={100} className="w-24" />
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Última Auditoria</span>
                    <span className="text-sm font-medium">15/01/2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Próxima Revisão</span>
                    <span className="text-sm text-yellow-600">10/02/2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Itens de Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Compliance</CardTitle>
              <CardDescription>Requisitos e controles fiscais obrigatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.status)
                  const priorityColor = getPriorityColor(item.priority)

                  return (
                    <div key={item.id} className={`border-l-4 rounded-lg p-4 ${priorityColor}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <StatusIcon className={`h-5 w-5 mt-1 ${getStatusColor(item.status).split(' ')[0]}`} />
                          <div>
                            <h4 className="font-semibold">{item.requirement}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={
                            item.priority === 'alta' ? 'border-red-500 text-red-700' :
                            item.priority === 'media' ? 'border-yellow-500 text-yellow-700' :
                            'border-green-500 text-green-700'
                          }>
                            {item.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Categoria:</span>
                          <p className="font-medium capitalize">{item.category.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Responsável:</span>
                          <p className="font-medium">{item.responsible}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Última Revisão:</span>
                          <p className="font-medium">{formatDate(item.lastReview)}</p>
                        </div>
                      </div>

                      {item.evidence && item.evidence.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Evidências:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.evidence.map((evidence, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {evidence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-600">
                          Próxima revisão: {formatDate(item.nextReview)}
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Upload className="h-3 w-3 mr-1" />
                            Evidências
                          </Button>
                          <Button variant="outline" size="sm">
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Revisar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analises" className="space-y-6">
          {/* Análise Fiscal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Carga Tributária</CardTitle>
              <CardDescription>Análise mensal dos tributos por esfera</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={taxTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="federal" fill="#ef4444" name="Federal" />
                  <Bar dataKey="estadual" fill="#3b82f6" name="Estadual" />
                  <Bar dataKey="municipal" fill="#10b981" name="Municipal" />
                  <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Situação atual das obrigações</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={obligationStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {obligationStatusData.map((entry, index) => (
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
                <CardTitle>Indicadores Fiscais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Carga Tributária Efetiva</span>
                    <span className="font-bold text-blue-600">12.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tributos sobre Faturamento</span>
                    <span className="font-bold">8.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tributos sobre Lucro</span>
                    <span className="font-bold">4.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Economia Fiscal (Ano)</span>
                    <span className="font-bold text-green-600">{formatCurrency(125000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Multas e Juros Evitados</span>
                    <span className="font-bold text-green-600">{formatCurrency(18500)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário Fiscal</CardTitle>
              <CardDescription>Próximos vencimentos e obrigações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendário Fiscal</h3>
                <p className="text-gray-600 mb-4">
                  Visualização completa dos vencimentos fiscais será implementada aqui
                </p>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Calendário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TaxManagement
