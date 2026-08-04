/**
 * ✅ API DE HISTÓRICO / RESGATE DE CUPONS
 * GET  /api/coupons/usage — listar histórico
 * POST /api/coupons/usage — resgate atômico (PR-11c)
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';
import { applyCouponToBooking } from '@/lib/coupons-service';
import { jsonInternalError } from '@/lib/api-error';

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
    const coupon_id = searchParams.get('coupon_id') ? parseInt(searchParams.get('coupon_id')!) : undefined;
    const user_id = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Verificar se tabela existe
    const tableCheck = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'coupon_usages'
      )`
    );

    if (!tableCheck[0]?.exists) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    let query = `
      SELECT 
        cu.*,
        c.code as coupon_code,
        c.name as coupon_name,
        b.code as booking_code
      FROM coupon_usages cu
      LEFT JOIN coupons c ON cu.coupon_id = c.id
      LEFT JOIN bookings b ON cu.booking_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (coupon_id) {
      query += ` AND cu.coupon_id = $${paramIndex}`;
      params.push(coupon_id);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND cu.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    } else if (user.role !== 'admin') {
      // Usuários não-admin só veem seus próprios usos
      query += ` AND cu.user_id = $${paramIndex}`;
      params.push(user.id);
      paramIndex++;
    }

    query += ` ORDER BY cu.used_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const usages = await queryDatabase(query, params);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM coupon_usages cu
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (coupon_id) {
      countQuery += ` AND cu.coupon_id = $${countParamIndex}`;
      countParams.push(coupon_id);
      countParamIndex++;
    }

    if (user_id) {
      countQuery += ` AND cu.user_id = $${countParamIndex}`;
      countParams.push(user_id);
      countParamIndex++;
    } else if (user.role !== 'admin') {
      countQuery += ` AND cu.user_id = $${countParamIndex}`;
      countParams.push(user.id);
      countParamIndex++;
    }

    const countResult = await queryDatabase(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: usages,
      count: usages.length,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Erro ao listar histórico de uso:', error);
    return jsonInternalError(error);
  }
}

/**
 * PR-11c — resgate atômico (locks coupon row; 409 se esgotado / limite por usuário).
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const couponId = Number(body.coupon_id);
    const bookingId = Number(body.booking_id);
    const originalAmount = Number(body.original_amount);
    const discountAmount = Number(body.discount_amount);

    if (
      !Number.isFinite(couponId) ||
      !Number.isFinite(bookingId) ||
      !Number.isFinite(originalAmount) ||
      !Number.isFinite(discountAmount) ||
      couponId <= 0 ||
      bookingId <= 0 ||
      originalAmount < 0 ||
      discountAmount < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'coupon_id, booking_id, original_amount e discount_amount são obrigatórios',
        },
        { status: 400 },
      );
    }

    if (discountAmount > originalAmount) {
      return NextResponse.json(
        { success: false, error: 'discount_amount não pode exceder original_amount' },
        { status: 400 },
      );
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await applyCouponToBooking(
      couponId,
      bookingId,
      user.id,
      originalAmount,
      discountAmount,
      ipAddress,
      userAgent,
    );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { success: true, usage_id: result.usageId },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Erro ao resgatar cupom:', error);
    return jsonInternalError(error);
  }
}

