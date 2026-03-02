/**
 * ✅ TAREFA MEDIUM-1: API para verificar elegibilidade Klarna
 * POST /api/payments/klarna/eligibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { klarnaClient } from '@/lib/klarna-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, check_in_date } = body;

    // Validar dados obrigatórios
    if (!amount || !check_in_date) {
      return NextResponse.json(
        { success: false, error: 'amount e check_in_date são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar elegibilidade
    const eligibility = await klarnaClient.checkEligibility({
      amount: parseFloat(amount),
      check_in_date: new Date(check_in_date),
    });

    return NextResponse.json({
      success: true,
      data: eligibility,
    });
  } catch (error: any) {
    console.error('Erro ao verificar elegibilidade Klarna:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao verificar elegibilidade' },
      { status: 500 }
    );
  }
}

