/**
 * ✅ ITEM 30: API DE PREFERÊNCIAS DE NOTIFICAÇÃO
 * GET /api/notifications/preferences - Obter preferências
 * PUT /api/notifications/preferences - Atualizar preferências
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/notification-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/notifications/preferences - Obter preferências
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const preferences = await getUserNotificationPreferences(user.id);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    console.error('Erro ao obter preferências:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter preferências' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Atualizar preferências
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const preferences = await updateNotificationPreferences(user.id, body);

    return NextResponse.json({
      success: true,
      message: 'Preferências atualizadas com sucesso',
      data: preferences,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar preferências' },
      { status: 500 }
    );
  }
}

