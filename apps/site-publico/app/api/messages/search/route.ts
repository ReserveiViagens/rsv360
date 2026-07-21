/**
 * ✅ ITEM 80: API DE BUSCA DE MENSAGENS
 * POST /api/messages/search - Buscar mensagens com filtros
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { searchMessages } from '@/lib/messages-enhanced-service';
import { jsonInternalError } from '@/lib/api-error';

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
    const messages = await searchMessages(body);

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error);
    return jsonInternalError(error);
  }
}

