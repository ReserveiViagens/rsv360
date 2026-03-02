'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { Excursao } from '../../services/api/excursoesApi'

interface ExcursaoCardProps {
  excursao: Excursao
}

export function ExcursaoCard({ excursao }: ExcursaoCardProps) {
  const vagasPercentual = (excursao.vagas_disponiveis / excursao.vagas_totais) * 100

  return (
    <Link href={`/dashboard/excursoes/${excursao.id}`}>
      <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{excursao.nome}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{excursao.destino}</span>
            </div>
          </div>
          <StatusBadge status={excursao.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Data Início</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(excursao.data_inicio).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Data Fim</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(excursao.data_fim).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Preço</p>
              <p className="text-sm font-semibold text-gray-900">
                R$ {excursao.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Vagas</p>
              <p className="text-sm font-semibold text-gray-900">
                {excursao.vagas_disponiveis} / {excursao.vagas_totais}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Vagas Disponíveis</span>
            <span>{Math.round(vagasPercentual)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                vagasPercentual > 50 ? 'bg-green-500' :
                vagasPercentual > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${vagasPercentual}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {excursao.inclui_transporte && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Transporte</span>
          )}
          {excursao.inclui_hospedagem && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Hospedagem</span>
          )}
          {excursao.inclui_refeicoes && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Refeições</span>
          )}
        </div>
      </div>
    </Link>
  )
}

