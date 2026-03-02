'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, Clock, Users, Percent } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { Leilao } from '../../services/api/leiloesApi'

interface FlashDealCardProps {
  leilao: Leilao
}

export function FlashDealCard({ leilao }: FlashDealCardProps) {
  const isActive = leilao.status === 'active'
  
  // Calcular tempo restante em segundos
  const getTimeRemaining = () => {
    if (!isActive) return null
    
    const now = new Date()
    const end = new Date(leilao.end_date)
    const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
    
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
    
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    const seconds = diff % 60
    
    return { hours, minutes, seconds }
  }

  const timeRemaining = getTimeRemaining()
  const hasDiscount = leilao.discount_percentage && leilao.discount_percentage > 0

  return (
    <Link href={`/dashboard/leiloes/${leilao.id}`}>
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-900">{leilao.title}</h3>
              <span className="px-3 py-1 text-xs font-bold bg-orange-500 text-white rounded-full animate-pulse">
                FLASH DEAL
              </span>
            </div>
            {leilao.description && (
              <p className="text-sm text-gray-700 line-clamp-2">{leilao.description}</p>
            )}
          </div>
          <StatusBadge status={leilao.status} />
        </div>

        {isActive && timeRemaining && (
          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-orange-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Termina em:</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{String(timeRemaining.hours).padStart(2, '0')}</div>
                <div className="text-xs text-gray-600">Horas</div>
              </div>
              <span className="text-2xl font-bold text-orange-600">:</span>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-gray-600">Minutos</div>
              </div>
              <span className="text-2xl font-bold text-orange-600">:</span>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-gray-600">Segundos</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-gray-500">Desconto</p>
            </div>
            <p className="text-lg font-bold text-orange-600">
              {hasDiscount ? `${leilao.discount_percentage}% OFF` : 'Oferta Especial'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-gray-500">Participantes</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {leilao.max_participants ? `Máx: ${leilao.max_participants}` : 'Ilimitado'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Preço Especial</p>
              <p className="text-2xl font-bold text-orange-600">
                R$ {leilao.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold">
              Participar
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

