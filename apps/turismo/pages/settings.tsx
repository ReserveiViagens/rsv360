'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Shield,
  Bell,
  Palette,
  Globe,
  CreditCard,
  Users,
  Building,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  Star,
  Mail,
  Phone,
  MapPin,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Setting {
  id: string
  name: string
  description: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea'
  value: any
  category: string
  required: boolean
  options?: string[]
}

interface SettingCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  description: string
  href?: string
  countLabel?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Setting[]>([])
  const [categories, setCategories] = useState<SettingCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('geral')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [backupGenerating, setBackupGenerating] = useState(false)
  const [restoreProcessing, setRestoreProcessing] = useState(false)

  useEffect(() => {
    loadCategories()
    loadSettings()
  }, [])

  useEffect(() => {
    // Não recarregar quando a categoria mudar, apenas filtrar
  }, [selectedCategory])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Dados mockados como fallback
      const mockData = {
        geral: {
          company_name: 'Reservei Viagens',
          company_email: 'contato@reserveiviagens.com',
          company_phone: '(11) 99999-9999',
          company_address: 'Rua das Viagens, 123 - São Paulo, SP',
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR'
        },
        seguranca: {
          password_min_length: 8,
          password_require_special: true,
          session_timeout: 30,
          two_factor_auth: false,
          max_login_attempts: 5
        },
        notificacoes: {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          notification_sound: true
        },
        pagamento: {
          payment_currency: 'BRL',
          payment_methods: 'credit_card',
          auto_approve_payments: false
        },
        backup: {
          auto_backup: true,
          backup_retention_days: 30,
          backup_encryption: true
        }
      }

      let data = mockData
      
      try {
        const response = await api.get('/api/v1/settings')
        if (response.data?.success && response.data?.data) {
          data = response.data.data
        }
      } catch (apiError) {
        console.warn('Erro ao carregar da API, usando dados mockados:', apiError)
        // Usar dados mockados como fallback
      }
      
      // Converter dados para formato de settings
      const convertedSettings: Setting[] = []
      
      // Configurações Gerais
      if (data.geral) {
        Object.entries(data.geral).forEach(([key, value]) => {
          convertedSettings.push({
            id: key,
            name: getSettingName(key),
            description: getSettingDescription(key),
            type: getSettingType(key, value),
            value: value,
            category: 'geral',
            required: true,
            options: getSettingOptions(key)
          })
        })
      }
      
      // Configurações de Segurança
      if (data.seguranca) {
        Object.entries(data.seguranca).forEach(([key, value]) => {
          convertedSettings.push({
            id: key,
            name: getSettingName(key),
            description: getSettingDescription(key),
            type: getSettingType(key, value),
            value: value,
            category: 'seguranca',
            required: true,
            options: getSettingOptions(key)
          })
        })
      }
      
      // Configurações de Notificações
      if (data.notificacoes) {
        Object.entries(data.notificacoes).forEach(([key, value]) => {
          convertedSettings.push({
            id: key,
            name: getSettingName(key),
            description: getSettingDescription(key),
            type: getSettingType(key, value),
            value: value,
            category: 'notificacoes',
            required: true,
            options: getSettingOptions(key)
          })
        })
      }
      
      // Configurações de Pagamento
      if (data.pagamento) {
        Object.entries(data.pagamento).forEach(([key, value]) => {
          convertedSettings.push({
            id: key,
            name: getSettingName(key),
            description: getSettingDescription(key),
            type: getSettingType(key, value),
            value: value,
            category: 'pagamento',
            required: true,
            options: getSettingOptions(key)
          })
        })
      }
      
      // Configurações de Backup
      if (data.backup) {
        Object.entries(data.backup).forEach(([key, value]) => {
          convertedSettings.push({
            id: key,
            name: getSettingName(key),
            description: getSettingDescription(key),
            type: getSettingType(key, value),
            value: value,
            category: 'backup',
            required: true,
            options: getSettingOptions(key)
          })
        })
      }
      
      setSettings(convertedSettings)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
      // Carregar dados mockados em caso de erro
      const mockSettings: Setting[] = [
        // Geral
        { id: 'company_name', name: 'Nome da Empresa', description: 'Nome oficial da empresa', type: 'text', value: 'Reservei Viagens', category: 'geral', required: true },
        { id: 'company_email', name: 'Email da Empresa', description: 'Email de contato principal', type: 'text', value: 'contato@reserveiviagens.com', category: 'geral', required: true },
        { id: 'company_phone', name: 'Telefone da Empresa', description: 'Telefone de contato principal', type: 'text', value: '(11) 99999-9999', category: 'geral', required: true },
        { id: 'company_address', name: 'Endereço da Empresa', description: 'Endereço completo da empresa', type: 'textarea', value: 'Rua das Viagens, 123 - São Paulo, SP', category: 'geral', required: true },
        { id: 'timezone', name: 'Fuso Horário', description: 'Fuso horário padrão do sistema', type: 'select', value: 'America/Sao_Paulo', category: 'geral', required: true, options: ['America/Sao_Paulo', 'UTC', 'America/New_York', 'Europe/London'] },
        { id: 'language', name: 'Idioma Padrão', description: 'Idioma padrão do sistema', type: 'select', value: 'pt-BR', category: 'geral', required: true, options: ['pt-BR', 'en-US', 'es-ES'] },
        // Segurança
        { id: 'password_min_length', name: 'Tamanho Mínimo de Senha', description: 'Tamanho mínimo para senhas de usuários', type: 'number', value: 8, category: 'seguranca', required: true },
        { id: 'password_require_special', name: 'Requer Caracteres Especiais', description: 'Senhas devem conter caracteres especiais', type: 'boolean', value: true, category: 'seguranca', required: true },
        { id: 'session_timeout', name: 'Timeout de Sessão (minutos)', description: 'Tempo de inatividade antes do logout', type: 'number', value: 30, category: 'seguranca', required: true },
        { id: 'two_factor_auth', name: 'Autenticação de Dois Fatores', description: 'Habilitar 2FA para todos os usuários', type: 'boolean', value: false, category: 'seguranca', required: true },
        { id: 'max_login_attempts', name: 'Tentativas Máximas de Login', description: 'Número máximo de tentativas de login', type: 'number', value: 5, category: 'seguranca', required: true },
        // Notificações
        { id: 'email_notifications', name: 'Notificações por Email', description: 'Habilitar notificações por email', type: 'boolean', value: true, category: 'notificacoes', required: true },
        { id: 'sms_notifications', name: 'Notificações por SMS', description: 'Habilitar notificações por SMS', type: 'boolean', value: false, category: 'notificacoes', required: true },
        { id: 'push_notifications', name: 'Notificações Push', description: 'Habilitar notificações push', type: 'boolean', value: true, category: 'notificacoes', required: true },
        { id: 'notification_sound', name: 'Som de Notificação', description: 'Reproduzir som nas notificações', type: 'boolean', value: true, category: 'notificacoes', required: true },
        // Pagamento
        { id: 'payment_currency', name: 'Moeda Padrão', description: 'Moeda padrão para pagamentos', type: 'select', value: 'BRL', category: 'pagamento', required: true, options: ['BRL', 'USD', 'EUR', 'GBP'] },
        { id: 'payment_methods', name: 'Métodos de Pagamento', description: 'Métodos de pagamento aceitos', type: 'select', value: 'credit_card', category: 'pagamento', required: true, options: ['credit_card', 'pix', 'bank_transfer', 'all'] },
        { id: 'auto_approve_payments', name: 'Aprovação Automática', description: 'Aprovar pagamentos automaticamente', type: 'boolean', value: false, category: 'pagamento', required: true },
        // Backup
        { id: 'auto_backup', name: 'Backup Automático', description: 'Realizar backup automático diário', type: 'boolean', value: true, category: 'backup', required: true },
        { id: 'backup_retention_days', name: 'Retenção de Backup (dias)', description: 'Dias para manter backups', type: 'number', value: 30, category: 'backup', required: true },
        { id: 'backup_encryption', name: 'Criptografia de Backup', description: 'Criptografar arquivos de backup', type: 'boolean', value: true, category: 'backup', required: true }
      ]
      setSettings(mockSettings)
    } finally {
      setLoading(false)
    }
  }


  const loadCategories = () => {
    const mockCategories: SettingCategory[] = [
      {
        id: 'geral',
        name: 'Configurações Gerais',
        icon: <Settings className="w-5 h-5" />,
        color: 'bg-blue-100 text-blue-600',
        description: 'Configurações básicas da empresa'
      },
      {
        id: 'seguranca',
        name: 'Segurança',
        icon: <Shield className="w-5 h-5" />,
        color: 'bg-red-100 text-red-600',
        description: 'Configurações de segurança e autenticação'
      },
      {
        id: 'notificacoes',
        name: 'Notificações',
        icon: <Bell className="w-5 h-5" />,
        color: 'bg-yellow-100 text-yellow-600',
        description: 'Configurações de notificações'
      },
      {
        id: 'pagamento',
        name: 'Pagamentos',
        icon: <CreditCard className="w-5 h-5" />,
        color: 'bg-green-100 text-green-600',
        description: 'Configurações de pagamento'
      },
      {
        id: 'backup',
        name: 'Backup',
        icon: <Database className="w-5 h-5" />,
        color: 'bg-purple-100 text-purple-600',
        description: 'Configurações de backup e restauração'
      },
      {
        id: 'apis-maps',
        name: 'APIs e Maps',
        icon: <MapPin className="w-5 h-5" />,
        color: 'bg-cyan-100 text-cyan-600',
        description: 'Integrações de APIs e provedor de mapas (Google Maps / OpenStreetMap)',
        href: '/integracoes-apis',
        countLabel: '4 integrações'
      }
    ]

    setCategories(mockCategories)
  }

  const getSettingName = (key: string): string => {
    const names: Record<string, string> = {
      company_name: 'Nome da Empresa',
      company_email: 'Email da Empresa',
      company_phone: 'Telefone da Empresa',
      company_address: 'Endereço da Empresa',
      timezone: 'Fuso Horário',
      language: 'Idioma Padrão',
      password_min_length: 'Tamanho Mínimo de Senha',
      password_require_special: 'Requer Caracteres Especiais',
      session_timeout: 'Timeout de Sessão (minutos)',
      two_factor_auth: 'Autenticação de Dois Fatores',
      max_login_attempts: 'Tentativas Máximas de Login',
      email_notifications: 'Notificações por Email',
      sms_notifications: 'Notificações por SMS',
      push_notifications: 'Notificações Push',
      notification_sound: 'Som de Notificação',
      payment_currency: 'Moeda Padrão',
      payment_methods: 'Métodos de Pagamento',
      auto_approve_payments: 'Aprovação Automática',
      auto_backup: 'Backup Automático',
      backup_retention_days: 'Retenção de Backup (dias)',
      backup_encryption: 'Criptografia de Backup'
    }
    return names[key] || key
  }

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      company_name: 'Nome oficial da empresa',
      company_email: 'Email de contato principal',
      company_phone: 'Telefone de contato principal',
      company_address: 'Endereço completo da empresa',
      timezone: 'Fuso horário padrão do sistema',
      language: 'Idioma padrão do sistema',
      password_min_length: 'Tamanho mínimo para senhas de usuários',
      password_require_special: 'Senhas devem conter caracteres especiais',
      session_timeout: 'Tempo de inatividade antes do logout',
      two_factor_auth: 'Habilitar 2FA para todos os usuários',
      max_login_attempts: 'Número máximo de tentativas de login',
      email_notifications: 'Habilitar notificações por email',
      sms_notifications: 'Habilitar notificações por SMS',
      push_notifications: 'Habilitar notificações push',
      notification_sound: 'Reproduzir som nas notificações',
      payment_currency: 'Moeda padrão para pagamentos',
      payment_methods: 'Métodos de pagamento aceitos',
      auto_approve_payments: 'Aprovar pagamentos automaticamente',
      auto_backup: 'Realizar backup automático diário',
      backup_retention_days: 'Dias para manter backups',
      backup_encryption: 'Criptografar arquivos de backup'
    }
    return descriptions[key] || ''
  }

  const getSettingType = (key: string, value: any): Setting['type'] => {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (key.includes('address') || key.includes('description')) return 'textarea'
    if (key === 'timezone' || key === 'language' || key === 'payment_currency' || key === 'payment_methods') return 'select'
    return 'text'
  }

  const getSettingOptions = (key: string): string[] | undefined => {
    if (key === 'timezone') {
      return ['America/Sao_Paulo', 'UTC', 'America/New_York', 'Europe/London']
    }
    if (key === 'language') {
      return ['pt-BR', 'en-US', 'es-ES']
    }
    if (key === 'payment_currency') {
      return ['BRL', 'USD', 'EUR', 'GBP']
    }
    if (key === 'payment_methods') {
      return ['credit_card', 'pix', 'bank_transfer', 'all']
    }
    return undefined
  }

  const handleSettingChange = async (settingId: string, newValue: any) => {
    const setting = settings.find(s => s.id === settingId)
    if (!setting) return

    // Atualizar localmente
    setSettings(prev => prev.map(s =>
      s.id === settingId ? { ...s, value: newValue } : s
    ))

    // Atualizar no backend (opcional - pode ser feito em batch no save)
    try {
      await api.patch(`/api/v1/settings/category/${setting.category}/${settingId}`, { value: newValue })
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    
    try {
      // Agrupar por categoria
      const settingsByCategory = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = {}
        }
        acc[setting.category][setting.id] = setting.value
        return acc
      }, {} as Record<string, Record<string, any>>)

      // Salvar cada categoria
      await Promise.all(
        Object.entries(settingsByCategory).map(([category, values]) =>
          api.put(`/api/v1/settings/category/${category}`, values)
        )
      )

      toast.success('Configurações salvas com sucesso!')
      setShowSaveModal(false)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = async () => {
    setLoading(true)
    
    try {
      await api.post('/api/v1/settings/reset', {
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      })
      
      toast.success('Configurações resetadas para os valores padrão!')
      setShowResetModal(false)
      loadSettings()
    } catch (error) {
      console.error('Erro ao resetar configurações:', error)
      toast.error('Erro ao resetar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setBackupGenerating(true)
    
    try {
      const response = await api.post('/api/v1/settings/backup/create')
      const backupData = response.data?.data || {}
      
      const filename = `backup-configuracoes-${new Date().toISOString().split('T')[0]}.json`
      const content = JSON.stringify({ ...backupData, settings }, null, 2)
      
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Backup criado com sucesso: ${filename}`)
      setShowBackupModal(false)
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      toast.error('Erro ao criar backup')
    } finally {
      setBackupGenerating(false)
    }
  }

  const handleRestoreBackup = async (file: File) => {
    setRestoreProcessing(true)
    
    try {
      const content = await file.text()
      const backupData = JSON.parse(content)
      
      await api.post('/api/v1/settings/backup/restore', { backupData })
      
      toast.success('Backup restaurado com sucesso!')
      setShowRestoreModal(false)
      loadSettings()
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      toast.error('Erro ao restaurar backup. Verifique se o arquivo é válido.')
    } finally {
      setRestoreProcessing(false)
    }
  }

  const getFilteredSettings = () => {
    return settings.filter(setting => {
      const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory
      const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          setting.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }

  const getCategorySettings = (categoryId: string) => {
    return settings.filter(setting => setting.category === categoryId)
  }

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={setting.description}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        )
      case 'boolean':
        return (
          <div className="flex items-center">
            <button
              onClick={() => handleSettingChange(setting.id, !setting.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                setting.value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-gray-600">
              {setting.value ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        )
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'textarea':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder={setting.description}
          />
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
                <p className="mt-2 text-gray-600">
                  Gerencie todas as configurações do sistema
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBackupModal(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="Criar backup das configurações"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Backup
                </button>
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  title="Restaurar configurações de backup"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restaurar
                </button>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Resetar todas as configurações"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Resetar
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Salvar todas as alterações"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar configurações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="sm:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categories.map(category => (
              <div
                key={category.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  category.href
                    ? 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-cyan-50'
                    : selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (category.href) {
                    router.push(category.href)
                  } else {
                    setSelectedCategory(category.id)
                  }
                }}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.countLabel || `${getCategorySettings(category.id).length} configurações`}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
                
                {category.href && (
                  <div className="mt-3 flex items-center text-cyan-600">
                    <span className="text-sm font-medium">Clique para gerenciar →</span>
                  </div>
                )}
                {!category.href && selectedCategory === category.id && (
                  <div className="mt-3 flex items-center text-blue-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Selecionado</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'Todas as Configurações' :
                   categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                {selectedCategory !== 'all' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {getCategorySettings(selectedCategory).length} configurações
                    </span>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver todas
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando configurações...</p>
                </div>
              ) : getFilteredSettings().length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma configuração encontrada</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Tente ajustar os filtros ou selecione outra categoria
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {getFilteredSettings().map(setting => (
                    <div key={setting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {setting.name}
                            </h3>
                            {setting.required && (
                              <span className="ml-2 text-red-500">*</span>
                            )}
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {setting.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Categoria: {setting.category}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSettingChange(setting.id, setting.value)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Resetar valor"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {renderSettingInput(setting)}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            setting.required
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {setting.required ? 'Obrigatório' : 'Opcional'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {setting.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Salvar */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <Save className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Salvar Configurações</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja salvar todas as alterações nas configurações?
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Configurações que serão salvas:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {getFilteredSettings().slice(0, 5).map(setting => (
                    <div key={setting.id} className="flex items-center text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                      <span className="text-gray-600">{setting.name}</span>
                    </div>
                  ))}
                  {getFilteredSettings().length > 5 && (
                    <div className="text-xs text-gray-500">
                      ... e mais {getFilteredSettings().length - 5} configurações
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Reset */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Resetar Configurações</h3>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Tem certeza que deseja resetar todas as configurações para os valores padrão?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-800 font-medium">Atenção!</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Esta ação não pode ser desfeita e afetará todas as configurações do sistema.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetSettings}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Resetando...' : 'Resetar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Backup */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Criar Backup</h3>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Criar um backup de todas as configurações atuais do sistema?
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm text-purple-800 font-medium">Informação</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    O backup incluirá todas as configurações atuais e será salvo como arquivo JSON.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={backupGenerating}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {backupGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {backupGenerating ? 'Criando...' : 'Criar Backup'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Restaurar */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <RefreshCw className="h-6 w-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Restaurar Backup</h3>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Selecione um arquivo de backup para restaurar as configurações:
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-800 font-medium">Atenção!</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Esta ação substituirá todas as configurações atuais pelas do backup.
                  </p>
                </div>
              </div>
              
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleRestoreBackup(file)
                  }
                }}
                className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={restoreProcessing}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {restoreProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {restoreProcessing ? 'Restaurando...' : 'Restaurar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
