import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

// POST /api/reviews - Criar avaliação
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const body = await request.json();
    const { host_id, booking_id, rating, comment } = body;

    if (!host_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    const review = await queryDatabase(
      `INSERT INTO reviews (user_id, host_id, booking_id, rating, comment, status)
       VALUES ($1, $2, $3, $4, $5, 'published')
       RETURNING *`,
      [userId, host_id, booking_id || null, rating, comment || null]
    );

    // Atualizar rating do host
    const hostReviews = await queryDatabase(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM reviews 
       WHERE host_id = $1 AND status = 'published'`,
      [host_id]
    );

    if (hostReviews[0]) {
      await queryDatabase(
        `UPDATE user_profiles 
         SET rating = $1, review_count = $2 
         WHERE user_id = $3`,
        [
          parseFloat(hostReviews[0].avg_rating || 0),
          parseInt(hostReviews[0].count || 0),
          host_id
        ]
      );
    }

    return NextResponse.json({ success: true, data: review[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/reviews - Listar avaliações
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const host_id = searchParams.get('host_id');
    const user_id = searchParams.get('user_id');

    let query = 'SELECT r.*, u.name as user_name, u.email as user_email FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (host_id) {
      query += ` AND r.host_id = $${paramIndex++}`;
      params.push(host_id);
    }

    if (user_id) {
      query += ` AND r.user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    query += ' ORDER BY r.created_at DESC';

    const reviews = await queryDatabase(query, params);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

