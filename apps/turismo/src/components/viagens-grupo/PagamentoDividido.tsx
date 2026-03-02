'use client'

import React from 'react'
import { DollarSign, Users, Calendar, CheckCircle, Clock } from 'lucide-react'
import { PagamentoDividido as PagamentoDivididoType } from '../../services/api/viagensGrupoApi'
import { StatusBadge } from '../shared/StatusBadge'

interface PagamentoDivididoProps {
  pagamento: PagamentoDivididoType
}

export function PagamentoDividido({ pagamento }: PagamentoDivididoProps) {
  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{pagamento.descricao}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(pagamento.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <StatusBadge status={pagamento.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500">Valor Total</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            R$ {pagamento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {pagamento.valor_por_pessoa && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-gray-500">Por Pessoa</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              R$ {pagamento.valor_por_pessoa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

