'use client';

/**
 * Componente: Benchmark de Concorrentes
 * Tabela comparativa, gráficos e métricas-chave
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign,
  Loader2, RefreshCw, BarChart3, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Competitor {
  name: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  data_points: number;
}

interface CompetitorBenchmarkData {
  property: {
    id: number;
    name: string;
    current_price: number;
    avg_booking_value: number;
    total_bookings: number;
    avg_rating: number;
  };
  competitors: Competitor[];
  benchmarking: {
    market_avg_price: number;
    price_position: 'above' | 'below' | 'competitive';
    price_difference_percent: number;
    recommendation: string;
  };
}

interface CompetitorBenchmarkProps {
  propertyId: number;
  className?: string;
}

export function CompetitorBenchmark({ propertyId, className }: CompetitorBenchmarkProps) {
  const [data, setData] = useState<CompetitorBenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBenchmark();
  }, [propertyId]);

  const fetchBenchmark = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/competitor-benchmarking?property_id=${propertyId}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar benchmark');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar benchmark');
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

  const getPricePositionColor = (position: string) => {
    switch (position) {
      case 'above':
        return 'text-red-600';
      case 'below':
        return 'text-green-600';
      case 'competitive':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPricePositionBadge = (position: string) => {
    switch (position) {
      case 'above':
        return { label: 'Acima da Média', variant: 'destructive' as const };
      case 'below':
        return { label: 'Abaixo da Média', variant: 'default' as const };
      case 'competitive':
        return { label: 'Competitivo', variant: 'secondary' as const };
      default:
        return { label: position, variant: 'outline' as const };
    }
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

  // Preparar dados para gráfico
  const chartData = [
    {
      name: 'Sua Propriedade',
      preço: data.property.current_price,
      média_mercado: data.benchmarking.market_avg_price,
    },
    ...data.competitors.map(c => ({
      name: c.name,
      preço: c.avg_price,
      média_mercado: data.benchmarking.market_avg_price,
    })),
  ];

  const positionBadge = getPricePositionBadge(data.benchmarking.price_position);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Benchmark de Concorrentes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchBenchmark}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações da Propriedade */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{data.property.name}</h3>
                <p className="text-sm text-gray-600">ID: {data.property.id}</p>
              </div>
              <Badge variant={positionBadge.variant}>
                {positionBadge.label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Preço Atual</div>
                <div className="text-lg font-bold">
                  {formatCurrency(data.property.current_price)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
                <div className="text-lg font-bold">
                  {formatCurrency(data.property.avg_booking_value)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Reservas</div>
                <div className="text-lg font-bold">
                  {data.property.total_bookings}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avaliação</div>
                <div className="text-lg font-bold">
                  {data.property.avg_rating.toFixed(1)} ⭐
                </div>
              </div>
            </div>
          </div>

          {/* Posicionamento de Preço */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Posicionamento de Preço</span>
              <span className={`font-bold ${getPricePositionColor(data.benchmarking.price_position)}`}>
                {data.benchmarking.price_difference_percent > 0 ? '+' : ''}
                {data.benchmarking.price_difference_percent.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Média do mercado: {formatCurrency(data.benchmarking.market_avg_price)}
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {data.benchmarking.recommendation}
              </AlertDescription>
            </Alert>
          </div>

          {/* Gráfico Comparativo */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
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
                <Bar dataKey="preço" fill="#3b82f6" name="Preço" />
                <Bar dataKey="média_mercado" fill="#10b981" name="Média do Mercado" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela de Concorrentes */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Concorrentes</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concorrente</TableHead>
                    <TableHead>Preço Médio</TableHead>
                    <TableHead>Preço Mínimo</TableHead>
                    <TableHead>Preço Máximo</TableHead>
                    <TableHead>Pontos de Dados</TableHead>
                    <TableHead>Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.competitors.map((competitor, index) => {
                    const difference = ((competitor.avg_price - data.property.current_price) / data.property.current_price) * 100;
                    const isCheaper = competitor.avg_price < data.property.current_price;

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {competitor.name}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(competitor.avg_price)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(competitor.min_price)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(competitor.max_price)}
                        </TableCell>
                        <TableCell>
                          {competitor.data_points}
                        </TableCell>
                        <TableCell>
                          <span className={isCheaper ? 'text-green-600' : 'text-red-600'}>
                            {isCheaper ? '-' : '+'}
                            {Math.abs(difference).toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Métricas-Chave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Concorrentes Analisados</div>
              <div className="text-2xl font-bold">
                {data.competitors.length}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Média do Mercado</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(data.benchmarking.market_avg_price)}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Posição</div>
              <div className="text-2xl font-bold">
                {data.benchmarking.price_position === 'above' ? (
                  <span className="text-red-600">Acima</span>
                ) : data.benchmarking.price_position === 'below' ? (
                  <span className="text-green-600">Abaixo</span>
                ) : (
                  <span className="text-blue-600">Competitivo</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

