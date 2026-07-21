/**
 * POST /api/webhooks/receive/klarna
 * PR-02b: inbound desativado (HMAC era fail-open; sem evidência de uso em produção).
 */
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'gone',
      message: 'Klarna inbound webhook disabled. Use a dedicated signed endpoint if re-enabled.',
    },
    { status: 410 },
  );
}
