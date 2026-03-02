'use client';

/**
 * Componente: Previsão de Receita
 * Exibe gráfico de forecast, cenários e fatores de influência
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign,
  Loader2, RefreshCw, Calendar, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RevenueForecastData {
  historical: Array<{
    month: string;
    revenue: number;
    bookings_count: number;
  }>;
  forecasts: Array<{
    month: string;
    forecasted_revenue: number;
    confidence: number;
    growth_rate: number;
    seasonal_factor: number;
  }>;
  average_revenue: number;
  growth_rate: number;
  months_ahead: number;
}

interface RevenueForecastProps {
  propertyId?: number;
  className?: string;
}

export function RevenueForecast({ propertyId, className }: RevenueForecastProps) {
  const [data, setData] = useState<RevenueForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(12);

  useEffect(() => {
    fetchForecast();
  }, [propertyId, months]);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('months', months.toString());
      if (propertyId) {
        params.append('property_id', propertyId.toString());
      }

      const response = await fetch(`/api/analytics/revenue-forecast?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar previsão');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar previsão');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  // Preparar dados para o gráfico
  const chartData = data ? [
    ...data.historical.map((h) => ({
      month: formatMonth(h.month),
      revenue: h.revenue,
      forecast: null,
      type: 'historical',
    })),
    ...data.forecasts.map((f) => ({
      month: formatMonth(f.month),
      revenue: null,
      forecast: f.forecasted_revenue,
      confidence: f.confidence,
      type: 'forecast',
    })),
  ] : [];

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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Previsão de Receita
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={months.toString()} onValueChange={(v) => setMonths(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="18">18 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchForecast}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Receita Média</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(data.average_revenue)}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Taxa de Crescimento</div>
              <div className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-2">
                {data.growth_rate > 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {(data.growth_rate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Previsão Total</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(
                  data.forecasts.reduce((sum, f) => sum + f.forecasted_revenue, 0)
                )}
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Receita Histórica"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Previsão"
                  dot={{ r: 4 }}
                />
                <ReferenceLine 
                  y={data.average_revenue} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3"
                  label={{ value: 'Média', position: 'right' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fatores de Influência */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Fatores de Influência</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.forecasts.slice(0, 6).map((forecast, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {formatMonth(forecast.month)}
                    </span>
                    <Badge variant={forecast.confidence > 0.7 ? 'default' : 'secondary'}>
                      {(forecast.confidence * 100).toFixed(0)}% confiança
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(forecast.forecasted_revenue)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Fator sazonal: {forecast.seasonal_factor.toFixed(2)}x
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cenários */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Cenários</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Otimista</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(
                    data.forecasts.reduce(
                      (sum, f) => sum + f.forecasted_revenue * 1.2,
                      0
                    )
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">+20% crescimento</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Realista</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(
                    data.forecasts.reduce(
                      (sum, f) => sum + f.forecasted_revenue,
                      0
                    )
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">Baseado em tendência</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Conservador</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(
                    data.forecasts.reduce(
                      (sum, f) => sum + f.forecasted_revenue * 0.8,
                      0
                    )
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">-20% crescimento</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

