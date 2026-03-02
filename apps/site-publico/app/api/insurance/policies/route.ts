/**
 * ✅ API DE APÓLICES DE SEGURO
 * GET /api/insurance/policies - Listar apólices do usuário
 * POST /api/insurance/policies - Criar nova apólice
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, withAuth } from '@/lib/api-auth';
import { createInsurancePolicy, listInsurancePolicies, getInsurancePolicyByBooking } from '@/lib/insurance-service';
import { createInsurancePolicySchema, getInsurancePoliciesQuerySchema } from '@/lib/schemas/insurance-schemas';

// GET: Listar apólices do usuário
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = getInsurancePoliciesQuerySchema.safeParse({
      status: searchParams.get('status'),
      booking_id: searchParams.get('booking_id'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { status, booking_id, limit, offset } = queryResult.data;

    // Buscar apólices usando o service
    const policies = await listInsurancePolicies({
      user_id: user.id,
      booking_id,
      status,
      limit: limit || 50,
      offset: offset || 0,
    });

    // Contar total (simplificado - em produção usar COUNT separado)
    const total = policies.length;

    return NextResponse.json({
      success: true,
      data: policies,
      pagination: {
        total,
        limit: limit || 50,
        offset: offset || 0,
        hasMore: (offset || 0) + (limit || 50) < total,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar apólices:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar apólices' },
      { status: 500 }
    );
  }
}

// POST: Criar nova apólice
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = createInsurancePolicySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Verificar se booking existe e pertence ao usuário
    const { queryDatabase } = await import('@/lib/db');
    const booking = await queryDatabase(
      `SELECT id, user_id FROM bookings WHERE id = $1`,
      [validatedData.booking_id]
    );

    if (booking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (booking[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Reserva não pertence ao usuário' },
        { status: 403 }
      );
    }

    // Verificar se já existe apólice para esta reserva
    const existingPolicy = await getInsurancePolicyByBooking(validatedData.booking_id);
    if (existingPolicy && existingPolicy.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Já existe uma apólice ativa para esta reserva' },
        { status: 409 }
      );
    }

    // Criar apólice usando o service (com integração Kakau)
    const policy = await createInsurancePolicy({
      booking_id: validatedData.booking_id,
      user_id: user.id,
      insurance_provider: validatedData.insurance_provider,
      coverage_type: validatedData.coverage_type,
      coverage_amount: validatedData.coverage_amount,
      premium_amount: validatedData.premium_amount,
      deductible: validatedData.deductible,
      coverage_start_date: validatedData.coverage_start_date.toISOString(),
      coverage_end_date: validatedData.coverage_end_date.toISOString(),
      insured_name: validatedData.insured_name,
      insured_document: validatedData.insured_document,
      insured_email: validatedData.insured_email,
      insured_phone: validatedData.insured_phone,
      policy_details: validatedData.policy_details,
      terms_accepted: validatedData.terms_accepted,
    });

    return NextResponse.json({
      success: true,
      message: 'Apólice criada com sucesso',
      data: policy,
    });
  } catch (error: any) {
    console.error('Erro ao criar apólice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar apólice' },
      { status: 500 }
    );
  }
});

