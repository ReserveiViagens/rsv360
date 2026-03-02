/**
 * ✅ TAREFA HIGH-3: API para Relatórios de ROI de Precificação
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateROI,
  getROISummary,
  getROIHistory,
  recordROIMetric,
} from '@/lib/roi-reporting-service';

/**
 * GET /api/pricing/roi
 * Obter relatório de ROI
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('property_id');
    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'property_id é obrigatório',
        },
        { status: 400 }
      );
    }

    if (periodStart && periodEnd) {
      // Obter resumo para período específico
      const summary = await getROISummary(
        parseInt(propertyId),
        new Date(periodStart),
        new Date(periodEnd)
      );

      return NextResponse.json({
        success: true,
        data: summary,
      });
    } else {
      // Obter histórico
      const history = await getROIHistory(parseInt(propertyId));

      return NextResponse.json({
        success: true,
        data: history,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao obter relatório de ROI',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pricing/roi
 * Calcular ROI para um período
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, period_start, period_end } = body;

    if (!property_id || !period_start || !period_end) {
      return NextResponse.json(
        {
          success: false,
          error: 'property_id, period_start e period_end são obrigatórios',
        },
        { status: 400 }
      );
    }

    const roi = await calculateROI(
      parseInt(property_id),
      new Date(period_start),
      new Date(period_end)
    );

    return NextResponse.json({
      success: true,
      data: roi,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao calcular ROI',
      },
      { status: 500 }
    );
  }
}

