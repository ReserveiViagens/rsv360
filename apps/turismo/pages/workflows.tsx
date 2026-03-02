'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  Workflow,
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  Clock,
  FileText,
  Copy,
  X,
  Save,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Workflow {
  id: number
  name: string
  description: string
  status: 'active' | 'paused' | 'stopped' | 'draft'
  type: 'automation' | 'approval' | 'notification' | 'data_processing'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_by: string
  created_at: string
  updated_at: string
  last_executed?: string
  next_execution?: string
  execution_count: number
  success_rate: number
  average_duration: string
  triggers: string[]
  actions: string[]
  conditions: string[]
  category: string
  tags: string[]
  is_scheduled: boolean
  schedule?: string
  recipients: string[]
  error_count: number
  last_error?: string
}

interface WorkflowStats {
  total_workflows: number
  active_workflows: number
  paused_workflows: number
  stopped_workflows: number
  draft_workflows: number
  total_executions: number
  success_rate: number
  average_duration: string
  error_count: number
  scheduled_workflows: number
  automation_workflows: number
  approval_workflows: number
  notification_workflows: number
  data_processing_workflows: number
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'paused' | 'stopped' | 'draft'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'automation' as Workflow['type'],
    priority: 'medium' as Workflow['priority'],
    category: '',
    tags: '',
    is_scheduled: false,
    schedule: '',
    triggers: '',
    actions: '',
    conditions: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (activeTab !== 'overview') {
        params.status = activeTab
      }

      const [workflowsRes, statsRes] = await Promise.all([
        api.get('/api/v1/workflows', { params }),
        api.get('/api/v1/workflows/stats/overview')
      ])
      
      let data = workflowsRes.data?.data || []
      
      // Filtrar por busca local
      if (searchTerm) {
        data = data.filter((w: Workflow) => 
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setWorkflows(data)
      setStats(statsRes.data?.data || null)
    } catch (error) {
      console.error('Erro ao carregar workflows:', error)
      toast.error('Erro ao carregar workflows')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        is_scheduled: formData.is_scheduled,
        schedule: formData.schedule || null,
        triggers: formData.triggers.split(',').map(t => t.trim()).filter(t => t),
        actions: formData.actions.split(',').map(a => a.trim()).filter(a => a),
        conditions: formData.conditions.split(',').map(c => c.trim()).filter(c => c),
        status: 'draft'
      }

      if (selectedWorkflow) {
        await api.put(`/api/v1/workflows/${selectedWorkflow.id}`, payload)
        toast.success('Workflow atualizado com sucesso!')
      } else {
        await api.post('/api/v1/workflows', payload)
        toast.success('Workflow criado com sucesso!')
      }

      setShowForm(false)
      setSelectedWorkflow(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar workflow:', error)
      toast.error('Erro ao salvar workflow')
    }
  }

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setFormData({
      name: workflow.name,
      description: workflow.description,
      type: workflow.type,
      priority: workflow.priority,
      category: workflow.category,
      tags: workflow.tags.join(', '),
      is_scheduled: workflow.is_scheduled,
      schedule: workflow.schedule || '',
      triggers: workflow.triggers.join(', '),
      actions: workflow.actions.join(', '),
      conditions: workflow.conditions.join(', ')
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este workflow?')) return

    try {
      await api.delete(`/api/v1/workflows/${id}`)
      toast.success('Workflow excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir workflow:', error)
      toast.error('Erro ao excluir workflow')
    }
  }

  const handleStatusChange = async (id: number, currentStatus: string, newStatus: string) => {
    try {
      await api.patch(`/api/v1/workflows/${id}/status`, { status: newStatus })
      toast.success(`Workflow ${newStatus === 'active' ? 'ativado' : newStatus === 'paused' ? 'pausado' : 'parado'} com sucesso!`)
      loadData()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const handleExecute = async (id: number) => {
    try {
      await api.post(`/api/v1/workflows/${id}/execute`, {})
      toast.success('Workflow executado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao executar workflow:', error)
      toast.error('Erro ao executar workflow')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/v1/workflows/export/data', {
        params: { format: 'json' }
      })
      
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `workflows-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Workflows exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar workflows:', error)
      toast.error('Erro ao exportar workflows')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'automation',
      priority: 'medium',
      category: '',
      tags: '',
      is_scheduled: false,
      schedule: '',
      triggers: '',
      actions: '',
      conditions: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'stopped': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      stopped: 'Parado',
      draft: 'Rascunho'
    }
    return labels[status] || status
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automation': return 'bg-blue-100 text-blue-800'
      case 'approval': return 'bg-green-100 text-green-800'
      case 'notification': return 'bg-purple-100 text-purple-800'
      case 'data_processing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      automation: 'Automação',
      approval: 'Aprovação',
      notification: 'Notificação',
      data_processing: 'Processamento'
    }
    return labels[type] || type
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statsCards = stats ? [
    {
      id: 'total_workflows',
      title: 'Total de Workflows',
      value: stats.total_workflows.toString(),
      icon: Workflow,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Workflows no sistema'
    },
    {
      id: 'active_workflows',
      title: 'Ativos',
      value: stats.active_workflows.toString(),
      icon: Play,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Workflows em execução'
    },
    {
      id: 'total_executions',
      title: 'Execuções',
      value: stats.total_executions.toString(),
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Total de execuções'
    },
    {
      id: 'success_rate',
      title: 'Taxa de Sucesso',
      value: `${stats.success_rate}%`,
      icon: CheckCircle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Taxa de sucesso'
    },
    {
      id: 'average_duration',
      title: 'Duração Média',
      value: stats.average_duration,
      icon: Clock,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Tempo médio de execução'
    },
    {
      id: 'error_count',
      title: 'Erros',
      value: stats.error_count.toString(),
      icon: XCircle,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Total de erros'
    }
  ] : []

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'active', name: 'Ativos', icon: Play },
    { id: 'paused', name: 'Pausados', icon: Pause },
    { id: 'stopped', name: 'Parados', icon: Square },
    { id: 'draft', name: 'Rascunhos', icon: FileText }
  ]

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Workflows</h1>
                <p className="mt-2 text-gray-600">
                  Gerencie automações e processos de negócio
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                <button
                  onClick={() => {
                    setShowForm(true)
                    setSelectedWorkflow(null)
                    resetForm()
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Workflow
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
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
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedWorkflow(null)
                        setShowModal(true)
                      }}
                      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 ${card.bgColor} rounded-lg`}>
                            <Icon className={`h-6 w-6 ${card.textColor}`} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                          </div>
                        </div>
                        <div className="text-gray-400 hover:text-gray-600">
                          <span className="text-xs">Clique para detalhes</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">{card.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const activeWorkflow = workflows.find(w => w.status === 'paused' || w.status === 'stopped')
                      if (activeWorkflow) {
                        handleStatusChange(activeWorkflow.id, activeWorkflow.status, 'active')
                      }
                    }}
                    className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Play className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Iniciar</span>
                  </button>
                  <button
                    onClick={() => {
                      const pausedWorkflow = workflows.find(w => w.status === 'active')
                      if (pausedWorkflow) {
                        handleStatusChange(pausedWorkflow.id, pausedWorkflow.status, 'paused')
                      }
                    }}
                    className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <Pause className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-700">Pausar</span>
                  </button>
                  <button
                    onClick={() => {
                      const stoppedWorkflow = workflows.find(w => w.status === 'active' || w.status === 'paused')
                      if (stoppedWorkflow) {
                        handleStatusChange(stoppedWorkflow.id, stoppedWorkflow.status, 'stopped')
                      }
                    }}
                    className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Square className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-700">Parar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (workflows.length > 0) {
                        const workflowToDuplicate = workflows[0]
                        setFormData({
                          name: `${workflowToDuplicate.name} (Cópia)`,
                          description: workflowToDuplicate.description,
                          type: workflowToDuplicate.type,
                          priority: workflowToDuplicate.priority,
                          category: workflowToDuplicate.category,
                          tags: workflowToDuplicate.tags.join(', '),
                          is_scheduled: workflowToDuplicate.is_scheduled,
                          schedule: workflowToDuplicate.schedule || '',
                          triggers: workflowToDuplicate.triggers.join(', '),
                          actions: workflowToDuplicate.actions.join(', '),
                          conditions: workflowToDuplicate.conditions.join(', ')
                        })
                        setSelectedWorkflow(null)
                        setShowForm(true)
                      }
                    }}
                    className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Duplicar</span>
                  </button>
                </div>
              </div>

              {/* Workflows List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Workflows Recentes</h3>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar workflows..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && loadData()}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={selectedFilter}
                        onChange={(e) => {
                          setSelectedFilter(e.target.value)
                          if (e.target.value !== 'all') {
                            setActiveTab(e.target.value as any)
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos os Status</option>
                        <option value="active">Ativos</option>
                        <option value="paused">Pausados</option>
                        <option value="stopped">Parados</option>
                        <option value="draft">Rascunhos</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Execuções
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Taxa de Sucesso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Última Execução
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workflows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Nenhum workflow encontrado. Clique em "Novo Workflow" para começar.
                          </td>
                        </tr>
                      ) : (
                        workflows.map((workflow) => (
                          <tr key={workflow.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{workflow.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(workflow.type)}`}>
                                {getTypeLabel(workflow.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                                {getStatusLabel(workflow.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {workflow.execution_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {workflow.success_rate.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {workflow.last_executed ? formatDate(workflow.last_executed) : 'Nunca'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedWorkflow(workflow)
                                    setShowModal(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {workflow.status === 'active' && (
                                  <button
                                    onClick={() => handleExecute(workflow.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Executar"
                                  >
                                    <Zap className="h-4 w-4" />
                                  </button>
                                )}
                                {workflow.status === 'active' && (
                                  <button
                                    onClick={() => handleStatusChange(workflow.id, workflow.status, 'paused')}
                                    className="text-yellow-600 hover:text-yellow-900"
                                    title="Pausar"
                                  >
                                    <Pause className="h-4 w-4" />
                                  </button>
                                )}
                                {(workflow.status === 'paused' || workflow.status === 'stopped') && (
                                  <button
                                    onClick={() => handleStatusChange(workflow.id, workflow.status, 'active')}
                                    className="text-green-600 hover:text-green-900"
                                    title="Ativar"
                                  >
                                    <Play className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEdit(workflow)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(workflow.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab !== 'overview' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadData()}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Execuções</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de Sucesso</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workflows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Nenhum workflow encontrado nesta categoria.
                        </td>
                      </tr>
                    ) : (
                      workflows.map((workflow) => (
                        <tr key={workflow.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                            <div className="text-sm text-gray-500">{workflow.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(workflow.type)}`}>
                              {getTypeLabel(workflow.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{workflow.execution_count}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{workflow.success_rate.toFixed(1)}%</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedWorkflow(workflow)
                                  setShowModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(workflow)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(workflow.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedWorkflow && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Workflow</h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedWorkflow(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-sm text-gray-900">{selectedWorkflow.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descrição</p>
                  <p className="text-sm text-gray-900">{selectedWorkflow.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedWorkflow.type)}`}>
                      {getTypeLabel(selectedWorkflow.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedWorkflow.status)}`}>
                      {getStatusLabel(selectedWorkflow.status)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Execuções</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.execution_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.success_rate.toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duração Média</p>
                  <p className="text-sm text-gray-900">{selectedWorkflow.average_duration}</p>
                </div>
                {selectedWorkflow.triggers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Triggers</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedWorkflow.triggers.map((trigger, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedWorkflow.actions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ações</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedWorkflow.actions.map((action, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Criado por</p>
                  <p className="text-sm text-gray-900">{selectedWorkflow.created_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Última atualização</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedWorkflow.updated_at)}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedWorkflow(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedWorkflow ? 'Editar Workflow' : 'Novo Workflow'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedWorkflow(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do workflow"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Workflow['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="automation">Automação</option>
                      <option value="approval">Aprovação</option>
                      <option value="notification">Notificação</option>
                      <option value="data_processing">Processamento</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do workflow"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Workflow['priority'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Categoria"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Triggers (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formData.triggers}
                    onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Trigger 1, Trigger 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ações (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.actions}
                    onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ação 1, Ação 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condições (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Condição 1, Condição 2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_scheduled}
                    onChange={(e) => setFormData({ ...formData, is_scheduled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Agendado</label>
                </div>
                {formData.is_scheduled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agendamento</label>
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Diário às 09:00"
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedWorkflow(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
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
