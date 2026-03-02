/**
 * ✅ DIA 2 - ARQUIVO 4: Demand Forecasting Service
 * 
 * @description Previsão de demanda usando ML e análise histórica:
 * - Previsão de ocupação futura
 * - Previsão de demanda por período
 * - Análise sazonal
 * - Recomendações de pricing baseadas em demanda
 * 
 * @module pricing
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { demandPredictor } from '../ml/demand-predictor';
import { z } from 'zod';

// ================================
// TYPES & SCHEMAS
// ================================

const ForecastRequestSchema = z.object({
  propertyId: z.number().int().positive(),
  startDate: z.date(),
  endDate: z.date(),
  includeSeasonality: z.boolean().default(true),
  includeEvents: z.boolean().default(true),
  includeWeather: z.boolean().default(false),
});

const DemandForecastSchema = z.object({
  propertyId: z.number(),
  date: z.date(),
  predictedDemand: z.number().min(0).max(100), // 0-100%
  predictedOccupancy: z.number().min(0).max(100), // 0-100%
  confidence: z.number().min(0).max(1),
  factors: z.object({
    seasonality: z.number(),
    historical: z.number(),
    events: z.number().optional(),
    weather: z.number().optional(),
  }),
  recommendedPrice: z.number().optional(),
});

const SeasonalPatternSchema = z.object({
  propertyId: z.number(),
  month: z.number().min(1).max(12),
  avgOccupancy: z.number(),
  avgPrice: z.number(),
  demandLevel: z.enum(['low', 'medium', 'high', 'peak']),
});

type ForecastRequest = z.infer<typeof ForecastRequestSchema>;
type DemandForecast = z.infer<typeof DemandForecastSchema>;
type SeasonalPattern = z.infer<typeof SeasonalPatternSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 7200; // 2 hours
const CACHE_PREFIX = 'demand-forecast:';

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Prever demanda para um período futuro
 */
export async function forecastDemand(
  propertyId: number,
  startDate: Date,
  endDate: Date,
  options?: {
    includeSeasonality?: boolean;
    includeEvents?: boolean;
    includeWeather?: boolean;
  }
): Promise<DemandForecast[]> {
  try {
    const request: ForecastRequest = {
      propertyId,
      startDate,
      endDate,
      includeSeasonality: options?.includeSeasonality ?? true,
      includeEvents: options?.includeEvents ?? true,
      includeWeather: options?.includeWeather ?? false,
    };

    const validated = ForecastRequestSchema.parse(request);

    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${propertyId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Gerar previsões para cada dia do período
    const forecasts: DemandForecast[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const forecast = await forecastSingleDay(
        propertyId,
        new Date(currentDate),
        validated
      );
      forecasts.push(forecast);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Cache results
    await redisCache.set(cacheKey, JSON.stringify(forecasts), CACHE_TTL);

    return forecasts;
  } catch (error: any) {
    console.error('Erro ao prever demanda:', error);
    throw error;
  }
}

/**
 * Prever demanda para um único dia
 */
async function forecastSingleDay(
  propertyId: number,
  date: Date,
  options: ForecastRequest
): Promise<DemandForecast> {
  try {
    // 1. Buscar dados históricos
    const historicalData = await getHistoricalDemand(propertyId, date);

    // 2. Calcular fator sazonal
    const seasonalityFactor = options.includeSeasonality
      ? await calculateSeasonalityFactor(propertyId, date)
      : 1.0;

    // 3. Buscar eventos locais (se habilitado)
    let eventsFactor = 1.0;
    if (options.includeEvents) {
      const events = await getLocalEvents(propertyId, date);
      eventsFactor = calculateEventsImpact(events);
    }

    // 4. Buscar dados de clima (se habilitado)
    let weatherFactor = 1.0;
    if (options.includeWeather) {
      const weather = await getWeatherData(propertyId, date);
      weatherFactor = calculateWeatherImpact(weather);
    }

    // 5. Usar ML predictor
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    const daysUntilDate = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const mlPrediction = await demandPredictor.predict({
      month,
      dayOfWeek,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
      isHoliday: false, // TODO: Verificar feriados
      daysUntilCheckIn: daysUntilDate,
      historicalBookings: historicalData.avgBookings,
      currentOccupancy: historicalData.currentOccupancy,
      avgNights: historicalData.avgNights,
      season: historicalData.season,
    });

    // 6. Combinar fatores
    const predictedDemand = Math.min(100, Math.max(0,
      mlPrediction.recommendedMultiplier * 50 * seasonalityFactor * eventsFactor * weatherFactor
    ));

    const predictedOccupancy = Math.min(100, Math.max(0,
      historicalData.avgOccupancy * (predictedDemand / 50)
    ));

    // 7. Calcular confiança baseada em quantidade de dados históricos
    const confidence = Math.min(0.95, Math.max(0.5,
      historicalData.dataPoints / 100
    ));

    // 8. Recomendar preço baseado em demanda
    const recommendedPrice = await recommendPriceByDemand(
      propertyId,
      predictedDemand,
      historicalData.avgPrice
    );

    return {
      propertyId,
      date,
      predictedDemand,
      predictedOccupancy,
      confidence,
      factors: {
        seasonality: seasonalityFactor,
        historical: historicalData.avgOccupancy / 100,
        events: options.includeEvents ? eventsFactor : undefined,
        weather: options.includeWeather ? weatherFactor : undefined,
      },
      recommendedPrice,
    };
  } catch (error: any) {
    console.error('Erro ao prever demanda para dia:', error);
    // Retornar previsão neutra em caso de erro
    return {
      propertyId,
      date,
      predictedDemand: 50,
      predictedOccupancy: 50,
      confidence: 0.5,
      factors: {
        seasonality: 1.0,
        historical: 0.5,
      },
    };
  }
}

/**
 * Obter dados históricos de demanda
 */
async function getHistoricalDemand(
  propertyId: number,
  date: Date
): Promise<{
  avgBookings: number;
  avgOccupancy: number;
  avgNights: number;
  avgPrice: number;
  currentOccupancy: number;
  season: 'high' | 'medium' | 'low';
  dataPoints: number;
}> {
  try {
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    // Buscar dados históricos do mesmo período (últimos 2 anos)
    const historical = await queryDatabase(
      `SELECT 
        COUNT(*) as bookings_count,
        AVG(EXTRACT(EPOCH FROM (check_out - check_in))/86400) as avg_nights,
        AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price,
        COUNT(DISTINCT DATE(check_in)) as occupied_days
      FROM bookings
      WHERE property_id = $1
      AND EXTRACT(MONTH FROM check_in) = $2
      AND EXTRACT(DOW FROM check_in) = $3
      AND check_in >= CURRENT_DATE - INTERVAL '2 years'
      AND status IN ('confirmed', 'completed')`,
      [propertyId, month, dayOfWeek]
    ) || [];

    const data = historical[0] || {};
    const bookingsCount = parseInt(data.bookings_count || '0');
    const avgNights = parseFloat(data.avg_nights || '2');
    const avgPrice = parseFloat(data.avg_price || '0');
    const occupiedDays = parseInt(data.occupied_days || '0');

    // Calcular ocupação média (simplificado)
    const daysInMonth = new Date(date.getFullYear(), month, 0).getDate();
    const avgOccupancy = (occupiedDays / daysInMonth) * 100;

    // Buscar ocupação atual
    const currentOccupancy = await queryDatabase(
      `SELECT COUNT(*) as occupied_count
       FROM bookings
       WHERE property_id = $1
       AND check_in <= $2
       AND check_out > $2
       AND status IN ('confirmed', 'completed', 'pending')`,
      [propertyId, date.toISOString().split('T')[0]]
    ) || [];

    const occupiedCount = parseInt(currentOccupancy[0]?.occupied_count || '0');

    // Determinar temporada
    let season: 'high' | 'medium' | 'low' = 'medium';
    if (month >= 12 || month <= 2) {
      season = 'high'; // Verão
    } else if (month >= 6 && month <= 8) {
      season = 'high'; // Inverno
    } else {
      season = 'low';
    }

    return {
      avgBookings: bookingsCount,
      avgOccupancy,
      avgNights,
      avgPrice,
      currentOccupancy: occupiedCount,
      season,
      dataPoints: bookingsCount,
    };
  } catch (error: any) {
    console.error('Erro ao buscar dados históricos:', error);
    return {
      avgBookings: 0,
      avgOccupancy: 50,
      avgNights: 2,
      avgPrice: 0,
      currentOccupancy: 0,
      season: 'medium',
      dataPoints: 0,
    };
  }
}

/**
 * Calcular fator sazonal
 */
async function calculateSeasonalityFactor(
  propertyId: number,
  date: Date
): Promise<number> {
  try {
    const month = date.getMonth() + 1;

    // Buscar padrão sazonal do banco (se tabela existir)
    // Por enquanto, usar padrão genérico
    const seasonalPatterns: Record<number, number> = {
      1: 1.2, // Janeiro (verão)
      2: 1.1, // Fevereiro
      3: 0.9, // Março
      4: 0.8, // Abril
      5: 0.8, // Maio
      6: 0.9, // Junho
      7: 1.1, // Julho (férias)
      8: 1.0, // Agosto
      9: 0.9, // Setembro
      10: 0.9, // Outubro
      11: 1.0, // Novembro
      12: 1.3, // Dezembro (Natal/Ano Novo)
    };

    return seasonalPatterns[month] || 1.0;
  } catch (error: any) {
    console.error('Erro ao calcular fator sazonal:', error);
    return 1.0;
  }
}

/**
 * Obter eventos locais
 */
async function getLocalEvents(
  propertyId: number,
  date: Date
): Promise<Array<{ name: string; impact: number }>> {
  try {
    // Buscar eventos do banco (se tabela existir)
    // Por enquanto, retornar vazio
    return [];
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
}

/**
 * Calcular impacto de eventos
 */
function calculateEventsImpact(events: Array<{ name: string; impact: number }>): number {
  if (events.length === 0) return 1.0;

  // Soma dos impactos (máximo 2.0x)
  const totalImpact = events.reduce((sum, event) => sum + event.impact, 0);
  return Math.min(2.0, 1.0 + totalImpact);
}

/**
 * Obter dados de clima
 */
async function getWeatherData(
  propertyId: number,
  date: Date
): Promise<{ temperature: number; condition: string } | null> {
  try {
    // Buscar dados de clima (se integração existir)
    // Por enquanto, retornar null
    return null;
  } catch (error: any) {
    console.error('Erro ao buscar dados de clima:', error);
    return null;
  }
}

/**
 * Calcular impacto do clima
 */
function calculateWeatherImpact(weather: { temperature: number; condition: string } | null): number {
  if (!weather) return 1.0;

  // Clima bom aumenta demanda
  if (weather.condition === 'sunny' && weather.temperature > 20) {
    return 1.1;
  }

  // Clima ruim diminui demanda
  if (weather.condition === 'rainy' || weather.temperature < 10) {
    return 0.9;
  }

  return 1.0;
}

/**
 * Recomendar preço baseado em demanda prevista
 */
async function recommendPriceByDemand(
  propertyId: number,
  predictedDemand: number,
  basePrice: number
): Promise<number> {
  try {
    // Se demanda alta (> 70%), aumentar preço
    if (predictedDemand > 70) {
      return basePrice * 1.15; // +15%
    }

    // Se demanda baixa (< 30%), reduzir preço
    if (predictedDemand < 30) {
      return basePrice * 0.85; // -15%
    }

    // Demanda média, manter preço
    return basePrice;
  } catch (error: any) {
    console.error('Erro ao recomendar preço:', error);
    return basePrice;
  }
}

/**
 * Obter padrões sazonais de uma propriedade
 */
export async function getSeasonalPatterns(
  propertyId: number
): Promise<SeasonalPattern[]> {
  try {
    // Buscar dados históricos por mês
    const patterns = await queryDatabase(
      `SELECT 
        EXTRACT(MONTH FROM check_in)::INTEGER as month,
        AVG(EXTRACT(EPOCH FROM (check_out - check_in))/86400) as avg_nights,
        AVG(total_amount / NULLIF(EXTRACT(EPOCH FROM (check_out - check_in))/86400, 0)) as avg_price,
        COUNT(DISTINCT DATE(check_in))::FLOAT / NULLIF(
          COUNT(DISTINCT DATE_TRUNC('month', check_in))::FLOAT, 0
        ) * 100 as avg_occupancy
      FROM bookings
      WHERE property_id = $1
      AND check_in >= CURRENT_DATE - INTERVAL '2 years'
      AND status IN ('confirmed', 'completed')
      GROUP BY EXTRACT(MONTH FROM check_in)
      ORDER BY month`,
      [propertyId]
    ) || [];

    return patterns.map((row: any) => {
      const occupancy = parseFloat(row.avg_occupancy || '0');
      let demandLevel: 'low' | 'medium' | 'high' | 'peak';
      if (occupancy >= 80) {
        demandLevel = 'peak';
      } else if (occupancy >= 60) {
        demandLevel = 'high';
      } else if (occupancy >= 40) {
        demandLevel = 'medium';
      } else {
        demandLevel = 'low';
      }

      return {
        propertyId,
        month: parseInt(row.month),
        avgOccupancy: occupancy,
        avgPrice: parseFloat(row.avg_price || '0'),
        demandLevel,
      };
    });
  } catch (error: any) {
    console.error('Erro ao obter padrões sazonais:', error);
    throw error;
  }
}

/**
 * Prever receita futura baseada em demanda
 */
export async function forecastRevenue(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<{
  totalRevenue: number;
  avgDailyRevenue: number;
  occupancyRate: number;
  forecast: Array<{
    date: Date;
    revenue: number;
    occupancy: number;
  }>;
}> {
  try {
    const forecasts = await forecastDemand(propertyId, startDate, endDate);

    // Buscar preço base da propriedade
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [propertyId]
    ) || [];

    const basePrice = parseFloat(property[0]?.base_price || '0');

    // Calcular receita para cada dia
    let totalRevenue = 0;
    const dailyForecasts = forecasts.map(f => {
      const dailyRevenue = (f.predictedOccupancy / 100) * basePrice;
      totalRevenue += dailyRevenue;

      return {
        date: f.date,
        revenue: dailyRevenue,
        occupancy: f.predictedOccupancy,
      };
    });

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgDailyRevenue = totalRevenue / (days || 1);
    const avgOccupancy = forecasts.reduce((sum, f) => sum + f.predictedOccupancy, 0) / forecasts.length;

    return {
      totalRevenue,
      avgDailyRevenue,
      occupancyRate: avgOccupancy,
      forecast: dailyForecasts,
    };
  } catch (error: any) {
    console.error('Erro ao prever receita:', error);
    throw error;
  }
}

