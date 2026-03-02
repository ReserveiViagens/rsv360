/**
 * ✅ ITEM 79: API DE MENSAGENS NÃO LIDAS
 * GET /api/messages/unread - Obter contagem de mensagens não lidas
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getUnreadMessageCount } from '@/lib/messages-enhanced-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chat_id = searchParams.get('chat_id') ? parseInt(searchParams.get('chat_id')!) : undefined;

    const count = await getUnreadMessageCount(user.id, chat_id);

    return NextResponse.json({
      success: true,
      data: { unread_count: count },
    });
  } catch (error: any) {
    console.error('Erro ao obter contagem de não lidas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter contagem de não lidas' },
      { status: 500 }
    );
  }
}

