/**
 * ✅ TAREFA MEDIUM-3: API para verificar status de conexão Google Calendar
 * GET /api/calendar/google/status?host_id=123
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('host_id');

    if (!hostId) {
      return NextResponse.json(
        { success: false, error: 'host_id é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se host tem credenciais do Google Calendar
    const credentials = await queryDatabase(
      `SELECT 
        access_token,
        refresh_token,
        expiry_date,
        created_at,
        updated_at
      FROM user_oauth_tokens
      WHERE user_id = $1 AND provider = 'google'`,
      [hostId]
    );

    if (credentials.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          message: 'Google Calendar não conectado',
        },
      });
    }

    const cred = credentials[0];
    const isExpired = cred.expiry_date && parseInt(cred.expiry_date) < Date.now();

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        expired: isExpired,
        created_at: cred.created_at,
        updated_at: cred.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar status Google Calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}

