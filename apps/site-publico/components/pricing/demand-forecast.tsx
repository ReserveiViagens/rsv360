"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign } from 'lucide-react';

interface DemandForecastData {
  date: string;
  demand: number; // 0-100
  expectedBookings: number;
  recommendedPrice: number;
  currentPrice?: number;
  confidence: number; // 0-1
}

interface DemandForecastProps {
  data: DemandForecastData[];
  title?: string;
  description?: string;
}

export function DemandForecast({ data, title = 'Previsão de Demanda', description }: DemandForecastProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de previsão disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 80) return 'text-green-600 bg-green-50 dark:bg-green-950';
    if (demand >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    if (demand >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
    return 'text-red-600 bg-red-50 dark:bg-red-950';
  };

  const getDemandLabel = (demand: number) => {
    if (demand >= 80) return 'Alta';
    if (demand >= 60) return 'Média-Alta';
    if (demand >= 40) return 'Média';
    return 'Baixa';
  };

  const avgDemand = data.reduce((sum, d) => sum + d.demand, 0) / data.length;
  const totalExpectedBookings = data.reduce((sum, d) => sum + d.expectedBookings, 0);
  const avgRecommendedPrice = data.reduce((sum, d) => sum + d.recommendedPrice, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-muted-foreground">Demanda Média</p>
              </div>
              <p className="text-2xl font-bold">{avgDemand.toFixed(0)}%</p>
              <Progress value={avgDemand} className="mt-2" />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <p className="text-sm text-muted-foreground">Reservas Esperadas</p>
              </div>
              <p className="text-2xl font-bold">{totalExpectedBookings}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.length} {data.length === 1 ? 'período' : 'períodos'}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <p className="text-sm text-muted-foreground">Preço Recomendado Médio</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(avgRecommendedPrice)}</p>
            </div>
          </div>

          {/* Gráfico de demanda */}
          <div>
            <h3 className="font-semibold mb-4">Evolução da Demanda</h3>
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={ratio * 200}
                    x2="800"
                    y2={ratio * 200}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted-foreground opacity-20"
                  />
                ))}

                {/* Demand line */}
                {data.length > 1 && (
                  <polyline
                    points={data
                      .map(
                        (point, idx) =>
                          `${(idx / (data.length - 1)) * 800},${200 - (point.demand / 100) * 200}`
                      )
                      .join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-blue-600"
                  />
                )}

                {/* Data points */}
                {data.map((point, idx) => (
                  <g key={idx}>
                    <circle
                      cx={(idx / (data.length - 1)) * 800}
                      cy={200 - (point.demand / 100) * 200}
                      r="5"
                      fill="currentColor"
                      className="text-blue-600"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Tabela detalhada */}
          <div>
            <h3 className="font-semibold mb-4">Previsão Detalhada</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-center p-2">Demanda</th>
                    <th className="text-right p-2">Reservas Esperadas</th>
                    <th className="text-right p-2">Preço Recomendado</th>
                    <th className="text-right p-2">Confiança</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((point, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{formatDate(point.date)}</td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${getDemandColor(point.demand)} border-0`}
                          >
                            {getDemandLabel(point.demand)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{point.demand}%</span>
                        </div>
                        <Progress value={point.demand} className="mt-1 w-20 mx-auto" />
                      </td>
                      <td className="text-right p-2 font-semibold">
                        {point.expectedBookings}
                      </td>
                      <td className="text-right p-2">
                        <div>
                          <p className="font-semibold">{formatCurrency(point.recommendedPrice)}</p>
                          {point.currentPrice && point.currentPrice !== point.recommendedPrice && (
                            <p className="text-xs text-muted-foreground">
                              Atual: {formatCurrency(point.currentPrice)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-right p-2">
                        <div className="flex items-center justify-end gap-1">
                          {point.confidence >= 0.8 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : point.confidence >= 0.6 ? (
                            <TrendingDown className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs">
                            {(point.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

