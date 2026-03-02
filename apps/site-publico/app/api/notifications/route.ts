/**
 * ✅ ITENS 25-30: API DE NOTIFICAÇÕES
 * GET /api/notifications - Listar notificações
 * POST /api/notifications - Criar notificação
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserNotifications,
  createInAppNotification,
  getUnreadNotificationCount,
} from '@/lib/notification-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/notifications - Listar notificações
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    const notifications = await getUserNotifications(user.id, limit, unreadOnly);
    const unreadCount = await getUnreadNotificationCount(user.id);

    return NextResponse.json({
      success: true,
      data: notifications,
      unread_count: unreadCount,
    });
  } catch (error: any) {
    console.error('Erro ao listar notificações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar notificações' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Criar notificação
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
    const { category, title, message, data } = body;

    if (!category || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'category, title e message são obrigatórios' },
        { status: 400 }
      );
    }

    const notification = await createInAppNotification(
      user.id,
      category,
      title,
      message,
      data
    );

    return NextResponse.json({
      success: true,
      message: 'Notificação criada com sucesso',
      data: notification,
    });
  } catch (error: any) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}
