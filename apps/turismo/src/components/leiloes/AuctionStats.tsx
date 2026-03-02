'use client'

import React, { useState, useEffect } from 'react'
import { Gavel, TrendingUp, Users, DollarSign, Clock, Award } from 'lucide-react'
import { leiloesApi } from '../../services/api/leiloesApi'

interface AuctionStatsProps {
  filters?: {
    start_date?: string
    end_date?: string
    status?: string
  }
}

export function AuctionStats({ filters }: AuctionStatsProps) {
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    finishedAuctions: 0,
    totalBids: 0,
    totalRevenue: 0,
    averageBidAmount: 0,
    activeUsers: 0,
    winningBids: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [filters])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar todos os leilões para calcular estatísticas
      const [allAuctions, activeAuctions, finishedAuctions] = await Promise.all([
        leiloesApi.getLeiloes({ ...filters, limit: 1000 }),
        leiloesApi.getLeiloes({ ...filters, status: 'active', limit: 1000 }),
        leiloesApi.getLeiloes({ ...filters, status: 'ended', limit: 1000 }),
      ])

      // Calcular estatísticas
      const totalBids = allAuctions.data.reduce((sum, auction) => {
        // TODO: Buscar lances reais quando a API estiver disponível
        return sum + (auction.current_price > auction.starting_price ? 1 : 0)
      }, 0)

      const totalRevenue = finishedAuctions.data.reduce((sum, auction) => {
        return sum + (auction.current_price || 0)
      }, 0)

      const averageBidAmount = totalBids > 0 
        ? totalRevenue / totalBids 
        : 0

      const winningBids = finishedAuctions.data.filter(
        auction => auction.status === 'ended' && auction.current_price > 0
      ).length

      setStats({
        totalAuctions: allAuctions.pagination.total || allAuctions.data.length,
        activeAuctions: activeAuctions.pagination.total || activeAuctions.data.length,
        finishedAuctions: finishedAuctions.pagination.total || finishedAuctions.data.length,
        totalBids,
        totalRevenue,
        averageBidAmount,
        activeUsers: 0, // TODO: Buscar da API quando disponível
        winningBids,
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Erro ao carregar estatísticas: {error}</p>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total de Leilões',
      value: stats.totalAuctions,
      icon: Gavel,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Leilões Ativos',
      value: stats.activeAuctions,
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Leilões Finalizados',
      value: stats.finishedAuctions,
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total de Lances',
      value: stats.totalBids,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Lance Médio',
      value: `R$ ${stats.averageBidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Lances Vencedores',
      value: stats.winningBids,
      icon: Award,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Usuários Ativos',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Estatísticas de Leilões</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`${stat.bgColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
