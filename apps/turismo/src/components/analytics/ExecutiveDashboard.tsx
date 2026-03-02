'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Package, 
  MapPin, 
  Clock, 
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Tipos para o dashboard
interface KPI {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface DashboardMetric {
  id: string;
  name: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Dados mock para demonstração
const mockChartData = {
  sales: [
    { month: 'Jan', sales: 4000, profit: 2400, orders: 240 },
    { month: 'Fev', sales: 3000, profit: 1398, orders: 221 },
    { month: 'Mar', sales: 2000, profit: 9800, orders: 290 },
    { month: 'Abr', sales: 2780, profit: 3908, orders: 200 },
    { month: 'Mai', sales: 1890, profit: 4800, orders: 218 },
    { month: 'Jun', sales: 2390, profit: 3800, orders: 250 },
    { month: 'Jul', sales: 3490, profit: 4300, orders: 210 },
  ],
  users: [
    { month: 'Jan', active: 1200, new: 150, churn: 50 },
    { month: 'Fev', active: 1350, new: 180, churn: 45 },
    { month: 'Mar', active: 1480, new: 200, churn: 40 },
    { month: 'Abr', active: 1620, new: 220, churn: 35 },
    { month: 'Mai', active: 1750, new: 240, churn: 30 },
    { month: 'Jun', active: 1880, new: 260, churn: 25 },
    { month: 'Jul', active: 2000, new: 280, churn: 20 },
  ],
  regions: [
    { name: 'Norte', sales: 4000, users: 2400, growth: 12 },
    { name: 'Sul', sales: 3000, users: 1398, growth: 8 },
    { name: 'Leste', sales: 2000, users: 9800, growth: 15 },
    { name: 'Oeste', sales: 2780, users: 3908, growth: 10 },
    { name: 'Centro', sales: 1890, users: 4800, growth: 18 },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ExecutiveDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['sales', 'users', 'profit']);

  // KPIs principais
  const kpis: KPI[] = useMemo(() => [
    {
      id: 'revenue',
      title: 'Receita Total',
      value: 1250000,
      change: 12.5,
      changeType: 'increase',
      target: 1500000,
      unit: 'R$',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-green-600'
    },
    {
      id: 'users',
      title: 'Usuários Ativos',
      value: 12500,
      change: 8.2,
      changeType: 'increase',
      target: 15000,
      unit: '',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      value: 2840,
      change: -2.1,
      changeType: 'decrease',
      target: 3000,
      unit: '',
      icon: <Package className="h-6 w-6" />,
      color: 'text-orange-600'
    },
    {
      id: 'conversion',
      title: 'Taxa de Conversão',
      value: 3.2,
      change: 0.8,
      changeType: 'increase',
      target: 4.0,
      unit: '%',
      icon: <Target className="h-6 w-6" />,
      color: 'text-purple-600'
    }
  ], []);

  // Métricas de performance
  const performanceMetrics: DashboardMetric[] = useMemo(() => [
    {
      id: 'avgOrder',
      name: 'Ticket Médio',
      current: 440.35,
      previous: 420.80,
      change: 4.6,
      trend: 'up'
    },
    {
      id: 'customerLifetime',
      name: 'Lifetime Value',
      current: 1250.00,
      previous: 1180.00,
      change: 5.9,
      trend: 'up'
    },
    {
      id: 'churnRate',
      name: 'Taxa de Churn',
      current: 2.1,
      previous: 2.8,
      change: -25.0,
      trend: 'down'
    },
    {
      id: 'responseTime',
      name: 'Tempo de Resposta',
      current: 1.2,
      previous: 1.8,
      change: -33.3,
      trend: 'down'
    }
  ], []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Simular atualização de dados
      toast.info('Dados atualizados automaticamente');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Função para formatar valores
  const formatValue = (value: number, unit: string = '') => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit}`;
    }
    return `${value.toLocaleString()}${unit}`;
  };

  // Função para calcular progresso
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-2">
            Visão geral em tempo real do desempenho do negócio
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último dia</SelectItem>
                <SelectItem value="7d">Última semana</SelectItem>
                <SelectItem value="30d">Último mês</SelectItem>
                <SelectItem value="90d">Último trimestre</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => toast.success('Dados atualizados!')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${kpi.color.replace('text-', 'bg-')} bg-opacity-10`}>
                  {kpi.icon}
                </div>
                <Badge 
                  variant={kpi.changeType === 'increase' ? 'default' : 'secondary'}
                  className={kpi.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {kpi.changeType === 'increase' ? '+' : ''}{kpi.change}%
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatValue(kpi.value, kpi.unit)}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Meta</span>
                  <span className="font-medium">{formatValue(kpi.target, kpi.unit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(kpi.value, kpi.target)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vendas e Lucros</CardTitle>
                <CardDescription>Evolução mensal das vendas e lucros</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData.sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Vendas" />
                <Bar dataKey="profit" fill="#82ca9d" name="Lucros" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Usuários */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Crescimento de Usuários</CardTitle>
                <CardDescription>Novos usuários e taxa de retenção</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockChartData.users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="active" stackId="1" stroke="#8884d8" fill="#8884d8" name="Ativos" />
                <Area type="monotone" dataKey="new" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Novos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>
            Indicadores chave de desempenho e comparação com período anterior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.id} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <Activity className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.name}</h3>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {metric.current.toLocaleString()}
                </p>
                <p className={`text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% vs anterior
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Região */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Região</CardTitle>
          <CardDescription>Análise comparativa de vendas e usuários por região</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - Distribuição por Região */}
            <div>
              <h4 className="text-lg font-medium mb-4">Distribuição de Vendas</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={mockChartData.regions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {mockChartData.regions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Dados */}
            <div>
              <h4 className="text-lg font-medium mb-4">Dados Detalhados</h4>
              <div className="space-y-3">
                {mockChartData.regions.map((region) => (
                  <div key={region.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{region.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatValue(region.sales, 'R$')}</p>
                      <p className="text-sm text-gray-600">
                        {region.users} usuários • +{region.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Dashboard</CardTitle>
          <CardDescription>
            Personalize a atualização automática e métricas exibidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Atualização Automática</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoRefresh" className="text-sm">Ativar atualização automática</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Intervalo (segundos)</label>
                  <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60">1min</SelectItem>
                      <SelectItem value="300">5min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Métricas Exibidas</h4>
              <div className="space-y-2">
                {['sales', 'users', 'profit', 'orders', 'conversion'].map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={metric}
                      checked={selectedMetrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics(prev => [...prev, metric]);
                        } else {
                          setSelectedMetrics(prev => prev.filter(m => m !== metric));
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={metric} className="text-sm capitalize">{metric}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Ações Rápidas</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Configurar Filtros
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Configurar Alertas
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
