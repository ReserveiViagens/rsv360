/**
 * ✅ COMPONENTE: QUALITY DASHBOARD
 * Dashboard completo de qualidade e performance do host
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Award, TrendingUp, Users, Clock, CheckCircle, XCircle, BarChart3 } from '@/lib/lucide-icons';
import { getUser, getToken } from '@/lib/auth';
import { toast } from 'sonner';

interface HostDashboard {
  scores: {
    id: number;
    host_id: number;
    overall_score: number;
    quality_score?: number;
    performance_score?: number;
    guest_satisfaction_score?: number;
  };
  ratings: Array<{
    id: number;
    rating_type: string;
    rating_value: number;
    review_count: number;
  }>;
  badges: Array<{
    id: number;
    badge_id: number;
    badge: {
      badge_key: string;
      badge_name: string;
      badge_description?: string;
      badge_icon?: string;
      badge_category: string;
    };
    earned_at: string;
    is_active: boolean;
  }>;
  metrics: Array<{
    id: number;
    metric_type: string;
    metric_value: number;
    metric_unit?: string;
    period_start: string;
    period_end: string;
  }>;
  level: 'regular' | 'top' | 'superhost';
}

interface QualityDashboardProps {
  hostId: number;
  itemId?: number;
}

export function QualityDashboard({ hostId, itemId }: QualityDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<HostDashboard | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const user = getUser();
  const token = getToken();

  useEffect(() => {
    loadDashboard();
  }, [hostId, itemId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const queryParams = itemId ? `?item_id=${itemId}` : '';
      const response = await fetch(`/api/quality/metrics/${hostId}${queryParams}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar dashboard');
      }

      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'superhost':
        return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">⭐ SuperHost</Badge>;
      case 'top':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">🏆 Top Host</Badge>;
      default:
        return <Badge variant="outline">Host Regular</Badge>;
    }
  };

  const overallRating = dashboard?.scores.overall_score ? dashboard.scores.overall_score / 20 : 0; // Converter de 0-100 para 0-5

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
          <p className="text-muted-foreground text-center">
            Não há dados de qualidade para este host ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard de Qualidade</h2>
          <p className="text-muted-foreground">
            Métricas e performance do host #{hostId}
          </p>
        </div>
        {getLevelBadge(dashboard.level)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{overallRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">de 5.0</p>
              </div>
            </div>
            <Progress value={(overallRating / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score de Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard.scores.quality_score ? (dashboard.scores.quality_score / 20).toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">de 5.0</p>
              </div>
            </div>
            {dashboard.scores.quality_score && (
              <Progress value={(dashboard.scores.quality_score / 100) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard.scores.performance_score ? (dashboard.scores.performance_score / 20).toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">de 5.0</p>
              </div>
            </div>
            {dashboard.scores.performance_score && (
              <Progress value={(dashboard.scores.performance_score / 100) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard.scores.guest_satisfaction_score ? (dashboard.scores.guest_satisfaction_score / 20).toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">de 5.0</p>
              </div>
            </div>
            {dashboard.scores.guest_satisfaction_score && (
              <Progress value={(dashboard.scores.guest_satisfaction_score / 100) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="ratings">Avaliações</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scores Detalhados</CardTitle>
              <CardDescription>Breakdown de qualidade por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.ratings.map((rating) => (
                  <div key={rating.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">
                        {rating.rating_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-semibold">
                        {rating.rating_value.toFixed(1)}/5.0 ({rating.review_count} avaliações)
                      </span>
                    </div>
                    <Progress value={(rating.rating_value / 5) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          {dashboard.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboard.badges.map((badgeAssignment) => (
                <Card
                  key={badgeAssignment.id}
                  className={badgeAssignment.is_active ? 'border-green-500' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{badgeAssignment.badge.badge_icon || '🏆'}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{badgeAssignment.badge.badge_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {badgeAssignment.badge.badge_description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Conquistado em {new Date(badgeAssignment.earned_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {badgeAssignment.is_active && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Award className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum badge conquistado</h3>
                <p className="text-muted-foreground text-center">
                  Continue melhorando sua performance para conquistar badges!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {dashboard.metrics.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>Últimas métricas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.metrics.slice(0, 10).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{metric.metric_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.period_start).toLocaleDateString('pt-BR')} -{' '}
                          {new Date(metric.period_end).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {metric.metric_value.toFixed(2)}
                          {metric.metric_unit && ` ${metric.metric_unit}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma métrica disponível</h3>
                <p className="text-muted-foreground text-center">
                  As métricas aparecerão conforme o host recebe avaliações
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


