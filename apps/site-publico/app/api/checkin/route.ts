import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { generatePin } from '@/lib/smartlock-integration';
import { sendCheckinInstructions } from '@/lib/whatsapp';
import { sendCheckinInstructions as sendEmailCheckin } from '@/lib/email';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// GET: Buscar check-ins
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('booking_id');
    const propertyId = searchParams.get('property_id');
    const userId = searchParams.get('user_id');

    let query = 'SELECT * FROM checkins WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (bookingId) {
      query += ` AND booking_id = $${paramCount++}`;
      params.push(parseInt(bookingId));
    }
    if (propertyId) {
      query += ` AND property_id = $${paramCount++}`;
      params.push(parseInt(propertyId));
    }
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(parseInt(userId));
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return NextResponse.json({ checkins: result.rows });
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Criar check-in
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      booking_id,
      property_id,
      user_id,
      scheduled_checkin_date,
      scheduled_checkin_time,
    } = body;

    // Verificar se já existe check-in
    const existingQuery = `
      SELECT id FROM checkins WHERE booking_id = $1
    `;
    const existingResult = await pool.query(existingQuery, [booking_id]);

    let checkinId: number;

    if (existingResult.rows.length > 0) {
      // Atualizar existente
      const updateQuery = `
        UPDATE checkins
        SET
          scheduled_checkin_date = $1,
          scheduled_checkin_time = $2,
          status = 'in_progress',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id
      `;
      const updateResult = await pool.query(updateQuery, [
        scheduled_checkin_date,
        scheduled_checkin_time,
        existingResult.rows[0].id,
      ]);
      checkinId = updateResult.rows[0].id;
    } else {
      // Criar novo
      const insertQuery = `
        INSERT INTO checkins (
          booking_id, property_id, user_id,
          scheduled_checkin_date, scheduled_checkin_time, status
        )
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING id
      `;
      const insertResult = await pool.query(insertQuery, [
        booking_id,
        property_id,
        user_id,
        scheduled_checkin_date,
        scheduled_checkin_time,
      ]);
      checkinId = insertResult.rows[0].id;
    }

    return NextResponse.json({ checkin_id: checkinId, status: 'created' });
  } catch (error) {
    console.error('Erro ao criar check-in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

