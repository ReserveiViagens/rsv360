// Sistema de Analytics para Templates RSV 360

export interface TemplateAnalytics {
  templateId: string;
  templateName: string;
  category: string;
  region?: string;
  metrics: TemplateMetrics;
  trends: TemplateTrends;
  userEngagement: UserEngagement;
  performance: PerformanceMetrics;
  lastUpdated: string;
}

export interface TemplateMetrics {
  totalViews: number;
  totalUses: number;
  totalShares: number;
  totalFavorites: number;
  totalComments: number;
  conversionRate: number; // views -> uses
  averageRating: number;
  totalRatings: number;
}

export interface TemplateTrends {
  dailyViews: DailyMetric[];
  dailyUses: DailyMetric[];
  weeklyTrends: WeeklyTrend[];
  monthlyGrowth: number;
  seasonalPatterns: SeasonalPattern[];
}

export interface DailyMetric {
  date: string;
  value: number;
}

export interface WeeklyTrend {
  week: string;
  views: number;
  uses: number;
  shares: number;
  growth: number;
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageUses: number;
  peakMonth: string;
  growthRate: number;
}

export interface UserEngagement {
  uniqueUsers: number;
  returningUsers: number;
  averageSessionTime: number;
  bounceRate: number;
  topUserSegments: UserSegment[];
  geographicDistribution: GeographicData[];
}

export interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
  averageUses: number;
}

export interface GeographicData {
  region: string;
  users: number;
  uses: number;
  percentage: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  errorRate: number;
  successRate: number;
  userSatisfaction: number;
  completionRate: number;
  dropoffPoints: DropoffPoint[];
}

export interface DropoffPoint {
  step: string;
  dropoffRate: number;
  commonIssues: string[];
}

export interface AnalyticsEvent {
  id: string;
  type: 'view' | 'use' | 'share' | 'favorite' | 'comment' | 'rating' | 'error';
  templateId: string;
  userId: string;
  timestamp: string;
  metadata: {
    userAgent?: string;
    location?: string;
    referrer?: string;
    sessionId?: string;
    duration?: number;
    rating?: number;
    errorType?: string;
    [key: string]: any;
  };
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'template' | 'user' | 'performance' | 'business';
  period: {
    start: string;
    end: string;
  };
  data: any;
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
  createdAt: string;
  createdBy: string;
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data: any;
}

export interface AnalyticsRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'optimization' | 'content' | 'marketing' | 'technical';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export class AnalyticsManager {
  private static EVENTS_KEY = 'rsv360_analytics_events';
  private static ANALYTICS_KEY = 'rsv360_template_analytics';
  private static REPORTS_KEY = 'rsv360_analytics_reports';
  private static currentUserId = 'default_user';
  private static sessionId = this.generateSessionId();

  // Rastreamento de eventos
  static trackEvent(
    type: AnalyticsEvent['type'],
    templateId: string,
    metadata: AnalyticsEvent['metadata'] = {}
  ): void {
    try {
      const event: AnalyticsEvent = {
        id: this.generateId(),
        type,
        templateId,
        userId: this.currentUserId,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          location: window.location.href
        }
      };

      const events = this.getAllEvents();
      events.push(event);
      
      // Manter apenas os últimos 10.000 eventos
      const trimmedEvents = events.slice(-10000);
      
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(trimmedEvents));
      
      // Atualizar métricas do template
      this.updateTemplateMetrics(templateId, type, metadata);
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  }

  // Métricas de templates
  static getTemplateAnalytics(templateId: string): TemplateAnalytics | null {
    try {
      const analytics = this.getAllAnalytics();
      return analytics.find(a => a.templateId === templateId) || null;
    } catch (error) {
      console.error('Erro ao obter analytics do template:', error);
      return null;
    }
  }

  static updateTemplateMetrics(
    templateId: string, 
    eventType: AnalyticsEvent['type'], 
    metadata: AnalyticsEvent['metadata']
  ): void {
    try {
      const analytics = this.getAllAnalytics();
      let templateAnalytics = analytics.find(a => a.templateId === templateId);
      
      if (!templateAnalytics) {
        templateAnalytics = this.createInitialAnalytics(templateId);
        analytics.push(templateAnalytics);
      }

      // Atualizar métricas baseado no tipo de evento
      switch (eventType) {
        case 'view':
          templateAnalytics.metrics.totalViews++;
          this.updateDailyMetric(templateAnalytics.trends.dailyViews, new Date());
          break;
        case 'use':
          templateAnalytics.metrics.totalUses++;
          this.updateDailyMetric(templateAnalytics.trends.dailyUses, new Date());
          break;
        case 'share':
          templateAnalytics.metrics.totalShares++;
          break;
        case 'favorite':
          templateAnalytics.metrics.totalFavorites++;
          break;
        case 'comment':
          templateAnalytics.metrics.totalComments++;
          break;
        case 'rating':
          if (metadata.rating) {
            const currentTotal = templateAnalytics.metrics.averageRating * templateAnalytics.metrics.totalRatings;
            templateAnalytics.metrics.totalRatings++;
            templateAnalytics.metrics.averageRating = (currentTotal + metadata.rating) / templateAnalytics.metrics.totalRatings;
          }
          break;
      }

      // Atualizar taxa de conversão
      if (templateAnalytics.metrics.totalViews > 0) {
        templateAnalytics.metrics.conversionRate = 
          (templateAnalytics.metrics.totalUses / templateAnalytics.metrics.totalViews) * 100;
      }

      templateAnalytics.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  }

  // Relatórios e insights
  static generateReport(
    type: AnalyticsReport['type'],
    period: { start: string; end: string },
    templateIds?: string[]
  ): AnalyticsReport {
    const report: AnalyticsReport = {
      id: this.generateId(),
      title: this.getReportTitle(type),
      type,
      period,
      data: this.getReportData(type, period, templateIds),
      insights: this.generateInsights(type, period, templateIds),
      recommendations: this.generateRecommendations(type, period, templateIds),
      createdAt: new Date().toISOString(),
      createdBy: this.currentUserId
    };

    // Salvar relatório
    const reports = this.getAllReports();
    reports.push(report);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));

    return report;
  }

  static getTopPerformingTemplates(limit: number = 10): TemplateAnalytics[] {
    const analytics = this.getAllAnalytics();
    return analytics
      .sort((a, b) => {
        // Score baseado em múltiplas métricas
        const scoreA = a.metrics.totalUses * 2 + a.metrics.totalViews + a.metrics.totalShares * 3;
        const scoreB = b.metrics.totalUses * 2 + b.metrics.totalViews + b.metrics.totalShares * 3;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  static getTemplatesByCategory(): { [category: string]: TemplateAnalytics[] } {
    const analytics = this.getAllAnalytics();
    const byCategory: { [category: string]: TemplateAnalytics[] } = {};

    analytics.forEach(template => {
      if (!byCategory[template.category]) {
        byCategory[template.category] = [];
      }
      byCategory[template.category].push(template);
    });

    return byCategory;
  }

  static getRegionalPerformance(): { [region: string]: { templates: number; totalUses: number; avgRating: number } } {
    const analytics = this.getAllAnalytics();
    const regional: { [region: string]: { templates: number; totalUses: number; avgRating: number; totalRatings: number } } = {};

    analytics.forEach(template => {
      const region = template.region || 'Geral';
      
      if (!regional[region]) {
        regional[region] = { templates: 0, totalUses: 0, avgRating: 0, totalRatings: 0 };
      }

      regional[region].templates++;
      regional[region].totalUses += template.metrics.totalUses;
      regional[region].totalRatings += template.metrics.totalRatings;
      
      if (template.metrics.totalRatings > 0) {
        regional[region].avgRating += template.metrics.averageRating * template.metrics.totalRatings;
      }
    });

    // Calcular média ponderada das avaliações
    Object.keys(regional).forEach(region => {
      if (regional[region].totalRatings > 0) {
        regional[region].avgRating = regional[region].avgRating / regional[region].totalRatings;
      }
    });

    return regional;
  }

  // Análise de tendências
  static getTrendAnalysis(templateId: string, days: number = 30): {
    trend: 'up' | 'down' | 'stable';
    growth: number;
    prediction: number;
    confidence: number;
  } {
    const analytics = this.getTemplateAnalytics(templateId);
    if (!analytics) {
      return { trend: 'stable', growth: 0, prediction: 0, confidence: 0 };
    }

    const recentData = analytics.trends.dailyUses.slice(-days);
    if (recentData.length < 7) {
      return { trend: 'stable', growth: 0, prediction: 0, confidence: 0.1 };
    }

    // Calcular tendência usando regressão linear simples
    const xValues = recentData.map((_, index) => index);
    const yValues = recentData.map(d => d.value);
    
    const n = recentData.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Determinar tendência
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (slope > 0.1) trend = 'up';
    else if (slope < -0.1) trend = 'down';

    // Calcular crescimento percentual
    const firstWeek = yValues.slice(0, 7).reduce((a, b) => a + b, 0);
    const lastWeek = yValues.slice(-7).reduce((a, b) => a + b, 0);
    const growth = firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0;

    // Predição para próximos 7 dias
    const prediction = slope * (n + 7) + intercept;

    // Confiança baseada na correlação
    const meanY = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const ssRes = yValues.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (ssRes / ssTotal);
    const confidence = Math.max(0, Math.min(1, rSquared));

    return { trend, growth, prediction: Math.max(0, prediction), confidence };
  }

  // Insights automáticos
  private static generateInsights(
    type: AnalyticsReport['type'],
    period: { start: string; end: string },
    templateIds?: string[]
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const analytics = this.getAllAnalytics();

    // Insight sobre templates mais populares
    const topTemplates = this.getTopPerformingTemplates(3);
    if (topTemplates.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Templates de Alto Desempenho',
        description: `Os templates "${topTemplates[0].templateName}" lideram em performance com ${topTemplates[0].metrics.totalUses} usos.`,
        impact: 'high',
        confidence: 0.9,
        data: topTemplates
      });
    }

    // Insight sobre conversão
    const avgConversion = analytics.reduce((sum, a) => sum + a.metrics.conversionRate, 0) / analytics.length;
    const lowConversionTemplates = analytics.filter(a => a.metrics.conversionRate < avgConversion * 0.5);
    
    if (lowConversionTemplates.length > 0) {
      insights.push({
        type: 'negative',
        title: 'Baixa Taxa de Conversão',
        description: `${lowConversionTemplates.length} templates têm taxa de conversão abaixo da média (${avgConversion.toFixed(1)}%).`,
        impact: 'medium',
        confidence: 0.8,
        data: lowConversionTemplates
      });
    }

    // Insight sobre sazonalidade
    const regionalData = this.getRegionalPerformance();
    const bestRegion = Object.entries(regionalData).reduce((best, [region, data]) => 
      data.totalUses > best.data.totalUses ? { region, data } : best,
      { region: '', data: { totalUses: 0, templates: 0, avgRating: 0 } }
    );

    if (bestRegion.region) {
      insights.push({
        type: 'positive',
        title: 'Região de Destaque',
        description: `Templates da região "${bestRegion.region}" têm excelente performance com ${bestRegion.data.totalUses} usos totais.`,
        impact: 'medium',
        confidence: 0.7,
        data: bestRegion
      });
    }

    return insights;
  }

  // Recomendações automáticas
  private static generateRecommendations(
    type: AnalyticsReport['type'],
    period: { start: string; end: string },
    templateIds?: string[]
  ): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];
    const analytics = this.getAllAnalytics();

    // Recomendação para templates com baixa conversão
    const lowConversionTemplates = analytics.filter(a => a.metrics.conversionRate < 10);
    if (lowConversionTemplates.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'optimization',
        title: 'Otimizar Templates com Baixa Conversão',
        description: 'Alguns templates têm muitas visualizações mas poucos usos. Isso indica problemas na apresentação ou conteúdo.',
        expectedImpact: 'Aumento de 20-30% na taxa de conversão',
        effort: 'medium',
        actionItems: [
          'Revisar títulos e descrições dos templates',
          'Melhorar preview e imagens',
          'Simplificar processo de uso',
          'Adicionar mais informações sobre benefícios'
        ]
      });
    }

    // Recomendação para criar mais templates regionais
    const regionalData = this.getRegionalPerformance();
    const regionsWithFewTemplates = Object.entries(regionalData).filter(([_, data]) => data.templates < 3);
    
    if (regionsWithFewTemplates.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'content',
        title: 'Expandir Templates Regionais',
        description: 'Algumas regiões têm poucos templates disponíveis, representando oportunidade de crescimento.',
        expectedImpact: 'Aumento de 15-25% no uso total',
        effort: 'high',
        actionItems: [
          'Pesquisar demanda por região',
          'Criar templates específicos para regiões com poucos modelos',
          'Adaptar templates existentes para outras regiões',
          'Fazer parcerias locais para conteúdo'
        ]
      });
    }

    // Recomendação para melhorar avaliações
    const lowRatedTemplates = analytics.filter(a => a.metrics.averageRating < 4.0 && a.metrics.totalRatings > 5);
    if (lowRatedTemplates.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'optimization',
        title: 'Melhorar Qualidade dos Templates',
        description: 'Alguns templates têm avaliações baixas e precisam de melhorias.',
        expectedImpact: 'Melhoria na satisfação do usuário',
        effort: 'medium',
        actionItems: [
          'Analisar feedback dos usuários',
          'Atualizar conteúdo desatualizado',
          'Melhorar formatação e apresentação',
          'Adicionar mais opções de personalização'
        ]
      });
    }

    return recommendations;
  }

  // Funções auxiliares
  private static createInitialAnalytics(templateId: string): TemplateAnalytics {
    return {
      templateId,
      templateName: 'Template',
      category: 'Geral',
      metrics: {
        totalViews: 0,
        totalUses: 0,
        totalShares: 0,
        totalFavorites: 0,
        totalComments: 0,
        conversionRate: 0,
        averageRating: 0,
        totalRatings: 0
      },
      trends: {
        dailyViews: [],
        dailyUses: [],
        weeklyTrends: [],
        monthlyGrowth: 0,
        seasonalPatterns: []
      },
      userEngagement: {
        uniqueUsers: 0,
        returningUsers: 0,
        averageSessionTime: 0,
        bounceRate: 0,
        topUserSegments: [],
        geographicDistribution: []
      },
      performance: {
        loadTime: 0,
        errorRate: 0,
        successRate: 100,
        userSatisfaction: 0,
        completionRate: 0,
        dropoffPoints: []
      },
      lastUpdated: new Date().toISOString()
    };
  }

  private static updateDailyMetric(dailyMetrics: DailyMetric[], date: Date): void {
    const dateStr = date.toISOString().split('T')[0];
    const existing = dailyMetrics.find(d => d.date === dateStr);
    
    if (existing) {
      existing.value++;
    } else {
      dailyMetrics.push({ date: dateStr, value: 1 });
      
      // Manter apenas os últimos 90 dias
      dailyMetrics.sort((a, b) => a.date.localeCompare(b.date));
      if (dailyMetrics.length > 90) {
        dailyMetrics.splice(0, dailyMetrics.length - 90);
      }
    }
  }

  private static getReportTitle(type: AnalyticsReport['type']): string {
    const titles = {
      template: 'Relatório de Performance de Templates',
      user: 'Relatório de Engajamento de Usuários',
      performance: 'Relatório de Performance Técnica',
      business: 'Relatório de Métricas de Negócio'
    };
    return titles[type];
  }

  private static getReportData(
    type: AnalyticsReport['type'],
    period: { start: string; end: string },
    templateIds?: string[]
  ): any {
    const analytics = this.getAllAnalytics();
    const events = this.getEventsInPeriod(period.start, period.end);

    return {
      totalTemplates: analytics.length,
      totalEvents: events.length,
      topTemplates: this.getTopPerformingTemplates(10),
      categoryBreakdown: this.getTemplatesByCategory(),
      regionalPerformance: this.getRegionalPerformance(),
      period
    };
  }

  private static getEventsInPeriod(start: string, end: string): AnalyticsEvent[] {
    const events = this.getAllEvents();
    const startDate = new Date(start);
    const endDate = new Date(end);

    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  private static getAllEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.EVENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter eventos:', error);
      return [];
    }
  }

  private static getAllAnalytics(): TemplateAnalytics[] {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter analytics:', error);
      return [];
    }
  }

  private static getAllReports(): AnalyticsReport[] {
    try {
      const stored = localStorage.getItem(this.REPORTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter relatórios:', error);
      return [];
    }
  }

  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // API pública para estatísticas rápidas
  static getQuickStats(): {
    totalViews: number;
    totalUses: number;
    totalTemplates: number;
    avgConversionRate: number;
    topTemplate: string;
    growthRate: number;
  } {
    const analytics = this.getAllAnalytics();
    
    const totalViews = analytics.reduce((sum, a) => sum + a.metrics.totalViews, 0);
    const totalUses = analytics.reduce((sum, a) => sum + a.metrics.totalUses, 0);
    const avgConversionRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.metrics.conversionRate, 0) / analytics.length 
      : 0;
    
    const topTemplate = analytics.reduce((top, current) => 
      current.metrics.totalUses > top.metrics.totalUses ? current : top,
      analytics[0] || { templateName: 'N/A', metrics: { totalUses: 0 } }
    );

    // Calcular taxa de crescimento (últimos 30 dias vs 30 dias anteriores)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentEvents = this.getEventsInPeriod(thirtyDaysAgo.toISOString(), now.toISOString());
    const previousEvents = this.getEventsInPeriod(sixtyDaysAgo.toISOString(), thirtyDaysAgo.toISOString());

    const growthRate = previousEvents.length > 0 
      ? ((recentEvents.length - previousEvents.length) / previousEvents.length) * 100 
      : 0;

    return {
      totalViews,
      totalUses,
      totalTemplates: analytics.length,
      avgConversionRate,
      topTemplate: topTemplate.templateName,
      growthRate
    };
  }
}

export default AnalyticsManager;
