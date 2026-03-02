/**
 * ✅ API DE HISTÓRICO DE USO DE CUPONS
 * GET /api/coupons/usage - Listar histórico de uso de cupons
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

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
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar histórico de uso' },
      { status: 500 }
    );
  }
}

