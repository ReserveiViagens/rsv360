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
import {
  Webhook,
  Send,
  Settings,
  Globe,
  Clock,
  Shield,
  Activity,
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
  Filter,
  Search,
  BarChart3,
  MessageSquare,
  Key,
  Lock,
  Zap,
  Network,
  Info
} from 'lucide-react';

interface WebhookEndpoint {
  id: string;
  name: string;
  description: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  status: 'active' | 'inactive' | 'error' | 'testing';
  secret_key: string;
  timeout: number;
  retry_attempts: number;
  retry_delay: number;
  headers: Record<string, string>;
  auth_type: 'none' | 'basic' | 'bearer' | 'signature';
  auth_username?: string;
  auth_password?: string;
  auth_token?: string;
  signature_algorithm?: 'sha256' | 'sha1' | 'md5';
  success_codes: number[];
  failure_threshold: number;
  last_triggered: string;
  last_success: string;
  success_count: number;
  failure_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  category: 'booking' | 'payment' | 'customer' | 'system' | 'user';
  payload_schema: Record<string, any>;
  enabled: boolean;
}

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  status: 'success' | 'failed' | 'pending' | 'retry';
  status_code?: number;
  response_time: number;
  payload: Record<string, any>;
  response_body?: string;
  error_message?: string;
  attempt_count: number;
  created_at: string;
  delivered_at?: string;
}

const AVAILABLE_EVENTS: WebhookEvent[] = [
  {
    id: 'booking.created',
    name: 'Reserva Criada',
    description: 'Disparado quando uma nova reserva é criada',
    category: 'booking',
    payload_schema: {
      booking_id: 'string',
      customer_id: 'string',
      amount: 'number',
      check_in: 'date',
      check_out: 'date'
    },
    enabled: true
  },
  {
    id: 'booking.updated',
    name: 'Reserva Atualizada',
    description: 'Disparado quando uma reserva é modificada',
    category: 'booking',
    payload_schema: {
      booking_id: 'string',
      changes: 'object'
    },
    enabled: true
  },
  {
    id: 'booking.cancelled',
    name: 'Reserva Cancelada',
    description: 'Disparado quando uma reserva é cancelada',
    category: 'booking',
    payload_schema: {
      booking_id: 'string',
      reason: 'string',
      refund_amount: 'number'
    },
    enabled: true
  },
  {
    id: 'payment.received',
    name: 'Pagamento Recebido',
    description: 'Disparado quando um pagamento é confirmado',
    category: 'payment',
    payload_schema: {
      payment_id: 'string',
      booking_id: 'string',
      amount: 'number',
      method: 'string'
    },
    enabled: true
  },
  {
    id: 'payment.failed',
    name: 'Pagamento Falhou',
    description: 'Disparado quando um pagamento falha',
    category: 'payment',
    payload_schema: {
      payment_id: 'string',
      error_code: 'string',
      error_message: 'string'
    },
    enabled: true
  },
  {
    id: 'customer.created',
    name: 'Cliente Criado',
    description: 'Disparado quando um novo cliente é cadastrado',
    category: 'customer',
    payload_schema: {
      customer_id: 'string',
      email: 'string',
      name: 'string'
    },
    enabled: false
  },
  {
    id: 'customer.updated',
    name: 'Cliente Atualizado',
    description: 'Disparado quando dados do cliente são alterados',
    category: 'customer',
    payload_schema: {
      customer_id: 'string',
      changes: 'object'
    },
    enabled: false
  }
];

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'Sistema de Faturamento',
    description: 'Webhook para sincronizar dados de faturamento',
    url: 'https://faturamento.exemplo.com/api/webhooks/rsv',
    method: 'POST',
    events: ['booking.created', 'payment.received'],
    status: 'active',
    secret_key: 'whsec_1234567890abcdef',
    timeout: 30,
    retry_attempts: 3,
    retry_delay: 60,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'RSV-360-Webhook/1.0'
    },
    auth_type: 'signature',
    signature_algorithm: 'sha256',
    success_codes: [200, 201, 202],
    failure_threshold: 5,
    last_triggered: '2025-01-08 14:30:00',
    last_success: '2025-01-08 14:30:00',
    success_count: 1247,
    failure_count: 23,
    success_rate: 98.2,
    created_at: '2024-01-15',
    updated_at: '2025-01-08'
  },
  {
    id: '2',
    name: 'CRM Externo',
    description: 'Sincronização com sistema CRM da empresa',
    url: 'https://crm.reserveiviagens.com.br/webhooks/customers',
    method: 'POST',
    events: ['customer.created', 'customer.updated'],
    status: 'active',
    secret_key: 'secret_abc123',
    timeout: 15,
    retry_attempts: 2,
    retry_delay: 30,
    headers: {
      'Content-Type': 'application/json'
    },
    auth_type: 'bearer',
    auth_token: 'bearer_token_xyz789',
    success_codes: [200],
    failure_threshold: 3,
    last_triggered: '2025-01-08 12:15:00',
    last_success: '2025-01-08 12:15:00',
    success_count: 892,
    failure_count: 8,
    success_rate: 99.1,
    created_at: '2024-02-20',
    updated_at: '2025-01-08'
  },
  {
    id: '3',
    name: 'Notificações Slack',
    description: 'Notificações de eventos importantes no Slack',
    url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    method: 'POST',
    events: ['booking.cancelled', 'payment.failed'],
    status: 'active',
    secret_key: '',
    timeout: 10,
    retry_attempts: 1,
    retry_delay: 0,
    headers: {
      'Content-Type': 'application/json'
    },
    auth_type: 'none',
    success_codes: [200],
    failure_threshold: 10,
    last_triggered: '2025-01-08 09:45:00',
    last_success: '2025-01-08 09:45:00',
    success_count: 156,
    failure_count: 2,
    success_rate: 98.7,
    created_at: '2024-03-01',
    updated_at: '2025-01-07'
  }
];

const MOCK_DELIVERIES: WebhookDelivery[] = [
  {
    id: '1',
    webhook_id: '1',
    event_type: 'booking.created',
    status: 'success',
    status_code: 200,
    response_time: 245,
    payload: {
      booking_id: 'book_123',
      customer_id: 'cust_456',
      amount: 1500.00,
      check_in: '2025-02-15',
      check_out: '2025-02-18'
    },
    response_body: '{"status": "received", "id": "webhook_789"}',
    attempt_count: 1,
    created_at: '2025-01-08 14:30:00',
    delivered_at: '2025-01-08 14:30:00'
  },
  {
    id: '2',
    webhook_id: '2',
    event_type: 'customer.created',
    status: 'failed',
    status_code: 500,
    response_time: 5000,
    payload: {
      customer_id: 'cust_789',
      email: 'cliente@exemplo.com',
      name: 'João Silva'
    },
    error_message: 'Internal server error',
    attempt_count: 3,
    created_at: '2025-01-08 13:15:00'
  },
  {
    id: '3',
    webhook_id: '3',
    event_type: 'payment.failed',
    status: 'success',
    status_code: 200,
    response_time: 156,
    payload: {
      payment_id: 'pay_456',
      error_code: 'insufficient_funds',
      error_message: 'Fundos insuficientes'
    },
    response_body: 'ok',
    attempt_count: 1,
    created_at: '2025-01-08 11:20:00',
    delivered_at: '2025-01-08 11:20:00'
  }
];

export default function IntegracoesWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(MOCK_WEBHOOKS);
  const [events] = useState<WebhookEvent[]>(AVAILABLE_EVENTS);
  const [deliveries] = useState<WebhookDelivery[]>(MOCK_DELIVERIES);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesStatus = filterStatus === 'all' || webhook.status === filterStatus;
    const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.url.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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

  const getDeliveryStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      retry: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      success: 'Sucesso',
      failed: 'Falhou',
      pending: 'Pendente',
      retry: 'Tentando'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💳';
      case 'customer':
        return '👤';
      case 'system':
        return '⚙️';
      case 'user':
        return '🔐';
      default:
        return '📝';
    }
  };

  const testWebhook = async (webhook: WebhookEndpoint) => {
    setTestingWebhook(webhook.id);

    try {
      // Simular teste do webhook
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar status do teste
      setWebhooks(prev => prev.map(wh =>
        wh.id === webhook.id
          ? {
              ...wh,
              status: 'active',
              last_triggered: new Date().toISOString().replace('T', ' ').substring(0, 19),
              last_success: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : wh
      ));

      alert('Teste do webhook realizado com sucesso!');
    } catch (error) {
      setWebhooks(prev => prev.map(wh =>
        wh.id === webhook.id
          ? {
              ...wh,
              status: 'error',
              last_triggered: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          : wh
      ));

      alert('Erro no teste do webhook.');
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleWebhookStatus = (webhookId: string) => {
    setWebhooks(prev => prev.map(wh =>
      wh.id === webhookId
        ? {
            ...wh,
            status: wh.status === 'active' ? 'inactive' : 'active'
          }
        : wh
    ));
  };

  const handleCreateWebhook = () => {
    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: '',
      description: '',
      url: '',
      method: 'POST',
      events: [],
      status: 'inactive',
      secret_key: '',
      timeout: 30,
      retry_attempts: 3,
      retry_delay: 60,
      headers: { 'Content-Type': 'application/json' },
      auth_type: 'none',
      success_codes: [200, 201, 202],
      failure_threshold: 5,
      last_triggered: '',
      last_success: '',
      success_count: 0,
      failure_count: 0,
      success_rate: 0,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    setSelectedWebhook(newWebhook);
    setIsEditing(true);
  };

  const handleSaveWebhook = () => {
    if (!selectedWebhook) return;

    if (selectedWebhook.id && webhooks.find(w => w.id === selectedWebhook.id)) {
      setWebhooks(prev => prev.map(w =>
        w.id === selectedWebhook.id ? selectedWebhook : w
      ));
    } else {
      setWebhooks(prev => [...prev, { ...selectedWebhook, id: Date.now().toString() }]);
    }

    setIsEditing(false);
    setSelectedWebhook(null);
    alert('Webhook salvo com sucesso!');
  };

  const handleDeleteWebhook = (webhookId: string) => {
    if (confirm('Tem certeza que deseja deletar este webhook?')) {
      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      if (selectedWebhook?.id === webhookId) {
        setSelectedWebhook(null);
      }
    }
  };

  const updateWebhookField = (field: string, value: any) => {
    if (!selectedWebhook) return;
    setSelectedWebhook({ ...selectedWebhook, [field]: value });
  };

  const toggleEvent = (eventId: string) => {
    if (!selectedWebhook) return;

    const events = selectedWebhook.events.includes(eventId)
      ? selectedWebhook.events.filter(e => e !== eventId)
      : [...selectedWebhook.events, eventId];

    setSelectedWebhook({ ...selectedWebhook, events });
  };

  const addHeader = (key: string, value: string) => {
    if (!selectedWebhook || !key.trim() || !value.trim()) return;

    setSelectedWebhook({
      ...selectedWebhook,
      headers: { ...selectedWebhook.headers, [key]: value }
    });
  };

  const removeHeader = (key: string) => {
    if (!selectedWebhook) return;

    const { [key]: removed, ...rest } = selectedWebhook.headers;
    setSelectedWebhook({ ...selectedWebhook, headers: rest });
  };

  const generateSecretKey = () => {
    const randomKey = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    updateWebhookField('secret_key', randomKey);
  };

  const retryDelivery = async (deliveryId: string) => {
    alert(`Tentando reenviar delivery ${deliveryId}...`);
    // Implementar lógica de retry
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔗 Webhooks RSV 360
            </h1>
            <p className="text-gray-600">
              Configure e monitore webhooks para integração em tempo real
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button onClick={handleCreateWebhook} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Webhooks</p>
                  <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
                </div>
                <Webhook className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Webhooks Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {webhooks.filter(w => w.status === 'active').length}
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
                  <p className="text-gray-600 text-sm">Entregas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deliveries.length}
                  </p>
                </div>
                <Send className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(webhooks.reduce((acc, w) => acc + w.success_rate, 0) / webhooks.length)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="events">
              <Zap className="h-4 w-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="deliveries">
              <Send className="h-4 w-4 mr-2" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="testing">
              <TestTube className="h-4 w-4 mr-2" />
              Testes
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status dos Webhooks */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Webhooks</CardTitle>
                  <CardDescription>Resumo do status de todos os webhooks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhooks.map(webhook => (
                      <div key={webhook.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <h4 className="font-medium">{webhook.name}</h4>
                          <p className="text-sm text-gray-600">{webhook.url}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(webhook.status)}
                            <Badge variant="outline">{webhook.events.length} eventos</Badge>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-sm font-medium ${getStatusColor(webhook.status)}`}>
                            {webhook.success_rate}%
                          </p>
                          <p className="text-xs text-gray-600">
                            {webhook.success_count} sucessos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Atividade Recente */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas entregas de webhook</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deliveries.slice(0, 5).map(delivery => {
                      const webhook = webhooks.find(w => w.id === delivery.webhook_id);
                      return (
                        <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{webhook?.name}</span>
                              <Badge variant="outline">{delivery.event_type}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">{delivery.created_at}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getDeliveryStatusBadge(delivery.status)}
                            {delivery.status_code && (
                              <Badge variant="outline">{delivery.status_code}</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestão de Webhooks */}
          <TabsContent value="webhooks">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Webhooks */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle>Webhooks Configurados</CardTitle>

                      <div className="flex gap-2">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar webhooks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48"
                          />
                        </div>

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
                      {filteredWebhooks.map(webhook => (
                        <div
                          key={webhook.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedWebhook?.id === webhook.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedWebhook(webhook)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{webhook.name}</h4>
                              <p className="text-sm text-gray-600">{webhook.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{webhook.url}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                {getStatusBadge(webhook.status)}
                                <Badge variant="outline">{webhook.method}</Badge>
                                <Badge variant="outline">{webhook.events.length} eventos</Badge>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testWebhook(webhook);
                                }}
                                disabled={testingWebhook === webhook.id}
                              >
                                {testingWebhook === webhook.id ? (
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
                                  toggleWebhookStatus(webhook.id);
                                }}
                              >
                                {webhook.status === 'active' ? (
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
                                  setSelectedWebhook(webhook);
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
                                  handleDeleteWebhook(webhook.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Sucesso:</span> {webhook.success_rate}%
                            </div>
                            <div>
                              <span className="font-medium">Último sucesso:</span> {webhook.last_success || 'Nunca'}
                            </div>
                            <div>
                              <span className="font-medium">Timeout:</span> {webhook.timeout}s
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredWebhooks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum webhook encontrado com os filtros aplicados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes/Edição do Webhook */}
              <div className="lg:col-span-1">
                {selectedWebhook ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {isEditing ? 'Editar Webhook' : 'Detalhes do Webhook'}
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
                              value={selectedWebhook.name}
                              onChange={(e) => updateWebhookField('name', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              value={selectedWebhook.description}
                              onChange={(e) => updateWebhookField('description', e.target.value)}
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="url">URL do Webhook</Label>
                            <Input
                              id="url"
                              value={selectedWebhook.url}
                              onChange={(e) => updateWebhookField('url', e.target.value)}
                              placeholder="https://exemplo.com/webhook"
                            />
                          </div>

                          <div>
                            <Label htmlFor="method">Método HTTP</Label>
                            <Select value={selectedWebhook.method} onValueChange={(value) => updateWebhookField('method', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Eventos</Label>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {events.map(event => (
                                <div key={event.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={event.id}
                                    checked={selectedWebhook.events.includes(event.id)}
                                    onChange={() => toggleEvent(event.id)}
                                    className="rounded"
                                  />
                                  <Label htmlFor={event.id} className="text-sm flex-1">
                                    {getCategoryIcon(event.category)} {event.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="auth_type">Autenticação</Label>
                            <Select value={selectedWebhook.auth_type} onValueChange={(value) => updateWebhookField('auth_type', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                <SelectItem value="basic">Basic Auth</SelectItem>
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                                <SelectItem value="signature">Assinatura</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedWebhook.auth_type === 'signature' && (
                            <div>
                              <Label htmlFor="secret_key">Secret Key</Label>
                              <div className="flex space-x-2">
                                <Input
                                  id="secret_key"
                                  type={showSecrets ? 'text' : 'password'}
                                  value={selectedWebhook.secret_key}
                                  onChange={(e) => updateWebhookField('secret_key', e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  onClick={generateSecretKey}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowSecrets(!showSecrets)}
                                >
                                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="timeout">Timeout (s)</Label>
                              <Input
                                id="timeout"
                                type="number"
                                min="5"
                                max="300"
                                value={selectedWebhook.timeout}
                                onChange={(e) => updateWebhookField('timeout', parseInt(e.target.value))}
                              />
                            </div>

                            <div>
                              <Label htmlFor="retry_attempts">Tentativas</Label>
                              <Input
                                id="retry_attempts"
                                type="number"
                                min="0"
                                max="5"
                                value={selectedWebhook.retry_attempts}
                                onChange={(e) => updateWebhookField('retry_attempts', parseInt(e.target.value))}
                              />
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button onClick={handleSaveWebhook} className="flex-1">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                if (!selectedWebhook.id) {
                                  setSelectedWebhook(null);
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
                              <span className="text-sm">{selectedWebhook.url}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Send className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedWebhook.method}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Timeout: {selectedWebhook.timeout}s</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedWebhook.auth_type}</span>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h5 className="font-semibold mb-2">Eventos ({selectedWebhook.events.length})</h5>
                            <div className="space-y-1">
                              {selectedWebhook.events.map(eventId => {
                                const event = events.find(e => e.id === eventId);
                                return event ? (
                                  <Badge key={eventId} variant="outline" className="mr-1 mb-1">
                                    {getCategoryIcon(event.category)} {event.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h5 className="font-semibold mb-2">Estatísticas</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Taxa de Sucesso:</span>
                                <span className="font-medium">{selectedWebhook.success_rate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sucessos:</span>
                                <span className="font-medium">{selectedWebhook.success_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Falhas:</span>
                                <span className="font-medium">{selectedWebhook.failure_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Último Sucesso:</span>
                                <span className="font-medium">{selectedWebhook.last_success || 'Nunca'}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Selecione um webhook para ver os detalhes
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Eventos Disponíveis */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Disponíveis</CardTitle>
                <CardDescription>
                  Lista de todos os eventos que podem disparar webhooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(
                    events.reduce((acc, event) => {
                      if (!acc[event.category]) acc[event.category] = [];
                      acc[event.category].push(event);
                      return acc;
                    }, {} as Record<string, WebhookEvent[]>)
                  ).map(([category, categoryEvents]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 capitalize">
                        {getCategoryIcon(category)} {category}
                      </h3>

                      <div className="space-y-2">
                        {categoryEvents.map(event => (
                          <div key={event.id} className="p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{event.name}</h4>
                              <Badge variant={event.enabled ? 'default' : 'secondary'}>
                                {event.enabled ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{event.description}</p>
                            <code className="text-xs bg-gray-200 px-1 rounded mt-1 block">
                              {event.id}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Log de Entregas */}
          <TabsContent value="deliveries">
            <Card>
              <CardHeader>
                <CardTitle>Log de Entregas</CardTitle>
                <CardDescription>Histórico detalhado de todas as entregas de webhook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveries.map(delivery => {
                    const webhook = webhooks.find(w => w.id === delivery.webhook_id);
                    return (
                      <div key={delivery.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{webhook?.name}</h4>
                            <Badge variant="outline">{delivery.event_type}</Badge>
                            {getDeliveryStatusBadge(delivery.status)}
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {delivery.status_code && (
                              <Badge variant="outline">{delivery.status_code}</Badge>
                            )}
                            <span>{delivery.response_time}ms</span>
                            <span>Tentativa {delivery.attempt_count}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium mb-1">Payload:</h5>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(delivery.payload, null, 2)}
                            </pre>
                          </div>

                          {delivery.response_body && (
                            <div>
                              <h5 className="font-medium mb-1">Resposta:</h5>
                              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                {delivery.response_body}
                              </pre>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                          <span>Criado: {delivery.created_at}</span>
                          {delivery.delivered_at ? (
                            <span>Entregue: {delivery.delivered_at}</span>
                          ) : delivery.status === 'failed' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryDelivery(delivery.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Tentar Novamente
                            </Button>
                          ) : null}
                        </div>

                        {delivery.error_message && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <span className="text-red-800 text-sm">{delivery.error_message}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {deliveries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>Nenhuma entrega de webhook registrada ainda.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testes */}
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>Teste de Webhooks</CardTitle>
                <CardDescription>
                  Teste seus webhooks com payloads de exemplo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="test_webhook">Selecionar Webhook</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um webhook para testar" />
                      </SelectTrigger>
                      <SelectContent>
                        {webhooks.map(webhook => (
                          <SelectItem key={webhook.id} value={webhook.id}>
                            {webhook.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="test_event">Tipo de Evento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {getCategoryIcon(event.category)} {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="test_payload">Payload de Teste</Label>
                    <Textarea
                      id="test_payload"
                      rows={10}
                      placeholder="Cole aqui o JSON de teste..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <TestTube className="h-4 w-4 mr-2" />
                      Enviar Teste
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Gerar Payload Exemplo
                    </Button>
                  </div>
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
                <p className="font-medium">Webhooks:</p>
                <p className="text-sm">
                  Configure webhooks para integração em tempo real com sistemas externos.
                  Use assinaturas para garantir a autenticidade das requisições.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
