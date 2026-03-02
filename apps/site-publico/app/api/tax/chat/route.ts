/**
 * API simulador conversacional tributário
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { processTaxChat } from '@/lib/tax-optimization/tax-chat-service';

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
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'message é obrigatório' },
        { status: 400 }
      );
    }

    const response = await processTaxChat(message, context);

    return NextResponse.json({
      success: true,
      data: { response },
    });
  } catch (err: unknown) {
    console.error('[tax/chat] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
