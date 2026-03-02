'use client'

import React, { useState, useEffect } from 'react'
import { LeilaoCard } from './LeilaoCard'
import { leiloesApi, Leilao, LeilaoFilters } from '../../services/api/leiloesApi'
import { FilterBar } from '../shared/FilterBar'
import { Gavel } from 'lucide-react'

interface AuctionListProps {
  filters?: Partial<LeilaoFilters>
  showFilters?: boolean
  onAuctionClick?: (auction: Leilao) => void
}

export function AuctionList({ filters: initialFilters, showFilters = true, onAuctionClick }: AuctionListProps) {
  const [auctions, setAuctions] = useState<Leilao[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeilaoFilters>({
    page: 1,
    limit: 12,
    ...initialFilters,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadAuctions()
  }, [filters])

  const loadAuctions = async () => {
    try {
      setLoading(true)
      const response = await leiloesApi.getLeiloes(filters)
      setAuctions(Array.isArray(response?.data) ? response.data : [])
      setPagination(response?.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      })
    } catch (error) {
      console.error('Erro ao carregar leilões:', error)
      setAuctions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }))
  }

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 12, ...initialFilters })
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'active', label: 'Ativo' },
    { value: 'ended', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' },
  ]

  const typeOptions = [
    { value: 'auction', label: 'Leilão' },
    { value: 'flash_deal', label: 'Flash Deal' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <FilterBar
          searchValue={filters.search || ''}
          onSearchChange={handleSearchChange}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: statusOptions,
              value: filters.status || 'all',
              onChange: (value) => handleFilterChange('status', value),
            },
            {
              key: 'type',
              label: 'Tipo',
              options: typeOptions,
              value: filters.type || 'all',
              onChange: (value) => handleFilterChange('type', value),
            },
          ]}
          onClear={handleClearFilters}
        />
      )}

      {auctions.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Nenhum leilão encontrado</p>
          <p className="text-gray-500 text-sm">
            {filters.search || filters.status || filters.type
              ? 'Tente ajustar os filtros'
              : 'Não há leilões disponíveis no momento'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => onAuctionClick?.(auction)}
                className={onAuctionClick ? 'cursor-pointer' : ''}
              >
                <LeilaoCard leilao={auction} />
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
