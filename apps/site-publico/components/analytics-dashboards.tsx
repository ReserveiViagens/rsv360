'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Map, BarChart3 } from 'lucide-react';

interface RevenueForecast {
  period: string;
  forecasted_revenue: number;
  forecasted_bookings: number;
  confidence_level: number;
  lower_bound: number;
  upper_bound: number;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

interface DemandHeatmapData {
  date: string;
  demand_level: string;
  demand_score: number;
  bookings_count: number;
  occupancy_rate: number;
}

interface CompetitorBenchmark {
  competitor_name: string;
  metrics: {
    average_price: number;
    occupancy_rate: number;
    revenue_per_available_room: number;
  };
  comparison: {
    price_difference_percent: number;
    competitive_position: string;
  };
}

interface AnalyticsDashboardsProps {
  propertyId: number;
  startDate: Date;
  endDate: Date;
}

export function AnalyticsDashboards({ propertyId, startDate, endDate }: AnalyticsDashboardsProps) {
  const [forecast, setForecast] = useState<RevenueForecast[]>([]);
  const [heatmap, setHeatmap] = useState<DemandHeatmapData[]>([]);
  const [benchmark, setBenchmark] = useState<CompetitorBenchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [propertyId, startDate, endDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        propertyId: propertyId.toString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      // Carregar forecast
      const forecastRes = await fetch(`/api/analytics/forecast?${params}`);
      const forecastData = await forecastRes.json();
      if (forecastData.success) {
        setForecast(forecastData.data);
      }

      // Carregar heatmap
      const heatmapRes = await fetch(`/api/analytics/heatmap?${params}`);
      const heatmapData = await heatmapRes.json();
      if (heatmapData.success) {
        setHeatmap(heatmapData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBenchmark = async (competitors: Array<{ id: number; name: string; type: string; location: string }>) => {
    try {
      const response = await fetch('/api/analytics/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          competitors,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBenchmark(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar benchmark:', error);
    }
  };

  if (loading) {
    return <div>Carregando analytics...</div>;
  }

  return (
    <Tabs defaultValue="forecast">
      <TabsList>
        <TabsTrigger value="forecast">
          <TrendingUp className="w-4 h-4 mr-2" />
          Revenue Forecast
        </TabsTrigger>
        <TabsTrigger value="heatmap">
          <Map className="w-4 h-4 mr-2" />
          Demand Heatmap
        </TabsTrigger>
        <TabsTrigger value="benchmark">
          <BarChart3 className="w-4 h-4 mr-2" />
          Competitor Benchmark
        </TabsTrigger>
      </TabsList>

      <TabsContent value="forecast">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecast.map((f) => (
                <div key={f.period} className="p-4 border rounded-lg">
                  <div className="font-semibold">{f.period}</div>
                  <div className="text-2xl font-bold">
                    R$ {f.forecasted_revenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Intervalo: R$ {f.lower_bound.toFixed(2)} - R$ {f.upper_bound.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Confiança: {f.confidence_level}%
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">Otimista</div>
                      <div className="font-semibold text-green-600">
                        R$ {f.scenarios.optimistic.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Realista</div>
                      <div className="font-semibold">
                        R$ {f.scenarios.realistic.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Pessimista</div>
                      <div className="font-semibold text-red-600">
                        R$ {f.scenarios.pessimistic.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="heatmap">
        <Card>
          <CardHeader>
            <CardTitle>Demand Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {heatmap.map((h) => {
                const intensity = h.demand_score / 100;
                const bgColor = `rgba(59, 130, 246, ${intensity})`;
                return (
                  <div
                    key={h.date}
                    className="p-2 rounded text-center text-xs"
                    style={{ backgroundColor: bgColor, color: intensity > 0.5 ? 'white' : 'black' }}
                  >
                    <div>{new Date(h.date).getDate()}</div>
                    <div className="text-xs">{h.demand_score}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="benchmark">
        <Card>
          <CardHeader>
            <CardTitle>Competitor Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benchmark.map((b, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="font-semibold">{b.competitor_name}</div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <div className="text-sm text-gray-500">Preço Médio</div>
                      <div className="font-semibold">
                        R$ {b.metrics.average_price.toFixed(2)}
                      </div>
                      <div className={`text-xs ${b.comparison.price_difference_percent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {b.comparison.price_difference_percent > 0 ? '+' : ''}
                        {b.comparison.price_difference_percent.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Ocupação</div>
                      <div className="font-semibold">
                        {b.metrics.occupancy_rate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">RevPAR</div>
                      <div className="font-semibold">
                        R$ {b.metrics.revenue_per_available_room.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      b.comparison.competitive_position === 'leader' ? 'bg-green-100 text-green-800' :
                      b.comparison.competitive_position === 'laggard' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {b.comparison.competitive_position}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

