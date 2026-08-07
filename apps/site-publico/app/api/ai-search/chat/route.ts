/**
 * ✅ TAREFA LOW-2: API para busca conversacional com AI
 * POST /api/ai-search/chat
 * PR-13a: auth + rate limit + input length
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search-service';
import { jsonInternalError } from '@/lib/api-error';
import {
  requireAiSearchAccess,
  validateAiSearchTextInput,
} from '@/lib/ai-search-guard';

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAiSearchAccess(request);
    if (gate.errorResponse) return gate.errorResponse;

    const body = await request.json();
    const { message, context } = body;

    const invalid = validateAiSearchTextInput(message, 'Mensagem');
    if (invalid) return invalid;

    const result = await aiSearchService.processMessage(
      (message as string).trim(),
      context,
      gate.user.id,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
    return jsonInternalError(error);
  }
}
