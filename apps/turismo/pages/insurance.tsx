'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  Shield,
  FileText,
  AlertCircle,
  Tag,
  BarChart3,
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Policy {
  id: number
  policy_number: string
  client_name: string
  client_email: string
  type: string
  type_label: string
  coverage: number
  premium: number
  agent: string
  status: 'active' | 'expired' | 'cancelled'
  valid_until: string
  claims_count: number
  description: string
  created_at: string
  updated_at: string
}

interface Claim {
  id: number
  claim_number: string
  policy_id: number
  policy_number: string
  client_name: string
  type: string
  amount: number
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  submitted_at: string
  processed_at: string | null
  description: string
}

interface InsuranceStats {
  total_policies: number
  active_policies: number
  total_premiums: number
  pending_claims: number
  total_claims: number
  total_paid: number
  average_processing_time: number
  satisfaction_rating: number
}

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'types' | 'analytics'>('policies')
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [stats, setStats] = useState<InsuranceStats | null>(null)
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    type: '',
    coverage: '',
    premium: '',
    agent: '',
    valid_until: '',
    description: ''
  })
  const [claimFilterStatus, setClaimFilterStatus] = useState('all')

  useEffect(() => {
    loadData()
  }, [activeTab, filterType, filterStatus])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'policies') {
        const params: any = {
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined
        }
        const [policiesRes, statsRes, typesRes] = await Promise.all([
          api.get('/api/v1/insurance/policies', { params }),
          api.get('/api/v1/insurance/stats'),
          api.get('/api/v1/insurance/types')
        ])
        setPolicies(policiesRes.data?.data || [])
        setStats(statsRes.data?.data || null)
        setTypes(typesRes.data?.data || [])
      } else if (activeTab === 'claims') {
        const params: any = {
          status: claimFilterStatus !== 'all' ? claimFilterStatus : undefined
        }
        const [claimsRes] = await Promise.all([
          api.get('/api/v1/insurance/claims', { params })
        ])
        setClaims(claimsRes.data?.data || [])
      } else if (activeTab === 'types') {
        const typesRes = await api.get('/api/v1/insurance/types')
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
      const response = await api.get('/api/v1/insurance/policies/export')
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `apolices-export-${new Date().toISOString().split('T')[0]}.json`
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

  const handleCreatePolicy = () => {
    setIsEditing(false)
    setSelectedPolicy(null)
    setFormData({
      client_name: '',
      client_email: '',
      type: '',
      coverage: '',
      premium: '',
      agent: '',
      valid_until: '',
      description: ''
    })
    setShowPolicyModal(true)
  }

  const handleEditPolicy = (policy: Policy) => {
    setIsEditing(true)
    setSelectedPolicy(policy)
    setFormData({
      client_name: policy.client_name,
      client_email: policy.client_email,
      type: policy.type,
      coverage: policy.coverage.toString(),
      premium: policy.premium.toString(),
      agent: policy.agent,
      valid_until: policy.valid_until,
      description: policy.description
    })
    setShowPolicyModal(true)
  }

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy)
    setShowViewModal(true)
  }

  const handleSavePolicy = async () => {
    try {
      if (!formData.client_name || !formData.type || !formData.coverage || !formData.premium) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      const policyData = {
        ...formData,
        coverage: parseFloat(formData.coverage),
        premium: parseFloat(formData.premium)
      }

      if (isEditing && selectedPolicy) {
        await api.put(`/api/v1/insurance/policies/${selectedPolicy.id}`, policyData)
        toast.success('Apólice atualizada com sucesso!')
      } else {
        await api.post('/api/v1/insurance/policies', policyData)
        toast.success('Apólice criada com sucesso!')
      }

      setShowPolicyModal(false)
      setSelectedPolicy(null)
      loadData()
    } catch (error) {
      console.error('Erro ao salvar apólice:', error)
      toast.error('Erro ao salvar apólice')
    }
  }

  const handleDeletePolicy = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta apólice?')) return

    try {
      await api.delete(`/api/v1/insurance/policies/${id}`)
      toast.success('Apólice excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir apólice:', error)
      toast.error('Erro ao excluir apólice')
    }
  }

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim)
    setShowClaimModal(true)
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
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ativa' },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Expirada' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelada' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Processando' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejeitado' }
    }
    
    const badge = badges[status] || badges.active
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = !searchTerm || 
      policy.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Seguros</h1>
                <p className="mt-2 text-gray-600">Sistema completo de apólices e sinistros</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreatePolicy}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Apólice
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
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Apólices</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_policies}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Apólices Ativas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_policies}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Prêmios Totais</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_premiums)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sinistros Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_claims}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Overview */}
          {stats && activeTab === 'policies' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral de Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total de Sinistros</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_claims}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pago</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_paid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_processing_time} dias</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Satisfação</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.satisfaction_rating}/5</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'policies', name: 'Apólices', icon: FileText },
                  { id: 'claims', name: 'Sinistros', icon: AlertCircle },
                  { id: 'types', name: 'Tipos de Seguro', icon: Tag },
                  { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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
              {activeTab === 'policies' && (
                <div className="mb-6 flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Buscar apólices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadData()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value)
                      loadData()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os tipos</option>
                    {types.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      loadData()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os status</option>
                    <option value="active">Ativas</option>
                    <option value="expired">Expiradas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </div>
              )}

              {/* Policies List */}
              {activeTab === 'policies' && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : filteredPolicies.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma apólice encontrada</h3>
                    </div>
                  ) : (
                    filteredPolicies.map((policy) => (
                      <div key={policy.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <User className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{policy.client_name}</span>
                              {getStatusBadge(policy.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500">Código</p>
                                <p className="text-sm font-medium text-gray-900">{policy.policy_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Tipo</p>
                                <p className="text-sm font-medium text-gray-900">{policy.type_label}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Cobertura</p>
                                <p className="text-sm font-medium text-gray-900">{formatCurrency(policy.coverage)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Prêmio</p>
                                <p className="text-sm font-medium text-gray-900">{formatCurrency(policy.premium)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Agente</p>
                                <p className="text-sm font-medium text-gray-900">{policy.agent}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Válido até</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(policy.valid_until)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Sinistros</p>
                                <p className="text-sm font-medium text-gray-900">{policy.claims_count}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">{policy.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleViewPolicy(policy)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditPolicy(policy)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePolicy(policy.id)}
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

              {/* Claims List */}
              {activeTab === 'claims' && (
                <div>
                  {/* Filters */}
                  <div className="mb-6">
                    <select
                      value={claimFilterStatus}
                      onChange={(e) => {
                        setClaimFilterStatus(e.target.value)
                        loadData()
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos os status</option>
                      <option value="pending">Pendentes</option>
                      <option value="processing">Processando</option>
                      <option value="approved">Aprovados</option>
                      <option value="rejected">Rejeitados</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : claims.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum sinistro encontrado</h3>
                      </div>
                    ) : (
                      claims.map((claim) => (
                        <div key={claim.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewClaim(claim)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-medium text-gray-900">{claim.claim_number}</span>
                                {getStatusBadge(claim.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <p className="text-xs text-gray-500">Cliente</p>
                                  <p className="text-sm font-medium text-gray-900">{claim.client_name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Apólice</p>
                                  <p className="text-sm font-medium text-gray-900">{claim.policy_number}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Valor</p>
                                  <p className="text-sm font-medium text-gray-900">{formatCurrency(claim.amount)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Data</p>
                                  <p className="text-sm font-medium text-gray-900">{formatDate(claim.submitted_at)}</p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewClaim(claim)
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Types List */}
              {activeTab === 'types' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {types.map((type) => (
                    <div key={type.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                      <p className="text-sm text-gray-500">Total: {type.count} apólices</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics */}
              {activeTab === 'analytics' && stats && (
                <div className="space-y-6">
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Policies by Type */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Apólices por Tipo</h3>
                      <div className="space-y-3">
                        {types.map((type) => {
                          const percentage = stats.total_policies > 0 ? (type.count / stats.total_policies) * 100 : 0
                          return (
                            <div key={type.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{type.name}</span>
                                <span className="text-gray-500">{type.count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Claims Status */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Sinistros</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Pendentes</span>
                            <span className="text-gray-500">{stats.pending_claims}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${(stats.pending_claims / stats.total_claims) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Aprovados</span>
                            <span className="text-gray-500">{stats.total_claims - stats.pending_claims}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${((stats.total_claims - stats.pending_claims) / stats.total_claims) * 100}%` }}
                            ></div>
                          </div>
                        </div>
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
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.total_claims > 0 ? (((stats.total_claims - stats.pending_claims) / stats.total_claims) * 100).toFixed(1) : 0}%
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Valor Médio por Sinistro</h3>
                        <DollarSign className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats.total_claims > 0 ? stats.total_paid / stats.total_claims : 0)}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Satisfação do Cliente</h3>
                        <CheckCircle className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.satisfaction_rating}/5</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Editar Apólice' : 'Nova Apólice'}
                </h3>
                <button
                  onClick={() => {
                    setShowPolicyModal(false)
                    setSelectedPolicy(null)
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Seguro *</label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cobertura (R$) *</label>
                    <input
                      type="number"
                      value={formData.coverage}
                      onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prêmio (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Válido até *</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
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
                    setShowPolicyModal(false)
                    setSelectedPolicy(null)
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePolicy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Policy Modal */}
        {showViewModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes da Apólice</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedPolicy(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Código</p>
                    <p className="text-sm text-gray-900">{selectedPolicy.policy_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    {getStatusBadge(selectedPolicy.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="text-sm text-gray-900">{selectedPolicy.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedPolicy.client_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <p className="text-sm text-gray-900">{selectedPolicy.type_label}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Agente</p>
                    <p className="text-sm text-gray-900">{selectedPolicy.agent}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cobertura</p>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedPolicy.coverage)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prêmio</p>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedPolicy.premium)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Válido até</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedPolicy.valid_until)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sinistros</p>
                    <p className="text-sm text-gray-900">{selectedPolicy.claims_count}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descrição</p>
                  <p className="text-sm text-gray-900">{selectedPolicy.description}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditPolicy(selectedPolicy)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Claim Modal */}
        {showClaimModal && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Sinistro</h3>
                <button
                  onClick={() => {
                    setShowClaimModal(false)
                    setSelectedClaim(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número do Sinistro</p>
                    <p className="text-sm text-gray-900">{selectedClaim.claim_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="text-sm text-gray-900">{selectedClaim.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Apólice</p>
                    <p className="text-sm text-gray-900">{selectedClaim.policy_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valor</p>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedClaim.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <p className="text-sm text-gray-900">{selectedClaim.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Submissão</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedClaim.submitted_at)}</p>
                  </div>
                  {selectedClaim.processed_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Processamento</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedClaim.processed_at)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descrição</p>
                  <p className="text-sm text-gray-900">{selectedClaim.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
