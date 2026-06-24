/**
 * API de analytics — dashboard alinhado ao schema S2 (bookings.item_id, start_date).
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { cacheGetOrSet } from '@/lib/redis-cache';

const REVENUE_STATUSES = "('confirmed')";

function itemFilter(propertyId?: string | null, paramIndex = 3): string {
  return propertyId ? `AND item_id = $${paramIndex}` : '';
}

function buildParams(
  startDate: string,
  endDate: string,
  propertyId?: string | null,
  extra: unknown[] = []
): unknown[] {
  const base = propertyId
    ? [startDate, endDate, parseInt(propertyId, 10), ...extra]
    : [startDate, endDate, ...extra];
  return base;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get('start_date') ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();
    const propertyId = searchParams.get('property_id');

    const cacheKey = `analytics:dashboard:${startDate}:${endDate}:${propertyId || 'all'}`;

    const data = await cacheGetOrSet(
      cacheKey,
      async () => {
        const kpis = await getKPIs(startDate, endDate, propertyId);
        const revenue = await getRevenueData(startDate, endDate, propertyId);
        const occupancy = await getOccupancyData(startDate, endDate, propertyId);
        const bookingsByStatus = await getBookingsByStatus(startDate, endDate, propertyId);
        const topProperties = await getTopProperties(startDate, endDate);
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
      300
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

async function getKPIs(startDate: string, endDate: string, propertyId?: string | null) {
  const filter = itemFilter(propertyId);
  const params = buildParams(startDate, endDate, propertyId);

  const [revenue, bookings, occupancy, avgBooking] = await Promise.all([
    queryDatabase(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ${REVENUE_STATUSES}
       ${filter}`,
      params
    ),
    queryDatabase(
      `SELECT COUNT(*) as total
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       ${filter}`,
      params
    ),
    queryDatabase(
      `SELECT COALESCE(AVG(daily_rate), 0) as avg
       FROM (
         SELECT
           d.date,
           COUNT(DISTINCT b.item_id) * 100.0 /
             NULLIF(GREATEST(iu.total_items, 1), 0) AS daily_rate
         FROM generate_series($1::date, $2::date, '1 day'::interval) AS d(date)
         CROSS JOIN (
           SELECT COUNT(DISTINCT item_id) AS total_items
           FROM bookings
           WHERE status IN ${REVENUE_STATUSES}
           ${filter}
         ) iu
         LEFT JOIN bookings b
           ON b.start_date::date <= d.date
           AND b.end_date::date > d.date
           AND b.status IN ${REVENUE_STATUSES}
           ${propertyId ? 'AND b.item_id = $3' : ''}
         GROUP BY d.date, iu.total_items
       ) sub`,
      params
    ),
    queryDatabase(
      `SELECT COALESCE(AVG(total_amount), 0) as avg
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ${REVENUE_STATUSES}
       ${filter}`,
      params
    ),
  ]);

  return {
    totalRevenue: parseFloat(revenue[0]?.total || '0'),
    totalBookings: parseInt(bookings[0]?.total || '0', 10),
    avgOccupancy: parseFloat(occupancy[0]?.avg || '0'),
    avgBookingValue: parseFloat(avgBooking[0]?.avg || '0'),
  };
}

async function getRevenueData(startDate: string, endDate: string, propertyId?: string | null) {
  const filter = itemFilter(propertyId);
  const params = buildParams(startDate, endDate, propertyId);

  return queryDatabase(
    `SELECT
       DATE(created_at) as date,
       SUM(total_amount) as revenue,
       COUNT(*) as bookings
     FROM bookings
     WHERE created_at BETWEEN $1 AND $2
     AND status IN ${REVENUE_STATUSES}
     ${filter}
     GROUP BY DATE(created_at)
     ORDER BY date`,
    params
  );
}

async function getOccupancyData(startDate: string, endDate: string, propertyId?: string | null) {
  const params = buildParams(startDate, endDate, propertyId);

  return queryDatabase(
    `SELECT
       d.date,
       GREATEST(iu.total_items, 1) AS total_properties,
       COUNT(DISTINCT b.item_id) AS booked_properties,
       COUNT(DISTINCT b.item_id) * 100.0 /
         NULLIF(GREATEST(iu.total_items, 1), 0) AS occupancy_rate
     FROM generate_series($1::date, $2::date, '1 day'::interval) AS d(date)
     CROSS JOIN (
       SELECT COUNT(DISTINCT item_id) AS total_items
       FROM bookings
       WHERE status IN ${REVENUE_STATUSES}
       ${itemFilter(propertyId)}
     ) iu
     LEFT JOIN bookings b
       ON b.start_date::date <= d.date
       AND b.end_date::date > d.date
       AND b.status IN ${REVENUE_STATUSES}
       ${propertyId ? 'AND b.item_id = $3' : ''}
     GROUP BY d.date, iu.total_items
     ORDER BY d.date`,
    params
  );
}

async function getBookingsByStatus(
  startDate: string,
  endDate: string,
  propertyId?: string | null
) {
  const filter = itemFilter(propertyId);
  const params = buildParams(startDate, endDate, propertyId);

  return queryDatabase(
    `SELECT
       status,
       COUNT(*) as count,
       SUM(total_amount) as revenue
     FROM bookings
     WHERE created_at BETWEEN $1 AND $2
     ${filter}
     GROUP BY status
     ORDER BY count DESC`,
    params
  );
}

async function getTopProperties(startDate: string, endDate: string, limit = 10) {
  return queryDatabase(
    `SELECT
       b.item_id AS property_id,
       b.item_name AS property_name,
       COUNT(*) AS bookings,
       SUM(b.total_amount) AS revenue,
       AVG(b.total_amount) AS avg_booking_value
     FROM bookings b
     WHERE b.created_at BETWEEN $1 AND $2
     AND b.status IN ${REVENUE_STATUSES}
     GROUP BY b.item_id, b.item_name
     ORDER BY revenue DESC
     LIMIT $3`,
    [startDate, endDate, limit]
  );
}

async function getPeriodComparison(
  startDate: string,
  endDate: string,
  propertyId?: string | null
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - daysDiff);
  const previousEnd = new Date(start);

  const filter = itemFilter(propertyId);
  const currentParams = buildParams(startDate, endDate, propertyId);
  const previousParams = propertyId
    ? [previousStart.toISOString(), previousEnd.toISOString(), parseInt(propertyId, 10)]
    : [previousStart.toISOString(), previousEnd.toISOString()];

  const [current, previous] = await Promise.all([
    queryDatabase(
      `SELECT
         COUNT(*) as bookings,
         SUM(total_amount) as revenue
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ${REVENUE_STATUSES}
       ${filter}`,
      currentParams
    ),
    queryDatabase(
      `SELECT
         COUNT(*) as bookings,
         SUM(total_amount) as revenue
       FROM bookings
       WHERE created_at BETWEEN $1 AND $2
       AND status IN ${REVENUE_STATUSES}
       ${filter}`,
      previousParams
    ),
  ]);

  const currentData = current[0];
  const previousData = previous[0];

  const bookingChange = previousData?.bookings
    ? ((parseInt(currentData?.bookings || '0', 10) - parseInt(previousData.bookings, 10)) /
        parseInt(previousData.bookings, 10)) *
      100
    : 0;

  const revenueChange = previousData?.revenue
    ? ((parseFloat(currentData?.revenue || '0') - parseFloat(previousData.revenue)) /
        parseFloat(previousData.revenue)) *
      100
    : 0;

  return {
    bookings: {
      current: parseInt(currentData?.bookings || '0', 10),
      previous: parseInt(previousData?.bookings || '0', 10),
      change: bookingChange,
    },
    revenue: {
      current: parseFloat(currentData?.revenue || '0'),
      previous: parseFloat(previousData?.revenue || '0'),
      change: revenueChange,
    },
  };
}
