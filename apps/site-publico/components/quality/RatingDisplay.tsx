/**
 * ✅ FASE 3 - ETAPA 3.1: Componente RatingDisplay
 * Exibição detalhada de ratings com breakdown por categoria
 * 
 * @module components/quality/RatingDisplay
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RatingCategory {
  name: string;
  value: number; // 0-5
  reviewCount: number;
  trend?: 'up' | 'down' | 'stable';
}

interface RatingDisplayProps {
  hostId: string;
  propertyId?: string;
}

interface RatingData {
  overall: number;
  categories: RatingCategory[];
  distribution: Array<{ stars: number; count: number }>;
  trend: 'up' | 'down' | 'stable';
  positiveComments: string[];
  negativeComments: string[];
  totalReviews: number;
}

export default function RatingDisplay({ hostId, propertyId }: RatingDisplayProps) {
  // Query: Buscar ratings
  const { data: ratingData, isLoading, error } = useQuery<RatingData>({
    queryKey: ['host-ratings', hostId, propertyId],
    queryFn: async () => {
      const url = propertyId
        ? `/api/quality/ratings/${hostId}?property_id=${propertyId}`
        : `/api/quality/ratings/${hostId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar ratings');
      const result = await response.json();
      return result.data || {
        overall: 0,
        categories: [],
        distribution: [],
        trend: 'stable',
        positiveComments: [],
        negativeComments: [],
        totalReviews: 0
      };
    },
    staleTime: 5 * 60 * 1000
  });

  // Calcular cores e ícones
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  // Preparar dados para gráfico de distribuição
  const chartData = useMemo(() => {
    if (!ratingData?.distribution) return [];
    return ratingData.distribution.map(d => ({
      estrelas: `${d.stars} estrelas`,
      quantidade: d.count,
      porcentagem: ((d.count / ratingData.totalReviews) * 100).toFixed(1)
    }));
  }, [ratingData]);

  // Renderizar estrelas
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className={`${sizeClass} text-yellow-500 fill-yellow-500`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className={`${sizeClass} text-yellow-500 fill-yellow-500 opacity-50`} />
        );
      } else {
        stars.push(
          <Star key={i} className={`${sizeClass} text-gray-300 dark:text-gray-600`} />
        );
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avaliações</CardTitle>
          <CardDescription>Carregando avaliações...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !ratingData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Star className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar avaliações</h3>
          <p className="text-muted-foreground text-center">
            Não foi possível carregar as avaliações do host
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                Avaliação Geral
              </CardTitle>
              <CardDescription>
                {ratingData.totalReviews} avaliações no total
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(ratingData.trend)}
              <Badge variant="outline" className={getRatingColor(ratingData.overall)}>
                {ratingData.trend === 'up' && 'Melhorando'}
                {ratingData.trend === 'down' && 'Piorando'}
                {ratingData.trend === 'stable' && 'Estável'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold" style={{ color: ratingData.overall >= 4.5 ? '#10b981' : ratingData.overall >= 4.0 ? '#eab308' : '#f97316' }}>
              {ratingData.overall.toFixed(1)}
            </div>
            <div className="flex-1">
              {renderStars(ratingData.overall, 'lg')}
              <p className="text-sm text-muted-foreground mt-2">
                Baseado em {ratingData.totalReviews} avaliações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown por Categoria</CardTitle>
          <CardDescription>Avaliações detalhadas por aspecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratingData.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {category.name.replace('_', ' ')}
                    </span>
                    {getTrendIcon(category.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(category.value)}
                    <span className={`font-semibold ${getRatingColor(category.value)}`}>
                      {category.value.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({category.reviewCount})
                    </span>
                  </div>
                </div>
                <Progress value={(category.value / 5) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Reviews */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
            <CardDescription>Quantidade de reviews por estrelas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estrelas" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} avaliações (${props.payload.porcentagem}%)`,
                    'Quantidade'
                  ]}
                />
                <Legend />
                <Bar dataKey="quantidade" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Comentários Positivos */}
      {ratingData.positiveComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Comentários Positivos
            </CardTitle>
            <CardDescription>Destaques das avaliações positivas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingData.positiveComments.slice(0, 5).map((comment, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-900 dark:text-green-100 flex-1">
                    "{comment}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comentários Negativos */}
      {ratingData.negativeComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              Áreas de Melhoria
            </CardTitle>
            <CardDescription>Comentários que indicam pontos a melhorar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingData.negativeComments.slice(0, 5).map((comment, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <MessageSquare className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-900 dark:text-red-100 flex-1">
                    "{comment}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

