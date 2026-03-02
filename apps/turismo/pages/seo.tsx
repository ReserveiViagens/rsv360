'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  FileText, 
  Globe, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SEOConfig {
  id: number
  page: string
  title: string
  description: string
  keywords: string[]
  og_image: string
  canonical: string
  status: string
  updated_at: string
}

interface SEOStats {
  total_pages: number
  optimized_pages: number
  pages_with_meta_description: number
  pages_with_keywords: number
  average_keywords_per_page: number
  pages_indexed: number
  last_sitemap_update: string | null
}

interface TopKeyword {
  keyword: string
  count: number
  pages: number
}

export default function SEO() {
  const [configs, setConfigs] = useState<SEOConfig[]>([])
  const [stats, setStats] = useState<SEOStats | null>(null)
  const [topKeywords, setTopKeywords] = useState<TopKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SEOConfig | null>(null)
  const [formData, setFormData] = useState({
    page: '',
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    canonical: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [configsRes, statsRes, keywordsRes] = await Promise.all([
        api.get('/api/v1/seo'),
        api.get('/api/v1/seo/stats'),
        api.get('/api/v1/seo/keywords/top')
      ])
      
      setConfigs(configsRes.data?.data || [])
      setStats(statsRes.data?.data || null)
      setTopKeywords(keywordsRes.data?.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados de SEO:', error)
      toast.error('Erro ao carregar dados de SEO')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k)
      
      const payload = {
        ...formData,
        keywords: keywordsArray
      }

      if (editingConfig) {
        await api.put(`/api/v1/seo/${editingConfig.id}`, payload)
        toast.success('Configuração atualizada com sucesso!')
      } else {
        await api.post('/api/v1/seo', payload)
        toast.success('Configuração criada com sucesso!')
      }

      setShowForm(false)
      setEditingConfig(null)
      setFormData({
        page: '',
        title: '',
        description: '',
        keywords: '',
        og_image: '',
        canonical: ''
      })
      loadData()
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      toast.error('Erro ao salvar configuração')
    }
  }

  const handleEdit = (config: SEOConfig) => {
    setEditingConfig(config)
    setFormData({
      page: config.page,
      title: config.title,
      description: config.description,
      keywords: config.keywords.join(', '),
      og_image: config.og_image,
      canonical: config.canonical
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return

    try {
      await api.delete(`/api/v1/seo/${id}`)
      toast.success('Configuração excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir configuração:', error)
      toast.error('Erro ao excluir configuração')
    }
  }

  const handleGenerateSitemap = async () => {
    try {
      const response = await api.post('/api/v1/seo/sitemap/generate')
      toast.success('Sitemap gerado com sucesso!')
      
      // Opcional: fazer download do sitemap
      if (response.data?.data?.urls) {
        const sitemapXml = generateSitemapXML(response.data.data.urls)
        downloadFile(sitemapXml, 'sitemap.xml', 'application/xml')
      }
    } catch (error) {
      console.error('Erro ao gerar sitemap:', error)
      toast.error('Erro ao gerar sitemap')
    }
  }

  const generateSitemapXML = (urls: any[]) => {
    const urlsXml = urls.map(url => `
    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod || new Date().toISOString()}</lastmod>
      <changefreq>${url.changefreq || 'weekly'}</changefreq>
      <priority>${url.priority || '0.8'}</priority>
    </url>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            <Search className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO</h1>
              <p className="text-gray-600 mt-1">Otimização para motores de busca</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSitemap}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Gerar Sitemap
            </button>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingConfig(null)
                setFormData({
                  page: '',
                  title: '',
                  description: '',
                  keywords: '',
                  og_image: '',
                  canonical: ''
                })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              Nova Configuração
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Páginas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_pages}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Páginas Otimizadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.optimized_pages}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Com Meta Description</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.pages_with_meta_description}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Média Keywords</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.average_keywords_per_page.toFixed(1)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Top Keywords */}
        {topKeywords.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Top Keywords
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topKeywords.map((keyword, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{keyword.keyword}</span>
                    <span className="text-sm text-gray-600">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{keyword.count} usos</span>
                    <span>{keyword.pages} páginas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configurations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Configurações de SEO</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Página</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keywords</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma configuração encontrada. Clique em "Nova Configuração" para começar.
                    </td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-gray-900">{config.page}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{config.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {config.keywords.slice(0, 3).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {keyword}
                            </span>
                          ))}
                          {config.keywords.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{config.keywords.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          config.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {config.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingConfig(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Página (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="/"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título (Meta Title)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Título da página"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/60 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (Meta Description)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Descrição da página"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/160 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Open Graph Image
                  </label>
                  <input
                    type="text"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="/images/og-image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={formData.canonical}
                    onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="https://reserveiviagens.com.br"
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingConfig(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
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
