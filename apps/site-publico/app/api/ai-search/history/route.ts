/**
 * ✅ TAREFA LOW-2: API para gerenciar histórico de conversação
 * GET /api/ai-search/history - Obter histórico
 * DELETE /api/ai-search/history - Limpar histórico
 * PR-13a: auth + rate limit; history scoped to authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search-service';
import { jsonInternalError } from '@/lib/api-error';
import { requireAiSearchAccess } from '@/lib/ai-search-guard';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAiSearchAccess(request);
    if (gate.errorResponse) return gate.errorResponse;

    const history = aiSearchService.getHistory(gate.user.id);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Erro ao obter histórico:', error);
    return jsonInternalError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const gate = await requireAiSearchAccess(request);
    if (gate.errorResponse) return gate.errorResponse;

    aiSearchService.clearHistory(gate.user.id);

    return NextResponse.json({
      success: true,
      message: 'Histórico limpo com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao limpar histórico:', error);
    return jsonInternalError(error);
  }
}
