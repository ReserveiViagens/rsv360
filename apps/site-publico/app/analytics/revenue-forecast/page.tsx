"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-wrapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface Forecast {
  month: string;
  forecasted_revenue: number;
  confidence: number;
  growth_rate: number;
  seasonal_factor: number;
}

interface ForecastData {
  historical: Array<{
    month: string;
    revenue: number;
    bookings_count: number;
  }>;
  forecasts: Forecast[];
  average_revenue: number;
  growth_rate: number;
  months_ahead: number;
}

export default function RevenueForecastPage() {
  const { user, authenticatedFetch } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState<string>('12');
  const [propertyId, setPropertyId] = useState<string>('');
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        months,
      });
      if (propertyId) {
        params.append('property_id', propertyId);
      }

      const response = await authenticatedFetch(`/api/analytics/revenue-forecast?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setForecastData(result.data);
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao carregar previsão',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar previsão',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadForecast();
    }
  }, [user, months, propertyId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Previsão de Receita</h1>
        <p className="text-muted-foreground">
          Visualize previsões de receita futura baseadas em dados históricos
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>Defina os parâmetros para a previsão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="months">Meses à Frente</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="property_id">ID da Propriedade (opcional)</Label>
              <Input
                id="property_id"
                type="number"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Deixe vazio para todas"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadForecast} disabled={loading} className="w-full">
                {loading ? <LoadingSpinner /> : 'Atualizar Previsão'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {forecastData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(forecastData.average_revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">por mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {forecastData.growth_rate > 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">
                      {(forecastData.growth_rate * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">mensal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Total Prevista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        forecastData.forecasts.reduce(
                          (sum, f) => sum + f.forecasted_revenue,
                          0
                        )
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      próximos {forecastData.months_ahead} meses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Previsões Mensais</CardTitle>
              <CardDescription>
                Receita prevista para os próximos {forecastData.months_ahead} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mês</th>
                      <th className="text-right p-2">Receita Prevista</th>
                      <th className="text-right p-2">Confiança</th>
                      <th className="text-right p-2">Fator Sazonal</th>
                      <th className="text-right p-2">Taxa de Crescimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.forecasts.map((forecast, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{formatMonth(forecast.month)}</td>
                        <td className="text-right p-2 font-semibold">
                          {formatCurrency(forecast.forecasted_revenue)}
                        </td>
                        <td className="text-right p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              forecast.confidence > 0.8
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : forecast.confidence > 0.6
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {(forecast.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="text-right p-2 text-sm text-muted-foreground">
                          {(forecast.seasonal_factor * 100).toFixed(0)}%
                        </td>
                        <td className="text-right p-2 text-sm text-muted-foreground">
                          {(forecast.growth_rate * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {forecastData.historical.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Receita</CardTitle>
                <CardDescription>Dados históricos utilizados para a previsão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Mês</th>
                        <th className="text-right p-2">Receita</th>
                        <th className="text-right p-2">Reservas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.historical.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{formatMonth(item.month)}</td>
                          <td className="text-right p-2 font-semibold">
                            {formatCurrency(parseFloat(item.revenue.toString()))}
                          </td>
                          <td className="text-right p-2">{item.bookings_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

