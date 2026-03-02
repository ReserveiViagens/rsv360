/**
 * ✅ TAREFA MEDIUM-4: API para listar background checks de um usuário
 * GET /api/background-check/list?user_id=123
 */

import { NextRequest, NextResponse } from 'next/server';
import { backgroundCheckService } from '@/lib/background-check-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    // Listar checks do usuário
    const checks = await backgroundCheckService.getUserChecks(parseInt(userId));

    return NextResponse.json({
      success: true,
      data: checks,
    });
  } catch (error: any) {
    console.error('Erro ao listar background checks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar checks' },
      { status: 500 }
    );
  }
}

