/**
 * ✅ API DE ANALYTICS AVANÇADO
 * 
 * Endpoint para dashboard de analytics com:
 * - KPIs em tempo real
 * - Gráficos de receita
 * - Análise de ocupação
 * - Comparações temporais
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { cacheGetOrSet } from '@/lib/redis-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();
    const propertyId = searchParams.get('property_id');

    // Cache key
    const cacheKey = `analytics:dashboard:${startDate}:${endDate}:${propertyId || 'all'}`;

    const data = await cacheGetOrSet(
      cacheKey,
      async () => {
        // KPIs principais
        const kpis = await getKPIs(startDate, endDate, propertyId);
        
        // Receita por período
        const revenue = await getRevenueData(startDate, endDate, propertyId);
        
        // Ocupação
        const occupancy = await getOccupancyData(startDate, endDate, propertyId);
        
        // Reservas por status
        const bookingsByStatus = await getBookingsByStatus(startDate, endDate, propertyId);
        
        // Top propriedades
        const topProperties = await getTopProperties(startDate, endDate);
        
        // Comparação período anterior
        const comparison = await getPeriodComparison(startDate, endDate, propertyId);

        return {
          kpis,
          revenue,
          occupancy,
          bookingsByStatus,
          topProperties,
          comparison,
        };
      },
      300 // Cache por 5 minutos
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getKPIs(startDate: string, endDate: string, propertyId?: string | null) {
  const propertyFilter = propertyId ? 'AND property_id = $3' : '';
  const params = propertyId ? [startDate, endDate, propertyId] : [startDate, endDate];

  const [revenue, bookings, occupancy, avgBooking] = await Promise.all([
    // Receita total
    queryDatabase(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ('confirmed', 'completed')
       ${propertyFilter}`,
      params
    ),
    // Total de reservas
    queryDatabase(
      `SELECT COUNT(*) as total
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       ${propertyFilter}`,
      params
    ),
    // Taxa de ocupação média
    queryDatabase(
      `SELECT COALESCE(AVG(occupancy_rate), 0) as avg
       FROM (
         SELECT 
           property_id,
           COUNT(*) * 100.0 / NULLIF((
             SELECT COUNT(DISTINCT date)
             FROM availability
             WHERE property_id = bookings.property_id
             AND date BETWEEN $1::date AND $2::date
           ), 0) as occupancy_rate
         FROM bookings
         WHERE check_in BETWEEN $1::date AND $2::date
         AND status IN ('confirmed', 'completed')
         ${propertyFilter}
         GROUP BY property_id
       ) sub`,
      params
    ),
    // Ticket médio
    queryDatabase(
      `SELECT COALESCE(AVG(total_amount), 0) as avg
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ('confirmed', 'completed')
       ${propertyFilter}`,
      params
    ),
  ]);

  return {
    totalRevenue: parseFloat(revenue[0]?.total || '0'),
    totalBookings: parseInt(bookings[0]?.total || '0'),
    avgOccupancy: parseFloat(occupancy[0]?.avg || '0'),
    avgBookingValue: parseFloat(avgBooking[0]?.avg || '0'),
  };
}

async function getRevenueData(startDate: string, endDate: string, propertyId?: string | null) {
  const propertyFilter = propertyId ? 'AND property_id = $3' : '';
  const params = propertyId ? [startDate, endDate, propertyId] : [startDate, endDate];

  const data = await queryDatabase(
    `SELECT 
       DATE(created_at) as date,
       SUM(total_amount) as revenue,
       COUNT(*) as bookings
     FROM bookings
     WHERE created_at BETWEEN $1 AND $2
     AND status IN ('confirmed', 'completed')
     ${propertyFilter}
     GROUP BY DATE(created_at)
     ORDER BY date`,
    params
  );

  return data;
}

async function getOccupancyData(startDate: string, endDate: string, propertyId?: string | null) {
  const propertyFilter = propertyId ? 'AND a.property_id = $3' : '';
  const params = propertyId ? [startDate, endDate, propertyId] : [startDate, endDate];

  const data = await queryDatabase(
    `SELECT 
       DATE(a.date) as date,
       COUNT(DISTINCT a.property_id) as total_properties,
       COUNT(DISTINCT CASE WHEN a.is_available = false THEN a.property_id END) as booked_properties,
       (COUNT(DISTINCT CASE WHEN a.is_available = false THEN a.property_id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT a.property_id), 0)) as occupancy_rate
     FROM availability a
     WHERE a.date BETWEEN $1::date AND $2::date
     ${propertyFilter}
     GROUP BY DATE(a.date)
     ORDER BY date`,
    params
  );

  return data;
}

async function getBookingsByStatus(startDate: string, endDate: string, propertyId?: string | null) {
  const propertyFilter = propertyId ? 'AND property_id = $3' : '';
  const params = propertyId ? [startDate, endDate, propertyId] : [startDate, endDate];

  const data = await queryDatabase(
    `SELECT 
       status,
       COUNT(*) as count,
       SUM(total_amount) as revenue
     FROM bookings
     WHERE created_at BETWEEN $1 AND $2
     ${propertyFilter}
     GROUP BY status
     ORDER BY count DESC`,
    params
  );

  return data;
}

async function getTopProperties(startDate: string, endDate: string, limit: number = 10) {
  const data = await queryDatabase(
    `SELECT 
       b.property_id,
       p.name as property_name,
       COUNT(*) as bookings,
       SUM(b.total_amount) as revenue,
       AVG(b.total_amount) as avg_booking_value
     FROM bookings b
     LEFT JOIN properties p ON b.property_id = p.id
     WHERE b.created_at BETWEEN $1 AND $2
     AND b.status IN ('confirmed', 'completed')
     GROUP BY b.property_id, p.name
     ORDER BY revenue DESC
     LIMIT $3`,
    [startDate, endDate, limit]
  );

  return data;
}

async function getPeriodComparison(startDate: string, endDate: string, propertyId?: string | null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - daysDiff);
  const previousEnd = new Date(start);

  const propertyFilter = propertyId ? 'AND property_id = $3' : '';
  const params = propertyId 
    ? [startDate, endDate, previousStart.toISOString(), previousEnd.toISOString(), propertyId]
    : [startDate, endDate, previousStart.toISOString(), previousEnd.toISOString()];

  const [current, previous] = await Promise.all([
    queryDatabase(
      `SELECT 
         COUNT(*) as bookings,
         SUM(total_amount) as revenue
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ('confirmed', 'completed')
       ${propertyFilter}`,
      propertyId ? [startDate, endDate, propertyId] : [startDate, endDate]
    ),
    queryDatabase(
      `SELECT 
         COUNT(*) as bookings,
         SUM(total_amount) as revenue
       FROM bookings
       WHERE created_at BETWEEN $3 AND $4
       AND status IN ('confirmed', 'completed')
       ${propertyFilter}`,
      params
    ),
  ]);

  const currentData = current[0];
  const previousData = previous[0];

  const bookingChange = previousData?.bookings 
    ? ((parseInt(currentData?.bookings || '0') - parseInt(previousData.bookings)) / parseInt(previousData.bookings)) * 100
    : 0;

  const revenueChange = previousData?.revenue
    ? ((parseFloat(currentData?.revenue || '0') - parseFloat(previousData.revenue)) / parseFloat(previousData.revenue)) * 100
    : 0;

  return {
    bookings: {
      current: parseInt(currentData?.bookings || '0'),
      previous: parseInt(previousData?.bookings || '0'),
      change: bookingChange,
    },
    revenue: {
      current: parseFloat(currentData?.revenue || '0'),
      previous: parseFloat(previousData?.revenue || '0'),
      change: revenueChange,
    },
  };
}

