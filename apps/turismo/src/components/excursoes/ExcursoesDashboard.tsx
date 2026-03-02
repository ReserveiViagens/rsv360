'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export function ExcursoesDashboard() {
  const [stats, setStats] = useState({
    totalExcursoes: 0,
    emPlanejamento: 0,
    emAndamento: 0,
    concluidas: 0
  })

  useEffect(() => {
    // TODO: Buscar dados da API
    setStats({
      totalExcursoes: 25,
      emPlanejamento: 8,
      emAndamento: 5,
      concluidas: 12
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Excursões
          </h2>
          <p className="text-muted-foreground">
            Monte e gerencie excursões personalizadas
          </p>
        </div>
        <Link
          href="/dashboard/excursoes/nova"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Excursão
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.totalExcursoes}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Planejamento</p>
              <p className="text-2xl font-bold">{stats.emPlanejamento}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.emAndamento}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">{stats.concluidas}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-2">
            <Link
              href="/dashboard/excursoes"
              className="block p-3 border rounded hover:bg-accent"
            >
              Ver Todas as Excursões
            </Link>
            <Link
              href="/dashboard/excursoes/roteiros"
              className="block p-3 border rounded hover:bg-accent"
            >
              Gerenciar Roteiros
            </Link>
            <Link
              href="/dashboard/excursoes/participantes"
              className="block p-3 border rounded hover:bg-accent"
            >
              Participantes
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Próximas Excursões</h3>
          <div className="space-y-2">
            <div className="p-3 border rounded">
              <p className="font-medium">Excursão Caldas Novas</p>
              <p className="text-sm text-muted-foreground">
                Inicia em 5 dias - 15 participantes
              </p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium">Excursão Chapada dos Veadeiros</p>
              <p className="text-sm text-muted-foreground">
                Inicia em 12 dias - 8 participantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

