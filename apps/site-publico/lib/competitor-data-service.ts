/**
 * Serviço de Processamento e Armazenamento de Dados de Competidores
 * Processa, normaliza e armazena dados coletados de competidores
 */

import { queryDatabase } from './db';
import { competitorScraperService, type ScrapingConfig } from './competitor-scraper';
import type { CompetitorPrice } from './smart-pricing-service';

export interface ProcessedCompetitorData {
  propertyId: number;
  date: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  priceDistribution: {
    platform: string;
    price: number;
    availability: string;
  }[];
  marketPosition: 'above' | 'at' | 'below';
  priceGap: number; // Diferença percentual em relação à média
  recommendations: {
    action: 'increase' | 'decrease' | 'maintain';
    reason: string;
    suggestedPrice: number;
  };
}

/**
 * Processar dados de competidores coletados
 */
export async function processCompetitorData(
  propertyId: number,
  date: Date,
  competitors: CompetitorPrice[]
): Promise<ProcessedCompetitorData> {
  if (competitors.length === 0) {
    throw new Error('Nenhum dado de competidor fornecido');
  }

  // Normalizar preços (converter moedas se necessário)
  const normalizedPrices = await normalizePrices(competitors);

  // Calcular estatísticas
  const prices = normalizedPrices.map(p => p.price);
  const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const medianPrice = calculateMedian(prices);

  // Buscar preço base da propriedade
  const property = await queryDatabase(
    `SELECT base_price FROM properties WHERE id = $1`,
    [propertyId]
  );
  const basePrice = parseFloat(property[0]?.base_price || '0');

  // Determinar posição no mercado
  const priceGap = ((basePrice - averagePrice) / averagePrice) * 100;
  let marketPosition: 'above' | 'at' | 'below';
  
  if (priceGap > 10) {
    marketPosition = 'above';
  } else if (priceGap < -10) {
    marketPosition = 'below';
  } else {
    marketPosition = 'at';
  }

  // Gerar recomendações
  const recommendations = generateRecommendations(
    basePrice,
    averagePrice,
    medianPrice,
    marketPosition,
    priceGap
  );

  // Distribuição de preços por plataforma
  const priceDistribution = normalizedPrices.map(p => ({
    platform: p.competitor_name,
    price: p.price,
    availability: p.availability_status,
  }));

  const processedData: ProcessedCompetitorData = {
    propertyId,
    date: date.toISOString().split('T')[0],
    averagePrice: Math.round(averagePrice * 100) / 100,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    medianPrice: Math.round(medianPrice * 100) / 100,
    priceDistribution,
    marketPosition,
    priceGap: Math.round(priceGap * 100) / 100,
    recommendations,
  };

  // Armazenar dados processados
  await storeProcessedData(processedData);

  return processedData;
}

/**
 * Normalizar preços (converter moedas, etc)
 */
async function normalizePrices(
  competitors: CompetitorPrice[]
): Promise<CompetitorPrice[]> {
  // Por enquanto, assumir que todos estão em BRL
  // Em produção, implementar conversão de moedas
  
  return competitors.map(c => ({
    ...c,
    price: c.price, // Já normalizado
  }));
}

/**
 * Calcular mediana
 */
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Gerar recomendações baseadas em análise de mercado
 */
function generateRecommendations(
  basePrice: number,
  averagePrice: number,
  medianPrice: number,
  marketPosition: 'above' | 'at' | 'below',
  priceGap: number
): ProcessedCompetitorData['recommendations'] {
  let action: 'increase' | 'decrease' | 'maintain';
  let reason: string;
  let suggestedPrice: number;

  if (marketPosition === 'above' && priceGap > 20) {
    // Muito acima da média - considerar diminuir
    action = 'decrease';
    reason = `Preço está ${priceGap.toFixed(1)}% acima da média do mercado. Considerar redução para aumentar competitividade.`;
    suggestedPrice = basePrice * 0.9; // Reduzir 10%
  } else if (marketPosition === 'below' && priceGap < -15) {
    // Muito abaixo da média - considerar aumentar
    action = 'increase';
    reason = `Preço está ${Math.abs(priceGap).toFixed(1)}% abaixo da média do mercado. Oportunidade de aumentar receita.`;
    suggestedPrice = basePrice * 1.1; // Aumentar 10%
  } else {
    // Preço competitivo
    action = 'maintain';
    reason = `Preço está alinhado com o mercado (${priceGap > 0 ? '+' : ''}${priceGap.toFixed(1)}% da média).`;
    suggestedPrice = basePrice;
  }

  return {
    action,
    reason,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
  };
}

/**
 * Armazenar dados processados
 */
async function storeProcessedData(data: ProcessedCompetitorData): Promise<void> {
  await queryDatabase(
    `INSERT INTO competitor_analysis 
     (property_id, analysis_date, average_price, min_price, max_price, median_price, 
      price_distribution, market_position, price_gap, recommendations, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
     ON CONFLICT (property_id, analysis_date)
     DO UPDATE SET
       average_price = $3,
       min_price = $4,
       max_price = $5,
       median_price = $6,
       price_distribution = $7,
       market_position = $8,
       price_gap = $9,
       recommendations = $10,
       updated_at = CURRENT_TIMESTAMP`,
    [
      data.propertyId,
      data.date,
      data.averagePrice,
      data.minPrice,
      data.maxPrice,
      data.medianPrice,
      JSON.stringify(data.priceDistribution),
      data.marketPosition,
      data.priceGap,
      JSON.stringify(data.recommendations),
    ]
  );
}

/**
 * Obter análise processada
 */
export async function getProcessedCompetitorData(
  propertyId: number,
  date?: Date
): Promise<ProcessedCompetitorData | null> {
  let query = `SELECT * FROM competitor_analysis WHERE property_id = $1`;
  const params: any[] = [propertyId];

  if (date) {
    query += ` AND analysis_date = $2`;
    params.push(date.toISOString().split('T')[0]);
  } else {
    query += ` ORDER BY analysis_date DESC LIMIT 1`;
  }

  const result = await queryDatabase(query, params);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    propertyId: row.property_id,
    date: row.analysis_date,
    averagePrice: parseFloat(row.average_price),
    minPrice: parseFloat(row.min_price),
    maxPrice: parseFloat(row.max_price),
    medianPrice: parseFloat(row.median_price),
    priceDistribution: JSON.parse(row.price_distribution),
    marketPosition: row.market_position,
    priceGap: parseFloat(row.price_gap),
    recommendations: JSON.parse(row.recommendations),
  };
}

/**
 * Pipeline completo: Scraping + Processamento + Armazenamento
 */
export async function scrapeAndProcessCompetitors(
  config: ScrapingConfig
): Promise<ProcessedCompetitorData> {
  // 1. Scraping
  const scrapingResults = await competitorScraperService.scrapeCompetitors(config);
  
  // 2. Consolidar preços
  const allPrices = scrapingResults
    .filter(r => r.success)
    .flatMap(r => r.prices);

  if (allPrices.length === 0) {
    throw new Error('Nenhum preço coletado dos competidores');
  }

  // 3. Processar dados
  const processed = await processCompetitorData(
    config.propertyId,
    config.checkIn,
    allPrices
  );

  return processed;
}

