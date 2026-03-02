/**
 * ✅ ITEM 36: API DE COMPARAÇÃO DE COMPETIDORES
 * GET /api/pricing/competitors/compare - Comparar preços com competidores
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

// GET /api/pricing/competitors/compare - Comparar preços
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'item_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar preços de competidores
    const competitors = await queryDatabase(
      `SELECT 
        competitor_name,
        price,
        currency,
        availability_status,
        scraped_at
       FROM competitor_prices 
       WHERE item_id = $1 
       AND DATE(scraped_at) = $2
       ORDER BY price ASC`,
      [itemId, date]
    );

    // Buscar preço atual do item
    const items = await queryDatabase(
      `SELECT price, original_price, metadata 
       FROM website_content 
       WHERE id = $1 AND type = 'hotel'`,
      [itemId]
    );

    let currentPrice = 0;
    if (items.length > 0) {
      currentPrice = parseFloat(items[0].price || items[0].original_price || '0');
    }

    // Calcular estatísticas
    if (competitors.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          item_id: parseInt(itemId),
          current_price: currentPrice,
          competitors: [],
          statistics: {
            average: 0,
            min: 0,
            max: 0,
            count: 0,
          },
          position: 'no_data',
          recommendation: 'Sem dados de competidores disponíveis',
        },
      });
    }

    const prices = competitors.map((c: any) => parseFloat(c.price));
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Determinar posição
    let position = 'competitive';
    let recommendation = 'Preço competitivo';

    if (currentPrice > max * 1.1) {
      position = 'expensive';
      recommendation = 'Preço acima da média dos competidores. Considere reduzir.';
    } else if (currentPrice < min * 0.9) {
      position = 'cheap';
      recommendation = 'Preço abaixo da média. Pode aumentar para maximizar receita.';
    } else if (currentPrice > average * 1.05) {
      position = 'above_average';
      recommendation = 'Preço acima da média. Avalie ajuste.';
    } else if (currentPrice < average * 0.95) {
      position = 'below_average';
      recommendation = 'Preço abaixo da média. Oportunidade de aumento.';
    }

    return NextResponse.json({
      success: true,
      data: {
        item_id: parseInt(itemId),
        current_price: currentPrice,
        competitors: competitors,
        statistics: {
          average: Math.round(average * 100) / 100,
          min: Math.round(min * 100) / 100,
          max: Math.round(max * 100) / 100,
          count: competitors.length,
        },
        position,
        recommendation,
        price_difference: {
          vs_average: Math.round((currentPrice - average) * 100) / 100,
          vs_min: Math.round((currentPrice - min) * 100) / 100,
          vs_max: Math.round((currentPrice - max) * 100) / 100,
          percentage_vs_average: Math.round(((currentPrice - average) / average) * 100 * 100) / 100,
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao comparar preços:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao comparar preços' },
      { status: 500 }
    );
  }
}

