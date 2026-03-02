import React, { useState, useEffect } from 'react';
import { Settings, Database, Wifi, AlertCircle, CheckCircle, Clock, RefreshCw, Plus, Edit, Trash2, TestTube, Key, Globe, Shield, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';

export interface ApiConnection {
  id: string;
  name: string;
  type: 'hotel' | 'transport' | 'payment' | 'marketing' | 'crm';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastSync: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  config: ApiConfig;
  metrics: ConnectionMetrics;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  secretKey?: string;
  timeout: number;
  retryAttempts: number;
  webhookUrl?: string;
  customHeaders?: Record<string, string>;
}

export interface ConnectionMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastError?: string;
  lastSuccess: string;
}

export interface ApiConnectorProps {
  className?: string;
}

const mockConnections: ApiConnection[] = [
  {
    id: '1',
    name: 'Hotéis Caldas Novas',
    type: 'hotel',
    provider: 'Booking.com API',
    status: 'active',
    lastSync: '2025-08-05T10:30:00Z',
    syncFrequency: 'hourly',
    config: {
      baseUrl: 'https://api.booking.com/v1',
      apiKey: 'bk_****_****_****',
      timeout: 30000,
      retryAttempts: 3,
      webhookUrl: 'https://rsv.com/webhooks/booking',
    },
    metrics: {
      totalRequests: 15420,
      successRate: 98.5,
      averageResponseTime: 245,
      lastSuccess: '2025-08-05T10:30:00Z',
    },
  },
  {
    id: '2',
    name: 'Transporte Aéreo',
    type: 'transport',
    provider: 'Amadeus API',
    status: 'active',
    lastSync: '2025-08-05T09:15:00Z',
    syncFrequency: 'realtime',
    config: {
      baseUrl: 'https://test.api.amadeus.com/v1',
      apiKey: 'am_****_****_****',
      secretKey: 'sec_****_****_****',
      timeout: 45000,
      retryAttempts: 5,
    },
    metrics: {
      totalRequests: 8920,
      successRate: 99.2,
      averageResponseTime: 189,
      lastSuccess: '2025-08-05T09:15:00Z',
    },
  },
  {
    id: '3',
    name: 'Pagamentos Online',
    type: 'payment',
    provider: 'Stripe API',
    status: 'active',
    lastSync: '2025-08-05T10:25:00Z',
    syncFrequency: 'realtime',
    config: {
      baseUrl: 'https://api.stripe.com/v1',
      apiKey: 'sk_****_****_****',
      timeout: 20000,
      retryAttempts: 2,
      webhookUrl: 'https://rsv.com/webhooks/stripe',
    },
    metrics: {
      totalRequests: 23450,
      successRate: 99.8,
      averageResponseTime: 156,
      lastSuccess: '2025-08-05T10:25:00Z',
    },
  },
  {
    id: '4',
    name: 'Marketing Digital',
    type: 'marketing',
    provider: 'Mailchimp API',
    status: 'inactive',
    lastSync: '2025-08-04T15:45:00Z',
    syncFrequency: 'daily',
    config: {
      baseUrl: 'https://api.mailchimp.com/3.0',
      apiKey: 'mc_****_****_****',
      timeout: 25000,
      retryAttempts: 3,
    },
    metrics: {
      totalRequests: 5670,
      successRate: 95.1,
      averageResponseTime: 320,
      lastError: 'API key expired',
      lastSuccess: '2025-08-04T15:45:00Z',
    },
  },
  {
    id: '5',
    name: 'CRM Clientes',
    type: 'crm',
    provider: 'HubSpot API',
    status: 'testing',
    lastSync: '2025-08-05T08:00:00Z',
    syncFrequency: 'hourly',
    config: {
      baseUrl: 'https://api.hubapi.com',
      apiKey: 'hub_****_****_****',
      timeout: 30000,
      retryAttempts: 3,
    },
    metrics: {
      totalRequests: 890,
      successRate: 87.3,
      averageResponseTime: 450,
      lastError: 'Rate limit exceeded',
      lastSuccess: '2025-08-05T08:00:00Z',
    },
  },
];

const connectionTypes: SelectOption[] = [
  { value: 'hotel', label: 'Hotéis e Hospedagem' },
  { value: 'transport', label: 'Transporte e Logística' },
  { value: 'payment', label: 'Pagamentos e Financeiro' },
  { value: 'marketing', label: 'Marketing e Comunicação' },
  { value: 'crm', label: 'CRM e Clientes' },
];

const syncFrequencies: SelectOption[] = [
  { value: 'realtime', label: 'Tempo Real' },
  { value: 'hourly', label: 'A Cada Hora' },
  { value: 'daily', label: 'Diário' },
  { value: 'manual', label: 'Manual' },
];

const ApiConnector: React.FC<ApiConnectorProps> = ({ className }) => {
  const [connections, setConnections] = useState<ApiConnection[]>(mockConnections);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ApiConnection | null>(null);
  const [newConnection, setNewConnection] = useState<Partial<ApiConnection>>({
    type: 'hotel',
    syncFrequency: 'hourly',
    config: {
      baseUrl: '',
      apiKey: '',
      timeout: 30000,
      retryAttempts: 3,
    },
  });

  const getStatusIcon = (status: ApiConnection['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <TestTube className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ApiConnection['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: ApiConnection['type']) => {
    switch (type) {
      case 'hotel':
        return <Database className="w-5 h-5" />;
      case 'transport':
        return <Wifi className="w-5 h-5" />;
      case 'payment':
        return <Shield className="w-5 h-5" />;
      case 'marketing':
        return <Globe className="w-5 h-5" />;
      case 'crm':
        return <Settings className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const handleAddConnection = () => {
    if (newConnection.name && newConnection.provider && newConnection.config?.baseUrl && newConnection.config?.apiKey) {
      const connection: ApiConnection = {
        id: Date.now().toString(),
        name: newConnection.name!,
        type: newConnection.type!,
        provider: newConnection.provider!,
        status: 'testing',
        lastSync: new Date().toISOString(),
        syncFrequency: newConnection.syncFrequency!,
        config: newConnection.config!,
        metrics: {
          totalRequests: 0,
          successRate: 0,
          averageResponseTime: 0,
          lastSuccess: new Date().toISOString(),
        },
      };
      setConnections(prev => [...prev, connection]);
      setIsAddModalOpen(false);
      setNewConnection({
        type: 'hotel',
        syncFrequency: 'hourly',
        config: {
          baseUrl: '',
          apiKey: '',
          timeout: 30000,
          retryAttempts: 3,
        },
      });
    }
  };

  const handleEditConnection = (connection: ApiConnection) => {
    setSelectedConnection(connection);
    setIsEditModalOpen(true);
  };

  const handleTestConnection = (connection: ApiConnection) => {
    setSelectedConnection(connection);
    setIsTestModalOpen(true);
    // Simular teste de conexão
    setTimeout(() => {
      // Aqui você implementaria o teste real
      console.log('Testando conexão:', connection.name);
    }, 1000);
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const handleSyncNow = (connection: ApiConnection) => {
    // Simular sincronização
    console.log('Sincronizando:', connection.name);
    setConnections(prev => prev.map(conn => 
      conn.id === connection.id 
        ? { ...conn, lastSync: new Date().toISOString() }
        : conn
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conectores de API</h2>
          <p className="text-gray-600">Gerencie integrações com sistemas externos e APIs</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conexão
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TestTube className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Testando</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.status === 'testing').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Com Erro</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.status === 'error').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connections List */}
      <Card className="p-6">
        <div className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  {getTypeIcon(connection.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                  <p className="text-sm text-gray-600">{connection.provider}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className={getStatusColor(connection.status)}>
                      {connection.status === 'active' && 'Ativo'}
                      {connection.status === 'inactive' && 'Inativo'}
                      {connection.status === 'error' && 'Erro'}
                      {connection.status === 'testing' && 'Testando'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Última sincronização: {formatDate(connection.lastSync)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(connection)}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncNow(connection)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditConnection(connection)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteConnection(connection.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal Adicionar Conexão */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nova Conexão de API"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Conexão
              </label>
              <Input
                value={newConnection.name || ''}
                onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Hotéis Caldas Novas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provedor
              </label>
              <Input
                value={newConnection.provider || ''}
                onChange={(e) => setNewConnection(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="Ex: Booking.com API"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Conexão
              </label>
              <Select
                value={newConnection.type || ''}
                onValueChange={(value) => setNewConnection(prev => ({ ...prev, type: value as any }))}
                options={connectionTypes}
                placeholder="Selecionar tipo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência de Sincronização
              </label>
              <Select
                value={newConnection.syncFrequency || ''}
                onValueChange={(value) => setNewConnection(prev => ({ ...prev, syncFrequency: value as any }))}
                options={syncFrequencies}
                placeholder="Selecionar frequência"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Base da API
            </label>
            <Input
              value={newConnection.config?.baseUrl || ''}
              onChange={(e) => setNewConnection(prev => ({
                ...prev,
                config: { ...prev.config!, baseUrl: e.target.value }
              }))}
              placeholder="https://api.exemplo.com/v1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chave da API
              </label>
              <Input
                value={newConnection.config?.apiKey || ''}
                onChange={(e) => setNewConnection(prev => ({
                  ...prev,
                  config: { ...prev.config!, apiKey: e.target.value }
                }))}
                placeholder="Sua chave de API"
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chave Secreta (opcional)
              </label>
              <Input
                value={newConnection.config?.secretKey || ''}
                onChange={(e) => setNewConnection(prev => ({
                  ...prev,
                  config: { ...prev.config!, secretKey: e.target.value }
                }))}
                placeholder="Chave secreta se necessário"
                type="password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={newConnection.config?.timeout || 30000}
                onChange={(e) => setNewConnection(prev => ({
                  ...prev,
                  config: { ...prev.config!, timeout: Number(e.target.value) }
                }))}
                placeholder="30000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tentativas de Retry
              </label>
              <Input
                type="number"
                value={newConnection.config?.retryAttempts || 3}
                onChange={(e) => setNewConnection(prev => ({
                  ...prev,
                  config: { ...prev.config!, retryAttempts: Number(e.target.value) }
                }))}
                placeholder="3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do Webhook (opcional)
            </label>
            <Input
              value={newConnection.config?.webhookUrl || ''}
              onChange={(e) => setNewConnection(prev => ({
                ...prev,
                config: { ...prev.config!, webhookUrl: e.target.value }
              }))}
              placeholder="https://seu-site.com/webhooks/api"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddConnection}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conexão
          </Button>
        </div>
      </Modal>

      {/* Modal de Teste */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Testar Conexão"
        size="md"
      >
        <div className="text-center py-8">
          <TestTube className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Testando conexão com {selectedConnection?.name}
          </h3>
          <p className="text-gray-600 mb-6">
            Verificando conectividade, autenticação e endpoints disponíveis...
          </p>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Conexão estabelecida</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Autenticação válida</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Endpoints respondendo</span>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => setIsTestModalOpen(false)}>
              Concluído
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { ApiConnector };
export type { ApiConnection, ApiConfig, ConnectionMetrics, ApiConnectorProps };
