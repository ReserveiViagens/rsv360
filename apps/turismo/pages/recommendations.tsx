'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { 
  Lightbulb, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Users, 
  MapPin, 
  Package,
  Activity,
  TrendingUp,
  CheckCircle,
  X,
  Save,
  Eye,
  EyeOff,
  Filter,
  Search
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Recommendation {
  id: number
  type: 'destination' | 'package' | 'hotel' | 'activity'
  title: string
  description: string
  target_audience: 'families' | 'couples' | 'solo' | 'business' | 'all'
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'inactive'
  image: string
  link: string
  metadata: {
    tags?: string[]
    season?: string
    duration?: string
  }
  created_at: string
  updated_at: string
}

interface RecommendationStats {
  total_recommendations: number
  active_recommendations: number
  by_type: {
    destination: number
    package: number
    hotel: number
    activity: number
  }
  by_audience: {
    families: number
    couples: number
    solo: number
    business: number
    all: number
  }
  by_priority: {
    high: number
    medium: number
    low: number
  }
  total_views: number
  total_clicks: number
  conversion_rate: number
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [stats, setStats] = useState<RecommendationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  })
  const [formData, setFormData] = useState({
    type: 'destination' as Recommendation['type'],
    title: '',
    description: '',
    target_audience: 'all' as Recommendation['target_audience'],
    priority: 'medium' as Recommendation['priority'],
    image: '',
    link: '',
    tags: '',
    season: 'all',
    duration: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status

      const [recommendationsRes, statsRes] = await Promise.all([
        api.get('/api/v1/recommendations', { params }),
        api.get('/api/v1/recommendations/stats/overview')
      ])
      
      let data = recommendationsRes.data?.data || []
      
      // Filtrar por busca local
      if (filters.search) {
        data = data.filter((r: Recommendation) => 
          r.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.description.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      setRecommendations(data)
      setStats(statsRes.data?.data || null)
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error)
      toast.error('Erro ao carregar recomendações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)
      
      const payload = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        target_audience: formData.target_audience,
        priority: formData.priority,
        image: formData.image,
        link: formData.link,
        metadata: {
          tags: tagsArray,
          season: formData.season,
          duration: formData.duration
        }
      }

      if (editingRecommendation) {
        await api.put(`/api/v1/recommendations/${editingRecommendation.id}`, payload)
        toast.success('Recomendação atualizada com sucesso!')
      } else {
        await api.post('/api/v1/recommendations', payload)
        toast.success('Recomendação criada com sucesso!')
      }

      setShowForm(false)
      setEditingRecommendation(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar recomendação:', error)
      toast.error('Erro ao salvar recomendação')
    }
  }

  const handleEdit = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation)
    setFormData({
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description,
      target_audience: recommendation.target_audience,
      priority: recommendation.priority,
      image: recommendation.image,
      link: recommendation.link,
      tags: recommendation.metadata?.tags?.join(', ') || '',
      season: recommendation.metadata?.season || 'all',
      duration: recommendation.metadata?.duration || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta recomendação?')) return

    try {
      await api.delete(`/api/v1/recommendations/${id}`)
      toast.success('Recomendação excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir recomendação:', error)
      toast.error('Erro ao excluir recomendação')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await api.patch(`/api/v1/recommendations/${id}/status`, { status: newStatus })
      toast.success(`Recomendação ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`)
      loadData()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'destination',
      title: '',
      description: '',
      target_audience: 'all',
      priority: 'medium',
      image: '',
      link: '',
      tags: '',
      season: 'all',
      duration: ''
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'destination': return <MapPin className="w-4 h-4" />
      case 'package': return <Package className="w-4 h-4" />
      case 'hotel': return <Activity className="w-4 h-4" />
      case 'activity': return <Activity className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      destination: 'Destino',
      package: 'Pacote',
      hotel: 'Hotel',
      activity: 'Atividade'
    }
    return labels[type] || type
  }

  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      families: 'Famílias',
      couples: 'Casal',
      solo: 'Solo',
      business: 'Negócios',
      all: 'Todos'
    }
    return labels[audience] || audience
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
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
            <Lightbulb className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recomendações</h1>
              <p className="text-gray-600 mt-1">Sistema de recomendações inteligentes</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingRecommendation(null)
              resetForm()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nova Recomendação
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_recommendations}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_recommendations}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total_views}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.conversion_rate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                  placeholder="Buscar recomendações..."
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="destination">Destino</option>
                <option value="package">Pacote</option>
                <option value="hotel">Hotel</option>
                <option value="activity">Atividade</option>
              </select>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Nenhuma recomendação encontrada</p>
              <p className="text-gray-500 text-sm">Clique em "Nova Recomendação" para começar</p>
            </div>
          ) : (
            recommendations.map((recommendation) => (
              <div key={recommendation.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {recommendation.image ? (
                    <img src={recommendation.image} alt={recommendation.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
                      {getTypeIcon(recommendation.type)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      recommendation.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {recommendation.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(recommendation.type)}
                    <span className="text-xs text-gray-500">{getTypeLabel(recommendation.type)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{recommendation.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recommendation.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      <Users className="w-3 h-3 inline mr-1" />
                      {getAudienceLabel(recommendation.target_audience)}
                    </span>
                    {recommendation.metadata?.tags && recommendation.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recommendation.metadata.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(recommendation)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(recommendation.id, recommendation.status)}
                      className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                      title={recommendation.status === 'active' ? 'Desativar' : 'Ativar'}
                    >
                      {recommendation.status === 'active' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleDelete(recommendation.id)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingRecommendation ? 'Editar Recomendação' : 'Nova Recomendação'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingRecommendation(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Recommendation['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    >
                      <option value="destination">Destino</option>
                      <option value="package">Pacote</option>
                      <option value="hotel">Hotel</option>
                      <option value="activity">Atividade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Recommendation['priority'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    >
                      <option value="high">Alta</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    placeholder="Título da recomendação"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    placeholder="Descrição da recomendação"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audiência</label>
                    <select
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as Recommendation['target_audience'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="families">Famílias</option>
                      <option value="couples">Casal</option>
                      <option value="solo">Solo</option>
                      <option value="business">Negócios</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    >
                      <option value="all">Todas</option>
                      <option value="summer">Verão</option>
                      <option value="winter">Inverno</option>
                      <option value="spring">Primavera</option>
                      <option value="autumn">Outono</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (URL)</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                      placeholder="/images/recommendations/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                      placeholder="3-5 dias"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    placeholder="/destinos/caldas-novas"
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingRecommendation(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
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
