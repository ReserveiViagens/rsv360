/**
 * Consultas de drill-down de reservas para Analytics e CRM.
 */

import { queryDatabase } from '@/lib/db';

export interface BookingBreakdownRow {
  id: number;
  booking_code: string;
  item_id: number;
  item_name: string;
  customer_name: string;
  customer_email: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface BookingBreakdownFilters {
  propertyId?: number;
  month?: string;
  startDate?: string;
  endDate?: string;
  customerEmail?: string;
  customerName?: string;
  statuses?: string[];
  limit?: number;
}

const DEFAULT_STATUSES = ['confirmed', 'pending'];

export async function fetchBookingBreakdown(
  filters: BookingBreakdownFilters = {}
): Promise<BookingBreakdownRow[]> {
  const statuses = filters.statuses?.length ? filters.statuses : DEFAULT_STATUSES;
  const params: unknown[] = [];
  let paramIndex = 1;

  let query = `
    SELECT
      b.id,
      b.booking_code,
      b.item_id,
      b.item_name,
      b.customer_name,
      b.customer_email,
      b.start_date,
      b.end_date,
      b.total_amount,
      b.status,
      b.created_at
    FROM bookings b
    WHERE b.status = ANY($${paramIndex}::text[])
  `;
  params.push(statuses);
  paramIndex++;

  if (filters.propertyId) {
    query += ` AND b.item_id = $${paramIndex}`;
    params.push(filters.propertyId);
    paramIndex++;
  }

  if (filters.month) {
    query += ` AND TO_CHAR(DATE_TRUNC('month', b.created_at), 'YYYY-MM') = $${paramIndex}`;
    params.push(filters.month);
    paramIndex++;
  }

  if (filters.startDate) {
    query += ` AND b.start_date::date >= $${paramIndex}::date`;
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    query += ` AND b.start_date::date <= $${paramIndex}::date`;
    params.push(filters.endDate);
    paramIndex++;
  }

  if (filters.customerEmail) {
    query += ` AND LOWER(b.customer_email) = LOWER($${paramIndex})`;
    params.push(filters.customerEmail);
    paramIndex++;
  } else if (filters.customerName) {
    query += ` AND b.customer_name ILIKE $${paramIndex}`;
    params.push(filters.customerName);
    paramIndex++;
  }

  query += ` ORDER BY b.created_at DESC`;

  const limit = filters.limit ?? 50;
  query += ` LIMIT $${paramIndex}`;
  params.push(limit);

  const rows = await queryDatabase(query, params);

  return rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    booking_code: String(row.booking_code || ''),
    item_id: Number(row.item_id),
    item_name: String(row.item_name || ''),
    customer_name: String(row.customer_name || ''),
    customer_email: String(row.customer_email || ''),
    start_date: String(row.start_date),
    end_date: String(row.end_date),
    total_amount: parseFloat(String(row.total_amount || '0')),
    status: String(row.status || ''),
    created_at: String(row.created_at),
  }));
}

export async function fetchPropertySummary(propertyId: number, startDate?: string, endDate?: string) {
  const params: unknown[] = [propertyId];
  let dateFilter = '';

  if (startDate && endDate) {
    dateFilter = ` AND b.created_at BETWEEN $2 AND $3`;
    params.push(startDate, endDate);
  }

  const rows = await queryDatabase(
    `SELECT
       b.item_id AS property_id,
       b.item_name AS property_name,
       COUNT(*) AS bookings,
       COALESCE(SUM(b.total_amount), 0) AS revenue,
       COALESCE(AVG(b.total_amount), 0) AS avg_booking_value
     FROM bookings b
     WHERE b.item_id = $1
     AND b.status IN ('confirmed')
     ${dateFilter}
     GROUP BY b.item_id, b.item_name`,
    params
  );

  return rows[0] || null;
}
