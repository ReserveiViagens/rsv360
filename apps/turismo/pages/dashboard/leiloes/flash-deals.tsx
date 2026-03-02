'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { FlashDealCard } from '../../../src/components/leiloes/FlashDealCard'
import { FilterBar } from '../../../src/components/shared/FilterBar'
import { leiloesApi, Leilao } from '../../../src/services/api/leiloesApi'
import { Zap, Plus } from 'lucide-react'
import Link from 'next/link'

export default function FlashDealsPage() {
  const [flashDeals, setFlashDeals] = useState<Leilao[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    status: 'active' as string | undefined,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadFlashDeals()
  }, [filters])

  const loadFlashDeals = async () => {
    try {
      setLoading(true)
      const response = await leiloesApi.getFlashDeals(filters)
      setFlashDeals(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Erro ao carregar flash deals:', error)
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
    setFilters({ page: 1, limit: 12, status: 'active' })
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="w-8 h-8 text-orange-500" />
              Flash Deals
            </h1>
            <p className="text-muted-foreground mt-2">
              Ofertas relâmpago com desconto especial
            </p>
          </div>
          <Link
            href="/dashboard/leiloes/novo"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Flash Deal
          </Link>
        </div>

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
          ]}
          onClear={handleClearFilters}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : flashDeals.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Nenhum flash deal encontrado</p>
            <p className="text-gray-500 text-sm mb-6">
              {filters.search || filters.status
                ? 'Tente ajustar os filtros'
                : 'Comece criando seu primeiro flash deal'}
            </p>
            {!filters.search && !filters.status && (
              <Link
                href="/dashboard/leiloes/novo"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Criar Primeiro Flash Deal
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashDeals.map((deal) => (
                <FlashDealCard key={deal.id} leilao={deal} />
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
    </ProtectedRoute>
  )
}

