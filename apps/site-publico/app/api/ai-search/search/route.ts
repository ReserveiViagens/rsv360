/**
 * ✅ TAREFA LOW-2: API para busca de propriedades com AI
 * POST /api/ai-search/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSearchService } from '@/lib/ai-search-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    const result = await aiSearchService.searchProperties(query, context);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao buscar propriedades:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar propriedades' },
      { status: 500 }
    );
  }
}

