/**
 * ✅ API ROUTE: Receber Webhooks da Klarna
 */

import { NextRequest, NextResponse } from 'next/server';
import { processReceivedWebhook, verifyWebhookSignature } from '@/lib/webhook-service';

const KLARNA_WEBHOOK_SECRET = process.env.KLARNA_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/receive/klarna
 * Receber webhook da Klarna
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('klarna-signature') || '';
    
    // Verificar assinatura se secret estiver configurado
    if (KLARNA_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(body, signature, KLARNA_WEBHOOK_SECRET);
      if (!isValid) {
        console.warn('⚠️ Webhook da Klarna com assinatura inválida');
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
    const eventType = body.type || body.event_type || body.action || 'unknown';
    
    // Processar webhook
    await processReceivedWebhook('klarna', eventType, body, signature);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook da Klarna:', error);
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

