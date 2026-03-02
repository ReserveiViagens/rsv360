import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, MapPin, Filter, Download, RefreshCw, Eye, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface AnalyticsData {
  period: string;
  bookings: number;
  revenue: number;
  customers: number;
  satisfaction: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AnalyticsDashboardProps {
  className?: string;
}

const mockAnalyticsData: AnalyticsData[] = [
  { period: 'Jan', bookings: 120, revenue: 45000, customers: 85, satisfaction: 4.2 },
  { period: 'Fev', bookings: 135, revenue: 52000, customers: 92, satisfaction: 4.3 },
  { period: 'Mar', bookings: 150, revenue: 58000, customers: 98, satisfaction: 4.4 },
  { period: 'Abr', bookings: 165, revenue: 62000, customers: 105, satisfaction: 4.5 },
  { period: 'Mai', bookings: 180, revenue: 68000, customers: 112, satisfaction: 4.6 },
  { period: 'Jun', bookings: 195, revenue: 72000, customers: 118, satisfaction: 4.7 },
];

const mockTopDestinations: ChartData[] = [
  { name: 'Rio de Janeiro', value: 45, color: '#3B82F6' },
  { name: 'São Paulo', value: 38, color: '#10B981' },
  { name: 'Salvador', value: 32, color: '#F59E0B' },
  { name: 'Recife', value: 28, color: '#EF4444' },
  { name: 'Fortaleza', value: 25, color: '#8B5CF6' },
];

const mockCustomerSegments: ChartData[] = [
  { name: 'Premium', value: 35, color: '#F59E0B' },
  { name: 'Business', value: 28, color: '#3B82F6' },
  { name: 'Leisure', value: 22, color: '#10B981' },
  { name: 'Group', value: 15, color: '#EF4444' },
];

const mockRevenueTrends = mockAnalyticsData.map(item => ({
  month: item.period,
  revenue: item.revenue,
  bookings: item.bookings,
}));

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<string>('6m');
  const [chartType, setChartType] = useState<string>('bar');

  const timeRangeOptions: SelectOption[] = [
    { value: '1m', label: 'Último Mês' },
    { value: '3m', label: 'Últimos 3 Meses' },
    { value: '6m', label: 'Últimos 6 Meses' },
    { value: '1y', label: 'Último Ano' },
  ];

  const chartTypeOptions: SelectOption[] = [
    { value: 'bar', label: 'Gráfico de Barras' },
    { value: 'line', label: 'Gráfico de Linha' },
    { value: 'area', label: 'Gráfico de Área' },
  ];

  const totalRevenue = useMemo(() => 
    mockAnalyticsData.reduce((sum, item) => sum + item.revenue, 0), []
  );

  const totalBookings = useMemo(() => 
    mockAnalyticsData.reduce((sum, item) => sum + item.bookings, 0), []
  );

  const averageSatisfaction = useMemo(() => 
    mockAnalyticsData.reduce((sum, item) => sum + item.satisfaction, 0) / mockAnalyticsData.length, []
  );

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={mockRevenueTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={mockRevenueTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="bookings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={mockRevenueTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
            <Legend />
            <Bar dataKey="revenue" fill="#3B82F6" />
            <Bar dataKey="bookings" fill="#10B981" />
          </BarChart>
        );
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analítico</h2>
          <p className="text-gray-600">Análises e relatórios detalhados do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={timeRangeOptions}
            placeholder="Selecionar período"
            className="w-40"
          />
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5% vs mês anterior
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBookings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +8.3% vs mês anterior
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
              <p className="text-2xl font-bold text-gray-900">118</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +15.2% vs mês anterior
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfação</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageSatisfaction.toFixed(1)}/5.0
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +0.2 vs mês anterior
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tendências de Receita e Reservas</h3>
          <div className="flex items-center space-x-3">
            <Select
              value={chartType}
              onValueChange={setChartType}
              options={chartTypeOptions}
              placeholder="Tipo de gráfico"
              className="w-40"
            />
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <Activity className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </Card>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Destinos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopDestinations} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Customer Segments */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segmentos de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockCustomerSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockCustomerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights e Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📈 Crescimento Sustentável</h4>
            <p className="text-sm text-blue-700">
              Receita cresceu 12.5% este mês. Considere expandir campanhas de marketing para destinos populares.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">🎯 Satisfação do Cliente</h4>
            <p className="text-sm text-green-700">
              NPS aumentou para 4.7. Mantenha o foco na qualidade do atendimento e experiência do usuário.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">🌍 Destinos Emergentes</h4>
            <p className="text-sm text-yellow-700">
              Salvador e Recife mostram crescimento. Considere parcerias com hotéis locais.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">👥 Segmentação</h4>
            <p className="text-sm text-purple-700">
              Clientes Premium representam 35% da receita. Desenvolva programas de fidelidade específicos.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { AnalyticsDashboard };
export type { AnalyticsData, ChartData, AnalyticsDashboardProps };
