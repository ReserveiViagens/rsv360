'use client';

/**
 * Componente: Dashboard Principal de Analytics
 * Layout principal, integração de componentes, filtros globais e exportação
 */

import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, Download,
  Loader2, RefreshCw, BarChart3, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RevenueForecast } from './RevenueForecast';
import { DemandHeatmap } from './DemandHeatmap';
import { CompetitorBenchmark } from './CompetitorBenchmark';
import { AnalyticsInsights } from './AnalyticsInsights';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardData {
  kpis: {
    totalRevenue: number;
    totalBookings: number;
    avgOccupancy: number;
    avgBookingValue: number;
  };
  revenue: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  occupancy: Array<{
    date: string;
    total_properties: number;
    booked_properties: number;
    occupancy_rate: number;
  }>;
  bookingsByStatus: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  topProperties: Array<{
    property_id: number;
    property_name: string;
    bookings: number;
    revenue: number;
    avg_booking_value: number;
  }>;
  comparison: {
    bookings: {
      current: number;
      previous: number;
      change: number;
    };
    revenue: {
      current: number;
      previous: number;
      change: number;
    };
  };
}

interface AnalyticsDashboardProps {
  propertyId?: number;
  className?: string;
}

export function AnalyticsDashboard({ propertyId, className }: AnalyticsDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(propertyId);

  useEffect(() => {
    fetchDashboard();
  }, [selectedPropertyId, startDate, endDate]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('start_date', new Date(startDate).toISOString());
      params.append('end_date', new Date(endDate).toISOString());
      if (selectedPropertyId) {
        params.append('property_id', selectedPropertyId.toString());
      }

      const response = await fetch(`/api/analytics/dashboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!dashboardData) return;

    const exportData = {
      periodo: {
        inicio: startDate,
        fim: endDate,
      },
      kpis: dashboardData.kpis,
      receita: dashboardData.revenue,
      ocupacao: dashboardData.occupancy,
      comparacao: dashboardData.comparison,
      exportado_em: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${startDate}-${endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filtros Globais */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Propriedade</label>
              <Input
                type="number"
                placeholder="ID da propriedade (opcional)"
                value={selectedPropertyId || ''}
                onChange={(e) => setSelectedPropertyId(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchDashboard} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.kpis.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {dashboardData.comparison.revenue.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
              )}
              <span className={dashboardData.comparison.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(dashboardData.comparison.revenue.change).toFixed(1)}%
              </span>
              <span>vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.kpis.totalBookings.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {dashboardData.comparison.bookings.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
              )}
              <span className={dashboardData.comparison.bookings.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(dashboardData.comparison.bookings.change).toFixed(1)}%
              </span>
              <span>vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.kpis.avgOccupancy.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Taxa média de ocupação
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.kpis.avgBookingValue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Valor médio por reserva
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Receita ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ocupação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.occupancy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="occupancy_rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Ocupação (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reservas por Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Reservas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.bookingsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Quantidade" />
              <Bar dataKey="revenue" fill="#10b981" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Propriedades */}
      {dashboardData.topProperties.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Top Propriedades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.topProperties.map((property, index) => (
                <div
                  key={property.property_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{property.property_name}</div>
                      <div className="text-sm text-gray-500">
                        {property.bookings} reservas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {formatCurrency(property.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(property.avg_booking_value)} médio
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

