'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { GrupoForm } from '../../../src/components/viagens-grupo/GrupoForm'
import { viagensGrupoApi } from '../../../src/services/api/viagensGrupoApi'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function NovoGrupoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      await viagensGrupoApi.createGrupo(data)
      toast.success('Grupo criado com sucesso!')
      router.push('/dashboard/viagens-grupo')
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
      toast.error('Erro ao criar grupo. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/viagens-grupo')
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/viagens-grupo"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8" />
              Novo Grupo
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie um novo grupo de viagem
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <GrupoForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

