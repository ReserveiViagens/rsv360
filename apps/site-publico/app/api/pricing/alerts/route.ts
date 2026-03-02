/**
 * API de Alertas de Precificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import {
  checkAndGenerateAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  sendAlertNotifications,
} from '@/lib/pricing-alerts-service';

/**
 * GET /api/pricing/alerts
 * Obter alertas de precificação
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = parseInt(searchParams.get('property_id') || '0');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    if (!propertyId) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    if (unreadOnly) {
      const alerts = await getUnreadAlerts(propertyId, auth.user.id);
      return NextResponse.json({
        success: true,
        data: alerts,
      });
    }

    // Buscar todos os alertas
    const { queryDatabase } = await import('@/lib/db');
    const alerts = await queryDatabase(
      `SELECT * FROM pricing_alerts 
       WHERE property_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [propertyId]
    );

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    console.error('Erro ao obter alertas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter alertas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pricing/alerts/check
 * Verificar e gerar novos alertas
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { property_id, date } = body;

    if (!property_id) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    const checkDate = date ? new Date(date) : new Date();
    const alerts = await checkAndGenerateAlerts(property_id, checkDate);

    // Enviar notificações
    await sendAlertNotifications(alerts, auth.user.id, ['in-app']);

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar alertas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar alertas' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pricing/alerts/[id]/read
 * Marcar alerta como lido
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = parseInt(searchParams.get('id') || '0');

    if (!alertId) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    await markAlertAsRead(alertId);

    return NextResponse.json({
      success: true,
      message: 'Alerta marcado como lido',
    });
  } catch (error: any) {
    console.error('Erro ao marcar alerta como lido:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao marcar alerta como lido' },
      { status: 500 }
    );
  }
}

