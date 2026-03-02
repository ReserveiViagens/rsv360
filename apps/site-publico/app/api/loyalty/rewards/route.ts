/**
 * ✅ ITEM 73: API DE RECOMPENSAS
 * GET /api/loyalty/rewards - Listar recompensas disponíveis
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { listAvailableRewards } from '@/lib/loyalty-service';

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
    const min_points = searchParams.get('min_points') ? parseInt(searchParams.get('min_points')!) : undefined;
    const max_points = searchParams.get('max_points') ? parseInt(searchParams.get('max_points')!) : undefined;
    const reward_type = searchParams.get('reward_type') || undefined;

    const rewards = await listAvailableRewards(user.id, {
      min_points,
      max_points,
      reward_type,
    });

    return NextResponse.json({
      success: true,
      data: rewards,
      count: rewards.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar recompensas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar recompensas' },
      { status: 500 }
    );
  }
}

