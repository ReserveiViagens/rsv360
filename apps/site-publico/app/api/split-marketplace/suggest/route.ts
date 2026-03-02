/**
 * API sugestão de split (IA)
 * POST: obter sugestão de % baseada em histórico e/ou IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { suggestSplit, suggestSplitWithAI } from '@/lib/marketplace-split/split-suggestion-service';
import type { ServiceType } from '@/lib/marketplace-split/types';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiver_id, service_type = 'rent', use_ai, context } = body;

    const st = (service_type || 'rent') as ServiceType;
    const receiverId = receiver_id ? parseInt(receiver_id) : undefined;

    const suggestion = use_ai
      ? await suggestSplitWithAI(receiverId, st, context)
      : await suggestSplit(receiverId, st);

    return NextResponse.json({
      success: true,
      data: suggestion,
    });
  } catch (err: unknown) {
    console.error('[split-marketplace/suggest] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
