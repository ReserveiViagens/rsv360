import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

/** Lista itens precificáveis (properties ou fallback demo). */
export async function GET() {
  try {
    const rows = await queryDatabase(
      `SELECT id, name, COALESCE(base_price_per_night, 250)::numeric AS base_price
       FROM properties
       ORDER BY id
       LIMIT 50`
    );

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: rows.map((r: { id: number; name: string; base_price: string }) => ({
          id: String(r.id),
          name: r.name,
          basePrice: parseFloat(r.base_price || '250'),
        })),
      });
    }
  } catch {
    /* tabela pode não existir no ambiente */
  }

  return NextResponse.json({
    success: true,
    data: [{ id: '1', name: 'Suíte Master (demo)', basePrice: 250 }],
  });
}
