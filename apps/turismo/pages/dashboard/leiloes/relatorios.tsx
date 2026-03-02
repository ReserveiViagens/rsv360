'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { leiloesApi } from '../../../src/services/api/leiloesApi'
import { BarChart3, DollarSign, TrendingUp, FileDown } from 'lucide-react'
import { FilterBar } from '../../../src/components/shared/FilterBar'

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    type: '',
  })

  useEffect(() => {
    loadRelatorios()
  }, [filters])

  const loadRelatorios = async () => {
    try {
      setLoading(true)
      const data = await leiloesApi.getRelatorios(filters)
      setRelatorios(data)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
    }))
  }

  const handleDateChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleExport = () => {
    // TODO: Implementar exportação
    alert('Funcionalidade de exportação em desenvolvimento')
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Relatórios de Leilões
            </h1>
            <p className="text-muted-foreground mt-2">
              Análise e estatísticas dos leilões
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Exportar
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <FilterBar
            searchValue=""
            onSearchChange={() => {}}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'scheduled', label: 'Agendado' },
                  { value: 'active', label: 'Ativo' },
                  { value: 'ended', label: 'Finalizado' },
                  { value: 'cancelled', label: 'Cancelado' },
                ],
                value: filters.status || 'all',
                onChange: (value) => handleFilterChange('status', value),
              },
              {
                key: 'type',
                label: 'Tipo',
                options: [
                  { value: 'auction', label: 'Leilão' },
                  { value: 'flash_deal', label: 'Flash Deal' },
                ],
                value: filters.type || 'all',
                onChange: (value) => handleFilterChange('type', value),
              },
            ]}
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : relatorios ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <p className="text-sm text-gray-500">Total de Leilões</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{relatorios.total_leiloes || 0}</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <p className="text-sm text-gray-500">Receita Total</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {(relatorios.total_receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <p className="text-sm text-gray-500">Total de Lances</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{relatorios.total_lances || 0}</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <p className="text-sm text-gray-500">Média por Leilão</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {relatorios.total_leiloes > 0
                  ? (relatorios.total_receita / relatorios.total_leiloes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : '0,00'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">Nenhum dado disponível para o período selecionado</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

