'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { PagamentoDividido } from '../../../src/components/viagens-grupo/PagamentoDividido'
import { viagensGrupoApi, PagamentoDividido as PagamentoDivididoType } from '../../../src/services/api/viagensGrupoApi'
import { DollarSign, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function PagamentosPage() {
  const router = useRouter()
  const [pagamentos, setPagamentos] = useState<PagamentoDivididoType[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoId, setGrupoId] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPagamento, setNewPagamento] = useState({
    descricao: '',
    valor_total: '',
  })

  useEffect(() => {
    // Tentar pegar do query ou da URL
    const id = (router.query.grupo_id || router.query.id) as string
    if (id) {
      setGrupoId(id)
      loadPagamentos(id)
    }
  }, [router.query])

  const loadPagamentos = async (id: string) => {
    try {
      setLoading(true)
      const data = await viagensGrupoApi.getPagamentos(id)
      // Garantir que data seja sempre um array
      setPagamentos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
      toast.error('Erro ao carregar pagamentos')
      // Em caso de erro, garantir que pagamentos seja um array vazio
      setPagamentos([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newPagamento.descricao.trim() || !newPagamento.valor_total) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      await viagensGrupoApi.createPagamentoDividido(grupoId, {
        descricao: newPagamento.descricao,
        valor_total: parseFloat(newPagamento.valor_total),
      })
      toast.success('Pagamento dividido criado!')
      setNewPagamento({ descricao: '', valor_total: '' })
      setShowAddForm(false)
      await loadPagamentos(grupoId)
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
      toast.error('Erro ao criar pagamento')
    }
  }

  if (!grupoId) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">ID do grupo não fornecido</p>
            <Link
              href="/dashboard/viagens-grupo"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Voltar para grupos
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
              href={`/dashboard/viagens-grupo/${grupoId}`}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="w-8 h-8" />
                Pagamentos Divididos
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os pagamentos divididos do grupo
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Pagamento
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Criar Pagamento Dividido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={newPagamento.descricao}
                  onChange={(e) => setNewPagamento({ ...newPagamento, descricao: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Hospedagem, Alimentação, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPagamento.valor_total}
                  onChange={(e) => setNewPagamento({ ...newPagamento, valor_total: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewPagamento({ descricao: '', valor_total: '' })
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : pagamentos.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Nenhum pagamento registrado</p>
            <p className="text-gray-500 text-sm">Crie pagamentos divididos para o grupo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagamentos.map((pagamento) => (
              <PagamentoDividido key={pagamento.id} pagamento={pagamento} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

