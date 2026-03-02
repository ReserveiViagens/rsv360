/**
 * ✅ FASE 3 - ETAPA 3.1: Componente QualityDashboard
 * Dashboard completo de qualidade do host com radar chart e recomendações AI
 * 
 * @module components/quality/QualityDashboard
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { 
  Star, 
  Award, 
  TrendingUp, 
  Download, 
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useMemo } from 'react';

// Lazy loading de componentes pesados
const HostBadges = dynamic(() => import('./HostBadges'), {
  loading: () => <div className="h-[200px] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>,
  ssr: false
});

const RatingDisplay = dynamic(() => import('./RatingDisplay'), {
  loading: () => <div className="h-[300px] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>,
  ssr: false
});

const IncentivesPanel = dynamic(() => import('./IncentivesPanel'), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>,
  ssr: false
});

interface QualityMetrics {
  responseTime: number; // 0-100
  cancellationRate: number; // 0-100 (inverted - lower is better)
  rating: number; // 0-100
  reviewsCount: number; // 0-100 (normalized)
  amenitiesCompleteness: number; // 0-100
  houseRulesCompliance: number; // 0-100
}

interface QualityDashboardData {
  overallScore: number; // 0-100
  metrics: QualityMetrics;
  averageTopHost: QualityMetrics;
  badges: Array<{
    id: string;
    name: string;
    earned: boolean;
    progress: number;
  }>;
  nextBadge?: {
    id: string;
    name: string;
    progress: number;
  };
  aiRecommendations: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

interface QualityDashboardProps {
  hostId: string;
  propertyId?: string;
}

export default function QualityDashboard({ hostId, propertyId }: QualityDashboardProps) {
  // Query: Buscar dados do dashboard
  const { data, isLoading, error } = useQuery<QualityDashboardData>({
    queryKey: ['quality-dashboard', hostId, propertyId],
    queryFn: async () => {
      const url = propertyId
        ? `/api/quality/dashboard/${hostId}?property_id=${propertyId}`
        : `/api/quality/dashboard/${hostId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar dashboard');
      const result = await response.json();
      return result.data || {
        overallScore: 0,
        metrics: {
          responseTime: 0,
          cancellationRate: 0,
          rating: 0,
          reviewsCount: 0,
          amenitiesCompleteness: 0,
          houseRulesCompliance: 0
        },
        averageTopHost: {
          responseTime: 0,
          cancellationRate: 0,
          rating: 0,
          reviewsCount: 0,
          amenitiesCompleteness: 0,
          houseRulesCompliance: 0
        },
        badges: [],
        aiRecommendations: []
      };
    },
    staleTime: 5 * 60 * 1000
  });

  // Preparar dados para radar chart
  // Memoizar dados do radar chart
  const radarData = useMemo(() => data ? [
    {
      metric: 'Tempo de Resposta',
      host: data.metrics.responseTime,
      topHost: data.averageTopHost.responseTime
    },
    {
      metric: 'Taxa de Cancelamento',
      host: 100 - data.metrics.cancellationRate, // Invertido (menor é melhor)
      topHost: 100 - data.averageTopHost.cancellationRate
    },
    {
      metric: 'Avaliação',
      host: data.metrics.rating,
      topHost: data.averageTopHost.rating
    },
    {
      metric: 'Quantidade de Reviews',
      host: data.metrics.reviewsCount,
      topHost: data.averageTopHost.reviewsCount
    },
    {
      metric: 'Completude de Amenidades',
      host: data.metrics.amenitiesCompleteness,
      topHost: data.averageTopHost.amenitiesCompleteness
    },
    {
      metric: 'Conformidade com Regras',
      host: data.metrics.houseRulesCompliance,
      topHost: data.averageTopHost.houseRulesCompliance
    }
  ] : [], [data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Gerando relatório...', { id: 'export-report' });
      
      // Dynamic import para reduzir bundle size
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Qualidade do Host', margin, yPos);
      yPos += 10;

      // Informações do Host
      doc.setFontSize(12);
      doc.text(`Host ID: ${hostId}`, margin, yPos);
      yPos += 7;
      if (propertyId) {
        doc.text(`Propriedade ID: ${propertyId}`, margin, yPos);
        yPos += 7;
      }
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos);
      yPos += 15;

      // Score Geral
      doc.setFontSize(16);
      doc.text('Score Geral', margin, yPos);
      yPos += 8;
      doc.setFontSize(14);
      doc.text(`${data.overallScore.toFixed(0)}/100`, margin, yPos);
      yPos += 15;

      // Métricas
      doc.setFontSize(16);
      doc.text('Métricas Detalhadas', margin, yPos);
      yPos += 8;
      doc.setFontSize(12);
      
      const metrics = [
        ['Tempo de Resposta', `${data.metrics.responseTime.toFixed(1)}%`],
        ['Taxa de Cancelamento', `${data.metrics.cancellationRate.toFixed(1)}%`],
        ['Avaliação', `${data.metrics.rating.toFixed(1)}%`],
        ['Quantidade de Reviews', `${data.metrics.reviewsCount.toFixed(1)}%`],
        ['Completude de Amenidades', `${data.metrics.amenitiesCompleteness.toFixed(1)}%`],
        ['Conformidade com Regras', `${data.metrics.houseRulesCompliance.toFixed(1)}%`]
      ];

      metrics.forEach(([label, value]) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`${label}: ${value}`, margin + 5, yPos);
        yPos += 7;
      });

      yPos += 10;

      // Recomendações
      if (data.aiRecommendations.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(16);
        doc.text('Recomendações de Melhoria', margin, yPos);
        yPos += 8;
        doc.setFontSize(12);
        
        data.aiRecommendations.slice(0, 5).forEach((rec) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFontSize(11);
          doc.text(`• ${rec.title}`, margin + 5, yPos);
          yPos += 6;
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(rec.description, pageWidth - 2 * margin - 10);
          lines.forEach((line: string) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = margin;
            }
            doc.text(line, margin + 10, yPos);
            yPos += 5;
          });
          yPos += 3;
        });
      }

      // Salvar PDF
      const fileName = `relatorio-qualidade-host-${hostId}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('Relatório exportado com sucesso!', { id: 'export-report' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar relatório', { id: 'export-report' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard de Qualidade</CardTitle>
            <CardDescription>Carregando...</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dashboard</h3>
          <p className="text-muted-foreground text-center">
            Não foi possível carregar os dados de qualidade
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Score Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Dashboard de Qualidade</CardTitle>
              <CardDescription>
                Métricas e performance do host #{hostId}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(data.overallScore)}`}>
                {data.overallScore.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Score Geral</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">
                  {data.overallScore >= 80 ? 'Top Host' : data.overallScore >= 60 ? 'Bom' : 'Melhorar'}
                </span>
              </div>
              <Progress value={data.overallScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Comparação com Top Hosts
          </CardTitle>
          <CardDescription>
            Suas métricas comparadas com a média dos top hosts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                labelFormatter={(label) => label}
              />
              <Radar
                name="Você"
                dataKey="host"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="Média Top Hosts"
                dataKey="topHost"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progresso para Próximo Badge */}
      {data.nextBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Próximo Badge
            </CardTitle>
            <CardDescription>Continue melhorando para conquistar o próximo badge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{data.nextBadge.name}</h4>
                <span className="text-sm font-medium">{Math.round(data.nextBadge.progress)}%</span>
              </div>
              <Progress value={data.nextBadge.progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Falta {100 - Math.round(data.nextBadge.progress)}% para conquistar este badge
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações AI */}
      {data.aiRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recomendações de Melhoria (IA)
            </CardTitle>
            <CardDescription>
              Sugestões personalizadas para melhorar sua qualidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.aiRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className={`p-4 border rounded-lg ${getPriorityColor(recommendation.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {recommendation.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recommendation.priority === 'high' ? 'Alta Prioridade' : 
                           recommendation.priority === 'medium' ? 'Média Prioridade' : 
                           'Baixa Prioridade'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-1">{recommendation.title}</h4>
                      <p className="text-sm mb-2">{recommendation.description}</p>
                      <p className="text-xs opacity-75">
                        <strong>Impacto:</strong> {recommendation.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges Conquistados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges Conquistados
          </CardTitle>
          <CardDescription>
            {data.badges.filter(b => b.earned).length} de {data.badges.length} badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.badges.filter(b => b.earned).map((badge) => (
              <div key={badge.id} className="text-center p-3 bg-muted rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-medium">{badge.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Componentes Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <RatingDisplay hostId={hostId} propertyId={propertyId} />
        </ErrorBoundary>
        <ErrorBoundary>
          <IncentivesPanel hostId={hostId} propertyId={propertyId} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <HostBadges hostId={hostId} propertyId={propertyId} />
      </ErrorBoundary>
    </div>
  );
}

