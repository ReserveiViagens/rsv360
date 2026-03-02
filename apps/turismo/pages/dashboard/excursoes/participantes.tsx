'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { ParticipantesList } from '../../../src/components/excursoes/ParticipantesList'
import { excursoesApi, Participante } from '../../../src/services/api/excursoesApi'
import { Users, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function ParticipantesPage() {
  const router = useRouter()
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [excursaoId, setExcursaoId] = useState<string>('')

  useEffect(() => {
    // Tentar pegar do query ou da URL
    const id = (router.query.excursao_id || router.query.id) as string
    if (id) {
      setExcursaoId(id)
      loadParticipantes(id)
    }
  }, [router.query])

  const loadParticipantes = async (id: string) => {
    try {
      setLoading(true)
      const data = await excursoesApi.getParticipantes(id)
      setParticipantes(data)
    } catch (error) {
      console.error('Erro ao carregar participantes:', error)
      toast.error('Erro ao carregar participantes')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este participante?')) return

    try {
      await excursoesApi.removeParticipante(excursaoId, userId)
      toast.success('Participante removido com sucesso!')
      await loadParticipantes(excursaoId)
    } catch (error) {
      console.error('Erro ao remover participante:', error)
      toast.error('Erro ao remover participante')
    }
  }

  if (!excursaoId) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">ID da excursão não fornecido</p>
            <Link
              href="/dashboard/excursoes"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Voltar para excursões
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/excursoes/${excursaoId}`}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8" />
                Participantes
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os participantes da excursão
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const userId = prompt('Digite o ID do usuário para adicionar:')
              if (userId) {
                excursoesApi.addParticipante(excursaoId, userId)
                  .then(() => {
                    toast.success('Participante adicionado com sucesso!')
                    loadParticipantes(excursaoId)
                  })
                  .catch((error) => {
                    console.error('Erro ao adicionar participante:', error)
                    toast.error('Erro ao adicionar participante')
                  })
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Participante
          </button>
        </div>

        <ParticipantesList
          participantes={participantes}
          onRemove={handleRemove}
          isLoading={loading}
        />
      </div>
    </ProtectedRoute>
  )
}

