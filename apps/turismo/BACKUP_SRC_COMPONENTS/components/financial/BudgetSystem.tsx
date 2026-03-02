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
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Filter,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar } from 'recharts'

// Tipos de dados do sistema de orçamentos
interface Budget {
  id: string
  name: string
  description: string
  category: string
  budgetAmount: number
  spentAmount: number
  committedAmount: number
  period: 'mensal' | 'trimestral' | 'anual' | 'personalizado'
  startDate: string
  endDate: string
  status: 'ativo' | 'pausado' | 'finalizado' | 'excedido'
  owner: string
  alerts: {
    percentage: number
    enabled: boolean
    lastAlert?: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface BudgetExpense {
  id: string
  budgetId: string
  amount: number
  description: string
  category: string
  date: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  approvedBy?: string
  reference?: string
}

interface BudgetTemplate {
  id: string
  name: string
  description: string
  categories: {
    name: string
    percentage: number
    amount: number
  }[]
  period: string
  tags: string[]
}

const BudgetSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orcamentos')
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [budgetFilter, setBudgetFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mock para demonstração
  const [budgets] = useState<Budget[]>([
    {
      id: '1',
      name: 'Orçamento Operacional Q1',
      description: 'Orçamento para despesas operacionais do primeiro trimestre',
      category: 'Operacional',
      budgetAmount: 50000,
      spentAmount: 32000,
      committedAmount: 8000,
      period: 'trimestral',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      status: 'ativo',
      owner: 'João Silva',
      alerts: { percentage: 80, enabled: true },
      tags: ['operacional', 'trimestral', 'core'],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-15'
    },
    {
      id: '2',
      name: 'Marketing Digital 2025',
      description: 'Investimento em marketing digital e campanhas publicitárias',
      category: 'Marketing',
      budgetAmount: 25000,
      spentAmount: 28000,
      committedAmount: 2000,
      period: 'anual',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'excedido',
      owner: 'Maria Santos',
      alerts: { percentage: 90, enabled: true, lastAlert: '2025-01-10' },
      tags: ['marketing', 'digital', 'campanhas'],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-15'
    },
    {
      id: '3',
      name: 'Recursos Humanos',
      description: 'Orçamento mensal para folha de pagamento e benefícios',
      category: 'RH',
      budgetAmount: 15000,
      spentAmount: 12500,
      committedAmount: 1500,
      period: 'mensal',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'ativo',
      owner: 'Carlos Oliveira',
      alerts: { percentage: 85, enabled: true },
      tags: ['rh', 'salários', 'benefícios'],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-14'
    },
    {
      id: '4',
      name: 'Infraestrutura TI',
      description: 'Modernização da infraestrutura de tecnologia',
      category: 'TI',
      budgetAmount: 30000,
      spentAmount: 18000,
      committedAmount: 5000,
      period: 'anual',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'ativo',
      owner: 'Ana Costa',
      alerts: { percentage: 75, enabled: true },
      tags: ['ti', 'infraestrutura', 'tecnologia'],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-12'
    }
  ])

  const [budgetTemplates] = useState<BudgetTemplate[]>([
    {
      id: '1',
      name: 'Orçamento Padrão Mensal',
      description: 'Template para orçamento mensal padrão da empresa',
      categories: [
        { name: 'Operacional', percentage: 40, amount: 20000 },
        { name: 'Marketing', percentage: 25, amount: 12500 },
        { name: 'RH', percentage: 30, amount: 15000 },
        { name: 'Diversos', percentage: 5, amount: 2500 }
      ],
      period: 'mensal',
      tags: ['padrão', 'mensal', 'empresa']
    },
    {
      id: '2',
      name: 'Projeto Especial',
      description: 'Template para orçamentos de projetos especiais',
      categories: [
        { name: 'Desenvolvimento', percentage: 50, amount: 25000 },
        { name: 'Marketing', percentage: 20, amount: 10000 },
        { name: 'Operacional', percentage: 25, amount: 12500 },
        { name: 'Contingência', percentage: 5, amount: 2500 }
      ],
      period: 'trimestral',
      tags: ['projeto', 'desenvolvimento', 'especial']
    }
  ])

  const [expenses] = useState<BudgetExpense[]>([
    {
      id: '1',
      budgetId: '1',
      amount: 5000,
      description: 'Compra de equipamentos de escritório',
      category: 'Equipamentos',
      date: '2025-01-15',
      status: 'aprovado',
      approvedBy: 'João Silva',
      reference: 'EQ-001'
    },
    {
      id: '2',
      budgetId: '2',
      amount: 3500,
      description: 'Campanha Google Ads - Janeiro',
      category: 'Publicidade',
      date: '2025-01-14',
      status: 'aprovado',
      approvedBy: 'Maria Santos',
      reference: 'PUB-002'
    },
    {
      id: '3',
      budgetId: '1',
      amount: 2000,
      description: 'Manutenção de equipamentos',
      category: 'Manutenção',
      date: '2025-01-16',
      status: 'pendente',
      reference: 'MAN-003'
    }
  ])

  // Dados para gráficos
  const budgetPerformanceData = budgets.map(budget => ({
    name: budget.name,
    orcado: budget.budgetAmount,
    gasto: budget.spentAmount,
    comprometido: budget.committedAmount,
    disponivel: budget.budgetAmount - budget.spentAmount - budget.committedAmount
  }))

  const categoryData = budgets.reduce((acc, budget) => {
    const existing = acc.find(item => item.category === budget.category)
    if (existing) {
      existing.total += budget.budgetAmount
      existing.gasto += budget.spentAmount
    } else {
      acc.push({
        category: budget.category,
        total: budget.budgetAmount,
        gasto: budget.spentAmount
      })
    }
    return acc
  }, [] as Array<{ category: string; total: number; gasto: number }>)

  const monthlyTrendData = [
    { month: 'Jan', planejado: 50000, realizado: 42000, variacao: -8000 },
    { month: 'Fev', planejado: 52000, realizado: 48000, variacao: -4000 },
    { month: 'Mar', planejado: 55000, realizado: 58000, variacao: 3000 },
    { month: 'Abr', planejado: 53000, realizado: 51000, variacao: -2000 },
    { month: 'Mai', planejado: 60000, realizado: 59000, variacao: -1000 },
    { month: 'Jun', planejado: 58000, realizado: 62000, variacao: 4000 }
  ]

  // Filtros
  const filteredBudgets = budgets.filter(budget => {
    const matchesFilter = budgetFilter === 'todos' || budget.status === budgetFilter
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getBudgetPercentage = (budget: Budget) => {
    return ((budget.spentAmount + budget.committedAmount) / budget.budgetAmount) * 100
  }

  const getBudgetStatus = (budget: Budget) => {
    const percentage = getBudgetPercentage(budget)
    if (percentage >= 100) return { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle, label: 'Excedido' }
    if (percentage >= 90) return { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertTriangle, label: 'Crítico' }
    if (percentage >= 80) return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock, label: 'Atenção' }
    return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Saudável' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'pausado': return 'bg-yellow-100 text-yellow-800'
      case 'finalizado': return 'bg-gray-100 text-gray-800'
      case 'excedido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const BudgetForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget-name">Nome do Orçamento</Label>
          <Input 
            id="budget-name"
            placeholder="Ex: Marketing Q1 2025"
            title="Nome identificador do orçamento"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget-amount">Valor Total</Label>
          <Input 
            id="budget-amount"
            type="number" 
            placeholder="0,00"
            title="Valor total do orçamento"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="budget-description">Descrição</Label>
        <Textarea 
          id="budget-description"
          placeholder="Descrição detalhada do orçamento"
          title="Descrição e objetivos do orçamento"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget-category">Categoria</Label>
          <Select>
            <SelectTrigger title="Selecionar categoria">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="rh">Recursos Humanos</SelectItem>
              <SelectItem value="ti">Tecnologia</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget-period">Período</Label>
          <Select>
            <SelectTrigger title="Selecionar período">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data de Início</Label>
          <Input 
            id="start-date"
            type="date"
            title="Data de início do orçamento"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">Data de Término</Label>
          <Input 
            id="end-date"
            type="date"
            title="Data de término do orçamento"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alert-percentage">Alerta (% do orçamento)</Label>
        <Input 
          id="alert-percentage"
          type="number" 
          placeholder="80"
          min="0"
          max="100"
          title="Percentual para disparo de alertas"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-owner">Responsável</Label>
        <Select>
          <SelectTrigger title="Selecionar responsável">
            <SelectValue placeholder="Selecionar responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="joao">João Silva</SelectItem>
            <SelectItem value="maria">Maria Santos</SelectItem>
            <SelectItem value="carlos">Carlos Oliveira</SelectItem>
            <SelectItem value="ana">Ana Costa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Orçamentos</h1>
          <p className="text-gray-600">Planejamento e controle orçamentário avançado</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Templates de Orçamento</DialogTitle>
                <DialogDescription>
                  Selecione um template para criar rapidamente um novo orçamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {budgetTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {template.categories.map((category, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{category.name}</span>
                            <span className="text-sm font-medium">
                              {category.percentage}% ({formatCurrency(category.amount)})
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-4" size="sm">
                        Usar Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Crie um novo orçamento para controle de gastos
                </DialogDescription>
              </DialogHeader>
              <BudgetForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBudgetModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsBudgetModalOpen(false)}>
                  Criar Orçamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="orcamentos" className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.budgetAmount, 0))}
                </div>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.spentAmount, 0))}
                </div>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -3% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comprometido</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.committedAmount, 0))}
                </div>
                <p className="text-xs text-gray-600">
                  Aguardando aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponível</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(budgets.reduce((sum, b) => sum + (b.budgetAmount - b.spentAmount - b.committedAmount), 0))}
                </div>
                <p className="text-xs text-gray-600">
                  {((budgets.reduce((sum, b) => sum + (b.budgetAmount - b.spentAmount - b.committedAmount), 0) / budgets.reduce((sum, b) => sum + b.budgetAmount, 0)) * 100).toFixed(1)}% do total
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
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar orçamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      title="Buscar por nome ou categoria"
                    />
                  </div>
                </div>
                <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                  <SelectTrigger className="w-48" title="Filtrar por status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="pausado">Pausados</SelectItem>
                    <SelectItem value="finalizado">Finalizados</SelectItem>
                    <SelectItem value="excedido">Excedidos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Orçamentos */}
          <div className="grid gap-6">
            {filteredBudgets.map((budget) => {
              const percentage = getBudgetPercentage(budget)
              const status = getBudgetStatus(budget)
              const StatusIcon = status.icon
              const remaining = budget.budgetAmount - budget.spentAmount - budget.committedAmount

              return (
                <Card key={budget.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${status.bgColor}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{budget.name}</h3>
                          <p className="text-gray-600">{budget.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {budget.category} • {budget.period}
                            </span>
                            <span className="text-sm text-gray-500">
                              {budget.startDate} - {budget.endDate}
                            </span>
                            <span className="text-sm text-gray-500">
                              Responsável: {budget.owner}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(budget.status)}>
                          {budget.status}
                        </Badge>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Orçamento Total</p>
                        <p className="text-lg font-bold">{formatCurrency(budget.budgetAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Gasto</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(budget.spentAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Comprometido</p>
                        <p className="text-lg font-bold text-yellow-600">{formatCurrency(budget.committedAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Disponível</p>
                        <p className={`text-lg font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Utilização: {percentage.toFixed(1)}%</span>
                        <span className={percentage >= 100 ? 'text-red-600' : 'text-gray-600'}>
                          {percentage >= 100 ? `Excesso: ${formatCurrency(budget.spentAmount + budget.committedAmount - budget.budgetAmount)}` : ''}
                        </span>
                      </div>
                      
                      <Progress value={Math.min(percentage, 100)} className="h-3" />

                      {budget.alerts.enabled && percentage >= budget.alerts.percentage && (
                        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Orçamento atingiu {budget.alerts.percentage}% do limite
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex space-x-2">
                          {budget.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
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
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Relatório
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurar
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

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Orçamento</CardTitle>
                <CardDescription>Comparativo entre orçado e realizado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="orcado" fill="#3b82f6" name="Orçado" />
                    <Bar dataKey="gasto" fill="#ef4444" name="Gasto" />
                    <Bar dataKey="comprometido" fill="#f59e0b" name="Comprometido" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Orçamento vs Gasto por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="total"
                      label={({ category, total }) => `${category}: ${formatCurrency(total)}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendência Mensal</CardTitle>
              <CardDescription>Evolução do orçamento ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="planejado" stroke="#3b82f6" name="Planejado" strokeWidth={2} />
                  <Line type="monotone" dataKey="realizado" stroke="#ef4444" name="Realizado" strokeWidth={2} />
                  <Line type="monotone" dataKey="variacao" stroke="#10b981" name="Variação" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Indicadores de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Eficiência Orçamentária</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 85 }]}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockwise
                        dataKey="value"
                        fill="#10b981"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">85%</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Execução dentro do orçamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Aderência ao Planejamento</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 92 }]}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockwise
                        dataKey="value"
                        fill="#3b82f6"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">92%</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Cumprimento de metas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Controle de Gastos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 78 }]}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockwise
                        dataKey="value"
                        fill="#f59e0b"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">78%</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Orçamentos sem excesso</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada</CardTitle>
              <CardDescription>Insights e recomendações baseadas nos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Orçamentos Saudáveis</h4>
                  </div>
                  <p className="text-green-700">
                    2 orçamentos estão dentro da margem de segurança (&lt;80% utilizados).
                    Continue monitorando para manter o controle.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Atenção Necessária</h4>
                  </div>
                  <p className="text-yellow-700">
                    1 orçamento está próximo ao limite (80-100% utilizado).
                    Considere revisar os gastos ou solicitar aumento do orçamento.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">Orçamento Excedido</h4>
                  </div>
                  <p className="text-red-700">
                    Marketing Digital 2025 excedeu o orçamento em {formatCurrency(3000)}.
                    Ação imediata necessária para controlar os gastos.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Oportunidades</h4>
                  </div>
                  <p className="text-blue-700">
                    {formatCurrency(16500)} disponíveis em orçamentos subutilizados.
                    Considere realocação para áreas prioritárias.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categorias por Gasto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData
                    .sort((a, b) => b.gasto - a.gasto)
                    .map((category, index) => {
                      const percentage = (category.gasto / category.total) * 100
                      return (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }} />
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(category.gasto)}</p>
                            <p className="text-sm text-gray-600">{percentage.toFixed(1)}% do orçamento</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsões e Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Projeção de Gastos</p>
                      <p className="text-sm text-yellow-700">
                        Com o ritmo atual, Marketing pode exceder em 15% até o fim do mês
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Recomendação</p>
                      <p className="text-sm text-blue-700">
                        Considere realocar {formatCurrency(5000)} de TI para Marketing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Meta Alcançada</p>
                      <p className="text-sm text-green-700">
                        RH mantém gastos 17% abaixo do orçamento
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gastos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recentes</CardTitle>
              <CardDescription>Últimas movimentações nos orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const budget = budgets.find(b => b.id === expense.budgetId)
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          expense.status === 'aprovado' ? 'bg-green-100' :
                          expense.status === 'pendente' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <DollarSign className={`h-4 w-4 ${
                            expense.status === 'aprovado' ? 'text-green-600' :
                            expense.status === 'pendente' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">
                            {budget?.name} • {expense.category} • {expense.date}
                          </p>
                          {expense.reference && (
                            <p className="text-xs text-gray-500">Ref: {expense.reference}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <p className="font-bold text-lg text-red-600">
                          -{formatCurrency(expense.amount)}
                        </p>
                        <Badge className={
                          expense.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                          expense.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }>
                          {expense.status}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Orçamento</CardTitle>
              <CardDescription>Gere relatórios detalhados para análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Relatório Executivo',
                    description: 'Resumo executivo com principais KPIs',
                    icon: Target,
                    color: 'bg-blue-500'
                  },
                  {
                    title: 'Análise de Variação',
                    description: 'Comparativo orçado vs realizado',
                    icon: BarChart3,
                    color: 'bg-green-500'
                  },
                  {
                    title: 'Projeção de Gastos',
                    description: 'Projeções baseadas no histórico',
                    icon: TrendingUp,
                    color: 'bg-purple-500'
                  },
                  {
                    title: 'Relatório por Categoria',
                    description: 'Análise detalhada por categoria',
                    icon: PieChart,
                    color: 'bg-orange-500'
                  },
                  {
                    title: 'Controle de Alertas',
                    description: 'Histórico de alertas e ações',
                    icon: AlertTriangle,
                    color: 'bg-red-500'
                  },
                  {
                    title: 'Performance Mensal',
                    description: 'Evolução mensal dos orçamentos',
                    icon: Calendar,
                    color: 'bg-indigo-500'
                  }
                ].map((report, index) => {
                  const ReportIcon = report.icon
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`p-3 rounded-lg ${report.color}`}>
                            <ReportIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{report.title}</h3>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                        </div>
                        <Button className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BudgetSystem
