'use client';

/**
 * Componente: Insights de Analytics
 * Cards de insights, recomendações e alertas
 */

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Info, CheckCircle,
  Loader2, RefreshCw, TrendingUp, TrendingDown,
  DollarSign, Users, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Insight {
  id: string;
  type: 'revenue' | 'occupancy' | 'pricing' | 'demand' | 'competition' | 'performance';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  recommendation?: string;
  metrics?: Record<string, any>;
  created_at: string;
}

interface AnalyticsInsightsData {
  insights: Insight[];
  summary: {
    total_insights: number;
    critical_count: number;
    warning_count: number;
    info_count: number;
  };
  date_range: {
    start: string;
    end: string;
  };
}

interface AnalyticsInsightsProps {
  propertyId?: number;
  className?: string;
}

export function AnalyticsInsights({ propertyId, className }: AnalyticsInsightsProps) {
  const [data, setData] = useState<AnalyticsInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchInsights();
  }, [propertyId]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (propertyId) {
        params.append('property_id', propertyId.toString());
      }

      const response = await fetch(`/api/analytics/insights?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar insights');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar insights');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { label: 'Crítico', variant: 'destructive' as const };
      case 'warning':
        return { label: 'Atenção', variant: 'default' as const };
      case 'info':
        return { label: 'Informativo', variant: 'secondary' as const };
      default:
        return { label: severity, variant: 'outline' as const };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'occupancy':
        return <Users className="h-4 w-4" />;
      case 'pricing':
        return <TrendingUp className="h-4 w-4" />;
      case 'demand':
        return <Calendar className="h-4 w-4" />;
      case 'competition':
        return <TrendingDown className="h-4 w-4" />;
      case 'performance':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      revenue: 'Receita',
      occupancy: 'Ocupação',
      pricing: 'Precificação',
      demand: 'Demanda',
      competition: 'Competição',
      performance: 'Performance',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum insight disponível
      </div>
    );
  }

  // Filtrar insights
  const filteredInsights = data.insights.filter(insight => {
    if (severityFilter !== 'all' && insight.severity !== severityFilter) {
      return false;
    }
    if (typeFilter !== 'all' && insight.type !== typeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Info className="h-5 w-5" />
              Insights e Recomendações
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas severidades</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="occupancy">Ocupação</SelectItem>
                  <SelectItem value="pricing">Precificação</SelectItem>
                  <SelectItem value="demand">Demanda</SelectItem>
                  <SelectItem value="competition">Competição</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchInsights}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">
                {data.summary.total_insights}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.summary.critical_count}
              </div>
              <div className="text-xs text-gray-500 mt-1">Críticos</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.summary.warning_count}
              </div>
              <div className="text-xs text-gray-500 mt-1">Atenção</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.summary.info_count}
              </div>
              <div className="text-xs text-gray-500 mt-1">Informativos</div>
            </div>
          </div>

          {/* Lista de Insights */}
          {filteredInsights.length > 0 ? (
            <div className="space-y-4">
              {filteredInsights.map((insight) => {
                const severityBadge = getSeverityBadge(insight.severity);
                const borderColor = 
                  insight.severity === 'critical' ? 'border-red-300' :
                  insight.severity === 'warning' ? 'border-yellow-300' :
                  'border-blue-300';

                return (
                  <Card key={insight.id} className={`border-2 ${borderColor}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getSeverityIcon(insight.severity)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getTypeIcon(insight.type)}
                                <h3 className="font-bold text-lg">{insight.title}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={severityBadge.variant}>
                                  {severityBadge.label}
                                </Badge>
                                <Badge variant="outline">
                                  {getTypeLabel(insight.type)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(insight.created_at)}
                            </div>
                          </div>

                          <p className="text-gray-700">{insight.description}</p>

                          {insight.recommendation && (
                            <Alert className="bg-blue-50 border-blue-200">
                              <Info className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-blue-800">
                                <strong>Recomendação:</strong> {insight.recommendation}
                              </AlertDescription>
                            </Alert>
                          )}

                          {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
                              {Object.entries(insight.metrics).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <div className="text-gray-600 capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </div>
                                  <div className="font-medium">
                                    {typeof value === 'number' 
                                      ? value.toLocaleString('pt-BR', {
                                          minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
                                        })
                                      : String(value)
                                    }
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum insight encontrado com os filtros selecionados
            </div>
          )}

          {/* Período de Análise */}
          <div className="pt-4 border-t text-sm text-gray-500 text-center">
            Período de análise: {formatDate(data.date_range.start)} até {formatDate(data.date_range.end)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

