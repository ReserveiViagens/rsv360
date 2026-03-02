import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

/**
 * POST /api/auth/reset-rate-limit
 * Apenas em desenvolvimento: limpa bloqueios de rate limit para permitir novos logins
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Não disponível em produção' }, { status: 403 });
  }

  try {
    await queryDatabase(
      `UPDATE auth_rate_limits SET attempt_count = 0, blocked_until = NULL WHERE action IN ('login', 'register')`
    );
    return NextResponse.json({ success: true, message: 'Rate limit resetado com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao resetar rate limit' },
      { status: 500 }
    );
  }
}
