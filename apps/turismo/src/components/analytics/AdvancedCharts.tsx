// ===================================================================
// ADVANCED CHARTS - GRÁFICOS AVANÇADOS COM INTERATIVIDADE
// ===================================================================

import React, { useState, useMemo } from 'react';
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

interface AdvancedChartsProps {
  data: any;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ data, selectedMetric, onMetricChange }) => {
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // ===================================================================
  // DADOS PROCESSADOS
  // ===================================================================

  const processedData = useMemo(() => {
    if (!data) return null;

    // Dados para gráfico de correlação
    const correlationData = data.destinations?.map((dest: any) => ({
      bookings: dest.bookings,
      revenue: dest.revenue,
      rating: dest.rating * 1000, // Escalar para visualização
      name: dest.name
    })) || [];

    // Dados para radar chart
    const radarData = [
      { metric: 'Receita', A: data.summary?.totalRevenue / 1000 || 0, fullMark: 200 },
      { metric: 'Reservas', A: data.summary?.totalBookings / 10 || 0, fullMark: 150 },
      { metric: 'Clientes', A: data.summary?.activeCustomers / 10 || 0, fullMark: 100 },
      { metric: 'Avaliação', A: (data.summary?.averageRating || 0) * 20, fullMark: 100 },
      { metric: 'Conversão', A: data.summary?.conversionRate || 0, fullMark: 30 }
    ];

    // Dados para treemap
    const treemapData = data.destinations?.map((dest: any) => ({
      name: dest.name,
      size: dest.revenue,
      bookings: dest.bookings,
      rating: dest.rating
    })) || [];

    return {
      correlationData,
      radarData,
      treemapData
    };
  }, [data]);

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getColorByValue = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.8) return '#10B981';
    if (intensity > 0.6) return '#3B82F6';
    if (intensity > 0.4) return '#F59E0B';
    return '#EF4444';
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (!data || !processedData) return null;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          CONTROLES DE MÉTRICAS
          =================================================================== */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Análise Avançada</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Métrica:</span>
            <select
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              title="Selecionar métrica para análise"
              aria-label="Selecionar métrica para análise"
            >
              <option value="revenue">Receita</option>
              <option value="bookings">Reservas</option>
              <option value="customers">Clientes</option>
              <option value="rating">Avaliação</option>
            </select>
          </div>
        </div>

        {/* ===================================================================
            GRÁFICO DE CORRELAÇÃO
            =================================================================== */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">Correlação: Reservas vs Receita</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={processedData.correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="bookings" 
                name="Reservas"
                label={{ value: 'Número de Reservas', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="revenue" 
                name="Receita"
                label={{ value: 'Receita (R$)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name, props) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                  name === 'revenue' ? 'Receita' : 'Reservas'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.name;
                  }
                  return '';
                }}
              />
              <Scatter 
                dataKey="revenue" 
                fill="#3B82F6"
                onMouseEnter={(data) => setHoveredData(data)}
                onMouseLeave={() => setHoveredData(null)}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* ===================================================================
            GRÁFICO RADAR
            =================================================================== */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">Performance Geral</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={processedData.radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 200]} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Tooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(1) : value,
                  'Performance'
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ===================================================================
            TREEMAP DE DESTINOS
            =================================================================== */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Distribuição de Receita por Destino</h4>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={processedData.treemapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
            >
              <Tooltip 
                formatter={(value, name, props) => [
                  formatCurrency(Number(value)),
                  'Receita'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.name} - ${formatNumber(data.bookings)} reservas`;
                  }
                  return '';
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================================
          GRÁFICOS DE TENDÊNCIAS
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendência de Receita */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Tendência de Receita</h4>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Crescimento */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Taxa de Crescimento</h4>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Crescimento']}
              />
              <Bar 
                dataKey="growth" 
                fill={(entry: any) => getColorByValue(entry.growth, 30)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================================
          INSIGHTS E RECOMENDAÇÕES
          =================================================================== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Insights e Recomendações</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h5 className="font-medium text-green-800">Crescimento Positivo</h5>
            </div>
            <p className="text-sm text-green-700">
              Sua receita cresceu {data.summary?.monthlyGrowth}% este mês. 
              Continue investindo em marketing digital.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h5 className="font-medium text-blue-800">Meta de Conversão</h5>
            </div>
            <p className="text-sm text-blue-700">
              Taxa de conversão em {data.summary?.conversionRate}%. 
              Foque em otimizar o funil de vendas.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h5 className="font-medium text-yellow-800">Oportunidade</h5>
            </div>
            <p className="text-sm text-yellow-700">
              Fernando de Noronha tem alta demanda. 
              Considere aumentar a oferta de pacotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
