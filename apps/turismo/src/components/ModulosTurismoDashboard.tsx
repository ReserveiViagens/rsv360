'use client'

import { useState } from 'react'
import { LeiloesDashboard } from './leiloes/LeiloesDashboard'
import { ExcursoesDashboard } from './excursoes/ExcursoesDashboard'
import { ViagensGrupoDashboard } from './viagens-grupo/ViagensGrupoDashboard'
import { Gavel, MapPin, Users, LayoutGrid } from 'lucide-react'

type ModuloAtivo = 'leiloes' | 'excursoes' | 'viagens-grupo'

export function ModulosTurismoDashboard() {
  const [moduloAtivo, setModuloAtivo] = useState<ModuloAtivo>('leiloes')

  const modulos = [
    {
      id: 'leiloes' as ModuloAtivo,
      nome: 'Leilões',
      icon: Gavel,
      descricao: 'Leilões e Flash Deals'
    },
    {
      id: 'excursoes' as ModuloAtivo,
      nome: 'Excursões',
      icon: MapPin,
      descricao: 'Montar e gerenciar excursões'
    },
    {
      id: 'viagens-grupo' as ModuloAtivo,
      nome: 'Viagens em Grupo',
      icon: Users,
      descricao: 'Viagens compartilhadas'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-8 h-8" />
            Módulos de Turismo
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os módulos de turismo do sistema
          </p>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="border-b">
        <div className="flex space-x-1">
          {modulos.map((modulo) => {
            const Icon = modulo.icon
            const isActive = moduloAtivo === modulo.id
            return (
              <button
                key={modulo.id}
                onClick={() => setModuloAtivo(modulo.id)}
                className={`
                  px-6 py-3 flex items-center gap-2 border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {modulo.nome}
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo do Módulo Ativo */}
      <div className="mt-6">
        {moduloAtivo === 'leiloes' && <LeiloesDashboard />}
        {moduloAtivo === 'excursoes' && <ExcursoesDashboard />}
        {moduloAtivo === 'viagens-grupo' && <ViagensGrupoDashboard />}
      </div>
    </div>
  )
}

