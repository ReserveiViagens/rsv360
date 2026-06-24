/**
 * GET /api/analytics/competitor-benchmarking — benchmark alinhado ao schema S2.
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import { queryDatabase } from '@/lib/db';

const REVENUE_STATUSES = "('confirmed')";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await marketingLabAuth(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id')
      ? parseInt(searchParams.get('property_id')!, 10)
      : 1;

    let propertyName = `Propriedade ${propertyId}`;
    let currentPrice = 250;

    try {
      const property = await queryDatabase(
        'SELECT id, name, base_price_per_night FROM properties WHERE id = $1',
        [propertyId]
      );
      if (property[0]) {
        propertyName = property[0].name;
        currentPrice = parseFloat(property[0].base_price_per_night || '250');
      }
    } catch {
      /* properties pode não existir no lab */
    }

    let competitorPrices: Array<{
      competitor_name: string;
      avg_price: string;
      min_price: string;
      max_price: string;
      data_points: string;
    }> = [];

    try {
      competitorPrices = await queryDatabase(
        `SELECT
           competitor_name,
           AVG(price) AS avg_price,
           MIN(price) AS min_price,
           MAX(price) AS max_price,
           COUNT(*) AS data_points
         FROM competitor_prices
         WHERE item_id = $1
         AND scraped_at >= NOW() - INTERVAL '30 days'
         GROUP BY competitor_name
         ORDER BY avg_price ASC`,
        [propertyId]
      );
    } catch {
      /* tabela opcional */
    }

    let avgBookingValue = 0;
    let totalBookings = 0;

    try {
      const propertyStats = await queryDatabase(
        `SELECT
           AVG(total_amount) AS avg_booking_value,
           COUNT(*) AS total_bookings
         FROM bookings
         WHERE item_id = $1
         AND status IN ${REVENUE_STATUSES}
         AND created_at >= NOW() - INTERVAL '30 days'`,
        [propertyId]
      );
      if (propertyStats[0]) {
        avgBookingValue = parseFloat(propertyStats[0].avg_booking_value || '0');
        totalBookings = parseInt(propertyStats[0].total_bookings || '0', 10);
      }
    } catch {
      /* ok */
    }

    const competitorAvg =
      competitorPrices.length > 0
        ? competitorPrices.reduce((sum, cp) => sum + parseFloat(cp.avg_price || '0'), 0) /
          competitorPrices.length
        : currentPrice;

    const pricePosition =
      currentPrice < competitorAvg * 0.9
        ? 'below'
        : currentPrice > competitorAvg * 1.1
          ? 'above'
          : 'competitive';

    return NextResponse.json({
      success: true,
      data: {
        property: {
          id: propertyId,
          name: propertyName,
          current_price: currentPrice,
          avg_booking_value: avgBookingValue,
          total_bookings: totalBookings,
          avg_rating: 0,
        },
        competitors: competitorPrices.map((cp) => ({
          name: cp.competitor_name,
          avg_price: parseFloat(cp.avg_price || '0'),
          min_price: parseFloat(cp.min_price || '0'),
          max_price: parseFloat(cp.max_price || '0'),
          data_points: parseInt(cp.data_points || '0', 10),
        })),
        benchmarking: {
          market_avg_price: competitorAvg,
          price_position: pricePosition,
          price_difference_percent:
            competitorAvg > 0 ? ((currentPrice - competitorAvg) / competitorAvg) * 100 : 0,
          recommendation:
            pricePosition === 'above'
              ? 'Considere reduzir preços para aumentar competitividade'
              : pricePosition === 'below'
                ? 'Preço competitivo, pode considerar aumento moderado'
                : 'Preço bem posicionado no mercado',
        },
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar benchmark';
    console.error('Erro ao gerar benchmark:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
