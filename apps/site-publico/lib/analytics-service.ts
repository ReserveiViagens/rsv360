/**
 * ✅ ITENS 55-59: SERVIÇO DE ANALYTICS
 * Dashboards: Receita, Ocupação, Reservas por Canal, Análise de Clientes, Previsões
 */

import { queryDatabase } from './db';

export interface RevenueData {
  period: string; // '2025-01', '2025-01-15', etc.
  revenue: number;
  bookings_count: number;
  average_order_value: number;
  growth_percentage?: number;
}

export interface OccupancyData {
  date: string;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  available_units: number;
}

export interface ChannelData {
  channel: string;
  bookings_count: number;
  revenue: number;
  average_order_value: number;
  conversion_rate: number;
  percentage_of_total: number;
}

export interface CustomerAnalysisData {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  average_lifetime_value: number;
  average_bookings_per_customer: number;
  top_segments: Array<{
    segment_id: number;
    segment_name: string;
    customer_count: number;
    revenue: number;
  }>;
  customer_behavior: {
    preferred_channels: Record<string, number>;
    booking_frequency: Record<string, number>;
    average_stay_duration: number;
  };
}

export interface ForecastData {
  period: string;
  forecasted_revenue: number;
  forecasted_occupancy: number;
  confidence_level: number; // 0-100
  factors: Record<string, any>;
}

/**
 * ✅ ITEM 55: DASHBOARD - RECEITA POR PERÍODO
 */
export async function getRevenueByPeriod(
  filters: {
    period_type?: 'day' | 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
    property_id?: number;
    group_by?: 'day' | 'week' | 'month' | 'year';
  } = {}
): Promise<RevenueData[]> {
  const {
    period_type = 'month',
    date_from,
    date_to,
    property_id,
    group_by = period_type,
  } = filters;

  // Determinar formato de data baseado no group_by
  let dateFormat: string;
  let dateTrunc: string;

  switch (group_by) {
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      dateTrunc = 'day';
      break;
    case 'week':
      dateFormat = 'YYYY-"W"WW';
      dateTrunc = 'week';
      break;
    case 'month':
      dateFormat = 'YYYY-MM';
      dateTrunc = 'month';
      break;
    case 'year':
      dateFormat = 'YYYY';
      dateTrunc = 'year';
      break;
    default:
      dateFormat = 'YYYY-MM';
      dateTrunc = 'month';
  }

  let query = `
    SELECT 
      TO_CHAR(DATE_TRUNC($1, b.created_at), $2) as period,
      COALESCE(SUM(b.total), 0) as revenue,
      COUNT(*) as bookings_count,
      COALESCE(AVG(b.total), 0) as average_order_value
    FROM bookings b
    WHERE b.status = 'confirmed'
  `;

  const params: any[] = [dateTrunc, dateFormat];
  let paramIndex = 3;

  if (date_from) {
    query += ` AND b.created_at >= $${paramIndex}`;
    params.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    query += ` AND b.created_at <= $${paramIndex}`;
    params.push(date_to);
    paramIndex++;
  }

  if (property_id) {
    query += ` AND b.item_id = $${paramIndex}`;
    params.push(property_id);
    paramIndex++;
  }

  query += `
    GROUP BY DATE_TRUNC($1, b.created_at)
    ORDER BY period ASC
  `;

  const result = await queryDatabase(query, params);

  // Calcular crescimento percentual
  const data: RevenueData[] = result.map((row: any, index: number) => {
    const revenue = parseFloat(row.revenue || '0');
    const prevRevenue = index > 0 ? parseFloat(result[index - 1].revenue || '0') : revenue;
    const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      period: row.period,
      revenue,
      bookings_count: parseInt(row.bookings_count || '0'),
      average_order_value: parseFloat(row.average_order_value || '0'),
      growth_percentage: index > 0 ? growth : undefined,
    };
  });

  return data;
}

/**
 * ✅ ITEM 56: DASHBOARD - TAXA DE OCUPAÇÃO
 */
export async function getOccupancyRate(
  filters: {
    date_from: string;
    date_to: string;
    property_id?: number;
  }
): Promise<OccupancyData[]> {
  const { date_from, date_to, property_id } = filters;

  // Buscar todas as propriedades ou uma específica
  let propertiesQuery = `SELECT id FROM properties WHERE 1=1`;
  const propertiesParams: any[] = [];

  if (property_id) {
    propertiesQuery += ` AND id = $1`;
    propertiesParams.push(property_id);
  }

  const properties = await queryDatabase(propertiesQuery, propertiesParams);

  const occupancyData: OccupancyData[] = [];

  for (const property of properties) {
    const propId = property.id;

    // Buscar capacidade total (max_guests ou unidades disponíveis)
    const capacityResult = await queryDatabase(
      `SELECT COALESCE(max_guests, 1) as total_units FROM properties WHERE id = $1`,
      [propId]
    );
    const totalUnits = parseInt(capacityResult[0]?.total_units || '1');

    // Buscar reservas confirmadas no período
    const bookingsResult = await queryDatabase(
      `SELECT 
        DATE(check_in) as date,
        COUNT(*) as occupied_units,
        SUM(total_guests) as total_guests
      FROM bookings
      WHERE status = 'confirmed'
        AND item_id = $1
        AND check_in <= $2
        AND check_out > $3
      GROUP BY DATE(check_in)
      ORDER BY date ASC`,
      [propId, date_to, date_from]
    );

    // Gerar dados para cada data no período
    const startDate = new Date(date_from);
    const endDate = new Date(date_to);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const booking = bookingsResult.find((b: any) => b.date === dateStr);

      const occupiedUnits = booking ? parseInt(booking.occupied_units || '0') : 0;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      occupancyData.push({
        date: dateStr,
        total_units: totalUnits,
        occupied_units: occupiedUnits,
        occupancy_rate: occupancyRate,
        available_units: totalUnits - occupiedUnits,
      });
    }
  }

  return occupancyData;
}

/**
 * ✅ ITEM 57: DASHBOARD - RESERVAS POR CANAL
 */
export async function getBookingsByChannel(
  filters: {
    date_from?: string;
    date_to?: string;
    property_id?: number;
  } = {}
): Promise<ChannelData[]> {
  const { date_from, date_to, property_id } = filters;

  let query = `
    SELECT 
      COALESCE(b.source, 'direct') as channel,
      COUNT(*) as bookings_count,
      COALESCE(SUM(b.total), 0) as revenue,
      COALESCE(AVG(b.total), 0) as average_order_value
    FROM bookings b
    WHERE b.status = 'confirmed'
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (date_from) {
    query += ` AND b.created_at >= $${paramIndex}`;
    params.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    query += ` AND b.created_at <= $${paramIndex}`;
    params.push(date_to);
    paramIndex++;
  }

  if (property_id) {
    query += ` AND b.item_id = $${paramIndex}`;
    params.push(property_id);
    paramIndex++;
  }

  query += `
    GROUP BY COALESCE(b.source, 'direct')
    ORDER BY revenue DESC
  `;

  const result = await queryDatabase(query, params);

  // Calcular totais para percentuais
  const totalRevenue = result.reduce((sum: number, row: any) => sum + parseFloat(row.revenue || '0'), 0);
  const totalBookings = result.reduce((sum: number, row: any) => sum + parseInt(row.bookings_count || '0'), 0);

  // Buscar dados de conversão (se houver tabela de leads/visits)
  // Por enquanto, usar estimativa baseada em bookings
  const data: ChannelData[] = result.map((row: any) => {
    const revenue = parseFloat(row.revenue || '0');
    const bookingsCount = parseInt(row.bookings_count || '0');
    const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    // Conversão estimada (pode ser melhorada com dados reais de visitas)
    const conversionRate = bookingsCount > 0 ? (bookingsCount / (bookingsCount * 10)) * 100 : 0; // Estimativa

    return {
      channel: row.channel,
      bookings_count: bookingsCount,
      revenue,
      average_order_value: parseFloat(row.average_order_value || '0'),
      conversion_rate: conversionRate,
      percentage_of_total: percentage,
    };
  });

  return data;
}

/**
 * ✅ ITEM 58: DASHBOARD - ANÁLISE DE CLIENTES
 */
export async function getCustomerAnalysis(
  filters: {
    date_from?: string;
    date_to?: string;
    segment_id?: number;
  } = {}
): Promise<CustomerAnalysisData> {
  const { date_from, date_to, segment_id } = filters;

  // Total de clientes
  let totalQuery = `SELECT COUNT(DISTINCT customer_id) as total FROM bookings WHERE 1=1`;
  const totalParams: any[] = [];
  let paramIndex = 1;

  if (date_from) {
    totalQuery += ` AND created_at >= $${paramIndex}`;
    totalParams.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    totalQuery += ` AND created_at <= $${paramIndex}`;
    totalParams.push(date_to);
    paramIndex++;
  }

  if (segment_id) {
    totalQuery += ` AND customer_id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $${paramIndex})`;
    totalParams.push(segment_id);
    paramIndex++;
  }

  const totalResult = await queryDatabase(totalQuery, totalParams);
  const total_customers = parseInt(totalResult[0]?.total || '0');

  // Novos clientes (primeira reserva no período)
  const newQuery = totalQuery.replace(
    'COUNT(DISTINCT customer_id)',
    `COUNT(DISTINCT CASE 
      WHEN customer_id IN (
        SELECT customer_id FROM bookings 
        GROUP BY customer_id 
        HAVING MIN(created_at) >= $${paramIndex}
      ) THEN customer_id 
    END)`
  );
  const newParams = [...totalParams, date_from || '1900-01-01'];
  const newResult = await queryDatabase(newQuery, newParams);
  const new_customers = parseInt(newResult[0]?.total || '0');

  const returning_customers = total_customers - new_customers;

  // Lifetime Value médio
  const ltvQuery = `
    SELECT 
      COALESCE(AVG(customer_revenue), 0) as avg_ltv,
      COALESCE(AVG(booking_count), 0) as avg_bookings
    FROM (
      SELECT 
        customer_id,
        SUM(total) as customer_revenue,
        COUNT(*) as booking_count
      FROM bookings
      WHERE status = 'confirmed'
      GROUP BY customer_id
    ) customer_stats
  `;
  const ltvResult = await queryDatabase(ltvQuery, []);
  const average_lifetime_value = parseFloat(ltvResult[0]?.avg_ltv || '0');
  const average_bookings_per_customer = parseFloat(ltvResult[0]?.avg_bookings || '0');

  // Top segmentos
  const segmentsQuery = `
    SELECT 
      s.id as segment_id,
      s.name as segment_name,
      COUNT(DISTINCT cs.customer_id) as customer_count,
      COALESCE(SUM(b.total), 0) as revenue
    FROM segments s
    LEFT JOIN customer_segments cs ON s.id = cs.segment_id
    LEFT JOIN bookings b ON cs.customer_id = b.customer_id AND b.status = 'confirmed'
    WHERE s.is_active = true
    GROUP BY s.id, s.name
    ORDER BY revenue DESC
    LIMIT 5
  `;
  const segmentsResult = await queryDatabase(segmentsQuery, []);

  // Comportamento do cliente
  const behaviorQuery = `
    SELECT 
      COALESCE(source, 'direct') as channel,
      COUNT(*) as booking_count,
      AVG(EXTRACT(EPOCH FROM (check_out::timestamp - check_in::timestamp)) / 86400) as avg_stay_days
    FROM bookings
    WHERE status = 'confirmed'
    GROUP BY COALESCE(source, 'direct')
  `;
  const behaviorResult = await queryDatabase(behaviorQuery, []);

  const preferred_channels: Record<string, number> = {};
  let totalStayDays = 0;
  let totalBookings = 0;

  behaviorResult.forEach((row: any) => {
    preferred_channels[row.channel] = parseInt(row.booking_count || '0');
    totalStayDays += parseFloat(row.avg_stay_days || '0') * parseInt(row.booking_count || '0');
    totalBookings += parseInt(row.booking_count || '0');
  });

  const average_stay_duration = totalBookings > 0 ? totalStayDays / totalBookings : 0;

  // Frequência de reservas
  const frequencyQuery = `
    SELECT 
      CASE
        WHEN booking_count = 1 THEN '1 vez'
        WHEN booking_count BETWEEN 2 AND 3 THEN '2-3 vezes'
        WHEN booking_count BETWEEN 4 AND 6 THEN '4-6 vezes'
        WHEN booking_count > 6 THEN '7+ vezes'
      END as frequency,
      COUNT(*) as customer_count
    FROM (
      SELECT customer_id, COUNT(*) as booking_count
      FROM bookings
      WHERE status = 'confirmed'
      GROUP BY customer_id
    ) customer_freq
    GROUP BY frequency
  `;
  const frequencyResult = await queryDatabase(frequencyQuery, []);

  const booking_frequency: Record<string, number> = {};
  frequencyResult.forEach((row: any) => {
    booking_frequency[row.frequency] = parseInt(row.customer_count || '0');
  });

  return {
    total_customers,
    new_customers,
    returning_customers,
    average_lifetime_value,
    average_bookings_per_customer,
    top_segments: segmentsResult as any,
    customer_behavior: {
      preferred_channels,
      booking_frequency,
      average_stay_duration,
    },
  };
}

/**
 * ✅ ITEM 59: DASHBOARD - PREVISÕES
 */
export async function getForecasts(
  filters: {
    period_type?: 'day' | 'week' | 'month';
    periods_ahead?: number;
    property_id?: number;
  } = {}
): Promise<ForecastData[]> {
  const {
    period_type = 'month',
    periods_ahead = 6,
    property_id,
  } = filters;

  // Buscar dados históricos para análise
  const historicalData = await getRevenueByPeriod({
    period_type,
    date_from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    property_id,
    group_by: period_type,
  });

  // Calcular média móvel e tendência
  const forecasts: ForecastData[] = [];

  if (historicalData.length > 0) {
    // Calcular média dos últimos 3 períodos
    const recentPeriods = historicalData.slice(-3);
    const avgRevenue = recentPeriods.reduce((sum, p) => sum + p.revenue, 0) / recentPeriods.length;

    // Calcular tendência (crescimento médio)
    const growthRates = historicalData
      .filter((p) => p.growth_percentage !== undefined)
      .map((p) => p.growth_percentage!);
    const avgGrowth = growthRates.length > 0
      ? growthRates.reduce((sum, g) => sum + g, 0) / growthRates.length
      : 0;

    // Gerar previsões
    for (let i = 1; i <= periods_ahead; i++) {
      const forecastedRevenue = avgRevenue * (1 + avgGrowth / 100) ** i;
      
      // Previsão de ocupação baseada em receita (estimativa)
      const avgPricePerNight = recentPeriods.reduce((sum, p) => sum + p.average_order_value, 0) / recentPeriods.length;
      const forecastedOccupancy = avgPricePerNight > 0 ? (forecastedRevenue / avgPricePerNight) / 30 : 0; // Estimativa mensal

      // Calcular período
      let period: string;
      const lastPeriod = historicalData[historicalData.length - 1].period;
      
      if (period_type === 'month') {
        const [year, month] = lastPeriod.split('-').map(Number);
        const nextDate = new Date(year, month - 1 + i, 1);
        period = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (period_type === 'week') {
        // Simplificado - pode ser melhorado
        period = `Week ${i}`;
      } else {
        // day
        const nextDate = new Date(lastPeriod);
        nextDate.setDate(nextDate.getDate() + i);
        period = nextDate.toISOString().split('T')[0];
      }

      // Nível de confiança diminui com o tempo
      const confidence_level = Math.max(100 - (i * 10), 30);

      forecasts.push({
        period,
        forecasted_revenue: forecastedRevenue,
        forecasted_occupancy: Math.min(forecastedOccupancy, 100), // Cap em 100%
        confidence_level,
        factors: {
          historical_average: avgRevenue,
          growth_rate: avgGrowth,
          periods_analyzed: historicalData.length,
        },
      });
    }
  }

  return forecasts;
}

