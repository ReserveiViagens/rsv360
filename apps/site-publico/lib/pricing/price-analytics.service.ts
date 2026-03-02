/**
 * ✅ DIA 2 - ARQUIVO 2: Price Analytics Service
 * 
 * @description Análise avançada de performance de preços:
 * - Análise de receita e ocupação
 * - Elasticidade de preço
 * - Comparação com concorrentes
 * - Recomendações de pricing
 * - Histórico e tendências
 * 
 * @module pricing
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';

// ================================
// TYPES & SCHEMAS
// ================================

const PriceAnalyticsSchema = z.object({
  propertyId: z.number().int().positive(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.date(),
  endDate: z.date(),
});

const PricePerformanceMetricsSchema = z.object({
  propertyId: z.number(),
  period: z.string(),
  avgPrice: z.number(),
  minPrice: z.number(),
  maxPrice: z.number(),
  occupancyRate: z.number(),
  revenue: z.number(),
  revenuePerAvailableRoom: z.number(),
  bookingsCount: z.number(),
  avgStayDuration: z.number(),
  priceElasticity: z.number(),
  competitorGap: z.number(),
  recommendedPrice: z.number(),
  priceTrend: z.enum(['increasing', 'decreasing', 'stable']),
});

const PriceRecommendationSchema = z.object({
  propertyId: z.number(),
  currentPrice: z.number(),
  recommendedPrice: z.number(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
  expectedImpact: z.object({
    occupancyChange: z.number(),
    revenueChange: z.number(),
  }),
});

type PriceAnalyticsDTO = z.infer<typeof PriceAnalyticsSchema>;
type PricePerformanceMetrics = z.infer<typeof PricePerformanceMetricsSchema>;
type PriceRecommendation = z.infer<typeof PriceRecommendationSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 1800; // 30 minutes
const CACHE_PREFIX = 'price-analytics:';

// ================================
// PRIVATE FUNCTIONS
// ================================

function validateAnalyticsRequest(data: unknown): PriceAnalyticsDTO {
  return PriceAnalyticsSchema.parse(data);
}

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Analisar performance de preços de uma propriedade
 */
export async function analyzePricePerformance(
  propertyId: number,
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month',
  startDate?: Date,
  endDate?: Date
): Promise<PricePerformanceMetrics> {
  try {
    // Definir período padrão se não fornecido
    const now = new Date();
    const defaultEndDate = endDate || now;
    const defaultStartDate = startDate || (() => {
      const d = new Date(now);
      switch (period) {
        case 'day':
          d.setDate(d.getDate() - 1);
          break;
        case 'week':
          d.setDate(d.getDate() - 7);
          break;
        case 'month':
          d.setMonth(d.getMonth() - 1);
          break;
        case 'quarter':
          d.setMonth(d.getMonth() - 3);
          break;
        case 'year':
          d.setFullYear(d.getFullYear() - 1);
          break;
      }
      return d;
    })();

    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}performance:${propertyId}:${period}:${defaultStartDate.toISOString()}:${defaultEndDate.toISOString()}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar dados de bookings
    const bookings = await queryDatabase(
      `SELECT 
        AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price_per_night,
        MIN(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as min_price,
        MAX(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as max_price,
        COUNT(*) as bookings_count,
        SUM(total_amount) as total_revenue,
        AVG(EXTRACT(EPOCH FROM (check_out - check_in))/86400) as avg_stay_duration
      FROM bookings
      WHERE property_id = $1
      AND check_in >= $2
      AND check_in <= $3
      AND status IN ('confirmed', 'completed')`,
      [propertyId, defaultStartDate.toISOString(), defaultEndDate.toISOString()]
    ) || [];

    const bookingData = bookings[0] || {};

    // Buscar ocupação
    const occupancy = await queryDatabase(
      `SELECT 
        COUNT(DISTINCT DATE(check_in)) as occupied_days,
        COUNT(DISTINCT DATE(check_in))::FLOAT / NULLIF(
          EXTRACT(EPOCH FROM ($3::timestamp - $2::timestamp))/86400, 0
        ) as occupancy_rate
      FROM bookings
      WHERE property_id = $1
      AND check_in >= $2
      AND check_in <= $3
      AND status IN ('confirmed', 'completed')`,
      [propertyId, defaultStartDate.toISOString(), defaultEndDate.toISOString()]
    ) || [];

    const occupancyData = occupancy[0] || {};

    // Calcular métricas
    const avgPrice = parseFloat(bookingData.avg_price_per_night || '0');
    const minPrice = parseFloat(bookingData.min_price || '0');
    const maxPrice = parseFloat(bookingData.max_price || '0');
    const revenue = parseFloat(bookingData.total_revenue || '0');
    const bookingsCount = parseInt(bookingData.bookings_count || '0');
    const avgStayDuration = parseFloat(bookingData.avg_stay_duration || '1');
    const occupancyRate = parseFloat(occupancyData.occupancy_rate || '0') * 100;

    // Calcular RevPAR (Revenue per Available Room)
    const totalDays = Math.ceil((defaultEndDate.getTime() - defaultStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const revpar = revenue / (totalDays || 1);

    // Calcular elasticidade de preço (simplificado)
    // Elasticidade = % mudança em quantidade / % mudança em preço
    const priceElasticity = await calculatePriceElasticity(propertyId, defaultStartDate, defaultEndDate);

    // Calcular gap com concorrentes
    const competitorGap = await calculateCompetitorGap(propertyId);

    // Recomendar preço
    const recommendedPrice = await recommendPrice(propertyId, avgPrice, occupancyRate);

    // Determinar tendência
    const priceTrend = await determinePriceTrend(propertyId, defaultStartDate, defaultEndDate);

    const metrics: PricePerformanceMetrics = {
      propertyId,
      period,
      avgPrice,
      minPrice,
      maxPrice,
      occupancyRate,
      revenue,
      revenuePerAvailableRoom: revpar,
      bookingsCount,
      avgStayDuration,
      priceElasticity,
      competitorGap,
      recommendedPrice,
      priceTrend,
    };

    // Cache results
    await redisCache.set(cacheKey, JSON.stringify(metrics), CACHE_TTL);

    return metrics;
  } catch (error: any) {
    console.error('Erro ao analisar performance de preços:', error);
    throw error;
  }
}

/**
 * Calcular elasticidade de preço
 */
async function calculatePriceElasticity(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    // Buscar variações de preço e quantidade de bookings
    const priceVariations = await queryDatabase(
      `SELECT 
        DATE_TRUNC('week', check_in) as week,
        AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE property_id = $1
      AND check_in >= $2
      AND check_in <= $3
      AND status IN ('confirmed', 'completed')
      GROUP BY DATE_TRUNC('week', check_in)
      ORDER BY week`,
      [propertyId, startDate.toISOString(), endDate.toISOString()]
    ) || [];

    if (priceVariations.length < 2) {
      return 0; // Não há dados suficientes
    }

    // Calcular variação percentual média
    let totalElasticity = 0;
    let count = 0;

    for (let i = 1; i < priceVariations.length; i++) {
      const prev = priceVariations[i - 1];
      const curr = priceVariations[i];

      const priceChange = ((parseFloat(curr.avg_price) - parseFloat(prev.avg_price)) / parseFloat(prev.avg_price)) * 100;
      const quantityChange = ((parseInt(curr.bookings_count) - parseInt(prev.bookings_count)) / parseInt(prev.bookings_count)) * 100;

      if (priceChange !== 0) {
        const elasticity = quantityChange / priceChange;
        totalElasticity += elasticity;
        count++;
      }
    }

    return count > 0 ? totalElasticity / count : 0;
  } catch (error: any) {
    console.error('Erro ao calcular elasticidade:', error);
    return 0;
  }
}

/**
 * Calcular gap com concorrentes
 */
async function calculateCompetitorGap(propertyId: number): Promise<number> {
  try {
    // Buscar preço atual da propriedade
    const propertyPrice = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [propertyId]
    ) || [];

    if (propertyPrice.length === 0) {
      return 0;
    }

    const currentPrice = parseFloat(propertyPrice[0].base_price || '0');

    // Buscar preços de concorrentes (do competitor_scraper)
    const { competitorScraperService } = await import('../competitor-scraper');
    const competitors = await competitorScraperService.getCompetitorPrices(propertyId);

    if (!competitors || competitors.length === 0) {
      return 0;
    }

    // Calcular preço médio dos concorrentes
    const avgCompetitorPrice = competitors.reduce(
      (sum, comp) => sum + (comp.price || 0),
      0
    ) / competitors.length;

    // Gap = diferença percentual
    const gap = ((currentPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;

    return gap;
  } catch (error: any) {
    console.error('Erro ao calcular gap com concorrentes:', error);
    return 0;
  }
}

/**
 * Recomendar preço baseado em análise
 */
async function recommendPrice(
  propertyId: number,
  currentAvgPrice: number,
  occupancyRate: number
): Promise<number> {
  try {
    // Se ocupação < 50%, reduzir preço
    if (occupancyRate < 50) {
      return currentAvgPrice * 0.9; // Reduzir 10%
    }

    // Se ocupação > 90%, aumentar preço
    if (occupancyRate > 90) {
      return currentAvgPrice * 1.1; // Aumentar 10%
    }

    // Caso contrário, manter preço atual
    return currentAvgPrice;
  } catch (error: any) {
    console.error('Erro ao recomendar preço:', error);
    return currentAvgPrice;
  }
}

/**
 * Determinar tendência de preço
 */
async function determinePriceTrend(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<'increasing' | 'decreasing' | 'stable'> {
  try {
    // Dividir período em duas metades
    const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2);

    // Preço médio primeira metade
    const firstHalf = await queryDatabase(
      `SELECT AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price
       FROM bookings
       WHERE property_id = $1
       AND check_in >= $2
       AND check_in < $3
       AND status IN ('confirmed', 'completed')`,
      [propertyId, startDate.toISOString(), midDate.toISOString()]
    ) || [];

    // Preço médio segunda metade
    const secondHalf = await queryDatabase(
      `SELECT AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price
       FROM bookings
       WHERE property_id = $1
       AND check_in >= $2
       AND check_in <= $3
       AND status IN ('confirmed', 'completed')`,
      [propertyId, midDate.toISOString(), endDate.toISOString()]
    ) || [];

    const firstPrice = parseFloat(firstHalf[0]?.avg_price || '0');
    const secondPrice = parseFloat(secondHalf[0]?.avg_price || '0');

    if (firstPrice === 0 || secondPrice === 0) {
      return 'stable';
    }

    const change = ((secondPrice - firstPrice) / firstPrice) * 100;

    if (change > 5) {
      return 'increasing';
    } else if (change < -5) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  } catch (error: any) {
    console.error('Erro ao determinar tendência:', error);
    return 'stable';
  }
}

/**
 * Obter recomendações de pricing
 */
export async function getPriceRecommendations(
  propertyId: number
): Promise<PriceRecommendation> {
  try {
    // Buscar métricas atuais
    const metrics = await analyzePricePerformance(propertyId, 'month');

    // Buscar preço atual
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [propertyId]
    ) || [];

    const currentPrice = parseFloat(property[0]?.base_price || '0');

    // Calcular recomendação
    const recommendedPrice = metrics.recommendedPrice;
    const priceDiff = recommendedPrice - currentPrice;
    const priceDiffPercent = (priceDiff / currentPrice) * 100;

    // Determinar razão
    let reason = '';
    if (metrics.occupancyRate < 50) {
      reason = `Ocupação baixa (${metrics.occupancyRate.toFixed(1)}%). Redução de preço pode aumentar demanda.`;
    } else if (metrics.occupancyRate > 90) {
      reason = `Ocupação alta (${metrics.occupancyRate.toFixed(1)}%). Aumento de preço pode maximizar receita.`;
    } else {
      reason = `Ocupação equilibrada. Preço atual está adequado.`;
    }

    // Calcular confiança baseada em quantidade de dados
    const confidence = Math.min(0.95, Math.max(0.5, metrics.bookingsCount / 100));

    // Estimar impacto
    const occupancyChange = priceDiffPercent < 0 ? 10 : -5; // Redução aumenta, aumento diminui
    const revenueChange = (metrics.occupancyRate + occupancyChange) * recommendedPrice - metrics.revenue;

    return {
      propertyId,
      currentPrice,
      recommendedPrice,
      reason,
      confidence,
      expectedImpact: {
        occupancyChange,
        revenueChange,
      },
    };
  } catch (error: any) {
    console.error('Erro ao obter recomendações:', error);
    throw error;
  }
}

/**
 * Obter histórico de preços
 */
export async function getPriceHistory(
  propertyId: number,
  days: number = 30
): Promise<Array<{
  date: Date;
  price: number;
  bookings: number;
  revenue: number;
}>> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await queryDatabase(
      `SELECT 
        DATE(check_in) as date,
        AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM bookings
      WHERE property_id = $1
      AND check_in >= $2
      AND check_in <= $3
      AND status IN ('confirmed', 'completed')
      GROUP BY DATE(check_in)
      ORDER BY date ASC`,
      [propertyId, startDate.toISOString(), endDate.toISOString()]
    ) || [];

    return history.map((row: any) => ({
      date: new Date(row.date),
      price: parseFloat(row.avg_price || '0'),
      bookings: parseInt(row.bookings || '0'),
      revenue: parseFloat(row.revenue || '0'),
    }));
  } catch (error: any) {
    console.error('Erro ao obter histórico de preços:', error);
    throw error;
  }
}

