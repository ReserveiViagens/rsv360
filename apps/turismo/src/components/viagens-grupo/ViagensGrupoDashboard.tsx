'use client'

import { useState, useEffect } from 'react'
import { Users, Heart, Calendar, DollarSign, Plus } from 'lucide-react'
import Link from 'next/link'

export function ViagensGrupoDashboard() {
  const [stats, setStats] = useState({
    gruposAtivos: 0,
    totalParticipantes: 0,
    wishlistsCompartilhadas: 0,
    receitaTotal: 0
  })

  useEffect(() => {
    // TODO: Buscar dados da API
    setStats({
      gruposAtivos: 18,
      totalParticipantes: 156,
      wishlistsCompartilhadas: 42,
      receitaTotal: 89000
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Viagens em Grupo
          </h2>
          <p className="text-muted-foreground">
            Organize viagens compartilhadas com amigos e familiares
          </p>
        </div>
        <Link
          href="/dashboard/viagens-grupo/nova"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Grupo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Grupos Ativos</p>
              <p className="text-2xl font-bold">{stats.gruposAtivos}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Participantes</p>
              <p className="text-2xl font-bold">{stats.totalParticipantes}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Wishlists</p>
              <p className="text-2xl font-bold">
                {stats.wishlistsCompartilhadas}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">
                R$ {stats.receitaTotal.toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-2">
            <Link
              href="/dashboard/viagens-grupo"
              className="block p-3 border rounded hover:bg-accent"
            >
              Ver Todos os Grupos
            </Link>
            <Link
              href="/dashboard/viagens-grupo/wishlists"
              className="block p-3 border rounded hover:bg-accent"
            >
              Wishlists Compartilhadas
            </Link>
            <Link
              href="/dashboard/viagens-grupo/pagamentos"
              className="block p-3 border rounded hover:bg-accent"
            >
              Pagamentos Divididos
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Grupos Recentes</h3>
          <div className="space-y-2">
            <div className="p-3 border rounded">
              <p className="font-medium">Grupo Família 2025</p>
              <p className="text-sm text-muted-foreground">
                8 membros - Formando
              </p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium">Grupo Amigos Caldas</p>
              <p className="text-sm text-muted-foreground">
                12 membros - Confirmado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

