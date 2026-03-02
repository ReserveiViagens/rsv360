'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { 
  Package,
  Plug,
  Globe,
  Database,
  Cloud,
  Mail,
  CreditCard,
  MessageSquare,
  BarChart3,
  MapPin,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Star,
  Shield,
  Zap,
  Code,
  Terminal,
  FileText,
  Link2,
  ExternalLink,
  Copy,
  GitBranch,
  Activity,
  TrendingUp,
  Calendar,
  Bell,
  Smartphone,
  ShoppingCart,
  Building,
  Truck,
  Camera,
  Phone,
  Video,
  Music,
  Image,
  Server
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell,
  Pie
} from 'recharts'

// Tipos para Integration Hub
interface Integration {
  id: string
  name: string
  description: string
  category: 'payment' | 'email' | 'sms' | 'storage' | 'analytics' | 'maps' | 'social' | 'ecommerce' | 'communication' | 'crm' | 'other'
  provider: string
  version: string
  status: 'available' | 'installed' | 'configuring' | 'error' | 'deprecated'
  popularity: number
  rating: number
  reviews: number
  logo: string
  website: string
  documentation: string
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise'
  features: string[]
  requirements: string[]
  supportedActions: string[]
  webhookSupport: boolean
  apiVersion: string
  lastUpdated: string
  installCount: number
  configuration?: IntegrationConfig
}

interface IntegrationConfig {
  id: string
  integrationId: string
  isActive: boolean
  settings: Record<string, any>
  credentials: Record<string, string>
  webhooks: {
    url: string
    events: string[]
    secret: string
  }[]
  rateLimits: {
    requests: number
    window: string
  }
  lastSync: string
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    avgResponseTime: number
  }
}

interface IntegrationTemplate {
  id: string
  name: string
  description: string
  category: string
  integrations: string[]
  workflow: {
    trigger: string
    actions: string[]
  }
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  useCase: string
}

interface MarketplaceStats {
  totalIntegrations: number
  installedIntegrations: number
  popularCategories: string[]
  recentUpdates: number
  communityRating: number
}

const IntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  // Dados mock para demonstração
  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Stripe',
      description: 'Processamento de pagamentos online com APIs robustas e seguras',
      category: 'payment',
      provider: 'Stripe Inc.',
      version: '2023-10-16',
      status: 'installed',
      popularity: 95,
      rating: 4.8,
      reviews: 15420,
      logo: '/logos/stripe.png',
      website: 'https://stripe.com',
      documentation: 'https://stripe.com/docs',
      pricing: 'freemium',
      features: ['Online Payments', 'Subscriptions', 'Marketplace', 'Connect', 'Billing'],
      requirements: ['HTTPS', 'Webhook endpoint'],
      supportedActions: ['create_payment', 'refund', 'create_customer', 'create_subscription'],
      webhookSupport: true,
      apiVersion: 'v1',
      lastUpdated: '2025-01-10T00:00:00Z',
      installCount: 125000
    },
    {
      id: '2',
      name: 'SendGrid',
      description: 'Plataforma de email marketing e transacional com alta deliverabilidade',
      category: 'email',
      provider: 'Twilio SendGrid',
      version: 'v3',
      status: 'installed',
      popularity: 88,
      rating: 4.6,
      reviews: 8930,
      logo: '/logos/sendgrid.png',
      website: 'https://sendgrid.com',
      documentation: 'https://docs.sendgrid.com',
      pricing: 'freemium',
      features: ['Transactional Email', 'Marketing Campaigns', 'Templates', 'Analytics'],
      requirements: ['API Key', 'Domain verification'],
      supportedActions: ['send_email', 'create_template', 'manage_lists', 'track_email'],
      webhookSupport: true,
      apiVersion: 'v3',
      lastUpdated: '2025-01-08T00:00:00Z',
      installCount: 89000
    },
    {
      id: '3',
      name: 'Google Maps',
      description: 'APIs de mapas, geocodificação e navegação do Google',
      category: 'maps',
      provider: 'Google',
      version: 'v1',
      status: 'installed',
      popularity: 92,
      rating: 4.7,
      reviews: 12340,
      logo: '/logos/google-maps.png',
      website: 'https://developers.google.com/maps',
      documentation: 'https://developers.google.com/maps/documentation',
      pricing: 'freemium',
      features: ['Maps', 'Geocoding', 'Directions', 'Places', 'Street View'],
      requirements: ['API Key', 'Billing account'],
      supportedActions: ['geocode', 'reverse_geocode', 'get_directions', 'search_places'],
      webhookSupport: false,
      apiVersion: 'v1',
      lastUpdated: '2025-01-05T00:00:00Z',
      installCount: 156000
    },
    {
      id: '4',
      name: 'Twilio',
      description: 'Plataforma de comunicação para SMS, chamadas e vídeo',
      category: 'sms',
      provider: 'Twilio Inc.',
      version: '2010-04-01',
      status: 'available',
      popularity: 85,
      rating: 4.5,
      reviews: 6780,
      logo: '/logos/twilio.png',
      website: 'https://twilio.com',
      documentation: 'https://www.twilio.com/docs',
      pricing: 'paid',
      features: ['SMS', 'Voice', 'Video', 'WhatsApp', 'Chat'],
      requirements: ['Account SID', 'Auth Token'],
      supportedActions: ['send_sms', 'make_call', 'create_video_room', 'send_whatsapp'],
      webhookSupport: true,
      apiVersion: '2010-04-01',
      lastUpdated: '2025-01-12T00:00:00Z',
      installCount: 67000
    },
    {
      id: '5',
      name: 'AWS S3',
      description: 'Armazenamento de objetos escalável e seguro na nuvem',
      category: 'storage',
      provider: 'Amazon Web Services',
      version: '2006-03-01',
      status: 'configuring',
      popularity: 90,
      rating: 4.4,
      reviews: 23450,
      logo: '/logos/aws-s3.png',
      website: 'https://aws.amazon.com/s3',
      documentation: 'https://docs.aws.amazon.com/s3',
      pricing: 'paid',
      features: ['Object Storage', 'CDN', 'Backup', 'Data Lake', 'Static Hosting'],
      requirements: ['AWS Access Key', 'Secret Key', 'Bucket'],
      supportedActions: ['upload_file', 'download_file', 'delete_file', 'list_objects'],
      webhookSupport: true,
      apiVersion: '2006-03-01',
      lastUpdated: '2025-01-07T00:00:00Z',
      installCount: 245000
    },
    {
      id: '6',
      name: 'Slack',
      description: 'Plataforma de comunicação e colaboração em equipe',
      category: 'communication',
      provider: 'Slack Technologies',
      version: 'v1',
      status: 'available',
      popularity: 82,
      rating: 4.6,
      reviews: 15670,
      logo: '/logos/slack.png',
      website: 'https://slack.com',
      documentation: 'https://api.slack.com',
      pricing: 'freemium',
      features: ['Messaging', 'File Sharing', 'Integrations', 'Workflows', 'Apps'],
      requirements: ['Bot Token', 'OAuth Token'],
      supportedActions: ['send_message', 'upload_file', 'create_channel', 'invite_user'],
      webhookSupport: true,
      apiVersion: 'v1',
      lastUpdated: '2025-01-09T00:00:00Z',
      installCount: 78000
    },
    {
      id: '7',
      name: 'Salesforce',
      description: 'CRM líder mundial com automação de vendas e marketing',
      category: 'crm',
      provider: 'Salesforce.com',
      version: 'v54.0',
      status: 'available',
      popularity: 78,
      rating: 4.3,
      reviews: 9870,
      logo: '/logos/salesforce.png',
      website: 'https://salesforce.com',
      documentation: 'https://developer.salesforce.com',
      pricing: 'enterprise',
      features: ['CRM', 'Sales Cloud', 'Marketing Cloud', 'Service Cloud', 'Analytics'],
      requirements: ['Connected App', 'OAuth Setup'],
      supportedActions: ['create_lead', 'update_contact', 'create_opportunity', 'sync_data'],
      webhookSupport: true,
      apiVersion: 'v54.0',
      lastUpdated: '2025-01-06T00:00:00Z',
      installCount: 34000
    },
    {
      id: '8',
      name: 'WhatsApp Business',
      description: 'API oficial do WhatsApp para comunicação empresarial',
      category: 'communication',
      provider: 'Meta',
      version: 'v17.0',
      status: 'available',
      popularity: 89,
      rating: 4.5,
      reviews: 5430,
      logo: '/logos/whatsapp.png',
      website: 'https://business.whatsapp.com',
      documentation: 'https://developers.facebook.com/docs/whatsapp',
      pricing: 'paid',
      features: ['Messaging', 'Media', 'Templates', 'Webhooks', 'Business Profile'],
      requirements: ['Business Account', 'Webhook URL', 'Verification'],
      supportedActions: ['send_message', 'send_media', 'create_template', 'get_profile'],
      webhookSupport: true,
      apiVersion: 'v17.0',
      lastUpdated: '2025-01-11T00:00:00Z',
      installCount: 45000
    }
  ])

  const [integrationTemplates] = useState<IntegrationTemplate[]>([
    {
      id: '1',
      name: 'E-commerce Completo',
      description: 'Integração completa para loja online com pagamentos, emails e analytics',
      category: 'ecommerce',
      integrations: ['stripe', 'sendgrid', 'google-analytics'],
      workflow: {
        trigger: 'new_order',
        actions: ['process_payment', 'send_confirmation_email', 'track_conversion']
      },
      difficulty: 'medium',
      estimatedTime: '2-3 horas',
      useCase: 'Loja online com pagamentos automáticos'
    },
    {
      id: '2',
      name: 'Notificações Multi-canal',
      description: 'Sistema de notificações via email, SMS e WhatsApp',
      category: 'communication',
      integrations: ['sendgrid', 'twilio', 'whatsapp'],
      workflow: {
        trigger: 'booking_confirmed',
        actions: ['send_email', 'send_sms', 'send_whatsapp']
      },
      difficulty: 'easy',
      estimatedTime: '1-2 horas',
      useCase: 'Confirmações de reserva automáticas'
    },
    {
      id: '3',
      name: 'CRM Sync',
      description: 'Sincronização automática de leads e clientes com CRM',
      category: 'crm',
      integrations: ['salesforce', 'hubspot'],
      workflow: {
        trigger: 'new_lead',
        actions: ['create_crm_lead', 'assign_to_rep', 'schedule_followup']
      },
      difficulty: 'hard',
      estimatedTime: '4-6 horas',
      useCase: 'Gestão automatizada de leads'
    }
  ])

  // Dados para gráficos
  const integrationUsageData = [
    { month: 'Jan', installed: 45, active: 38 },
    { month: 'Fev', installed: 52, active: 44 },
    { month: 'Mar', installed: 48, active: 41 },
    { month: 'Abr', installed: 61, active: 52 },
    { month: 'Mai', installed: 55, active: 48 },
    { month: 'Jun', installed: 67, active: 58 }
  ]

  const categoryDistribution = [
    { name: 'Payment', value: 25, color: '#3b82f6' },
    { name: 'Communication', value: 22, color: '#10b981' },
    { name: 'Storage', value: 18, color: '#f59e0b' },
    { name: 'Analytics', value: 15, color: '#8b5cf6' },
    { name: 'CRM', value: 12, color: '#ef4444' },
    { name: 'Others', value: 8, color: '#6b7280' }
  ]

  const popularIntegrationsData = [
    { name: 'Stripe', installations: 125000 },
    { name: 'AWS S3', installations: 245000 },
    { name: 'Google Maps', installations: 156000 },
    { name: 'SendGrid', installations: 89000 },
    { name: 'Slack', installations: 78000 }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'bg-green-100 text-green-800'
      case 'available': return 'bg-blue-100 text-blue-800'
      case 'configuring': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'deprecated': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return CheckCircle
      case 'available': return Plus
      case 'configuring': return Settings
      case 'error': return AlertTriangle
      case 'deprecated': return Clock
      default: return Clock
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return CreditCard
      case 'email': return Mail
      case 'sms': return MessageSquare
      case 'storage': return Database
      case 'analytics': return BarChart3
      case 'maps': return MapPin
      case 'social': return Users
      case 'ecommerce': return ShoppingCart
      case 'communication': return Phone
      case 'crm': return Building
      default: return Package
    }
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'bg-green-100 text-green-800'
      case 'freemium': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-orange-100 text-orange-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Integrações</h1>
          <p className="text-gray-600">Marketplace de integrações e APIs para expandir as funcionalidades</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Integração
          </Button>
          <Button variant="secondary">
            <Upload className="w-4 h-4 mr-2" />
            Importar Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">Instaladas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input 
                    placeholder="Buscar integrações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    title="Buscar integrações"
                  />
                </div>
                <Select 
                  title="Filtrar por categoria"
                  options={[
                    { value: 'all', label: 'Todas as Categorias' },
                    { value: 'payment', label: 'Pagamentos' },
                    { value: 'email', label: 'Email' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'storage', label: 'Armazenamento' },
                    { value: 'analytics', label: 'Analytics' },
                    { value: 'maps', label: 'Mapas' },
                    { value: 'social', label: 'Social' },
                    { value: 'communication', label: 'Comunicação' },
                    { value: 'crm', label: 'CRM' }
                  ]}
                />
                <Button variant="secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros Avançados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status)
              const CategoryIcon = getCategoryIcon(integration.category)

              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CategoryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.provider}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {integration.status}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {integration.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {renderStars(integration.rating)}
                          <span className="text-sm text-gray-600 ml-2">
                            {integration.rating} ({formatNumber(integration.reviews)})
                          </span>
                        </div>
                        <Badge className={getPricingColor(integration.pricing)}>
                          {integration.pricing}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>v{integration.version}</span>
                        <span>{formatNumber(integration.installCount)} instalações</span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-2">Principais recursos:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {integration.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{integration.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-3 border-t">
                        {integration.status === 'installed' ? (
                          <Button size="sm" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurar
                          </Button>
                        ) : (
                          <Button size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Instalar
                          </Button>
                        )}
                        <Button variant="secondary" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-6">
          {/* Integrações Instaladas */}
          <div className="grid gap-6">
            {integrations.filter(i => i.status === 'installed' || i.status === 'configuring').map((integration) => {
              const StatusIcon = getStatusIcon(integration.status)
              const CategoryIcon = getCategoryIcon(integration.category)

              return (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <CategoryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{integration.name}</h3>
                          <p className="text-gray-600">{integration.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge>v{integration.version}</Badge>
                            <Badge variant="secondary">{integration.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(integration.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {integration.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Requisições</p>
                        <p className="text-lg font-bold text-blue-600">12,345</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Taxa Sucesso</p>
                        <p className="text-lg font-bold text-green-600">99.2%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tempo Resp.</p>
                        <p className="text-lg font-bold text-purple-600">145ms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Última Sync</p>
                        <p className="text-lg font-bold text-orange-600">2min</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Ações Suportadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.supportedActions.map((action, index) => (
                            <Badge key={index} variant="secondary">
                              {action.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Webhooks:</span>
                          <span className="ml-2 font-medium">
                            {integration.webhookSupport ? 'Suportado' : 'Não suportado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">API Version:</span>
                          <span className="ml-2 font-medium">{integration.apiVersion}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Última Atualização:</span>
                          <span className="ml-2 font-medium">{formatDateTime(integration.lastUpdated)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Popularidade:</span>
                          <span className="ml-2 font-medium">{integration.popularity}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-1">
                          {renderStars(integration.rating)}
                          <span className="text-sm text-gray-600 ml-2">
                            {integration.rating}/5
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Activity className="h-3 w-3 mr-1" />
                            Logs
                          </Button>
                          <Button variant="secondary" size="sm">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sincronizar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Templates de Integração */}
          <Card>
            <CardHeader>
              <CardTitle>Templates de Integração</CardTitle>
              <CardDescription>Configurações pré-definidas para casos de uso comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationTemplates.map((template) => (
                  <Card key={template.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                          <p className="text-gray-600 text-sm">{template.description}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Tempo estimado:</span>
                            <span className="ml-2 font-medium">{template.estimatedTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Caso de uso:</span>
                            <span className="ml-2 font-medium">{template.useCase}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Integrações necessárias:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.integrations.map((integrationId, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {integrationId}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Workflow:</p>
                          <div className="bg-gray-50 p-3 rounded-lg text-xs">
                            <p><strong>Trigger:</strong> {template.workflow.trigger}</p>
                            <p><strong>Actions:</strong> {template.workflow.actions.join(', ')}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-3 border-t">
                          <Button size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Usar Template
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics das Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrações</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{integrations.length}</div>
                <p className="text-xs text-gray-600">
                  {integrations.filter(i => i.status === 'installed').length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requisições/dia</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">47,892</div>
                <p className="text-xs text-gray-600">+12% vs ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Sucesso</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">98.7%</div>
                <p className="text-xs text-gray-600">Últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Resp. Médio</CardTitle>
                <Zap className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">156ms</div>
                <p className="text-xs text-gray-600">Todas as APIs</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Integrações</CardTitle>
              <CardDescription>Instalações e ativações ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={integrationUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="installed" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Instaladas" />
                  <Area type="monotone" dataKey="active" stackId="1" stroke="#10b981" fill="#10b981" name="Ativas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Tipos de integrações mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Integrações Mais Populares */}
            <Card>
              <CardHeader>
                <CardTitle>Mais Populares</CardTitle>
                <CardDescription>Integrações com mais instalações</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={popularIntegrationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Bar dataKey="installations" fill="#10b981" name="Instalações" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="developer" className="space-y-6">
          {/* Área do Desenvolvedor */}
          <Card>
            <CardHeader>
              <CardTitle>Área do Desenvolvedor</CardTitle>
              <CardDescription>Ferramentas para criar e gerenciar integrações customizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Criar Nova Integração</h3>
                  <div className="space-y-3">
                    <Input placeholder="Nome da integração" title="Nome da integração" />
                    <Textarea placeholder="Descrição da integração" title="Descrição" />
                    <Select 
                      title="Categoria"
                      options={[
                        { value: 'payment', label: 'Pagamentos' },
                        { value: 'email', label: 'Email' },
                        { value: 'sms', label: 'SMS' },
                        { value: 'storage', label: 'Armazenamento' },
                        { value: 'other', label: 'Outros' }
                      ]}
                    />
                    <Input placeholder="URL da API base" title="URL da API" />
                    <Button className="w-full">
                      <Code className="h-4 w-4 mr-2" />
                      Criar Integração
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ferramentas de Desenvolvimento</h3>
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start">
                      <Terminal className="h-4 w-4 mr-2" />
                      API Console
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Documentação da API
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <Code className="h-4 w-4 mr-2" />
                      Gerador de SDK
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      Logs de Debug
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrações Customizadas */}
          <Card>
            <CardHeader>
              <CardTitle>Integrações Customizadas</CardTitle>
              <CardDescription>Integrações criadas pela sua equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Code className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Internal CRM Integration</h4>
                      <p className="text-sm text-gray-600">Integração customizada com CRM interno</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Button size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Code className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Custom Payment Gateway</h4>
                      <p className="text-sm text-gray-600">Gateway de pagamento local desenvolvido internamente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Development</Badge>
                    <Button size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentação da API */}
          <Card>
            <CardHeader>
              <CardTitle>Documentação da API</CardTitle>
              <CardDescription>Guias e referências para desenvolvedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="secondary" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Guia de Início</span>
                </Button>
                <Button variant="secondary" className="h-20 flex-col">
                  <Code className="h-6 w-6 mb-2" />
                  <span>Referência da API</span>
                </Button>
                <Button variant="secondary" className="h-20 flex-col">
                  <ExternalLink className="h-6 w-6 mb-2" />
                  <span>Exemplos de Código</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IntegrationHub
