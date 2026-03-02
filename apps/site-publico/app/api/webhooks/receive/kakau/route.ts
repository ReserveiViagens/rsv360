/**
 * ✅ API ROUTE: Receber Webhooks da Kakau Seguros
 */

import { NextRequest, NextResponse } from 'next/server';
import { processReceivedWebhook, verifyWebhookSignature } from '@/lib/webhook-service';

const KAKAU_WEBHOOK_SECRET = process.env.KAKAU_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/receive/kakau
 * Receber webhook da Kakau Seguros
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-kakau-signature') || '';
    
    // Verificar assinatura se secret estiver configurado
    if (KAKAU_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(body, signature, KAKAU_WEBHOOK_SECRET);
      if (!isValid) {
        console.warn('⚠️ Webhook da Kakau com assinatura inválida');
        return NextResponse.json(
          {
            success: false,
            error: 'Assinatura inválida'
          },
          { status: 401 }
        );
      }
    }
    
    // Extrair tipo de evento
    const eventType = body.type || body.event_type || 'unknown';
    
    // Processar webhook
    await processReceivedWebhook('kakau', eventType, body, signature);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook da Kakau:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar webhook',
        details: error.message
      },
      { status: 500 }
    );
  }
}

