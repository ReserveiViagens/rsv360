'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { GrupoForm } from '../../../src/components/viagens-grupo/GrupoForm'
import { viagensGrupoApi, Grupo } from '../../../src/services/api/viagensGrupoApi'
import { Users, MapPin, Calendar, ArrowLeft, Edit, Lock, Unlock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { StatusBadge } from '../../../src/components/shared/StatusBadge'
import { ConfirmDialog } from '../../../src/components/shared/ConfirmDialog'

export default function GrupoDetalhesPage() {
  const router = useRouter()
  const { id } = router.query
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      loadGrupo()
    }
  }, [id])

  const loadGrupo = async () => {
    try {
      setLoading(true)
      const data = await viagensGrupoApi.getGrupoById(id as string)
      setGrupo(data)
    } catch (error) {
      console.error('Erro ao carregar grupo:', error)
      toast.error('Erro ao carregar grupo')
      router.push('/dashboard/viagens-grupo')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true)
      await viagensGrupoApi.updateGrupo(id as string, data)
      toast.success('Grupo atualizado com sucesso!')
      setEditing(false)
      await loadGrupo()
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error)
      toast.error('Erro ao atualizar grupo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await viagensGrupoApi.deleteGrupo(id as string)
      toast.success('Grupo deletado com sucesso')
      router.push('/dashboard/viagens-grupo')
    } catch (error) {
      console.error('Erro ao deletar grupo:', error)
      toast.error('Erro ao deletar grupo')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!grupo) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">Grupo não encontrado</p>
            <Link
              href="/dashboard/viagens-grupo"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Voltar para lista de grupos
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (editing) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6 space-y-6">
          <Link
            href={`/dashboard/viagens-grupo/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para detalhes
          </Link>

          <div className="bg-white rounded-lg border p-6">
            <GrupoForm
              grupo={grupo}
              onSubmit={handleSave}
              onCancel={() => setEditing(false)}
              isLoading={isSaving}
            />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const isPrivate = grupo.privacidade === 'privado' || grupo.privacidade === 'somente_convite'

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <Link
          href="/dashboard/viagens-grupo"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para grupos
        </Link>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                <Users className="w-8 h-8" />
                {grupo.nome}
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-gray-400" />
                )}
              </h1>
              <StatusBadge status={grupo.status} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>

          {grupo.descricao && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Descrição</h3>
              <p className="text-gray-600">{grupo.descricao}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-gray-500">Destino</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">{grupo.destino}</p>
            </div>

            {grupo.data_prevista && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-gray-500">Data Prevista</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(grupo.data_prevista).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {grupo.limite_participantes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-gray-500">Limite</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {grupo.limite_participantes} pessoas
                </p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-gray-500" />
                )}
                <p className="text-sm text-gray-500">Privacidade</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {grupo.privacidade.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Deletar Grupo"
          message="Tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita."
          confirmText="Deletar Grupo"
          variant="danger"
        />
      </div>
    </ProtectedRoute>
  )
}

