'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OccupancyChartProps {
  data?: Array<{ date: string; rate: number }>;
  loading?: boolean;
  targetRate?: number;
}

export function OccupancyChart({ data = [], loading, targetRate = 85 }: OccupancyChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data.length > 0
    ? data.map((point) => ({
        date: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        rate: point.rate,
      }))
    : [
        { date: '21', rate: 85 },
        { date: '22', rate: 87 },
        { date: '23', rate: 89 },
        { date: '24', rate: 88 },
        { date: '25', rate: 90 },
        { date: '26', rate: 89 },
        { date: '27', rate: 91 },
        { date: '28', rate: 89 },
        { date: '29', rate: 88 },
      ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Ocupação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number) => [`${value}%`, 'Ocupação']}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRate)"
          />
          {/* Linha de meta */}
          <Line
            type="monotone"
            dataKey={() => targetRate}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Meta"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Meta: {targetRate}%</span>
        </div>
      </div>
    </div>
  );
}

interface AuctionPerformanceChartProps {
  data?: {
    byStatus?: Array<{ status: string; count: number }>;
    wonVsLost?: { won: number; lost: number };
  };
  loading?: boolean;
}

export function AuctionPerformanceChart({ data, loading }: AuctionPerformanceChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const pieData = data?.wonVsLost
    ? [
        { name: 'Vencidos', value: data.wonVsLost.won, color: '#10b981' },
        { name: 'Perdidos', value: data.wonVsLost.lost, color: '#ef4444' },
      ]
    : [
        { name: 'Vencidos', value: 15, color: '#10b981' },
        { name: 'Perdidos', value: 7, color: '#ef4444' },
      ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance de Leilões</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BidDistributionChartProps {
  data?: Array<{ range: string; count: number }>;
  loading?: boolean;
}

export function BidDistributionChart({ data = [], loading }: BidDistributionChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data.length > 0
    ? data
    : [
        { range: '0-500', count: 45 },
        { range: '500-1000', count: 120 },
        { range: '1000-2000', count: 85 },
        { range: '2000-5000', count: 60 },
        { range: '5000+', count: 25 },
      ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Lances</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="range"
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
