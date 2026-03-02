'use client';

/**
 * Componente: Dashboard CRM
 * Exibe métricas principais, gráficos e top clientes
 */

import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, MessageSquare,
  Loader2, RefreshCw, Calendar, Award, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DashboardMetrics {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  total_revenue: number;
  average_order_value: number;
  total_interactions: number;
  interactions_by_type?: Record<string, number>;
  top_segments?: Array<{
    segment_id: number;
    segment_name: string;
    customer_count: number;
  }>;
  recent_interactions?: Array<any>;
  top_customers?: Array<{
    id: number;
    name: string;
    total_spent: number;
    total_bookings: number;
    loyalty_tier: string;
  }>;
  segment_distribution?: Array<{
    segment_name: string;
    customer_count: number;
  }>;
  revenue_trend?: Array<{
    period: string;
    revenue: number;
  }>;
}

interface CRMDashboardProps {
  className?: string;
  onViewCustomer?: (customerId: number) => void;
}

export function CRMDashboard({ className, onViewCustomer }: CRMDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [segmentFilter, setSegmentFilter] = useState<string>('');

  useEffect(() => {
    fetchMetrics();
  }, [dateRange, segmentFilter]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);
        params.append('date_from', dateFrom.toISOString());
      }
      
      if (segmentFilter) {
        params.append('segment_id', segmentFilter);
      }

      // Buscar métricas do dashboard
      const dashboardResponse = await fetch(`/api/crm/dashboard?${params.toString()}`);

      if (!dashboardResponse.ok) {
        const errorData = await dashboardResponse.json();
        throw new Error(errorData.error || 'Erro ao carregar métricas');
      }

      const dashboardResult = await dashboardResponse.json();
      const dashboardData = dashboardResult.data;

      // Buscar top clientes
      const customersParams = new URLSearchParams();
      customersParams.append('limit', '10');
      customersParams.append('page', '1');
      customersParams.append('sort_by', 'total_spent');
      customersParams.append('sort_order', 'desc');

      const customersResponse = await fetch(`/api/crm/customers?${customersParams.toString()}`);
      let topCustomers: any[] = [];
      
      if (customersResponse.ok) {
        const customersResult = await customersResponse.json();
        topCustomers = (customersResult.data || []).map((customer: any) => ({
          id: customer.id,
          name: customer.user_name || customer.customer_name || `Cliente #${customer.id}`,
          total_spent: customer.total_spent || 0,
          total_bookings: customer.total_bookings || 0,
          loyalty_tier: customer.loyalty_tier || 'bronze',
        }));
      }

      setMetrics({
        ...dashboardData,
        top_customers: topCustomers,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar métricas');
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

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800',
      diamond: 'bg-purple-100 text-purple-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
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

  if (!metrics) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const activeRate = metrics.total_customers > 0
    ? (metrics.active_customers / metrics.total_customers) * 100
    : 0;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header com Filtros */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard CRM</h1>
            <p className="text-gray-500 mt-1">Visão geral do relacionamento com clientes</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchMetrics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total_customers}</div>
              <div className="text-sm text-gray-500 mt-1">
                {metrics.active_customers} ativos ({activeRate.toFixed(1)}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Novos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.new_customers}</div>
              <div className="text-sm text-gray-500 mt-1">
                No período selecionado
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(metrics.total_revenue)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Ticket médio: {formatCurrency(metrics.average_order_value)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Interações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total_interactions}</div>
              <div className="text-sm text-gray-500 mt-1">
                Total de interações
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Distribuições */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Segmento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Segmentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.top_segments && metrics.top_segments.length > 0 ? (
                <div className="space-y-4">
                  {metrics.top_segments.map((segment, index) => {
                    const maxCount = Math.max(
                      ...metrics.top_segments!.map(s => parseInt(s.customer_count || '0')),
                      1
                    );
                    const customerCount = parseInt(segment.customer_count || '0');
                    const percentage = (customerCount / maxCount) * 100;

                    return (
                      <div key={segment.segment_id || index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{segment.segment_name}</span>
                          <span className="text-sm text-gray-600">
                            {customerCount} clientes
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum segmento com dados
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interações por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Interações por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.interactions_by_type && Object.keys(metrics.interactions_by_type).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(metrics.interactions_by_type).map(([type, count]) => {
                    const maxCount = Math.max(
                      ...Object.values(metrics.interactions_by_type || {}),
                      1
                    );
                    const percentage = ((count as number) / maxCount) * 100;

                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 capitalize">{type}</span>
                          <span className="font-medium">
                            {count} interações
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma interação registrada
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.top_customers && metrics.top_customers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Reservas</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.top_customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierColor(customer.loyalty_tier)}>
                            {customer.loyalty_tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(customer.total_spent)}
                        </TableCell>
                        <TableCell>{customer.total_bookings}</TableCell>
                        <TableCell className="text-right">
                          {onViewCustomer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewCustomer(customer.id)}
                            >
                              Ver Detalhes
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

