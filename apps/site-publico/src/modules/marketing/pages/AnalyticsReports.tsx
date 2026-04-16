'use client';

import { useState } from 'react';
import { useDashboardOverview, useTimeseries, useChannelBreakdown } from '../hooks/useMarketing';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AnalyticsReports() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const dateMap = { '7d': 7, '30d': 30, '90d': 90 };
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - dateMap[period] * 86400000).toISOString().split('T')[0];

  const { data: overview } = useDashboardOverview({ startDate, endDate });
  const { data: leadsSeries } = useTimeseries('leads', { startDate, endDate, granularity: 'day' });
  const { data: conversionsSeries } = useTimeseries('conversions', { startDate, endDate, granularity: 'day' });
  const { data: channels } = useChannelBreakdown({ startDate, endDate });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Relatórios</h1>
          <p className="text-muted-foreground">Relatórios detalhados de performance do marketing</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-sm ${
                period === p ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'
              }`}
            >
              Últimos {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
          <p className="text-2xl font-bold">{overview?.totalLeads || 0}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Conversões</h3>
          <p className="text-2xl font-bold">{overview?.totalConversions || 0}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Taxa de Conversão</h3>
          <p className="text-2xl font-bold">{overview?.conversionRate ? `${overview.conversionRate.toFixed(1)}%` : '0%'}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Orçamento Total</h3>
          <p className="text-2xl font-bold">R$ {overview?.totalBudget ? overview.totalBudget.toLocaleString('pt-BR') : '0'}</p>
        </div>
      </div>

      {/* Leads Over Time - Line Chart */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Leads ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={leadsSeries?.series || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Leads" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Conversions Over Time - Bar Chart */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Conversões ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionsSeries?.series || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" name="Conversões" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Breakdown - Pie Chart */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Breakdown por Canal</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channels?.channels || []}
                dataKey="leads"
                nameKey="channel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {channels?.channels?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Channels Table */}
          <div className="space-y-2">
            <h4 className="font-medium">Detalhes por Canal</h4>
            <div className="border rounded">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2">Canal</th>
                    <th className="text-right p-2">Leads</th>
                    <th className="text-right p-2">Conversões</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {channels?.channels?.map((channel, i) => (
                    <tr key={channel.channel} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          {channel.channel}
                        </div>
                      </td>
                      <td className="text-right p-2">{channel.leads}</td>
                      <td className="text-right p-2">{channel.conversions}</td>
                      <td className="text-right p-2">R$ {channel.revenue.toLocaleString('pt-BR')}</td>
                      <td className="text-right p-2">{channel.roi.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AnalyticsReports };