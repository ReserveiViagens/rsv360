import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Zap, AlertCircle, CheckCircle, Clock, RefreshCw, Settings, Key, Globe, Database, Activity, TestTube } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'pagseguro' | 'mercadopago' | 'paypal';
  status: 'active' | 'inactive' | 'testing' | 'error';
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  lastSync: Date;
  transactionCount: number;
  successRate: number;
  averageResponseTime: number;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
  };
}

export interface GatewayConfig {
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  sandboxMode: boolean;
  autoCapture: boolean;
  webhookSecret: string;
}

export interface GatewayMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  responseTime: number;
  uptime: number;
}

export interface PaymentGatewayProps {
  className?: string;
}

const gatewayTypes: SelectOption[] = [
  { value: 'stripe', label: 'Stripe', icon: '💳' },
  { value: 'pagseguro', label: 'PagSeguro', icon: '🇧🇷' },
  { value: 'mercadopago', label: 'MercadoPago', icon: '🇦🇷' },
  { value: 'paypal', label: 'PayPal', icon: '🌐' }
];

const mockGateways: PaymentGateway[] = [
  {
    id: '1',
    name: 'Stripe Production',
    type: 'stripe',
    status: 'active',
    apiKey: 'pk_live_...',
    secretKey: 'sk_live_...',
    webhookUrl: 'https://api.reserveiviagens.com/webhooks/stripe',
    lastSync: new Date(),
    transactionCount: 1250,
    successRate: 98.5,
    averageResponseTime: 1200,
    supportedCurrencies: ['BRL', 'USD', 'EUR'],
    supportedPaymentMethods: ['card', 'pix', 'boleto'],
    fees: { percentage: 2.9, fixed: 0.30 },
    limits: { minAmount: 1.00, maxAmount: 50000.00, dailyLimit: 100000.00 }
  },
  {
    id: '2',
    name: 'PagSeguro Sandbox',
    type: 'pagseguro',
    status: 'testing',
    apiKey: 'test_...',
    secretKey: 'test_...',
    webhookUrl: 'https://api.reserveiviagens.com/webhooks/pagseguro',
    lastSync: new Date(Date.now() - 86400000),
    transactionCount: 450,
    successRate: 95.2,
    averageResponseTime: 1800,
    supportedCurrencies: ['BRL'],
    supportedPaymentMethods: ['card', 'pix', 'boleto', 'transfer'],
    fees: { percentage: 3.99, fixed: 0.40 },
    limits: { minAmount: 1.00, maxAmount: 100000.00, dailyLimit: 500000.00 }
  }
];

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ className }) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>(mockGateways);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [config, setConfig] = useState<GatewayConfig>({
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    sandboxMode: true,
    autoCapture: true,
    webhookSecret: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'testing': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAddGateway = () => {
    setSelectedGateway(null);
    setConfig({
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      sandboxMode: true,
      autoCapture: true,
      webhookSecret: ''
    });
    setShowConfigModal(true);
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setConfig({
      apiKey: gateway.apiKey,
      secretKey: gateway.secretKey,
      webhookUrl: gateway.webhookUrl,
      sandboxMode: gateway.status === 'testing',
      autoCapture: true,
      webhookSecret: ''
    });
    setShowConfigModal(true);
  };

  const handleSaveGateway = () => {
    if (selectedGateway) {
      // Update existing gateway
      setGateways(prev => prev.map(g => 
        g.id === selectedGateway.id 
          ? { ...g, ...config, status: config.sandboxMode ? 'testing' : 'active' }
          : g
      ));
    } else {
      // Add new gateway
      const newGateway: PaymentGateway = {
        id: Date.now().toString(),
        name: `Gateway ${gateways.length + 1}`,
        type: 'stripe',
        status: config.sandboxMode ? 'testing' : 'active',
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        webhookUrl: config.webhookUrl,
        lastSync: new Date(),
        transactionCount: 0,
        successRate: 0,
        averageResponseTime: 0,
        supportedCurrencies: ['BRL'],
        supportedPaymentMethods: ['card'],
        fees: { percentage: 2.9, fixed: 0.30 },
        limits: { minAmount: 1.00, maxAmount: 50000.00, dailyLimit: 100000.00 }
      };
      setGateways(prev => [...prev, newGateway]);
    }
    setShowConfigModal(false);
  };

  const handleTestGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setShowTestModal(true);
  };

  const handleSyncGateway = (gateway: PaymentGateway) => {
    // Simulate sync
    setGateways(prev => prev.map(g => 
      g.id === gateway.id 
        ? { ...g, lastSync: new Date() }
        : g
    ));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gateways de Pagamento</h2>
          <p className="text-gray-600">Gerencie suas integrações com gateways de pagamento</p>
        </div>
        <Button onClick={handleAddGateway} className="bg-blue-600 hover:bg-blue-700">
          <Globe className="w-4 h-4 mr-2" />
          Adicionar Gateway
        </Button>
      </div>

      {/* Gateways List */}
      <div className="grid gap-6">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{gateway.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={cn('flex items-center gap-1', getStatusColor(gateway.status))}>
                        {getStatusIcon(gateway.status)}
                        {gateway.status === 'active' ? 'Ativo' : 
                         gateway.status === 'testing' ? 'Teste' : 
                         gateway.status === 'error' ? 'Erro' : 'Inativo'}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">{gateway.type}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{gateway.transactionCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Transações</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{gateway.successRate}%</div>
                    <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{gateway.averageResponseTime}ms</div>
                    <div className="text-sm text-gray-600">Tempo Resposta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{gateway.supportedCurrencies.length}</div>
                    <div className="text-sm text-gray-600">Moedas</div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Taxas:</span>
                    <span className="ml-2 text-gray-600">
                      {gateway.fees.percentage}% + R$ {gateway.fees.fixed.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Limite Diário:</span>
                    <span className="ml-2 text-gray-600">
                      R$ {gateway.limits.dailyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Última Sincronização:</span>
                    <span className="ml-2 text-gray-600">
                      {gateway.lastSync.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Métodos:</span>
                    <span className="ml-2 text-gray-600">
                      {gateway.supportedPaymentMethods.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditGateway(gateway)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestGateway(gateway)}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncGateway(gateway)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={selectedGateway ? 'Editar Gateway' : 'Novo Gateway'}
        size="lg"
      >
        <div className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Gateway
                </label>
                <Select
                  value={gatewayTypes[0]}
                  options={gatewayTypes}
                  onChange={(option) => console.log('Selected:', option)}
                  placeholder="Selecione o tipo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave da API
                </label>
                <Input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="pk_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave Secreta
                </label>
                <Input
                  type="password"
                  value={config.secretKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="sk_live_..."
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modo Sandbox
                  </label>
                  <p className="text-sm text-gray-600">Use para testes e desenvolvimento</p>
                </div>
                <input
                  type="checkbox"
                  id="sandbox-mode"
                  checked={config.sandboxMode}
                  onChange={(e) => setConfig(prev => ({ ...prev, sandboxMode: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                  aria-label="Ativar modo sandbox para testes"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Captura Automática
                  </label>
                  <p className="text-sm text-gray-600">Capturar pagamentos automaticamente</p>
                </div>
                <input
                  type="checkbox"
                  id="auto-capture"
                  checked={config.autoCapture}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoCapture: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                  aria-label="Ativar captura automática de pagamentos"
                />
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Webhook
                </label>
                <Input
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://api.reserveiviagens.com/webhooks/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segredo do Webhook
                </label>
                <Input
                  type="password"
                  value={config.webhookSecret}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  placeholder="whsec_..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowConfigModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveGateway}>
              {selectedGateway ? 'Atualizar' : 'Criar'} Gateway
            </Button>
          </div>
        </div>
      </Modal>

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={`Testar Gateway - ${selectedGateway?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Teste de Conectividade
            </h3>
            <p className="text-gray-600">
              Testando conexão com {selectedGateway?.name}...
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Conexão API</span>
              <Badge className="bg-green-100 text-green-800">✓ Conectado</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Validação de Chaves</span>
              <Badge className="bg-green-100 text-green-800">✓ Válidas</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Webhook</span>
              <Badge className="bg-yellow-100 text-yellow-800">⚠ Testando</Badge>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowTestModal(false)}
            >
              Fechar
            </Button>
            <Button onClick={() => setShowTestModal(false)}>
              Executar Teste Completo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { PaymentGateway };
export type { PaymentGateway as PaymentGatewayType, GatewayConfig, GatewayMetrics };
