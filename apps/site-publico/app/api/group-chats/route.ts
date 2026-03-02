/**
 * ✅ ITEM 18: API DE GROUP CHATS
 * GET /api/group-chats - Listar grupos
 * POST /api/group-chats - Criar grupo
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createGroupChat,
  listUserGroupChats,
  getGroupChat,
} from '@/lib/group-chat-service';
import { createGroupChatSchema, getGroupChatQuerySchema } from '@/lib/schemas/group-chat-schemas';
import { requireAuth, optionalAuth } from '@/lib/api-auth';

// GET /api/group-chats - Listar grupos
export async function GET(request: NextRequest) {
  const authResult = await optionalAuth(request);
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = getGroupChatQuerySchema.safeParse({
      id: searchParams.get('id'),
      booking_id: searchParams.get('booking_id'),
      chat_type: searchParams.get('chat_type'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { id, booking_id, chat_type } = queryResult.data;
    const userId = authResult?.id;
    const email = authResult?.email;

    // Buscar grupo específico
    if (id) {
      const group = await getGroupChat(id, userId, email);
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Grupo não encontrado ou sem permissão' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: group });
    }

    // Buscar por booking
    if (booking_id) {
      const { getGroupChatByBooking } = await import('@/lib/group-chat-service');
      const group = await getGroupChatByBooking(booking_id);
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Grupo não encontrado para esta reserva' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: group });
    }

    // Listar grupos do usuário
    const groups = await listUserGroupChats(userId, email);

    return NextResponse.json({
      success: true,
      data: groups,
    });
  } catch (error: any) {
    console.error('Erro ao listar grupos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar grupos' },
      { status: 500 }
    );
  }
}

// POST /api/group-chats - Criar grupo
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = createGroupChatSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, description, chat_type, booking_id, is_private, created_by } = validationResult.data;

    const group = await createGroupChat(
      name,
      description || undefined,
      chat_type,
      booking_id || undefined,
      is_private,
      created_by || user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Grupo criado com sucesso',
      data: group,
    });
  } catch (error: any) {
    console.error('Erro ao criar grupo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar grupo' },
      { status: 500 }
    );
  }
}

