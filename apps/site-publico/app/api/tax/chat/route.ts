/**
 * API simulador conversacional tributário
 * PR-13b: sanitize message + allowlisted context before LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { processTaxChat } from '@/lib/tax-optimization/tax-chat-service';
import { jsonInternalError } from '@/lib/api-error';
import {
  LLM_MAX_MESSAGE_CHARS,
  sanitizeLlmText,
  sanitizeTaxChatContext,
} from '@rsv360/shared';

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
    const { message, context } = body;

    const safeMessage = sanitizeLlmText(message, LLM_MAX_MESSAGE_CHARS);
    if (!safeMessage) {
      return NextResponse.json(
        { success: false, error: 'message é obrigatório' },
        { status: 400 }
      );
    }

    const response = await processTaxChat(
      safeMessage,
      sanitizeTaxChatContext(context),
    );

    return NextResponse.json({
      success: true,
      data: { response },
    });
  } catch (err: unknown) {
    console.error('[tax/chat] POST error:', err);
    return jsonInternalError(err);
  }
}
