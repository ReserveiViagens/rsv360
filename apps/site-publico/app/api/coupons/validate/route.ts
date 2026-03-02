/**
 * ✅ ITEM 71: API DE VALIDAÇÃO DE CUPONS
 * POST /api/coupons/validate - Validar cupom
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount, user_id, property_id } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { success: false, error: 'code e amount são obrigatórios' },
        { status: 400 }
      );
    }

    const validation = await validateCoupon(code, amount, user_id, property_id);

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: validation.error,
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discount_amount: validation.discount_amount,
      coupon: validation.coupon,
    });
  } catch (error: any) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}

