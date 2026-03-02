import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { generatePin, revokePin, getActivePins } from '@/lib/smartlock-integration';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// GET: Listar fechaduras de uma propriedade
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('property_id');

    if (!propertyId) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    const query = `
      SELECT * FROM smart_locks
      WHERE property_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [parseInt(propertyId)]);

    return NextResponse.json({ locks: result.rows });
  } catch (error) {
    console.error('Erro ao buscar fechaduras:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Configurar fechadura
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      property_id,
      lock_type,
      lock_name,
      api_key,
      api_secret,
      device_id,
      pin_length = 6,
      pin_duration_hours = 48,
    } = body;

    // Criptografar API keys antes de salvar
    const { saveCredential } = await import('@/lib/credentials-service');
    
    const insertQuery = `
      INSERT INTO smart_locks (
        property_id, lock_type, lock_name,
        api_key_encrypted, api_secret_encrypted, device_id,
        pin_length, pin_duration_hours, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      property_id,
      lock_type,
      lock_name,
      'encrypted', // Placeholder - valor real será salvo via credentials-service
      api_secret ? 'encrypted' : null, // Placeholder - valor real será salvo via credentials-service
      device_id,
      pin_length,
      pin_duration_hours,
    ]);

    const lockId = result.rows[0].id;

    // Salvar credenciais criptografadas
    await saveCredential('smartlock', `api_key_${lockId}`, api_key, true, `API Key para ${lock_name}`);
    if (api_secret) {
      await saveCredential('smartlock', `api_secret_${lockId}`, api_secret, true, `API Secret para ${lock_name}`);
    }

    return NextResponse.json({
      lock_id: result.rows[0].id,
      status: 'created',
    });
  } catch (error) {
    console.error('Erro ao configurar fechadura:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

