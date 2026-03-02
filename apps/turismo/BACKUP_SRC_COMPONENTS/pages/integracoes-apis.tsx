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
  Globe,
  Zap,
  Settings,
  Key,
  Mail,
  MessageSquare,
  CreditCard,
  MapPin,
  Cloud,
  Database,
  Smartphone,
  Users,
  BarChart3,
  Bell,
  RefreshCw,
  Save,
  TestTube,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  Activity,
  Clock,
  Shield,
  Network
} from 'lucide-react';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'communication' | 'analytics' | 'maps' | 'weather' | 'social' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  endpoint: string;
  api_key: string;
  secret_key?: string;
  webhook_url?: string;
  rate_limit: number;
  timeout: number;
  retry_attempts: number;
  headers: Record<string, string>;
  auth_type: 'api_key' | 'bearer' | 'basic' | 'oauth2';
  test_endpoint?: string;
  documentation_url?: string;
  last_tested: string;
  last_success: string;
  success_rate: number;
  monthly_calls: number;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

interface APICall {
  id: string;
  integration_id: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time: number;
  success: boolean;
  error_message?: string;
  timestamp: string;
}

const MOCK_INTEGRATIONS: APIIntegration[] = [
  {
    id: '1',
    name: 'Pagar.me',
    description: 'Gateway de pagamento brasileiro',
    category: 'payment',
    provider: 'Pagar.me',
    status: 'active',
    endpoint: 'https://api.pagar.me/1',
    api_key: 'ak_live_*********************',
    secret_key: 'sk_live_*********************',
    webhook_url: 'https://api.reserveiviagens.com.br/webhooks/pagarme',
    rate_limit: 1000,
    timeout: 30,
    retry_attempts: 3,
    headers: { 'Content-Type': 'application/json' },
    auth_type: 'api_key',
    test_endpoint: 'https://api.pagar.me/1/status',
    documentation_url: 'https://docs.pagar.me',
    last_tested: '2025-01-08 14:30:00',
    last_success: '2025-01-08 14:30:00',
    success_rate: 99.2,
    monthly_calls: 2847,
    monthly_limit: 50000,
    created_at: '2024-01-15',
    updated_at: '2025-01-08'
  },
  {
    id: '2',
    name: 'WhatsApp Business API',
    description: 'Envio de mensagens via WhatsApp',
    category: 'communication',
    provider: 'Meta',
    status: 'active',
    endpoint: 'https://graph.facebook.com/v18.0',
    api_key: 'EAAF*********************',
    webhook_url: 'https://api.reserveiviagens.com.br/webhooks/whatsapp',
    rate_limit: 1000,
    timeout: 15,
    retry_attempts: 2,
    headers: { 'Content-Type': 'application/json' },
    auth_type: 'bearer',
    test_endpoint: 'https://graph.facebook.com/v18.0/debug_token',
    documentation_url: 'https://developers.facebook.com/docs/whatsapp',
    last_tested: '2025-01-08 12:15:00',
    last_success: '2025-01-08 12:15:00',
    success_rate: 97.8,
    monthly_calls: 1256,
    monthly_limit: 10000,
    created_at: '2024-02-20',
    updated_at: '2025-01-08'
  },
  {
    id: '3',
    name: 'Google Maps API',
    description: 'Geolocalização e rotas',
    category: 'maps',
    provider: 'Google',
    status: 'active',
    endpoint: 'https://maps.googleapis.com/maps/api',
    api_key: 'AIzaSy*********************',
    rate_limit: 2500,
    timeout: 10,
    retry_attempts: 2,
    headers: {},
    auth_type: 'api_key',
    test_endpoint: 'https://maps.googleapis.com/maps/api/geocode/json?address=test&key=',
    documentation_url: 'https://developers.google.com/maps/documentation',
    last_tested: '2025-01-08 10:00:00',
    last_success: '2025-01-08 10:00:00',
    success_rate: 99.8,
    monthly_calls: 534,
    monthly_limit: 25000,
    created_at: '2024-01-20',
    updated_at: '2025-01-07'
  },
  {
    id: '4',
    name: 'SendGrid',
    description: 'Envio de emails transacionais',
    category: 'communication',
    provider: 'SendGrid',
    status: 'inactive',
    endpoint: 'https://api.sendgrid.com/v3',
    api_key: 'SG.*********************',
    webhook_url: 'https://api.reserveiviagens.com.br/webhooks/sendgrid',
    rate_limit: 10000,
    timeout: 30,
    retry_attempts: 3,
    headers: { 'Content-Type': 'application/json' },
    auth_type: 'bearer',
    test_endpoint: 'https://api.sendgrid.com/v3/user/profile',
    documentation_url: 'https://docs.sendgrid.com',
    last_tested: '2025-01-05 08:00:00',
    last_success: '2025-01-04 15:30:00',
    success_rate: 95.4,
    monthly_calls: 189,
    monthly_limit: 40000,
    created_at: '2024-03-10',
    updated_at: '2025-01-05'
  }
];

const MOCK_API_CALLS: APICall[] = [
  {
    id: '1',
    integration_id: '1',
    method: 'POST',
    endpoint: '/transactions',
    status_code: 200,
    response_time: 245,
    success: true,
    timestamp: '2025-01-08 14:28:15'
  },
  {
    id: '2',
    integration_id: '2',
    method: 'POST',
    endpoint: '/messages',
    status_code: 200,
    response_time: 156,
    success: true,
    timestamp: '2025-01-08 14:25:30'
  },
  {
    id: '3',
    integration_id: '1',
    method: 'GET',
    endpoint: '/transactions/status',
    status_code: 500,
    response_time: 5000,
    success: false,
    error_message: 'Internal server error',
    timestamp: '2025-01-08 14:20:45'
  }
];

export default function IntegracoesAPIs() {
  const [integrations, setIntegrations] = useState<APIIntegration[]>(MOCK_INTEGRATIONS);
  const [apiCalls] = useState<APICall[]>(MOCK_API_CALLS);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<APIIntegration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'testing':
        return 'text-blue-600';
      case 'inactive':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      testing: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'Ativo',
      testing: 'Testando',
      inactive: 'Inativo',
      error: 'Erro'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'maps':
        return <MapPin className="h-4 w-4" />;
      case 'weather':
        return <Cloud className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const testIntegration = async (integration: APIIntegration) => {
    setTestingIntegration(integration.id);

    try {
      // Simular teste da integração
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar status do teste
      setIntegrations(prev => prev.map(int =>
        int.id === integration.id
          ? {
              ...int,
              status: 'active',
              last_tested: new Date().toISOString().replace('T', ' ').substring(0, 19),
              last_success: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : int
      ));

      alert('Teste realizado com sucesso!');
    } catch (error) {
      // Simular erro no teste
      setIntegrations(prev => prev.map(int =>
        int.id === integration.id
          ? {
              ...int,
              status: 'error',
              last_tested: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : int
      ));

      alert('Erro no teste da integração.');
    } finally {
      setTestingIntegration(null);
    }
  };

  const toggleIntegrationStatus = (integrationId: string) => {
    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? {
            ...int,
            status: int.status === 'active' ? 'inactive' : 'active'
          }
        : int
    ));
  };

  const handleCreateIntegration = () => {
    const newIntegration: APIIntegration = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: 'other',
      provider: '',
      status: 'inactive',
      endpoint: '',
      api_key: '',
      rate_limit: 1000,
      timeout: 30,
      retry_attempts: 3,
      headers: {},
      auth_type: 'api_key',
      last_tested: '',
      last_success: '',
      success_rate: 0,
      monthly_calls: 0,
      monthly_limit: 10000,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    setSelectedIntegration(newIntegration);
    setIsEditing(true);
  };

  const handleSaveIntegration = () => {
    if (!selectedIntegration) return;

    if (selectedIntegration.id && integrations.find(i => i.id === selectedIntegration.id)) {
      setIntegrations(prev => prev.map(i =>
        i.id === selectedIntegration.id ? selectedIntegration : i
      ));
    } else {
      setIntegrations(prev => [...prev, { ...selectedIntegration, id: Date.now().toString() }]);
    }

    setIsEditing(false);
    setSelectedIntegration(null);
    alert('Integração salva com sucesso!');
  };

  const handleDeleteIntegration = (integrationId: string) => {
    if (confirm('Tem certeza que deseja deletar esta integração?')) {
      setIntegrations(prev => prev.filter(i => i.id !== integrationId));
      if (selectedIntegration?.id === integrationId) {
        setSelectedIntegration(null);
      }
    }
  };

  const updateIntegrationField = (field: string, value: any) => {
    if (!selectedIntegration) return;
    setSelectedIntegration({ ...selectedIntegration, [field]: value });
  };

  const addHeader = (key: string, value: string) => {
    if (!selectedIntegration || !key.trim() || !value.trim()) return;

    setSelectedIntegration({
      ...selectedIntegration,
      headers: { ...selectedIntegration.headers, [key]: value }
    });
  };

  const removeHeader = (key: string) => {
    if (!selectedIntegration) return;

    const { [key]: removed, ...rest } = selectedIntegration.headers;
    setSelectedIntegration({ ...selectedIntegration, headers: rest });
  };

  const getUsagePercentage = (calls: number, limit: number) => {
    return Math.min(Math.round((calls / limit) * 100), 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔌 Integrações de APIs RSV 360
            </h1>
            <p className="text-gray-600">
              Gerencie todas as integrações externas do sistema
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button onClick={handleCreateIntegration} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Integrações</p>
                  <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Integrações Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.filter(i => i.status === 'active').length}
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
                  <p className="text-gray-600 text-sm">Chamadas este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.reduce((acc, i) => acc + i.monthly_calls, 0).toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(integrations.reduce((acc, i) => acc + i.success_rate, 0) / integrations.length)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Globe className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Settings className="h-4 w-4 mr-2" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Activity className="h-4 w-4 mr-2" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Clock className="h-4 w-4 mr-2" />
              Logs de API
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status das Integrações */}
              <Card>
                <CardHeader>
                  <CardTitle>Status das Integrações</CardTitle>
                  <CardDescription>Resumo do status de todas as integrações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrations.map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(integration.category)}
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-gray-600">{integration.provider}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusBadge(integration.status)}
                          <span className={`text-sm ${getStatusColor(integration.status)}`}>
                            {integration.success_rate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Uso Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle>Uso Mensal de APIs</CardTitle>
                  <CardDescription>Consumo de chamadas por integração</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrations.map(integration => {
                      const usagePercent = getUsagePercentage(integration.monthly_calls, integration.monthly_limit);
                      return (
                        <div key={integration.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{integration.name}</span>
                            <span className="text-sm text-gray-600">
                              {integration.monthly_calls.toLocaleString()} / {integration.monthly_limit.toLocaleString()}
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

          {/* Gestão de Integrações */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Integrações */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle>Integrações Configuradas</CardTitle>

                      <div className="flex gap-2">
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas Categorias</SelectItem>
                            <SelectItem value="payment">Pagamentos</SelectItem>
                            <SelectItem value="communication">Comunicação</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                            <SelectItem value="maps">Mapas</SelectItem>
                            <SelectItem value="weather">Clima</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="other">Outras</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                            <SelectItem value="error">Erro</SelectItem>
                            <SelectItem value="testing">Testando</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredIntegrations.map(integration => (
                        <div
                          key={integration.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedIntegration?.id === integration.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(integration.category)}
                              <div>
                                <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                                <p className="text-sm text-gray-600">{integration.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline">{integration.provider}</Badge>
                                  {getStatusBadge(integration.status)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testIntegration(integration);
                                }}
                                disabled={testingIntegration === integration.id}
                              >
                                {testingIntegration === integration.id ? (
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
                                  toggleIntegrationStatus(integration.id);
                                }}
                              >
                                {integration.status === 'active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIntegration(integration);
                                  setIsEditing(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteIntegration(integration.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Sucesso:</span> {integration.success_rate}%
                            </div>
                            <div>
                              <span className="font-medium">Chamadas:</span> {integration.monthly_calls.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Último teste:</span> {integration.last_tested || 'Nunca'}
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredIntegrations.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nenhuma integração encontrada com os filtros aplicados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes/Edição da Integração */}
              <div className="lg:col-span-1">
                {selectedIntegration ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {isEditing ? 'Editar Integração' : 'Detalhes da Integração'}
                        </CardTitle>
                        {!isEditing && (
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        // Formulário de Edição
                        <>
                          <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input
                              id="name"
                              value={selectedIntegration.name}
                              onChange={(e) => updateIntegrationField('name', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              value={selectedIntegration.description}
                              onChange={(e) => updateIntegrationField('description', e.target.value)}
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="category">Categoria</Label>
                              <Select value={selectedIntegration.category} onValueChange={(value) => updateIntegrationField('category', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="payment">Pagamentos</SelectItem>
                                  <SelectItem value="communication">Comunicação</SelectItem>
                                  <SelectItem value="analytics">Analytics</SelectItem>
                                  <SelectItem value="maps">Mapas</SelectItem>
                                  <SelectItem value="weather">Clima</SelectItem>
                                  <SelectItem value="social">Social</SelectItem>
                                  <SelectItem value="other">Outras</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="provider">Provedor</Label>
                              <Input
                                id="provider"
                                value={selectedIntegration.provider}
                                onChange={(e) => updateIntegrationField('provider', e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="endpoint">Endpoint Base</Label>
                            <Input
                              id="endpoint"
                              value={selectedIntegration.endpoint}
                              onChange={(e) => updateIntegrationField('endpoint', e.target.value)}
                              placeholder="https://api.exemplo.com"
                            />
                          </div>

                          <div>
                            <Label htmlFor="auth_type">Tipo de Autenticação</Label>
                            <Select value={selectedIntegration.auth_type} onValueChange={(value) => updateIntegrationField('auth_type', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="api_key">API Key</SelectItem>
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                                <SelectItem value="basic">Basic Auth</SelectItem>
                                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="api_key">API Key/Token</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="api_key"
                                type={showSecrets ? 'text' : 'password'}
                                value={selectedIntegration.api_key}
                                onChange={(e) => updateIntegrationField('api_key', e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                onClick={() => setShowSecrets(!showSecrets)}
                              >
                                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>

                          {selectedIntegration.secret_key !== undefined && (
                            <div>
                              <Label htmlFor="secret_key">Secret Key (opcional)</Label>
                              <Input
                                id="secret_key"
                                type={showSecrets ? 'text' : 'password'}
                                value={selectedIntegration.secret_key || ''}
                                onChange={(e) => updateIntegrationField('secret_key', e.target.value)}
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="timeout">Timeout (s)</Label>
                              <Input
                                id="timeout"
                                type="number"
                                min="5"
                                max="300"
                                value={selectedIntegration.timeout}
                                onChange={(e) => updateIntegrationField('timeout', parseInt(e.target.value))}
                              />
                            </div>

                            <div>
                              <Label htmlFor="retry_attempts">Tentativas</Label>
                              <Input
                                id="retry_attempts"
                                type="number"
                                min="0"
                                max="5"
                                value={selectedIntegration.retry_attempts}
                                onChange={(e) => updateIntegrationField('retry_attempts', parseInt(e.target.value))}
                              />
                            </div>

                            <div>
                              <Label htmlFor="rate_limit">Rate Limit</Label>
                              <Input
                                id="rate_limit"
                                type="number"
                                min="1"
                                value={selectedIntegration.rate_limit}
                                onChange={(e) => updateIntegrationField('rate_limit', parseInt(e.target.value))}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Headers Customizados</Label>
                            <div className="space-y-2 mt-2">
                              {Object.entries(selectedIntegration.headers).map(([key, value]) => (
                                <div key={key} className="flex space-x-2">
                                  <Input value={key} readOnly className="flex-1" />
                                  <Input value={value} readOnly className="flex-1" />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeHeader(key)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              <div className="flex space-x-2">
                                <Input placeholder="Header" id="new-header-key" />
                                <Input placeholder="Valor" id="new-header-value" />
                                <Button
                                  onClick={() => {
                                    const keyInput = document.getElementById('new-header-key') as HTMLInputElement;
                                    const valueInput = document.getElementById('new-header-value') as HTMLInputElement;
                                    addHeader(keyInput.value, valueInput.value);
                                    keyInput.value = '';
                                    valueInput.value = '';
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button onClick={handleSaveIntegration} className="flex-1">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                if (!selectedIntegration.id) {
                                  setSelectedIntegration(null);
                                }
                              }}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        // Visualização de Detalhes
                        <>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedIntegration.endpoint}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Key className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedIntegration.auth_type}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Timeout: {selectedIntegration.timeout}s</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Tentativas: {selectedIntegration.retry_attempts}</span>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h5 className="font-semibold mb-2">Estatísticas</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Taxa de Sucesso:</span>
                                <span className="font-medium">{selectedIntegration.success_rate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Chamadas este Mês:</span>
                                <span className="font-medium">{selectedIntegration.monthly_calls.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Limite Mensal:</span>
                                <span className="font-medium">{selectedIntegration.monthly_limit.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Último Sucesso:</span>
                                <span className="font-medium">{selectedIntegration.last_success || 'Nunca'}</span>
                              </div>
                            </div>
                          </div>

                          {selectedIntegration.documentation_url && (
                            <div className="border-t pt-4">
                              <Button
                                variant="outline"
                                onClick={() => window.open(selectedIntegration.documentation_url, '_blank')}
                                className="w-full"
                              >
                                <Globe className="h-4 w-4 mr-2" />
                                Ver Documentação
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Selecione uma integração para ver os detalhes
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance das APIs</CardTitle>
                  <CardDescription>Tempo de resposta médio por integração</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrations.map(integration => {
                      const avgResponseTime = Math.floor(Math.random() * 500) + 100; // Mock data
                      return (
                        <div key={integration.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(integration.category)}
                            <span className="font-medium">{integration.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{avgResponseTime}ms</span>
                            <div className={`w-2 h-2 rounded-full ${
                              avgResponseTime < 200 ? 'bg-green-500' :
                              avgResponseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Alertas e Notificações */}
              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Problemas</CardTitle>
                  <CardDescription>Status de saúde das integrações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">SendGrid - Taxa de erro alta</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        15% das chamadas falharam nas últimas 2 horas
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pagar.me - Latência alta</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Tempo de resposta acima de 2s detectado
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Todas as outras integrações OK</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        WhatsApp API e Google Maps funcionando normalmente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs de API */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Chamadas de API</CardTitle>
                <CardDescription>Histórico detalhado das chamadas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiCalls.map(call => {
                    const integration = integrations.find(i => i.id === call.integration_id);
                    return (
                      <div key={call.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={call.success ? 'default' : 'destructive'}>
                              {call.method}
                            </Badge>
                            <span className="font-medium">{integration?.name}</span>
                            <span className="text-sm text-gray-600">{call.endpoint}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge variant={call.success ? 'default' : 'destructive'}>
                              {call.status_code}
                            </Badge>
                            <span className="text-sm text-gray-600">{call.response_time}ms</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{call.timestamp}</span>
                          {call.error_message && (
                            <span className="text-red-600">{call.error_message}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {apiCalls.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>Nenhuma chamada de API registrada ainda.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rodapé com informações */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <div className="text-blue-800">
                <p className="font-medium">Integrações de APIs:</p>
                <p className="text-sm">
                  Configure e monitore todas as integrações externas do sistema.
                  Mantenha as chaves de API seguras e teste regularmente as conexões.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
