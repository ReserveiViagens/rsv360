import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { pricingLabAuth } from '@/lib/pricing-lab-auth';
import { fetchPropertyBookings } from '@/lib/pricing-drilldown';

function demandToScore(level?: string | null): number {
  switch (level) {
    case 'very_high':
      return 95;
    case 'high':
      return 80;
    case 'medium':
      return 55;
    case 'low':
      return 25;
    default:
      return 40;
  }
}

async function resolveBasePrice(itemId: number): Promise<number> {
  const fromContent = await queryDatabase(
    `SELECT COALESCE(price, original_price, 250)::numeric AS price
     FROM website_content WHERE id = $1 LIMIT 1`,
    [itemId]
  );
  if (fromContent[0]?.price) return parseFloat(fromContent[0].price);

  const fromProps = await queryDatabase(
    `SELECT base_price_per_night FROM properties WHERE id = $1 LIMIT 1`,
    [itemId]
  );
  if (fromProps[0]?.base_price_per_night) {
    return parseFloat(fromProps[0].base_price_per_night);
  }
  return 250;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const itemId = parseInt(propertyId, 10);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const detailDate = searchParams.get('detail_date');

    const [year, mon] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const endDate = new Date(year, mon, 0).toISOString().slice(0, 10);

    const history = await queryDatabase(
      `SELECT date, base_price, final_price, demand_level
       FROM pricing_history
       WHERE item_id = $1 AND date >= $2::date AND date <= $3::date
       ORDER BY date`,
      [itemId, startDate, endDate]
    ).catch(() => []);

    const basePrice = await resolveBasePrice(itemId);
    const byDate = new Map(
      history.map((h: { date: string; final_price: string; demand_level: string }) => [
        typeof h.date === 'string' ? h.date.slice(0, 10) : h.date,
        h,
      ])
    );

    const daysInMonth = new Date(year, mon, 0).getDate();
    const data = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`;
      const row = byDate.get(dateStr) as
        | { final_price: string; base_price?: string; demand_level?: string }
        | undefined;
      const price = row ? parseFloat(row.final_price) : basePrice;
      data.push({
        date: dateStr,
        price,
        suggestedPrice: Math.round(price * 1.08 * 100) / 100,
        demand: demandToScore(row?.demand_level),
        isManualOverride: Boolean(row),
      });
    }

    const breakdown = detailDate
      ? await fetchPropertyBookings(itemId, {
          startDate: detailDate,
          endDate: detailDate,
          limit: 20,
        })
      : undefined;

    return NextResponse.json({
      success: true,
      data,
      ...(breakdown !== undefined ? { breakdown } : {}),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar calendário';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const auth = await pricingLabAuth(request);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const { propertyId } = await params;
    const itemId = parseInt(propertyId, 10);
    const body = await request.json();
    const { date, price } = body as { date: string; price: number };

    if (!date || !price || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'date e price são obrigatórios' },
        { status: 400 }
      );
    }

    const existing = await queryDatabase(
      `SELECT id FROM pricing_history WHERE item_id = $1 AND date = $2::date LIMIT 1`,
      [itemId, date]
    ).catch(() => []);

    if (existing.length > 0) {
      await queryDatabase(
        `UPDATE pricing_history SET final_price = $1, base_price = $1
         WHERE item_id = $2 AND date = $3::date`,
        [price, itemId, date]
      );
    } else {
      await queryDatabase(
        `INSERT INTO pricing_history (item_id, base_price, final_price, date, demand_level)
         VALUES ($1, $2, $2, $3::date, 'medium')`,
        [itemId, price, date]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao salvar preço';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
