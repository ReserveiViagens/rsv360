'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: Array<{
    key: string
    label: string
    options: Array<{ value: string; label: string }>
    value: string
    onChange: (value: string) => void
  }>
  onClear?: () => void
}

export function FilterBar({ searchValue, onSearchChange, filters = [], onClear }: FilterBarProps) {
  const hasActiveFilters = searchValue || filters.some(f => f.value && f.value !== 'all')

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center gap-4">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filtros */}
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={filter.value || 'all'}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Limpar filtros */}
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>
    </div>
  )
}

