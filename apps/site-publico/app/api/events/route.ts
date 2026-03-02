import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// GET: Buscar eventos para cálculo de preços
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'start_date e end_date são obrigatórios' }, { status: 400 });
    }

    const query = `
      SELECT name, price_multiplier as multiplier
      FROM events_calendar
      WHERE (
        (start_date <= $1 AND end_date >= $1)
        OR (start_date <= $2 AND end_date >= $2)
        OR (start_date >= $1 AND end_date <= $2)
      )
      AND (
        city IS NULL OR city = $3 OR $3 IS NULL
      )
      AND (
        state IS NULL OR state = $4 OR $4 IS NULL
      )
      ORDER BY price_multiplier DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [
      startDate,
      endDate,
      city || null,
      state || null,
    ]);

    const events = result.rows.map((row: any) => ({
      name: row.name,
      multiplier: parseFloat(row.multiplier),
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

