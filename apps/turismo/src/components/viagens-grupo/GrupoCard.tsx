'use client'

import React from 'react'
import Link from 'next/link'
import { Users, MapPin, Calendar, Lock, Unlock } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { Grupo } from '../../services/api/viagensGrupoApi'

interface GrupoCardProps {
  grupo: Grupo
}

export function GrupoCard({ grupo }: GrupoCardProps) {
  const isPrivate = grupo.privacidade === 'privado' || grupo.privacidade === 'somente_convite'

  return (
    <Link href={`/dashboard/viagens-grupo/${grupo.id}`}>
      <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">{grupo.nome}</h3>
              {isPrivate ? (
                <Lock className="w-4 h-4 text-gray-400" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{grupo.destino}</span>
            </div>
          </div>
          <StatusBadge status={grupo.status} />
        </div>

        {grupo.descricao && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{grupo.descricao}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {grupo.data_prevista && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Data Prevista</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(grupo.data_prevista).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          {grupo.limite_participantes && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Limite</p>
                <p className="text-sm font-semibold text-gray-900">
                  {grupo.limite_participantes} pessoas
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Privacidade</span>
            <span className="text-xs font-medium text-gray-700 capitalize">
              {grupo.privacidade.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

