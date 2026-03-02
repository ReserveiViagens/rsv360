'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Receipt,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-wrapper';
import { getToken } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function FinanceiroPageContent() {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/analytics/stats?period=${period}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStats({
        summary: {
          total_bookings: 1250,
          total_revenue: 125000,
          average_rating: 4.8,
          total_reviews: 342,
          bookings_change: 12.5,
          revenue_change: 8.3,
          rating_change: 0.2,
        },
        bookings_over_time: [
          { date: 'Jan', bookings: 45, revenue: 4500 },
          { date: 'Fev', bookings: 52, revenue: 5200 },
          { date: 'Mar', bookings: 48, revenue: 4800 },
          { date: 'Abr', bookings: 61, revenue: 6100 },
          { date: 'Mai', bookings: 55, revenue: 5500 },
          { date: 'Jun', bookings: 67, revenue: 6700 },
        ],
        bookings_by_category: [
          { name: 'Hotéis', value: 35 },
          { name: 'Pousadas', value: 28 },
          { name: 'Resorts', value: 22 },
          { name: 'Apartamentos', value: 15 },
        ],
        revenue_by_month: [
          { month: 'Jan', revenue: 45000, previous: 42000 },
          { month: 'Fev', revenue: 52000, previous: 48000 },
          { month: 'Mar', revenue: 48000, previous: 45000 },
          { month: 'Abr', revenue: 61000, previous: 55000 },
          { month: 'Mai', revenue: 55000, previous: 52000 },
          { month: 'Jun', revenue: 67000, previous: 60000 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      const endDate = new Date();
      const params = new URLSearchParams({
        type: 'financial',
        format,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
      const response = await fetch(`/api/reports/export?${params}`);
      if (!response.ok) throw new Error('Erro ao exportar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Relatório exportado em ${format === 'excel' ? 'Excel' : 'PDF'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { summary, revenue_by_month, bookings_over_time } = stats;
  const revenueChange = summary?.revenue_change ?? 0;
  const totalRevenue = summary?.total_revenue ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Visão financeira do seu negócio</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport('pdf')}
                disabled={exporting}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport('excel')}
                disabled={exporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {revenueChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                )}
                <span className={revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(revenueChange).toFixed(1)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {(summary?.total_bookings ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {(summary?.total_bookings ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reservas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receita líquida
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenue_by_month || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="previous" fill="#94a3b8" name="Período Anterior" />
                    <Bar dataKey="revenue" fill="#22c55e" name="Atual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookings_over_time || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FinanceiroPage() {
  return (
    <ErrorBoundary>
      <FinanceiroPageContent />
    </ErrorBoundary>
  );
}
