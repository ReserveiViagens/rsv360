"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';

interface Recommendation {
  type: 'increase' | 'decrease' | 'maintain';
  reason: string;
  currentPrice: number;
  recommendedPrice: number;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  factors: string[];
}

interface PricingRecommendationsProps {
  recommendations: Recommendation[];
  title?: string;
}

export function PricingRecommendations({ recommendations, title = 'Recomendações de Preço' }: PricingRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Recomendações baseadas em análise de mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma recomendação disponível no momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'increase':
        return <Badge className="bg-green-600">Aumentar</Badge>;
      case 'decrease':
        return <Badge variant="destructive">Reduzir</Badge>;
      default:
        return <Badge variant="secondary">Manter</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Recomendações baseadas em análise de mercado e demanda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(rec.type)}
                  <div>
                    <h3 className="font-semibold">{rec.reason}</h3>
                    {getTypeBadge(rec.type)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confiança</p>
                  <p className="font-semibold">{(rec.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Preço Atual</p>
                  <p className="font-semibold">{formatCurrency(rec.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preço Recomendado</p>
                  <p
                    className={`font-semibold ${
                      rec.type === 'increase'
                        ? 'text-green-600'
                        : rec.type === 'decrease'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {formatCurrency(rec.recommendedPrice)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Impacto Esperado</p>
                <p className={`text-sm font-semibold ${getImpactColor(rec.impact)}`}>
                  {rec.impact === 'high'
                    ? 'Alto Impacto'
                    : rec.impact === 'medium'
                    ? 'Médio Impacto'
                    : 'Baixo Impacto'}
                </p>
              </div>

              {rec.factors && rec.factors.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Fatores Considerados:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.factors.map((factor, factorIdx) => (
                      <Badge key={factorIdx} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

