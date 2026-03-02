import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// POST: Webhook do Telegram
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Telegram envia updates via webhook
    // Por enquanto, o bot está rodando como processo separado
    // Este endpoint pode ser usado para receber updates via webhook no futuro

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Erro no webhook Telegram:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

