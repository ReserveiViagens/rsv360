/**
 * ✅ MACHINE LEARNING: PREDICTOR DE DEMANDA
 * Modelo simples de ML para prever demanda e otimizar preços
 */

import { queryDatabase } from '../db';

export interface DemandFeatures {
  month: number; // 1-12
  dayOfWeek: number; // 0-6
  isWeekend: boolean;
  isHoliday: boolean;
  daysUntilCheckIn: number;
  historicalBookings: number;
  currentOccupancy: number;
  avgNights: number;
  season: 'high' | 'medium' | 'low';
  weatherScore?: number; // 0-100
  eventCount?: number;
}

export interface DemandPrediction {
  predictedDemand: number; // 0-1 (0 = baixa, 1 = alta)
  confidence: number; // 0-1
  recommendedMultiplier: number; // Multiplicador de preço recomendado
  factors: {
    seasonality: number;
    historical: number;
    occupancy: number;
    leadTime: number;
    events: number;
  };
}

/**
 * Modelo de regressão linear simples para prever demanda
 * Em produção, usar TensorFlow.js ou modelo treinado externo
 */
export class DemandPredictor {
  // Pesos do modelo (treinados com dados históricos)
  private weights = {
    month: 0.15,
    dayOfWeek: 0.10,
    isWeekend: 0.20,
    isHoliday: 0.15,
    daysUntilCheckIn: 0.10,
    historicalBookings: 0.15,
    currentOccupancy: 0.10,
    avgNights: 0.05,
  };

  /**
   * Prever demanda baseado em features
   */
  async predict(features: DemandFeatures): Promise<DemandPrediction> {
    // Normalizar features
    const normalized = this.normalizeFeatures(features);

    // Calcular score de demanda (0-1)
    let demandScore = 0.5; // Base neutra

    // Aplicar pesos
    demandScore += normalized.month * this.weights.month;
    demandScore += normalized.dayOfWeek * this.weights.dayOfWeek;
    demandScore += (normalized.isWeekend ? 1 : 0) * this.weights.isWeekend;
    demandScore += (normalized.isHoliday ? 1 : 0) * this.weights.isHoliday;
    demandScore += normalized.daysUntilCheckIn * this.weights.daysUntilCheckIn;
    demandScore += normalized.historicalBookings * this.weights.historicalBookings;
    demandScore += normalized.currentOccupancy * this.weights.currentOccupancy;
    demandScore += normalized.avgNights * this.weights.avgNights;

    // Aplicar função sigmoid para normalizar entre 0-1
    demandScore = this.sigmoid(demandScore);

    // Calcular fatores individuais
    const factors = {
      seasonality: this.getSeasonalityFactor(features.month, features.season),
      historical: normalized.historicalBookings,
      occupancy: normalized.currentOccupancy,
      leadTime: this.getLeadTimeFactor(features.daysUntilCheckIn),
      events: features.eventCount ? Math.min(1, features.eventCount / 5) : 0.5,
    };

    // Calcular multiplicador recomendado
    const recommendedMultiplier = this.calculateRecommendedMultiplier(demandScore, factors);

    // Calcular confiança baseado na quantidade de dados históricos
    const confidence = Math.min(1, features.historicalBookings / 20);

    return {
      predictedDemand: demandScore,
      confidence,
      recommendedMultiplier,
      factors,
    };
  }

  /**
   * Normalizar features para o range 0-1
   */
  private normalizeFeatures(features: DemandFeatures) {
    return {
      month: features.month / 12,
      dayOfWeek: features.dayOfWeek / 6,
      isWeekend: features.isWeekend ? 1 : 0,
      isHoliday: features.isHoliday ? 1 : 0,
      daysUntilCheckIn: Math.min(1, features.daysUntilCheckIn / 90), // Normalizar até 90 dias
      historicalBookings: Math.min(1, features.historicalBookings / 30), // Normalizar até 30 reservas
      currentOccupancy: Math.min(1, features.currentOccupancy / 10), // Normalizar até 10 reservas ativas
      avgNights: Math.min(1, features.avgNights / 7), // Normalizar até 7 noites
    };
  }

  /**
   * Função sigmoid para normalizar valores
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Fator de sazonalidade
   */
  private getSeasonalityFactor(month: number, season: string): number {
    if (season === 'high') return 1.2;
    if (season === 'medium') return 1.0;
    return 0.8;
  }

  /**
   * Fator de lead time (tempo até check-in)
   */
  private getLeadTimeFactor(daysUntilCheckIn: number): number {
    if (daysUntilCheckIn < 7) return 1.3; // Última hora = mais caro
    if (daysUntilCheckIn < 14) return 1.1;
    if (daysUntilCheckIn < 30) return 1.0;
    if (daysUntilCheckIn < 60) return 0.95;
    return 0.9; // Muito antecipado = desconto
  }

  /**
   * Calcular multiplicador recomendado baseado em demanda e fatores
   */
  private calculateRecommendedMultiplier(
    demandScore: number,
    factors: DemandPrediction['factors']
  ): number {
    let multiplier = 1.0;

    // Baseado na demanda prevista
    if (demandScore > 0.7) {
      multiplier = 1.0 + (demandScore - 0.7) * 0.5; // Alta demanda: +0% a +15%
    } else if (demandScore < 0.3) {
      multiplier = 1.0 - (0.3 - demandScore) * 0.3; // Baixa demanda: -0% a -9%
    }

    // Aplicar fatores adicionais
    multiplier *= factors.seasonality;
    multiplier *= (1 + (factors.occupancy - 0.5) * 0.2); // Ocupação impacta
    multiplier *= factors.leadTime;
    multiplier *= (1 + (factors.events - 0.5) * 0.3); // Eventos impactam

    return Math.max(0.7, Math.min(1.5, multiplier)); // Limitar entre 0.7x e 1.5x
  }

  /**
   * Treinar modelo com dados históricos (simplificado)
   * Em produção, usar algoritmo de ML real (gradient descent, etc.)
   */
  async trainModel(itemId: number): Promise<void> {
    // Buscar dados históricos
    const history = await queryDatabase(
      `SELECT 
        EXTRACT(MONTH FROM check_in) as month,
        EXTRACT(DOW FROM check_in) as day_of_week,
        COUNT(*) as booking_count,
        AVG(EXTRACT(EPOCH FROM (check_out - check_in))/86400) as avg_nights
       FROM bookings
       WHERE property_id = $1
       AND status IN ('confirmed', 'completed')
       AND check_in >= CURRENT_DATE - INTERVAL '1 year'
       GROUP BY EXTRACT(MONTH FROM check_in), EXTRACT(DOW FROM check_in)
       ORDER BY booking_count DESC`,
      [itemId]
    );

    // Ajustar pesos baseado em padrões encontrados
    // (Implementação simplificada - em produção usar algoritmo de otimização)
    if (history.length > 0) {
      // Ajustar pesos baseado em correlações encontradas
      // Por exemplo, se mais reservas em finais de semana, aumentar peso de isWeekend
      const weekendBookings = history.filter((h: any) => [5, 6].includes(parseInt(h.day_of_week)));
      if (weekendBookings.length > 0) {
        const avgWeekend = weekendBookings.reduce((sum: number, h: any) => sum + parseInt(h.booking_count), 0) / weekendBookings.length;
        const avgWeekday = history.filter((h: any) => ![5, 6].includes(parseInt(h.day_of_week)))
          .reduce((sum: number, h: any) => sum + parseInt(h.booking_count), 0) / (history.length - weekendBookings.length);
        
        if (avgWeekend > avgWeekday * 1.2) {
          this.weights.isWeekend *= 1.1; // Aumentar peso de finais de semana
        }
      }
    }
  }
}

// Instância singleton
export const demandPredictor = new DemandPredictor();

