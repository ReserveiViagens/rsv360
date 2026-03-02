'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  auctionRevenue?: number;
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  loading?: boolean;
  period?: '7d' | '30d' | '90d' | '1y';
  onPeriodChange?: (period: '7d' | '30d' | '90d' | '1y') => void;
}

export function RevenueChart({ data = [], loading, period = '30d', onPeriodChange }: RevenueChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>(period);

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  // Formatar dados para o gráfico
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    revenue: point.revenue,
    auctionRevenue: point.auctionRevenue || point.revenue * 0.8, // Se não tiver auctionRevenue, usar 80% como estimativa
  }));

  // Dados mockados se não houver dados
  const mockData = [
    { date: '21', revenue: 21000, auctionRevenue: 16800 },
    { date: '22', revenue: 22000, auctionRevenue: 17600 },
    { date: '23', revenue: 23000, auctionRevenue: 18400 },
    { date: '24', revenue: 34000, auctionRevenue: 27200 },
    { date: '25', revenue: 55000, auctionRevenue: 44000 },
    { date: '26', revenue: 67000, auctionRevenue: 53600 },
    { date: '27', revenue: 78000, auctionRevenue: 62400 },
    { date: '28', revenue: 89000, auctionRevenue: 71200 },
    { date: '29', revenue: 80000, auctionRevenue: 64000 },
  ];

  const displayData = chartData.length > 0 ? chartData : mockData;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tendências de Receita</h3>
          <p className="text-sm text-gray-500">Receita ao longo do tempo</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '90 dias' : '1 ano'}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value) => (value === 'revenue' ? 'Receita Total' : 'Receita de Leilões')}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="revenue"
          />
          <Line
            type="monotone"
            dataKey="auctionRevenue"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="auctionRevenue"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Receita Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Receita de Leilões</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>+12% vs período anterior</span>
        </div>
      </div>
    </div>
  );
}
