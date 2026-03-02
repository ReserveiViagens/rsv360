/**
 * API de Recomendações de Precificação
 * Retorna recomendações inteligentes de preços e alertas
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { calculateSmartPriceAdvanced } from '@/lib/smart-pricing-service';
import { getProcessedCompetitorData, scrapeAndProcessCompetitors } from '@/lib/competitor-data-service';
import { analyzePropertySentiment, getSentimentBasedPricingAdjustment } from '@/lib/sentiment-analysis-service';
import { competitorScraperService } from '@/lib/competitor-scraper';
import { queryDatabase } from '@/lib/db';

export interface PricingRecommendation {
  propertyId: number;
  date: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number; // Percentual
  confidence: number;
  reasons: string[];
  factors: {
    demand: number;
    competition: number;
    sentiment: number;
    seasonality: number;
    events: number;
  };
  alerts: PricingAlert[];
}

export interface PricingAlert {
  type: 'opportunity' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

/**
 * GET /api/pricing/recommendations
 * Obter recomendações de precificação para uma propriedade
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = parseInt(searchParams.get('property_id') || '0');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const includeAlerts = searchParams.get('include_alerts') === 'true';

    if (!propertyId) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    // Buscar propriedade
    const property = await queryDatabase(
      `SELECT * FROM properties WHERE id = $1`,
      [propertyId]
    );

    if (property.length === 0) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const basePrice = parseFloat(property[0].base_price || '0');
    const checkIn = new Date(date);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);

    // Calcular preço inteligente
    const pricingFactors = await calculateSmartPriceAdvanced(
      propertyId,
      basePrice,
      checkIn,
      checkOut,
      property[0].location,
      property[0].latitude,
      property[0].longitude
    );

    const recommendedPrice = pricingFactors.finalPrice;
    const priceChange = ((recommendedPrice - basePrice) / basePrice) * 100;

    // Buscar análise de competidores
    const competitorData = await getProcessedCompetitorData(propertyId, checkIn);

    // Buscar análise de sentimento
    const sentimentAdjustment = await getSentimentBasedPricingAdjustment(propertyId);

    // Calcular fatores
    const factors = {
      demand: pricingFactors.mlPrediction?.predictedDemand || 0.5,
      competition: competitorData ? (1 - competitorData.priceGap / 100) : 0.5,
      sentiment: sentimentAdjustment,
      seasonality: pricingFactors.multipliers.season || 1.0,
      events: pricingFactors.multipliers.events || 1.0,
    };

    // Gerar razões
    const reasons: string[] = [];
    
    if (pricingFactors.mlPrediction?.recommendations) {
      reasons.push(pricingFactors.mlPrediction.recommendations.reason);
    }
    
    if (competitorData?.recommendations) {
      reasons.push(competitorData.recommendations.reason);
    }
    
    if (Math.abs(sentimentAdjustment) > 0.05) {
      const sentiment = await analyzePropertySentiment(propertyId);
      reasons.push(sentiment.recommendations.reason);
    }

    // Gerar alertas
    const alerts: PricingAlert[] = includeAlerts
      ? await generatePricingAlerts(propertyId, pricingFactors, competitorData, sentimentAdjustment)
      : [];

    const recommendation: PricingRecommendation = {
      propertyId,
      date,
      currentPrice: basePrice,
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      priceChange: Math.round(priceChange * 100) / 100,
      confidence: pricingFactors.mlPrediction?.confidence || 0.5,
      reasons,
      factors,
      alerts,
    };

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error: any) {
    console.error('Erro ao obter recomendações:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter recomendações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pricing/recommendations/refresh
 * Atualizar dados de competidores e recalcular recomendações
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { property_id, date } = body;

    if (!property_id) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    // Buscar propriedade
    const property = await queryDatabase(
      `SELECT * FROM properties WHERE id = $1`,
      [property_id]
    );

    if (property.length === 0) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const checkIn = date ? new Date(date) : new Date();
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);

    // Scraping e processamento de competidores
    const processedData = await scrapeAndProcessCompetitors({
      propertyId: property_id,
      location: property[0].location,
      latitude: property[0].latitude,
      longitude: property[0].longitude,
      checkIn,
      checkOut,
      platforms: ['airbnb', 'booking', 'expedia', 'vrbo'],
      enabled: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Dados atualizados com sucesso',
        competitorData: processedData,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar recomendações:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar recomendações' },
      { status: 500 }
    );
  }
}

/**
 * Gerar alertas de precificação
 */
async function generatePricingAlerts(
  propertyId: number,
  pricingFactors: any,
  competitorData: any,
  sentimentAdjustment: number
): Promise<PricingAlert[]> {
  const alerts: PricingAlert[] = [];

  // Alerta: Oportunidade de aumentar preço
  if (pricingFactors.mlPrediction?.predictedDemand > 0.8 && pricingFactors.finalPrice < pricingFactors.basePrice * 1.15) {
    alerts.push({
      type: 'opportunity',
      severity: 'high',
      title: 'Oportunidade de Aumento de Preço',
      message: `Alta demanda prevista (${(pricingFactors.mlPrediction.predictedDemand * 100).toFixed(0)}%). Considere aumentar preço em até 15%.`,
      action: 'Aplicar Aumento',
      actionUrl: `/admin/pricing/${propertyId}?action=increase`,
    });
  }

  // Alerta: Preço muito acima da concorrência
  if (competitorData && competitorData.priceGap > 25) {
    alerts.push({
      type: 'warning',
      severity: 'high',
      title: 'Preço Muito Acima da Concorrência',
      message: `Seu preço está ${competitorData.priceGap.toFixed(1)}% acima da média do mercado. Isso pode reduzir bookings.`,
      action: 'Revisar Preço',
      actionUrl: `/admin/pricing/${propertyId}?action=review`,
    });
  }

  // Alerta: Reviews negativos afetando valor percebido
  if (sentimentAdjustment < -0.1) {
    alerts.push({
      type: 'warning',
      severity: 'medium',
      title: 'Reviews Negativos Afetando Percepção de Valor',
      message: 'Reviews recentes indicam problemas. Considere reduzir preço ou melhorar qualidade.',
      action: 'Ver Reviews',
      actionUrl: `/admin/reviews/${propertyId}`,
    });
  }

  // Alerta: Eventos locais aumentando demanda
  if (pricingFactors.events && Array.isArray(pricingFactors.events) && pricingFactors.events.length > 2) {
    alerts.push({
      type: 'opportunity',
      severity: 'medium',
      title: 'Eventos Locais Detectados',
      message: `${pricingFactors.events.length} eventos locais podem aumentar demanda. Considere ajustar preço.`,
      action: 'Ver Eventos',
      actionUrl: `/admin/pricing/${propertyId}?tab=events`,
    });
  }

  // Alerta: Baixa demanda prevista
  if (pricingFactors.mlPrediction?.predictedDemand < 0.3) {
    alerts.push({
      type: 'warning',
      severity: 'medium',
      title: 'Baixa Demanda Prevista',
      message: `Demanda prevista muito baixa (${(pricingFactors.mlPrediction.predictedDemand * 100).toFixed(0)}%). Considere promoções ou redução de preço.`,
      action: 'Criar Promoção',
      actionUrl: `/admin/pricing/${propertyId}?action=promotion`,
    });
  }

  return alerts;
}

