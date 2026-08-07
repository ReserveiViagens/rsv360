/**
 * ✅ TAREFA LOW-2: API para busca de propriedades com AI
 * POST /api/ai-search/search
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
    const { query, context } = body;

    const invalid = validateAiSearchTextInput(query, 'Query');
    if (invalid) return invalid;

    const result = await aiSearchService.searchProperties(
      (query as string).trim(),
      context,
      gate.user.id,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao buscar propriedades:', error);
    return jsonInternalError(error);
  }
}
