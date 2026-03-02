/**
 * ✅ ITEM 73: API DE HISTÓRICO DE FIDELIDADE
 * GET /api/loyalty/history - Obter histórico de transações e resgates
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getLoyaltyHistory, getRedemptionHistory } from '@/lib/loyalty-service';

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
    const type = searchParams.get('type') || 'all'; // 'transactions', 'redemptions', 'all'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let transactions: any[] = [];
    let redemptions: any[] = [];

    if (type === 'transactions' || type === 'all') {
      transactions = await getLoyaltyHistory(user.id, limit, offset);
    }

    if (type === 'redemptions' || type === 'all') {
      redemptions = await getRedemptionHistory(user.id, limit, offset);
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        redemptions,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter histórico:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter histórico' },
      { status: 500 }
    );
  }
}

