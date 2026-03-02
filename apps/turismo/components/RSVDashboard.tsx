import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Globe,
  Shield,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

// ===================================================================
// COMPONENTE DE DASHBOARD MODULAR PARA RSV 360
// ===================================================================

interface Metric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
}

const RSVDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // ===================================================================
  // MÉTRICAS DO SISTEMA
  // ===================================================================

  useEffect(() => {
    // Simular carregamento de métricas
    const loadMetrics = () => {
      const mockMetrics: Metric[] = [
        {
          id: 'total-services',
          title: 'Serviços Ativos',
          value: '32/32',
          change: 100,
          changeType: 'increase',
          icon: Server,
          color: 'bg-green-500',
          description: 'Todos os microsserviços operacionais'
        },
        {
          id: 'response-time',
          title: 'Tempo de Resposta',
          value: '45ms',
          change: -12,
          changeType: 'increase',
          icon: Zap,
          color: 'bg-blue-500',
          description: 'Tempo médio de resposta das APIs'
        },
        {
          id: 'active-users',
          title: 'Usuários Ativos',
          value: '1,247',
          change: 8.5,
          changeType: 'increase',
          icon: Users,
          color: 'bg-purple-500',
          description: 'Usuários conectados no momento'
        },
        {
          id: 'revenue',
          title: 'Receita Hoje',
          value: 'R$ 12,450',
          change: 15.2,
          changeType: 'increase',
          icon: DollarSign,
          color: 'bg-yellow-500',
          description: 'Receita gerada nas últimas 24h'
        },
        {
          id: 'system-health',
          title: 'Saúde do Sistema',
          value: '98.5%',
          change: 0.3,
          changeType: 'increase',
          icon: Activity,
          color: 'bg-green-500',
          description: 'Uptime geral do sistema'
        },
        {
          id: 'data-processed',
          title: 'Dados Processados',
          value: '2.4TB',
          change: 22.1,
          changeType: 'increase',
          icon: Database,
          color: 'bg-indigo-500',
          description: 'Volume de dados processados hoje'
        }
      ];

      setMetrics(mockMetrics);
      setLoading(false);
    };

    loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // ===================================================================
  // STATUS DOS SERVIÇOS
  // ===================================================================

  useEffect(() => {
    const loadServiceStatus = () => {
      const mockServices: ServiceStatus[] = [
        { id: 'core', name: 'Core API', status: 'online', responseTime: 23, uptime: 99.9, lastCheck: new Date() },
        { id: 'travel', name: 'Travel Management', status: 'online', responseTime: 45, uptime: 99.8, lastCheck: new Date() },
        { id: 'finance', name: 'Finance System', status: 'online', responseTime: 67, uptime: 99.7, lastCheck: new Date() },
        { id: 'payments', name: 'Payment Gateway', status: 'online', responseTime: 89, uptime: 99.9, lastCheck: new Date() },
        { id: 'ecommerce', name: 'E-commerce', status: 'warning', responseTime: 156, uptime: 98.5, lastCheck: new Date() },
        { id: 'notifications', name: 'Notifications', status: 'online', responseTime: 34, uptime: 99.6, lastCheck: new Date() }
      ];

      setServices(mockServices);
    };

    loadServiceStatus();
    
    // Atualizar status a cada 10 segundos
    const interval = setInterval(loadServiceStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-50';
      case 'warning': return 'text-yellow-500 bg-yellow-50';
      case 'offline': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'offline': return AlertCircle;
      default: return Clock;
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return TrendingUp;
      case 'decrease': return TrendingDown;
      default: return Activity;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-500';
      case 'decrease': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===================================================================
          MÉTRICAS PRINCIPAIS
          =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const ChangeIcon = getChangeIcon(metric.changeType);
          
          return (
            <div
              key={metric.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                  <ChangeIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {metric.title}
                </p>
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================================
          STATUS DOS SERVIÇOS
          =================================================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Status dos Serviços</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Atualizado agora</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(service.status)}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        Uptime: {service.uptime}% • Última verificação: {service.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {service.responseTime}ms
                    </div>
                    <div className="text-xs text-gray-500">
                      Tempo de resposta
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================
          GRÁFICOS E ANÁLISES
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de Performance</p>
              <p className="text-sm text-gray-400">Integração com Chart.js em breve</p>
            </div>
          </div>
        </div>

        {/* Distribuição de Serviços */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Distribuição</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Distribuição de Serviços</p>
              <p className="text-sm text-gray-400">Gráfico de pizza em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVDashboard;
