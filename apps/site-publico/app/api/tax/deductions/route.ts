/**
 * API CRUD deduções tributárias
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import {
  listDeductions,
  createDeduction,
  updateDeduction,
} from '@/lib/tax-optimization/tax-optimization-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period_start = searchParams.get('period_start');
    const period_end = searchParams.get('period_end');
    const approved = searchParams.get('approved');

    const deductions = await listDeductions({
      period_start: period_start || undefined,
      period_end: period_end || undefined,
      approved: approved != null ? approved === 'true' : undefined,
    });

    return NextResponse.json({ success: true, data: deductions });
  } catch (err: unknown) {
    console.error('[tax/deductions] GET error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

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
    const { description, amount, category, ai_confidence, approved_by_user, period_start, period_end } =
      body;

    if (!description || amount == null) {
      return NextResponse.json(
        { success: false, error: 'description e amount são obrigatórios' },
        { status: 400 }
      );
    }

    const deduction = await createDeduction({
      description,
      amount: parseFloat(amount),
      category,
      ai_confidence,
      approved_by_user,
      period_start,
      period_end,
    });

    return NextResponse.json({ success: true, data: deduction });
  } catch (err: unknown) {
    console.error('[tax/deductions] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, category, approved_by_user } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    }

    const deduction = await updateDeduction(id, { category, approved_by_user });
    if (!deduction) {
      return NextResponse.json({ success: false, error: 'Dedução não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deduction });
  } catch (err: unknown) {
    console.error('[tax/deductions] PATCH error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
