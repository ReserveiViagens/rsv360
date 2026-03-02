/**
 * ✅ ITEM 34: API DE COMPETIDORES
 * POST /api/pricing/competitors - Salvar preço de competidor
 * GET /api/pricing/competitors - Listar preços de competidores
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCompetitorPrices,
  saveCompetitorPrice,
} from '@/lib/smart-pricing-service';

// GET /api/pricing/competitors - Listar preços
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const date = searchParams.get('date');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'item_id é obrigatório' },
        { status: 400 }
      );
    }

    const prices = await getCompetitorPrices(
      parseInt(itemId),
      date ? new Date(date) : new Date()
    );

    return NextResponse.json({
      success: true,
      data: prices,
    });
  } catch (error: any) {
    console.error('Erro ao listar preços de competidores:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar preços' },
      { status: 500 }
    );
  }
}

// POST /api/pricing/competitors - Salvar preço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      item_id,
      competitor_name,
      price,
      currency,
      availability_status,
      competitor_item_id,
      competitor_url,
      scraped_data,
    } = body;

    if (!item_id || !competitor_name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: 'item_id, competitor_name e price são obrigatórios',
        },
        { status: 400 }
      );
    }

    await saveCompetitorPrice(
      item_id,
      competitor_name,
      parseFloat(price),
      currency || 'BRL',
      availability_status || 'available',
      competitor_item_id,
      competitor_url,
      scraped_data
    );

    return NextResponse.json({
      success: true,
      message: 'Preço de competidor salvo com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao salvar preço de competidor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao salvar preço' },
      { status: 500 }
    );
  }
}

