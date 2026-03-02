'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { WishlistItem } from '../../../src/components/viagens-grupo/WishlistItem'
import { viagensGrupoApi, WishlistItem as WishlistItemType } from '../../../src/services/api/viagensGrupoApi'
import { Heart, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function WishlistsPage() {
  const router = useRouter()
  const [wishlists, setWishlists] = useState<WishlistItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoId, setGrupoId] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    item_tipo: '',
    descricao: '',
  })

  useEffect(() => {
    // Tentar pegar do query ou da URL
    const id = (router.query.grupo_id || router.query.id) as string
    if (id) {
      setGrupoId(id)
      loadWishlists(id)
    }
  }, [router.query])

  const loadWishlists = async (id: string) => {
    try {
      setLoading(true)
      const data = await viagensGrupoApi.getWishlists(id)
      // Garantir que data seja sempre um array
      setWishlists(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar wishlists:', error)
      toast.error('Erro ao carregar wishlists')
      // Em caso de erro, garantir que wishlists seja um array vazio
      setWishlists([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newItem.descricao.trim() || !newItem.item_tipo.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      await viagensGrupoApi.addWishlistItem(grupoId, newItem)
      toast.success('Item adicionado à wishlist!')
      setNewItem({ item_tipo: '', descricao: '' })
      setShowAddForm(false)
      await loadWishlists(grupoId)
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
      toast.error('Erro ao adicionar item')
    }
  }

  const handleVote = async (itemId: string) => {
    // TODO: Implementar votação
    toast.success('Voto registrado!')
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
                <Heart className="w-8 h-8 text-red-500" />
                Wishlist Compartilhada
              </h1>
              <p className="text-muted-foreground mt-2">
                Itens desejados pelo grupo
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Adicionar Item à Wishlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Item *
                </label>
                <select
                  value={newItem.item_tipo}
                  onChange={(e) => setNewItem({ ...newItem, item_tipo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  <option value="hotel">Hotel</option>
                  <option value="restaurante">Restaurante</option>
                  <option value="atracao">Atração</option>
                  <option value="passeio">Passeio</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={newItem.descricao}
                  onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descreva o item desejado..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewItem({ item_tipo: '', descricao: '' })
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : wishlists.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Nenhum item na wishlist</p>
            <p className="text-gray-500 text-sm">Adicione itens desejados pelo grupo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlists
              .sort((a, b) => b.votos - a.votos)
              .map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onVote={() => handleVote(item.id)}
                />
              ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

