/**
 * ✅ TAREFA MEDIUM-4: API para verificar status de background check
 * GET /api/background-check/status?user_id=123&provider=serasa&check_type=basic
 */

import { NextRequest, NextResponse } from 'next/server';
import { backgroundCheckService } from '@/lib/background-check-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const provider = searchParams.get('provider') || undefined;
    const checkType = searchParams.get('check_type') || undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar check mais recente válido
    const check = await backgroundCheckService.getLatestValidCheck(
      parseInt(userId),
      provider as any,
      checkType as any
    );

    if (!check) {
      return NextResponse.json({
        success: true,
        data: {
          has_check: false,
          message: 'Nenhum background check válido encontrado',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        has_check: true,
        check,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar status de background check:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}

