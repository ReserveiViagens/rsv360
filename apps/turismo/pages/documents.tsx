'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Folder,
  File,
  Image,
  Video,
  Archive,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
  Save,
  CheckCircle,
  XCircle,
  HardDrive,
  Clock,
  BarChart3
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Document {
  id: number
  name: string
  description: string
  type: string
  size: number
  category: string
  tags: string[]
  uploaded_by: string
  uploaded_at: string
  last_modified: string
  status: 'active' | 'archived' | 'deleted'
  url: string
  thumbnail?: string | null
}

interface DocumentCategory {
  id: number
  name: string
  description: string
  document_count: number
}

interface DocumentStats {
  total_documents: number
  categories_count: number
  recent_uploads: number
  storage_used: number
  storage_limit: number
  storage_percentage: number
  active_documents: number
  archived_documents: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [activeTab, selectedCategory, sortBy, sortOrder])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = {
        status: activeTab !== 'all' ? activeTab : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined,
        sortBy: sortBy === 'date' ? 'uploaded_at' : sortBy,
        sortOrder
      }

      const [documentsRes, categoriesRes, statsRes] = await Promise.all([
        api.get('/api/v1/documents', { params }),
        api.get('/api/v1/documents/categories/list'),
        api.get('/api/v1/documents/stats/overview')
      ])
      
      setDocuments(documentsRes.data?.data || [])
      setCategories(categoriesRes.data?.data || [])
      setStats(statsRes.data?.data || null)
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
      toast.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Selecione um arquivo para upload')
      return
    }

    try {
      setUploadProgress(0)
      const uploadFormData = new FormData()
      uploadFormData.append('file', uploadFile)
      uploadFormData.append('name', formData.name || uploadFile.name)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('category', formData.category || 'Geral')
      uploadFormData.append('tags', JSON.stringify(formData.tags))

      const response = await api.post('/api/v1/documents/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      })

      toast.success('Documento enviado com sucesso!')
      setShowUploadModal(false)
      setUploadFile(null)
      setFormData({ name: '', description: '', category: '', tags: [] })
      setUploadProgress(0)
      loadData()
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao fazer upload do documento')
      setUploadProgress(0)
    }
  }

  const handleEdit = async () => {
    if (!selectedDocument) return

    try {
      await api.put(`/api/v1/documents/${selectedDocument.id}`, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags
      })

      toast.success('Documento atualizado com sucesso!')
      setShowEditModal(false)
      setSelectedDocument(null)
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      toast.error('Erro ao atualizar documento')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    try {
      await api.delete(`/api/v1/documents/${id}`)
      toast.success('Documento excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      toast.error('Erro ao excluir documento')
    }
  }

  const handleArchive = async (id: number) => {
    try {
      await api.patch(`/api/v1/documents/${id}/archive`)
      toast.success('Documento arquivado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao arquivar documento:', error)
      toast.error('Erro ao arquivar documento')
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/api/v1/documents/${id}/restore`)
      toast.success('Documento restaurado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao restaurar documento:', error)
      toast.error('Erro ao restaurar documento')
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      const response = await api.get(`/api/v1/documents/${document.id}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', document.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      
      toast.success('Download iniciado!')
    } catch (error) {
      console.error('Erro ao fazer download:', error)
      toast.error('Erro ao fazer download do documento')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/v1/documents/export/data', {
        params: {
          format: 'json',
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: activeTab !== 'all' ? activeTab : undefined
        }
      })
      
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `documentos-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Documentos exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar documentos:', error)
      toast.error('Erro ao exportar documentos')
    }
  }

  const handleView = (document: Document) => {
    setSelectedDocument(document)
    setShowViewModal(true)
  }

  const handleEditClick = (document: Document) => {
    setSelectedDocument(document)
    setFormData({
      name: document.name,
      description: document.description,
      category: document.category,
      tags: document.tags || []
    })
    setShowEditModal(true)
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />
      case 'doc':
      case 'docx': return <FileText className="h-6 w-6 text-blue-500" />
      case 'xls':
      case 'xlsx': return <FileText className="h-6 w-6 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <Image className="h-6 w-6 text-purple-500" />
      case 'mp4':
      case 'avi': return <Video className="h-6 w-6 text-red-500" />
      case 'zip':
      case 'rar': return <Archive className="h-6 w-6 text-orange-500" />
      default: return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  if (loading && documents.length === 0) {
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Documentos</h1>
                <p className="mt-2 text-gray-600">Organize e gerencie todos os documentos</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total de Documentos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Folder className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Categorias</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.categories_count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Upload className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Uploads Recentes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.recent_uploads}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <HardDrive className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Armazenamento</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.storage_percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Progress */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uso de Armazenamento</span>
                  <span className="text-sm text-gray-500">
                    {formatFileSize(stats.storage_used)} / {formatFileSize(stats.storage_limit)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.storage_percentage}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'all', name: 'Todos', count: documents.length },
                  { id: 'active', name: 'Ativos', count: documents.filter(d => d.status === 'active').length },
                  { id: 'archived', name: 'Arquivados', count: documents.filter(d => d.status === 'archived').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'all' | 'active' | 'archived')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Filters and Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && loadData()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    loadData()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name} ({category.document_count})
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')
                    loadData()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Data</option>
                  <option value="name">Nome</option>
                  <option value="size">Tamanho</option>
                  <option value="type">Tipo</option>
                </select>

                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    loadData()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>

                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="p-6">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedCategory !== 'all' || activeTab !== 'all'
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Comece fazendo upload de um documento.'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          {getFileIcon(doc.type)}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleView(doc)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(doc)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
                        
                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Tamanho:</span>
                            <span>{formatFileSize(doc.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Categoria:</span>
                            <span>{doc.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Upload:</span>
                            <span>{formatDate(doc.uploaded_at)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {doc.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{doc.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{doc.category}</span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>por {doc.uploaded_by}</span>
                            <span>{formatDate(doc.uploaded_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(doc)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {doc.status === 'active' ? (
                          <button
                            onClick={() => handleArchive(doc.id)}
                            className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                            title="Arquivar"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(doc.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Restaurar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload de Documento</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setFormData({ name: '', description: '', category: '', tags: [] })
                    setUploadProgress(0)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo *</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadFile(file)
                        if (!formData.name) {
                          setFormData(prev => ({ ...prev, name: file.name }))
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {uploadFile && (
                    <p className="mt-1 text-sm text-gray-500">
                      {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do documento"
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
                    placeholder="Descrição do documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Enviando...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setFormData({ name: '', description: '', category: '', tags: [] })
                    setUploadProgress(0)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploadProgress > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadProgress > 0 ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Documento</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedDocument(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {getFileIcon(selectedDocument.type)}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedDocument.name}</h4>
                    <p className="text-sm text-gray-500">{selectedDocument.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tamanho</p>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedDocument.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categoria</p>
                    <p className="text-sm text-gray-900">{selectedDocument.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <p className="text-sm text-gray-900">{selectedDocument.type.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedDocument.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedDocument.status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedDocument.status === 'active' ? 'Ativo' :
                       selectedDocument.status === 'archived' ? 'Arquivado' : 'Excluído'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Upload por</p>
                    <p className="text-sm text-gray-900">{selectedDocument.uploaded_by}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Upload</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedDocument.uploaded_at)}</p>
                  </div>
                </div>

                {selectedDocument.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      handleEditClick(selectedDocument)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Editar Documento</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDocument(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDocument(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
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
