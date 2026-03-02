/**
 * ✅ DIA 2 - ARQUIVO 3: Competitor Monitoring Service
 * 
 * @description Monitoramento contínuo de preços de concorrentes:
 * - Scraping de preços de OTAs (Airbnb, Booking.com, etc)
 * - Análise de posicionamento competitivo
 * - Alertas de mudanças de preço
 * - Comparação de features e amenities
 * 
 * @module pricing
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { competitorScraperService } from '../competitor-scraper';
import { z } from 'zod';

// ================================
// TYPES & SCHEMAS
// ================================

const CompetitorPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.enum(['airbnb', 'booking', 'expedia', 'vrbo', 'decolar', 'other']),
  location: z.string(),
  price: z.number().positive(),
  currency: z.string().default('BRL'),
  availability: z.enum(['available', 'limited', 'unavailable']),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  scrapedAt: z.date(),
});

const PriceAlertSchema = z.object({
  propertyId: z.number(),
  competitorId: z.string(),
  previousPrice: z.number(),
  currentPrice: z.number(),
  changePercent: z.number(),
  alertType: z.enum(['price_drop', 'price_increase', 'new_competitor', 'availability_change']),
  notified: z.boolean().default(false),
  createdAt: z.date(),
});

type CompetitorProperty = z.infer<typeof CompetitorPropertySchema>;
type PriceAlert = z.infer<typeof PriceAlertSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'competitor-monitoring:';
const SCRAPING_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Monitorar preços de concorrentes para uma propriedade
 */
export async function monitorCompetitorPrices(
  propertyId: number,
  location: string,
  checkIn?: Date,
  checkOut?: Date
): Promise<CompetitorProperty[]> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}prices:${propertyId}:${location}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      const cachedTime = new Date(cachedData.scrapedAt);
      const now = new Date();
      
      // Se cache é recente (< 6 horas), retornar
      if (now.getTime() - cachedTime.getTime() < SCRAPING_INTERVAL) {
        return cachedData.competitors;
      }
    }

    // Buscar preços usando competitor scraper
    const competitors = await competitorScraperService.getCompetitorPrices(
      propertyId,
      location,
      checkIn,
      checkOut
    ) || [];

    // Transformar para formato padronizado
    const competitorProperties: CompetitorProperty[] = competitors.map((comp: any) => ({
      id: comp.id || `comp-${Date.now()}-${Math.random()}`,
      name: comp.name || comp.competitor_name || 'Propriedade Concorrente',
      platform: mapPlatform(comp.source || comp.platform || 'other'),
      location: comp.location || location,
      price: comp.price || 0,
      currency: comp.currency || 'BRL',
      availability: mapAvailability(comp.availability_status || 'available'),
      rating: comp.rating || undefined,
      reviewsCount: comp.reviews_count || undefined,
      amenities: comp.amenities || [],
      scrapedAt: new Date(),
    }));

    // Salvar no banco (se tabela existir)
    await saveCompetitorPrices(propertyId, competitorProperties);

    // Cache results
    await redisCache.set(cacheKey, JSON.stringify({
      competitors: competitorProperties,
      scrapedAt: new Date().toISOString(),
    }), CACHE_TTL);

    return competitorProperties;
  } catch (error: any) {
    console.error('Erro ao monitorar preços de concorrentes:', error);
    throw error;
  }
}

/**
 * Comparar preço da propriedade com concorrentes
 */
export async function compareWithCompetitors(
  propertyId: number,
  propertyPrice: number,
  location: string
): Promise<{
  position: 'cheapest' | 'average' | 'expensive';
  avgCompetitorPrice: number;
  priceDifference: number;
  priceDifferencePercent: number;
  recommendations: string[];
}> {
  try {
    const competitors = await monitorCompetitorPrices(propertyId, location);

    if (competitors.length === 0) {
      return {
        position: 'average',
        avgCompetitorPrice: propertyPrice,
        priceDifference: 0,
        priceDifferencePercent: 0,
        recommendations: ['Nenhum concorrente encontrado para comparação'],
      };
    }

    // Calcular preço médio dos concorrentes
    const validPrices = competitors
      .filter(c => c.price > 0)
      .map(c => c.price);

    if (validPrices.length === 0) {
      return {
        position: 'average',
        avgCompetitorPrice: propertyPrice,
        priceDifference: 0,
        priceDifferencePercent: 0,
        recommendations: ['Preços de concorrentes não disponíveis'],
      };
    }

    const avgCompetitorPrice = validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length;
    const priceDifference = propertyPrice - avgCompetitorPrice;
    const priceDifferencePercent = (priceDifference / avgCompetitorPrice) * 100;

    // Determinar posição
    let position: 'cheapest' | 'average' | 'expensive';
    if (priceDifferencePercent < -10) {
      position = 'cheapest';
    } else if (priceDifferencePercent > 10) {
      position = 'expensive';
    } else {
      position = 'average';
    }

    // Gerar recomendações
    const recommendations: string[] = [];
    if (position === 'expensive') {
      recommendations.push(`Seu preço está ${priceDifferencePercent.toFixed(1)}% acima da média dos concorrentes`);
      recommendations.push('Considere reduzir o preço para aumentar competitividade');
    } else if (position === 'cheapest') {
      recommendations.push(`Seu preço está ${Math.abs(priceDifferencePercent).toFixed(1)}% abaixo da média`);
      recommendations.push('Você pode considerar aumentar o preço para maximizar receita');
    } else {
      recommendations.push('Seu preço está alinhado com a concorrência');
    }

    return {
      position,
      avgCompetitorPrice,
      priceDifference,
      priceDifferencePercent,
      recommendations,
    };
  } catch (error: any) {
    console.error('Erro ao comparar com concorrentes:', error);
    throw error;
  }
}

/**
 * Detectar mudanças de preço em concorrentes
 */
export async function detectPriceChanges(
  propertyId: number,
  location: string
): Promise<PriceAlert[]> {
  try {
    // Buscar preços anteriores do cache/banco
    const previousKey = `${CACHE_PREFIX}previous:${propertyId}`;
    const previousData = await redisCache.get(previousKey);
    const previousCompetitors = previousData ? JSON.parse(previousData) : [];

    // Buscar preços atuais
    const currentCompetitors = await monitorCompetitorPrices(propertyId, location);

    // Comparar e detectar mudanças
    const alerts: PriceAlert[] = [];

    for (const current of currentCompetitors) {
      const previous = previousCompetitors.find((p: any) => p.id === current.id);

      if (previous) {
        const priceChange = current.price - previous.price;
        const changePercent = (priceChange / previous.price) * 100;

        // Se mudança > 5%, criar alerta
        if (Math.abs(changePercent) > 5) {
          alerts.push({
            propertyId,
            competitorId: current.id,
            previousPrice: previous.price,
            currentPrice: current.price,
            changePercent,
            alertType: priceChange < 0 ? 'price_drop' : 'price_increase',
            notified: false,
            createdAt: new Date(),
          });
        }
      } else {
        // Novo concorrente detectado
        alerts.push({
          propertyId,
          competitorId: current.id,
          previousPrice: 0,
          currentPrice: current.price,
          changePercent: 0,
          alertType: 'new_competitor',
          notified: false,
          createdAt: new Date(),
        });
      }
    }

    // Salvar preços atuais como anteriores
    await redisCache.set(previousKey, JSON.stringify(currentCompetitors), CACHE_TTL * 24); // 24 horas

    // Salvar alertas no banco (se tabela existir)
    if (alerts.length > 0) {
      await savePriceAlerts(alerts);
    }

    return alerts;
  } catch (error: any) {
    console.error('Erro ao detectar mudanças de preço:', error);
    throw error;
  }
}

/**
 * Obter análise competitiva completa
 */
export async function getCompetitiveAnalysis(
  propertyId: number,
  location: string
): Promise<{
  competitors: CompetitorProperty[];
  comparison: Awaited<ReturnType<typeof compareWithCompetitors>>;
  priceAlerts: PriceAlert[];
  marketPosition: {
    rank: number;
    totalCompetitors: number;
    percentile: number;
  };
}> {
  try {
    const competitors = await monitorCompetitorPrices(propertyId, location);
    
    // Buscar preço da propriedade
    const property = await queryDatabase(
      `SELECT base_price FROM properties WHERE id = $1`,
      [propertyId]
    ) || [];

    const propertyPrice = parseFloat(property[0]?.base_price || '0');

    const comparison = await compareWithCompetitors(propertyId, propertyPrice, location);
    const priceAlerts = await detectPriceChanges(propertyId, location);

    // Calcular posição no mercado
    const sortedPrices = competitors
      .filter(c => c.price > 0)
      .map(c => c.price)
      .sort((a, b) => a - b);

    const propertyRank = sortedPrices.findIndex(p => p >= propertyPrice) + 1;
    const totalCompetitors = sortedPrices.length;
    const percentile = totalCompetitors > 0 
      ? ((totalCompetitors - propertyRank) / totalCompetitors) * 100 
      : 50;

    return {
      competitors,
      comparison,
      priceAlerts,
      marketPosition: {
        rank: propertyRank || Math.ceil(totalCompetitors / 2),
        totalCompetitors,
        percentile,
      },
    };
  } catch (error: any) {
    console.error('Erro ao obter análise competitiva:', error);
    throw error;
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function mapPlatform(source: string): CompetitorProperty['platform'] {
  const normalized = source.toLowerCase();
  if (normalized.includes('airbnb')) return 'airbnb';
  if (normalized.includes('booking')) return 'booking';
  if (normalized.includes('expedia')) return 'expedia';
  if (normalized.includes('vrbo')) return 'vrbo';
  if (normalized.includes('decolar')) return 'decolar';
  return 'other';
}

function mapAvailability(status: string): CompetitorProperty['availability'] {
  const normalized = status.toLowerCase();
  if (normalized.includes('unavailable') || normalized.includes('sold out')) {
    return 'unavailable';
  }
  if (normalized.includes('limited') || normalized.includes('few')) {
    return 'limited';
  }
  return 'available';
}

async function saveCompetitorPrices(
  propertyId: number,
  competitors: CompetitorProperty[]
): Promise<void> {
  try {
    // TODO: Implementar quando tabela competitor_prices for criada
    // Por enquanto, apenas log
    console.log(`Salvando ${competitors.length} preços de concorrentes para propriedade ${propertyId}`);
  } catch (error: any) {
    console.error('Erro ao salvar preços de concorrentes:', error);
  }
}

async function savePriceAlerts(alerts: PriceAlert[]): Promise<void> {
  try {
    // TODO: Implementar quando tabela price_alerts for criada
    // Por enquanto, apenas log
    console.log(`Salvando ${alerts.length} alertas de mudança de preço`);
  } catch (error: any) {
    console.error('Erro ao salvar alertas:', error);
  }
}

