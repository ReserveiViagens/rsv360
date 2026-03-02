import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { sendPaymentConfirmed } from '@/lib/email';
import { mercadoPagoService } from '@/lib/mercadopago';
import { processWebhookEvent } from '@/lib/mercadopago-enhanced';

// POST /api/webhooks/mercadopago - Webhook do Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar assinatura do webhook (se configurado)
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const dataId = body.data?.id?.toString();

    if (xSignature && xRequestId && dataId) {
      const isValid = mercadoPagoService.validateWebhookSignature(
        xSignature,
        xRequestId,
        dataId
      );

      if (!isValid) {
        console.error('❌ Assinatura do webhook inválida');
        return NextResponse.json(
          { received: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Verificar idempotência (evitar processar duas vezes)
    const webhookId = body.id || body.data?.id;
    if (webhookId) {
      // Verificar se já processamos este webhook
      try {
        const existingWebhook = await queryDatabase(
          `SELECT id FROM webhook_logs WHERE webhook_id = $1 AND processed = TRUE`,
          [webhookId.toString()]
        );

        if (existingWebhook.length > 0) {
          console.log(`Webhook ${webhookId} já foi processado anteriormente`);
          return NextResponse.json({ received: true, message: 'Already processed' });
        }
      } catch (error: any) {
        // Tabela pode não existir ainda, continuar
        console.log('Tabela webhook_logs não encontrada, continuando sem idempotência:', error.message);
      }
    }

    // Log do webhook recebido
    try {
      await queryDatabase(
        `CREATE TABLE IF NOT EXISTS webhook_logs (
          id SERIAL PRIMARY KEY,
          webhook_id VARCHAR(255) UNIQUE,
          type VARCHAR(50),
          data JSONB,
          processed BOOLEAN DEFAULT FALSE,
          processed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await queryDatabase(
        `INSERT INTO webhook_logs (webhook_id, type, data)
         VALUES ($1, $2, $3)
         ON CONFLICT (webhook_id) DO NOTHING`,
        [webhookId?.toString() || `webhook-${Date.now()}`, body.type, JSON.stringify(body)]
      );
    } catch (error: any) {
      console.log('Erro ao logar webhook:', error.message);
    }
    
    // ✅ ITEM 7: WEBHOOK HANDLER COMPLETO
    // Processar evento usando função aprimorada
    const type = body.type || body.action;
    const result = await processWebhookEvent(
      type,
      body,
      xSignature || undefined,
      xRequestId || undefined
    );

    if (!result.processed) {
      return NextResponse.json({ 
        received: true, 
        processed: false,
        reason: result.reason 
      });
    }

    // Enviar email de confirmação se pagamento foi aprovado
    if (type === 'payment' && result.payment_status === 'paid') {
      const paymentId = body.data?.id;
      
      if (paymentId) {
        // Buscar dados da reserva para enviar email
        const payments = await queryDatabase(
          'SELECT booking_id FROM payments WHERE gateway_transaction_id = $1',
          [paymentId.toString()]
        );

        if (payments.length > 0) {
          const booking = await queryDatabase(
            `SELECT booking_code, item_name, customer_name, customer_email, total, payment_method 
             FROM bookings WHERE id = $1`,
            [payments[0].booking_id]
          );

          if (booking.length > 0) {
            const bookingData = booking[0];
            try {
              await sendPaymentConfirmed({
                code: bookingData.booking_code,
                guestName: bookingData.customer_name,
                guestEmail: bookingData.customer_email,
                propertyName: bookingData.item_name,
                amount: parseFloat(bookingData.total),
                paymentMethod: bookingData.payment_method || 'pix',
              });
            } catch (emailError) {
              console.error('Erro ao enviar email de pagamento confirmado:', emailError);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    // Sempre retornar 200 para o Mercado Pago não reenviar
    return NextResponse.json({ received: true, error: error.message });
  }
}

// GET /api/webhooks/mercadopago - Verificação do webhook (opcional)
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook do Mercado Pago está ativo',
    timestamp: new Date().toISOString()
  });
}

