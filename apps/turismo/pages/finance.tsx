'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FinanceStats {
  total_revenue: number
  total_expenses: number
  balance: number
  pending_payments: number
  revenue_growth?: number
  expense_ratio?: number
  profit_margin?: number
  period?: string
}

interface DashboardData {
  period: string
  revenue: {
    total_revenue: number
    net_revenue: number
    transaction_count: number
    average_transaction: number
    growth: number
  }
  expenses: {
    total_expenses: number
    marketing: number
    operations: number
    personnel: number
    utilities: number
    growth: number
  }
  profit: {
    gross_profit: number
    net_profit: number
    profit_margin: number
    growth: number
  }
  kpis: {
    revenue_growth: number
    expense_ratio: number
    roi: number
    cash_flow: number
  }
  trends: {
    revenue_trend: Array<{ month: string; value: number }>
    expense_trend: Array<{ month: string; value: number }>
  }
}

interface ExpenseCategory {
  id: number
  name: string
  color: string
  total: number
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'expenses' | 'reports'>('overview')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, dashboardRes, categoriesRes] = await Promise.all([
        api.get('/api/v1/finance/stats', { params: { period } }),
        api.get('/api/v1/finance/dashboard', { params: { period } }),
        api.get('/api/v1/finance/expenses/categories')
      ])
      
      setStats(statsRes.data?.data || null)
      setDashboard(dashboardRes.data?.data || null)
      setExpenseCategories(categoriesRes.data?.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await api.get('/api/v1/finance/report', {
        params: { type: 'summary', period }
      })
      toast.success('Relatório gerado com sucesso!')
      
      // Opcional: fazer download do relatório
      const reportData = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([reportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-financeiro-${period}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      toast.error('Erro ao gerar relatório')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getColorClass = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= 0 ? 'text-green-600' : 'text-red-600'
    }
    return value >= 0 ? 'text-red-600' : 'text-green-600'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
              <p className="text-gray-600 mt-1">Gestão financeira e relatórios</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Download className="w-4 h-4" />
              Relatório
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'revenue', label: 'Receitas', icon: TrendingUp },
              { id: 'expenses', label: 'Despesas', icon: TrendingDown },
              { id: 'reports', label: 'Relatórios', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Main Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</p>
                  {stats.revenue_growth !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${getColorClass(stats.revenue_growth)}`}>
                      <ArrowUpRight className="w-4 h-4" />
                      {formatPercent(stats.revenue_growth)}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Despesas Total</p>
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.total_expenses)}</p>
                  {dashboard?.expenses.growth !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${getColorClass(dashboard.expenses.growth, false)}`}>
                      <ArrowDownRight className="w-4 h-4" />
                      {formatPercent(dashboard.expenses.growth)}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Saldo</p>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.balance)}
                  </p>
                  {dashboard?.profit.growth !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${getColorClass(dashboard.profit.growth)}`}>
                      <ArrowUpRight className="w-4 h-4" />
                      {formatPercent(dashboard.profit.growth)}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending_payments}</p>
                  <p className="text-xs text-gray-500 mt-2">Aguardando confirmação</p>
                </div>
              </div>
            )}

            {/* Dashboard Details */}
            {dashboard && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Receitas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Receita Bruta</span>
                      <span className="font-semibold">{formatCurrency(dashboard.revenue.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Receita Líquida</span>
                      <span className="font-semibold">{formatCurrency(dashboard.revenue.net_revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transações</span>
                      <span className="font-semibold">{dashboard.revenue.transaction_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ticket Médio</span>
                      <span className="font-semibold">{formatCurrency(dashboard.revenue.average_transaction)}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Crescimento</span>
                        <span className={`font-semibold ${getColorClass(dashboard.revenue.growth)}`}>
                          {formatPercent(dashboard.revenue.growth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expenses Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    Despesas
                  </h3>
                  <div className="space-y-4">
                    {expenseCategories.map((category) => (
                      <div key={category.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                          <span className="text-gray-600">{category.name}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(category.total)}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold">Total</span>
                        <span className="font-bold text-red-600">{formatCurrency(dashboard.expenses.total_expenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Lucro
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lucro Bruto</span>
                      <span className="font-semibold text-green-600">{formatCurrency(dashboard.profit.gross_profit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lucro Líquido</span>
                      <span className="font-semibold text-green-600">{formatCurrency(dashboard.profit.net_profit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Margem de Lucro</span>
                      <span className="font-semibold text-green-600">{dashboard.profit.profit_margin.toFixed(1)}%</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Crescimento</span>
                        <span className={`font-semibold ${getColorClass(dashboard.profit.growth)}`}>
                          {formatPercent(dashboard.profit.growth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    KPIs
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Crescimento de Receita</span>
                      <span className={`font-semibold ${getColorClass(dashboard.kpis.revenue_growth)}`}>
                        {formatPercent(dashboard.kpis.revenue_growth)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taxa de Despesas</span>
                      <span className="font-semibold">{dashboard.kpis.expense_ratio.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-semibold text-green-600">{dashboard.kpis.roi.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fluxo de Caixa</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(dashboard.kpis.cash_flow)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trends Chart Placeholder */}
            {dashboard && dashboard.trends && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tendências</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Receitas (Últimos 4 meses)</h4>
                    <div className="space-y-2">
                      {dashboard.trends.revenue_trend.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-12">{item.month}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                            <div
                              className="bg-green-600 h-full rounded-full transition-all"
                              style={{ width: `${(item.value / 50000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-20 text-right">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Despesas (Últimos 4 meses)</h4>
                    <div className="space-y-2">
                      {dashboard.trends.expense_trend.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-12">{item.month}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                            <div
                              className="bg-red-600 h-full rounded-full transition-all"
                              style={{ width: `${(item.value / 10000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-20 text-right">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Receitas</h3>
            <p className="text-gray-600">Lista de receitas em desenvolvimento...</p>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Despesas</h3>
            <p className="text-gray-600">Lista de despesas em desenvolvimento...</p>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Relatórios</h3>
            <p className="text-gray-600">Relatórios financeiros em desenvolvimento...</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
