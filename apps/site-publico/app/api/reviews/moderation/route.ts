/**
 * ✅ ITEM 76: API DE MODERAÇÃO DE REVIEWS
 * GET /api/reviews/moderation - Listar reviews pendentes
 * POST /api/reviews/moderation - Moderar review
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { listPendingModerations, moderateReview } from '@/lib/reviews-enhanced-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const moderations = await listPendingModerations(limit, offset);

    return NextResponse.json({
      success: true,
      data: moderations,
      count: moderations.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar moderações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar moderações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { review_id, status, action_taken, action_reason, notes, previous_content } = body;

    if (!review_id || !status) {
      return NextResponse.json(
        { success: false, error: 'review_id e status são obrigatórios' },
        { status: 400 }
      );
    }

    await moderateReview(review_id, status, user.id, {
      action_taken,
      action_reason,
      notes,
      previous_content,
    });

    return NextResponse.json({
      success: true,
      message: 'Review moderado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao moderar review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao moderar review' },
      { status: 500 }
    );
  }
}

