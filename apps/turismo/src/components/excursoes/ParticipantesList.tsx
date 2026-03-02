'use client'

import React from 'react'
import { Users, X, CheckCircle, Clock } from 'lucide-react'
import { Participante } from '../../services/api/excursoesApi'
import { StatusBadge } from '../shared/StatusBadge'

interface ParticipantesListProps {
  participantes: Participante[]
  onRemove?: (userId: string) => void
  isLoading?: boolean
}

export function ParticipantesList({ participantes, onRemove, isLoading = false }: ParticipantesListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-center text-gray-600">Carregando participantes...</p>
      </div>
    )
  }

  if (participantes.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhum participante ainda</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participantes ({participantes.length})
        </h3>
      </div>
      
      <div className="divide-y">
        {participantes.map((participante) => (
          <div
            key={participante.id}
            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-gray-100 rounded-full">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {participante.user_name || participante.user_email || 'Usuário'}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <StatusBadge status={participante.status} />
                  <StatusBadge status={participante.pagamento_status} />
                </div>
              </div>
            </div>

            {onRemove && (
              <button
                onClick={() => onRemove(participante.user_id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remover participante"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

