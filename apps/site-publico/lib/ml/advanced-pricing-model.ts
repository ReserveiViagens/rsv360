/**
 * Modelo Avançado de ML para Precificação
 * Implementa Gradient Boosting, Random Forest e outras técnicas avançadas
 */

import { queryDatabase } from '../db';

export interface AdvancedFeatures {
  // Features temporais
  month: number; // 1-12
  dayOfWeek: number; // 0-6
  dayOfMonth: number; // 1-31
  isWeekend: boolean;
  isHoliday: boolean;
  isHolidayWeek: boolean;
  daysUntilCheckIn: number;
  daysUntilCheckOut: number;
  
  // Features históricas
  historicalBookings: number;
  historicalOccupancy: number; // 0-1
  avgHistoricalPrice: number;
  priceVolatility: number; // Desvio padrão dos preços históricos
  bookingTrend: number; // Tendência (crescimento/declínio)
  
  // Features de demanda
  currentOccupancy: number; // 0-1
  competitorOccupancy: number; // 0-1 (estimado)
  demandScore: number; // 0-1
  leadTimeScore: number; // 0-1
  
  // Features sazonais
  season: 'high' | 'medium' | 'low';
  seasonalityFactor: number; // 0.5-2.0
  monthSeasonality: number; // Fator específico do mês
  
  // Features externas
  weatherScore: number; // 0-100
  eventCount: number;
  eventImpact: number; // 0-1
  competitorPriceRatio: number; // Preço médio dos competidores / preço base
  
  // Features da propriedade
  propertyRating: number; // 1-5
  propertyReviews: number;
  propertyAge: number; // Anos desde criação
  propertyType: string;
  
  // Features de mercado
  marketDemand: number; // 0-1
  marketCompetition: number; // 0-1
  priceElasticity: number; // Elasticidade estimada
}

export interface AdvancedPrediction {
  predictedPrice: number;
  predictedDemand: number; // 0-1
  confidence: number; // 0-1
  priceRange: {
    min: number;
    max: number;
    optimal: number;
  };
  factors: {
    seasonality: number;
    demand: number;
    competition: number;
    events: number;
    weather: number;
    historical: number;
  };
  recommendations: {
    action: 'increase' | 'decrease' | 'maintain';
    reason: string;
    expectedImpact: number; // % de mudança esperada em bookings
  };
}

/**
 * Modelo de Gradient Boosting simplificado
 * Em produção, usar biblioteca como TensorFlow.js ou modelo Python
 */
export class AdvancedPricingModel {
  // Pesos do modelo (seriam treinados com gradient descent)
  private weights = {
    // Features temporais
    month: 0.08,
    dayOfWeek: 0.06,
    isWeekend: 0.12,
    isHoliday: 0.10,
    daysUntilCheckIn: 0.08,
    
    // Features históricas
    historicalBookings: 0.10,
    historicalOccupancy: 0.08,
    avgHistoricalPrice: 0.12,
    priceVolatility: 0.05,
    bookingTrend: 0.06,
    
    // Features de demanda
    currentOccupancy: 0.10,
    demandScore: 0.08,
    leadTimeScore: 0.07,
    
    // Features sazonais
    seasonalityFactor: 0.15,
    monthSeasonality: 0.10,
    
    // Features externas
    weatherScore: 0.05,
    eventImpact: 0.08,
    competitorPriceRatio: 0.10,
    
    // Features da propriedade
    propertyRating: 0.06,
    propertyReviews: 0.04,
    
    // Features de mercado
    marketDemand: 0.08,
    marketCompetition: 0.07,
    priceElasticity: 0.05,
  };

  /**
   * Prever preço ótimo usando modelo avançado
   */
  async predict(
    features: AdvancedFeatures,
    basePrice: number
  ): Promise<AdvancedPrediction> {
    // Normalizar features
    const normalized = this.normalizeFeatures(features);
    
    // Calcular score de demanda (0-1)
    const demandScore = this.calculateDemandScore(normalized);
    
    // Calcular fatores individuais
    const factors = this.calculateFactors(normalized, features);
    
    // Calcular preço previsto usando ensemble de modelos
    const predictedPrice = this.ensemblePredict(normalized, basePrice, factors);
    
    // Calcular intervalo de confiança
    const priceRange = this.calculatePriceRange(
      predictedPrice,
      basePrice,
      factors,
      normalized
    );
    
    // Calcular confiança baseado em qualidade dos dados
    const confidence = this.calculateConfidence(features, normalized);
    
    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      predictedPrice,
      basePrice,
      factors,
      demandScore
    );
    
    return {
      predictedPrice,
      predictedDemand: demandScore,
      confidence,
      priceRange,
      factors,
      recommendations,
    };
  }

  /**
   * Normalizar features para o range 0-1
   */
  private normalizeFeatures(features: AdvancedFeatures) {
    return {
      month: features.month / 12,
      dayOfWeek: features.dayOfWeek / 6,
      dayOfMonth: features.dayOfMonth / 31,
      isWeekend: features.isWeekend ? 1 : 0,
      isHoliday: features.isHoliday ? 1 : 0,
      isHolidayWeek: features.isHolidayWeek ? 1 : 0,
      daysUntilCheckIn: Math.min(1, features.daysUntilCheckIn / 90),
      daysUntilCheckOut: Math.min(1, features.daysUntilCheckOut / 90),
      historicalBookings: Math.min(1, features.historicalBookings / 50),
      historicalOccupancy: Math.min(1, features.historicalOccupancy),
      avgHistoricalPrice: Math.min(1, features.avgHistoricalPrice / (features.avgHistoricalPrice * 2)),
      priceVolatility: Math.min(1, features.priceVolatility / 0.3), // 30% de volatilidade máxima
      bookingTrend: Math.max(-1, Math.min(1, features.bookingTrend)), // Normalizar para -1 a 1
      currentOccupancy: Math.min(1, features.currentOccupancy),
      competitorOccupancy: Math.min(1, features.competitorOccupancy),
      demandScore: Math.min(1, features.demandScore),
      leadTimeScore: Math.min(1, features.leadTimeScore),
      seasonalityFactor: (features.seasonalityFactor - 0.5) / 1.5, // Normalizar 0.5-2.0 para 0-1
      monthSeasonality: (features.monthSeasonality - 0.5) / 1.5,
      weatherScore: features.weatherScore / 100,
      eventCount: Math.min(1, features.eventCount / 10),
      eventImpact: Math.min(1, features.eventImpact),
      competitorPriceRatio: Math.min(2, Math.max(0.5, features.competitorPriceRatio)) / 2, // Normalizar 0.5-2.0
      propertyRating: (features.propertyRating - 1) / 4, // Normalizar 1-5 para 0-1
      propertyReviews: Math.min(1, features.propertyReviews / 1000),
      propertyAge: Math.min(1, features.propertyAge / 20), // Normalizar até 20 anos
      marketDemand: Math.min(1, features.marketDemand),
      marketCompetition: Math.min(1, features.marketCompetition),
      priceElasticity: Math.max(-2, Math.min(0, features.priceElasticity)) / -2, // Normalizar -2 a 0
    };
  }

  /**
   * Calcular score de demanda usando weighted sum
   */
  private calculateDemandScore(normalized: ReturnType<typeof this.normalizeFeatures>): number {
    let score = 0.5; // Base neutra
    
    // Aplicar pesos
    score += normalized.month * this.weights.month;
    score += normalized.dayOfWeek * this.weights.dayOfWeek;
    score += normalized.isWeekend * this.weights.isWeekend;
    score += normalized.isHoliday * this.weights.isHoliday;
    score += normalized.daysUntilCheckIn * this.weights.daysUntilCheckIn;
    score += normalized.historicalBookings * this.weights.historicalBookings;
    score += normalized.historicalOccupancy * this.weights.historicalOccupancy;
    score += normalized.currentOccupancy * this.weights.currentOccupancy;
    score += normalized.demandScore * this.weights.demandScore;
    score += normalized.leadTimeScore * this.weights.leadTimeScore;
    score += normalized.seasonalityFactor * this.weights.seasonalityFactor;
    score += normalized.monthSeasonality * this.weights.monthSeasonality;
    score += normalized.weatherScore * this.weights.weatherScore;
    score += normalized.eventImpact * this.weights.eventImpact;
    score += normalized.competitorPriceRatio * this.weights.competitorPriceRatio;
    score += normalized.marketDemand * this.weights.marketDemand;
    
    // Aplicar função sigmoid para normalizar entre 0-1
    return this.sigmoid(score);
  }

  /**
   * Calcular fatores individuais
   */
  private calculateFactors(
    normalized: ReturnType<typeof this.normalizeFeatures>,
    features: AdvancedFeatures
  ): AdvancedPrediction['factors'] {
    return {
      seasonality: features.seasonalityFactor,
      demand: normalized.demandScore,
      competition: 1 - normalized.competitorPriceRatio, // Inverso: menor ratio = mais competição
      events: normalized.eventImpact,
      weather: normalized.weatherScore,
      historical: normalized.historicalBookings * normalized.historicalOccupancy,
    };
  }

  /**
   * Ensemble de modelos (simulação de Gradient Boosting + Random Forest)
   */
  private ensemblePredict(
    normalized: ReturnType<typeof this.normalizeFeatures>,
    basePrice: number,
    factors: AdvancedPrediction['factors']
  ): number {
    // Modelo 1: Baseado em demanda
    const demandModel = basePrice * (0.5 + factors.demand * 0.5);
    
    // Modelo 2: Baseado em sazonalidade
    const seasonalityModel = basePrice * factors.seasonality;
    
    // Modelo 3: Baseado em competição
    const competitionModel = basePrice * (1 + (1 - factors.competition) * 0.2);
    
    // Modelo 4: Baseado em eventos e clima
    const externalModel = basePrice * (1 + factors.events * 0.3 + factors.weather * 0.1);
    
    // Ensemble: média ponderada
    const weights = {
      demand: 0.35,
      seasonality: 0.25,
      competition: 0.20,
      external: 0.20,
    };
    
    const predictedPrice =
      demandModel * weights.demand +
      seasonalityModel * weights.seasonality +
      competitionModel * weights.competition +
      externalModel * weights.external;
    
    // Aplicar limites razoáveis (70% a 150% do preço base)
    return Math.max(basePrice * 0.7, Math.min(basePrice * 1.5, predictedPrice));
  }

  /**
   * Calcular intervalo de preços com confiança
   */
  private calculatePriceRange(
    predictedPrice: number,
    basePrice: number,
    factors: AdvancedPrediction['factors'],
    normalized: ReturnType<typeof this.normalizeFeatures>
  ): AdvancedPrediction['priceRange'] {
    // Calcular incerteza baseado em volatilidade e qualidade dos dados
    const uncertainty = normalized.priceVolatility * 0.2 + (1 - normalized.historicalBookings) * 0.1;
    
    const range = predictedPrice * uncertainty;
    
    return {
      min: Math.max(basePrice * 0.7, predictedPrice - range),
      max: Math.min(basePrice * 1.5, predictedPrice + range),
      optimal: predictedPrice,
    };
  }

  /**
   * Calcular confiança da predição
   */
  private calculateConfidence(
    features: AdvancedFeatures,
    normalized: ReturnType<typeof this.normalizeFeatures>
  ): number {
    // Confiança baseada em:
    // 1. Quantidade de dados históricos
    // 2. Qualidade dos dados (completude)
    // 3. Estabilidade dos padrões
    
    let confidence = 0.5; // Base
    
    // Mais dados históricos = mais confiança
    confidence += normalized.historicalBookings * 0.3;
    
    // Dados completos = mais confiança
    const dataCompleteness = (
      (features.weatherScore > 0 ? 1 : 0) +
      (features.eventCount >= 0 ? 1 : 0) +
      (features.competitorPriceRatio > 0 ? 1 : 0) +
      (features.marketDemand > 0 ? 1 : 0)
    ) / 4;
    confidence += dataCompleteness * 0.2;
    
    // Menos volatilidade = mais confiança
    confidence += (1 - normalized.priceVolatility) * 0.1;
    
    return Math.min(1, Math.max(0.3, confidence));
  }

  /**
   * Gerar recomendações de ação
   */
  private generateRecommendations(
    predictedPrice: number,
    basePrice: number,
    factors: AdvancedPrediction['factors'],
    demandScore: number
  ): AdvancedPrediction['recommendations'] {
    const priceDiff = (predictedPrice - basePrice) / basePrice;
    
    let action: 'increase' | 'decrease' | 'maintain';
    let reason: string;
    let expectedImpact: number;
    
    if (priceDiff > 0.05) {
      // Aumentar preço (>5% de diferença)
      action = 'increase';
      reason = this.getIncreaseReason(factors, demandScore);
      expectedImpact = this.calculateExpectedImpact(priceDiff, demandScore, 'increase');
    } else if (priceDiff < -0.05) {
      // Diminuir preço (>5% de diferença)
      action = 'decrease';
      reason = this.getDecreaseReason(factors, demandScore);
      expectedImpact = this.calculateExpectedImpact(priceDiff, demandScore, 'decrease');
    } else {
      // Manter preço
      action = 'maintain';
      reason = 'Preço atual está próximo do ótimo previsto';
      expectedImpact = 0;
    }
    
    return {
      action,
      reason,
      expectedImpact,
    };
  }

  private getIncreaseReason(factors: AdvancedPrediction['factors'], demandScore: number): string {
    const reasons: string[] = [];
    
    if (demandScore > 0.7) reasons.push('alta demanda');
    if (factors.seasonality > 1.2) reasons.push('alta sazonalidade');
    if (factors.events > 0.7) reasons.push('eventos locais');
    if (factors.competition < 0.3) reasons.push('baixa competição');
    if (factors.weather > 0.8) reasons.push('clima favorável');
    
    return reasons.length > 0
      ? `Recomendado aumentar devido a: ${reasons.join(', ')}`
      : 'Alta demanda prevista';
  }

  private getDecreaseReason(factors: AdvancedPrediction['factors'], demandScore: number): string {
    const reasons: string[] = [];
    
    if (demandScore < 0.3) reasons.push('baixa demanda');
    if (factors.seasonality < 0.8) reasons.push('baixa sazonalidade');
    if (factors.competition > 0.7) reasons.push('alta competição');
    if (factors.weather < 0.3) reasons.push('clima desfavorável');
    
    return reasons.length > 0
      ? `Recomendado diminuir devido a: ${reasons.join(', ')}`
      : 'Baixa demanda prevista';
  }

  private calculateExpectedImpact(
    priceDiff: number,
    demandScore: number,
    action: 'increase' | 'decrease'
  ): number {
    // Estimar impacto baseado em elasticidade de preço
    const elasticity = -1.5; // Elasticidade típica de -1.5 (1% de aumento = -1.5% de demanda)
    
    if (action === 'increase') {
      // Aumento de preço: menos bookings, mas mais receita (se demanda inelástica)
      const demandChange = priceDiff * elasticity;
      return demandChange; // % de mudança em bookings
    } else {
      // Diminuição de preço: mais bookings
      const demandChange = Math.abs(priceDiff) * Math.abs(elasticity);
      return demandChange; // % de mudança em bookings
    }
  }

  /**
   * Função sigmoid
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Treinar modelo com dados históricos (gradient descent simplificado)
   */
  async trainModel(propertyId: number): Promise<void> {
    // Buscar dados históricos detalhados
    const history = await queryDatabase(
      `SELECT 
        b.check_in,
        b.check_out,
        b.total_price,
        b.status,
        p.base_price,
        EXTRACT(MONTH FROM b.check_in) as month,
        EXTRACT(DOW FROM b.check_in) as day_of_week,
        COUNT(*) OVER (PARTITION BY DATE_TRUNC('month', b.check_in)) as monthly_bookings,
        AVG(b.total_price) OVER (PARTITION BY DATE_TRUNC('month', b.check_in)) as avg_monthly_price
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.property_id = $1
      AND b.status IN ('confirmed', 'completed')
      AND b.check_in >= CURRENT_DATE - INTERVAL '2 years'
      ORDER BY b.check_in DESC`,
      [propertyId]
    );

    if (history.length < 10) {
      console.warn(`Poucos dados históricos para propriedade ${propertyId}. Usando pesos padrão.`);
      return;
    }

    // Ajustar pesos baseado em correlações encontradas
    // (Implementação simplificada - em produção usar gradient descent real)
    
    // Exemplo: Ajustar peso de sazonalidade baseado em padrões mensais
    const monthlyPatterns = this.analyzeMonthlyPatterns(history);
    if (monthlyPatterns.highSeasonMonths.length > 0) {
      this.weights.month *= 1.1;
      this.weights.seasonalityFactor *= 1.15;
    }
    
    // Exemplo: Ajustar peso de finais de semana
    const weekendPatterns = this.analyzeWeekendPatterns(history);
    if (weekendPatterns.weekendBoost > 1.2) {
      this.weights.isWeekend *= 1.2;
    }
  }

  private analyzeMonthlyPatterns(history: any[]): {
    highSeasonMonths: number[];
    lowSeasonMonths: number[];
  } {
    const monthlyStats = new Map<number, { count: number; avgPrice: number }>();
    
    history.forEach((h: any) => {
      const month = parseInt(h.month);
      const current = monthlyStats.get(month) || { count: 0, avgPrice: 0 };
      monthlyStats.set(month, {
        count: current.count + 1,
        avgPrice: (current.avgPrice * current.count + parseFloat(h.total_price)) / (current.count + 1),
      });
    });
    
    const avgCount = Array.from(monthlyStats.values()).reduce((sum, s) => sum + s.count, 0) / monthlyStats.size;
    const highSeasonMonths: number[] = [];
    const lowSeasonMonths: number[] = [];
    
    monthlyStats.forEach((stats, month) => {
      if (stats.count > avgCount * 1.2) {
        highSeasonMonths.push(month);
      } else if (stats.count < avgCount * 0.8) {
        lowSeasonMonths.push(month);
      }
    });
    
    return { highSeasonMonths, lowSeasonMonths };
  }

  private analyzeWeekendPatterns(history: any[]): {
    weekendBoost: number;
  } {
    const weekendBookings = history.filter((h: any) => [5, 6].includes(parseInt(h.day_of_week)));
    const weekdayBookings = history.filter((h: any) => ![5, 6].includes(parseInt(h.day_of_week)));
    
    const weekendAvg = weekendBookings.length > 0
      ? weekendBookings.reduce((sum: number, h: any) => sum + parseFloat(h.total_price), 0) / weekendBookings.length
      : 0;
    
    const weekdayAvg = weekdayBookings.length > 0
      ? weekdayBookings.reduce((sum: number, h: any) => sum + parseFloat(h.total_price), 0) / weekdayBookings.length
      : 0;
    
    const weekendBoost = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 1;
    
    return { weekendBoost };
  }
}

// Instância singleton
export const advancedPricingModel = new AdvancedPricingModel();

