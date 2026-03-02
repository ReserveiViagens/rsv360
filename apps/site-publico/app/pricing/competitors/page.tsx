"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers/toast-wrapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { CompetitorTable } from '@/components/pricing/competitor-table';

interface Competitor {
  competitor_name: string;
  price: number;
  currency: string;
  availability_status: string;
  scraped_at: string;
}

interface ComparisonData {
  item_id: number;
  current_price: number;
  competitors: Competitor[];
  statistics: {
    average: number;
    min: number;
    max: number;
    count: number;
  };
  position: string;
  recommendation: string;
  price_difference: {
    vs_average: number;
    vs_min: number;
    vs_max: number;
    percentage_vs_average: number;
  };
}

export default function CompetitorAnalysisPage() {
  const { user, authenticatedFetch } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  const comparePrices = async () => {
    if (!itemId) {
      toast({
        title: 'Erro',
        description: 'ID do item é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/pricing/competitors/compare?item_id=${itemId}&date=${date}`
      );

      const result = await response.json();

      if (result.success) {
        setComparison(result.data);
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao comparar preços',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao comparar preços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'expensive':
        return 'text-red-600';
      case 'cheap':
        return 'text-green-600';
      case 'above_average':
        return 'text-orange-600';
      case 'below_average':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'expensive':
        return <TrendingUp className="inline text-red-600" />;
      case 'cheap':
        return <TrendingDown className="inline text-green-600" />;
      default:
        return <DollarSign className="inline text-blue-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Análise de Competidores</h1>
        <p className="text-muted-foreground">
          Compare seus preços com os da concorrência
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>Selecione o item e a data para análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="item_id">ID do Item</Label>
              <Input
                id="item_id"
                type="number"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={comparePrices} disabled={loading} className="w-full">
                {loading ? <LoadingSpinner /> : 'Comparar Preços'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Comparação</CardTitle>
              <CardDescription>Posição do seu preço em relação aos competidores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Seu Preço</p>
                  <p className="text-2xl font-bold">R$ {comparison.current_price.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Média Competidores</p>
                  <p className="text-2xl font-bold">R$ {comparison.statistics.average.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Menor Preço</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {comparison.statistics.min.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Maior Preço</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {comparison.statistics.max.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  {getPositionIcon(comparison.position)}
                  <div>
                    <p className={`font-semibold ${getPositionColor(comparison.position)}`}>
                      {comparison.position === 'expensive'
                        ? 'Preço Acima da Média'
                        : comparison.position === 'cheap'
                        ? 'Preço Abaixo da Média'
                        : comparison.position === 'above_average'
                        ? 'Preço Acima da Média'
                        : comparison.position === 'below_average'
                        ? 'Preço Abaixo da Média'
                        : 'Preço Competitivo'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {comparison.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">vs Média</p>
                  <p
                    className={`font-semibold ${
                      comparison.price_difference.vs_average > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {comparison.price_difference.vs_average > 0 ? '+' : ''}
                    R$ {comparison.price_difference.vs_average.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({comparison.price_difference.percentage_vs_average > 0 ? '+' : ''}
                    {comparison.price_difference.percentage_vs_average.toFixed(1)}%)
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">vs Mínimo</p>
                  <p
                    className={`font-semibold ${
                      comparison.price_difference.vs_min > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {comparison.price_difference.vs_min > 0 ? '+' : ''}
                    R$ {comparison.price_difference.vs_min.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">vs Máximo</p>
                  <p
                    className={`font-semibold ${
                      comparison.price_difference.vs_max > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {comparison.price_difference.vs_max > 0 ? '+' : ''}
                    R$ {comparison.price_difference.vs_max.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">Competidores</p>
                  <p className="font-semibold">{comparison.statistics.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {comparison.competitors.length > 0 && (
            <CompetitorTable
              competitors={comparison.competitors}
              currentPrice={comparison.current_price}
              title="Lista de Competidores"
              description="Preços dos competidores para a data selecionada"
            />
          )}

          {comparison.competitors.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum dado de competidor disponível para esta data.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Os dados são coletados automaticamente. Tente outra data ou aguarde a próxima
                  coleta.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

