/**
 * ✅ API de Customer Profiles
 * GET /api/crm/customers - Listar perfis de clientes
 * POST /api/crm/customers - Criar perfil de cliente
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { CustomerProfileQuerySchema } from '@/lib/schemas/crm-schemas';

// GET /api/crm/customers - Listar perfis de clientes
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
    
    // Validar query params
    const queryParams = {
      user_id: searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined,
      customer_id: searchParams.get('customer_id') ? parseInt(searchParams.get('customer_id')!) : undefined,
      loyalty_tier: searchParams.get('loyalty_tier') || undefined,
      min_total_spent: searchParams.get('min_total_spent') ? parseFloat(searchParams.get('min_total_spent')!) : undefined,
      max_total_spent: searchParams.get('max_total_spent') ? parseFloat(searchParams.get('max_total_spent')!) : undefined,
      min_bookings: searchParams.get('min_bookings') ? parseInt(searchParams.get('min_bookings')!) : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sort_by: searchParams.get('sort_by') || 'total_spent',
      sort_order: (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc',
    };

    // Validar com schema Zod
    const validatedParams = CustomerProfileQuerySchema.parse(queryParams);

    // Construir query
    let query = `
      SELECT 
        cp.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        c.name as customer_name,
        c.email as customer_email
      FROM customer_profiles cp
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN customers c ON cp.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (validatedParams.user_id) {
      query += ` AND cp.user_id = $${paramIndex}`;
      params.push(validatedParams.user_id);
      paramIndex++;
    }

    if (validatedParams.customer_id) {
      query += ` AND cp.customer_id = $${paramIndex}`;
      params.push(validatedParams.customer_id);
      paramIndex++;
    }

    if (validatedParams.loyalty_tier) {
      query += ` AND cp.loyalty_tier = $${paramIndex}`;
      params.push(validatedParams.loyalty_tier);
      paramIndex++;
    }

    if (validatedParams.min_total_spent !== undefined) {
      query += ` AND cp.total_spent >= $${paramIndex}`;
      params.push(validatedParams.min_total_spent);
      paramIndex++;
    }

    if (validatedParams.max_total_spent !== undefined) {
      query += ` AND cp.total_spent <= $${paramIndex}`;
      params.push(validatedParams.max_total_spent);
      paramIndex++;
    }

    if (validatedParams.min_bookings !== undefined) {
      query += ` AND cp.total_bookings >= $${paramIndex}`;
      params.push(validatedParams.min_bookings);
      paramIndex++;
    }

    if (validatedParams.tags && validatedParams.tags.length > 0) {
      query += ` AND cp.tags && $${paramIndex}`;
      params.push(validatedParams.tags);
      paramIndex++;
    }

    // Ordenação
    const sortByMap: Record<string, string> = {
      total_spent: 'cp.total_spent',
      total_bookings: 'cp.total_bookings',
      last_booking_at: 'cp.last_booking_at',
      created_at: 'cp.created_at',
    };
    const sortColumn = sortByMap[validatedParams.sort_by] || 'cp.total_spent';
    query += ` ORDER BY ${sortColumn} ${validatedParams.sort_order.toUpperCase()}`;

    // Paginação
    const offset = (validatedParams.page - 1) * validatedParams.limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(validatedParams.limit, offset);

    // Executar query
    const profiles = await queryDatabase(query, params);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM customer_profiles cp
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (validatedParams.user_id) {
      countQuery += ` AND cp.user_id = $${countParamIndex}`;
      countParams.push(validatedParams.user_id);
      countParamIndex++;
    }

    if (validatedParams.customer_id) {
      countQuery += ` AND cp.customer_id = $${countParamIndex}`;
      countParams.push(validatedParams.customer_id);
      countParamIndex++;
    }

    if (validatedParams.loyalty_tier) {
      countQuery += ` AND cp.loyalty_tier = $${countParamIndex}`;
      countParams.push(validatedParams.loyalty_tier);
      countParamIndex++;
    }

    if (validatedParams.min_total_spent !== undefined) {
      countQuery += ` AND cp.total_spent >= $${countParamIndex}`;
      countParams.push(validatedParams.min_total_spent);
      countParamIndex++;
    }

    if (validatedParams.max_total_spent !== undefined) {
      countQuery += ` AND cp.total_spent <= $${countParamIndex}`;
      countParams.push(validatedParams.max_total_spent);
      countParamIndex++;
    }

    if (validatedParams.min_bookings !== undefined) {
      countQuery += ` AND cp.total_bookings >= $${countParamIndex}`;
      countParams.push(validatedParams.min_bookings);
      countParamIndex++;
    }

    if (validatedParams.tags && validatedParams.tags.length > 0) {
      countQuery += ` AND cp.tags && $${countParamIndex}`;
      countParams.push(validatedParams.tags);
      countParamIndex++;
    }

    const countResult = await queryDatabase(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: profiles,
      pagination: {
        total,
        page: validatedParams.page,
        limit: validatedParams.limit,
        total_pages: Math.ceil(total / validatedParams.limit),
        has_more: offset + validatedParams.limit < total,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar perfis de clientes:', error);
    
    // Se for erro de validação Zod, retornar 400
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar perfis de clientes' },
      { status: 500 }
    );
  }
}

// POST /api/crm/customers - Criar perfil de cliente
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
    
    // Validar com schema Zod
    const { CreateCustomerProfileSchema } = await import('@/lib/schemas/crm-schemas');
    const validatedData = CreateCustomerProfileSchema.parse(body);

    // Inserir perfil
    const result = await queryDatabase(
      `INSERT INTO customer_profiles 
       (user_id, customer_id, preferences, loyalty_tier, total_spent, total_bookings, 
        last_booking_at, first_booking_at, average_booking_value, lifetime_value,
        churn_risk_score, engagement_score, tags, notes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        validatedData.user_id || null,
        validatedData.customer_id || null,
        JSON.stringify(validatedData.preferences || {}),
        validatedData.loyalty_tier || 'bronze',
        validatedData.total_spent || 0,
        validatedData.total_bookings || 0,
        validatedData.last_booking_at || null,
        validatedData.first_booking_at || null,
        validatedData.average_booking_value || 0,
        validatedData.lifetime_value || 0,
        validatedData.churn_risk_score || 0,
        validatedData.engagement_score || 0,
        validatedData.tags || [],
        validatedData.notes || null,
        JSON.stringify(validatedData.metadata || {}),
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Perfil de cliente criado com sucesso',
      data: result[0],
    });
  } catch (error: any) {
    console.error('Erro ao criar perfil de cliente:', error);
    
    // Se for erro de validação Zod, retornar 400
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar perfil de cliente' },
      { status: 500 }
    );
  }
}

