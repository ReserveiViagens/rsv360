import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

// POST /api/analytics/track - Rastrear evento
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || decoded.id;
      } catch (error) {
        // Token inválido, continuar sem userId
      }
    }

    const body = await request.json();
    const { event_type, event_name, properties } = body;

    if (!event_type || !event_name) {
      return NextResponse.json({ success: false, error: 'event_type e event_name são obrigatórios' }, { status: 400 });
    }

    // Obter IP e User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Inserir evento
    await queryDatabase(
      `INSERT INTO analytics (user_id, event_type, event_name, properties, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        event_type,
        event_name,
        properties ? JSON.stringify(properties) : null,
        ipAddress,
        userAgent
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao rastrear evento:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

