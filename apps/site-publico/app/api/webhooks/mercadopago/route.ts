import { NextRequest, NextResponse } from 'next/server';
import { handleMercadoPagoWebhook } from '@/lib/mp-webhook-handler';

/**
 * POST /api/webhooks/mercadopago
 *
 * PR-02b: HMAC obrigatório (fail-closed). Sem headers / inválido → 401.
 * Mantida ativa porque site-publico define notification_url nesta rota
 * (lib/mercadopago.ts) — caminho dos pagamentos criados pelo app.
 */
export async function POST(request: NextRequest) {
  const xSignature = request.headers.get('x-signature') ?? undefined;
  const xRequestId = request.headers.get('x-request-id') ?? undefined;
  const dataIdFromQuery =
    request.nextUrl.searchParams.get('data.id') ??
    request.nextUrl.searchParams.get('id') ??
    undefined;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ received: false, error: 'Invalid JSON' }, { status: 400 });
  }

  return handleMercadoPagoWebhook({
    xSignature,
    xRequestId,
    dataIdFromQuery,
    body,
  });
}

/** GET — health check (não é receptor de eventos). */
export async function GET() {
  return NextResponse.json({
    message: 'Webhook do Mercado Pago está ativo (HMAC obrigatório no POST)',
    timestamp: new Date().toISOString(),
  });
}
