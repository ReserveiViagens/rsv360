/**
 * Dashboard Avançado de Smart Pricing
 * Gráficos avançados, tendências e comparações
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Target,
  Activity,
  Zap,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface PricingRecommendation {
  propertyId: number;
  date: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  confidence: number;
  reasons: string[];
  factors: {
    demand: number;
    competition: number;
    sentiment: number;
    seasonality: number;
    events: number;
  };
  alerts: PricingAlert[];
}

interface PricingAlert {
  type: 'opportunity' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

interface PricingHistory {
  date: string;
  basePrice: number;
  finalPrice: number;
  demand: number;
  occupancy: number;
  revenue: number;
}

interface CompetitorComparison {
  platform: string;
  price: number;
  availability: string;
}

export function SmartPricingDashboard({ propertyId }: { propertyId: number }) {
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [history, setHistory] = useState<PricingHistory[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorComparison[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [propertyId, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Não autenticado');
        return;
      }

      // Carregar recomendação atual
      const recResponse = await fetch(
        `/api/pricing/recommendations?property_id=${propertyId}&include_alerts=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecommendation(recData.data);
      }

      // Carregar histórico
      const historyResponse = await fetch(
        `/api/pricing/history?property_id=${propertyId}&period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.data || []);
      }

      // Carregar comparação com competidores
      const compResponse = await fetch(
        `/api/pricing/competitors?property_id=${propertyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (compResponse.ok) {
        const compData = await compResponse.json();
        setCompetitors(compData.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleApplyRecommendation = async () => {
    if (!recommendation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          new_price: recommendation.recommendedPrice,
        }),
      });

      if (response.ok) {
        alert('Preço atualizado com sucesso!');
        loadData();
      }
    } catch (err) {
      alert('Erro ao aplicar recomendação');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Pricing Dashboard</h1>
          <p className="text-muted-foreground">Precificação inteligente com ML</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {recommendation && recommendation.alerts.length > 0 && (
        <div className="space-y-2">
          {recommendation.alerts.map((alert, idx) => (
            <Alert
              key={idx}
              variant={
                alert.type === 'warning'
                  ? 'destructive'
                  : alert.type === 'opportunity'
                  ? 'default'
                  : 'default'
              }
            >
              {alert.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : alert.type === 'opportunity' ? (
                <Zap className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>
                {alert.message}
                {alert.action && (
                  <Button
                    variant="link"
                    className="ml-2 p-0 h-auto"
                    onClick={() => alert.actionUrl && window.open(alert.actionUrl)}
                  >
                    {alert.action}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Recomendação Principal */}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendação de Preço</CardTitle>
            <CardDescription>
              Preço otimizado baseado em ML e análise de mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Preço Atual</p>
                <p className="text-2xl font-bold">
                  R$ {recommendation.currentPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preço Recomendado</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {recommendation.recommendedPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variação</p>
                <div className="flex items-center gap-2">
                  {recommendation.priceChange > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : recommendation.priceChange < 0 ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : null}
                  <p
                    className={`text-2xl font-bold ${
                      recommendation.priceChange > 0
                        ? 'text-green-500'
                        : recommendation.priceChange < 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {recommendation.priceChange > 0 ? '+' : ''}
                    {recommendation.priceChange.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Confiança: {Math.round(recommendation.confidence * 100)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${recommendation.confidence * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Razões:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {recommendation.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>

            <Button onClick={handleApplyRecommendation} className="w-full">
              Aplicar Recomendação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="competitors">Competidores</TabsTrigger>
          <TabsTrigger value="factors">Fatores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Preço vs Demanda */}
            <Card>
              <CardHeader>
                <CardTitle>Preço vs Demanda</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="demand"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Demanda"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="finalPrice"
                      stroke="#82ca9d"
                      name="Preço"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Fatores */}
            {recommendation && (
              <Card>
                <CardHeader>
                  <CardTitle>Fatores de Precificação</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Demanda', value: recommendation.factors.demand },
                      { name: 'Competição', value: recommendation.factors.competition },
                      { name: 'Sentimento', value: recommendation.factors.sentiment + 0.5 },
                      { name: 'Sazonalidade', value: recommendation.factors.seasonality },
                      { name: 'Eventos', value: recommendation.factors.events },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Gráfico de Tendências de Preço */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Preço</CardTitle>
              <CardDescription>
                Evolução do preço ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="basePrice"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Preço Base"
                  />
                  <Line
                    type="monotone"
                    dataKey="finalPrice"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Preço Final"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Receita vs Ocupação */}
          <Card>
            <CardHeader>
              <CardTitle>Receita vs Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="occupancy" fill="#8884d8" name="Ocupação" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    name="Receita"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          {/* Comparação com Competidores */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação com Competidores</CardTitle>
            </CardHeader>
            <CardContent>
              {competitors.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={competitors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="price" fill="#8884d8" name="Preço" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum dado de competidor disponível
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          {/* Distribuição de Fatores */}
          {recommendation && (
            <Card>
              <CardHeader>
                <CardTitle>Impacto dos Fatores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Demanda', value: recommendation.factors.demand * 100 },
                        { name: 'Competição', value: recommendation.factors.competition * 100 },
                        { name: 'Sentimento', value: (recommendation.factors.sentiment + 0.5) * 100 },
                        { name: 'Sazonalidade', value: recommendation.factors.seasonality * 100 },
                        { name: 'Eventos', value: recommendation.factors.events * 100 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'].map((color, idx) => (
                        <Cell key={`cell-${idx}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

