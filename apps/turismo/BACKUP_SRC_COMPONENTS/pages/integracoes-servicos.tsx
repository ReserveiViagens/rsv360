'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Progress } from '@/components/ui/Progress';
import {
  Cloud,
  Zap,
  Settings,
  Server,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  MapPin,
  Users,
  BarChart3,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Calendar,
  FileText,
  Image,
  Video,
  Music,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  TestTube,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Activity,
  Clock,
  Network,
  Key,
  Lock,
  Info
} from 'lucide-react';

interface ExternalService {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'sms' | 'payment' | 'storage' | 'analytics' | 'maps' | 'communication' | 'social' | 'other';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  config: Record<string, any>;
  credentials: Record<string, string>;
  features: string[];
  pricing_tier: 'free' | 'basic' | 'pro' | 'enterprise';
  monthly_usage: number;
  monthly_limit: number;
  cost_per_month: number;
  last_sync: string;
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  error_count: number;
  success_rate: number;
  documentation_url?: string;
  support_url?: string;
  created_at: string;
  updated_at: string;
}

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  logo: string;
  features: string[];
  pricing_tiers: Array<{
    name: string;
    price: number;
    limits: Record<string, number>;
    features: string[];
  }>;
  config_fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Serviço de email transacional e marketing',
    category: 'email',
    provider: 'SendGrid',
    logo: '📧',
    features: ['Email Transacional', 'Templates', 'Analytics', 'Webhooks'],
    pricing_tiers: [
      {
        name: 'Free',
        price: 0,
        limits: { emails: 100 },
        features: ['100 emails/dia', 'API básica']
      },
      {
        name: 'Pro',
        price: 89.95,
        limits: { emails: 100000 },
        features: ['100k emails/mês', 'Templates avançados', 'Analytics']
      }
    ],
    config_fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'sender_email', label: 'Email Remetente', type: 'text', required: true },
      { key: 'sender_name', label: 'Nome Remetente', type: 'text', required: false }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Plataforma de comunicação (SMS, WhatsApp, Voz)',
    category: 'sms',
    provider: 'Twilio',
    logo: '💬',
    features: ['SMS', 'WhatsApp', 'Voz', 'Verificação', 'Chat'],
    pricing_tiers: [
      {
        name: 'Pay as you go',
        price: 0,
        limits: { sms: 0 },
        features: ['Pagamento por uso', '$0.0075/SMS']
      }
    ],
    config_fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', required: true },
      { key: 'auth_token', label: 'Auth Token', type: 'password', required: true },
      { key: 'phone_number', label: 'Número de Telefone', type: 'text', required: true }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Processamento de pagamentos online',
    category: 'payment',
    provider: 'Stripe',
    logo: '💳',
    features: ['Cartões', 'PIX', 'Boleto', 'Webhooks', 'Subscriptions'],
    pricing_tiers: [
      {
        name: 'Standard',
        price: 0,
        limits: {},
        features: ['2.9% + R$0.30 por transação']
      }
    ],
    config_fields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: false }
    ]
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    description: 'Gerenciamento e otimização de imagens/vídeos',
    category: 'storage',
    provider: 'Cloudinary',
    logo: '🖼️',
    features: ['Upload', 'Transformação', 'Otimização', 'CDN'],
    pricing_tiers: [
      {
        name: 'Free',
        price: 0,
        limits: { storage: 25, bandwidth: 25 },
        features: ['25GB storage', '25GB bandwidth/mês']
      },
      {
        name: 'Plus',
        price: 99,
        limits: { storage: 100, bandwidth: 100 },
        features: ['100GB storage', '100GB bandwidth/mês']
      }
    ],
    config_fields: [
      { key: 'cloud_name', label: 'Cloud Name', type: 'text', required: true },
      { key: 'api_key', label: 'API Key', type: 'text', required: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Analytics e insights de comportamento',
    category: 'analytics',
    provider: 'Google',
    logo: '📊',
    features: ['Eventos', 'Conversões', 'Audiências', 'Relatórios'],
    pricing_tiers: [
      {
        name: 'Free',
        price: 0,
        limits: { events: 10000000 },
        features: ['10M eventos/mês', 'Relatórios padrão']
      }
    ],
    config_fields: [
      { key: 'tracking_id', label: 'Tracking ID', type: 'text', required: true },
      { key: 'measurement_id', label: 'Measurement ID', type: 'text', required: false }
    ]
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing e automação',
    category: 'email',
    provider: 'Mailchimp',
    logo: '🐵',
    features: ['Campanhas', 'Automação', 'Segmentação', 'Landing Pages'],
    pricing_tiers: [
      {
        name: 'Free',
        price: 0,
        limits: { contacts: 2000, emails: 10000 },
        features: ['2k contatos', '10k emails/mês']
      },
      {
        name: 'Essentials',
        price: 59,
        limits: { contacts: 50000, emails: 500000 },
        features: ['50k contatos', '500k emails/mês', 'Automação']
      }
    ],
    config_fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'server_prefix', label: 'Server Prefix', type: 'text', required: true },
      { key: 'list_id', label: 'List ID', type: 'text', required: false }
    ]
  }
];

const MOCK_SERVICES: ExternalService[] = [
  {
    id: '1',
    name: 'SendGrid Email',
    description: 'Serviço de email transacional para confirmações e notificações',
    category: 'email',
    provider: 'SendGrid',
    status: 'connected',
    config: {
      sender_email: 'reservas@reserveiviagens.com.br',
      sender_name: 'Reservei Viagens',
      templates_enabled: true
    },
    credentials: {
      api_key: 'SG.*********************'
    },
    features: ['Email Transacional', 'Templates', 'Analytics'],
    pricing_tier: 'pro',
    monthly_usage: 2847,
    monthly_limit: 100000,
    cost_per_month: 89.95,
    last_sync: '2025-01-08 14:30:00',
    sync_frequency: 'real_time',
    error_count: 12,
    success_rate: 99.2,
    documentation_url: 'https://docs.sendgrid.com',
    support_url: 'https://support.sendgrid.com',
    created_at: '2024-01-15',
    updated_at: '2025-01-08'
  },
  {
    id: '2',
    name: 'Twilio SMS',
    description: 'Notificações por SMS e WhatsApp',
    category: 'sms',
    provider: 'Twilio',
    status: 'connected',
    config: {
      phone_number: '+5564999999999',
      whatsapp_enabled: true
    },
    credentials: {
      account_sid: 'AC*********************',
      auth_token: '*********************'
    },
    features: ['SMS', 'WhatsApp', 'Verificação'],
    pricing_tier: 'basic',
    monthly_usage: 156,
    monthly_limit: 10000,
    cost_per_month: 23.40,
    last_sync: '2025-01-08 12:15:00',
    sync_frequency: 'real_time',
    error_count: 3,
    success_rate: 98.1,
    documentation_url: 'https://www.twilio.com/docs',
    support_url: 'https://support.twilio.com',
    created_at: '2024-02-20',
    updated_at: '2025-01-08'
  },
  {
    id: '3',
    name: 'Cloudinary Media',
    description: 'Armazenamento e processamento de imagens',
    category: 'storage',
    provider: 'Cloudinary',
    status: 'connected',
    config: {
      auto_optimize: true,
      format: 'auto',
      quality: 'auto'
    },
    credentials: {
      cloud_name: 'reservei-viagens',
      api_key: '*********************',
      api_secret: '*********************'
    },
    features: ['Upload', 'Transformação', 'CDN'],
    pricing_tier: 'plus',
    monthly_usage: 45,
    monthly_limit: 100,
    cost_per_month: 99.00,
    last_sync: '2025-01-08 10:00:00',
    sync_frequency: 'daily',
    error_count: 1,
    success_rate: 99.8,
    documentation_url: 'https://cloudinary.com/documentation',
    support_url: 'https://support.cloudinary.com',
    created_at: '2024-03-10',
    updated_at: '2025-01-07'
  },
  {
    id: '4',
    name: 'Google Analytics',
    description: 'Analytics de comportamento dos usuários',
    category: 'analytics',
    provider: 'Google',
    status: 'error',
    config: {
      enhanced_ecommerce: true,
      custom_events: true
    },
    credentials: {
      tracking_id: 'UA-*********************',
      measurement_id: 'G-*********************'
    },
    features: ['Eventos', 'Conversões', 'Audiências'],
    pricing_tier: 'free',
    monthly_usage: 45678,
    monthly_limit: 10000000,
    cost_per_month: 0,
    last_sync: '2025-01-07 22:30:00',
    sync_frequency: 'hourly',
    error_count: 25,
    success_rate: 96.5,
    documentation_url: 'https://developers.google.com/analytics',
    support_url: 'https://support.google.com/analytics',
    created_at: '2024-01-20',
    updated_at: '2025-01-07'
  }
];

export default function IntegracoesServicos() {
  const [services, setServices] = useState<ExternalService[]>(MOCK_SERVICES);
  const [templates] = useState<ServiceTemplate[]>(SERVICE_TEMPLATES);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedService, setSelectedService] = useState<ExternalService | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredServices = services.filter(service => {
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'testing':
        return 'text-blue-600';
      case 'disconnected':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      connected: 'bg-green-100 text-green-800',
      testing: 'bg-blue-100 text-blue-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };

    const labels = {
      connected: 'Conectado',
      testing: 'Testando',
      disconnected: 'Desconectado',
      error: 'Erro'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPricingBadge = (tier: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };

    const labels = {
      free: 'Gratuito',
      basic: 'Básico',
      pro: 'Pro',
      enterprise: 'Enterprise'
    };

    return (
      <Badge className={colors[tier as keyof typeof colors]}>
        {labels[tier as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'storage':
        return <Database className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'maps':
        return <MapPin className="h-4 w-4" />;
      case 'communication':
        return <Phone className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const testService = async (service: ExternalService) => {
    setTestingService(service.id);

    try {
      // Simular teste do serviço
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar status do teste
      setServices(prev => prev.map(s =>
        s.id === service.id
          ? {
              ...s,
              status: 'connected',
              last_sync: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : s
      ));

      alert('Teste realizado com sucesso!');
    } catch (error) {
      setServices(prev => prev.map(s =>
        s.id === service.id
          ? {
              ...s,
              status: 'error',
              last_sync: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : s
      ));

      alert('Erro no teste do serviço.');
    } finally {
      setTestingService(null);
    }
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(s =>
      s.id === serviceId
        ? {
            ...s,
            status: s.status === 'connected' ? 'disconnected' : 'connected'
          }
        : s
    ));
  };

  const handleConfigureFromTemplate = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setIsConfiguring(true);
  };

  const handleSaveService = (configData: Record<string, any>) => {
    if (!selectedTemplate) return;

    const newService: ExternalService = {
      id: Date.now().toString(),
      name: `${selectedTemplate.name} ${selectedTemplate.category}`,
      description: selectedTemplate.description,
      category: selectedTemplate.category as any,
      provider: selectedTemplate.provider,
      status: 'disconnected',
      config: {},
      credentials: configData,
      features: selectedTemplate.features,
      pricing_tier: 'free',
      monthly_usage: 0,
      monthly_limit: 0,
      cost_per_month: 0,
      last_sync: '',
      sync_frequency: 'real_time',
      error_count: 0,
      success_rate: 0,
      documentation_url: '',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    setServices(prev => [...prev, newService]);
    setIsConfiguring(false);
    setSelectedTemplate(null);
    alert('Serviço configurado com sucesso!');
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Tem certeza que deseja deletar este serviço?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      if (selectedService?.id === serviceId) {
        setSelectedService(null);
      }
    }
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(Math.round((usage / limit) * 100), 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTotalMonthlyCost = () => {
    return services.reduce((total, service) => total + service.cost_per_month, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ☁️ Serviços Externos RSV 360
            </h1>
            <p className="text-gray-600">
              Gerencie integrações com serviços de terceiros
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button
              onClick={() => setActiveTab('marketplace')}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Serviço
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Serviços Conectados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {services.filter(s => s.status === 'connected').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Serviços</p>
                  <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                </div>
                <Cloud className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Custo Mensal</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {getTotalMonthlyCost().toFixed(2)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Disponibilidade</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(services.reduce((acc, s) => acc + s.success_rate, 0) / services.length)}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="services">
              <Cloud className="h-4 w-4 mr-2" />
              Meus Serviços
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <Plus className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Faturamento
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status dos Serviços */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Serviços</CardTitle>
                  <CardDescription>Resumo do status de todos os serviços</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(service.category)}
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.provider}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusBadge(service.status)}
                          <span className={`text-sm ${getStatusColor(service.status)}`}>
                            {service.success_rate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Uso e Limites */}
              <Card>
                <CardHeader>
                  <CardTitle>Uso dos Serviços</CardTitle>
                  <CardDescription>Consumo mensal por serviço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.filter(s => s.monthly_limit > 0).map(service => {
                      const usagePercent = getUsagePercentage(service.monthly_usage, service.monthly_limit);
                      return (
                        <div key={service.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{service.name}</span>
                            <span className="text-sm text-gray-600">
                              {service.monthly_usage.toLocaleString()} / {service.monthly_limit.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={usagePercent} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meus Serviços */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Serviços */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle>Serviços Configurados</CardTitle>

                      <div className="flex gap-2">
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas Categorias</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="payment">Pagamentos</SelectItem>
                            <SelectItem value="storage">Armazenamento</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                            <SelectItem value="other">Outras</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="connected">Conectado</SelectItem>
                            <SelectItem value="disconnected">Desconectado</SelectItem>
                            <SelectItem value="error">Erro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredServices.map(service => (
                        <div
                          key={service.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedService?.id === service.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(service.category)}
                              <div>
                                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                <p className="text-sm text-gray-600">{service.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline">{service.provider}</Badge>
                                  {getStatusBadge(service.status)}
                                  {getPricingBadge(service.pricing_tier)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testService(service);
                                }}
                                disabled={testingService === service.id}
                              >
                                {testingService === service.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleServiceStatus(service.id);
                                }}
                              >
                                {service.status === 'connected' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteService(service.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Uso mensal:</span> {service.monthly_usage.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Custo:</span> R$ {service.cost_per_month.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Último sync:</span> {service.last_sync || 'Nunca'}
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredServices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum serviço encontrado com os filtros aplicados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes do Serviço */}
              <div className="lg:col-span-1">
                {selectedService ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes do Serviço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold">Provedor</h5>
                          <p className="text-sm text-gray-600">{selectedService.provider}</p>
                        </div>

                        <div>
                          <h5 className="font-semibold">Categoria</h5>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(selectedService.category)}
                            <span className="text-sm text-gray-600 capitalize">{selectedService.category}</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold">Status</h5>
                          {getStatusBadge(selectedService.status)}
                        </div>

                        <div>
                          <h5 className="font-semibold">Frequência de Sync</h5>
                          <p className="text-sm text-gray-600 capitalize">{selectedService.sync_frequency.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-2">Recursos</h5>
                        <div className="space-y-1">
                          {selectedService.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-2">Estatísticas</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Taxa de Sucesso:</span>
                            <span className="font-medium">{selectedService.success_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Erros:</span>
                            <span className="font-medium">{selectedService.error_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uso Mensal:</span>
                            <span className="font-medium">{selectedService.monthly_usage.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo Mensal:</span>
                            <span className="font-medium">R$ {selectedService.cost_per_month.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {selectedService.documentation_url && (
                        <div className="border-t pt-4">
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedService.documentation_url, '_blank')}
                            className="w-full"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Documentação
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Selecione um serviço para ver os detalhes
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Marketplace */}
          <TabsContent value="marketplace">
            <Card>
              <CardHeader>
                <CardTitle>Marketplace de Serviços</CardTitle>
                <CardDescription>
                  Explore e configure novos serviços para integrar ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{template.logo}</div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                          </div>

                          <div>
                            <h5 className="font-semibold text-sm mb-2">Recursos:</h5>
                            <div className="flex flex-wrap gap-1">
                              {template.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {template.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.features.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-sm mb-2">Preços:</h5>
                            <div className="space-y-1">
                              {template.pricing_tiers.slice(0, 2).map((tier, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  <span className="font-medium">{tier.name}:</span>
                                  {tier.price === 0 ? ' Gratuito' : ` R$ ${tier.price}/mês`}
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleConfigureFromTemplate(template)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Modal de Configuração */}
            {isConfiguring && selectedTemplate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Configurar {selectedTemplate.name}</CardTitle>
                  <CardDescription>
                    Configure as credenciais e parâmetros do serviço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTemplate.config_fields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id={field.key}
                          type={field.type === 'password' ? 'password' : 'text'}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}

                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={() => {
                          // Coletar dados do formulário
                          const formData = selectedTemplate.config_fields.reduce((acc, field) => {
                            const input = document.getElementById(field.key) as HTMLInputElement;
                            acc[field.key] = input.value;
                            return acc;
                          }, {} as Record<string, string>);

                          handleSaveService(formData);
                        }}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configuração
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsConfiguring(false);
                          setSelectedTemplate(null);
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Faturamento */}
          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Custos</CardTitle>
                  <CardDescription>Custos mensais por serviço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.filter(s => s.cost_per_month > 0).map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(service.category)}
                          <span className="font-medium">{service.name}</span>
                          {getPricingBadge(service.pricing_tier)}
                        </div>
                        <span className="font-semibold">R$ {service.cost_per_month.toFixed(2)}</span>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total Mensal:</span>
                        <span className="text-lg font-bold text-blue-600">
                          R$ {getTotalMonthlyCost().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Otimização de Custos</CardTitle>
                  <CardDescription>Sugestões para reduzir custos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h4 className="font-semibold text-green-800 mb-1">💡 Sugestão</h4>
                      <p className="text-green-700 text-sm">
                        O Cloudinary está sendo subutilizado (45/100 GB).
                        Considere fazer downgrade para o plano Free.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-semibold text-blue-800 mb-1">📊 Análise</h4>
                      <p className="text-blue-700 text-sm">
                        Seus custos estão 15% abaixo da média do setor para agências de turismo.
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Atenção</h4>
                      <p className="text-yellow-700 text-sm">
                        SendGrid está próximo do limite (28k/100k emails).
                        Monitore o uso para evitar taxas extras.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Rodapé com informações */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <div className="text-blue-800">
                <p className="font-medium">Serviços Externos:</p>
                <p className="text-sm">
                  Gerencie integrações com serviços de terceiros para expandir as funcionalidades do sistema.
                  Monitore custos e uso para otimizar sua operação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
