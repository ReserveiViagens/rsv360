'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Calendar, Download } from 'lucide-react'
import { api } from '../../src/services/apiClient'

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  revenueGrowth: number
  expenseGrowth: number
  auctionRevenue: number
  flashDealRevenue: number
  otaRevenue: number
  marketplaceRevenue: number
  affiliateCommissions: number
  period: {
    start: string
    end: string
  }
}

interface RevenueBreakdown {
  source: string
  amount: number
  percentage: number
  change: number
}

export default function AnalyticsFinanceiroPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Calcular datas baseado no período
      const endDate = new Date()
      const startDate = new Date()
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // TODO: Implementar endpoint real de analytics financeiro
      // Por enquanto, usar dados mockados baseados em leilões e flash deals
      const [auctionsRes, flashDealsRes] = await Promise.all([
        api.get<any>('/api/v1/auctions', { status: 'finished' }),
        api.get<any>('/api/v1/flash-deals', { status: 'sold_out' }),
      ])

      const auctions = Array.isArray(auctionsRes.data) ? auctionsRes.data : Array.isArray(auctionsRes) ? auctionsRes : []
      const flashDeals = Array.isArray(flashDealsRes.data) ? flashDealsRes.data : Array.isArray(flashDealsRes) ? flashDealsRes : []

      // Calcular métricas
      const auctionRevenue = auctions.reduce((sum: number, a: any) => sum + (a.current_price || 0), 0)
      const flashDealRevenue = flashDeals.reduce((sum: number, fd: any) => sum + (fd.current_price || 0) * (fd.units_sold || 0), 0)
      const totalRevenue = auctionRevenue + flashDealRevenue
      const totalExpenses = totalRevenue * 0.3 // Estimativa: 30% de custos
      const netProfit = totalRevenue - totalExpenses
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      setMetrics({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        revenueGrowth: 15.5, // Mock
        expenseGrowth: 8.2, // Mock
        auctionRevenue,
        flashDealRevenue,
        otaRevenue: 0, // TODO: Buscar da API OTA
        marketplaceRevenue: 0, // TODO: Buscar da API Marketplace
        affiliateCommissions: 0, // TODO: Buscar da API Affiliates
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      })

      // Calcular breakdown de receita
      const breakdown: RevenueBreakdown[] = [
        {
          source: 'Leilões',
          amount: auctionRevenue,
          percentage: totalRevenue > 0 ? (auctionRevenue / totalRevenue) * 100 : 0,
          change: 12.5,
        },
        {
          source: 'Flash Deals',
          amount: flashDealRevenue,
          percentage: totalRevenue > 0 ? (flashDealRevenue / totalRevenue) * 100 : 0,
          change: 8.3,
        },
        {
          source: 'OTA',
          amount: 0,
          percentage: 0,
          change: 0,
        },
        {
          source: 'Marketplace',
          amount: 0,
          percentage: 0,
          change: 0,
        },
        {
          source: 'Afiliados',
          amount: 0,
          percentage: 0,
          change: 0,
        },
      ].filter(item => item.amount > 0 || item.source === 'Leilões' || item.source === 'Flash Deals')

      setRevenueBreakdown(breakdown)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-green-500" />
              Analytics Financeiro
            </h1>
            <p className="text-muted-foreground mt-2">
              Análise financeira completa do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : metrics ? (
          <>
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Receita Total</span>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  {formatPercentage(metrics.revenueGrowth)}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Despesas</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</div>
                <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  {formatPercentage(metrics.expenseGrowth)}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Lucro Líquido</span>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netProfit)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Margem: {metrics.profitMargin.toFixed(1)}%
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Margem de Lucro</span>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 mt-2">
                  {metrics.profitMargin >= 20 ? 'Excelente' : metrics.profitMargin >= 10 ? 'Bom' : 'Atenção'}
                </div>
              </div>
            </div>

            {/* Breakdown de Receita */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Breakdown de Receita</h2>
              <div className="space-y-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.source}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {item.percentage.toFixed(1)}%
                        </span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                        <span
                          className={`text-sm ${
                            item.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(item.change)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Receita por Fonte */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Leilões</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metrics.auctionRevenue)}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Flash Deals</h3>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(metrics.flashDealRevenue)}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-2">OTA</h3>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.otaRevenue)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Nenhum dado disponível para o período selecionado</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
