'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  FileText,
  Globe,
  Tag,
  BarChart3,
  Settings,
  Plus,
  Download,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  MapPin,
  X,
  Flag
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Application {
  id: number
  application_number: string
  client_name: string
  client_email: string
  passport: string
  destination: string
  destination_code: string
  type: string
  type_label: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  agent: string
  fee: number
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  submitted_at: string
  processed_at: string | null
  approved_at: string | null
  description: string
  documents: string[]
}

interface VisaStats {
  total_applications: number
  approval_rate: number
  average_processing_time: number
  total_revenue: number
  pending: number
  processing: number
  approved: number
  rejected: number
}

export default function VisasPage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'types' | 'analytics' | 'settings'>('applications')
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<VisaStats | null>(null)
  const [types, setTypes] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    passport: '',
    destination: '',
    destination_code: '',
    type: '',
    priority: 'medium',
    agent: '',
    fee: '',
    description: '',
    documents: [] as string[]
  })
  const [settings, setSettings] = useState({
    auto_notification: true,
    default_processing_time: 18,
    fee_currency: 'BRL',
    require_documents: true,
    auto_approve_simple: false
  })

  useEffect(() => {
    loadData()
  }, [activeTab, filterStatus, filterCountry])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'applications') {
        const params: any = {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          country: filterCountry !== 'all' ? filterCountry : undefined,
          search: searchTerm || undefined
        }
        const [applicationsRes, statsRes, typesRes, countriesRes] = await Promise.all([
          api.get('/api/v1/visas/applications', { params }),
          api.get('/api/v1/visas/stats'),
          api.get('/api/v1/visas/types'),
          api.get('/api/v1/visas/countries')
        ])
        setApplications(applicationsRes.data?.data || [])
        setStats(statsRes.data?.data || null)
        setTypes(typesRes.data?.data || [])
        setCountries(countriesRes.data?.data || [])
      } else if (activeTab === 'types') {
        const typesRes = await api.get('/api/v1/visas/types')
        setTypes(typesRes.data?.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/v1/visas/applications/export')
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vistos-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar dados')
    }
  }

  const handleCreateApplication = () => {
    setIsEditing(false)
    setSelectedApplication(null)
    setFormData({
      client_name: '',
      client_email: '',
      passport: '',
      destination: '',
      destination_code: '',
      type: '',
      priority: 'medium',
      agent: '',
      fee: '',
      description: '',
      documents: []
    })
    setShowApplicationModal(true)
  }

  const handleEditApplication = (app: Application) => {
    setIsEditing(true)
    setSelectedApplication(app)
    setFormData({
      client_name: app.client_name,
      client_email: app.client_email,
      passport: app.passport,
      destination: app.destination,
      destination_code: app.destination_code,
      type: app.type,
      priority: app.priority,
      agent: app.agent,
      fee: app.fee.toString(),
      description: app.description,
      documents: app.documents || []
    })
    setShowApplicationModal(true)
  }

  const handleViewApplication = (app: Application) => {
    setSelectedApplication(app)
    setShowViewModal(true)
  }

  const handleSaveApplication = async () => {
    try {
      if (!formData.client_name || !formData.passport || !formData.destination || !formData.type) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      const applicationData = {
        ...formData,
        fee: parseFloat(formData.fee) || 0
      }

      if (isEditing && selectedApplication) {
        await api.put(`/api/v1/visas/applications/${selectedApplication.id}`, applicationData)
        toast.success('Aplicação atualizada com sucesso!')
      } else {
        await api.post('/api/v1/visas/applications', applicationData)
        toast.success('Aplicação criada com sucesso!')
      }

      setShowApplicationModal(false)
      setSelectedApplication(null)
      loadData()
    } catch (error) {
      console.error('Erro ao salvar aplicação:', error)
      toast.error('Erro ao salvar aplicação')
    }
  }

  const handleDeleteApplication = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta aplicação?')) return

    try {
      await api.delete(`/api/v1/visas/applications/${id}`)
      toast.success('Aplicação excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir aplicação:', error)
      toast.error('Erro ao excluir aplicação')
    }
  }

  const handleSaveSettings = async () => {
    try {
      // TODO: Implementar salvamento de configurações na API
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Processando' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejeitado' }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Média' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' }
    }
    
    const badge = badges[priority] || badges.medium
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.passport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.destination.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Processamento de Vistos</h1>
                <p className="mt-2 text-gray-600">Gestão completa de aplicações de visto</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateApplication}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aplicação
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Aplicações</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Taxa de Aprovação</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approval_rate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tempo Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.average_processing_time} dias</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Overview */}
          {stats && activeTab === 'applications' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status das Aplicações</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-500">Pendentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  <p className="text-sm text-gray-500">Processando</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  <p className="text-sm text-gray-500">Aprovadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-sm text-gray-500">Rejeitadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'applications', name: 'Aplicações', icon: FileText },
                  { id: 'types', name: 'Tipos de Visto', icon: Tag },
                  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                  { id: 'settings', name: 'Configurações', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Filters */}
              {activeTab === 'applications' && (
                <div className="mb-6 flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Buscar aplicações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadData()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      loadData()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os status</option>
                    <option value="pending">Pendentes</option>
                    <option value="processing">Processando</option>
                    <option value="approved">Aprovadas</option>
                    <option value="rejected">Rejeitadas</option>
                  </select>
                  <select
                    value={filterCountry}
                    onChange={(e) => {
                      setFilterCountry(e.target.value)
                      loadData()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os países</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Applications List */}
              {activeTab === 'applications' && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma aplicação encontrada</h3>
                    </div>
                  ) : (
                    filteredApplications.map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <User className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{app.client_name}</span>
                              {getStatusBadge(app.status)}
                              {getPriorityBadge(app.priority)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500">Passaporte</p>
                                <p className="text-sm font-medium text-gray-900">{app.passport}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Destino</p>
                                <div className="flex items-center">
                                  <Flag className="h-3 w-3 mr-1 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-900">{app.destination}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Tipo</p>
                                <p className="text-sm font-medium text-gray-900">{app.type_label}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Agente</p>
                                <p className="text-sm font-medium text-gray-900">{app.agent}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Taxa</p>
                                <p className="text-sm font-medium text-gray-900">{formatCurrency(app.fee)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Aplicação</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(app.submitted_at)}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">{app.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleViewApplication(app)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditApplication(app)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Types List */}
              {activeTab === 'types' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {types.map((type) => (
                    <div key={type.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                      <p className="text-sm text-gray-500">Total: {type.count} aplicações</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics */}
              {activeTab === 'analytics' && stats && (
                <div className="space-y-6">
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Applications by Status */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aplicações por Status</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Pendentes</span>
                            <span className="text-gray-500">{stats.pending} ({((stats.pending / stats.total_applications) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(stats.pending / stats.total_applications) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Processando</span>
                            <span className="text-gray-500">{stats.processing} ({((stats.processing / stats.total_applications) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(stats.processing / stats.total_applications) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Aprovadas</span>
                            <span className="text-gray-500">{stats.approved} ({((stats.approved / stats.total_applications) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(stats.approved / stats.total_applications) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Rejeitadas</span>
                            <span className="text-gray-500">{stats.rejected} ({((stats.rejected / stats.total_applications) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(stats.rejected / stats.total_applications) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applications by Type */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aplicações por Tipo</h3>
                      <div className="space-y-3">
                        {types.map((type) => {
                          const percentage = stats.total_applications > 0 ? (type.count / stats.total_applications) * 100 : 0
                          return (
                            <div key={type.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{type.name}</span>
                                <span className="text-gray-500">{type.count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Taxa de Aprovação</h3>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.approval_rate}%</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.approved} de {stats.total_applications} aprovadas</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Tempo Médio de Processamento</h3>
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.average_processing_time} dias</p>
                      <p className="text-xs text-gray-500 mt-1">Tempo médio desde submissão</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Receita Média por Aplicação</h3>
                        <DollarSign className="h-5 w-5 text-orange-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats.total_applications > 0 ? stats.total_revenue / stats.total_applications : 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Total: {formatCurrency(stats.total_revenue)}</p>
                    </div>
                  </div>

                  {/* Countries Distribution */}
                  {countries.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por País</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {countries.slice(0, 8).map((country) => (
                          <div key={country.code} className="text-center p-3 bg-gray-50 rounded-lg">
                            <Flag className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">{country.name}</p>
                            <p className="text-xs text-gray-500">{country.count} aplicações</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Notificação Automática</p>
                          <p className="text-xs text-gray-500">Enviar notificações automáticas sobre status</p>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, auto_notification: !settings.auto_notification })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            settings.auto_notification ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.auto_notification ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Padrão de Processamento (dias)</label>
                        <input
                          type="number"
                          value={settings.default_processing_time}
                          onChange={(e) => setSettings({ ...settings, default_processing_time: parseInt(e.target.value) || 18 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          max="90"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moeda das Taxas</label>
                        <select
                          value={settings.fee_currency}
                          onChange={(e) => setSettings({ ...settings, fee_currency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="BRL">BRL - Real Brasileiro</option>
                          <option value="USD">USD - Dólar Americano</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Requer Documentos</p>
                          <p className="text-xs text-gray-500">Exigir upload de documentos obrigatórios</p>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, require_documents: !settings.require_documents })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            settings.require_documents ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.require_documents ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Aprovação Automática Simples</p>
                          <p className="text-xs text-gray-500">Aprovar automaticamente vistos simples</p>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, auto_approve_simple: !settings.auto_approve_simple })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            settings.auto_approve_simple ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.auto_approve_simple ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Salvar Configurações
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Editar Aplicação' : 'Nova Aplicação'}
                </h3>
                <button
                  onClick={() => {
                    setShowApplicationModal(false)
                    setSelectedApplication(null)
                    setIsEditing(false)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email do Cliente</label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passaporte *</label>
                  <input
                    type="text"
                    value={formData.passport}
                    onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                    <select
                      value={formData.destination_code}
                      onChange={(e) => {
                        const country = countries.find(c => c.code === e.target.value)
                        setFormData({
                          ...formData,
                          destination_code: e.target.value,
                          destination: country?.name || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione um país</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Visto *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione um tipo</option>
                      {types.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxa (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agente</label>
                  <input
                    type="text"
                    value={formData.agent}
                    onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApplicationModal(false)
                    setSelectedApplication(null)
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveApplication}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Application Modal */}
        {showViewModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes da Aplicação</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedApplication(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número da Aplicação</p>
                    <p className="text-sm text-gray-900">{selectedApplication.application_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prioridade</p>
                    {getPriorityBadge(selectedApplication.priority)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="text-sm text-gray-900">{selectedApplication.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedApplication.client_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Passaporte</p>
                    <p className="text-sm text-gray-900">{selectedApplication.passport}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Destino</p>
                    <div className="flex items-center">
                      <Flag className="h-3 w-3 mr-1 text-gray-400" />
                      <p className="text-sm text-gray-900">{selectedApplication.destination}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <p className="text-sm text-gray-900">{selectedApplication.type_label}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Agente</p>
                    <p className="text-sm text-gray-900">{selectedApplication.agent}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Taxa</p>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedApplication.fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Submissão</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedApplication.submitted_at)}</p>
                  </div>
                  {selectedApplication.processed_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Processamento</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedApplication.processed_at)}</p>
                    </div>
                  )}
                  {selectedApplication.approved_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Aprovação</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedApplication.approved_at)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descrição</p>
                  <p className="text-sm text-gray-900">{selectedApplication.description}</p>
                </div>
                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Documentos</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.documents.map((doc, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditApplication(selectedApplication)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
