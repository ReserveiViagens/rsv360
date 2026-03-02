'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X,
  Save,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  User,
  FileText,
  TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GiftCard {
  id: number
  code: string
  amount: number
  balance: number
  currency: string
  status: 'active' | 'used' | 'expired' | 'cancelled'
  recipient_email: string | null
  sender_name: string | null
  sender_email: string | null
  message: string | null
  expires_at: string | null
  used_at: string | null
  created_at: string
  updated_at: string
}

interface GiftCardTransaction {
  id: number
  gift_card_id: number
  transaction_type: 'purchase' | 'usage' | 'refund'
  amount: number
  description: string | null
  order_id: number | null
  created_at: string
}

interface GiftCardStats {
  total_gift_cards: number
  active_gift_cards: number
  used_gift_cards: number
  expired_gift_cards: number
  cancelled_gift_cards: number
  total_value: number
  total_balance: number
  total_used_value: number
}

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [transactions, setTransactions] = useState<GiftCardTransaction[]>([])
  const [stats, setStats] = useState<GiftCardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGiftCard, setEditingGiftCard] = useState<GiftCard | null>(null)
  const [searchCode, setSearchCode] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BRL',
    recipient_email: '',
    sender_name: '',
    sender_email: '',
    message: '',
    expires_at: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      const [giftCardsRes, transactionsRes, statsRes] = await Promise.all([
        api.get('/api/v1/giftcards', { params }),
        api.get('/api/v1/giftcards/transactions/list'),
        api.get('/api/v1/giftcards/stats/overview')
      ])
      
      setGiftCards(giftCardsRes.data?.data || [])
      setTransactions(transactionsRes.data?.data || [])
      setStats(statsRes.data?.data || null)
    } catch (error) {
      console.error('Erro ao carregar gift cards:', error)
      toast.error('Erro ao carregar gift cards')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        recipient_email: formData.recipient_email || null,
        sender_name: formData.sender_name || null,
        sender_email: formData.sender_email || null,
        message: formData.message || null,
        expires_at: formData.expires_at || null
      }

      if (editingGiftCard) {
        await api.put(`/api/v1/giftcards/${editingGiftCard.id}`, payload)
        toast.success('Gift card atualizado com sucesso!')
      } else {
        await api.post('/api/v1/giftcards', payload)
        toast.success('Gift card criado com sucesso!')
      }

      setShowForm(false)
      setEditingGiftCard(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar gift card:', error)
      toast.error('Erro ao salvar gift card')
    }
  }

  const handleEdit = (giftCard: GiftCard) => {
    setEditingGiftCard(giftCard)
    setFormData({
      amount: giftCard.amount.toString(),
      currency: giftCard.currency,
      recipient_email: giftCard.recipient_email || '',
      sender_name: giftCard.sender_name || '',
      sender_email: giftCard.sender_email || '',
      message: giftCard.message || '',
      expires_at: giftCard.expires_at ? giftCard.expires_at.split('T')[0] : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar este gift card?')) return

    try {
      await api.delete(`/api/v1/giftcards/${id}`)
      toast.success('Gift card cancelado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao cancelar gift card:', error)
      toast.error('Erro ao cancelar gift card')
    }
  }

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      loadData()
      return
    }

    try {
      const response = await api.get(`/api/v1/giftcards/code/${searchCode}`)
      setGiftCards([response.data.data])
      toast.success('Gift card encontrado!')
    } catch (error) {
      console.error('Erro ao buscar gift card:', error)
      toast.error('Gift card não encontrado')
      setGiftCards([])
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      currency: 'BRL',
      recipient_email: '',
      sender_name: '',
      sender_email: '',
      message: '',
      expires_at: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'used': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      used: 'Usado',
      expired: 'Expirado',
      cancelled: 'Cancelado'
    }
    return labels[status] || status
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-pink-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gift Cards</h1>
              <p className="text-gray-600 mt-1">Gestão de cartões presente</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingGiftCard(null)
              resetForm()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Gift Card
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_gift_cards}</p>
                </div>
                <Gift className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_gift_cards}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.total_value, 'BRL')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo Disponível</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.total_balance, 'BRL')}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Código</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent font-mono"
                    placeholder="GIFT-XXXX-XXXX"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Buscar
                </button>
                {searchCode && (
                  <button
                    onClick={() => {
                      setSearchCode('')
                      loadData()
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="used">Usados</option>
                <option value="expired">Expirados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giftCards.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Nenhum gift card encontrado</p>
              <p className="text-gray-500 text-sm">Clique em "Novo Gift Card" para começar</p>
            </div>
          ) : (
            giftCards.map((giftCard) => (
              <div key={giftCard.id} className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-lg text-white overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Gift className="w-6 h-6" />
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(giftCard.status)}`}>
                      {getStatusLabel(giftCard.status)}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm opacity-90 mb-1">Código</p>
                    <p className="text-2xl font-bold font-mono">{giftCard.code}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm opacity-90 mb-1">Valor</p>
                    <p className="text-3xl font-bold">{formatCurrency(giftCard.amount, giftCard.currency)}</p>
                  </div>
                  {giftCard.balance < giftCard.amount && (
                    <div className="mb-4">
                      <p className="text-sm opacity-90 mb-1">Saldo Disponível</p>
                      <p className="text-xl font-semibold">{formatCurrency(giftCard.balance, giftCard.currency)}</p>
                    </div>
                  )}
                  {giftCard.recipient_email && (
                    <div className="mb-2">
                      <p className="text-xs opacity-75">Para: {giftCard.recipient_email}</p>
                    </div>
                  )}
                  {giftCard.message && (
                    <div className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                      <p className="text-sm italic">&quot;{giftCard.message}&quot;</p>
                    </div>
                  )}
                  <div className="text-xs opacity-75 mt-4">
                    Criado em {new Date(giftCard.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="bg-white bg-opacity-10 p-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(giftCard)}
                    className="flex-1 px-3 py-2 bg-white bg-opacity-20 text-white text-sm rounded hover:bg-opacity-30 transition flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                  {giftCard.status === 'active' && (
                    <button
                      onClick={() => handleDelete(giftCard.id)}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                      title="Cancelar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Transações Recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gift Card</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{transaction.gift_card_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          transaction.transaction_type === 'purchase' ? 'bg-green-100 text-green-800' :
                          transaction.transaction_type === 'usage' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatCurrency(transaction.amount, 'BRL')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.description || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingGiftCard ? 'Editar Gift Card' : 'Novo Gift Card'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingGiftCard(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    >
                      <option value="BRL">BRL (R$)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email do Destinatário</label>
                  <input
                    type="email"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="destinatario@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Remetente</label>
                    <input
                      type="text"
                      value={formData.sender_name}
                      onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email do Remetente</label>
                    <input
                      type="email"
                      value={formData.sender_email}
                      onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="remetente@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="Mensagem personalizada..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingGiftCard(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
