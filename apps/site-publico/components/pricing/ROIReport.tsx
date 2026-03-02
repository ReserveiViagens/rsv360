/**
 * ✅ TAREFA HIGH-3: Componente de Relatório de ROI de Precificação
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from '@/lib/lucide-icons';

interface ROISummary {
  total_revenue_increase: number;
  total_revenue_increase_percentage: number;
  total_bookings: number;
  avg_price_increase: number;
  conversion_rate_improvement: number;
  period: {
    start: string;
    end: string;
  };
}

interface ROIHistory {
  id: number;
  property_id: number;
  period_start: string;
  period_end: string;
  base_revenue: number;
  smart_pricing_revenue: number;
  revenue_increase: number;
  revenue_increase_percentage: number;
  bookings_count: number;
  avg_price: number;
  smart_pricing_enabled: boolean;
}

interface ROIReportProps {
  propertyId: number;
}

export function ROIReport({ propertyId }: ROIReportProps) {
  const [summary, setSummary] = useState<ROISummary | null>(null);
  const [history, setHistory] = useState<ROIHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [periodEnd, setPeriodEnd] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadROIData();
  }, [propertyId, periodStart, periodEnd]);

  const loadROIData = async () => {
    try {
      setLoading(true);

      // Calcular ROI para o período
      const calculateResponse = await fetch('/api/pricing/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      });

      if (calculateResponse.ok) {
        const calculateData = await calculateResponse.json();
        // Recalcular summary
        await loadSummary();
      }

      // Carregar histórico
      await loadHistory();
      await loadSummary();
    } catch (error) {
      console.error('Erro ao carregar dados de ROI:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetch(
        `/api/pricing/roi?property_id=${propertyId}&period_start=${periodStart}&period_end=${periodEnd}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && !Array.isArray(data.data)) {
          setSummary(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/pricing/roi?property_id=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setHistory(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando relatório de ROI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <Button onClick={loadROIData}>Atualizar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de ROI */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aumento de Receita</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_revenue_increase)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.total_revenue_increase_percentage.toFixed(2)}% de aumento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_bookings}</div>
              <p className="text-xs text-muted-foreground">No período selecionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.avg_price_increase)}
              </div>
              <p className="text-xs text-muted-foreground">Com Smart Pricing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhoria de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                +{summary.conversion_rate_improvement.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Taxa de conversão</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de ROI</CardTitle>
          <CardDescription>
            Histórico de retorno sobre investimento do Smart Pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado de ROI disponível para este período.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Receita Base</TableHead>
                  <TableHead>Receita Smart Pricing</TableHead>
                  <TableHead>Aumento</TableHead>
                  <TableHead>% Aumento</TableHead>
                  <TableHead>Reservas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.period_start).toLocaleDateString()} -{' '}
                      {new Date(entry.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(entry.base_revenue)}</TableCell>
                    <TableCell>{formatCurrency(entry.smart_pricing_revenue)}</TableCell>
                    <TableCell>
                      <span className={entry.revenue_increase >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(entry.revenue_increase)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.revenue_increase_percentage >= 0 ? 'default' : 'destructive'}
                      >
                        {entry.revenue_increase_percentage >= 0 ? '+' : ''}
                        {entry.revenue_increase_percentage.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.bookings_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

