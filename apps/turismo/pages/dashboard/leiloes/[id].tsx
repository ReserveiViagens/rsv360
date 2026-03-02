'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { LeilaoDetalhes } from '../../../src/components/leiloes/LeilaoDetalhes'
import { LancesList } from '../../../src/components/leiloes/LancesList'
import { LanceForm } from '../../../src/components/leiloes/LanceForm'
import { leiloesApi, Leilao, Lance } from '../../../src/services/api/leiloesApi'
import { ConfirmDialog } from '../../../src/components/shared/ConfirmDialog'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function LeilaoDetalhesPage() {
  const router = useRouter()
  const { id } = router.query
  const [leilao, setLeilao] = useState<Leilao | null>(null)
  const [lances, setLances] = useState<Lance[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [isSubmittingLance, setIsSubmittingLance] = useState(false)

  useEffect(() => {
    if (id) {
      loadLeilao()
      loadLances()
    }
  }, [id])

  const loadLeilao = async () => {
    try {
      setLoading(true)
      const data = await leiloesApi.getLeilaoById(id as string)
      setLeilao(data)
    } catch (error) {
      console.error('Erro ao carregar leilão:', error)
      toast.error('Erro ao carregar leilão')
      router.push('/dashboard/leiloes')
    } finally {
      setLoading(false)
    }
  }

  const loadLances = async () => {
    try {
      const data = await leiloesApi.getLances(id as string)
      setLances(data)
    } catch (error) {
      console.error('Erro ao carregar lances:', error)
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/leiloes/${id}/editar`)
  }

  const handleCancel = async () => {
    try {
      await leiloesApi.deleteLeilao(id as string)
      toast.success('Leilão cancelado com sucesso')
      router.push('/dashboard/leiloes')
    } catch (error) {
      console.error('Erro ao cancelar leilão:', error)
      toast.error('Erro ao cancelar leilão')
    }
  }

  const handleFinalize = async () => {
    try {
      await leiloesApi.updateLeilao(id as string, { status: 'ended' })
      toast.success('Leilão finalizado com sucesso')
      loadLeilao()
    } catch (error) {
      console.error('Erro ao finalizar leilão:', error)
      toast.error('Erro ao finalizar leilão')
    }
  }

  const handleLanceSubmit = async (amount: number) => {
    try {
      setIsSubmittingLance(true)
      await leiloesApi.createLance(id as string, amount)
      toast.success('Lance realizado com sucesso!')
      await loadLeilao()
      await loadLances()
    } catch (error) {
      console.error('Erro ao fazer lance:', error)
      throw error
    } finally {
      setIsSubmittingLance(false)
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

  if (!leilao) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">Leilão não encontrado</p>
            <Link
              href="/dashboard/leiloes"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Voltar para lista de leilões
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const isActive = leilao.status === 'active'
  const canMakeBid = isActive && new Date(leilao.end_date) > new Date()

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <Link
          href="/dashboard/leiloes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para leilões
        </Link>

        <LeilaoDetalhes
          leilao={leilao}
          onEdit={handleEdit}
          onCancel={() => setShowCancelDialog(true)}
          onFinalize={() => setShowFinalizeDialog(true)}
        />

        {canMakeBid && (
          <LanceForm
            leilao={leilao}
            onSubmit={handleLanceSubmit}
            isLoading={isSubmittingLance}
          />
        )}

        <LancesList lances={lances} />

        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancel}
          title="Cancelar Leilão"
          message="Tem certeza que deseja cancelar este leilão? Esta ação não pode ser desfeita."
          confirmText="Cancelar Leilão"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={showFinalizeDialog}
          onClose={() => setShowFinalizeDialog(false)}
          onConfirm={handleFinalize}
          title="Finalizar Leilão"
          message="Tem certeza que deseja finalizar este leilão? O leilão será encerrado e não poderá mais receber lances."
          confirmText="Finalizar Leilão"
          variant="warning"
        />
      </div>
    </ProtectedRoute>
  )
}

