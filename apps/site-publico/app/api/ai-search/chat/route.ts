/**
 * ✅ TAREFA LOW-2: API para busca conversacional com AI
 * POST /api/ai-search/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    const result = await aiSearchService.processMessage(message, context);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}

