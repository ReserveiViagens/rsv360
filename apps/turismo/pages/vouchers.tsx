'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileText,
  Send,
  Copy,
  QrCode,
  BarChart3,
  Settings,
  MoreHorizontal,
  ArrowRight,
  CalendarDays,
  Hotel,
  Plane,
  Car,
  Camera,
  Gift,
  Tag,
  Percent,
  Award,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Mail,
  Phone,
  User,
  Building,
  Receipt,
  Wallet,
  Key,
  Lock,
  Unlock,
  EyeOff,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Home,
  ArrowLeft,
  Palette,
  Type,
  Image,
  X,
  Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Voucher {
  id: number
  codigo: string
  cliente: string
  agente: string
  tipo: 'hotel' | 'voo' | 'pacote' | 'atracao' | 'transporte' | 'servico'
  destino: string
  dataInicio: string
  dataFim: string
  valor: number
  status: 'ativo' | 'usado' | 'expirado' | 'cancelado' | 'pendente'
  agencia: string
  validade: string
  criadoEm: string
  usadoEm?: string
  observacoes: string
  beneficios: string[]
  documentos: string[]
  qrCode?: string
}

interface VoucherStats {
  total: number
  ativos: number
  usados: number
  expirados: number
  cancelados: number
  valorTotal: number
  valorMedio: number
  taxaUtilizacao: number
}

export default function VouchersPage() {
  const router = useRouter()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [stats, setStats] = useState<VoucherStats>({
    total: 0,
    ativos: 0,
    usados: 0,
    expirados: 0,
    cancelados: 0,
    valorTotal: 0,
    valorMedio: 0,
    taxaUtilizacao: 0
  })
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'novo' | 'editar' | 'visualizar' | 'excluir' | 'qrcode'>('novo')
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<string>('dataCriacao')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const [selectedVouchers, setSelectedVouchers] = useState<number[]>([])
  const [formData, setFormData] = useState({
    codigo: '',
    cliente: '',
    agente: '',
    tipo: 'hotel' as Voucher['tipo'],
    destino: '',
    dataInicio: '',
    dataFim: '',
    valor: 0,
    status: 'ativo' as Voucher['status'],
    agencia: 'Reservei Viagens',
    validade: '',
    observacoes: '',
    beneficios: [] as string[],
    documentos: [] as string[]
  })
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [filterStatus, filterTipo, sortBy, sortOrder])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = {
        search: searchTerm || undefined,
        sortBy: sortBy === 'dataCriacao' ? 'created_at' : sortBy,
        sortOrder
      }
      if (filterStatus !== 'todos') {
        params.status = filterStatus
      }
      if (filterTipo !== 'todos') {
        params.type = filterTipo
      }

      const [vouchersRes, statsRes] = await Promise.all([
        api.get('/api/v1/vouchers', { params }),
        api.get('/api/v1/vouchers/stats/overview')
      ])
      
      setVouchers(vouchersRes.data?.data || [])
      setStats(statsRes.data?.data || {
        total: 0,
        ativos: 0,
        usados: 0,
        expirados: 0,
        cancelados: 0,
        valorTotal: 0,
        valorMedio: 0,
        taxaUtilizacao: 0
      })
    } catch (error) {
      console.error('Erro ao carregar vouchers:', error)
      toast.error('Erro ao carregar vouchers')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        beneficios: formData.beneficios.filter(b => b.trim()),
        documentos: formData.documentos.filter(d => d.trim())
      }

      if (selectedVoucher) {
        await api.put(`/api/v1/vouchers/${selectedVoucher.id}`, payload)
        toast.success('Voucher atualizado com sucesso!')
      } else {
        await api.post('/api/v1/vouchers', payload)
        toast.success('Voucher criado com sucesso!')
      }

      setShowModal(false)
      setSelectedVoucher(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar voucher:', error)
      toast.error('Erro ao salvar voucher')
    }
  }

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setFormData({
      codigo: voucher.codigo,
      cliente: voucher.cliente,
      agente: voucher.agente,
      tipo: voucher.tipo,
      destino: voucher.destino,
      dataInicio: voucher.dataInicio,
      dataFim: voucher.dataFim,
      valor: voucher.valor,
      status: voucher.status,
      agencia: voucher.agencia,
      validade: voucher.validade,
      observacoes: voucher.observacoes || '',
      beneficios: voucher.beneficios || [],
      documentos: voucher.documentos || []
    })
    setModalType('editar')
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este voucher?')) return

    try {
      await api.delete(`/api/v1/vouchers/${id}`)
      toast.success('Voucher excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir voucher:', error)
      toast.error('Erro ao excluir voucher')
    }
  }

  const handleVisualizar = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setModalType('visualizar')
    setShowModal(true)
  }

  const handleGenerateQRCode = async (id: number) => {
    try {
      const response = await api.post(`/api/v1/vouchers/${id}/qrcode`)
      setQrCodeUrl(response.data.data.qr_code_url)
      setSelectedVoucher(vouchers.find(v => v.id === id) || null)
      setModalType('qrcode')
      setShowModal(true)
      toast.success('QR Code gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      toast.error('Erro ao gerar QR Code')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/v1/vouchers/export/data', {
        params: { format: 'json', status: filterStatus !== 'todos' ? filterStatus : undefined, type: filterTipo !== 'todos' ? filterTipo : undefined }
      })
      
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vouchers-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Vouchers exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar vouchers:', error)
      toast.error('Erro ao exportar vouchers')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      await api.post('/api/v1/vouchers/import/data', { vouchers: Array.isArray(data) ? data : [data] })
      toast.success('Vouchers importados com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao importar vouchers:', error)
      toast.error('Erro ao importar vouchers')
    }
  }

  const resetForm = () => {
    setFormData({
      codigo: '',
      cliente: '',
      agente: '',
      tipo: 'hotel',
      destino: '',
      dataInicio: '',
      dataFim: '',
      valor: 0,
      status: 'ativo',
      agencia: 'Reservei Viagens',
      validade: '',
      observacoes: '',
      beneficios: [],
      documentos: []
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'usado': return 'bg-blue-100 text-blue-800'
      case 'expirado': return 'bg-red-100 text-red-800'
      case 'cancelado': return 'bg-gray-100 text-gray-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'hotel': return <Hotel className="w-4 h-4" />
      case 'voo': return <Plane className="w-4 h-4" />
      case 'pacote': return <Gift className="w-4 h-4" />
      case 'atracao': return <Camera className="w-4 h-4" />
      case 'transporte': return <Car className="w-4 h-4" />
      case 'servico': return <Settings className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      hotel: 'Hotel',
      voo: 'Voo',
      pacote: 'Pacote',
      atracao: 'Atração',
      transporte: 'Transporte',
      servico: 'Serviço'
    }
    return labels[tipo] || tipo
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

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = !searchTerm || 
      voucher.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.destino.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

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
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vouchers e Reservas</h1>
                    <p className="text-sm text-gray-500">Gestão completa de vouchers e reservas</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar para o Início
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Vouchers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.valorTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Utilização</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.taxaUtilizacao.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => {
                    setModalType('novo')
                    setSelectedVoucher(null)
                    resetForm()
                    setShowModal(true)
                  }}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Novo Voucher</span>
                </button>

                <button
                  onClick={() => router.push('/voucher-editor')}
                  className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Palette className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-700">Editor de Vouchers</span>
                </button>

                <label className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Importar Vouchers</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleExport}
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Exportar Relatório</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedVouchers.length === 1) {
                      handleGenerateQRCode(selectedVouchers[0])
                    } else {
                      toast.error('Selecione um voucher para gerar QR Code')
                    }
                  }}
                  className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <QrCode className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-700">Gerar QR Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar vouchers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && loadData()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      loadData()
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="ativo">Ativo</option>
                    <option value="usado">Usado</option>
                    <option value="expirado">Expirado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="pendente">Pendente</option>
                  </select>

                  <select
                    value={filterTipo}
                    onChange={(e) => {
                      setFilterTipo(e.target.value)
                      loadData()
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos os Tipos</option>
                    <option value="hotel">Hotel</option>
                    <option value="voo">Voo</option>
                    <option value="pacote">Pacote</option>
                    <option value="atracao">Atração</option>
                    <option value="transporte">Transporte</option>
                    <option value="servico">Serviço</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-')
                      setSortBy(field)
                      setSortOrder(order as 'asc' | 'desc')
                      loadData()
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dataCriacao-desc">Mais Recentes</option>
                    <option value="dataCriacao-asc">Mais Antigos</option>
                    <option value="valor-desc">Maior Valor</option>
                    <option value="valor-asc">Menor Valor</option>
                    <option value="cliente-asc">Cliente A-Z</option>
                    <option value="destino-asc">Destino A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Vouchers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Vouchers ({filteredVouchers.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedVouchers(selectedVouchers.length === filteredVouchers.length ? [] : filteredVouchers.map(v => v.id))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedVouchers.length === filteredVouchers.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                  {selectedVouchers.length > 0 && (
                    <span className="text-sm text-gray-500">
                      ({selectedVouchers.length} selecionados)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedVouchers.length === filteredVouchers.length && filteredVouchers.length > 0}
                        onChange={(e) => setSelectedVouchers(e.target.checked ? filteredVouchers.map(v => v.id) : [])}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                        Nenhum voucher encontrado. Clique em "Novo Voucher" para começar.
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedVouchers.includes(voucher.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVouchers([...selectedVouchers, voucher.id])
                              } else {
                                setSelectedVouchers(selectedVouchers.filter(id => id !== voucher.id))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {getTipoIcon(voucher.tipo)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{voucher.codigo}</div>
                              <div className="text-sm text-gray-500">{voucher.agencia}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{voucher.cliente}</div>
                          <div className="text-sm text-gray-500">{voucher.agente}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTipoLabel(voucher.tipo)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{voucher.destino}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {voucher.dataInicio} - {voucher.dataFim}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(voucher.dataInicio)}
                          </div>
                          <div className="text-sm text-gray-500">
                            até {formatDate(voucher.dataFim)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(voucher.valor)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Válido até {formatDate(voucher.validade)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                            {voucher.status === 'ativo' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {voucher.status === 'usado' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {voucher.status === 'expirado' && <XCircle className="w-3 h-3 mr-1" />}
                            {voucher.status === 'cancelado' && <XCircle className="w-3 h-3 mr-1" />}
                            {voucher.status === 'pendente' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVisualizar(voucher)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(voucher)}
                              className="text-green-600 hover:text-green-900"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleGenerateQRCode(voucher.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Gerar QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(voucher.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {modalType === 'novo' && 'Novo Voucher'}
                    {modalType === 'editar' && 'Editar Voucher'}
                    {modalType === 'visualizar' && 'Detalhes do Voucher'}
                    {modalType === 'excluir' && 'Excluir Voucher'}
                    {modalType === 'qrcode' && 'QR Code do Voucher'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedVoucher(null)
                      setQrCodeUrl('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {modalType === 'qrcode' && qrCodeUrl && (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 border-2 border-gray-200 rounded-lg" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Código: {selectedVoucher?.codigo}
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = qrCodeUrl
                          link.download = `qrcode-${selectedVoucher?.codigo}.png`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          toast.success('QR Code baixado!')
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        Baixar QR Code
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedVoucher?.codigo || '')
                          toast.success('Código copiado!')
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Copy className="w-4 h-4 inline mr-2" />
                        Copiar Código
                      </button>
                    </div>
                  </div>
                )}

                {modalType === 'excluir' && selectedVoucher && (
                  <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Confirmar exclusão
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Tem certeza que deseja excluir o voucher <strong>{selectedVoucher.codigo}</strong>?
                      Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(selectedVoucher.id)
                          setShowModal(false)
                        }}
                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}

                {(modalType === 'novo' || modalType === 'editar' || modalType === 'visualizar') && (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código do Voucher
                        </label>
                        <input
                          type="text"
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          disabled={modalType === 'visualizar' || modalType === 'editar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cliente
                        </label>
                        <input
                          type="text"
                          value={formData.cliente}
                          onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agente
                        </label>
                        <input
                          type="text"
                          value={formData.agente}
                          onChange={(e) => setFormData({ ...formData, agente: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo
                        </label>
                        <select
                          value={formData.tipo}
                          onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Voucher['tipo'] })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="hotel">Hotel</option>
                          <option value="voo">Voo</option>
                          <option value="pacote">Pacote</option>
                          <option value="atracao">Atração</option>
                          <option value="transporte">Transporte</option>
                          <option value="servico">Serviço</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destino
                        </label>
                        <input
                          type="text"
                          value={formData.destino}
                          onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Início
                        </label>
                        <input
                          type="date"
                          value={formData.dataInicio}
                          onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Fim
                        </label>
                        <input
                          type="date"
                          value={formData.dataFim}
                          onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valor
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.valor}
                          onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as Voucher['status'] })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="ativo">Ativo</option>
                          <option value="usado">Usado</option>
                          <option value="expirado">Expirado</option>
                          <option value="cancelado">Cancelado</option>
                          <option value="pendente">Pendente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agência
                        </label>
                        <input
                          type="text"
                          value={formData.agencia}
                          onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Validade
                        </label>
                        <input
                          type="date"
                          value={formData.validade}
                          onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                          disabled={modalType === 'visualizar'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações
                      </label>
                      <textarea
                        rows={3}
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    {modalType === 'visualizar' && selectedVoucher && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Benefícios Inclusos
                          </label>
                          <div className="space-y-2">
                            {selectedVoucher.beneficios.map((beneficio, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm text-gray-700">{beneficio}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Documentos
                          </label>
                          <div className="space-y-2">
                            {selectedVoucher.documentos.map((documento, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">{documento}</span>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedVoucher(null)
                      setQrCodeUrl('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {modalType === 'visualizar' || modalType === 'qrcode' ? 'Fechar' : 'Cancelar'}
                  </button>
                  {modalType !== 'visualizar' && modalType !== 'qrcode' && modalType !== 'excluir' && (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {modalType === 'novo' ? 'Criar' : 'Salvar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
