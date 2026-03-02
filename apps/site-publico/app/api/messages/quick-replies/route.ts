/**
 * ✅ ITEM 81: API DE RESPOSTAS RÁPIDAS
 * GET /api/messages/quick-replies - Listar respostas rápidas
 * POST /api/messages/quick-replies - Criar resposta rápida
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { listQuickReplies, createQuickReply } from '@/lib/messages-enhanced-service';

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
    const category = searchParams.get('category') || undefined;

    const replies = await listQuickReplies(user.id, category);

    return NextResponse.json({
      success: true,
      data: replies,
      count: replies.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar respostas rápidas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar respostas rápidas' },
      { status: 500 }
    );
  }
}

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
    const reply = await createQuickReply({
      ...body,
      user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Resposta rápida criada com sucesso',
      data: reply,
    });
  } catch (error: any) {
    console.error('Erro ao criar resposta rápida:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar resposta rápida' },
      { status: 500 }
    );
  }
}

