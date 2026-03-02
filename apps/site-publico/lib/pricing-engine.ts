import { addDays, isWeekend, differenceInDays, format } from 'date-fns';

// NOTA: Este arquivo é usado tanto no cliente quanto no servidor
// Não importe 'pg' aqui diretamente - use APIs para buscar dados do banco

// Eventos Nacionais 2025-2026 (feriados + grandes eventos)
const NATIONAL_EVENTS_2025_2026 = [
  { name: 'Confraternização Universal', start: '2025-01-01', end: '2025-01-01', multiplier: 2.0 },
  { name: 'Carnaval', start: '2025-03-03', end: '2025-03-04', multiplier: 2.8 },
  { name: 'Paixão de Cristo', start: '2025-04-18', end: '2025-04-18', multiplier: 2.2 },
  { name: 'Tiradentes', start: '2025-04-21', end: '2025-04-21', multiplier: 1.8 },
  { name: 'Dia do Trabalho', start: '2025-05-01', end: '2025-05-01', multiplier: 1.9 },
  { name: 'Corpus Christi', start: '2025-06-19', end: '2025-06-19', multiplier: 2.0 },
  { name: 'Independência', start: '2025-09-07', end: '2025-09-07', multiplier: 2.1 },
  { name: 'Nossa Senhora Aparecida', start: '2025-10-12', end: '2025-10-12', multiplier: 1.7 },
  { name: 'Finados', start: '2025-11-02', end: '2025-11-02', multiplier: 1.8 },
  { name: 'Proclamação República', start: '2025-11-15', end: '2025-11-15', multiplier: 1.6 },
  { name: 'Consciência Negra', start: '2025-11-20', end: '2025-11-20', multiplier: 1.5 },
  { name: 'Natal', start: '2025-12-25', end: '2025-12-25', multiplier: 2.5 },
  // 2026
  { name: 'Ano Novo 2026', start: '2026-01-01', end: '2026-01-01', multiplier: 3.0 },
  { name: 'Carnaval 2026', start: '2026-02-16', end: '2026-02-17', multiplier: 2.8 },
  { name: 'Paixão de Cristo 2026', start: '2026-04-03', end: '2026-04-03', multiplier: 2.2 },
  { name: 'Tiradentes 2026', start: '2026-04-21', end: '2026-04-21', multiplier: 1.8 },
  { name: 'Dia do Trabalho 2026', start: '2026-05-01', end: '2026-05-01', multiplier: 1.9 },
  { name: 'Corpus Christi 2026', start: '2026-06-04', end: '2026-06-04', multiplier: 2.0 },
  { name: 'Independência 2026', start: '2026-09-07', end: '2026-09-07', multiplier: 2.1 },
  { name: 'Nossa Senhora Aparecida 2026', start: '2026-10-12', end: '2026-10-12', multiplier: 1.7 },
  { name: 'Finados 2026', start: '2026-11-02', end: '2026-11-02', multiplier: 1.8 },
  { name: 'Proclamação República 2026', start: '2026-11-15', end: '2026-11-15', multiplier: 1.6 },
  { name: 'Consciência Negra 2026', start: '2026-11-20', end: '2026-11-20', multiplier: 1.5 },
  { name: 'Natal 2026', start: '2026-12-25', end: '2026-12-25', multiplier: 2.5 },
];

// Eventos Específicos Caldas Novas
const CALDAS_EVENTS = [
  { name: 'Caldas Country Festival', start: '2025-11-21', end: '2025-11-22', multiplier: 2.2 },
  { name: 'Caldas Paradise Réveillon', start: '2025-12-31', end: '2026-01-02', multiplier: 3.5 },
  { name: 'Caldas Rodeo Festival', start: '2025-09-11', end: '2025-09-13', multiplier: 2.0 },
  { name: 'Carnaval Caldas Novas', start: '2025-02-28', end: '2025-03-04', multiplier: 2.8 },
  { name: 'Natal na Praça', start: '2025-12-01', end: '2025-12-02', multiplier: 1.8 },
  { name: 'Festa do Divino', start: '2025-05-21', end: '2025-05-21', multiplier: 1.9 },
  { name: 'Caldas Country Show', start: '2025-10-01', end: '2025-10-05', multiplier: 2.1 },
  { name: 'Water Park Events', start: '2025-12-01', end: '2026-03-31', multiplier: 1.5 },
  { name: 'Feriado Municipal Fundação', start: '2025-11-21', end: '2025-11-21', multiplier: 1.7 },
  { name: 'Semana das Águas Quentes', start: '2025-06-15', end: '2025-06-22', multiplier: 2.0 },
  { name: 'Expo Caldas', start: '2025-08-01', end: '2025-08-05', multiplier: 1.6 },
  { name: 'Festival de Inverno Caldas', start: '2025-07-01', end: '2025-07-10', multiplier: 2.3 },
  { name: 'Corpus Christi Local', start: '2025-06-19', end: '2025-06-19', multiplier: 1.8 },
  { name: 'São João Caldas', start: '2025-06-24', end: '2025-06-24', multiplier: 1.9 },
  { name: 'Dia das Mães/Pais Eventos', start: '2025-05-11', end: '2025-05-11', multiplier: 1.4 },
];

const ALL_EVENTS = [...NATIONAL_EVENTS_2025_2026, ...CALDAS_EVENTS];

// Comparação de Preços Inteligente (Mock - integre API real)
// Esta função não precisa de banco, pode ser usada no cliente
async function getCompetitorPrices(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  city: string = 'Caldas Novas'
): Promise<number> {
  // Mock: Simula scraping de Booking/Airbnb para Caldas Novas
  // Real: Use ScrapingBee API: fetch(`https://app.scrapingbee.com/api/v1/?api_key=${key}&url=...`)
  const mockPrices = [
    { source: 'Booking', avg: 450 }, // Preços médios Caldas Novas
    { source: 'Airbnb', avg: 420 },
    { source: 'TemporadaLivre', avg: 380 },
  ];
  const avgCompetitor = mockPrices.reduce((sum, p) => sum + p.avg, 0) / mockPrices.length;
  return avgCompetitor * 1.15; // Markup RSV 15%
}

// Buscar eventos do banco de dados (via API)
async function getEventsFromDB(
  checkIn: Date,
  checkOut: Date,
  city?: string,
  state?: string
): Promise<Array<{ name: string; multiplier: number }>> {
  try {
    // Chamar API ao invés de acessar banco diretamente
    const params = new URLSearchParams({
      start_date: format(checkIn, 'yyyy-MM-dd'),
      end_date: format(checkOut, 'yyyy-MM-dd'),
    });
    if (city) params.append('city', city);
    if (state) params.append('state', state);

    const response = await fetch(`/api/events?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      return data.events || [];
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
}

// Calcular ocupação atual (via API)
async function getCurrentOccupancy(propertyId: number, checkIn: Date, checkOut: Date): Promise<number> {
  try {
    const params = new URLSearchParams({
      property_id: propertyId.toString(),
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
    });

    const response = await fetch(`/api/properties/${propertyId}/occupancy?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      return data.occupancy || 0.6;
    }
    return 0.6; // Default 60%
  } catch (error) {
    console.error('Erro ao calcular ocupação:', error);
    return 0.6; // Default 60%
  }
}

export interface PriceBreakdown {
  base: number;
  multipliers: Array<{ type: string; factor: number; description: string }>;
  competitor?: { avg: number; adjusted: number };
  final: number;
}

export interface CalculateSmartPriceOptions {
  basePrice: number;
  checkIn: Date;
  checkOut: Date;
  propertyId?: number;
  propertyCity?: string;
  propertyState?: string;
  currentOccupancy?: number;
  enableCompetitorComparison?: boolean;
}

export async function calculateSmartPrice(
  options: CalculateSmartPriceOptions
): Promise<{ price: number; breakdown: PriceBreakdown }> {
  const {
    basePrice,
    checkIn,
    checkOut,
    propertyId,
    propertyCity = 'Caldas Novas',
    propertyState = 'GO',
    currentOccupancy,
    enableCompetitorComparison = false,
  } = options;

  let multiplier = 1;
  const breakdown: PriceBreakdown = {
    base: basePrice,
    multipliers: [],
  };

  // 1. Evento (nacional + local) - Buscar do banco primeiro, depois fallback para array
  const dbEvents = await getEventsFromDB(checkIn, checkOut, propertyCity, propertyState);
  let eventMultiplier = 1;
  
  if (dbEvents.length > 0) {
    eventMultiplier = dbEvents[0].multiplier;
    breakdown.multipliers.push({
      type: 'event',
      factor: eventMultiplier,
      description: `Evento: ${dbEvents[0].name}`,
    });
  } else {
    // Fallback para array local
    const event = ALL_EVENTS.find(
      (e) => checkIn >= new Date(e.start) && checkIn <= addDays(new Date(e.end), 3)
    );
    if (event) {
      eventMultiplier = event.multiplier;
      breakdown.multipliers.push({
        type: 'event',
        factor: eventMultiplier,
        description: `Evento: ${event.name}`,
      });
    }
  }
  
  multiplier *= eventMultiplier;

  // 2. Fim de semana
  if (isWeekend(checkIn)) {
    multiplier *= 1.4;
    breakdown.multipliers.push({
      type: 'weekend',
      factor: 1.4,
      description: 'Fim de semana',
    });
  }

  // 3. Ocupação
  let occupancy = currentOccupancy;
  if (occupancy === undefined && propertyId) {
    occupancy = await getCurrentOccupancy(propertyId, checkIn, checkOut);
  }
  occupancy = occupancy || 0.6;
  
  if (occupancy > 0.8) {
    multiplier *= 1.3;
    breakdown.multipliers.push({
      type: 'occupancy',
      factor: 1.3,
      description: `Ocupação alta (${Math.round(occupancy * 100)}%)`,
    });
  }

  // 4. Lead time (last minute)
  const daysUntilCheckIn = differenceInDays(checkIn, new Date());
  if (daysUntilCheckIn < 7) {
    multiplier *= 1.5;
    breakdown.multipliers.push({
      type: 'lead_time',
      factor: 1.5,
      description: `Last minute (${daysUntilCheckIn} dias)`,
    });
  }

  // 5. Descontos long stay
  const nights = differenceInDays(checkOut, checkIn);
  if (nights >= 30) {
    multiplier *= 0.7;
    breakdown.multipliers.push({
      type: 'long_stay',
      factor: 0.7,
      description: `Estadia longa (${nights} noites) - 30% OFF`,
    });
  } else if (nights >= 7) {
    multiplier *= 0.85;
    breakdown.multipliers.push({
      type: 'long_stay',
      factor: 0.85,
      description: `Estadia semanal (${nights} noites) - 15% OFF`,
    });
  }

  let dynamicPrice = Math.round(basePrice * multiplier);

  // 6. Comparação Inteligente (opcional)
  if (enableCompetitorComparison && propertyId) {
    const competitorAvg = await getCompetitorPrices(propertyId.toString(), checkIn, checkOut, propertyCity);
    const adjustedPrice = Math.min(dynamicPrice, competitorAvg); // Competitivo
    breakdown.competitor = {
      avg: competitorAvg,
      adjusted: adjustedPrice,
    };
    dynamicPrice = adjustedPrice;
  }

  // Limites de segurança
  const minPrice = basePrice * 0.5; // Não menos que 50% do preço base
  const maxPrice = basePrice * 4; // Não mais que 400% do preço base
  const finalPrice = Math.max(minPrice, Math.min(dynamicPrice, maxPrice));
  
  breakdown.final = finalPrice;

  return { price: finalPrice, breakdown };
}

// Função auxiliar para calcular preço por noite
export async function calculatePricePerNight(
  options: CalculateSmartPriceOptions
): Promise<{ pricePerNight: number; totalNights: number; totalPrice: number; breakdown: PriceBreakdown }> {
  const { checkIn, checkOut } = options;
  const nights = differenceInDays(checkOut, checkIn);
  
  const { price, breakdown } = await calculateSmartPrice(options);
  
  return {
    pricePerNight: price,
    totalNights: nights,
    totalPrice: price * nights,
    breakdown,
  };
}

// Função para obter preços de um período (útil para calendário)
export async function getPricesForPeriod(
  propertyId: number,
  basePrice: number,
  startDate: Date,
  endDate: Date,
  propertyCity?: string,
  propertyState?: string
): Promise<Array<{ date: string; price: number; breakdown: PriceBreakdown }>> {
  const prices: Array<{ date: string; price: number; breakdown: PriceBreakdown }> = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const nextDate = addDays(currentDate, 1);
    const { price, breakdown } = await calculateSmartPrice({
      basePrice,
      checkIn: currentDate,
      checkOut: nextDate,
      propertyId,
      propertyCity,
      propertyState,
    });
    
    prices.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      price: typeof price === 'number' && !isNaN(price) ? price : basePrice,
      breakdown,
    });
    
    currentDate = nextDate;
  }
  
  return prices;
}

