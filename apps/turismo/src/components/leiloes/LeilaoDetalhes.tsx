'use client'

import React from 'react'
import { Gavel, Clock, DollarSign, Users, Calendar, FileText } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { Leilao } from '../../services/api/leiloesApi'

interface LeilaoDetalhesProps {
  leilao: Leilao
  onEdit?: () => void
  onCancel?: () => void
  onFinalize?: () => void
}

export function LeilaoDetalhes({ leilao, onEdit, onCancel, onFinalize }: LeilaoDetalhesProps) {
  const isActive = leilao.status === 'active'
  const isFlashDeal = leilao.type === 'flash_deal'
  const canEdit = leilao.status === 'scheduled' || leilao.status === 'active'
  const canCancel = leilao.status !== 'ended' && leilao.status !== 'cancelled'
  const canFinalize = leilao.status === 'active'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">{leilao.title}</h1>
              {isFlashDeal && (
                <span className="px-3 py-1 text-sm font-bold bg-orange-500 text-white rounded-full">
                  FLASH DEAL
                </span>
              )}
            </div>
            <StatusBadge status={leilao.status} />
          </div>
          
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Editar
              </button>
            )}
            {canCancel && onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Cancelar
              </button>
            )}
            {canFinalize && onFinalize && (
              <button
                onClick={onFinalize}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>

        {leilao.description && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-700">Descrição</h3>
            </div>
            <p className="text-gray-600">{leilao.description}</p>
          </div>
        )}
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-500">Preço Inicial</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            R$ {leilao.starting_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-gray-500">Preço Atual</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            R$ {leilao.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {leilao.reserve_price && (
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-500">Preço de Reserva</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              R$ {leilao.reserve_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {isFlashDeal && leilao.discount_percentage && (
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <p className="text-sm text-gray-500">Desconto</p>
            </div>
            <p className="text-xl font-bold text-orange-600">
              {leilao.discount_percentage}% OFF
            </p>
          </div>
        )}
      </div>

      {/* Datas e Horários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-gray-700">Data de Início</p>
          </div>
          <p className="text-gray-900">
            {new Date(leilao.start_date).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium text-gray-700">Data de Término</p>
          </div>
          <p className="text-gray-900">
            {new Date(leilao.end_date).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Informações Adicionais */}
      {isFlashDeal && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium text-gray-700 mb-3">Informações do Flash Deal</h3>
          <div className="grid grid-cols-2 gap-4">
            {leilao.max_participants && (
              <div>
                <p className="text-sm text-gray-500">Máximo de Participantes</p>
                <p className="text-lg font-semibold text-gray-900">{leilao.max_participants}</p>
              </div>
            )}
            {leilao.discount_percentage && (
              <div>
                <p className="text-sm text-gray-500">Desconto Aplicado</p>
                <p className="text-lg font-semibold text-orange-600">{leilao.discount_percentage}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

