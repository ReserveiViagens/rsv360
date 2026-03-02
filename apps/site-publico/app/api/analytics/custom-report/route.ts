/**
 * ✅ FASE 4: API DE RELATÓRIO CUSTOMIZADO
 * POST /api/analytics/custom-report - Gerar relatório customizado
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      start_date,
      end_date,
      property_ids,
      metrics,
      group_by,
      format = 'json',
    } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'start_date e end_date são obrigatórios' },
        { status: 400 }
      );
    }

    // Construir query dinâmica baseada nos parâmetros
    let query = `
      SELECT 
    `;

    const selectFields: string[] = [];
    
    if (metrics.includes('bookings') || !metrics || metrics.length === 0) {
      selectFields.push('COUNT(*) as total_bookings');
    }
    if (metrics.includes('revenue') || !metrics || metrics.length === 0) {
      selectFields.push('SUM(total) as total_revenue');
    }
    if (metrics.includes('avg_value') || !metrics || metrics.length === 0) {
      selectFields.push('AVG(total) as avg_booking_value');
    }
    if (metrics.includes('occupancy') || !metrics || metrics.length === 0) {
      selectFields.push('COUNT(DISTINCT DATE(check_in)) as occupied_days');
    }

    query += selectFields.join(', ');

    query += `
      FROM bookings
      WHERE status IN ('confirmed', 'completed')
        AND created_at >= $1::DATE
        AND created_at <= $2::DATE
    `;

    const params: any[] = [start_date, end_date];
    let paramIndex = 3;

    if (property_ids && property_ids.length > 0) {
      query += ` AND item_id = ANY($${paramIndex}::INTEGER[])`;
      params.push(property_ids);
      paramIndex++;
    }

    if (group_by === 'day') {
      query += ` GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`;
    } else if (group_by === 'week') {
      query += ` GROUP BY DATE_TRUNC('week', created_at) ORDER BY DATE_TRUNC('week', created_at) ASC`;
    } else if (group_by === 'month') {
      query += ` GROUP BY DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at) ASC`;
    } else if (group_by === 'property') {
      query += ` GROUP BY item_id ORDER BY item_id ASC`;
    }

    const data = await queryDatabase(query, params);

    return NextResponse.json({
      success: true,
      data: {
        report: data,
        parameters: {
          start_date,
          end_date,
          property_ids,
          metrics,
          group_by,
          format,
        },
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório customizado:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar relatório customizado' },
      { status: 500 }
    );
  }
}

