/**
 * API sugestão de split (IA)
 * POST: obter sugestão de % baseada em histórico e/ou IA
 * PR-13b: sanitize free-form context before AI path
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { suggestSplit, suggestSplitWithAI } from '@/lib/marketplace-split/split-suggestion-service';
import type { ServiceType } from '@/lib/marketplace-split/types';
import { jsonInternalError } from '@/lib/api-error';
import { sanitizeSplitAiContext } from '@rsv360/shared';

const SERVICE_TYPES = new Set(['rent', 'ticket', 'package']);

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

    const stRaw = typeof service_type === 'string' ? service_type : 'rent';
    if (!SERVICE_TYPES.has(stRaw)) {
      return NextResponse.json(
        { success: false, error: 'service_type inválido' },
        { status: 400 }
      );
    }
    const st = stRaw as ServiceType;
    const receiverId = receiver_id ? parseInt(receiver_id, 10) : undefined;
    if (
      receiver_id !== undefined &&
      receiver_id !== null &&
      receiver_id !== '' &&
      !Number.isFinite(receiverId)
    ) {
      return NextResponse.json(
        { success: false, error: 'receiver_id inválido' },
        { status: 400 }
      );
    }

    const safeContext = sanitizeSplitAiContext(context);
    const suggestion = use_ai
      ? await suggestSplitWithAI(receiverId, st, safeContext || undefined)
      : await suggestSplit(receiverId, st);

    return NextResponse.json({
      success: true,
      data: suggestion,
    });
  } catch (err: unknown) {
    console.error('[split-marketplace/suggest] POST error:', err);
    return jsonInternalError(err);
  }
}
