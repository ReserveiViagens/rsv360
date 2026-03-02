/**
 * ✅ ITEM 73: API DE PONTOS DE FIDELIDADE
 * GET /api/loyalty/points - Obter pontos do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getOrCreateLoyaltyPoints } from '@/lib/loyalty-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : user.id;

    // Apenas admin pode ver pontos de outros usuários
    if (user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const points = await getOrCreateLoyaltyPoints(user_id);

    return NextResponse.json({
      success: true,
      data: points,
    });
  } catch (error: any) {
    console.error('Erro ao obter pontos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter pontos' },
      { status: 500 }
    );
  }
}

