/**
 * ✅ API: PRICING FORECAST
 * GET /api/pricing/forecast - Previsão de preços futuros
 * Com cache e agregações otimizadas
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cacheService } from '@/lib/cache-service';
import { queryDatabase } from '@/lib/db';

// Schema de validação
const forecastQuerySchema = z.object({
  property_id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
    message: 'property_id deve ser um número positivo',
  }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  days_ahead: z.string().transform((val) => parseInt(val, 10)).optional().default('30'),
}).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end > start;
  },
  { message: 'end_date deve ser posterior a start_date', path: ['end_date'] }
);

interface ForecastDataPoint {
  date: string;
  predicted_price: number;
  confidence: number;
  factors: {
    demand: number;
    seasonality: number;
    events: number;
    competitor_price?: number;
  };
  recommendation: 'increase' | 'decrease' | 'maintain';
}

interface ForecastResponse {
  property_id: number;
  start_date: string;
  end_date: string;
  current_price: number;
  forecast: ForecastDataPoint[];
  summary: {
    avg_predicted_price: number;
    min_predicted_price: number;
    max_predicted_price: number;
    recommended_action: 'increase' | 'decrease' | 'maintain';
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validar query params
    const validationResult = forecastQuerySchema.safeParse({
      property_id: searchParams.get('property_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      days_ahead: searchParams.get('days_ahead'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { property_id, start_date, end_date, days_ahead } = validationResult.data;

    // Verificar cache
    const cacheKey = cacheService.generateKey('pricing:forecast', {
      property_id,
      start_date,
      end_date,
      days_ahead,
    });

    const cached = cacheService.get<ForecastResponse>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Buscar preço atual da propriedade
    const propertyResult = await queryDatabase(
      `SELECT base_price_per_night, id FROM properties WHERE id = $1`,
      [property_id]
    );

    if (propertyResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    const currentPrice = propertyResult[0].base_price_per_night || 0;

    // Buscar histórico de preços e ocupação
    const historyResult = await queryDatabase(
      `SELECT 
        date,
        final_price,
        occupancy_rate,
        booking_count
      FROM pricing_history
      WHERE item_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '90 days'
        AND date < $2
      ORDER BY date DESC
      LIMIT 90`,
      [property_id, start_date]
    );

    // Buscar eventos futuros
    const eventsResult = await queryDatabase(
      `SELECT 
        date,
        event_name,
        impact_multiplier
      FROM pricing_factors
      WHERE item_id = $1
        AND factor_type = 'event'
        AND date >= $2
        AND date <= $3
      ORDER BY date`,
      [property_id, start_date, end_date]
    );

    // Buscar preços de concorrentes
    const competitorsResult = await queryDatabase(
      `SELECT 
        competitor_name,
        price,
        scraped_at
      FROM competitor_prices
      WHERE item_id = $1
        AND scraped_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY scraped_at DESC
      LIMIT 10`,
      [property_id]
    );

    // Calcular previsão (algoritmo simplificado - pode ser melhorado com ML)
    const forecast: ForecastDataPoint[] = [];
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calcular média de ocupação histórica
    const avgOccupancy = historyResult.length > 0
      ? historyResult.reduce((sum, h) => sum + (h.occupancy_rate || 0), 0) / historyResult.length
      : 0.7;

    // Calcular média de preços de concorrentes
    const avgCompetitorPrice = competitorsResult.length > 0
      ? competitorsResult.reduce((sum, c) => sum + (c.price || 0), 0) / competitorsResult.length
      : currentPrice;

    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Fator de sazonalidade (simulado - baseado no mês)
      const month = date.getMonth();
      const seasonalityFactor = month >= 11 || month <= 2 ? 1.2 : month >= 6 && month <= 8 ? 1.1 : 0.9;

      // Fator de eventos
      const event = eventsResult.find(e => e.date === dateStr);
      const eventFactor = event ? (event.impact_multiplier || 1.0) : 1.0;

      // Fator de demanda (simulado - baseado em dia da semana)
      const dayOfWeek = date.getDay();
      const demandFactor = dayOfWeek === 5 || dayOfWeek === 6 ? 1.15 : 1.0; // Finais de semana

      // Calcular preço previsto
      const basePrice = currentPrice;
      const predictedPrice = basePrice * seasonalityFactor * eventFactor * demandFactor;

      // Ajustar baseado em concorrentes
      const competitorAdjustment = avgCompetitorPrice > predictedPrice ? 1.05 : 0.95;
      const finalPredictedPrice = predictedPrice * competitorAdjustment;

      // Calcular confiança (baseado em quantidade de dados históricos)
      const confidence = Math.min(0.95, 0.5 + (historyResult.length / 90) * 0.45);

      // Recomendação
      let recommendation: 'increase' | 'decrease' | 'maintain' = 'maintain';
      if (finalPredictedPrice > currentPrice * 1.1) {
        recommendation = 'increase';
      } else if (finalPredictedPrice < currentPrice * 0.9) {
        recommendation = 'decrease';
      }

      forecast.push({
        date: dateStr,
        predicted_price: Math.round(finalPredictedPrice * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        factors: {
          demand: Math.round(demandFactor * 100) / 100,
          seasonality: Math.round(seasonalityFactor * 100) / 100,
          events: Math.round(eventFactor * 100) / 100,
          competitor_price: competitorsResult.length > 0 ? avgCompetitorPrice : undefined,
        },
        recommendation,
      });
    }

    // Calcular resumo
    const prices = forecast.map(f => f.predicted_price);
    const avgPredictedPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPredictedPrice = Math.min(...prices);
    const maxPredictedPrice = Math.max(...prices);

    // Recomendação geral
    const overallRecommendation = avgPredictedPrice > currentPrice * 1.05
      ? 'increase'
      : avgPredictedPrice < currentPrice * 0.95
      ? 'decrease'
      : 'maintain';

    const response: ForecastResponse = {
      property_id,
      start_date,
      end_date,
      current_price: currentPrice,
      forecast,
      summary: {
        avg_predicted_price: Math.round(avgPredictedPrice * 100) / 100,
        min_predicted_price: Math.round(minPredictedPrice * 100) / 100,
        max_predicted_price: Math.round(maxPredictedPrice * 100) / 100,
        recommended_action: overallRecommendation,
      },
    };

    // Cachear resultado (15 minutos - previsões mudam com frequência)
    cacheService.set(cacheKey, response, 15 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Erro ao gerar previsão:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar previsão de preços' },
      { status: 500 }
    );
  }
}
