/**
 * ✅ COMPONENTE: SMART PRICING DASHBOARD
 * Dashboard completo e melhorado para Smart Pricing
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Cloud, Users, BarChart3, Settings } from '@/lib/lucide-icons';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PricingFactors {
  basePrice: number;
  finalPrice: number;
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  events?: Array<{
    event_name: string;
    price_multiplier: number;
  }>;
  competitors?: Array<{
    competitor_name: string;
    price: number;
  }>;
  demand?: string;
  season?: string;
  multipliers: {
    weather: number;
    events: number;
    competitors: number;
    demand: number;
    season: number;
  };
}

interface PricingHistory {
  date: string;
  base_price: number;
  final_price: number;
  demand_level?: string;
  season?: string;
}

interface PricingTrends {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  dataPoints: number;
}

export function SmartPricingDashboard({ propertyId }: { propertyId?: number }) {
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(propertyId?.toString() || '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [location, setLocation] = useState('');
  const [pricingFactors, setPricingFactors] = useState<PricingFactors | null>(null);
  const [history, setHistory] = useState<PricingHistory[]>([]);
  const [trends, setTrends] = useState<PricingTrends | null>(null);
  const [activeTab, setActiveTab] = useState('calculate');

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (itemId) {
      loadHistory();
      loadTrends();
    }
  }, [itemId]);

  const calculatePrice = async () => {
    if (!itemId || !checkIn || !checkOut || !basePrice) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/pricing/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          item_id: parseInt(itemId),
          base_price: parseFloat(basePrice),
          check_in: checkIn,
          check_out: checkOut,
          location: location || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao calcular preço');
      }

      if (result.success) {
        setPricingFactors(result.data);
        toast.success('Preço calculado com sucesso!');
        loadHistory();
        loadTrends();
        setActiveTab('results');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao calcular preço');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!itemId) return;

    try {
      const response = await fetch(
        `/api/pricing/smart?item_id=${itemId}&action=history&limit=30`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadTrends = async () => {
    if (!itemId) return;

    try {
      const response = await fetch(
        `/api/pricing/smart?item_id=${itemId}&action=trends`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setTrends(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const chartData = history.slice(0, 30).reverse().map((item) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    base: parseFloat(item.base_price),
    final: parseFloat(item.final_price),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Smart Pricing AI</h2>
          <p className="text-muted-foreground">
            Precificação inteligente baseada em IA e múltiplos fatores
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculate">Calcular Preço</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="calculate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Cálculo</CardTitle>
              <CardDescription>
                Defina os parâmetros para calcular o preço inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_id">ID da Propriedade *</Label>
                  <Input
                    id="item_id"
                    type="number"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="Ex: 1"
                    disabled={!!propertyId}
                  />
                </div>
                <div>
                  <Label htmlFor="base_price">Preço Base (R$) *</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Ex: 200.00"
                  />
                </div>
                <div>
                  <Label htmlFor="check_in">Check-in *</Label>
                  <Input
                    id="check_in"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="check_out">Check-out *</Label>
                  <Input
                    id="check_out"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Localização (opcional)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Caldas Novas, GO"
                  />
                </div>
              </div>
              <Button onClick={calculatePrice} disabled={loading} className="w-full">
                {loading ? 'Calculando...' : 'Calcular Preço Inteligente'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {pricingFactors ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Preço Base
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      R$ {pricingFactors.basePrice.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Preço Inteligente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      R$ {pricingFactors.finalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {pricingFactors.finalPrice > pricingFactors.basePrice ? (
                        <span className="text-green-600">
                          +{((pricingFactors.finalPrice / pricingFactors.basePrice - 1) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {((pricingFactors.finalPrice / pricingFactors.basePrice - 1) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Diferença
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      R$ {(pricingFactors.finalPrice - pricingFactors.basePrice).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Fatores Aplicados</CardTitle>
                  <CardDescription>
                    Análise detalhada dos fatores que influenciaram o preço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingFactors.weather && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-5 h-5" />
                          <span>Clima</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {(pricingFactors.multipliers.weather * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pricingFactors.weather.condition} • {pricingFactors.weather.temperature}°C
                          </div>
                        </div>
                      </div>
                    )}

                    {pricingFactors.events && pricingFactors.events.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <span>Eventos</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {(pricingFactors.multipliers.events * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pricingFactors.events.length} evento(s)
                          </div>
                        </div>
                      </div>
                    )}

                    {pricingFactors.competitors && pricingFactors.competitors.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          <span>Competidores</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {(pricingFactors.multipliers.competitors * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Média: R$ {(pricingFactors.competitors.reduce((sum, c) => sum + c.price, 0) / pricingFactors.competitors.length).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Demanda</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {(pricingFactors.multipliers.demand * 100).toFixed(0)}%
                        </div>
                        <Badge variant={pricingFactors.demand === 'high' ? 'default' : pricingFactors.demand === 'medium' ? 'secondary' : 'outline'}>
                          {pricingFactors.demand || 'medium'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>Sazonalidade</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {(pricingFactors.multipliers.season * 100).toFixed(0)}%
                        </div>
                        <Badge variant={pricingFactors.season === 'high' ? 'default' : 'outline'}>
                          {pricingFactors.season || 'low'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cálculo realizado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Calcule um preço inteligente para ver os resultados aqui
                </p>
                <Button onClick={() => setActiveTab('calculate')}>
                  Calcular Preço
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Preços</CardTitle>
                <CardDescription>
                  Últimas 30 alterações de preço calculadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="base" stroke="#8884d8" name="Preço Base" />
                      <Line type="monotone" dataKey="final" stroke="#82ca9d" name="Preço Inteligente" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data</th>
                        <th className="text-right p-2">Preço Base</th>
                        <th className="text-right p-2">Preço Final</th>
                        <th className="text-center p-2">Demanda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                          <td className="text-right p-2">R$ {parseFloat(item.base_price).toFixed(2)}</td>
                          <td className="text-right p-2 font-semibold">
                            R$ {parseFloat(item.final_price).toFixed(2)}
                          </td>
                          <td className="text-center p-2">
                            <Badge variant="outline">{item.demand_level || 'medium'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum histórico disponível</h3>
                <p className="text-muted-foreground text-center">
                  O histórico aparecerá após calcular alguns preços
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {trends ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tendência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trends.trend)}
                    <span className="text-2xl font-bold capitalize">{trends.trend}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Preço Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {trends.averagePrice.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Variação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {trends.minPrice.toFixed(2)} - R$ {trends.maxPrice.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Volatilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trends.volatility.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {trends.dataPoints} pontos de dados
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma tendência disponível</h3>
                <p className="text-muted-foreground text-center">
                  As tendências aparecerão após calcular alguns preços
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

