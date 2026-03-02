// ===================================================================
// ANALYTICS DASHBOARD - DASHBOARD AVANÇADO COM GRÁFICOS INTERATIVOS
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Star,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface AnalyticsData {
  revenue: RevenueData[];
  bookings: BookingData[];
  customers: CustomerData[];
  destinations: DestinationData[];
  performance: PerformanceData[];
  summary: SummaryData;
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  averageValue: number;
  growth: number;
}

interface BookingData {
  date: string;
  confirmed: number;
  pending: number;
  cancelled: number;
  total: number;
}

interface CustomerData {
  segment: string;
  count: number;
  percentage: number;
  color: string;
}

interface DestinationData {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
  growth: number;
}

interface PerformanceData {
  metric: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface SummaryData {
  totalRevenue: number;
  totalBookings: number;
  activeCustomers: number;
  averageRating: number;
  conversionRate: number;
  monthlyGrowth: number;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // ===================================================================
  // CARREGAMENTO DE DADOS
  // ===================================================================

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Simular carregamento de dados
    setTimeout(() => {
      const mockData: AnalyticsData = {
        revenue: [
          { month: 'Jan', revenue: 45000, bookings: 120, averageValue: 375, growth: 12.5 },
          { month: 'Fev', revenue: 52000, bookings: 135, averageValue: 385, growth: 15.6 },
          { month: 'Mar', revenue: 48000, bookings: 125, averageValue: 384, growth: -7.7 },
          { month: 'Abr', revenue: 61000, bookings: 155, averageValue: 394, growth: 27.1 },
          { month: 'Mai', revenue: 58000, bookings: 148, averageValue: 392, growth: -4.9 },
          { month: 'Jun', revenue: 67000, bookings: 168, averageValue: 399, growth: 15.5 }
        ],
        bookings: [
          { date: '2024-01-01', confirmed: 45, pending: 8, cancelled: 3, total: 56 },
          { date: '2024-01-02', confirmed: 52, pending: 12, cancelled: 2, total: 66 },
          { date: '2024-01-03', confirmed: 48, pending: 6, cancelled: 4, total: 58 },
          { date: '2024-01-04', confirmed: 61, pending: 9, cancelled: 1, total: 71 },
          { date: '2024-01-05', confirmed: 55, pending: 7, cancelled: 3, total: 65 },
          { date: '2024-01-06', confirmed: 68, pending: 11, cancelled: 2, total: 81 },
          { date: '2024-01-07', confirmed: 72, pending: 5, cancelled: 1, total: 78 }
        ],
        customers: [
          { segment: 'Família', count: 450, percentage: 35, color: '#3B82F6' },
          { segment: 'Casal', count: 320, percentage: 25, color: '#10B981' },
          { segment: 'Solo', count: 280, percentage: 22, color: '#F59E0B' },
          { segment: 'Grupo', count: 230, percentage: 18, color: '#EF4444' }
        ],
        destinations: [
          { name: 'Caldas Novas', bookings: 450, revenue: 180000, rating: 4.8, growth: 15.2 },
          { name: 'Porto de Galinhas', bookings: 320, revenue: 160000, rating: 4.7, growth: 8.5 },
          { name: 'Fernando de Noronha', bookings: 180, revenue: 220000, rating: 4.9, growth: 22.1 },
          { name: 'Gramado', bookings: 280, revenue: 140000, rating: 4.6, growth: 12.3 },
          { name: 'Búzios', bookings: 220, revenue: 120000, rating: 4.5, growth: 5.8 }
        ],
        performance: [
          { metric: 'Taxa de Conversão', value: 23.4, target: 25, status: 'good' },
          { metric: 'Satisfação do Cliente', value: 4.7, target: 4.5, status: 'excellent' },
          { metric: 'Tempo de Resposta', value: 2.3, target: 3, status: 'excellent' },
          { metric: 'Taxa de Cancelamento', value: 8.2, target: 5, status: 'warning' },
          { metric: 'Receita por Cliente', value: 1250, target: 1200, status: 'excellent' }
        ],
        summary: {
          totalRevenue: 156800,
          totalBookings: 1247,
          activeCustomers: 892,
          averageRating: 4.7,
          conversionRate: 23.4,
          monthlyGrowth: 15.5
        }
      };

      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="w-4 h-4" />;
      case 'good': return <Activity className="w-4 h-4" />;
      case 'warning': return <TrendingDown className="w-4 h-4" />;
      case 'critical': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
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

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          HEADER COM CONTROLES
          =================================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Análise completa do seu negócio de viagens</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            title="Selecionar período de análise"
            aria-label="Selecionar período de análise"
          >
            <option value="1month">Último mês</option>
            <option value="3months">Últimos 3 meses</option>
            <option value="6months">Últimos 6 meses</option>
            <option value="1year">Último ano</option>
          </select>
          
          <button
            onClick={loadAnalyticsData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          CARDS DE RESUMO
          =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{data.summary.monthlyGrowth}% este mês
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.summary.totalBookings)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12% este mês
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.summary.activeCustomers)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +8% este mês
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.averageRating}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <Star className="w-4 h-4 mr-1" />
            Excelente
          </div>
        </div>
      </div>

      {/* ===================================================================
          GRÁFICOS PRINCIPAIS
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receita */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receita Mensal</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Receita' : name === 'bookings' ? 'Reservas' : 'Crescimento'
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Receita" />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={2} name="Crescimento %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Reservas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Status das Reservas</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.bookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#10B981" fill="#10B981" name="Confirmadas" />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Pendentes" />
              <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#EF4444" fill="#EF4444" name="Canceladas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================================
          GRÁFICOS SECUNDÁRIOS
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Segmentos de Clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Segmentos de Clientes</h3>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.customers}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, percentage }) => `${segment} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.customers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Clientes']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Destinos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Destinos</h3>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.destinations.map((destination, index) => (
              <div key={destination.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{destination.name}</h4>
                    <p className="text-sm text-gray-600">{formatNumber(destination.bookings)} reservas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(destination.revenue)}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{destination.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================
          MÉTRICAS DE PERFORMANCE
          =================================================================== */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Métricas de Performance</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.performance.map((metric, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{metric.metric}</h4>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                  <span className="capitalize">{metric.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.metric.includes('Taxa') ? `${metric.value}%` : 
                   metric.metric.includes('Tempo') ? `${metric.value}s` :
                   formatNumber(metric.value)}
                </span>
                <span className="text-sm text-gray-500">
                  Meta: {metric.metric.includes('Taxa') ? `${metric.target}%` : 
                         metric.metric.includes('Tempo') ? `${metric.target}s` :
                         formatNumber(metric.target)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-500' :
                    metric.status === 'good' ? 'bg-blue-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
