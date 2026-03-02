/**
 * ✅ ITEM 71: API DE CUPONS - BACKEND
 * GET /api/coupons - Listar cupons
 * POST /api/coupons - Criar cupom
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { listCoupons, createCoupon } from '@/lib/coupons-service';

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
    const is_active = searchParams.get('is_active');
    const is_public = searchParams.get('is_public');
    const search = searchParams.get('search');

    const coupons = await listCoupons({
      is_active: is_active ? is_active === 'true' : undefined,
      is_public: is_public ? is_public === 'true' : undefined,
      search: search || undefined,
    });

    return NextResponse.json({
      success: true,
      data: coupons,
      count: coupons.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar cupons:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar cupons' },
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
    const coupon = await createCoupon(body, user.id);

    return NextResponse.json({
      success: true,
      message: 'Cupom criado com sucesso',
      data: coupon,
    });
  } catch (error: any) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar cupom' },
      { status: 500 }
    );
  }
}

