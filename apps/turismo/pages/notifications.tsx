'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  Bell,
  BellRing,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Eye,
  Download,
  Plus,
  Search,
  Send,
  Clock,
  FileText,
  Target,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  Archive,
  Award,
  AlertTriangle,
  Mail,
  MessageSquare,
  Save,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'archived'
  channel: 'email' | 'sms' | 'push' | 'whatsapp'
  recipient: string
  sender: string
  created_at: string
  read_at?: string
  archived_at?: string
  category: string
  tags: string[]
  action_url?: string
  expires_at?: string
  is_scheduled: boolean
  scheduled_for?: string
  sent_at?: string
  opened_at?: string
  clicked_at?: string
}

interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  read_notifications: number
  archived_notifications: number
  sent_today: number
  scheduled_notifications: number
  success_rate: number
  average_open_rate: number
  total_recipients: number
  active_campaigns: number
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'unread' | 'read' | 'archived' | 'scheduled'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    channel: 'email' as Notification['channel'],
    recipient: '',
    category: '',
    tags: '',
    action_url: '',
    is_scheduled: false,
    scheduled_for: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (activeTab !== 'overview') {
        params.status = activeTab === 'scheduled' ? 'scheduled' : activeTab
      }

      const [notificationsRes, statsRes] = await Promise.all([
        api.get('/api/v1/notifications', { params }),
        api.get('/api/v1/notifications/stats/overview')
      ])
      
      let data = notificationsRes.data?.data || []
      
      // Filtrar por busca local
      if (searchTerm) {
        data = data.filter((n: Notification) => 
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setNotifications(data)
      setStats(statsRes.data?.data || null)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      toast.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        channel: formData.channel,
        recipient: formData.recipient,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        action_url: formData.action_url || null,
        is_scheduled: formData.is_scheduled,
        scheduled_for: formData.is_scheduled && formData.scheduled_for ? formData.scheduled_for : null,
        status: 'unread'
      }

      if (selectedNotification) {
        await api.put(`/api/v1/notifications/${selectedNotification.id}`, payload)
        toast.success('Notificação atualizada com sucesso!')
      } else {
        await api.post('/api/v1/notifications', payload)
        toast.success('Notificação criada com sucesso!')
      }

      setShowForm(false)
      setSelectedNotification(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar notificação:', error)
      toast.error('Erro ao salvar notificação')
    }
  }

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      channel: notification.channel,
      recipient: notification.recipient,
      category: notification.category,
      tags: notification.tags.join(', '),
      action_url: notification.action_url || '',
      is_scheduled: notification.is_scheduled,
      scheduled_for: notification.scheduled_for || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) return

    try {
      await api.delete(`/api/v1/notifications/${id}`)
      toast.success('Notificação excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
      toast.error('Erro ao excluir notificação')
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`)
      toast.success('Notificação marcada como lida!')
      loadData()
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      toast.error('Erro ao marcar como lida')
    }
  }

  const handleArchive = async (id: number) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/archive`)
      toast.success('Notificação arquivada com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao arquivar notificação:', error)
      toast.error('Erro ao arquivar notificação')
    }
  }

  const handleSend = async (id: number) => {
    try {
      await api.post(`/api/v1/notifications/${id}/send`)
      toast.success('Notificação enviada com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      toast.error('Erro ao enviar notificação')
    }
  }

  const handleSchedule = async (id: number, scheduledFor: string) => {
    try {
      await api.post(`/api/v1/notifications/${id}/schedule`, { scheduled_for: scheduledFor })
      toast.success('Notificação agendada com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao agendar notificação:', error)
      toast.error('Erro ao agendar notificação')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/v1/notifications/export/data', {
        params: { format: 'json' }
      })
      
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `notifications-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Notificações exportadas com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar notificações:', error)
      toast.error('Erro ao exportar notificações')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      channel: 'email',
      recipient: '',
      category: '',
      tags: '',
      action_url: '',
      is_scheduled: false,
      scheduled_for: ''
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'promotion': return 'bg-purple-100 text-purple-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      success: 'Sucesso',
      warning: 'Aviso',
      error: 'Erro',
      promotion: 'Promoção',
      info: 'Informação'
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unread: 'Não Lida',
      read: 'Lida',
      archived: 'Arquivada'
    }
    return labels[status] || status
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />
      case 'promotion': return <Award className="h-5 w-5 text-purple-600" />
      case 'info': return <Info className="h-5 w-5 text-blue-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
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
      id: 'total_notifications',
      title: 'Total de Notificações',
      value: stats.total_notifications.toString(),
      icon: Bell,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Notificações no sistema'
    },
    {
      id: 'unread_notifications',
      title: 'Não Lidas',
      value: stats.unread_notifications.toString(),
      icon: BellRing,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Notificações pendentes'
    },
    {
      id: 'sent_today',
      title: 'Enviadas Hoje',
      value: stats.sent_today.toString(),
      icon: Send,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Notificações enviadas hoje'
    },
    {
      id: 'success_rate',
      title: 'Taxa de Sucesso',
      value: `${stats.success_rate}%`,
      icon: CheckCircle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Taxa de entrega'
    },
    {
      id: 'open_rate',
      title: 'Taxa de Abertura',
      value: `${stats.average_open_rate}%`,
      icon: Eye,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Taxa média de abertura'
    },
    {
      id: 'active_campaigns',
      title: 'Campanhas Ativas',
      value: stats.active_campaigns.toString(),
      icon: Target,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Campanhas em andamento'
    }
  ] : []

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'unread', name: 'Não Lidas', icon: BellRing },
    { id: 'read', name: 'Lidas', icon: CheckCircle },
    { id: 'archived', name: 'Arquivadas', icon: Archive },
    { id: 'scheduled', name: 'Agendadas', icon: Clock }
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
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Notificações</h1>
                <p className="mt-2 text-gray-600">
                  Gerencie notificações e comunicações com clientes
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
                    setSelectedNotification(null)
                    resetForm()
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notificação
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
                        setSelectedNotification(null)
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
                      const unreadNotification = notifications.find(n => n.status === 'unread')
                      if (unreadNotification) {
                        handleSend(unreadNotification.id)
                      }
                    }}
                    className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Send className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">Enviar Agora</span>
                  </button>
                  <button
                    onClick={() => {
                      const notificationToSchedule = notifications.find(n => !n.is_scheduled)
                      if (notificationToSchedule) {
                        const scheduledFor = new Date(Date.now() + 3600000).toISOString()
                        handleSchedule(notificationToSchedule.id, scheduledFor)
                      }
                    }}
                    className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Agendar</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(true)
                      setSelectedNotification(null)
                      resetForm()
                    }}
                    className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-700">Templates</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(true)
                      setSelectedNotification(null)
                      resetForm()
                    }}
                    className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Target className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-700">Campanhas</span>
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Notificações Recentes</h3>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar notificações..."
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
                        <option value="unread">Não Lidas</option>
                        <option value="read">Lidas</option>
                        <option value="archived">Arquivadas</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Canal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destinatário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Nenhuma notificação encontrada. Clique em "Nova Notificação" para começar.
                          </td>
                        </tr>
                      ) : (
                        notifications.map((notification) => (
                          <tr key={notification.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getTypeIcon(notification.type)}
                                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                                  {getTypeLabel(notification.type)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {notification.channel === 'email' && <Mail className="h-4 w-4 inline mr-1" />}
                              {notification.channel === 'sms' && <MessageSquare className="h-4 w-4 inline mr-1" />}
                              {notification.channel === 'push' && <Bell className="h-4 w-4 inline mr-1" />}
                              {notification.channel === 'whatsapp' && <MessageSquare className="h-4 w-4 inline mr-1" />}
                              {notification.channel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {notification.recipient}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                                {getStatusLabel(notification.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(notification.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedNotification(notification)
                                    setShowModal(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {notification.status === 'unread' && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Marcar como lida"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                                {notification.status !== 'archived' && (
                                  <button
                                    onClick={() => handleArchive(notification.id)}
                                    className="text-gray-600 hover:text-gray-900"
                                    title="Arquivar"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </button>
                                )}
                                {!notification.sent_at && (
                                  <button
                                    onClick={() => handleSend(notification.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Enviar"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEdit(notification)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(notification.id)}
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
                        placeholder="Buscar notificações..."
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Nenhuma notificação encontrada nesta categoria.
                        </td>
                      </tr>
                    ) : (
                      notifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-500">{notification.message}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{notification.channel}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{notification.recipient}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(notification.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedNotification(notification)
                                  setShowModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(notification)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(notification.id)}
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
        {showModal && selectedNotification && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes da Notificação</h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedNotification(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Título</p>
                  <p className="text-sm text-gray-900">{selectedNotification.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mensagem</p>
                  <p className="text-sm text-gray-900">{selectedNotification.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedNotification.type)}`}>
                      {getTypeLabel(selectedNotification.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedNotification.status)}`}>
                      {getStatusLabel(selectedNotification.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Canal</p>
                  <p className="text-sm text-gray-900">{selectedNotification.channel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Destinatário</p>
                  <p className="text-sm text-gray-900">{selectedNotification.recipient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Categoria</p>
                  <p className="text-sm text-gray-900">{selectedNotification.category}</p>
                </div>
                {selectedNotification.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedNotification.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedNotification.created_at)}</p>
                </div>
                {selectedNotification.sent_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Enviada em</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedNotification.sent_at)}</p>
                  </div>
                )}
                {selectedNotification.action_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">URL de Ação</p>
                    <p className="text-sm text-gray-900">{selectedNotification.action_url}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                {selectedNotification.status === 'unread' && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id)
                      setShowModal(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Marcar como Lida
                  </button>
                )}
                {selectedNotification.status !== 'archived' && (
                  <button
                    onClick={() => {
                      handleArchive(selectedNotification.id)
                      setShowModal(false)
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Arquivar
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedNotification(null)
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
                  {selectedNotification ? 'Editar Notificação' : 'Nova Notificação'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedNotification(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Título da notificação"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Notification['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="info">Informação</option>
                      <option value="success">Sucesso</option>
                      <option value="warning">Aviso</option>
                      <option value="error">Erro</option>
                      <option value="promotion">Promoção</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mensagem da notificação"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value as Notification['channel'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Notification['priority'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinatário *</label>
                  <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@exemplo.com ou +5511999999999"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de Ação (opcional)</label>
                  <input
                    type="text"
                    value={formData.action_url}
                    onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/reservations/123"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_scheduled}
                    onChange={(e) => setFormData({ ...formData, is_scheduled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Agendar envio</label>
                </div>
                {formData.is_scheduled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora do Envio</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_for}
                      onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedNotification(null)
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
