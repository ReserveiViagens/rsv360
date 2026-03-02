'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Code,
  Key,
  Globe,
  Zap,
  Shield,
  BookOpen,
  Eye,
  Copy,
  Download,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  Webhook,
  Terminal,
  FileText,
  Link,
  ExternalLink,
  PlayCircle,
  RefreshCw
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'revoked';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rateLimit: number;
  lastUsed: string;
  createdAt: string;
  requests30d: number;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered: string;
  successRate: number;
}

interface ApiStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    avgTime: number;
  }>;
}

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'rsv_pk_live_1234567890abcdef',
    status: 'active',
    tier: 'gold',
    rateLimit: 120,
    lastUsed: '2025-01-10T10:30:00Z',
    createdAt: '2024-06-15T14:20:00Z',
    requests30d: 15420
  },
  {
    id: '2',
    name: 'Development API',
    key: 'rsv_pk_test_abcdef1234567890',
    status: 'active',
    tier: 'silver',
    rateLimit: 60,
    lastUsed: '2025-01-09T16:45:00Z',
    createdAt: '2024-08-22T09:15:00Z',
    requests30d: 3280
  }
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: '1',
    url: 'https://api.meusite.com/webhook/rsv360',
    events: ['booking_created', 'booking_cancelled'],
    status: 'active',
    lastTriggered: '2025-01-10T09:15:00Z',
    successRate: 98.5
  },
  {
    id: '2',
    url: 'https://webhook.site/unique-id',
    events: ['payment_completed'],
    status: 'inactive',
    lastTriggered: '2025-01-08T14:30:00Z',
    successRate: 100
  }
];

const MOCK_STATS: ApiStats = {
  totalRequests: 18700,
  successRate: 99.2,
  avgResponseTime: 245,
  errorRate: 0.8,
  topEndpoints: [
    { endpoint: '/hotels/search', requests: 8500, avgTime: 180 },
    { endpoint: '/hotels/{id}', requests: 4200, avgTime: 120 },
    { endpoint: '/bookings', requests: 3800, avgTime: 350 },
    { endpoint: '/destinations', requests: 2200, avgTime: 95 }
  ]
};

const API_DOCUMENTATION = {
  baseUrl: 'https://api.rsv360.com/v1/public',
  authentication: 'API Key via X-API-Key header',
  rateLimits: {
    bronze: '30 requests/minute',
    silver: '60 requests/minute',
    gold: '120 requests/minute',
    platinum: '300 requests/minute',
    diamond: '600 requests/minute'
  },
  endpoints: [
    {
      method: 'GET',
      path: '/hotels',
      description: 'Lista hotéis com filtros e paginação',
      params: ['page', 'limit', 'location', 'category', 'min_price', 'max_price']
    },
    {
      method: 'GET',
      path: '/hotels/search',
      description: 'Busca avançada de hotéis',
      params: ['q', 'check_in', 'check_out', 'guests', 'radius']
    },
    {
      method: 'GET',
      path: '/hotels/{id}',
      description: 'Detalhes de um hotel específico',
      params: ['include']
    },
    {
      method: 'GET',
      path: '/hotels/{id}/availability',
      description: 'Verifica disponibilidade de quartos',
      params: ['check_in', 'check_out', 'guests']
    },
    {
      method: 'POST',
      path: '/bookings',
      description: 'Cria uma nova reserva',
      params: []
    },
    {
      method: 'GET',
      path: '/bookings/{id}',
      description: 'Detalhes de uma reserva',
      params: []
    },
    {
      method: 'DELETE',
      path: '/bookings/{id}',
      description: 'Cancela uma reserva',
      params: []
    }
  ]
};

export default function ApiPublica() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(MOCK_WEBHOOKS);
  const [stats, setStats] = useState<ApiStats>(MOCK_STATS);
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_DOCUMENTATION.endpoints[0]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testResponse, setTestResponse] = useState<any>(null);

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-blue-100 text-blue-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-gray-100 text-gray-800',
      diamond: 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Toast notification would go here
  };

  const generateApiKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `rsv_pk_${Math.random().toString(36).substr(2, 20)}`,
      status: 'active',
      tier: 'bronze',
      rateLimit: 30,
      lastUsed: '',
      createdAt: new Date().toISOString(),
      requests30d: 0
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(apiKeys.map(key =>
      key.id === keyId ? { ...key, status: 'revoked' as const } : key
    ));
  };

  const createWebhook = () => {
    if (!newWebhookUrl.trim() || selectedEvents.length === 0) return;

    const newWebhook: WebhookConfig = {
      id: Date.now().toString(),
      url: newWebhookUrl,
      events: selectedEvents,
      status: 'active',
      lastTriggered: '',
      successRate: 0
    };

    setWebhooks([...webhooks, newWebhook]);
    setNewWebhookUrl('');
    setSelectedEvents([]);
  };

  const testApiEndpoint = async () => {
    // Simular chamada à API
    setTestResponse({ loading: true });

    setTimeout(() => {
      setTestResponse({
        status: 200,
        data: {
          data: [
            {
              id: 'hotel_123',
              name: 'Hotel Exemplo',
              location: 'Rio de Janeiro, RJ',
              rating: 4.5,
              min_price: 250
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            total_pages: 1
          }
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Rate-Limit-Remaining': '119',
          'X-Rate-Limit-Reset': '1641916800'
        },
        responseTime: '245ms'
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Code className="h-8 w-8 mr-3 text-blue-600" />
              🌐 API Pública RSV 360
            </h1>
            <p className="text-gray-600">
              Integre seu sistema com nossa API para reservas de hotéis
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentação
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Postman Collection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Requests (30d)</p>
                  <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tempo Médio</p>
                  <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Taxa de Erro</p>
                  <p className="text-2xl font-bold text-red-600">{stats.errorRate}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Globe className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="keys">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="docs">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="test">
              <Terminal className="h-4 w-4 mr-2" />
              Teste da API
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Endpoints</CardTitle>
                  <CardDescription>Endpoints mais utilizados nos últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{endpoint.endpoint}</p>
                          <p className="text-sm text-gray-600">{endpoint.requests.toLocaleString()} requests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{endpoint.avgTime}ms</p>
                          <p className="text-sm text-gray-600">tempo médio</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Introdução à API</CardTitle>
                  <CardDescription>Como começar a usar nossa API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🚀 Primeiros Passos</h4>
                    <ol className="text-sm space-y-2 text-gray-700">
                      <li>1. Gere sua API Key na aba "API Keys"</li>
                      <li>2. Inclua o header X-API-Key em suas requisições</li>
                      <li>3. Use a URL base: {API_DOCUMENTATION.baseUrl}</li>
                      <li>4. Configure webhooks para receber eventos</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">⚡ Rate Limits</h4>
                    <div className="text-sm space-y-1 text-gray-700">
                      {Object.entries(API_DOCUMENTATION.rateLimits).map(([tier, limit]) => (
                        <div key={tier} className="flex justify-between">
                          <span className="capitalize">{tier}:</span>
                          <span>{limit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔒 Autenticação</h4>
                    <p className="text-sm text-gray-700">
                      {API_DOCUMENTATION.authentication}
                    </p>
                    <div className="mt-2 p-2 bg-gray-900 rounded text-green-400 text-xs font-mono">
                      curl -H "X-API-Key: sua_api_key_aqui" \<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;{API_DOCUMENTATION.baseUrl}/hotels
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="keys">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Minhas API Keys</CardTitle>
                      <CardDescription>Gerencie suas chaves de acesso à API</CardDescription>
                    </div>
                    <div className="flex gap-4">
                      <Input
                        placeholder="Nome da API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="w-48"
                      />
                      <Button onClick={generateApiKey} disabled={!newKeyName.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Gerar Nova Key
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiKeys.map(key => (
                      <div key={key.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold">{key.name}</h3>
                              <Badge className={getStatusColor(key.status)}>
                                {key.status}
                              </Badge>
                              <Badge className={getTierColor(key.tier)}>
                                {key.tier.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2">
                              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                                {key.key}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Rate limit: {key.rateLimit} requests/minuto</p>
                              <p>Requests (30d): {key.requests30d.toLocaleString()}</p>
                              <p>Criada em: {formatDate(key.createdAt)}</p>
                              {key.lastUsed && (
                                <p>Último uso: {formatDate(key.lastUsed)}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Logs
                            </Button>
                            {key.status === 'active' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => revokeApiKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Revogar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Novo Webhook</CardTitle>
                  <CardDescription>Receba notificações em tempo real sobre eventos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">URL do Webhook</label>
                        <Input
                          placeholder="https://seu-site.com/webhook"
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Eventos</label>
                        <div className="space-y-2">
                          {[
                            { value: 'booking_created', label: 'Reserva Criada' },
                            { value: 'booking_cancelled', label: 'Reserva Cancelada' },
                            { value: 'booking_updated', label: 'Reserva Atualizada' },
                            { value: 'payment_completed', label: 'Pagamento Concluído' }
                          ].map(event => (
                            <label key={event.value} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedEvents.includes(event.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEvents([...selectedEvents, event.value]);
                                  } else {
                                    setSelectedEvents(selectedEvents.filter(ev => ev !== event.value));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{event.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Button onClick={createWebhook} disabled={!newWebhookUrl.trim() || selectedEvents.length === 0}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Webhook
                      </Button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Exemplo de Payload</h4>
                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`{
  "event": "booking_created",
  "data": {
    "booking_id": "bk_123456",
    "hotel_id": "hotel_789",
    "total": 250.00,
    "commission": 25.00
  },
  "timestamp": "2025-01-10T10:30:00Z",
  "partner_id": "partner_123"
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhooks Configurados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhooks.map(webhook => (
                      <div key={webhook.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-medium">{webhook.url}</span>
                              <Badge className={getStatusColor(webhook.status)}>
                                {webhook.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Eventos: {webhook.events.join(', ')}</p>
                              <p>Taxa de sucesso: {webhook.successRate}%</p>
                              {webhook.lastTriggered && (
                                <p>Último envio: {formatDate(webhook.lastTriggered)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documentation */}
          <TabsContent value="docs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endpoints Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {API_DOCUMENTATION.endpoints.map((endpoint, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedEndpoint(endpoint)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedEndpoint === endpoint
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm">{endpoint.path}</code>
                        </div>
                        <p className="text-xs text-gray-600">{endpoint.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Badge className={getMethodColor(selectedEndpoint.method)}>
                      {selectedEndpoint.method}
                    </Badge>
                    <code className="text-lg">{selectedEndpoint.path}</code>
                  </div>
                  <CardDescription>{selectedEndpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">URL Completa</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">
                        {API_DOCUMENTATION.baseUrl}{selectedEndpoint.path}
                      </code>
                    </div>
                  </div>

                  {selectedEndpoint.params.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Parâmetros</h4>
                      <div className="space-y-2">
                        {selectedEndpoint.params.map(param => (
                          <div key={param} className="bg-gray-50 p-2 rounded">
                            <code className="text-sm">{param}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Requisição</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      <div>curl -X {selectedEndpoint.method} \</div>
                      <div>&nbsp;&nbsp;-H "X-API-Key: sua_api_key" \</div>
                      <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
                      <div>&nbsp;&nbsp;"{API_DOCUMENTATION.baseUrl}{selectedEndpoint.path}"</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Resposta</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
{`{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Test */}
          <TabsContent value="test">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Teste da API</CardTitle>
                  <CardDescription>Teste endpoints diretamente no navegador</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Endpoint</label>
                    <Select defaultValue="hotels">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotels">GET /hotels</SelectItem>
                        <SelectItem value="hotels-search">GET /hotels/search</SelectItem>
                        <SelectItem value="destinations">GET /destinations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Parâmetros (opcional)</label>
                    <Textarea
                      placeholder='{"location": "Rio de Janeiro", "limit": 5}'
                      rows={3}
                    />
                  </div>

                  <Button onClick={testApiEndpoint} className="w-full">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Executar Teste
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResponse ? (
                    testResponse.loading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Executando requisição...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <Badge className="bg-green-100 text-green-800">
                            {testResponse.status}
                          </Badge>
                          <span>{testResponse.responseTime}</span>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Headers</h4>
                          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                            {Object.entries(testResponse.headers).map(([key, value]) => (
                              <div key={key}>{key}: {value}</div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Response Body</h4>
                          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            <pre>{JSON.stringify(testResponse.data, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Execute um teste para ver a resposta
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
