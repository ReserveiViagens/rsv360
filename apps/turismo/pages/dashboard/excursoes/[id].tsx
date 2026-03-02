'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { ExcursaoForm } from '../../../src/components/excursoes/ExcursaoForm'
import { excursoesApi, Excursao } from '../../../src/services/api/excursoesApi'
import { MapPin, Calendar, Users, DollarSign, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { StatusBadge } from '../../../src/components/shared/StatusBadge'
import { ConfirmDialog } from '../../../src/components/shared/ConfirmDialog'

export default function ExcursaoDetalhesPage() {
  const router = useRouter()
  const { id } = router.query
  const [excursao, setExcursao] = useState<Excursao | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      loadExcursao()
    }
  }, [id])

  const loadExcursao = async () => {
    try {
      setLoading(true)
      const data = await excursoesApi.getExcursaoById(id as string)
      setExcursao(data)
    } catch (error) {
      console.error('Erro ao carregar excursão:', error)
      toast.error('Erro ao carregar excursão')
      router.push('/dashboard/excursoes')
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
      await excursoesApi.updateExcursao(id as string, data)
      toast.success('Excursão atualizada com sucesso!')
      setEditing(false)
      await loadExcursao()
    } catch (error) {
      console.error('Erro ao atualizar excursão:', error)
      toast.error('Erro ao atualizar excursão')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    try {
      await excursoesApi.deleteExcursao(id as string)
      toast.success('Excursão cancelada com sucesso')
      router.push('/dashboard/excursoes')
    } catch (error) {
      console.error('Erro ao cancelar excursão:', error)
      toast.error('Erro ao cancelar excursão')
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

  if (!excursao) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">Excursão não encontrada</p>
            <Link
              href="/dashboard/excursoes"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Voltar para lista de excursões
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
            href={`/dashboard/excursoes/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para detalhes
          </Link>

          <div className="bg-white rounded-lg border p-6">
            <ExcursaoForm
              excursao={excursao}
              onSubmit={handleSave}
              onCancel={() => setEditing(false)}
              isLoading={isSaving}
            />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <Link
          href="/dashboard/excursoes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para excursões
        </Link>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                <MapPin className="w-8 h-8" />
                {excursao.nome}
              </h1>
              <StatusBadge status={excursao.status} />
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
                Cancelar
              </button>
            </div>
          </div>

          {excursao.descricao && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Descrição</h3>
              <p className="text-gray-600">{excursao.descricao}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-gray-500">Destino</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">{excursao.destino}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <p className="text-sm text-gray-500">Data Início</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(excursao.data_inicio).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <p className="text-sm text-gray-500">Data Fim</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(excursao.data_fim).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-gray-500">Preço</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                R$ {excursao.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <p className="text-sm text-gray-500">Vagas</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {excursao.vagas_disponiveis} / {excursao.vagas_totais} disponíveis
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Inclui:</p>
              <div className="flex flex-wrap gap-2">
                {excursao.inclui_transporte && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Transporte</span>
                )}
                {excursao.inclui_hospedagem && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Hospedagem</span>
                )}
                {excursao.inclui_refeicoes && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Refeições</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleCancel}
          title="Cancelar Excursão"
          message="Tem certeza que deseja cancelar esta excursão? Esta ação não pode ser desfeita."
          confirmText="Cancelar Excursão"
          variant="danger"
        />
      </div>
    </ProtectedRoute>
  )
}

