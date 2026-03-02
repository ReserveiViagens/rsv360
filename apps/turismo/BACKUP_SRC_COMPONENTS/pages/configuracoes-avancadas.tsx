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
  Settings,
  Database,
  Code,
  Terminal,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Shield,
  Globe,
  Cloud,
  HardDrive,
  Network,
  Monitor,
  Cpu,
  MemoryStick,
  Server,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';

interface AdvancedConfig {
  api: {
    rate_limit_enabled: boolean;
    rate_limit_requests: number;
    rate_limit_window: number;
    cors_enabled: boolean;
    cors_origins: string[];
    api_versioning: boolean;
    current_version: string;
    deprecation_warnings: boolean;
    request_logging: boolean;
    response_compression: boolean;
  };
  database: {
    connection_pooling: boolean;
    pool_size: number;
    max_connections: number;
    query_timeout: number;
    slow_query_log: boolean;
    slow_query_threshold: number;
    auto_vacuum: boolean;
    backup_schedule: string;
    backup_retention: number;
    encryption_enabled: boolean;
  };
  cache: {
    redis_enabled: boolean;
    redis_host: string;
    redis_port: number;
    redis_password: string;
    cache_ttl: number;
    memory_cache_size: number;
    cache_strategies: string[];
    invalidation_enabled: boolean;
  };
  logging: {
    log_level: string;
    log_rotation: boolean;
    max_log_size: number;
    log_retention_days: number;
    structured_logging: boolean;
    remote_logging: boolean;
    log_aggregation_service: string;
    error_tracking_enabled: boolean;
  };
  performance: {
    code_minification: boolean;
    asset_compression: boolean;
    image_optimization: boolean;
    lazy_loading: boolean;
    prefetching_enabled: boolean;
    service_worker_enabled: boolean;
    cdn_configuration: string;
    performance_budget: number;
  };
  security: {
    content_security_policy: string;
    strict_transport_security: boolean;
    x_frame_options: string;
    x_content_type_options: boolean;
    referrer_policy: string;
    permissions_policy: string;
    security_headers_enabled: boolean;
    vulnerability_scanning: boolean;
  };
  monitoring: {
    apm_enabled: boolean;
    apm_service_name: string;
    metrics_collection: boolean;
    custom_metrics: string[];
    health_check_endpoints: string[];
    uptime_monitoring: boolean;
    alert_webhooks: string[];
    monitoring_dashboard_url: string;
  };
  integrations: {
    webhook_timeout: number;
    retry_attempts: number;
    circuit_breaker_enabled: boolean;
    circuit_breaker_threshold: number;
    external_service_timeout: number;
    api_gateway_url: string;
    microservices_discovery: boolean;
    service_mesh_enabled: boolean;
  };
}

const DEFAULT_ADVANCED_CONFIG: AdvancedConfig = {
  api: {
    rate_limit_enabled: true,
    rate_limit_requests: 100,
    rate_limit_window: 60,
    cors_enabled: true,
    cors_origins: ['http://localhost:3000', 'https://reserveiviagens.com.br'],
    api_versioning: true,
    current_version: 'v1',
    deprecation_warnings: true,
    request_logging: true,
    response_compression: true
  },
  database: {
    connection_pooling: true,
    pool_size: 10,
    max_connections: 100,
    query_timeout: 30,
    slow_query_log: true,
    slow_query_threshold: 1000,
    auto_vacuum: true,
    backup_schedule: 'daily',
    backup_retention: 30,
    encryption_enabled: true
  },
  cache: {
    redis_enabled: false,
    redis_host: 'localhost',
    redis_port: 6379,
    redis_password: '',
    cache_ttl: 3600,
    memory_cache_size: 128,
    cache_strategies: ['lru', 'ttl'],
    invalidation_enabled: true
  },
  logging: {
    log_level: 'info',
    log_rotation: true,
    max_log_size: 100,
    log_retention_days: 30,
    structured_logging: true,
    remote_logging: false,
    log_aggregation_service: '',
    error_tracking_enabled: true
  },
  performance: {
    code_minification: true,
    asset_compression: true,
    image_optimization: true,
    lazy_loading: true,
    prefetching_enabled: false,
    service_worker_enabled: false,
    cdn_configuration: '',
    performance_budget: 3000
  },
  security: {
    content_security_policy: "default-src 'self'; script-src 'self' 'unsafe-inline';",
    strict_transport_security: true,
    x_frame_options: 'DENY',
    x_content_type_options: true,
    referrer_policy: 'strict-origin-when-cross-origin',
    permissions_policy: 'camera=(), microphone=(), geolocation=()',
    security_headers_enabled: true,
    vulnerability_scanning: false
  },
  monitoring: {
    apm_enabled: false,
    apm_service_name: 'rsv-360',
    metrics_collection: true,
    custom_metrics: ['response_time', 'error_rate', 'user_sessions'],
    health_check_endpoints: ['/health', '/api/health'],
    uptime_monitoring: true,
    alert_webhooks: [],
    monitoring_dashboard_url: ''
  },
  integrations: {
    webhook_timeout: 30,
    retry_attempts: 3,
    circuit_breaker_enabled: true,
    circuit_breaker_threshold: 5,
    external_service_timeout: 10,
    api_gateway_url: '',
    microservices_discovery: false,
    service_mesh_enabled: false
  }
};

interface SystemStatus {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  cache_hit_ratio: number;
  response_time_avg: number;
  errors_last_hour: number;
  uptime: string;
}

const MOCK_STATUS: SystemStatus = {
  cpu_usage: 35,
  memory_usage: 62,
  disk_usage: 45,
  active_connections: 23,
  cache_hit_ratio: 85,
  response_time_avg: 245,
  errors_last_hour: 3,
  uptime: '15 dias, 8 horas'
};

export default function ConfiguracoesAvancadas() {
  const [config, setConfig] = useState<AdvancedConfig>(DEFAULT_ADVANCED_CONFIG);
  const [status] = useState<SystemStatus>(MOCK_STATUS);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem('advanced_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações avançadas:', error);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      localStorage.setItem('advanced_config', JSON.stringify(config));
      setHasChanges(false);
      alert('Configurações avançadas salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (section: keyof AdvancedConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const addToArray = (section: keyof AdvancedConfig, field: string, value: string) => {
    if (!value.trim()) return;

    const currentArray = (config[section] as any)[field] as string[];
    if (!currentArray.includes(value)) {
      updateConfig(section, field, [...currentArray, value]);
    }
  };

  const removeFromArray = (section: keyof AdvancedConfig, field: string, value: string) => {
    const currentArray = (config[section] as any)[field] as string[];
    updateConfig(section, field, currentArray.filter(item => item !== value));
  };

  const exportConfig = () => {
    const configData = JSON.stringify(config, null, 2);
    setExportData(configData);

    // Criar arquivo para download
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsv-360-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    try {
      const parsedConfig = JSON.parse(importData);
      setConfig(parsedConfig);
      setHasChanges(true);
      setImportData('');
      alert('Configuração importada com sucesso!');
    } catch (error) {
      alert('Erro ao importar configuração. Verifique o formato JSON.');
    }
  };

  const resetToDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações avançadas para os valores padrão?')) {
      setConfig(DEFAULT_ADVANCED_CONFIG);
      setHasChanges(true);
    }
  };

  const testConnection = async (service: string) => {
    alert(`Testando conexão com ${service}...`);
    // Implementar teste de conexão real
  };

  const getStatusColor = (value: number, type: 'usage' | 'performance' | 'ratio') => {
    if (type === 'usage') {
      if (value < 50) return 'text-green-600';
      if (value < 80) return 'text-yellow-600';
      return 'text-red-600';
    }

    if (type === 'performance') {
      if (value < 500) return 'text-green-600';
      if (value < 1000) return 'text-yellow-600';
      return 'text-red-600';
    }

    if (type === 'ratio') {
      if (value > 80) return 'text-green-600';
      if (value > 60) return 'text-yellow-600';
      return 'text-red-600';
    }

    return 'text-gray-600';
  };

  const getProgressColor = (value: number, type: 'usage' | 'ratio') => {
    if (type === 'usage') {
      if (value < 50) return 'bg-green-500';
      if (value < 80) return 'bg-yellow-500';
      return 'bg-red-500';
    }

    if (value > 80) return 'bg-green-500';
    if (value > 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔧 Configurações Avançadas RSV 360
            </h1>
            <p className="text-gray-600">
              Configurações técnicas avançadas para administradores do sistema
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button onClick={exportConfig} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Config
            </Button>
            <Button onClick={resetToDefaults} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
            <Button
              onClick={saveConfig}
              disabled={!hasChanges || isSaving}
              className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
          </div>
        </div>

        {/* Alert de Alterações */}
        {hasChanges && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Você possui alterações não salvas nas configurações avançadas.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">
              <Monitor className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="api">
              <Globe className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Banco
            </TabsTrigger>
            <TabsTrigger value="cache">
              <Zap className="h-4 w-4 mr-2" />
              Cache
            </TabsTrigger>
            <TabsTrigger value="logging">
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Cpu className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="import-export">
              <Settings className="h-4 w-4 mr-2" />
              Backup/Restore
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>Status do Sistema em Tempo Real</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4" />
                        <span>CPU</span>
                      </span>
                      <span className={`font-medium ${getStatusColor(status.cpu_usage, 'usage')}`}>
                        {status.cpu_usage}%
                      </span>
                    </div>
                    <Progress value={status.cpu_usage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-2">
                        <MemoryStick className="h-4 w-4" />
                        <span>Memória</span>
                      </span>
                      <span className={`font-medium ${getStatusColor(status.memory_usage, 'usage')}`}>
                        {status.memory_usage}%
                      </span>
                    </div>
                    <Progress value={status.memory_usage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4" />
                        <span>Disco</span>
                      </span>
                      <span className={`font-medium ${getStatusColor(status.disk_usage, 'usage')}`}>
                        {status.disk_usage}%
                      </span>
                    </div>
                    <Progress value={status.disk_usage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Cache Hit Ratio</span>
                      </span>
                      <span className={`font-medium ${getStatusColor(status.cache_hit_ratio, 'ratio')}`}>
                        {status.cache_hit_ratio}%
                      </span>
                    </div>
                    <Progress value={status.cache_hit_ratio} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Métricas de Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Conexões Ativas:</span>
                    <span className="font-medium">{status.active_connections}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Tempo de Resposta Médio:</span>
                    <span className={`font-medium ${getStatusColor(status.response_time_avg, 'performance')}`}>
                      {status.response_time_avg}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Erros na Última Hora:</span>
                    <span className={`font-medium ${status.errors_last_hour > 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {status.errors_last_hour}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium text-green-600">{status.uptime}</span>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-2">Configurações Aplicadas</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Rate Limiting:</span>
                        <Badge variant={config.api.rate_limit_enabled ? 'default' : 'secondary'}>
                          {config.api.rate_limit_enabled ? 'Ativado' : 'Desativado'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Cache:</span>
                        <Badge variant={config.cache.redis_enabled ? 'default' : 'secondary'}>
                          {config.cache.redis_enabled ? 'Redis' : 'Memória'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Compressão:</span>
                        <Badge variant={config.api.response_compression ? 'default' : 'secondary'}>
                          {config.api.response_compression ? 'Ativada' : 'Desativada'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de API */}
          <TabsContent value="api">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da API</CardTitle>
                  <CardDescription>Rate limiting, CORS e versionamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rate_limit_enabled"
                      checked={config.api.rate_limit_enabled}
                      onCheckedChange={(checked) => updateConfig('api', 'rate_limit_enabled', checked)}
                    />
                    <Label htmlFor="rate_limit_enabled">Rate limiting habilitado</Label>
                  </div>

                  {config.api.rate_limit_enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rate_limit_requests">Requests por janela</Label>
                          <Input
                            id="rate_limit_requests"
                            type="number"
                            min="1"
                            value={config.api.rate_limit_requests}
                            onChange={(e) => updateConfig('api', 'rate_limit_requests', parseInt(e.target.value))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rate_limit_window">Janela (segundos)</Label>
                          <Input
                            id="rate_limit_window"
                            type="number"
                            min="1"
                            value={config.api.rate_limit_window}
                            onChange={(e) => updateConfig('api', 'rate_limit_window', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cors_enabled"
                      checked={config.api.cors_enabled}
                      onCheckedChange={(checked) => updateConfig('api', 'cors_enabled', checked)}
                    />
                    <Label htmlFor="cors_enabled">CORS habilitado</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="api_versioning"
                      checked={config.api.api_versioning}
                      onCheckedChange={(checked) => updateConfig('api', 'api_versioning', checked)}
                    />
                    <Label htmlFor="api_versioning">Versionamento da API</Label>
                  </div>

                  <div>
                    <Label htmlFor="current_version">Versão atual</Label>
                    <Input
                      id="current_version"
                      value={config.api.current_version}
                      onChange={(e) => updateConfig('api', 'current_version', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CORS Origins</CardTitle>
                  <CardDescription>Domínios permitidos para requisições cross-origin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {config.api.cors_origins.map((origin, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input value={origin} readOnly className="flex-1" />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromArray('api', 'cors_origins', origin)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex space-x-2">
                      <Input
                        placeholder="https://exemplo.com"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addToArray('api', 'cors_origins', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addToArray('api', 'cors_origins', input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Banco de Dados */}
          <TabsContent value="database">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Conexão</CardTitle>
                  <CardDescription>Pool de conexões e timeouts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="connection_pooling"
                      checked={config.database.connection_pooling}
                      onCheckedChange={(checked) => updateConfig('database', 'connection_pooling', checked)}
                    />
                    <Label htmlFor="connection_pooling">Connection pooling</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pool_size">Tamanho do pool</Label>
                      <Input
                        id="pool_size"
                        type="number"
                        min="1"
                        max="50"
                        value={config.database.pool_size}
                        onChange={(e) => updateConfig('database', 'pool_size', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="max_connections">Máx. conexões</Label>
                      <Input
                        id="max_connections"
                        type="number"
                        min="10"
                        max="1000"
                        value={config.database.max_connections}
                        onChange={(e) => updateConfig('database', 'max_connections', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="query_timeout">Timeout de query (segundos)</Label>
                    <Input
                      id="query_timeout"
                      type="number"
                      min="5"
                      max="300"
                      value={config.database.query_timeout}
                      onChange={(e) => updateConfig('database', 'query_timeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption_enabled"
                      checked={config.database.encryption_enabled}
                      onCheckedChange={(checked) => updateConfig('database', 'encryption_enabled', checked)}
                    />
                    <Label htmlFor="encryption_enabled">Criptografia habilitada</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup e Manutenção</CardTitle>
                  <CardDescription>Configurações de backup e otimização</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="backup_schedule">Agendamento de backup</Label>
                    <Select value={config.database.backup_schedule} onValueChange={(value) => updateConfig('database', 'backup_schedule', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="backup_retention">Retenção de backup (dias)</Label>
                    <Input
                      id="backup_retention"
                      type="number"
                      min="1"
                      max="365"
                      value={config.database.backup_retention}
                      onChange={(e) => updateConfig('database', 'backup_retention', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slow_query_log"
                      checked={config.database.slow_query_log}
                      onCheckedChange={(checked) => updateConfig('database', 'slow_query_log', checked)}
                    />
                    <Label htmlFor="slow_query_log">Log de queries lentas</Label>
                  </div>

                  {config.database.slow_query_log && (
                    <div>
                      <Label htmlFor="slow_query_threshold">Threshold (ms)</Label>
                      <Input
                        id="slow_query_threshold"
                        type="number"
                        min="100"
                        max="10000"
                        value={config.database.slow_query_threshold}
                        onChange={(e) => updateConfig('database', 'slow_query_threshold', parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_vacuum"
                      checked={config.database.auto_vacuum}
                      onCheckedChange={(checked) => updateConfig('database', 'auto_vacuum', checked)}
                    />
                    <Label htmlFor="auto_vacuum">Auto vacuum</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Cache */}
          <TabsContent value="cache">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Cache</CardTitle>
                <CardDescription>Redis e estratégias de cache</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="redis_enabled"
                        checked={config.cache.redis_enabled}
                        onCheckedChange={(checked) => updateConfig('cache', 'redis_enabled', checked)}
                      />
                      <Label htmlFor="redis_enabled">Redis habilitado</Label>
                    </div>

                    {config.cache.redis_enabled && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="redis_host">Host Redis</Label>
                            <Input
                              id="redis_host"
                              value={config.cache.redis_host}
                              onChange={(e) => updateConfig('cache', 'redis_host', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="redis_port">Porta Redis</Label>
                            <Input
                              id="redis_port"
                              type="number"
                              min="1"
                              max="65535"
                              value={config.cache.redis_port}
                              onChange={(e) => updateConfig('cache', 'redis_port', parseInt(e.target.value))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="redis_password">Senha Redis</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="redis_password"
                              type={showPasswords ? 'text' : 'password'}
                              value={config.cache.redis_password}
                              onChange={(e) => updateConfig('cache', 'redis_password', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={() => setShowPasswords(!showPasswords)}
                            >
                              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => testConnection('Redis')}
                        >
                          <Network className="h-4 w-4 mr-2" />
                          Testar Conexão
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cache_ttl">TTL padrão (segundos)</Label>
                      <Input
                        id="cache_ttl"
                        type="number"
                        min="60"
                        max="86400"
                        value={config.cache.cache_ttl}
                        onChange={(e) => updateConfig('cache', 'cache_ttl', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="memory_cache_size">Tamanho do cache em memória (MB)</Label>
                      <Input
                        id="memory_cache_size"
                        type="number"
                        min="16"
                        max="1024"
                        value={config.cache.memory_cache_size}
                        onChange={(e) => updateConfig('cache', 'memory_cache_size', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="invalidation_enabled"
                        checked={config.cache.invalidation_enabled}
                        onCheckedChange={(checked) => updateConfig('cache', 'invalidation_enabled', checked)}
                      />
                      <Label htmlFor="invalidation_enabled">Invalidação automática</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Logging */}
          <TabsContent value="logging">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Log</CardTitle>
                  <CardDescription>Níveis e rotação de logs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="log_level">Nível de log</Label>
                    <Select value={config.logging.log_level} onValueChange={(value) => updateConfig('logging', 'log_level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="fatal">Fatal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log_rotation"
                      checked={config.logging.log_rotation}
                      onCheckedChange={(checked) => updateConfig('logging', 'log_rotation', checked)}
                    />
                    <Label htmlFor="log_rotation">Rotação de logs</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_log_size">Tamanho máx. (MB)</Label>
                      <Input
                        id="max_log_size"
                        type="number"
                        min="10"
                        max="1000"
                        value={config.logging.max_log_size}
                        onChange={(e) => updateConfig('logging', 'max_log_size', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="log_retention_days">Retenção (dias)</Label>
                      <Input
                        id="log_retention_days"
                        type="number"
                        min="7"
                        max="365"
                        value={config.logging.log_retention_days}
                        onChange={(e) => updateConfig('logging', 'log_retention_days', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="structured_logging"
                      checked={config.logging.structured_logging}
                      onCheckedChange={(checked) => updateConfig('logging', 'structured_logging', checked)}
                    />
                    <Label htmlFor="structured_logging">Logs estruturados (JSON)</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logging Remoto</CardTitle>
                  <CardDescription>Agregação e tracking de erros</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remote_logging"
                      checked={config.logging.remote_logging}
                      onCheckedChange={(checked) => updateConfig('logging', 'remote_logging', checked)}
                    />
                    <Label htmlFor="remote_logging">Logging remoto</Label>
                  </div>

                  {config.logging.remote_logging && (
                    <div>
                      <Label htmlFor="log_aggregation_service">Serviço de agregação</Label>
                      <Input
                        id="log_aggregation_service"
                        value={config.logging.log_aggregation_service}
                        onChange={(e) => updateConfig('logging', 'log_aggregation_service', e.target.value)}
                        placeholder="https://logs.exemplo.com/endpoint"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="error_tracking_enabled"
                      checked={config.logging.error_tracking_enabled}
                      onCheckedChange={(checked) => updateConfig('logging', 'error_tracking_enabled', checked)}
                    />
                    <Label htmlFor="error_tracking_enabled">Tracking de erros</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Otimizações Frontend</CardTitle>
                  <CardDescription>Compressão e otimização de assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="code_minification"
                      checked={config.performance.code_minification}
                      onCheckedChange={(checked) => updateConfig('performance', 'code_minification', checked)}
                    />
                    <Label htmlFor="code_minification">Minificação de código</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="asset_compression"
                      checked={config.performance.asset_compression}
                      onCheckedChange={(checked) => updateConfig('performance', 'asset_compression', checked)}
                    />
                    <Label htmlFor="asset_compression">Compressão de assets</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="image_optimization"
                      checked={config.performance.image_optimization}
                      onCheckedChange={(checked) => updateConfig('performance', 'image_optimization', checked)}
                    />
                    <Label htmlFor="image_optimization">Otimização de imagens</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lazy_loading"
                      checked={config.performance.lazy_loading}
                      onCheckedChange={(checked) => updateConfig('performance', 'lazy_loading', checked)}
                    />
                    <Label htmlFor="lazy_loading">Lazy loading</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Budget</CardTitle>
                  <CardDescription>CDN e otimizações avançadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="performance_budget">Budget de performance (ms)</Label>
                    <Input
                      id="performance_budget"
                      type="number"
                      min="1000"
                      max="10000"
                      value={config.performance.performance_budget}
                      onChange={(e) => updateConfig('performance', 'performance_budget', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cdn_configuration">URL do CDN</Label>
                    <Input
                      id="cdn_configuration"
                      value={config.performance.cdn_configuration}
                      onChange={(e) => updateConfig('performance', 'cdn_configuration', e.target.value)}
                      placeholder="https://cdn.exemplo.com"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="prefetching_enabled"
                      checked={config.performance.prefetching_enabled}
                      onCheckedChange={(checked) => updateConfig('performance', 'prefetching_enabled', checked)}
                    />
                    <Label htmlFor="prefetching_enabled">Prefetching de recursos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="service_worker_enabled"
                      checked={config.performance.service_worker_enabled}
                      onCheckedChange={(checked) => updateConfig('performance', 'service_worker_enabled', checked)}
                    />
                    <Label htmlFor="service_worker_enabled">Service Worker</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Headers de Segurança</CardTitle>
                <CardDescription>Configurações de segurança HTTP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="security_headers_enabled"
                        checked={config.security.security_headers_enabled}
                        onCheckedChange={(checked) => updateConfig('security', 'security_headers_enabled', checked)}
                      />
                      <Label htmlFor="security_headers_enabled">Headers de segurança</Label>
                    </div>

                    <div>
                      <Label htmlFor="content_security_policy">Content Security Policy</Label>
                      <Textarea
                        id="content_security_policy"
                        value={config.security.content_security_policy}
                        onChange={(e) => updateConfig('security', 'content_security_policy', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="x_frame_options">X-Frame-Options</Label>
                      <Select value={config.security.x_frame_options} onValueChange={(value) => updateConfig('security', 'x_frame_options', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DENY">DENY</SelectItem>
                          <SelectItem value="SAMEORIGIN">SAMEORIGIN</SelectItem>
                          <SelectItem value="ALLOW-FROM">ALLOW-FROM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="strict_transport_security"
                        checked={config.security.strict_transport_security}
                        onCheckedChange={(checked) => updateConfig('security', 'strict_transport_security', checked)}
                      />
                      <Label htmlFor="strict_transport_security">Strict Transport Security</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="referrer_policy">Referrer Policy</Label>
                      <Select value={config.security.referrer_policy} onValueChange={(value) => updateConfig('security', 'referrer_policy', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-referrer">no-referrer</SelectItem>
                          <SelectItem value="strict-origin">strict-origin</SelectItem>
                          <SelectItem value="strict-origin-when-cross-origin">strict-origin-when-cross-origin</SelectItem>
                          <SelectItem value="same-origin">same-origin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="permissions_policy">Permissions Policy</Label>
                      <Textarea
                        id="permissions_policy"
                        value={config.security.permissions_policy}
                        onChange={(e) => updateConfig('security', 'permissions_policy', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="x_content_type_options"
                        checked={config.security.x_content_type_options}
                        onCheckedChange={(checked) => updateConfig('security', 'x_content_type_options', checked)}
                      />
                      <Label htmlFor="x_content_type_options">X-Content-Type-Options</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="vulnerability_scanning"
                        checked={config.security.vulnerability_scanning}
                        onCheckedChange={(checked) => updateConfig('security', 'vulnerability_scanning', checked)}
                      />
                      <Label htmlFor="vulnerability_scanning">Escaneamento de vulnerabilidades</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import/Export */}
          <TabsContent value="import-export">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exportar Configurações</CardTitle>
                  <CardDescription>Fazer backup das configurações atuais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={exportConfig} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Configurações
                  </Button>

                  {exportData && (
                    <div>
                      <Label>Dados exportados (JSON):</Label>
                      <Textarea
                        value={exportData}
                        readOnly
                        rows={10}
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(exportData)}
                        className="mt-2"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar para Clipboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Importar Configurações</CardTitle>
                  <CardDescription>Restaurar configurações de um backup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="import_data">Cole os dados JSON:</Label>
                    <Textarea
                      id="import_data"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      rows={10}
                      className="font-mono text-xs"
                      placeholder="Cole aqui o JSON das configurações..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={importConfig}
                      disabled={!importData.trim()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importar
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setImportData('')}
                      disabled={!importData.trim()}
                    >
                      Limpar
                    </Button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Atenção:</p>
                        <p>A importação irá sobrescrever todas as configurações atuais. Certifique-se de ter um backup antes de prosseguir.</p>
                      </div>
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
                <p className="font-medium">Configurações Avançadas:</p>
                <p className="text-sm">
                  Estas configurações afetam o comportamento interno do sistema.
                  Altere apenas se você compreende as implicações técnicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
