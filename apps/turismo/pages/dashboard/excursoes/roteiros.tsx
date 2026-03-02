'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { RoteiroEditor } from '../../../src/components/excursoes/RoteiroEditor'
import { excursoesApi, Roteiro } from '../../../src/services/api/excursoesApi'
import { FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function RoteirosPage() {
  const router = useRouter()
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [loading, setLoading] = useState(true)
  const [excursaoId, setExcursaoId] = useState<string>('')

  useEffect(() => {
    // Tentar pegar do query ou da URL
    const id = (router.query.excursao_id || router.query.id) as string
    if (id) {
      setExcursaoId(id)
      loadRoteiros(id)
    }
  }, [router.query])

  const loadRoteiros = async (id: string) => {
    try {
      setLoading(true)
      const data = await excursoesApi.getRoteiros(id)
      setRoteiros(data)
    } catch (error) {
      console.error('Erro ao carregar roteiros:', error)
      toast.error('Erro ao carregar roteiros')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (roteirosToSave: Omit<Roteiro, 'id' | 'excursao_id' | 'created_at'>[]) => {
    try {
      // Salvar cada roteiro individualmente
      for (const roteiro of roteirosToSave) {
        await excursoesApi.createRoteiro(excursaoId, roteiro)
      }
      toast.success('Roteiro salvo com sucesso!')
      await loadRoteiros(excursaoId)
    } catch (error) {
      console.error('Erro ao salvar roteiro:', error)
      toast.error('Erro ao salvar roteiro')
      throw error
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
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/excursoes/${excursaoId}`}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Roteiro da Excursão
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie o roteiro e atividades da excursão
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <RoteiroEditor
            roteiros={roteiros}
            onSave={handleSave}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}

