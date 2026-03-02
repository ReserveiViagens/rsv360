/**
 * API classificação de despesa com IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { classifyExpense } from '@/lib/tax-optimization/expense-classifier-ai';

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
    const { description, amount } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'description é obrigatório' },
        { status: 400 }
      );
    }

    const result = await classifyExpense(
      description,
      amount != null ? parseFloat(amount) : undefined
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error('[tax/classify] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
