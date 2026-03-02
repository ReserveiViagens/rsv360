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
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Shield,
  Clock,
  Monitor,
  Wifi,
  Cloud,
  FileText,
  Zap,
  Globe,
  Lock
} from 'lucide-react';

interface SystemHealth {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_status: 'online' | 'offline' | 'degraded';
  database_status: 'healthy' | 'warning' | 'error';
  last_backup: string;
  uptime: string;
  active_sessions: number;
  response_time: number;
}

interface SystemSettings {
  performance: {
    max_concurrent_users: number;
    session_timeout: number;
    cache_enabled: boolean;
    cache_ttl: number;
    compression_enabled: boolean;
    cdn_enabled: boolean;
    database_pool_size: number;
    query_timeout: number;
  };
  maintenance: {
    maintenance_mode: boolean;
    maintenance_message: string;
    auto_backup_enabled: boolean;
    backup_retention_days: number;
    log_retention_days: number;
    cleanup_temp_files: boolean;
    auto_update_enabled: boolean;
    maintenance_window: string;
  };
  monitoring: {
    error_logging: boolean;
    performance_tracking: boolean;
    user_analytics: boolean;
    real_time_monitoring: boolean;
    alert_email: string;
    alert_threshold_cpu: number;
    alert_threshold_memory: number;
    alert_threshold_disk: number;
  };
  security: {
    firewall_enabled: boolean;
    rate_limiting: boolean;
    ddos_protection: boolean;
    ssl_only: boolean;
    ip_whitelist_enabled: boolean;
    allowed_ips: string[];
    blocked_ips: string[];
    security_headers: boolean;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  performance: {
    max_concurrent_users: 100,
    session_timeout: 30,
    cache_enabled: true,
    cache_ttl: 3600,
    compression_enabled: true,
    cdn_enabled: false,
    database_pool_size: 10,
    query_timeout: 30
  },
  maintenance: {
    maintenance_mode: false,
    maintenance_message: 'Sistema em manutenção. Voltamos em breve.',
    auto_backup_enabled: true,
    backup_retention_days: 30,
    log_retention_days: 90,
    cleanup_temp_files: true,
    auto_update_enabled: false,
    maintenance_window: '02:00-04:00'
  },
  monitoring: {
    error_logging: true,
    performance_tracking: true,
    user_analytics: true,
    real_time_monitoring: true,
    alert_email: 'admin@reserveiviagens.com.br',
    alert_threshold_cpu: 80,
    alert_threshold_memory: 85,
    alert_threshold_disk: 90
  },
  security: {
    firewall_enabled: true,
    rate_limiting: true,
    ddos_protection: true,
    ssl_only: true,
    ip_whitelist_enabled: false,
    allowed_ips: [],
    blocked_ips: [],
    security_headers: true
  }
};

const MOCK_HEALTH: SystemHealth = {
  cpu_usage: 35,
  memory_usage: 62,
  disk_usage: 45,
  network_status: 'online',
  database_status: 'healthy',
  last_backup: '2025-01-08 02:30:00',
  uptime: '15 dias, 8 horas',
  active_sessions: 23,
  response_time: 125
};

export default function ConfiguracoesSistema() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [health, setHealth] = useState<SystemHealth>(MOCK_HEALTH);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSystemHealth();

    // Atualizar saúde do sistema a cada 30 segundos
    const interval = setInterval(() => {
      loadSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('system_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadSystemHealth = async () => {
    setRefreshing(true);
    try {
      // Simular dados em tempo real
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newHealth = {
        ...MOCK_HEALTH,
        cpu_usage: Math.floor(Math.random() * 40) + 20,
        memory_usage: Math.floor(Math.random() * 30) + 50,
        disk_usage: Math.floor(Math.random() * 20) + 40,
        active_sessions: Math.floor(Math.random() * 50) + 10,
        response_time: Math.floor(Math.random() * 100) + 80
      };

      setHealth(newHealth);
    } catch (error) {
      console.error('Erro ao carregar saúde do sistema:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      localStorage.setItem('system_settings', JSON.stringify(settings));
      setHasChanges(false);
      alert('Configurações do sistema salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const addIpToList = (listType: 'allowed_ips' | 'blocked_ips', ip: string) => {
    if (!ip || !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
      alert('IP inválido');
      return;
    }

    const currentList = settings.security[listType];
    if (!currentList.includes(ip)) {
      updateSetting('security', listType, [...currentList, ip]);
    }
  };

  const removeIpFromList = (listType: 'allowed_ips' | 'blocked_ips', ip: string) => {
    const currentList = settings.security[listType];
    updateSetting('security', listType, currentList.filter(item => item !== ip));
  };

  const restartSystem = () => {
    if (confirm('Tem certeza que deseja reiniciar o sistema? Todos os usuários serão desconectados.')) {
      alert('Sistema será reiniciado em 60 segundos...');
    }
  };

  const toggleMaintenanceMode = () => {
    const newMode = !settings.maintenance.maintenance_mode;
    updateSetting('maintenance', 'maintenance_mode', newMode);

    if (newMode) {
      alert('Modo de manutenção ativado. Novos usuários não poderão acessar o sistema.');
    } else {
      alert('Modo de manutenção desativado. Sistema voltou ao normal.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🖥️ Configurações do Sistema RSV 360
            </h1>
            <p className="text-gray-600">
              Monitore e configure parâmetros técnicos do sistema
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button onClick={loadSystemHealth} variant="outline" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar Status
            </Button>
            <Button onClick={restartSystem} variant="destructive">
              <Server className="h-4 w-4 mr-2" />
              Reiniciar Sistema
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges || isSaving}
              className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>

        {/* Modo Manutenção Alert */}
        {settings.maintenance.maintenance_mode && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">
                    Sistema em modo de manutenção
                  </span>
                </div>
                <Button onClick={toggleMaintenanceMode} variant="outline" size="sm">
                  Desativar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Monitor className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Zap className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Settings className="h-4 w-4 mr-2" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Activity className="h-4 w-4 mr-2" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Status do Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status do Banco de Dados:</span>
                    <Badge className={getStatusColor(health.database_status)}>
                      {health.database_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Status da Rede:</span>
                    <Badge className={getStatusColor(health.network_status)}>
                      {health.network_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Último Backup:</span>
                    <span className="text-sm text-gray-600">{health.last_backup}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Uptime:</span>
                    <span className="text-sm text-gray-600">{health.uptime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Sessões Ativas:</span>
                    <span className="font-medium">{health.active_sessions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Tempo de Resposta:</span>
                    <span className="font-medium">{health.response_time}ms</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recursos do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Uso de Recursos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4" />
                        <span>CPU</span>
                      </div>
                      <span className="font-medium">{health.cpu_usage}%</span>
                    </div>
                    <Progress value={health.cpu_usage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MemoryStick className="h-4 w-4" />
                        <span>Memória</span>
                      </div>
                      <span className="font-medium">{health.memory_usage}%</span>
                    </div>
                    <Progress value={health.memory_usage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4" />
                        <span>Disco</span>
                      </div>
                      <span className="font-medium">{health.disk_usage}%</span>
                    </div>
                    <Progress value={health.disk_usage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Performance</CardTitle>
                  <CardDescription>Ajuste parâmetros para otimizar o desempenho</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="max_concurrent_users">Máximo de Usuários Simultâneos</Label>
                    <Input
                      id="max_concurrent_users"
                      type="number"
                      min="10"
                      max="1000"
                      value={settings.performance.max_concurrent_users}
                      onChange={(e) => updateSetting('performance', 'max_concurrent_users', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="session_timeout">Timeout de Sessão (minutos)</Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.performance.session_timeout}
                      onChange={(e) => updateSetting('performance', 'session_timeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cache_enabled"
                      checked={settings.performance.cache_enabled}
                      onCheckedChange={(checked) => updateSetting('performance', 'cache_enabled', checked)}
                    />
                    <Label htmlFor="cache_enabled">Cache habilitado</Label>
                  </div>

                  {settings.performance.cache_enabled && (
                    <div>
                      <Label htmlFor="cache_ttl">TTL do Cache (segundos)</Label>
                      <Input
                        id="cache_ttl"
                        type="number"
                        min="60"
                        max="86400"
                        value={settings.performance.cache_ttl}
                        onChange={(e) => updateSetting('performance', 'cache_ttl', parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compression_enabled"
                      checked={settings.performance.compression_enabled}
                      onCheckedChange={(checked) => updateSetting('performance', 'compression_enabled', checked)}
                    />
                    <Label htmlFor="compression_enabled">Compressão habilitada</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Banco de Dados</CardTitle>
                  <CardDescription>Otimizações de banco de dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="database_pool_size">Tamanho do Pool de Conexões</Label>
                    <Input
                      id="database_pool_size"
                      type="number"
                      min="5"
                      max="100"
                      value={settings.performance.database_pool_size}
                      onChange={(e) => updateSetting('performance', 'database_pool_size', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="query_timeout">Timeout de Query (segundos)</Label>
                    <Input
                      id="query_timeout"
                      type="number"
                      min="10"
                      max="300"
                      value={settings.performance.query_timeout}
                      onChange={(e) => updateSetting('performance', 'query_timeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cdn_enabled"
                      checked={settings.performance.cdn_enabled}
                      onCheckedChange={(checked) => updateSetting('performance', 'cdn_enabled', checked)}
                    />
                    <Label htmlFor="cdn_enabled">CDN habilitado</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manutenção */}
          <TabsContent value="maintenance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Modo de Manutenção</CardTitle>
                  <CardDescription>Controle o acesso ao sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance_mode"
                      checked={settings.maintenance.maintenance_mode}
                      onCheckedChange={toggleMaintenanceMode}
                    />
                    <Label htmlFor="maintenance_mode">Modo de manutenção ativo</Label>
                  </div>

                  <div>
                    <Label htmlFor="maintenance_message">Mensagem de Manutenção</Label>
                    <Textarea
                      id="maintenance_message"
                      value={settings.maintenance.maintenance_message}
                      onChange={(e) => updateSetting('maintenance', 'maintenance_message', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maintenance_window">Janela de Manutenção</Label>
                    <Input
                      id="maintenance_window"
                      value={settings.maintenance.maintenance_window}
                      onChange={(e) => updateSetting('maintenance', 'maintenance_window', e.target.value)}
                      placeholder="02:00-04:00"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup e Limpeza</CardTitle>
                  <CardDescription>Configurações de backup e manutenção automática</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_backup_enabled"
                      checked={settings.maintenance.auto_backup_enabled}
                      onCheckedChange={(checked) => updateSetting('maintenance', 'auto_backup_enabled', checked)}
                    />
                    <Label htmlFor="auto_backup_enabled">Backup automático</Label>
                  </div>

                  <div>
                    <Label htmlFor="backup_retention_days">Retenção de Backup (dias)</Label>
                    <Input
                      id="backup_retention_days"
                      type="number"
                      min="7"
                      max="365"
                      value={settings.maintenance.backup_retention_days}
                      onChange={(e) => updateSetting('maintenance', 'backup_retention_days', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="log_retention_days">Retenção de Logs (dias)</Label>
                    <Input
                      id="log_retention_days"
                      type="number"
                      min="30"
                      max="365"
                      value={settings.maintenance.log_retention_days}
                      onChange={(e) => updateSetting('maintenance', 'log_retention_days', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cleanup_temp_files"
                      checked={settings.maintenance.cleanup_temp_files}
                      onCheckedChange={(checked) => updateSetting('maintenance', 'cleanup_temp_files', checked)}
                    />
                    <Label htmlFor="cleanup_temp_files">Limpeza automática de arquivos temporários</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_update_enabled"
                      checked={settings.maintenance.auto_update_enabled}
                      onCheckedChange={(checked) => updateSetting('maintenance', 'auto_update_enabled', checked)}
                    />
                    <Label htmlFor="auto_update_enabled">Atualizações automáticas</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Monitoramento</CardTitle>
                  <CardDescription>Logs e analytics do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="error_logging"
                      checked={settings.monitoring.error_logging}
                      onCheckedChange={(checked) => updateSetting('monitoring', 'error_logging', checked)}
                    />
                    <Label htmlFor="error_logging">Log de erros</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="performance_tracking"
                      checked={settings.monitoring.performance_tracking}
                      onCheckedChange={(checked) => updateSetting('monitoring', 'performance_tracking', checked)}
                    />
                    <Label htmlFor="performance_tracking">Rastreamento de performance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="user_analytics"
                      checked={settings.monitoring.user_analytics}
                      onCheckedChange={(checked) => updateSetting('monitoring', 'user_analytics', checked)}
                    />
                    <Label htmlFor="user_analytics">Analytics de usuário</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="real_time_monitoring"
                      checked={settings.monitoring.real_time_monitoring}
                      onCheckedChange={(checked) => updateSetting('monitoring', 'real_time_monitoring', checked)}
                    />
                    <Label htmlFor="real_time_monitoring">Monitoramento em tempo real</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Notificações</CardTitle>
                  <CardDescription>Configure alertas automáticos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="alert_email">Email para Alertas</Label>
                    <Input
                      id="alert_email"
                      type="email"
                      value={settings.monitoring.alert_email}
                      onChange={(e) => updateSetting('monitoring', 'alert_email', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alert_threshold_cpu">Limite de CPU para Alerta (%)</Label>
                    <Input
                      id="alert_threshold_cpu"
                      type="number"
                      min="50"
                      max="95"
                      value={settings.monitoring.alert_threshold_cpu}
                      onChange={(e) => updateSetting('monitoring', 'alert_threshold_cpu', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alert_threshold_memory">Limite de Memória para Alerta (%)</Label>
                    <Input
                      id="alert_threshold_memory"
                      type="number"
                      min="50"
                      max="95"
                      value={settings.monitoring.alert_threshold_memory}
                      onChange={(e) => updateSetting('monitoring', 'alert_threshold_memory', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alert_threshold_disk">Limite de Disco para Alerta (%)</Label>
                    <Input
                      id="alert_threshold_disk"
                      type="number"
                      min="70"
                      max="95"
                      value={settings.monitoring.alert_threshold_disk}
                      onChange={(e) => updateSetting('monitoring', 'alert_threshold_disk', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Segurança</CardTitle>
                  <CardDescription>Firewall e proteções do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="firewall_enabled"
                      checked={settings.security.firewall_enabled}
                      onCheckedChange={(checked) => updateSetting('security', 'firewall_enabled', checked)}
                    />
                    <Label htmlFor="firewall_enabled">Firewall habilitado</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rate_limiting"
                      checked={settings.security.rate_limiting}
                      onCheckedChange={(checked) => updateSetting('security', 'rate_limiting', checked)}
                    />
                    <Label htmlFor="rate_limiting">Rate limiting</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ddos_protection"
                      checked={settings.security.ddos_protection}
                      onCheckedChange={(checked) => updateSetting('security', 'ddos_protection', checked)}
                    />
                    <Label htmlFor="ddos_protection">Proteção DDoS</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl_only"
                      checked={settings.security.ssl_only}
                      onCheckedChange={(checked) => updateSetting('security', 'ssl_only', checked)}
                    />
                    <Label htmlFor="ssl_only">Apenas conexões SSL</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="security_headers"
                      checked={settings.security.security_headers}
                      onCheckedChange={(checked) => updateSetting('security', 'security_headers', checked)}
                    />
                    <Label htmlFor="security_headers">Headers de segurança</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Controle de Acesso por IP</CardTitle>
                  <CardDescription>Gerencie IPs permitidos e bloqueados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ip_whitelist_enabled"
                      checked={settings.security.ip_whitelist_enabled}
                      onCheckedChange={(checked) => updateSetting('security', 'ip_whitelist_enabled', checked)}
                    />
                    <Label htmlFor="ip_whitelist_enabled">Whitelist de IPs ativa</Label>
                  </div>

                  {settings.security.ip_whitelist_enabled && (
                    <div>
                      <Label>IPs Permitidos</Label>
                      <div className="space-y-2">
                        {settings.security.allowed_ips.map((ip, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input value={ip} readOnly className="flex-1" />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeIpFromList('allowed_ips', ip)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="192.168.1.1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addIpToList('allowed_ips', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addIpToList('allowed_ips', input.value);
                              input.value = '';
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>IPs Bloqueados</Label>
                    <div className="space-y-2">
                      {settings.security.blocked_ips.map((ip, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input value={ip} readOnly className="flex-1" />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeIpFromList('blocked_ips', ip)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="192.168.1.100"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addIpToList('blocked_ips', e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addIpToList('blocked_ips', input.value);
                            input.value = '';
                          }}
                        >
                          Bloquear
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
