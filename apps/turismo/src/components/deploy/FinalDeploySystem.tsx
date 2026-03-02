import React, { useState, useEffect } from 'react';
import { Rocket, CheckCircle, AlertCircle, Clock, Server, Database, Globe, Shield, Zap, BarChart3, Settings, Play, Pause, RotateCcw, Eye, Download, Share, Plus, Edit } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea, Progress, Alert, AlertDescription } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

// Interfaces
interface DeployEnvironment {
  id: string;
  name: string;
  type: 'staging' | 'production' | 'testing';
  status: 'active' | 'inactive' | 'maintenance';
  url: string;
  database: string;
  ssl: boolean;
  lastDeploy: string;
  version: string;
  health: 'healthy' | 'warning' | 'critical';
}

interface DeployConfig {
  id: string;
  name: string;
  environment: string;
  database: string;
  ssl: boolean;
  domain: string;
  monitoring: boolean;
  backup: boolean;
  autoScale: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeployStatus {
  id: string;
  environment: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolledback';
  progress: number;
  startTime: string;
  endTime?: string;
  logs: string[];
  errors?: string[];
}

interface DeploySystemProps {
  onDeployStarted?: (config: DeployConfig) => void;
  onDeployCompleted?: (status: DeployStatus) => void;
  onDeployFailed?: (status: DeployStatus) => void;
}

// Mock data
const mockEnvironments: DeployEnvironment[] = [
  {
    id: '1',
    name: 'Produção Principal',
    type: 'production',
    status: 'active',
    url: 'https://rsv-onboarding.com',
    database: 'PostgreSQL 15',
    ssl: true,
    lastDeploy: '2024-01-15T10:30:00Z',
    version: 'v2.1.0',
    health: 'healthy'
  },
  {
    id: '2',
    name: 'Staging',
    type: 'staging',
    status: 'active',
    url: 'https://staging.rsv-onboarding.com',
    database: 'PostgreSQL 15',
    ssl: true,
    lastDeploy: '2024-01-15T09:00:00Z',
    version: 'v2.1.0-rc',
    health: 'healthy'
  },
  {
    id: '3',
    name: 'Teste',
    type: 'testing',
    status: 'inactive',
    url: 'https://test.rsv-onboarding.com',
    database: 'PostgreSQL 15',
    ssl: false,
    lastDeploy: '2024-01-14T16:00:00Z',
    version: 'v2.0.9',
    health: 'warning'
  }
];

const mockDeployConfigs: DeployConfig[] = [
  {
    id: '1',
    name: 'Configuração Produção',
    environment: 'production',
    database: 'PostgreSQL 15',
    ssl: true,
    domain: 'rsv-onboarding.com',
    monitoring: true,
    backup: true,
    autoScale: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Configuração Staging',
    environment: 'staging',
    database: 'PostgreSQL 15',
    ssl: true,
    domain: 'staging.rsv-onboarding.com',
    monitoring: true,
    backup: false,
    autoScale: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  }
];

const mockDeployStatuses: DeployStatus[] = [
  {
    id: '1',
    environment: 'production',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T10:30:00Z',
    logs: [
      'Iniciando deploy para produção...',
      'Verificando dependências...',
      'Executando migrações de banco...',
      'Deploy concluído com sucesso!'
    ]
  },
  {
    id: '2',
    environment: 'staging',
    status: 'running',
    progress: 65,
    startTime: '2024-01-15T09:00:00Z',
    logs: [
      'Iniciando deploy para staging...',
      'Verificando dependências...',
      'Executando migrações de banco...',
      'Deploy em andamento...'
    ]
  }
];

const FinalDeploySystem: React.FC<DeploySystemProps> = ({
  onDeployStarted,
  onDeployCompleted,
  onDeployFailed
}) => {
  const [environments, setEnvironments] = useState<DeployEnvironment[]>(mockEnvironments);
  const [deployConfigs, setDeployConfigs] = useState<DeployConfig[]>(mockDeployConfigs);
  const [deployStatuses, setDeployStatuses] = useState<DeployStatus[]>(mockDeployStatuses);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<DeployConfig | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<DeployConfig>>({});
  const [deployProgress, setDeployProgress] = useState<{ [key: string]: number }>({});
  const { showNotification } = useUIStore();

  // Simular progresso de deploy
  useEffect(() => {
    const interval = setInterval(() => {
      setDeployStatuses(prev => prev.map(status => {
        if (status.status === 'running') {
          const currentProgress = deployProgress[status.id] || 0;
          const newProgress = Math.min(currentProgress + Math.random() * 10, 100);
          
          if (newProgress >= 100) {
            // Deploy concluído
            const completedStatus = {
              ...status,
              status: 'completed' as const,
              progress: 100,
              endTime: new Date().toISOString()
            };
            
            setDeployStatuses(prev => prev.map(s => s.id === status.id ? completedStatus : s));
            onDeployCompleted?.(completedStatus);
            showNotification('Deploy concluído com sucesso!', 'success');
            return completedStatus;
          }
          
          setDeployProgress(prev => ({ ...prev, [status.id]: newProgress }));
          return { ...status, progress: newProgress };
        }
        return status;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [deployProgress, onDeployCompleted, showNotification]);

  const handleDeploy = (config: DeployConfig) => {
    const newStatus: DeployStatus = {
      id: Date.now().toString(),
      environment: config.environment,
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      logs: [`Iniciando deploy para ${config.environment}...`]
    };

    setDeployStatuses(prev => [newStatus, ...prev]);
    setDeployProgress(prev => ({ ...prev, [newStatus.id]: 0 }));
    setShowDeployModal(false);
    
    onDeployStarted?.(config);
    showNotification(`Deploy iniciado para ${config.environment}`, 'info');
  };

  const handleRollback = (status: DeployStatus) => {
    const rollbackStatus: DeployStatus = {
      ...status,
      id: Date.now().toString(),
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      logs: [`Iniciando rollback para ${status.environment}...`]
    };

    setDeployStatuses(prev => [rollbackStatus, ...prev]);
    setDeployProgress(prev => ({ ...prev, [rollbackStatus.id]: 0 }));
    
    showNotification(`Rollback iniciado para ${status.environment}`, 'warning');
  };

  const handleCreateConfig = () => {
    if (newConfig.name && newConfig.environment) {
      const config: DeployConfig = {
        id: Date.now().toString(),
        name: newConfig.name,
        environment: newConfig.environment as 'staging' | 'production' | 'testing',
        database: newConfig.database || 'PostgreSQL 15',
        ssl: newConfig.ssl || false,
        domain: newConfig.domain || '',
        monitoring: newConfig.monitoring || false,
        backup: newConfig.backup || false,
        autoScale: newConfig.autoScale || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDeployConfigs(prev => [...prev, config]);
      setNewConfig({});
      setShowConfigModal(false);
      showNotification('Configuração de deploy criada!', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rolledback': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Deploy Final</h2>
          <p className="text-gray-600">Gerencie o deploy e go-live do sistema RSV</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowConfigModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Nova Configuração
          </Button>
          <Button onClick={() => setShowDeployModal(true)} variant="default">
            <Rocket className="w-4 h-4 mr-2" />
            Iniciar Deploy
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="environments">Ambientes</TabsTrigger>
            <TabsTrigger value="configs">Configurações</TabsTrigger>
            <TabsTrigger value="deploys">Deploys</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ambientes Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {environments.filter(e => e.status === 'active').length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deploys Concluídos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {deployStatuses.filter(s => s.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deploys em Andamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {deployStatuses.filter(s => s.status === 'running').length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Status dos Ambientes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status dos Ambientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {environments.map(env => (
                  <Card key={env.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getHealthIcon(env.health)}
                        <span className="font-medium text-gray-900">{env.name}</span>
                      </div>
                      <Badge variant={env.status === 'active' ? 'default' : 'secondary'}>
                        {env.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>URL:</strong> {env.url}</p>
                      <p><strong>Versão:</strong> {env.version}</p>
                      <p><strong>Último Deploy:</strong> {new Date(env.lastDeploy).toLocaleString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Ambientes */}
          <TabsContent value="environments" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ambientes de Deploy</h3>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ambiente
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {environments.map(env => (
                  <Card key={env.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getHealthIcon(env.health)}
                        <span className="font-medium text-gray-900">{env.name}</span>
                      </div>
                      <Badge variant={env.type === 'production' ? 'destructive' : 'default'}>
                        {env.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>URL:</strong> {env.url}</p>
                      <p><strong>Database:</strong> {env.database}</p>
                      <p><strong>SSL:</strong> {env.ssl ? 'Sim' : 'Não'}</p>
                      <p><strong>Versão:</strong> {env.version}</p>
                      <p><strong>Último Deploy:</strong> {new Date(env.lastDeploy).toLocaleString()}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-1" />
                        Config
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configs" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configurações de Deploy</h3>
                <Button onClick={() => setShowConfigModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Configuração
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deployConfigs.map(config => (
                  <Card key={config.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{config.name}</h4>
                      <Badge variant={config.environment === 'production' ? 'destructive' : 'default'}>
                        {config.environment}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Database:</strong> {config.database}</p>
                      <p><strong>Domain:</strong> {config.domain}</p>
                      <p><strong>SSL:</strong> {config.ssl ? 'Sim' : 'Não'}</p>
                      <p><strong>Monitoring:</strong> {config.monitoring ? 'Sim' : 'Não'}</p>
                      <p><strong>Backup:</strong> {config.backup ? 'Sim' : 'Não'}</p>
                      <p><strong>Auto Scale:</strong> {config.autoScale ? 'Sim' : 'Não'}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedConfig(config);
                          setShowDeployModal(true);
                        }}
                      >
                        <Rocket className="w-4 h-4 mr-1" />
                        Deploy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Deploys */}
          <TabsContent value="deploys" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Histórico de Deploys</h3>
              
              <div className="space-y-4">
                {deployStatuses.map(status => (
                  <Card key={status.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(status.status)}>
                          {status.status}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          Deploy para {status.environment}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(status.startTime).toLocaleString()}
                      </div>
                    </div>

                    {status.status === 'running' && (
                      <div className="mb-3">
                        <Progress value={status.progress} className="w-full" />
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round(status.progress)}% concluído
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Início:</strong> {new Date(status.startTime).toLocaleString()}</p>
                      {status.endTime && (
                        <p><strong>Fim:</strong> {new Date(status.endTime).toLocaleString()}</p>
                      )}
                      {status.errors && status.errors.length > 0 && (
                        <div>
                          <p className="text-red-600 font-medium">Erros:</p>
                          <ul className="list-disc list-inside text-red-600">
                            {status.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Logs
                      </Button>
                      {status.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRollback(status)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal de Deploy */}
      <Modal open={showDeployModal} onOpenChange={setShowDeployModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Iniciar Deploy
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuração
              </label>
              <Select
                value={selectedConfig?.id || ''}
                onValueChange={(value) => {
                  const config = deployConfigs.find(c => c.id === value);
                  setSelectedConfig(config || null);
                }}
              >
                <option value="">Selecione uma configuração</option>
                {deployConfigs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name} ({config.environment})
                  </option>
                ))}
              </Select>
            </div>

            {selectedConfig && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Detalhes da Configuração</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Ambiente:</strong> {selectedConfig.environment}</p>
                  <p><strong>Database:</strong> {selectedConfig.database}</p>
                  <p><strong>Domain:</strong> {selectedConfig.domain}</p>
                  <p><strong>SSL:</strong> {selectedConfig.ssl ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeployModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => selectedConfig && handleDeploy(selectedConfig)}
                disabled={!selectedConfig}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Iniciar Deploy
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Configuração */}
      <Modal open={showConfigModal} onOpenChange={setShowConfigModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nova Configuração de Deploy
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Configuração
              </label>
              <Input
                placeholder="Ex: Configuração Produção"
                value={newConfig.name || ''}
                onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ambiente
              </label>
              <Select
                value={newConfig.environment || ''}
                onValueChange={(value) => setNewConfig(prev => ({ ...prev, environment: value }))}
              >
                <option value="">Selecione o ambiente</option>
                <option value="staging">Staging</option>
                <option value="production">Produção</option>
                <option value="testing">Teste</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database
              </label>
              <Select
                value={newConfig.database || ''}
                onValueChange={(value) => setNewConfig(prev => ({ ...prev, database: value }))}
              >
                <option value="PostgreSQL 15">PostgreSQL 15</option>
                <option value="MySQL 8.0">MySQL 8.0</option>
                <option value="MongoDB 7.0">MongoDB 7.0</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <Input
                placeholder="Ex: rsv-onboarding.com"
                value={newConfig.domain || ''}
                onChange={(e) => setNewConfig(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={newConfig.ssl || false}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, ssl: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="ssl" className="text-sm text-gray-700">
                  Habilitar SSL
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="monitoring"
                  checked={newConfig.monitoring || false}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, monitoring: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="monitoring" className="text-sm text-gray-700">
                  Habilitar Monitoramento
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="backup"
                  checked={newConfig.backup || false}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, backup: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="backup" className="text-sm text-gray-700">
                  Habilitar Backup Automático
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoScale"
                  checked={newConfig.autoScale || false}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, autoScale: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="autoScale" className="text-sm text-gray-700">
                  Habilitar Auto Scale
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfigModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateConfig}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Configuração
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { FinalDeploySystem };
export type { DeployEnvironment, DeployConfig, DeployStatus, DeploySystemProps };
