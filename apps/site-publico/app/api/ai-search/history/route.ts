/**
 * ✅ TAREFA LOW-2: API para gerenciar histórico de conversação
 * GET /api/ai-search/history - Obter histórico
 * DELETE /api/ai-search/history - Limpar histórico
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search-service';
import { jsonInternalError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const history = aiSearchService.getHistory();

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
    aiSearchService.clearHistory();

    return NextResponse.json({
      success: true,
      message: 'Histórico limpo com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao limpar histórico:', error);
    return jsonInternalError(error);
  }
}

