"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PricePoint {
  date: string;
  price: number;
  basePrice?: number;
  smartPrice?: number;
}

interface PriceChartProps {
  data: PricePoint[];
  title?: string;
  description?: string;
  showComparison?: boolean;
}

export function PriceChart({ data, title = 'Histórico de Preços', description, showComparison = false }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxPrice = Math.max(...data.map(d => Math.max(d.price, d.basePrice || 0, d.smartPrice || 0)));
  const minPrice = Math.min(...data.map(d => Math.min(d.price, d.basePrice || maxPrice, d.smartPrice || maxPrice)));
  const range = maxPrice - minPrice || 1;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

              {/* Base price line */}
              {showComparison && data.length > 1 && (
                <polyline
                  points={data
                    .map(
                      (point, idx) =>
                        `${(idx / (data.length - 1)) * 800},${200 - ((point.basePrice || point.price) - minPrice) / range * 200}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground opacity-50"
                  strokeDasharray="4 4"
                />
              )}

              {/* Smart price line */}
              {showComparison && data.length > 1 && data.some(d => d.smartPrice) && (
                <polyline
                  points={data
                    .map(
                      (point, idx) =>
                        `${(idx / (data.length - 1)) * 800},${200 - ((point.smartPrice || point.price) - minPrice) / range * 200}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-blue-500"
                />
              )}

              {/* Final price line */}
              <polyline
                points={data
                  .map(
                    (point, idx) =>
                      `${(idx / (data.length - 1)) * 800},${200 - ((point.price - minPrice) / range) * 200}`
                  )
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-green-600"
              />

              {/* Data points */}
              {data.map((point, idx) => (
                <g key={idx}>
                  <circle
                    cx={(idx / (data.length - 1)) * 800}
                    cy={200 - ((point.price - minPrice) / range) * 200}
                    r="4"
                    fill="currentColor"
                    className="text-green-600"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-600"></div>
              <span>Preço Final</span>
            </div>
            {showComparison && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span>Preço Inteligente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-dashed border-current opacity-50"></div>
                  <span>Preço Base</span>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Mínimo</p>
              <p className="font-semibold">{formatCurrency(minPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Máximo</p>
              <p className="font-semibold">{formatCurrency(maxPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Média</p>
              <p className="font-semibold">
                {formatCurrency(data.reduce((sum, d) => sum + d.price, 0) / data.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tendência</p>
              <div className="flex items-center gap-1">
                {data.length > 1 && data[data.length - 1].price > data[0].price ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">Alta</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-red-600">Baixa</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Data table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data</th>
                  <th className="text-right p-2">Preço</th>
                  {showComparison && <th className="text-right p-2">Base</th>}
                  {showComparison && <th className="text-right p-2">Smart</th>}
                </tr>
              </thead>
              <tbody>
                {data.slice(-10).reverse().map((point, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{formatDate(point.date)}</td>
                    <td className="text-right p-2 font-semibold">{formatCurrency(point.price)}</td>
                    {showComparison && (
                      <td className="text-right p-2 text-muted-foreground">
                        {point.basePrice ? formatCurrency(point.basePrice) : '-'}
                      </td>
                    )}
                    {showComparison && (
                      <td className="text-right p-2 text-blue-600">
                        {point.smartPrice ? formatCurrency(point.smartPrice) : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

