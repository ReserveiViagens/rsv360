/**
 * ✅ ITENS 31-35: API DE SMART PRICING
 * POST /api/pricing/smart - Calcular preço inteligente
 * GET /api/pricing/smart/history - Obter histórico de preços
 * GET /api/pricing/smart/trends - Análise de tendências
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateSmartPrice,
  getPricingHistory,
  analyzePricingTrends,
} from '@/lib/smart-pricing-service';
import { calculateSmartPriceSchema, getPricingHistoryQuerySchema } from '@/lib/schemas/smart-pricing-schemas';
import { requireAuth, optionalAuth } from '@/lib/api-auth';

// POST /api/pricing/smart - Calcular preço inteligente
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = calculateSmartPriceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      item_id,
      base_price,
      check_in,
      check_out,
      location,
      latitude,
      longitude,
    } = validationResult.data;

    const factors = await calculateSmartPrice(
      item_id,
      base_price,
      check_in,
      check_out,
      location || undefined,
      latitude || undefined,
      longitude || undefined
    );

    return NextResponse.json({
      success: true,
      data: factors,
    });
  } catch (error: any) {
    console.error('Erro ao calcular preço inteligente:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao calcular preço inteligente' },
      { status: 500 }
    );
  }
}

// GET /api/pricing/smart/history - Obter histórico
export async function GET(request: NextRequest) {
  const authResult = await optionalAuth(request);
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = getPricingHistoryQuerySchema.safeParse({
      item_id: searchParams.get('item_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      limit: searchParams.get('limit'),
      action: searchParams.get('action'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { item_id, start_date, end_date, limit, action } = queryResult.data;

    if (!item_id && action !== 'trends') {
      return NextResponse.json(
        { success: false, error: 'item_id é obrigatório' },
        { status: 400 }
      );
    }

    if (action === 'trends' && item_id) {
      const trends = await analyzePricingTrends(item_id);
      return NextResponse.json({
        success: true,
        data: trends,
      });
    }

    if (!item_id) {
      return NextResponse.json(
        { success: false, error: 'item_id é obrigatório para histórico' },
        { status: 400 }
      );
    }

    const history = await getPricingHistory(
      item_id,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined,
      limit || 100
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Erro ao obter histórico:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter histórico' },
      { status: 500 }
    );
  }
}

