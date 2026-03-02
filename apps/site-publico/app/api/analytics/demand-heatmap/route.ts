/**
 * ✅ FASE 4: API DE MAPA DE CALOR DE DEMANDA
 * GET /api/analytics/demand-heatmap - Mapa de calor de demanda por data
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end_date = searchParams.get('end_date') || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const property_id = searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined;

    // Buscar reservas por data
    let query = `
      SELECT 
        DATE(check_in) as date,
        COUNT(*) as bookings_count,
        SUM(total) as revenue,
        AVG(total) as avg_booking_value
      FROM bookings
      WHERE status IN ('confirmed', 'completed', 'pending')
        AND check_in >= $1::DATE
        AND check_in <= $2::DATE
    `;
    const params: any[] = [start_date, end_date];
    let paramIndex = 3;

    if (property_id) {
      query += ` AND item_id = $${paramIndex}`;
      params.push(property_id);
      paramIndex++;
    }

    query += `
      GROUP BY DATE(check_in)
      ORDER BY date ASC
    `;

    const data = await queryDatabase(query, params);

    // Calcular níveis de demanda (0-100)
    const maxBookings = Math.max(...data.map((row: any) => parseInt(row.bookings_count || 0)), 1);
    const heatmapData = data.map((row: any) => ({
      date: row.date,
      bookings: parseInt(row.bookings_count || 0),
      revenue: parseFloat(row.revenue || 0),
      avg_value: parseFloat(row.avg_booking_value || 0),
      demand_level: Math.round((parseInt(row.bookings_count || 0) / maxBookings) * 100),
      intensity: parseInt(row.bookings_count || 0) > maxBookings * 0.8 ? 'high' :
                 parseInt(row.bookings_count || 0) > maxBookings * 0.5 ? 'medium' : 'low',
    }));

    return NextResponse.json({
      success: true,
      data: {
        heatmap: heatmapData,
        max_demand: maxBookings,
        date_range: {
          start: start_date,
          end: end_date,
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar mapa de calor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar mapa de calor' },
      { status: 500 }
    );
  }
}

