'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Settings, 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  Server,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  systemUptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: number;
  errorRate: number;
  responseTime: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface SystemLog {
  id: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  source: string;
  userId?: string;
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockMetrics: SystemMetrics = {
      totalUsers: 156,
      activeUsers: 89,
      totalSessions: 234,
      systemUptime: '15 dias, 8 horas',
      cpuUsage: 23,
      memoryUsage: 67,
      diskUsage: 45,
      networkTraffic: 12.5,
      errorRate: 0.02,
      responseTime: 145
    };

    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        message: 'Uso de memória acima de 80%',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false
      },
      {
        id: '2',
        type: 'info',
        message: 'Backup automático concluído com sucesso',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: '3',
        type: 'success',
        message: 'Atualização de segurança aplicada',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isRead: true
      }
    ];

    const mockLogs: SystemLog[] = [
      {
        id: '1',
        level: 'info',
        message: 'Usuário joao.silva@rsv.com fez login',
        timestamp: new Date(),
        source: 'auth',
        userId: '1'
      },
      {
        id: '2',
        level: 'warn',
        message: 'Tentativa de login falhou para email inválido',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        source: 'auth'
      },
      {
        id: '3',
        level: 'error',
        message: 'Erro ao conectar com banco de dados',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        source: 'database'
      }
    ];

    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setLogs(mockLogs);
    setLoading(false);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    // Simular refresh da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'debug': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-600';
    if (usage < 80) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Painel Administrativo
          </CardTitle>
          <CardDescription>
            Visão geral do sistema, métricas e controles administrativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitiveData ? 'Ocultar' : 'Mostrar'} Dados Sensíveis
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Atualizar
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{metrics?.totalUsers}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{metrics?.activeUsers}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Usuários Ativos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{metrics?.totalSessions}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Sessões Ativas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{metrics?.systemUptime}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CPU</span>
                        <span className={cn("text-sm font-bold", getUsageColor(metrics?.cpuUsage || 0))}>
                          {metrics?.cpuUsage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            metrics && metrics.cpuUsage < 50 ? "bg-green-500" :
                            metrics && metrics.cpuUsage < 80 ? "bg-orange-500" : "bg-red-500"
                          )}
                          style={{ width: `${metrics?.cpuUsage || 0}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Memória</span>
                        <span className={cn("text-sm font-bold", getUsageColor(metrics?.memoryUsage || 0))}>
                          {metrics?.memoryUsage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            metrics && metrics.memoryUsage < 50 ? "bg-green-500" :
                            metrics && metrics.memoryUsage < 80 ? "bg-orange-500" : "bg-red-500"
                          )}
                          style={{ width: `${metrics?.memoryUsage || 0}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Disco</span>
                        <span className={cn("text-sm font-bold", getUsageColor(metrics?.diskUsage || 0))}>
                          {metrics?.diskUsage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            metrics && metrics.diskUsage < 50 ? "bg-green-500" :
                            metrics && metrics.diskUsage < 80 ? "bg-orange-500" : "bg-red-500"
                          )}
                          style={{ width: `${metrics?.diskUsage || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium">Tráfego de Rede</div>
                          <div className="text-lg font-bold">{metrics?.networkTraffic} MB/s</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="text-sm font-medium">Taxa de Erro</div>
                          <div className="text-lg font-bold">{(metrics?.errorRate || 0) * 100}%</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium">Tempo de Resposta</div>
                          <div className="text-lg font-bold">{metrics?.responseTime}ms</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Recursos do Sistema</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Cpu className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Processador: Intel Xeon E5-2680</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <HardDrive className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Armazenamento: SSD 1TB</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Wifi className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Rede: 1Gbps</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Tendências</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">CPU: Estável</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-600">Memória: Aumentando</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Disco: Estável</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alertas */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alertas do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border",
                          alert.isRead ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900",
                          alert.type === 'error' ? "border-red-200 dark:border-red-800" :
                          alert.type === 'warning' ? "border-orange-200 dark:border-orange-800" :
                          alert.type === 'info' ? "border-blue-200 dark:border-blue-800" :
                          "border-green-200 dark:border-green-800"
                        )}
                      >
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {alert.timestamp.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            Marcar como lido
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Logs do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        {getLogIcon(log.level)}
                        <div className="flex-1">
                          <p className="text-sm">{log.message}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {log.timestamp.toLocaleString('pt-BR')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                            {log.userId && (
                              <Badge variant="outline" className="text-xs">
                                Usuário: {log.userId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
