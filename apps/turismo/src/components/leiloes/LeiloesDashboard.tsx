'use client'

import { useState, useEffect } from 'react'
import { Gavel } from 'lucide-react'
import Link from 'next/link'
import { AuctionStats } from './AuctionStats'
import { AuctionList } from './AuctionList'
import { leiloesApi, Leilao } from '../../services/api/leiloesApi'

export function LeiloesDashboard() {
  const [upcomingAuctions, setUpcomingAuctions] = useState<Leilao[]>([])

  useEffect(() => {
    loadUpcomingAuctions()
  }, [])

  const loadUpcomingAuctions = async () => {
    try {
      const response = await leiloesApi.getLeiloes({
        status: 'scheduled',
        limit: 5,
        sortBy: 'start_date',
        sortOrder: 'asc',
      })
      setUpcomingAuctions(Array.isArray(response?.data) ? response.data : [])
    } catch (error) {
      console.error('Erro ao carregar próximos leilões:', error)
      setUpcomingAuctions([])
    }
  }

  const formatTimeUntil = (dateString: string) => {
    const now = new Date()
    const target = new Date(dateString)
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return 'Já iniciado'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} dia${days > 1 ? 's' : ''}`
    }

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6" />
            Leilões e Flash Deals
          </h2>
          <p className="text-muted-foreground">
            Gerencie leilões e ofertas relâmpago
          </p>
        </div>
        <Link
          href="/dashboard/leiloes/novo"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Novo Leilão
        </Link>
      </div>

      {/* Estatísticas */}
      <AuctionStats />

      {/* Ações Rápidas e Próximos Leilões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-2">
            <Link
              href="/dashboard/leiloes"
              className="block p-3 border rounded hover:bg-accent"
            >
              Ver Todos os Leilões
            </Link>
            <Link
              href="/dashboard/leiloes/flash-deals"
              className="block p-3 border rounded hover:bg-accent"
            >
              Flash Deals Ativos
            </Link>
            <Link
              href="/dashboard/leiloes/relatorios"
              className="block p-3 border rounded hover:bg-accent"
            >
              Relatórios
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Próximos Leilões</h3>
          {upcomingAuctions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum leilão agendado</p>
          ) : (
            <div className="space-y-2">
              {upcomingAuctions.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/dashboard/leiloes/${auction.id}`}
                  className="block p-3 border rounded hover:bg-accent"
                >
                  <p className="font-medium">{auction.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Inicia em {formatTimeUntil(auction.start_date)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Leilões Recentes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Leilões Recentes</h3>
        <AuctionList 
          filters={{ limit: 6 }}
          showFilters={false}
        />
      </div>
    </div>
  )
}

