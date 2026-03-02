'use client'

import React from 'react'
import Link from 'next/link'
import { Gavel, Clock, DollarSign, Users } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { Leilao } from '../../services/api/leiloesApi'

interface LeilaoCardProps {
  leilao: Leilao
}

export function LeilaoCard({ leilao }: LeilaoCardProps) {
  const isFlashDeal = leilao.type === 'flash_deal'
  const isActive = leilao.status === 'active'
  
  // Calcular tempo restante
  const getTimeRemaining = () => {
    if (!isActive) return null
    
    const now = new Date()
    const end = new Date(leilao.end_date)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Finalizado'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`
    }
    
    return `${hours}h ${minutes}m restantes`
  }

  return (
    <Link href={`/dashboard/leiloes/${leilao.id}`}>
      <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className={`w-5 h-5 ${isFlashDeal ? 'text-orange-500' : 'text-blue-500'}`} />
              <h3 className="text-lg font-semibold text-gray-900">{leilao.title}</h3>
              {isFlashDeal && (
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                  Flash Deal
                </span>
              )}
            </div>
            {leilao.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{leilao.description}</p>
            )}
          </div>
          <StatusBadge status={leilao.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Preço Atual</p>
              <p className="text-sm font-semibold text-gray-900">
                R$ {leilao.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          {isActive && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Tempo Restante</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getTimeRemaining() || 'Finalizado'}
                </p>
              </div>
            </div>
          )}

          {isFlashDeal && leilao.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Participantes</p>
                <p className="text-sm font-semibold text-gray-900">
                  Máx: {leilao.max_participants}
                </p>
              </div>
            </div>
          )}

          {leilao.reserve_price && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Preço de Reserva</p>
                <p className="text-sm font-semibold text-gray-900">
                  R$ {leilao.reserve_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-gray-500">
            Início: {new Date(leilao.start_date).toLocaleDateString('pt-BR')}
          </div>
          <div className="text-xs text-gray-500">
            Término: {new Date(leilao.end_date).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    </Link>
  )
}

