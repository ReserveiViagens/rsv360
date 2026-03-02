'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { LeilaoForm } from '../../../src/components/leiloes/LeilaoForm'
import { leiloesApi } from '../../../src/services/api/leiloesApi'
import { Gavel, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function NovoLeilaoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      await leiloesApi.createLeilao(data)
      toast.success('Leilão criado com sucesso!')
      router.push('/dashboard/leiloes')
    } catch (error) {
      console.error('Erro ao criar leilão:', error)
      toast.error('Erro ao criar leilão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/leiloes')
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/leiloes"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gavel className="w-8 h-8" />
              Novo Leilão
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie um novo leilão ou flash deal
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <LeilaoForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

