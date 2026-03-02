'use client'

import React from 'react'
import { DollarSign, User, Clock } from 'lucide-react'
import { Lance } from '../../services/api/leiloesApi'

interface LancesListProps {
  lances: Lance[]
  isLoading?: boolean
}

export function LancesList({ lances, isLoading = false }: LancesListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-center text-gray-600">Carregando lances...</p>
      </div>
    )
  }

  if (lances.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhum lance ainda</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Histórico de Lances</h3>
        <p className="text-sm text-gray-600">{lances.length} lance{lances.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="divide-y">
        {lances.map((lance) => (
          <div
            key={lance.id}
            className={`p-4 flex items-center justify-between ${
              lance.is_winning ? 'bg-green-50' : ''
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-2 rounded-full ${
                lance.is_winning ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <User className={`w-5 h-5 ${
                  lance.is_winning ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {lance.user_name || lance.user_email || 'Usuário'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {new Date(lance.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-lg font-bold text-gray-900">
                R$ {lance.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {lance.is_winning && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Líder
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

