/**
 * ✅ FASE 2 - ETAPA 2.2: Componente DemandForecast
 * Previsão de demanda para os próximos dias
 * 
 * @module components/pricing/DemandForecast
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
  ReferenceArea
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Cloud, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DemandForecastProps {
  propertyId: string;
  data: Array<{
    date: string;
    demand: number; // 0-100
    confidence: number; // 0-100
    events?: string[];
    holidays?: boolean;
    season?: 'high' | 'low' | 'medium';
    weather?: string;
  }>;
  isLoading?: boolean;
}

export default function DemandForecast({ propertyId, data, isLoading }: DemandForecastProps) {
  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item) => ({
      date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
      fullDate: item.date,
      demanda: item.demand,
      confianca: item.confidence,
      season: item.season,
      hasEvents: (item.events && item.events.length > 0) || false,
      isHoliday: item.holidays || false
    }));
  }, [data]);

  // Calcular insights
  const insights = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const highDemandDays = data.filter(d => d.demand >= 80).length;
    const lowDemandDays = data.filter(d => d.demand < 50).length;
    const avgDemand = data.reduce((sum, d) => sum + d.demand, 0) / data.length;
    const avgConfidence = data.reduce((sum, d) => sum + d.confidence, 0) / data.length;
    
    const insightsList: string[] = [];
    
    if (highDemandDays > 0) {
      insightsList.push(`📈 ${highDemandDays} dias com alta demanda prevista (≥80%). Considere aumentar preços.`);
    }
    
    if (lowDemandDays > 0) {
      insightsList.push(`📉 ${lowDemandDays} dias com baixa demanda prevista (<50%). Considere promoções.`);
    }
    
    if (avgDemand > 70) {
      insightsList.push(`✨ Período de alta demanda média (${avgDemand.toFixed(1)}%). Ótimo momento para maximizar receita.`);
    } else if (avgDemand < 40) {
      insightsList.push(`⚠️ Período de baixa demanda média (${avgDemand.toFixed(1)}%). Considere estratégias de atração.`);
    }
    
    if (avgConfidence < 60) {
      insightsList.push(`🔍 Confiança média da previsão baixa (${avgConfidence.toFixed(1)}%). Mais dados históricos melhorariam a precisão.`);
    }
    
    return insightsList;
  }, [data]);

  // Obter cor da temporada
  const getSeasonColor = (season?: string): string => {
    switch (season) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsão de Demanda</CardTitle>
          <CardDescription>Carregando previsão...</CardDescription>
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
          <CardTitle>Previsão de Demanda</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gráfico de Previsão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Previsão de Demanda - Próximos 30 Dias
          </CardTitle>
          <CardDescription>
            Previsão baseada em dados históricos, eventos e sazonalidade
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'demanda') return [`${value.toFixed(1)}%`, 'Demanda Prevista'];
                  if (name === 'confianca') return [`${value.toFixed(1)}%`, 'Confiança'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const item = payload[0].payload;
                    return `Data: ${label}`;
                  }
                  return label;
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1 text-sm">
                          <p>Demanda: <span className="font-semibold">{data.demanda.toFixed(1)}%</span></p>
                          <p>Confiança: <span className="font-semibold">{data.confianca.toFixed(1)}%</span></p>
                          {data.hasEvents && (
                            <p className="text-blue-600">📅 Eventos locais</p>
                          )}
                          {data.isHoliday && (
                            <p className="text-orange-600">🎉 Feriado</p>
                          )}
                          {data.season && (
                            <p className="text-green-600">
                              Temporada: {data.season === 'high' ? 'Alta' : data.season === 'low' ? 'Baixa' : 'Média'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                formatter={(value) => {
                  if (value === 'demanda') return 'Demanda Prevista';
                  if (value === 'confianca') return 'Confiança da Previsão';
                  return value;
                }}
              />
              {/* Área de alta demanda */}
              <ReferenceArea 
                y1={80} 
                y2={100} 
                fill="#10b981" 
                fillOpacity={0.1}
                label={{ value: 'Alta Demanda', position: 'insideTop' }}
              />
              {/* Área de baixa demanda */}
              <ReferenceArea 
                y1={0} 
                y2={50} 
                fill="#ef4444" 
                fillOpacity={0.1}
                label={{ value: 'Baixa Demanda', position: 'insideBottom' }}
              />
              <Line
                type="monotone"
                dataKey="demanda"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="demanda"
              />
              <Line
                type="monotone"
                dataKey="confianca"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="confianca"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Indicadores de Eventos e Feriados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Eventos e Feriados
          </CardTitle>
          <CardDescription>Próximos eventos que podem impactar a demanda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data
              .filter(d => (d.events && d.events.length > 0) || d.holidays)
              .slice(0, 10)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.holidays && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        🎉 Feriado
                      </Badge>
                    )}
                    {item.events && item.events.length > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        📅 {item.events.length} evento{item.events.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <span className="text-sm">
                      {format(new Date(item.date), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.season && (
                      <Badge className={getSeasonColor(item.season)}>
                        {item.season === 'high' ? 'Alta' : item.season === 'low' ? 'Baixa' : 'Média'}
                      </Badge>
                    )}
                    <span className="text-sm font-medium">
                      {item.demand.toFixed(0)}% demanda
                    </span>
                  </div>
                </div>
              ))}
            {data.filter(d => (d.events && d.events.length > 0) || d.holidays).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum evento ou feriado nos próximos 30 dias
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Insights e Recomendações
            </CardTitle>
            <CardDescription>Análise automática baseada na previsão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900 dark:text-blue-100">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

