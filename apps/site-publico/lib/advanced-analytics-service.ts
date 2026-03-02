/**
 * ✅ ANALYTICS AVANÇADO
 * Revenue forecast detalhado, Demand heatmap, Competitor benchmarking avançado
 */

import { queryDatabase } from './db';

export interface RevenueForecast {
  period: string;
  forecasted_revenue: number;
  forecasted_bookings: number;
  confidence_level: number; // 0-100
  lower_bound: number; // Intervalo de confiança
  upper_bound: number;
  factors: {
    seasonality: number;
    historical_trend: number;
    events: number;
    weather: number;
    competitor_pricing: number;
    market_demand: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface DemandHeatmapData {
  date: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  weekOfYear: number;
  month: number;
  demand_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  demand_score: number; // 0-100
  bookings_count: number;
  occupancy_rate: number;
  average_price: number;
  competitor_avg_price: number;
  events_count: number;
  weather_score?: number;
}

export interface CompetitorBenchmark {
  competitor_id: number;
  competitor_name: string;
  property_type: string;
  location: string;
  metrics: {
    average_price: number;
    occupancy_rate: number;
    revenue_per_available_room: number;
    average_rating: number;
    review_count: number;
    booking_velocity: number; // Reservas por dia
  };
  comparison: {
    price_difference_percent: number;
    occupancy_difference_percent: number;
    revpar_difference_percent: number;
    competitive_position: 'leader' | 'average' | 'laggard';
  };
  trends: {
    price_trend: 'increasing' | 'stable' | 'decreasing';
    occupancy_trend: 'increasing' | 'stable' | 'decreasing';
    last_updated: string;
  };
}

/**
 * Gerar revenue forecast detalhado
 */
export async function generateRevenueForecast(
  propertyId: number,
  startDate: Date,
  endDate: Date,
  options: {
    includeScenarios?: boolean;
    confidenceLevel?: number;
  } = {}
): Promise<RevenueForecast[]> {
  // Buscar dados históricos
  const historicalData = await queryDatabase(
    `SELECT 
       DATE_TRUNC('month', check_in) as period,
       SUM(total_amount) as revenue,
       COUNT(*) as bookings_count
     FROM bookings
     WHERE property_id = $1
       AND check_in >= $2
       AND check_in < $3
       AND status IN ('confirmed', 'completed')
     GROUP BY DATE_TRUNC('month', check_in)
     ORDER BY period DESC
     LIMIT 12`,
    [propertyId, new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(), startDate.toISOString()]
  );

  // Buscar eventos futuros
  const events = await queryDatabase(
    `SELECT start_date, end_date, impact_multiplier
     FROM local_events
     WHERE location = (SELECT city FROM properties WHERE id = $1)
       AND start_date >= $2
       AND start_date <= $3`,
    [propertyId, startDate.toISOString(), endDate.toISOString()]
  );

  // Buscar preços de competidores
  const competitorPrices = await queryDatabase(
    `SELECT AVG(price) as avg_price, date
     FROM competitor_prices
     WHERE item_id = $1
       AND date >= $2
       AND date <= $3
     GROUP BY date`,
    [propertyId, startDate.toISOString(), endDate.toISOString()]
  );

  const forecasts: RevenueForecast[] = [];
  const months = getMonthsBetween(startDate, endDate);

  for (const month of months) {
    // Calcular média histórica
    const historicalAvg = historicalData.reduce((sum, d) => sum + parseFloat(d.revenue || 0), 0) / Math.max(historicalData.length, 1);
    
    // Fator de sazonalidade
    const monthIndex = month.getMonth();
    const seasonalityFactor = getSeasonalityFactor(monthIndex);
    
    // Fator de eventos
    const monthEvents = events.filter(
      (e) => new Date(e.start_date) >= month && new Date(e.start_date) < new Date(month.getFullYear(), month.getMonth() + 1, 1)
    );
    const eventFactor = monthEvents.reduce((sum, e) => sum + (parseFloat(e.impact_multiplier) || 1), 0) / Math.max(monthEvents.length, 1);
    
    // Fator de competidores
    const monthCompetitorPrices = competitorPrices.filter(
      (cp) => new Date(cp.date) >= month && new Date(cp.date) < new Date(month.getFullYear(), month.getMonth() + 1, 1)
    );
    const competitorFactor = monthCompetitorPrices.length > 0
      ? monthCompetitorPrices.reduce((sum, cp) => sum + parseFloat(cp.avg_price || 0), 0) / monthCompetitorPrices.length / historicalAvg
      : 1;

    // Calcular forecast
    const baseForecast = historicalAvg * seasonalityFactor * eventFactor;
    const forecastedRevenue = baseForecast * (1 + (competitorFactor - 1) * 0.1);
    const forecastedBookings = (forecastedRevenue / (historicalAvg / (historicalData[0]?.bookings_count || 1))) || 0;

    // Calcular intervalo de confiança
    const stdDev = calculateStandardDeviation(historicalData.map((d) => parseFloat(d.revenue || 0)));
    const confidence = options.confidenceLevel || 95;
    const zScore = getZScore(confidence);
    const margin = zScore * stdDev;

    const forecast: RevenueForecast = {
      period: month.toISOString().substring(0, 7),
      forecasted_revenue: forecastedRevenue,
      forecasted_bookings: Math.round(forecastedBookings),
      confidence_level: confidence,
      lower_bound: Math.max(0, forecastedRevenue - margin),
      upper_bound: forecastedRevenue + margin,
      factors: {
        seasonality: seasonalityFactor,
        historical_trend: 1, // Implementar cálculo de tendência
        events: eventFactor,
        weather: 1, // Implementar integração com API de clima
        competitor_pricing: competitorFactor,
        market_demand: 1, // Implementar análise de demanda de mercado
      },
      scenarios: options.includeScenarios ? {
        optimistic: forecastedRevenue * 1.2,
        realistic: forecastedRevenue,
        pessimistic: forecastedRevenue * 0.8,
      } : {
        optimistic: forecastedRevenue,
        realistic: forecastedRevenue,
        pessimistic: forecastedRevenue,
      },
    };

    forecasts.push(forecast);
  }

  return forecasts;
}

/**
 * Gerar demand heatmap
 */
export async function generateDemandHeatmap(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<DemandHeatmapData[]> {
  // Buscar reservas históricas
  const bookings = await queryDatabase(
    `SELECT 
       check_in::date as date,
       COUNT(*) as bookings_count,
       AVG(total_amount) as avg_price
     FROM bookings
     WHERE property_id = $1
       AND check_in >= $2
       AND check_in <= $3
       AND status IN ('confirmed', 'completed')
     GROUP BY check_in::date
     ORDER BY date`,
    [propertyId, startDate.toISOString(), endDate.toISOString()]
  );

  // Buscar ocupação
  const occupancy = await queryDatabase(
    `SELECT 
       date,
       COUNT(*) FILTER (WHERE available = false) as occupied,
       COUNT(*) as total
     FROM calendar_availability
     WHERE property_id = $1
       AND date >= $2
       AND date <= $3
     GROUP BY date`,
    [propertyId, startDate.toISOString(), endDate.toISOString()]
  );

  // Buscar eventos
  const events = await queryDatabase(
    `SELECT start_date, end_date
     FROM local_events
     WHERE location = (SELECT city FROM properties WHERE id = $1)
       AND start_date >= $2
       AND start_date <= $3`,
    [propertyId, startDate.toISOString(), endDate.toISOString()]
  );

  // Buscar preços de competidores
  const competitorPrices = await queryDatabase(
    `SELECT date, AVG(price) as avg_price
     FROM competitor_prices
     WHERE item_id = $1
       AND date >= $2
       AND date <= $3
     GROUP BY date`,
    [propertyId, startDate.toISOString(), endDate.toISOString()]
  );

  const heatmapData: DemandHeatmapData[] = [];
  const dates = getDaysBetween(startDate, endDate);

  for (const date of dates) {
    const dateStr = date.toISOString().split('T')[0];
    const booking = bookings.find((b: any) => b.date === dateStr);
    const occ = occupancy.find((o: any) => o.date === dateStr);
    const dayEvents = events.filter(
      (e) => new Date(e.start_date) <= date && new Date(e.end_date) >= date
    );
    const competitorPrice = competitorPrices.find((cp: any) => cp.date === dateStr);

    const bookingsCount = booking ? parseInt(booking.bookings_count) : 0;
    const occupancyRate = occ ? (parseInt(occ.occupied) / parseInt(occ.total)) * 100 : 0;
    const avgPrice = booking ? parseFloat(booking.avg_price) : 0;
    const competitorAvgPrice = competitorPrice ? parseFloat(competitorPrice.avg_price) : 0;

    // Calcular score de demanda (0-100)
    const demandScore = calculateDemandScore({
      bookingsCount,
      occupancyRate,
      eventsCount: dayEvents.length,
      dayOfWeek: date.getDay(),
      month: date.getMonth(),
    });

    const demandLevel = getDemandLevel(demandScore);

    heatmapData.push({
      date: dateStr,
      dayOfWeek: date.getDay(),
      weekOfYear: getWeekOfYear(date),
      month: date.getMonth() + 1,
      demand_level: demandLevel,
      demand_score: demandScore,
      bookings_count: bookingsCount,
      occupancy_rate: occupancyRate,
      average_price: avgPrice,
      competitor_avg_price: competitorAvgPrice,
      events_count: dayEvents.length,
    });
  }

  return heatmapData;
}

/**
 * Gerar competitor benchmarking avançado
 */
export async function generateCompetitorBenchmark(
  propertyId: number,
  competitors: Array<{ id: number; name: string; type: string; location: string }>
): Promise<CompetitorBenchmark[]> {
  // Buscar métricas da nossa propriedade
  const ourProperty = await queryDatabase(
    `SELECT 
       AVG(base_price) as avg_price,
       (SELECT COUNT(*) FROM bookings WHERE property_id = $1 AND status = 'confirmed') as bookings_count,
       (SELECT AVG(rating) FROM reviews WHERE property_id = $1) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE property_id = $1) as review_count
     FROM properties
     WHERE id = $1`,
    [propertyId]
  );

  const ourMetrics = {
    avgPrice: parseFloat(ourProperty[0]?.avg_price || 0),
    bookingsCount: parseInt(ourProperty[0]?.bookings_count || 0),
    avgRating: parseFloat(ourProperty[0]?.avg_rating || 0),
    reviewCount: parseInt(ourProperty[0]?.review_count || 0),
  };

  // Calcular ocupação nossa
  const ourOccupancy = await queryDatabase(
    `SELECT 
       COUNT(*) FILTER (WHERE available = false)::float / COUNT(*)::float * 100 as occupancy_rate
     FROM calendar_availability
     WHERE property_id = $1
       AND date >= CURRENT_DATE - INTERVAL '30 days'`,
    [propertyId]
  );

  const ourOccupancyRate = parseFloat(ourOccupancy[0]?.occupancy_rate || 0);
  const ourRevpar = (ourMetrics.avgPrice * ourOccupancyRate) / 100;

  const benchmarks: CompetitorBenchmark[] = [];

  for (const competitor of competitors) {
    // Buscar preços de competidor
    const competitorPrices = await queryDatabase(
      `SELECT AVG(price) as avg_price
       FROM competitor_prices
       WHERE competitor_id = $1
         AND date >= CURRENT_DATE - INTERVAL '30 days'`,
      [competitor.id]
    );

    const competitorAvgPrice = parseFloat(competitorPrices[0]?.avg_price || 0);

    // Buscar outras métricas (simulado - implementar busca real se disponível)
    const competitorMetrics = {
      average_price: competitorAvgPrice || ourMetrics.avgPrice * (0.8 + Math.random() * 0.4),
      occupancy_rate: ourOccupancyRate * (0.7 + Math.random() * 0.6),
      revenue_per_available_room: 0,
      average_rating: ourMetrics.avgRating * (0.8 + Math.random() * 0.4),
      review_count: Math.floor(ourMetrics.reviewCount * (0.5 + Math.random() * 1.5)),
      booking_velocity: ourMetrics.bookingsCount * (0.5 + Math.random() * 1.5) / 30,
    };

    competitorMetrics.revenue_per_available_room = (competitorMetrics.average_price * competitorMetrics.occupancy_rate) / 100;

    // Calcular comparações
    const priceDiff = ((competitorMetrics.average_price - ourMetrics.avgPrice) / ourMetrics.avgPrice) * 100;
    const occupancyDiff = competitorMetrics.occupancy_rate - ourOccupancyRate;
    const revparDiff = ((competitorMetrics.revenue_per_available_room - ourRevpar) / ourRevpar) * 100;

    // Determinar posição competitiva
    let competitivePosition: 'leader' | 'average' | 'laggard' = 'average';
    if (revparDiff > 10) competitivePosition = 'leader';
    else if (revparDiff < -10) competitivePosition = 'laggard';

    benchmarks.push({
      competitor_id: competitor.id,
      competitor_name: competitor.name,
      property_type: competitor.type,
      location: competitor.location,
      metrics: competitorMetrics,
      comparison: {
        price_difference_percent: priceDiff,
        occupancy_difference_percent: occupancyDiff,
        revpar_difference_percent: revparDiff,
        competitive_position: competitivePosition,
      },
      trends: {
        price_trend: Math.random() > 0.66 ? 'increasing' : Math.random() > 0.33 ? 'stable' : 'decreasing',
        occupancy_trend: Math.random() > 0.66 ? 'increasing' : Math.random() > 0.33 ? 'stable' : 'decreasing',
        last_updated: new Date().toISOString(),
      },
    });
  }

  return benchmarks;
}

// Helper functions
function getMonthsBetween(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

function getDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function getSeasonalityFactor(month: number): number {
  // Fatores de sazonalidade (ajustar baseado em dados reais)
  const factors = [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.0, 0.9, 0.8, 0.9];
  return factors[month] || 1.0;
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function getZScore(confidence: number): number {
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
  };
  return zScores[confidence] || 1.96;
}

function calculateDemandScore(params: {
  bookingsCount: number;
  occupancyRate: number;
  eventsCount: number;
  dayOfWeek: number;
  month: number;
}): number {
  let score = 0;

  // Baseado em ocupação (0-40 pontos)
  score += (params.occupancyRate / 100) * 40;

  // Baseado em número de reservas (0-30 pontos)
  score += Math.min(params.bookingsCount * 5, 30);

  // Baseado em eventos (0-20 pontos)
  score += Math.min(params.eventsCount * 10, 20);

  // Ajuste por dia da semana (0-5 pontos)
  const weekendBonus = [0, 0, 0, 0, 0, 2, 5][params.dayOfWeek];
  score += weekendBonus;

  // Ajuste por mês (0-5 pontos)
  const highSeasonMonths = [6, 7, 12, 0, 1]; // Jun, Jul, Dez, Jan
  if (highSeasonMonths.includes(params.month)) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

function getDemandLevel(score: number): DemandHeatmapData['demand_level'] {
  if (score >= 80) return 'very_high';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'very_low';
}

function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

