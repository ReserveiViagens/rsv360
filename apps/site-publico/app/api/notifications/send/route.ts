/**
 * ✅ ITENS 25-28: API DE ENVIO DE NOTIFICAÇÕES
 * POST /api/notifications/send - Enviar notificação (email, SMS, WhatsApp, Push)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmailNotification,
  sendSMSNotification,
  sendWhatsAppNotification,
  sendPushNotification,
} from '@/lib/notification-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// POST /api/notifications/send - Enviar notificação
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
    const { type, to, subject, message, html, data } = body;

    if (!type || !to || !message) {
      return NextResponse.json(
        { success: false, error: 'type, to e message são obrigatórios' },
        { status: 400 }
      );
    }

    let result = false;

    switch (type) {
      case 'email':
        result = await sendEmailNotification(
          user.id,
          to,
          subject || 'Notificação',
          html || message,
          message
        );
        break;

      case 'sms':
        result = await sendSMSNotification(user.id, to, message);
        break;

      case 'whatsapp':
        result = await sendWhatsAppNotification(user.id, to, message, data?.templateName);
        break;

      case 'push':
        result = await sendPushNotification(user.id, subject || 'Notificação', message, data);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de notificação inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message: result
        ? 'Notificação enviada com sucesso'
        : 'Notificação não enviada (verifique preferências ou configuração)',
    });
  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}

