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
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  PieChart, 
  BarChart3,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts'

// Tipos de dados financeiros
interface Transaction {
  id: string
  type: 'receita' | 'despesa'
  category: string
  subcategory: string
  amount: number
  description: string
  date: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  paymentMethod: string
  reference?: string
  tags: string[]
}

interface Budget {
  id: string
  name: string
  category: string
  budgetAmount: number
  spentAmount: number
  period: 'mensal' | 'trimestral' | 'anual'
  startDate: string
  endDate: string
  status: 'ativo' | 'excedido' | 'finalizado'
}

interface CashFlowData {
  month: string
  receitas: number
  despesas: number
  resultado: number
}

const FinancialManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionFilter, setTransactionFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mock para demonstração
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receita',
      category: 'Vendas',
      subcategory: 'Produtos',
      amount: 15000,
      description: 'Venda de pacotes turísticos',
      date: '2025-01-15',
      status: 'confirmado',
      paymentMethod: 'Cartão de Crédito',
      reference: 'VND-001',
      tags: ['turismo', 'pacotes']
    },
    {
      id: '2',
      type: 'despesa',
      category: 'Operacional',
      subcategory: 'Fornecedores',
      amount: 5000,
      description: 'Pagamento de hospedagem',
      date: '2025-01-14',
      status: 'confirmado',
      paymentMethod: 'Transferência',
      reference: 'DSP-002',
      tags: ['hospedagem', 'fornecedor']
    },
    {
      id: '3',
      type: 'receita',
      category: 'Serviços',
      subcategory: 'Consultoria',
      amount: 8000,
      description: 'Consultoria em turismo',
      date: '2025-01-13',
      status: 'pendente',
      paymentMethod: 'PIX',
      reference: 'SRV-003',
      tags: ['consultoria', 'serviços']
    },
    {
      id: '4',
      type: 'despesa',
      category: 'Administrativa',
      subcategory: 'Salários',
      amount: 12000,
      description: 'Folha de pagamento Janeiro',
      date: '2025-01-10',
      status: 'confirmado',
      paymentMethod: 'Transferência',
      reference: 'SAL-004',
      tags: ['salários', 'rh']
    },
    {
      id: '5',
      type: 'despesa',
      category: 'Marketing',
      subcategory: 'Publicidade',
      amount: 3000,
      description: 'Campanha Google Ads',
      date: '2025-01-12',
      status: 'confirmado',
      paymentMethod: 'Cartão de Crédito',
      reference: 'MKT-005',
      tags: ['marketing', 'ads']
    }
  ])

  const [budgets] = useState<Budget[]>([
    {
      id: '1',
      name: 'Orçamento Operacional',
      category: 'Operacional',
      budgetAmount: 20000,
      spentAmount: 17000,
      period: 'mensal',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'ativo'
    },
    {
      id: '2',
      name: 'Orçamento Marketing',
      category: 'Marketing',
      budgetAmount: 5000,
      spentAmount: 6200,
      period: 'mensal',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'excedido'
    },
    {
      id: '3',
      name: 'Orçamento Administrativo',
      category: 'Administrativa',
      budgetAmount: 15000,
      spentAmount: 12000,
      period: 'mensal',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'ativo'
    }
  ])

  const cashFlowData: CashFlowData[] = [
    { month: 'Jan', receitas: 23000, despesas: 20000, resultado: 3000 },
    { month: 'Fev', receitas: 28000, despesas: 18000, resultado: 10000 },
    { month: 'Mar', receitas: 31000, despesas: 22000, resultado: 9000 },
    { month: 'Abr', receitas: 25000, despesas: 19000, resultado: 6000 },
    { month: 'Mai', receitas: 35000, despesas: 24000, resultado: 11000 },
    { month: 'Jun', receitas: 32000, despesas: 21000, resultado: 11000 }
  ]

  const categoryData = [
    { name: 'Vendas', value: 23000, color: '#10b981' },
    { name: 'Serviços', value: 8000, color: '#3b82f6' },
    { name: 'Operacional', value: -5000, color: '#ef4444' },
    { name: 'Administrativa', value: -12000, color: '#f59e0b' },
    { name: 'Marketing', value: -3000, color: '#8b5cf6' }
  ]

  // Cálculos financeiros
  const totalReceitas = transactions
    .filter(t => t.type === 'receita' && t.status === 'confirmado')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa' && t.status === 'confirmado')
    .reduce((sum, t) => sum + t.amount, 0)

  const resultadoLiquido = totalReceitas - totalDespesas
  const margemLucro = totalReceitas > 0 ? (resultadoLiquido / totalReceitas) * 100 : 0

  // Filtros
  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = transactionFilter === 'todos' || transaction.type === transactionFilter
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spentAmount / budget.budgetAmount) * 100
    if (percentage >= 100) return { color: 'text-red-600', icon: AlertTriangle }
    if (percentage >= 80) return { color: 'text-yellow-600', icon: Clock }
    return { color: 'text-green-600', icon: CheckCircle }
  }

  const TransactionForm: React.FC = () => (
    <form className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-type">Tipo</Label>
          <Select>
            <SelectTrigger title="Selecionar tipo de transação">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transaction-amount">Valor</Label>
          <Input 
            id="transaction-amount"
            type="number" 
            placeholder="0,00"
            title="Valor da transação"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-category">Categoria</Label>
          <Select>
            <SelectTrigger title="Selecionar categoria">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="servicos">Serviços</SelectItem>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="administrativa">Administrativa</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transaction-date">Data</Label>
          <Input 
            id="transaction-date"
            type="date"
            title="Data da transação"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction-description">Descrição</Label>
        <Textarea 
          id="transaction-description"
          placeholder="Descrição da transação"
          title="Descrição detalhada da transação"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-method">Método de Pagamento</Label>
        <Select>
          <SelectTrigger title="Selecionar método de pagamento">
            <SelectValue placeholder="Selecionar método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
            <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600">Sistema completo de controle financeiro</p>
        </div>
        <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
              <DialogDescription>
                Adicione uma nova receita ou despesa ao sistema
              </DialogDescription>
            </DialogHeader>
            <TransactionForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsTransactionModalOpen(false)}>
                Salvar Transação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="fluxo-caixa">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalReceitas)}
                </div>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDespesas)}
                </div>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -5% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
                <Calculator className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resultadoLiquido)}
                </div>
                <p className="text-xs text-gray-600">
                  Margem: {margemLucro.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transações</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transactions.length}
                </div>
                <p className="text-xs text-gray-600">
                  {transactions.filter(t => t.status === 'pendente').length} pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa Mensal</CardTitle>
                <CardDescription>Receitas vs Despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                    <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado por Categoria</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(Math.abs(value))}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Math.abs(Number(value)))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status dos Orçamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Orçamentos</CardTitle>
              <CardDescription>Acompanhamento dos orçamentos mensais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = (budget.spentAmount / budget.budgetAmount) * 100
                  const status = getBudgetStatus(budget)
                  const StatusIcon = status.icon

                  return (
                    <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        <div>
                          <p className="font-medium">{budget.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.budgetAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${status.color}`}>
                          {percentage.toFixed(1)}%
                        </p>
                        <Badge variant={budget.status === 'excedido' ? 'destructive' : 'default'}>
                          {budget.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-6">
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
                      placeholder="Buscar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      title="Buscar por descrição ou categoria"
                    />
                  </div>
                </div>
                <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                  <SelectTrigger className="w-48" title="Filtrar por tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Transações */}
          <Card>
            <CardHeader>
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transações encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${transaction.type === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'receita' ? (
                          <TrendingUp className={`h-4 w-4 ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.category} • {transaction.date} • {transaction.paymentMethod}
                        </p>
                        {transaction.reference && (
                          <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <p className={`font-bold text-lg ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Orçamentos</CardTitle>
                <CardDescription>Gestão de orçamentos por categoria</CardDescription>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {budgets.map((budget) => {
                  const percentage = (budget.spentAmount / budget.budgetAmount) * 100
                  const remaining = budget.budgetAmount - budget.spentAmount
                  const status = getBudgetStatus(budget)
                  const StatusIcon = status.icon

                  return (
                    <div key={budget.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-6 w-6 ${status.color}`} />
                          <div>
                            <h3 className="font-semibold text-lg">{budget.name}</h3>
                            <p className="text-gray-600">{budget.category} • {budget.period}</p>
                          </div>
                        </div>
                        <Badge variant={budget.status === 'excedido' ? 'destructive' : 'default'}>
                          {budget.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Gasto: {formatCurrency(budget.spentAmount)}</span>
                          <span>Orçamento: {formatCurrency(budget.budgetAmount)}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              percentage >= 100 ? 'bg-red-500' : 
                              percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${status.color}`}>
                            {percentage.toFixed(1)}% utilizado
                          </span>
                          <span className={`text-sm ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {remaining >= 0 ? 'Disponível: ' : 'Excesso: '}
                            {formatCurrency(Math.abs(remaining))}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            {budget.startDate} até {budget.endDate}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Relatório
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo-caixa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Análise detalhada do fluxo de caixa mensal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResultado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="receitas" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorReceitas)" 
                    name="Receitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesas" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorDespesas)" 
                    name="Despesas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resultado" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorResultado)" 
                    name="Resultado"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Entrada Média</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.receitas, 0) / cashFlowData.length)}
                </div>
                <p className="text-gray-600 mt-2">por mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Saída Média</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.despesas, 0) / cashFlowData.length)}
                </div>
                <p className="text-gray-600 mt-2">por mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Resultado Médio</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.resultado, 0) / cashFlowData.length)}
                </div>
                <p className="text-gray-600 mt-2">por mês</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Gere relatórios detalhados para análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Demonstrativo de Resultados',
                    description: 'DRE detalhado com receitas e despesas',
                    icon: PieChart,
                    color: 'bg-blue-500'
                  },
                  {
                    title: 'Fluxo de Caixa',
                    description: 'Relatório de entradas e saídas',
                    icon: BarChart3,
                    color: 'bg-green-500'
                  },
                  {
                    title: 'Análise de Orçamento',
                    description: 'Comparativo orçado vs realizado',
                    icon: Calculator,
                    color: 'bg-purple-500'
                  },
                  {
                    title: 'Relatório por Categoria',
                    description: 'Análise de gastos por categoria',
                    icon: PieChart,
                    color: 'bg-orange-500'
                  },
                  {
                    title: 'Relatório Mensal',
                    description: 'Resumo completo mensal',
                    icon: Calendar,
                    color: 'bg-red-500'
                  },
                  {
                    title: 'Análise de Tendências',
                    description: 'Projeções e tendências financeiras',
                    icon: TrendingUp,
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

export default FinancialManager
