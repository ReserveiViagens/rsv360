/**
 * ✅ FASE 2 - ETAPA 2.2: Componente PricingChart
 * Gráfico de preços ao longo do tempo com comparação
 * 
 * @module components/pricing/PricingChart
 */

'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface PricingChartProps {
  propertyId: string;
  data: Array<{
    date: string;
    price: number;
    suggestedPrice?: number;
    demand?: number;
  }>;
  isLoading?: boolean;
}

export default function PricingChart({ propertyId, data, isLoading }: PricingChartProps) {
  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item) => ({
      date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
      fullDate: item.date,
      precoReal: item.price,
      precoSugerido: item.suggestedPrice || item.price,
      demanda: item.demand || 0
    }));
  }, [data]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const prices = data.map(d => d.price);
    const suggested = data.map(d => d.suggestedPrice || d.price);
    
    return {
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      avgSuggested: suggested.reduce((a, b) => a + b, 0) / suggested.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      difference: suggested.reduce((a, b) => a + b, 0) / suggested.length - prices.reduce((a, b) => a + b, 0) / prices.length
    };
  }, [data]);

  // Exportar gráfico como imagem
  const handleExport = async () => {
    try {
      const chartElement = document.querySelector('[data-chart="pricing-chart"]');
      if (!chartElement) {
        toast.error('Elemento do gráfico não encontrado');
        return;
      }

      // Dynamic import para reduzir bundle size
      const html2canvas = (await import('html2canvas')).default;
      
      toast.loading('Gerando imagem...', { id: 'export-chart' });
      
      const canvas = await html2canvas(chartElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Converter para blob e download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Erro ao gerar imagem', { id: 'export-chart' });
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grafico-precos-${propertyId}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Gráfico exportado com sucesso!', { id: 'export-chart' });
      }, 'image/png');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar gráfico', { id: 'export-chart' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Preços</CardTitle>
          <CardDescription>Comparação entre preço real e sugerido</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Preços</CardTitle>
          <CardDescription>Nenhum dado disponível para o período selecionado</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gráfico de Preços</CardTitle>
            <CardDescription>
              Comparação entre preço real e preço sugerido por IA
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Preço Médio Real</p>
              <p className="text-lg font-semibold">
                R$ {stats.avgPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preço Médio Sugerido</p>
              <p className="text-lg font-semibold text-blue-600">
                R$ {stats.avgSuggested.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diferença</p>
              <p className={`text-lg font-semibold ${stats.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.difference > 0 ? '+' : ''}R$ {stats.difference.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Variação</p>
              <p className="text-lg font-semibold">
                R$ {stats.minPrice.toFixed(2)} - R$ {stats.maxPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div data-chart="pricing-chart">
          <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'precoReal') return [`R$ ${value.toFixed(2)}`, 'Preço Real'];
                if (name === 'precoSugerido') return [`R$ ${value.toFixed(2)}`, 'Preço Sugerido'];
                if (name === 'demanda') return [`${value.toFixed(0)}%`, 'Demanda'];
                return [value, name];
              }}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Legend 
              formatter={(value) => {
                if (value === 'precoReal') return 'Preço Real';
                if (value === 'precoSugerido') return 'Preço Sugerido';
                return value;
              }}
            />
            <ReferenceLine 
              y={stats?.avgPrice} 
              stroke="#8884d8" 
              strokeDasharray="3 3"
              label={{ value: 'Média Real', position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="precoReal"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="precoReal"
            />
            <Line
              type="monotone"
              dataKey="precoSugerido"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="precoSugerido"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>

        {/* Insights */}
        {stats && stats.difference > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              💡 Insight: A IA sugere um aumento médio de R$ {stats.difference.toFixed(2)} por noite.
              Isso poderia aumentar sua receita em aproximadamente{' '}
              {((stats.difference / stats.avgPrice) * 100).toFixed(1)}%.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

