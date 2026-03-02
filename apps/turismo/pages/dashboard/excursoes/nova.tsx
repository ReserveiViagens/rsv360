'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { ExcursaoForm } from '../../../src/components/excursoes/ExcursaoForm'
import { excursoesApi } from '../../../src/services/api/excursoesApi'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function NovaExcursaoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      await excursoesApi.createExcursao(data)
      toast.success('Excursão criada com sucesso!')
      router.push('/dashboard/excursoes')
    } catch (error) {
      console.error('Erro ao criar excursão:', error)
      toast.error('Erro ao criar excursão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/excursoes')
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/excursoes"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              Nova Excursão
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie uma nova excursão
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <ExcursaoForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

