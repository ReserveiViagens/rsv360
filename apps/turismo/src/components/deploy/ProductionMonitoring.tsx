import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Globe, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, BarChart3, Settings, Eye, Download, Share, Plus, Edit, Trash2, Zap, Cpu, HardDrive, Wifi, Users } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea, Progress, Alert, AlertDescription } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

// Interfaces
interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'cache' | 'external';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  url: string;
  health: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  service: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

interface MonitoringConfig {
  id: string;
  name: string;
  type: 'metric' | 'service' | 'log';
  enabled: boolean;
  interval: number; // em segundos
  threshold: number;
  notification: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductionMonitoringProps {
  onAlertCreated?: (alert: Alert) => void;
  onAlertResolved?: (alert: Alert) => void;
  onMetricThreshold?: (metric: SystemMetric) => void;
}

// Mock data
const mockSystemMetrics: SystemMetric[] = [
  {
    id: '1',
    name: 'CPU Usage',
    value: 45,
    unit: '%',
    status: 'healthy',
    trend: 'up',
    threshold: { warning: 70, critical: 90 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Memory Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'up',
    threshold: { warning: 75, critical: 90 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Disk Usage',
    value: 65,
    unit: '%',
    status: 'healthy',
    trend: 'stable',
    threshold: { warning: 80, critical: 95 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Network Traffic',
    value: 120,
    unit: 'Mbps',
    status: 'healthy',
    trend: 'down',
    threshold: { warning: 200, critical: 300 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Active Connections',
    value: 156,
    unit: 'connections',
    status: 'healthy',
    trend: 'up',
    threshold: { warning: 200, critical: 300 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Database Connections',
    value: 23,
    unit: 'connections',
    status: 'healthy',
    trend: 'stable',
    threshold: { warning: 50, critical: 80 },
    lastUpdated: new Date().toISOString()
  }
];

const mockServiceStatuses: ServiceStatus[] = [
  {
    id: '1',
    name: 'Frontend App',
    type: 'frontend',
    status: 'online',
    responseTime: 120,
    uptime: 99.98,
    lastCheck: new Date().toISOString(),
    url: 'https://rsv-onboarding.com',
    health: 'healthy'
  },
  {
    id: '2',
    name: 'Backend API',
    type: 'backend',
    status: 'online',
    responseTime: 85,
    uptime: 99.95,
    lastCheck: new Date().toISOString(),
    url: 'https://api.rsv-onboarding.com',
    health: 'healthy'
  },
  {
    id: '3',
    name: 'PostgreSQL Database',
    type: 'database',
    status: 'online',
    responseTime: 12,
    uptime: 99.99,
    lastCheck: new Date().toISOString(),
    url: 'localhost:5432',
    health: 'healthy'
  },
  {
    id: '4',
    name: 'Redis Cache',
    type: 'cache',
    status: 'online',
    responseTime: 5,
    uptime: 99.97,
    lastCheck: new Date().toISOString(),
    url: 'localhost:6379',
    health: 'healthy'
  },
  {
    id: '5',
    name: 'Payment Gateway',
    type: 'external',
    status: 'online',
    responseTime: 250,
    uptime: 99.90,
    lastCheck: new Date().toISOString(),
    url: 'https://api.stripe.com',
    health: 'healthy'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'warning',
    title: 'High Memory Usage',
    message: 'Memory usage is above 75% threshold',
    service: 'System',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged: false,
    resolved: false
  },
  {
    id: '2',
    severity: 'info',
    title: 'Backup Completed',
    message: 'Daily backup completed successfully',
    service: 'Backup System',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
    resolved: true
  }
];

const mockMonitoringConfigs: MonitoringConfig[] = [
  {
    id: '1',
    name: 'CPU Monitoring',
    type: 'metric',
    enabled: true,
    interval: 30,
    threshold: 70,
    notification: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Database Health Check',
    type: 'service',
    enabled: true,
    interval: 60,
    threshold: 1000,
    notification: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

const ProductionMonitoring: React.FC<ProductionMonitoringProps> = ({
  onAlertCreated,
  onAlertResolved,
  onMetricThreshold
}) => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>(mockSystemMetrics);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>(mockServiceStatuses);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [monitoringConfigs, setMonitoringConfigs] = useState<MonitoringConfig[]>(mockMonitoringConfigs);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<MonitoringConfig | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<MonitoringConfig>>({});
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({});
  const { showNotification } = useUIStore();

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Atualizar métricas do sistema
      setSystemMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, metric.value + variation));
        
        let newStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (newValue >= metric.threshold.critical) {
          newStatus = 'critical';
        } else if (newValue >= metric.threshold.warning) {
          newStatus = 'warning';
        }

        let newTrend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(variation) > 2) {
          newTrend = variation > 0 ? 'up' : 'down';
        }

        return {
          ...metric,
          value: Math.round(newValue * 100) / 100,
          status: newStatus,
          trend: newTrend,
          lastUpdated: new Date().toISOString()
        };
      }));

      // Verificar thresholds e criar alertas
      systemMetrics.forEach(metric => {
        if (metric.status === 'critical' || metric.status === 'warning') {
          const existingAlert = alerts.find(a => 
            a.title.includes(metric.name) && !a.resolved
          );
          
          if (!existingAlert) {
            const newAlert: Alert = {
              id: Date.now().toString(),
              severity: metric.status === 'critical' ? 'critical' : 'warning',
              title: `${metric.name} Threshold Exceeded`,
              message: `${metric.name} is at ${metric.value}${metric.unit} (${metric.status})`,
              service: 'System',
              timestamp: new Date().toISOString(),
              acknowledged: false,
              resolved: false
            };
            
            setAlerts(prev => [newAlert, ...prev]);
            onAlertCreated?.(newAlert);
            onMetricThreshold?.(metric);
            
            showNotification(
              `Alerta: ${metric.name} está em ${metric.status}`,
              metric.status === 'critical' ? 'error' : 'warning'
            );
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [systemMetrics, alerts, onAlertCreated, onMetricThreshold, showNotification]);

  const handleAlertAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    showNotification('Alerta reconhecido!', 'info');
  };

  const handleAlertResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      onAlertResolved?.(alert);
      showNotification('Alerta resolvido!', 'success');
    }
  };

  const handleCreateConfig = () => {
    if (newConfig.name && newConfig.type && newConfig.interval) {
      const config: MonitoringConfig = {
        id: Date.now().toString(),
        name: newConfig.name,
        type: newConfig.type as 'metric' | 'service' | 'log',
        enabled: newConfig.enabled || true,
        interval: newConfig.interval,
        threshold: newConfig.threshold || 0,
        notification: newConfig.notification || true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMonitoringConfigs(prev => [...prev, config]);
      setNewConfig({});
      setShowConfigModal(false);
      showNotification('Configuração de monitoramento criada!', 'success');
    }
  };

  const handleCreateAlert = () => {
    if (newAlert.title && newAlert.message && newAlert.severity) {
      const alert: Alert = {
        id: Date.now().toString(),
        severity: newAlert.severity as 'info' | 'warning' | 'error' | 'critical',
        title: newAlert.title,
        message: newAlert.message,
        service: newAlert.service || 'Manual',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false
      };

      setAlerts(prev => [alert, ...prev]);
      setNewAlert({});
      setShowAlertModal(false);
      onAlertCreated?.(alert);
      showNotification('Alerta manual criado!', 'info');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'offline':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Produção</h2>
          <p className="text-gray-600">Acompanhe o sistema RSV em tempo real</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowConfigModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Nova Configuração
          </Button>
          <Button onClick={() => setShowAlertModal(true)} variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Criar Alerta
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Serviços Online</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {serviceStatuses.filter(s => s.status === 'online').length}/{serviceStatuses.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alertas Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => !a.resolved).length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Uptime Médio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(serviceStatuses.reduce((acc, s) => acc + s.uptime, 0) / serviceStatuses.length)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tempo Médio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(serviceStatuses.reduce((acc, s) => acc + s.responseTime, 0) / serviceStatuses.length)}ms
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Status dos Serviços */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status dos Serviços</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceStatuses.map(service => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getHealthIcon(service.health)}
                        <span className="font-medium text-gray-900">{service.name}</span>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Tipo:</strong> {service.type}</p>
                      <p><strong>Response Time:</strong> {service.responseTime}ms</p>
                      <p><strong>Uptime:</strong> {service.uptime}%</p>
                      <p><strong>URL:</strong> {service.url}</p>
                      <p><strong>Última Verificação:</strong> {new Date(service.lastCheck).toLocaleString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Métricas Críticas */}
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900">Métricas Críticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemMetrics.filter(m => m.status !== 'healthy').map(metric => (
                  <Card key={metric.id} className="p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-gray-900">{metric.name}</span>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value}{metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Threshold: {metric.threshold.warning}{metric.unit} / {metric.threshold.critical}{metric.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Atualizado: {new Date(metric.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Métricas */}
          <TabsContent value="metrics" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Métricas do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemMetrics.map(metric => (
                  <Card key={metric.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getHealthIcon(metric.health)}
                        <span className="font-medium text-gray-900">{metric.name}</span>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value}{metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                          <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                        </div>
                        <Progress 
                          value={metric.value} 
                          className="w-full"
                          color={metric.status === 'critical' ? 'red' : metric.status === 'warning' ? 'yellow' : 'green'}
                        />
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Atualizado: {new Date(metric.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Serviços */}
          <TabsContent value="services" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status dos Serviços</h3>
              
              <div className="space-y-4">
                {serviceStatuses.map(service => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(service.health)}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Response Time</p>
                        <p className="text-xl font-bold text-gray-900">{service.responseTime}ms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-xl font-bold text-gray-900">{service.uptime}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Health</p>
                        <Badge className={getStatusColor(service.health)}>
                          {service.health}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>URL:</strong> {service.url}</p>
                      <p><strong>Última Verificação:</strong> {new Date(service.lastCheck).toLocaleString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alerts" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alertas do Sistema</h3>
                <Button onClick={() => setShowAlertModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Alerta
                </Button>
              </div>
              
              <div className="space-y-4">
                {alerts.map(alert => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p><strong>Serviço:</strong> {alert.service}</p>
                        <p><strong>Status:</strong> {alert.acknowledged ? 'Reconhecido' : 'Não reconhecido'} / {alert.resolved ? 'Resolvido' : 'Não resolvido'}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!alert.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAcknowledge(alert.id)}
                          >
                            Reconhecer
                          </Button>
                        )}
                        {!alert.resolved && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertResolve(alert.id)}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal de Configuração */}
      <Modal open={showConfigModal} onOpenChange={setShowConfigModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nova Configuração de Monitoramento
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Configuração
              </label>
              <Input
                placeholder="Ex: CPU Monitoring"
                value={newConfig.name || ''}
                onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <Select
                value={newConfig.type || ''}
                onValueChange={(value) => setNewConfig(prev => ({ ...prev, type: value }))}
              >
                <option value="">Selecione o tipo</option>
                <option value="metric">Métrica</option>
                <option value="service">Serviço</option>
                <option value="log">Log</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo de Verificação (segundos)
              </label>
              <Input
                type="number"
                placeholder="30"
                value={newConfig.interval || ''}
                onChange={(e) => setNewConfig(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threshold
              </label>
              <Input
                type="number"
                placeholder="70"
                value={newConfig.threshold || ''}
                onChange={(e) => setNewConfig(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newConfig.enabled || false}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700">
                  Habilitado
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notification"
                  checked={newConfig.notification || false}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, notification: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="notification" className="text-sm text-gray-700">
                  Notificações
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

      {/* Modal de Alerta */}
      <Modal open={showAlertModal} onOpenChange={setShowAlertModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Criar Alerta Manual
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <Input
                placeholder="Ex: Manutenção Programada"
                value={newAlert.title || ''}
                onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <Textarea
                placeholder="Ex: Sistema será reiniciado para atualizações"
                value={newAlert.message || ''}
                onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severidade
              </label>
              <Select
                value={newAlert.severity || 'info'}
                onValueChange={(value) => setNewAlert(prev => ({ ...prev, severity: value as any }))}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serviço
              </label>
              <Input
                placeholder="Ex: Sistema"
                value={newAlert.service || ''}
                onChange={(e) => setNewAlert(prev => ({ ...prev, service: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAlertModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAlert}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Alerta
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { ProductionMonitoring };
export type { SystemMetric, ServiceStatus, Alert, MonitoringConfig, ProductionMonitoringProps };
