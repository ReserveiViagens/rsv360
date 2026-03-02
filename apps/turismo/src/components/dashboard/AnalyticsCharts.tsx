import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// 🎯 TIPOS PARA OS DADOS DOS GRÁFICOS
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface AnalyticsChartsProps {
  revenueData: ChartData[];
  bookingsData: ChartData[];
  destinationsData: ChartData[];
  customerSatisfaction: ChartData[];
  loading?: boolean;
}

// 🎨 COMPONENTE DE GRÁFICO DE LINHA - RECEITA MENSAL
export const RevenueLineChart: React.FC<{ data: ChartData[]; loading?: boolean }> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        📈 Receita Mensal - Caldas Novas
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value}k`}
          />
          <Tooltip 
            formatter={(value: number) => [`R$ ${value}k`, 'Receita']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 🎨 COMPONENTE DE GRÁFICO DE BARRAS - RESERVAS POR DESTINO
export const BookingsBarChart: React.FC<{ data: ChartData[]; loading?: boolean }> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        🗺️ Reservas por Destino
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Reservas']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#10B981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 🎨 COMPONENTE DE GRÁFICO DE PIZZA - SATISFAÇÃO DOS CLIENTES
export const CustomerSatisfactionPieChart: React.FC<{ data: ChartData[]; loading?: boolean }> = ({ 
  data, 
  loading = false 
}) => {
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-neutral-200 rounded-full w-64 mx-auto"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
        ⭐ Satisfação dos Clientes
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Clientes']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 🎨 COMPONENTE DE GRÁFICO DE ÁREA - CRESCIMENTO DE CLIENTES
export const CustomerGrowthAreaChart: React.FC<{ data: ChartData[]; loading?: boolean }> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        👥 Crescimento de Clientes
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Clientes']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stackId="1"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 🎨 COMPONENTE DE GRÁFICO RADAR - ANÁLISE DE DESTINOS
export const DestinationsRadarChart: React.FC<{ data: ChartData[]; loading?: boolean }> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
        🎯 Análise de Destinos
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <PolarRadiusAxis 
            stroke="#6B7280"
            fontSize={10}
          />
          <Radar
            name="Popularidade"
            dataKey="value"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 🎯 COMPONENTE PRINCIPAL ANALYTICSCHARTS
export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ 
  revenueData, 
  bookingsData, 
  destinationsData, 
  customerSatisfaction, 
  loading = false 
}) => {
  // 🎭 ANIMAÇÕES
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const chartVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* 📈 Gráfico de Receita */}
      <motion.div variants={chartVariants}>
        <RevenueLineChart data={revenueData} loading={loading} />
      </motion.div>

      {/* 📊 Gráficos em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={chartVariants}>
          <BookingsBarChart data={bookingsData} loading={loading} />
        </motion.div>
        
        <motion.div variants={chartVariants}>
          <CustomerSatisfactionPieChart data={customerSatisfaction} loading={loading} />
        </motion.div>
      </div>

      {/* 📈 Gráficos Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={chartVariants}>
          <CustomerGrowthAreaChart data={revenueData} loading={loading} />
        </motion.div>
        
        <motion.div variants={chartVariants}>
          <DestinationsRadarChart data={destinationsData} loading={loading} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// 🚀 EXPORTAR COMPONENTE PRINCIPAL
export default AnalyticsCharts;
