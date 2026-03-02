'use client';

/**
 * Dashboard Administrativo do CRM
 * Exibe métricas avançadas e análises administrativas
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, TrendingUp, DollarSign, MessageSquare, 
  BarChart3, PieChart, Download, RefreshCw, 
  Loader2, AlertTriangle, Award, Target, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { CustomerSegments } from '@/components/crm/CustomerSegments';
import { CampaignList } from '@/components/crm/CampaignList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdvancedMetrics {
  customer_growth_rate: number;
  revenue_growth_rate: number;
  churn_rate: number;
  average_customer_lifetime: number;
  segment_performance: Array<{
    segment_name: string;
    revenue: number;
    customer_count: number;
    conversion_rate: number;
  }>;
  campaign_performance: Array<{
    campaign_name: string;
    roi: number;
    conversion_rate: number;
    total_revenue: number;
  }>;
}

export default function AdminCRMPage() {
  const router = useRouter();
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAdvancedMetrics();
  }, [dateRange]);

  const fetchAdvancedMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar métricas avançadas (pode ser uma API separada ou usar a mesma)
      const params = new URLSearchParams();
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);
        params.append('date_from', dateFrom.toISOString());
      }

      const response = await fetch(`/api/crm/dashboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas avançadas');
      }

      const result = await response.json();
      
      // Calcular métricas avançadas a partir dos dados básicos
      // Em produção, isso viria de uma API dedicada
      const metrics = result.data;
      setAdvancedMetrics({
        customer_growth_rate: metrics.new_customers > 0 ? 15.5 : 0, // Mock
        revenue_growth_rate: metrics.total_revenue > 0 ? 12.3 : 0, // Mock
        churn_rate: 5.2, // Mock
        average_customer_lifetime: 24, // Mock em meses
        segment_performance: (metrics.top_segments || []).map((seg: any) => ({
          segment_name: seg.segment_name,
          revenue: 0, // Seria calculado
          customer_count: parseInt(seg.customer_count || '0'),
          conversion_rate: 0, // Seria calculado
        })),
        campaign_performance: [], // Seria buscado de campanhas
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/cms')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo - CRM</h1>
            <p className="text-gray-500 mt-1">
              Métricas avançadas e análises administrativas
            </p>
          </div>
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
          <Button variant="outline" size="sm" onClick={fetchAdvancedMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises Avançadas</TabsTrigger>
          <TabsTrigger value="segments">Segmentação</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <CRMDashboard />

          {/* Métricas Avançadas */}
          {advancedMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Taxa de Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(advancedMetrics.customer_growth_rate)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Clientes no período
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Crescimento de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(advancedMetrics.revenue_growth_rate)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Receita no período
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Taxa de Churn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {advancedMetrics.churn_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Clientes perdidos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Relacionamento Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedMetrics.average_customer_lifetime} meses
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Tempo médio de relacionamento
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab: Análises Avançadas */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance por Segmento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance por Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {advancedMetrics && advancedMetrics.segment_performance.length > 0 ? (
                  <div className="space-y-4">
                    {advancedMetrics.segment_performance.map((segment, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{segment.segment_name}</span>
                          <Badge variant="outline">
                            {segment.customer_count} clientes
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Receita: {formatCurrency(segment.revenue)} | 
                          Conversão: {segment.conversion_rate.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum dado de segmento disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance de Campanhas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance de Campanhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {advancedMetrics && advancedMetrics.campaign_performance.length > 0 ? (
                  <div className="space-y-4">
                    {advancedMetrics.campaign_performance.map((campaign, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{campaign.campaign_name}</span>
                          <Badge 
                            variant={campaign.roi > 0 ? 'default' : 'destructive'}
                          >
                            ROI: {formatPercentage(campaign.roi)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Receita: {formatCurrency(campaign.total_revenue)} | 
                          Conversão: {campaign.conversion_rate.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma campanha com dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Segmentação */}
        <TabsContent value="segments" className="space-y-6">
          <CustomerSegments />
        </TabsContent>

        {/* Tab: Campanhas */}
        <TabsContent value="campaigns" className="space-y-6">
          <CampaignList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

