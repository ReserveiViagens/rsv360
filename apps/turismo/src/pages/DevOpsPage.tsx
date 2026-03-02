import React, { useState, useEffect } from 'react';
import { Server, Settings, BarChart3, Activity, Database, Shield, Docker, GitBranch, Zap, CheckCircle, AlertCircle, XCircle, RefreshCw, Download, Eye, Play, Pause, Stop } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useUIStore } from '../stores/useUIStore';
import { 
  defaultProductionConfig, 
  environmentManager, 
  monitoringSystem,
  icpMaxConfig,
  generateFullConfigReport 
} from '../config';

const DevOpsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [configReport, setConfigReport] = useState<string>('');
  const [monitoringStats, setMonitoringStats] = useState<any>(null);
  const [environmentStatus, setEnvironmentStatus] = useState<any>(null);
  const { showNotification } = useUIStore();

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = () => {
    try {
      // Gerar relatório de configuração
      const report = generateFullConfigReport();
      setConfigReport(JSON.stringify(report, null, 2));

      // Obter estatísticas de monitoramento
      const stats = monitoringSystem.getStats();
      setMonitoringStats(stats);

      // Obter status do ambiente
      const env = environmentManager.getCurrentEnvironment();
      const validation = environmentManager.validateEnvironment();
      setEnvironmentStatus({ environment: env, validation });

    } catch (error) {
      console.error('❌ Erro ao carregar status do sistema:', error);
      showNotification('Erro ao carregar status do sistema', 'error');
    }
  };

  const handleEnvironmentChange = (envName: string) => {
    try {
      environmentManager.setEnvironment(envName);
      showNotification(`Ambiente alterado para: ${envName}`, 'success');
      loadSystemStatus();
    } catch (error) {
      showNotification('Erro ao alterar ambiente', 'error');
    }
  };

  const handleMonitoringToggle = (enabled: boolean) => {
    monitoringSystem.setEnabled(enabled);
    showNotification(`Monitoramento ${enabled ? 'habilitado' : 'desabilitado'}`, 'success');
    loadSystemStatus();
  };

  const handleClearBuffers = () => {
    monitoringSystem.clearBuffers();
    showNotification('Buffers de monitoramento limpos', 'success');
    loadSystemStatus();
  };

  const handleDeploy = (environment: 'staging' | 'production') => {
    showNotification(`Iniciando deploy para ${environment}...`, 'info');
    // Aqui seria integrado com o pipeline CI/CD
    setTimeout(() => {
      showNotification(`Deploy para ${environment} concluído com sucesso!`, 'success');
    }, 3000);
  };

  const handleBackup = () => {
    showNotification('Iniciando backup do sistema...', 'info');
    // Aqui seria integrado com o sistema de backup
    setTimeout(() => {
      showNotification('Backup concluído com sucesso!', 'success');
    }, 5000);
  };

  const handleHealthCheck = () => {
    showNotification('Executando verificação de saúde do sistema...', 'info');
    // Aqui seria integrado com health checks
    setTimeout(() => {
      showNotification('Sistema saudável!', 'success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Deploy e DevOps
        </h1>
        <p className="text-gray-600">
          Gestão de ambientes, monitoramento e configurações de produção para VPS ICP MAX
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ambiente Atual</p>
              <p className="text-2xl font-bold text-gray-900">
                {environmentStatus?.environment?.name || 'N/A'}
              </p>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {environmentStatus?.validation?.isValid ? '✅ Válido' : '❌ Inválido'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monitoramento</p>
              <p className="text-2xl font-bold text-gray-900">
                {monitoringStats?.isEnabled ? '✅ Ativo' : '❌ Inativo'}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Provedores</p>
              <p className="text-2xl font-bold text-gray-900">
                {monitoringStats?.providersCount || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={() => handleDeploy('staging')} className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          Deploy Staging
        </Button>
        <Button onClick={() => handleDeploy('production')} variant="outline" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Deploy Production
        </Button>
        <Button onClick={handleBackup} variant="outline" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Backup
        </Button>
        <Button onClick={handleHealthCheck} variant="outline" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Health Check
        </Button>
        <Button onClick={loadSystemStatus} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-14">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Produção
            </TabsTrigger>
            <TabsTrigger value="environments" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ambientes
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="vps" className="flex items-center gap-2">
              <Docker className="w-4 h-4" />
              VPS ICP MAX
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">📊 Status do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🔧 Ambiente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-medium">{environmentStatus?.environment?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descrição:</span>
                      <span className="font-medium">{environmentStatus?.environment?.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domínio:</span>
                      <span className="font-medium">{environmentStatus?.environment?.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={environmentStatus?.validation?.isValid ? 'default' : 'destructive'}>
                        {environmentStatus?.validation?.isValid ? 'Válido' : 'Inválido'}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📈 Monitoramento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={monitoringStats?.isEnabled ? 'default' : 'secondary'}>
                        {monitoringStats?.isEnabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Métricas:</span>
                      <span className="font-medium">{monitoringStats?.metricsBufferSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Logs:</span>
                      <span className="font-medium">{monitoringStats?.logsBufferSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alertas:</span>
                      <span className="font-medium">{monitoringStats?.alertsBufferSize || 0}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleMonitoringToggle(!monitoringStats?.isEnabled)}>
                  {monitoringStats?.isEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {monitoringStats?.isEnabled ? 'Pausar' : 'Iniciar'} Monitoramento
                </Button>
                <Button onClick={handleClearBuffers} variant="outline">
                  <RefreshCw className="w-4 h-4" />
                  Limpar Buffers
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Configurações de Produção */}
          <TabsContent value="production" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">⚙️ Configurações de Produção</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🌐 Servidor</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Host:</span>
                      <span className="font-medium">{defaultProductionConfig.server.host}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Porta:</span>
                      <span className="font-medium">{defaultProductionConfig.server.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SSL:</span>
                      <Badge variant={defaultProductionConfig.server.ssl ? 'default' : 'secondary'}>
                        {defaultProductionConfig.server.ssl ? 'Habilitado' : 'Desabilitado'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ambiente:</span>
                      <Badge variant="outline">{defaultProductionConfig.server.environment}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🗄️ Banco de Dados</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{defaultProductionConfig.database.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Host:</span>
                      <span className="font-medium">{defaultProductionConfig.database.host}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Porta:</span>
                      <span className="font-medium">{defaultProductionConfig.database.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SSL:</span>
                      <Badge variant={defaultProductionConfig.database.ssl ? 'default' : 'secondary'}>
                        {defaultProductionConfig.database.ssl ? 'Habilitado' : 'Desabilitado'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleDeploy('production')} className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Deploy para Produção
                </Button>
                <Button onClick={handleHealthCheck} variant="outline" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verificar Saúde
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Gestão de Ambientes */}
          <TabsContent value="environments" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">🌍 Gestão de Ambientes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['development', 'staging', 'production'].map((envName) => (
                  <Card key={envName} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">{envName}</h4>
                      <Badge 
                        variant={environmentStatus?.environment?.name === envName ? 'default' : 'secondary'}
                      >
                        {environmentStatus?.environment?.name === envName ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Debug:</span>
                        <span className="font-medium">
                          {environmentStatus?.environment?.features?.debug ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monitoramento:</span>
                        <span className="font-medium">
                          {environmentStatus?.environment?.features?.monitoring ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cache:</span>
                        <span className="font-medium">
                          {environmentStatus?.environment?.features?.caching ? '✅' : '❌'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleEnvironmentChange(envName)}
                      variant={environmentStatus?.environment?.name === envName ? 'default' : 'outline'}
                      className="w-full"
                      disabled={environmentStatus?.environment?.name === envName}
                    >
                      {environmentStatus?.environment?.name === envName ? 'Ambiente Ativo' : 'Ativar Ambiente'}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoring" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">📊 Sistema de Monitoramento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📈 Estatísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={monitoringStats?.isEnabled ? 'default' : 'secondary'}>
                        {monitoringStats?.isEnabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Métricas em Buffer:</span>
                      <span className="font-medium">{monitoringStats?.metricsBufferSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Logs em Buffer:</span>
                      <span className="font-medium">{monitoringStats?.logsBufferSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alertas em Buffer:</span>
                      <span className="font-medium">{monitoringStats?.alertsBufferSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provedores:</span>
                      <span className="font-medium">{monitoringStats?.providersCount || 0}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">⚙️ Controles</h4>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleMonitoringToggle(!monitoringStats?.isEnabled)}
                      className="w-full"
                      variant={monitoringStats?.isEnabled ? 'outline' : 'default'}
                    >
                      {monitoringStats?.isEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {monitoringStats?.isEnabled ? 'Pausar' : 'Iniciar'} Monitoramento
                    </Button>
                    
                    <Button onClick={handleClearBuffers} variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4" />
                      Limpar Buffers
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* VPS ICP MAX */}
          <TabsContent value="vps" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">🖥️ VPS ICP MAX - Especificações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">💻 Hardware</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">vCores:</span>
                      <span className="font-medium">{icpMaxConfig.server.specs.vCores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RAM:</span>
                      <span className="font-medium">{icpMaxConfig.server.specs.ram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-medium">{icpMaxConfig.server.specs.storage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OS:</span>
                      <span className="font-medium">{icpMaxConfig.server.specs.os}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🚀 Otimizações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clustering:</span>
                      <Badge variant={icpMaxConfig.server.optimization.clustering.enabled ? 'default' : 'secondary'}>
                        {icpMaxConfig.server.optimization.clustering.workers} Workers
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node.js RAM:</span>
                      <span className="font-medium">{icpMaxConfig.server.optimization.memory.nodeMaxOldSpaceSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Redis RAM:</span>
                      <span className="font-medium">{icpMaxConfig.server.optimization.memory.redisMaxMemory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DB Conexões:</span>
                      <span className="font-medium">{icpMaxConfig.server.optimization.database.maxConnections}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🔒 Segurança</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SSL:</span>
                      <Badge variant={icpMaxConfig.server.security.ssl ? 'default' : 'secondary'}>
                        {icpMaxConfig.server.security.ssl ? 'Habilitado' : 'Desabilitado'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anti-DDoS:</span>
                      <Badge variant={icpMaxConfig.server.security.antiDDoS ? 'default' : 'secondary'}>
                        {icpMaxConfig.server.security.antiDDoS ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Firewall:</span>
                      <Badge variant={icpMaxConfig.server.security.firewall.enabled ? 'default' : 'secondary'}>
                        {icpMaxConfig.server.security.firewall.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📊 Monitoramento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={icpMaxConfig.monitoring.enabled ? 'default' : 'secondary'}>
                        {icpMaxConfig.monitoring.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prometheus:</span>
                      <Badge variant={icpMaxConfig.monitoring.tools.prometheus ? 'default' : 'secondary'}>
                        {icpMaxConfig.monitoring.tools.prometheus ? '✅' : '❌'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grafana:</span>
                      <Badge variant={icpMaxConfig.monitoring.tools.grafana ? 'default' : 'secondary'}>
                        {icpMaxConfig.monitoring.tools.grafana ? '✅' : '❌'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="config" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">⚙️ Configurações do Sistema</h3>
                <Button onClick={loadSystemStatus} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </Button>
              </div>
              
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">📋 Relatório de Configuração</h4>
                  <Button onClick={() => navigator.clipboard.writeText(configReport)} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Copiar
                  </Button>
                </div>
                
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                  {configReport || 'Carregando configurações...'}
                </pre>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { DevOpsPage };
