/**
 * ✅ ITEM 80: API DE EXPORTAÇÃO DE CONVERSAS
 * POST /api/messages/export - Exportar conversa
 * GET /api/messages/export - Listar histórico de exportações
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { exportConversation, getExportHistory } from '@/lib/messages-enhanced-service';

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
    const { chat_id, export_type, date_from, date_to, sender_ids, message_types } = body;

    if (!chat_id || !export_type) {
      return NextResponse.json(
        { success: false, error: 'chat_id e export_type são obrigatórios' },
        { status: 400 }
      );
    }

    const exportId = await exportConversation(
      {
        chat_id,
        export_type,
        date_from,
        date_to,
        sender_ids,
        message_types,
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Exportação iniciada',
      data: { export_id: exportId },
    });
  } catch (error: any) {
    console.error('Erro ao exportar conversa:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao exportar conversa' },
      { status: 500 }
    );
  }
}

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

    const exports = await getExportHistory(user.id, chat_id);

    return NextResponse.json({
      success: true,
      data: exports,
      count: exports.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar exportações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar exportações' },
      { status: 500 }
    );
  }
}

