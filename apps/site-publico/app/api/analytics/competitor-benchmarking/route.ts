/**
 * ✅ FASE 4: API DE BENCHMARK DE COMPETIDORES
 * GET /api/analytics/competitor-benchmarking - Comparação com competidores
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
    const property_id = searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined;

    if (!property_id) {
      return NextResponse.json(
        { success: false, error: 'property_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados da propriedade
    const property = await queryDatabase(
      'SELECT * FROM properties WHERE id = $1',
      [property_id]
    );

    if (!property[0]) {
      return NextResponse.json(
        { success: false, error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    // Buscar preços de competidores (da tabela competitor_prices)
    const competitorPrices = await queryDatabase(
      `SELECT 
        competitor_name,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        COUNT(*) as data_points
      FROM competitor_prices
      WHERE property_id = $1
        AND scraped_at >= NOW() - INTERVAL '30 days'
      GROUP BY competitor_name
      ORDER BY avg_price ASC`,
      [property_id]
    );

    // Calcular estatísticas da propriedade
    const propertyStats = await queryDatabase(
      `SELECT 
        AVG(total) as avg_booking_value,
        COUNT(*) as total_bookings,
        AVG(rating) as avg_rating
      FROM bookings b
      LEFT JOIN reviews r ON r.booking_id = b.id
      WHERE b.item_id = $1
        AND b.status IN ('confirmed', 'completed')
        AND b.created_at >= NOW() - INTERVAL '30 days'`,
      [property_id]
    );

    const stats = propertyStats[0] || {};
    const avgPrice = parseFloat(property[0].base_price || 0);

    // Calcular posicionamento
    const competitorAvg = competitorPrices.length > 0
      ? competitorPrices.reduce((sum: number, cp: any) => sum + parseFloat(cp.avg_price || 0), 0) / competitorPrices.length
      : avgPrice;

    const pricePosition = avgPrice < competitorAvg * 0.9 ? 'below' :
                          avgPrice > competitorAvg * 1.1 ? 'above' : 'competitive';

    return NextResponse.json({
      success: true,
      data: {
        property: {
          id: property_id,
          name: property[0].title,
          current_price: avgPrice,
          avg_booking_value: parseFloat(stats.avg_booking_value || 0),
          total_bookings: parseInt(stats.total_bookings || 0),
          avg_rating: parseFloat(stats.avg_rating || 0),
        },
        competitors: competitorPrices.map((cp: any) => ({
          name: cp.competitor_name,
          avg_price: parseFloat(cp.avg_price || 0),
          min_price: parseFloat(cp.min_price || 0),
          max_price: parseFloat(cp.max_price || 0),
          data_points: parseInt(cp.data_points || 0),
        })),
        benchmarking: {
          market_avg_price: competitorAvg,
          price_position: pricePosition,
          price_difference_percent: competitorAvg > 0 
            ? ((avgPrice - competitorAvg) / competitorAvg) * 100 
            : 0,
          recommendation: pricePosition === 'above' 
            ? 'Considere reduzir preços para aumentar competitividade'
            : pricePosition === 'below'
            ? 'Preço competitivo, pode considerar aumento moderado'
            : 'Preço bem posicionado no mercado',
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar benchmark:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar benchmark' },
      { status: 500 }
    );
  }
}

