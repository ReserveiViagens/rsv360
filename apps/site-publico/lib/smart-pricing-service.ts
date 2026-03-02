/**
 * ✅ ITENS 31-35: SERVIÇO DE SMART PRICING AI
 * Sistema completo de precificação inteligente
 */

import { queryDatabase } from './db';
import { advancedPricingModel, type AdvancedFeatures } from './ml/advanced-pricing-model';
import { competitorScraperService } from './competitor-scraper';
import { isHoliday, isHolidayWeek } from './external/feriados-service';

export interface WeatherData {
  temperature: number;
  condition: string; // 'sunny', 'rainy', 'cloudy', etc.
  humidity: number;
  windSpeed: number;
  precipitation?: number;
}

export interface LocalEvent {
  id: number;
  event_name: string;
  event_type: string;
  source: string;
  location: string;
  start_date: string;
  end_date?: string;
  expected_attendance?: number;
  impact_on_pricing: string;
  price_multiplier: number;
}

export interface CompetitorPrice {
  id: number;
  competitor_name: string;
  price: number;
  currency: string;
  availability_status: string;
  scraped_at: string;
}

export interface PricingFactors {
  weather?: WeatherData;
  events?: LocalEvent[];
  competitors?: CompetitorPrice[];
  demand?: string;
  season?: string;
  basePrice: number;
  finalPrice: number;
  multipliers: {
    weather: number;
    events: number;
    competitors: number;
    demand: number;
    season: number;
  };
}

/**
 * ✅ ITEM 31: INTEGRAÇÃO OPENWEATHER
 */
export async function getWeatherData(
  location: string,
  latitude?: number,
  longitude?: number
): Promise<WeatherData | null> {
  try {
    // Verificar cache Redis primeiro
    const { cacheGetOrSet } = await import('./cache-integration');
    const cacheKey = `rsv:pricing:weather:${location}:${latitude || ''}:${longitude || ''}`;
    
    return await cacheGetOrSet(cacheKey, async () => {
      // Verificar cache do banco
      const cached = (await queryDatabase(
        `SELECT weather_data, expires_at FROM weather_cache 
         WHERE location = $1 AND expires_at > CURRENT_TIMESTAMP
         ORDER BY cached_at DESC LIMIT 1`,
        [location]
      )) || [];

      if (cached.length > 0) {
        return cached[0].weather_data as WeatherData;
      }

    // Buscar da API OpenWeather
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('OpenWeather API key não configurada');
      return null;
    }

    const query = latitude && longitude
      ? `lat=${latitude}&lon=${longitude}`
      : `q=${encodeURIComponent(location)}`;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric&lang=pt_br`
    );

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();

    const weatherData: WeatherData = {
      temperature: data.main.temp,
      condition: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
    };

      // Salvar no cache (expira em 1 hora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await queryDatabase(
        `INSERT INTO weather_cache (location, latitude, longitude, weather_data, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (location, DATE(cached_at)) DO UPDATE SET
           weather_data = EXCLUDED.weather_data,
           expires_at = EXCLUDED.expires_at,
           cached_at = CURRENT_TIMESTAMP`,
        [
          location,
          latitude || data.coord?.lat || null,
          longitude || data.coord?.lon || null,
          JSON.stringify(weatherData),
          expiresAt.toISOString(),
        ]
      );

      return weatherData;
    }, 1800); // Cache Redis por 30 minutos (menos que o cache do banco)
  } catch (error: any) {
    console.error('Erro ao buscar dados climáticos:', error);
    return null;
  }
}

/**
 * Calcular multiplicador baseado no clima
 */
function calculateWeatherMultiplier(weather: WeatherData): number {
  let multiplier = 1.0;

  // Clima bom aumenta preço
  if (weather.condition === 'clear' || weather.condition === 'sunny') {
    multiplier += 0.1; // +10%
  }

  // Temperatura ideal (20-25°C) aumenta preço
  if (weather.temperature >= 20 && weather.temperature <= 25) {
    multiplier += 0.05; // +5%
  }

  // Chuva reduz preço
  if (weather.condition === 'rain' || weather.precipitation) {
    multiplier -= 0.15; // -15%
  }

  // Umidade muito alta reduz preço
  if (weather.humidity > 80) {
    multiplier -= 0.1; // -10%
  }

  return Math.max(0.5, Math.min(1.5, multiplier)); // Limitar entre 0.5x e 1.5x
}

/**
 * ✅ ITEM 32: INTEGRAÇÃO GOOGLE CALENDAR
 */
export async function syncGoogleCalendarEvents(
  location: string,
  startDate: Date,
  endDate: Date
): Promise<LocalEvent[]> {
  try {
    // ✅ IMPLEMENTAÇÃO REAL: Integração com Google Calendar API
    const { syncGoogleCalendarEvents: syncReal } = await import('./google-calendar-service');
    return await syncReal(location, startDate, endDate);
  } catch (error: any) {
    console.error('Erro ao sincronizar eventos do Google Calendar:', error);
    // Fallback: buscar eventos já sincronizados no banco
    try {
      const events = await queryDatabase(
        `SELECT * FROM local_events 
         WHERE location ILIKE $1 
         AND start_date BETWEEN $2 AND $3
         AND source = 'google_calendar'
         ORDER BY start_date`,
        [location, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );
      return events as LocalEvent[];
    } catch (fallbackError) {
      return [];
    }
  }
}

/**
 * ✅ ITEM 33: INTEGRAÇÃO EVENTBRITE
 */
export async function syncEventbriteEvents(
  location: string,
  startDate: Date,
  endDate: Date
): Promise<LocalEvent[]> {
  try {
    // ✅ IMPLEMENTAÇÃO REAL: Integração com Eventbrite API
    const { syncEventbriteEvents: syncReal } = await import('./eventbrite-service');
    return await syncReal(location, startDate, endDate);
  } catch (error: any) {
    console.error('Erro ao sincronizar eventos do Eventbrite:', error);
    // Fallback: buscar eventos já sincronizados no banco
    try {
      const events = await queryDatabase(
        `SELECT * FROM local_events 
         WHERE location ILIKE $1 
         AND start_date BETWEEN $2 AND $3
         AND source = 'eventbrite'
         ORDER BY start_date`,
        [location, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );
      return events as LocalEvent[];
    } catch (fallbackError) {
      return [];
    }
  }
}

/**
 * Calcular multiplicador baseado em eventos
 */
function calculateEventMultiplier(events: LocalEvent[]): number {
  if (events.length === 0) return 1.0;

  let multiplier = 1.0;

  events.forEach((event) => {
    if (event.impact_on_pricing === 'high') {
      multiplier += 0.2; // +20% por evento de alto impacto
    } else if (event.impact_on_pricing === 'medium') {
      multiplier += 0.1; // +10% por evento de médio impacto
    } else {
      multiplier += 0.05; // +5% por evento de baixo impacto
    }

    // Aplicar multiplicador específico do evento
    if (event.price_multiplier > 1.0) {
      multiplier *= event.price_multiplier;
    }
  });

  return Math.max(1.0, Math.min(2.0, multiplier)); // Limitar entre 1.0x e 2.0x
}

/**
 * ✅ ITEM 34: SCRAPING DE COMPETIDORES
 */
export async function getCompetitorPrices(
  itemId: number,
  date: Date
): Promise<CompetitorPrice[]> {
  try {
    // Buscar preços de competidores já coletados
    const prices = await queryDatabase(
      `SELECT * FROM competitor_prices 
       WHERE item_id = $1 
       AND DATE(scraped_at) = $2
       ORDER BY scraped_at DESC`,
      [itemId, date.toISOString().split('T')[0]]
    );

    return prices as CompetitorPrice[];
  } catch (error: any) {
    console.error('Erro ao buscar preços de competidores:', error);
    return [];
  }
}

/**
 * Salvar preço de competidor (após scraping)
 */
export async function saveCompetitorPrice(
  itemId: number,
  competitorName: string,
  price: number,
  currency: string = 'BRL',
  availabilityStatus: string = 'available',
  competitorItemId?: string,
  competitorUrl?: string,
  scrapedData?: any
): Promise<void> {
  await queryDatabase(
    `INSERT INTO competitor_prices 
     (item_id, competitor_name, competitor_item_id, competitor_url, price, currency, availability_status, scraped_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      itemId,
      competitorName,
      competitorItemId || null,
      competitorUrl || null,
      price,
      currency,
      availabilityStatus,
      scrapedData ? JSON.stringify(scrapedData) : null,
    ]
  );
}

/**
 * Calcular multiplicador baseado em competidores
 */
function calculateCompetitorMultiplier(
  basePrice: number,
  competitors: CompetitorPrice[]
): number {
  if (competitors.length === 0) return 1.0;

  const avgCompetitorPrice =
    competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;

  // Se nosso preço está muito abaixo da média, aumentar
  if (basePrice < avgCompetitorPrice * 0.8) {
    return 1.1; // +10%
  }

  // Se nosso preço está muito acima da média, diminuir
  if (basePrice > avgCompetitorPrice * 1.2) {
    return 0.9; // -10%
  }

  return 1.0; // Preço competitivo
}

/**
 * ✅ ITEM 35: CALCULAR PREÇO COM SMART PRICING (Versão Avançada com ML)
 * Usa modelo avançado de ML quando disponível, fallback para método tradicional
 */
export async function calculateSmartPriceAdvanced(
  itemId: number,
  basePrice: number,
  checkIn: Date,
  checkOut: Date,
  location?: string,
  latitude?: number,
  longitude?: number
): Promise<PricingFactors & { mlPrediction?: any }> {
  try {
    // Preparar features avançadas para o modelo ML
    const month = checkIn.getMonth() + 1;
    const dayOfWeek = checkIn.getDay();
    const dayOfMonth = checkIn.getDate();
    const daysUntilCheckIn = Math.max(0, Math.ceil((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const daysUntilCheckOut = Math.max(0, Math.ceil((checkOut.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    
    // Buscar dados históricos detalhados
    const [historicalData, occupancyData, propertyData, competitorData, weatherData, eventsData] = await Promise.all([
      // Dados históricos
      queryDatabase(
        `SELECT 
          COUNT(*) as booking_count,
          AVG(total_price) as avg_price,
          STDDEV(total_price) as price_stddev,
          AVG(EXTRACT(EPOCH FROM (check_out - check_in))/86400) as avg_nights
        FROM bookings
        WHERE property_id = $1
        AND status IN ('confirmed', 'completed')
        AND check_in >= CURRENT_DATE - INTERVAL '2 years'`,
        [itemId]
      ),
      // Ocupação atual
      queryDatabase(
        `SELECT COUNT(*) as occupied_count
        FROM bookings 
        WHERE property_id = $1
        AND check_in <= $2
        AND check_out > $2
        AND status IN ('confirmed', 'completed', 'pending')`,
        [itemId, checkIn.toISOString().split('T')[0]]
      ),
      // Dados da propriedade
      queryDatabase(
        `SELECT rating, review_count, created_at, property_type
        FROM properties
        WHERE id = $1`,
        [itemId]
      ),
      // Preços de competidores
      getCompetitorPrices(itemId, checkIn),
      // Dados do clima
      location ? getWeatherData(location, latitude, longitude) : Promise.resolve(null),
      // Eventos locais
      location ? Promise.all([
        syncGoogleCalendarEvents(location, checkIn, checkOut),
        syncEventbriteEvents(location, checkIn, checkOut)
      ]).then(([google, eventbrite]) => [...google, ...eventbrite]) : Promise.resolve([])
    ]);

    const historical = historicalData[0] || {};
    const occupancy = occupancyData[0] || {};
    const property = propertyData[0] || {};
    const competitors = competitorData || [];
    const weather = weatherData;
    const events = eventsData || [];

    // Calcular features avançadas
    const avgHistoricalPrice = parseFloat(historical.avg_price || basePrice);
    const priceVolatility = parseFloat(historical.price_stddev || '0') / avgHistoricalPrice;
    // Calcular tendência de reservas (função auxiliar local)
    const bookingTrend = await (async (itemId: number) => {
      try {
        const bookings = await queryDatabase(
          `SELECT COUNT(*) as count, AVG(price) as avg_price
           FROM bookings 
           WHERE property_id = $1 
           AND created_at >= CURRENT_DATE - INTERVAL '30 days'
           GROUP BY DATE_TRUNC('day', created_at)
           ORDER BY DATE_TRUNC('day', created_at) DESC
           LIMIT 30`,
          [itemId]
        ) || [];
        return bookings.length > 0 ? 'increasing' : 'stable';
      } catch {
        return 'stable';
      }
    })(itemId);
    
    // Determinar temporada
    let season: 'high' | 'medium' | 'low' = 'medium';
    let seasonalityFactor = 1.0;
    if (month >= 12 || month <= 2) {
      season = 'high';
      seasonalityFactor = 1.2;
    } else if (month >= 6 && month <= 8) {
      season = 'high';
      seasonalityFactor = 1.1;
    } else {
      season = 'low';
      seasonalityFactor = 0.9;
    }

    // Calcular fator de sazonalidade mensal
    const monthSeasonality = getMonthSeasonalityFactor(month);

    // Features avançadas
    const advancedFeatures: AdvancedFeatures = {
      // Temporais
      month,
      dayOfWeek,
      dayOfMonth,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
      isHoliday: await isHoliday(checkInDate),
      isHolidayWeek: await isHolidayWeek(checkInDate),
      daysUntilCheckIn,
      daysUntilCheckOut,
      
      // Históricas
      historicalBookings: parseInt(historical.booking_count || '0'),
      historicalOccupancy: Math.min(1, parseInt(occupancy.occupied_count || '0') / 10),
      avgHistoricalPrice,
      priceVolatility,
      bookingTrend,
      
      // Demanda
      currentOccupancy: Math.min(1, parseInt(occupancy.occupied_count || '0') / 10),
      competitorOccupancy: competitors.length > 0 ? 0.7 : 0.5, // Estimado
      demandScore: 0.5, // Será calculado pelo modelo
      leadTimeScore: daysUntilCheckIn < 7 ? 0.9 : daysUntilCheckIn < 30 ? 0.7 : 0.5,
      
      // Sazonais
      season,
      seasonalityFactor,
      monthSeasonality,
      
      // Externas
      weatherScore: weather ? calculateWeatherScore(weather) : 50,
      eventCount: events.length,
      eventImpact: events.length > 0 ? Math.min(1, events.reduce((sum, e) => sum + (e.price_multiplier || 1), 0) / events.length) : 0,
      competitorPriceRatio: competitors.length > 0 
        ? (competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length) / basePrice
        : 1.0,
      
      // Propriedade
      propertyRating: parseFloat(property.rating || '4.0'),
      propertyReviews: parseInt(property.review_count || '0'),
      propertyAge: property.created_at ? Math.floor((Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 1,
      propertyType: property.property_type || 'apartment',
      
      // Mercado
      marketDemand: await calculateMarketDemand(itemId, checkInDate, competitors, historical),
      marketCompetition: competitors.length > 5 ? 0.8 : competitors.length > 2 ? 0.5 : 0.3,
      priceElasticity: -1.5, // Elasticidade típica
    };

    // Usar modelo avançado para prever
    const mlPrediction = await advancedPricingModel.predict(advancedFeatures, basePrice);

    // Calcular preço final usando predição ML
    const finalPrice = mlPrediction.predictedPrice;

    // Preparar fatores de retorno
    const multipliers = {
      weather: weather ? calculateWeatherMultiplier(weather) : 1.0,
      events: events.length > 0 ? calculateEventMultiplier(events) : 1.0,
      competitors: competitors.length > 0 ? calculateCompetitorMultiplier(basePrice, competitors) : 1.0,
      demand: mlPrediction.predictedDemand > 0.7 ? 1.2 : mlPrediction.predictedDemand < 0.3 ? 0.8 : 1.0,
      season: seasonalityFactor,
    };

    const factors: PricingFactors & { mlPrediction?: any } = {
      basePrice,
      finalPrice,
      multipliers,
      weather: weather || undefined,
      events: events.length > 0 ? events : undefined,
      competitors: competitors.length > 0 ? competitors : undefined,
      demand: mlPrediction.predictedDemand > 0.7 ? 'high' : mlPrediction.predictedDemand < 0.3 ? 'low' : 'medium',
      season,
      mlPrediction, // Incluir predição ML completa
    };

    // Salvar no histórico
    await queryDatabase(
      `INSERT INTO pricing_history 
       (item_id, base_price, final_price, price_factors, weather_data, event_data, competitor_data, demand_level, season, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        itemId,
        basePrice,
        finalPrice,
        JSON.stringify(factors),
        weather ? JSON.stringify(weather) : null,
        events.length > 0 ? JSON.stringify(events) : null,
        competitors.length > 0 ? JSON.stringify(competitors) : null,
        factors.demand || 'medium',
        season,
        checkIn.toISOString().split('T')[0],
      ]
    );

    return factors;
  } catch (error) {
    console.error('Erro ao usar modelo ML avançado, usando método tradicional:', error);
    // Fallback para método tradicional
    return calculateSmartPrice(itemId, basePrice, checkIn, checkOut, location, latitude, longitude);
  }
}

/**
 * ✅ ITEM 35: CALCULAR PREÇO COM SMART PRICING (Método Tradicional)
 */
export async function calculateSmartPrice(
  itemId: number,
  basePrice: number,
  checkIn: Date,
  checkOut: Date,
  location?: string,
  latitude?: number,
  longitude?: number
): Promise<PricingFactors> {
  // Usar cache para preços calculados
  const { cachePricing, invalidatePricingCache } = await import('./cache-integration');
  const dateKey = checkIn.toISOString().split('T')[0];
  
  return cachePricing(itemId, dateKey, async () => {
    const multipliers = {
      weather: 1.0,
      events: 1.0,
      competitors: 1.0,
      demand: 1.0,
      season: 1.0,
    };

    let finalPrice = basePrice;
    const factors: PricingFactors = {
      basePrice,
      finalPrice,
      multipliers,
    };

  // Buscar configuração de precificação dinâmica
  const configs = await queryDatabase(
    `SELECT * FROM dynamic_pricing_config WHERE item_id = $1`,
    [itemId]
  );

  const config = configs.length > 0 ? configs[0] : null;

  // ✅ ITEM 31: Impacto do clima
  if (!config || config.weather_impact) {
    const weather = location
      ? await getWeatherData(location, latitude, longitude)
      : null;

    if (weather) {
      factors.weather = weather;
      multipliers.weather = calculateWeatherMultiplier(weather);
      if (config) {
        multipliers.weather *= parseFloat(config.weather_multiplier || '1.0');
      }
    }
  }

  // ✅ ITEM 32 e 33: Impacto de eventos
  if (!config || config.event_impact) {
    const googleEvents = location
      ? await syncGoogleCalendarEvents(location, checkIn, checkOut)
      : [];
    const eventbriteEvents = location
      ? await syncEventbriteEvents(location, checkIn, checkOut)
      : [];

    const allEvents = [...googleEvents, ...eventbriteEvents];
    if (allEvents.length > 0) {
      factors.events = allEvents;
      multipliers.events = calculateEventMultiplier(allEvents);
      if (config) {
        multipliers.events *= parseFloat(config.event_multiplier || '1.0');
      }
    }
  }

  // ✅ ITEM 34: Impacto de competidores (com scraping automático)
  if (!config || config.competitor_impact) {
    // Tentar scraping automático primeiro
    let competitors: CompetitorPrice[] = [];
    
    try {
      const property = await queryDatabase(
        `SELECT location, latitude, longitude FROM properties WHERE id = $1`,
        [itemId]
      );
      
      if (property.length > 0 && property[0].location) {
        const scrapingResults = await competitorScraperService.scrapeCompetitors({
          propertyId: itemId,
          location: property[0].location,
          latitude: property[0].latitude,
          longitude: property[0].longitude,
          checkIn,
          checkOut,
          platforms: ['airbnb', 'booking', 'expedia', 'vrbo'],
          enabled: true,
        });
        
        // Consolidar preços de todas as plataformas
        competitors = scrapingResults
          .filter(r => r.success)
          .flatMap(r => r.prices);
      }
    } catch (error) {
      console.warn('Erro ao fazer scraping de competidores, usando cache:', error);
    }
    
    // Se não conseguiu scraping, usar cache
    if (competitors.length === 0) {
      competitors = await getCompetitorPrices(itemId, checkIn);
    }
    
    if (competitors.length > 0) {
      factors.competitors = competitors;
      multipliers.competitors = calculateCompetitorMultiplier(basePrice, competitors);
      if (config) {
        multipliers.competitors *= parseFloat(config.competitor_multiplier || '1.0');
      }
    }
  }

  // ✅ IMPLEMENTAÇÃO REAL: Calcular demanda baseado em dados históricos
  multipliers.demand = await calculateDemandMultiplier(itemId, checkIn, checkOut);
  factors.demand = multipliers.demand > 1.2 ? 'high' : multipliers.demand > 0.8 ? 'medium' : 'low';

  // Calcular temporada
  const month = checkIn.getMonth() + 1; // 1-12
  if (month >= 12 || month <= 2) {
    // Verão (dez-fev)
    multipliers.season = 1.2;
    factors.season = 'high';
  } else if (month >= 6 && month <= 8) {
    // Inverno (jun-ago)
    multipliers.season = 1.1;
    factors.season = 'high';
  } else {
    multipliers.season = 0.9;
    factors.season = 'low';
  }

  if (config) {
    multipliers.season *= parseFloat(config.season_multiplier || '1.0');
  }

  // Calcular preço final
  finalPrice = basePrice;
  finalPrice *= multipliers.weather;
  finalPrice *= multipliers.events;
  finalPrice *= multipliers.competitors;
  finalPrice *= multipliers.demand;
  finalPrice *= multipliers.season;

  // Aplicar limites min/max
  if (config) {
    const minPrice = basePrice * parseFloat(config.min_price_multiplier || '0.5');
    const maxPrice = basePrice * parseFloat(config.max_price_multiplier || '2.0');
    finalPrice = Math.max(minPrice, Math.min(maxPrice, finalPrice));
  }

    factors.finalPrice = Math.round(finalPrice * 100) / 100; // Arredondar para 2 casas decimais

    // ✅ ITEM 35: Salvar no histórico
    await queryDatabase(
    `INSERT INTO pricing_history 
     (item_id, base_price, final_price, price_factors, weather_data, event_data, competitor_data, demand_level, season, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      itemId,
      basePrice,
      factors.finalPrice,
      JSON.stringify(factors),
      factors.weather ? JSON.stringify(factors.weather) : null,
      factors.events ? JSON.stringify(factors.events) : null,
      factors.competitors ? JSON.stringify(factors.competitors) : null,
      factors.demand || 'medium',
        factors.season || 'low',
        checkIn.toISOString().split('T')[0],
      ]
    );

    return factors;
  });
}

/**
 * Obter histórico de preços
 */
export async function getPricingHistory(
  itemId: number,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): Promise<any[]> {
  let query = `SELECT * FROM pricing_history WHERE item_id = $1`;
  const params: any[] = [itemId];

  if (startDate) {
    query += ` AND date >= $${params.length + 1}`;
    params.push(startDate.toISOString().split('T')[0]);
  }

  if (endDate) {
    query += ` AND date <= $${params.length + 1}`;
    params.push(endDate.toISOString().split('T')[0]);
  }

  query += ` ORDER BY date DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  return await queryDatabase(query, params);
}

/**
 * Análise de tendências de preço
 */
export async function analyzePricingTrends(itemId: number): Promise<any> {
  const history = await getPricingHistory(itemId, undefined, undefined, 365);

  if (history.length === 0) {
    return {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      trend: 'stable',
      volatility: 0,
    };
  }

  const prices = history.map((h: any) => parseFloat(h.final_price));
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Calcular volatilidade (desvio padrão)
  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) /
    prices.length;
  const volatility = Math.sqrt(variance);

  // Determinar tendência
  const recentPrices = prices.slice(0, 30); // Últimos 30 dias
  const olderPrices = prices.slice(30, 60); // 30-60 dias atrás

  const recentAvg =
    recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg =
    olderPrices.length > 0
      ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length
      : recentAvg;

  let trend = 'stable';
  if (recentAvg > olderAvg * 1.05) {
    trend = 'increasing';
  } else if (recentAvg < olderAvg * 0.95) {
    trend = 'decreasing';
  }

  return {
    averagePrice: Math.round(averagePrice * 100) / 100,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    trend,
    volatility: Math.round(volatility * 100) / 100,
    dataPoints: history.length,
  };
}

/**
 * ✅ Calcular multiplicador de demanda baseado em dados históricos e ML
 */
async function calculateDemandMultiplier(
  itemId: number,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  // Tentar usar ML predictor primeiro
  try {
    const { demandPredictor } = await import('./ml/demand-predictor');
    
    // Buscar features para o modelo
    const month = checkIn.getMonth() + 1;
    const dayOfWeek = checkIn.getDay();
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    // Buscar dados históricos
    const historicalBookings = await queryDatabase(
      `SELECT COUNT(*)::INTEGER as booking_count, 
              AVG(EXTRACT(EPOCH FROM (check_out::timestamp - check_in::timestamp))/86400)::NUMERIC as avg_nights
       FROM bookings 
       WHERE property_id = $1
       AND EXTRACT(MONTH FROM check_in::date) = $2::INTEGER
       AND EXTRACT(DAY FROM check_in::date)::INTEGER BETWEEN $3::INTEGER AND $4::INTEGER
       AND status IN ('confirmed', 'completed')
       AND check_in::date >= CURRENT_DATE - INTERVAL '2 years'`,
      [itemId, month, Math.max(1, checkIn.getDate() - 7), Math.min(31, checkIn.getDate() + 7)]
    );

    // ✅ CORREÇÃO: Garantir que historicalBookings é um array
    const historicalBookingsArray = Array.isArray(historicalBookings) ? historicalBookings : [];
    const bookingCount = parseInt(historicalBookingsArray[0]?.booking_count || '0');
    const avgNights = parseFloat(historicalBookingsArray[0]?.avg_nights || '2');

    // Buscar ocupação atual
    const currentOccupancy = await queryDatabase(
      `SELECT COUNT(*) as occupied_count
       FROM bookings 
       WHERE property_id = $1
       AND check_in <= $2
       AND check_out > $2
       AND status IN ('confirmed', 'completed', 'pending')`,
      [itemId, checkIn.toISOString().split('T')[0]]
    );

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

    // Verificar se é feriado usando API de feriados
    const holidayDate = new Date(year, month - 1, day);
    const isHolidayResult = await isHoliday(holidayDate);

    // Prever demanda usando ML
    const prediction = await demandPredictor.predict({
      month,
      dayOfWeek,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
      isHoliday: isHolidayResult,
      daysUntilCheckIn,
      historicalBookings: bookingCount,
      currentOccupancy: occupiedCount,
      avgNights,
      season,
    });

    // Usar multiplicador recomendado pelo ML
    return prediction.recommendedMultiplier;
  } catch (error) {
    console.warn('Erro ao usar ML predictor, usando algoritmo tradicional:', error);
    // Fallback para algoritmo tradicional
  }

  // Algoritmo tradicional (fallback)
  try {
    // Buscar reservas históricas para o mesmo período do ano
    const checkInMonth = checkIn.getMonth() + 1;
    const checkInDay = checkIn.getDate();
    
    // Buscar reservas do mesmo período nos últimos 2 anos
    const historicalBookings = await queryDatabase(
      `SELECT COUNT(*)::INTEGER as booking_count, 
              AVG(EXTRACT(EPOCH FROM (check_out::timestamp - check_in::timestamp))/86400)::NUMERIC as avg_nights
       FROM bookings 
       WHERE property_id = $1
       AND EXTRACT(MONTH FROM check_in::date) = $2::INTEGER
       AND EXTRACT(DAY FROM check_in::date)::INTEGER BETWEEN $3::INTEGER AND $4::INTEGER
       AND status IN ('confirmed', 'completed')
       AND check_in::date >= CURRENT_DATE - INTERVAL '2 years'`,
      [itemId, checkInMonth, Math.max(1, checkInDay - 7), Math.min(31, checkInDay + 7)]
    );

    // ✅ CORREÇÃO: Garantir que historicalBookings é um array
    const historicalBookingsArray = Array.isArray(historicalBookings) ? historicalBookings : [];
    const bookingCount = historicalBookingsArray[0]?.booking_count || 0;
    const avgNights = parseFloat(historicalBookingsArray[0]?.avg_nights || '2');

    // Buscar ocupação atual do mês
    const currentOccupancy = await queryDatabase(
      `SELECT COUNT(*) as occupied_count
       FROM bookings 
       WHERE property_id = $1
       AND check_in <= $2
       AND check_out > $2
       AND status IN ('confirmed', 'completed', 'pending')`,
      [itemId, checkIn.toISOString().split('T')[0]]
    );

    const occupiedCount = currentOccupancy[0]?.occupied_count || 0;

    // Calcular multiplicador baseado em:
    // 1. Histórico de reservas (mais reservas = mais demanda)
    // 2. Ocupação atual (mais ocupado = mais demanda)
    // 3. Duração da estadia (estadias mais longas = mais demanda)
    
    let multiplier = 1.0;

    // Fator histórico (0.8 - 1.3)
    if (bookingCount > 10) {
      multiplier += 0.2; // Alta demanda histórica
    } else if (bookingCount > 5) {
      multiplier += 0.1; // Média demanda histórica
    } else if (bookingCount < 2) {
      multiplier -= 0.1; // Baixa demanda histórica
    }

    // Fator ocupação atual (0.9 - 1.2)
    if (occupiedCount > 5) {
      multiplier += 0.15; // Muito ocupado
    } else if (occupiedCount > 2) {
      multiplier += 0.05; // Moderadamente ocupado
    } else {
      multiplier -= 0.05; // Pouco ocupado
    }

    // Fator duração da estadia (0.95 - 1.1)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights >= 7) {
      multiplier += 0.1; // Estadias longas são mais valiosas
    } else if (nights >= 3) {
      multiplier += 0.05;
    }

    // Fator lead time (tempo até check-in) (0.9 - 1.3)
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilCheckIn < 7) {
      multiplier += 0.2; // Reservas de última hora = mais caras
    } else if (daysUntilCheckIn < 14) {
      multiplier += 0.1;
    } else if (daysUntilCheckIn > 60) {
      multiplier -= 0.1; // Reservas muito antecipadas = desconto
    }

    // Fator dia da semana (0.9 - 1.2)
    const dayOfWeek = checkIn.getDay(); // 0 = domingo, 6 = sábado
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      // Sexta ou sábado
      multiplier += 0.15;
    } else if (dayOfWeek === 0) {
      // Domingo
      multiplier += 0.1;
    } else {
      multiplier -= 0.05; // Dias de semana
    }

    return Math.max(0.7, Math.min(1.5, multiplier)); // Limitar entre 0.7x e 1.5x
  } catch (error: any) {
    console.error('Erro ao calcular multiplicador de demanda:', error);
    return 1.0; // Retornar neutro em caso de erro
  }
}

/**
 * Calcular demanda de mercado baseada em competidores e histórico
 */
async function calculateMarketDemand(
  propertyId: number,
  checkIn: Date,
  competitors: CompetitorPrice[],
  historical: any
): Promise<number> {
  try {
    // 1. Calcular demanda baseada em competidores
    let competitorDemand = 0.5; // Default
    
    if (competitors.length > 0) {
      // Se há muitos competidores com preços similares, demanda é alta
      const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
      const priceVariance = competitors.reduce((sum, c) => sum + Math.pow(c.price - avgCompetitorPrice, 2), 0) / competitors.length;
      
      // Baixa variância = mercado competitivo = alta demanda
      competitorDemand = Math.min(1.0, 0.5 + (1 / (1 + priceVariance / 100)));
    }
    
    // 2. Calcular demanda baseada em histórico
    let historicalDemand = 0.5; // Default
    
    if (historical && historical.booking_count) {
      const bookingCount = parseInt(historical.booking_count || '0');
      // Normalizar: 0-10 bookings = 0.3-0.7, 10+ = 0.7-1.0
      historicalDemand = Math.min(1.0, 0.3 + (bookingCount / 20) * 0.7);
    }
    
    // 3. Combinar ambos (peso 60% histórico, 40% competidores)
    const marketDemand = (historicalDemand * 0.6) + (competitorDemand * 0.4);
    
    return Math.max(0.1, Math.min(1.0, marketDemand)); // Garantir entre 0.1 e 1.0
  } catch (error: any) {
    console.error('Erro ao calcular demanda de mercado:', error);
    return 0.6; // Fallback
  }
}

