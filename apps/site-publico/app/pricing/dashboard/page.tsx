/**
 * ✅ FASE 2 - ETAPA 2.1: Dashboard de Pricing Completo
 * Dashboard completo para visualização e configuração de Smart Pricing
 * 
 * @module app/pricing/dashboard/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Users,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Lazy loading de componentes pesados para melhor performance
const PricingCalendar = dynamic(() => import('@/components/pricing/PricingCalendar'), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const PricingChart = dynamic(() => import('@/components/pricing/PricingChart'), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const PricingConfig = dynamic(() => import('@/components/pricing/PricingConfig'), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const CompetitorComparison = dynamic(() => import('@/components/pricing/CompetitorComparison'), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const DemandForecast = dynamic(() => import('@/components/pricing/DemandForecast'), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

// Types
interface Property {
  id: string;
  name: string;
  address: string;
  basePrice: number;
  currency: string;
}

interface PricingMetrics {
  currentRevenue: number;
  averagePrice: number;
  occupancy: number;
  priceChange: number;
}

interface PricingHistory {
  date: string;
  price: number;
  suggestedPrice: number;
  demand: number;
}

interface CompetitorPrice {
  id: string;
  name: string;
  distance: number;
  rating: number;
  averagePrice: number;
  occupancy: number;
}

interface DemandForecastData {
  date: string;
  demand: number;
  confidence: number;
  events?: string[];
  holidays?: boolean;
  season?: 'high' | 'low' | 'medium';
}

interface PricingConfig {
  minPrice: number;
  maxPrice: number;
  basePrice: number;
  aggressiveMode: boolean;
  autoAdjust: boolean;
  priceAdjustmentRate: number;
  eventMultiplier: number;
  weatherImpact: boolean;
  competitorTracking: boolean;
}

// Mock service - será substituído quando API estiver pronta
const pricingService = {
  getProperties: async (): Promise<Property[]> => {
    const response = await fetch('/api/properties?role=host');
    if (!response.ok) throw new Error('Erro ao buscar propriedades');
    const data = await response.json();
    return data.data || [];
  },
  getPricingHistory: async (propertyId: string, start: Date, end: Date): Promise<PricingHistory[]> => {
    const params = new URLSearchParams({
      propertyId,
      start: start.toISOString(),
      end: end.toISOString()
    });
    const response = await fetch(`/api/pricing/history?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar histórico');
    const data = await response.json();
    return data.data || [];
  },
  getCompetitorPrices: async (propertyId: string): Promise<CompetitorPrice[]> => {
    const response = await fetch(`/api/pricing/competitors/${propertyId}`);
    if (!response.ok) throw new Error('Erro ao buscar competidores');
    const data = await response.json();
    return data.data || [];
  },
  getDemandForecast: async (propertyId: string, days: number = 30): Promise<DemandForecastData[]> => {
    const response = await fetch(`/api/pricing/forecast/${propertyId}?days=${days}`);
    if (!response.ok) throw new Error('Erro ao buscar previsão');
    const data = await response.json();
    return data.data || [];
  },
  getPricingConfig: async (propertyId: string): Promise<PricingConfig> => {
    const response = await fetch(`/api/pricing/config/${propertyId}`);
    if (!response.ok) throw new Error('Erro ao buscar configuração');
    const data = await response.json();
    return data.data;
  },
  getMetrics: async (propertyId: string): Promise<PricingMetrics> => {
    const response = await fetch(`/api/pricing/metrics/${propertyId}`);
    if (!response.ok) throw new Error('Erro ao buscar métricas');
    const data = await response.json();
    return data.data;
  }
};

export default function PricingDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    searchParams.get('propertyId') || null
  );
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    end: new Date()
  });
  const [viewMode, setViewMode] = useState<'calendar' | 'chart' | 'config'>('calendar');

  // Queries
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['pricing-properties'],
    queryFn: () => pricingService.getProperties(),
    staleTime: 5 * 60 * 1000
  });

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<PricingMetrics>({
    queryKey: ['pricing-metrics', selectedPropertyId],
    queryFn: () => pricingService.getMetrics(selectedPropertyId!),
    enabled: !!selectedPropertyId,
    staleTime: 60 * 1000
  });

  const { data: pricingHistory, isLoading: isLoadingHistory } = useQuery<PricingHistory[]>({
    queryKey: ['pricing-history', selectedPropertyId, dateRange],
    queryFn: () => pricingService.getPricingHistory(selectedPropertyId!, dateRange.start, dateRange.end),
    enabled: !!selectedPropertyId,
    staleTime: 2 * 60 * 1000
  });

  const { data: competitorPrices, isLoading: isLoadingCompetitors } = useQuery<CompetitorPrice[]>({
    queryKey: ['competitor-prices', selectedPropertyId],
    queryFn: () => pricingService.getCompetitorPrices(selectedPropertyId!),
    enabled: !!selectedPropertyId,
    staleTime: 5 * 60 * 1000
  });

  const { data: demandForecast, isLoading: isLoadingForecast } = useQuery<DemandForecastData[]>({
    queryKey: ['demand-forecast', selectedPropertyId],
    queryFn: () => pricingService.getDemandForecast(selectedPropertyId!, 30),
    enabled: !!selectedPropertyId,
    staleTime: 10 * 60 * 1000
  });

  const { data: pricingConfig, isLoading: isLoadingConfig } = useQuery<PricingConfig>({
    queryKey: ['pricing-config', selectedPropertyId],
    queryFn: () => pricingService.getPricingConfig(selectedPropertyId!),
    enabled: !!selectedPropertyId && viewMode === 'config',
    staleTime: 5 * 60 * 1000
  });

  // Auto-select first property if available
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Handlers
  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    router.push(`/pricing/dashboard?propertyId=${propertyId}`);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await fetch(
        `/api/pricing/export/${selectedPropertyId}?format=${format}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Erro ao exportar');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-report-${Date.now()}.${format}`;
      a.click();
      
      toast.success(`Relatório exportado como ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar relatório');
    }
  };

  const isLoading = isLoadingProperties || isLoadingMetrics || isLoadingHistory;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Precificação Inteligente</h1>
          <p className="text-muted-foreground">
            Gerencie e otimize os preços das suas propriedades com IA
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={!selectedPropertyId}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={!selectedPropertyId}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Property Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Propriedade</label>
              {isLoadingProperties ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedPropertyId || ''}
                  onValueChange={handlePropertyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date Range - Simplified for now */}
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="text-sm font-medium mb-2 block">Visualização</label>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="calendar" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendário
                  </TabsTrigger>
                  <TabsTrigger value="chart" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Gráfico
                  </TabsTrigger>
                  <TabsTrigger value="config" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics?.currentRevenue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimos 30 dias
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Price */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics?.averagePrice.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {metrics && metrics.priceChange > 0 ? (
                    <Badge variant="default" className="bg-green-500">
                      +{metrics.priceChange.toFixed(1)}%
                    </Badge>
                  ) : metrics && metrics.priceChange < 0 ? (
                    <Badge variant="destructive">
                      {metrics.priceChange.toFixed(1)}%
                    </Badge>
                  ) : null}
                  <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Occupancy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics?.occupancy.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa de ocupação média
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      {!selectedPropertyId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Selecione uma propriedade para visualizar os dados de precificação
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* View Mode Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'calendar' && 'Calendário de Preços'}
                {viewMode === 'chart' && 'Gráfico de Preços'}
                {viewMode === 'config' && 'Configuração de Precificação'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                {viewMode === 'calendar' && (
                  <PricingCalendar
                    propertyId={selectedPropertyId}
                    dateRange={dateRange}
                    onDateClick={(date) => {
                      // Handle date click
                      console.log('Date clicked:', date);
                    }}
                    onPriceChange={async (date, newPrice) => {
                      try {
                        await fetch(`/api/pricing/override/${selectedPropertyId}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ date, price: newPrice })
                        });
                        toast.success('Preço atualizado com sucesso');
                      } catch (error: any) {
                        toast.error(error.message || 'Erro ao atualizar preço');
                      }
                    }}
                  />
                )}

                {viewMode === 'chart' && (
                  <PricingChart
                    propertyId={selectedPropertyId}
                    data={pricingHistory || []}
                    isLoading={isLoadingHistory}
                  />
                )}

                {viewMode === 'config' && (
                  <PricingConfig
                    propertyId={selectedPropertyId}
                    config={pricingConfig}
                    isLoading={isLoadingConfig}
                  />
                )}
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Competitor Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação com Competidores</CardTitle>
              <CardDescription>
                Veja como seus preços se comparam com propriedades similares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <CompetitorComparison
                  propertyId={selectedPropertyId}
                  competitors={competitorPrices || []}
                  isLoading={isLoadingCompetitors}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Demand Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Demanda</CardTitle>
              <CardDescription>
                Previsão de demanda para os próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <DemandForecast
                  propertyId={selectedPropertyId}
                  data={demandForecast || []}
                  isLoading={isLoadingForecast}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

