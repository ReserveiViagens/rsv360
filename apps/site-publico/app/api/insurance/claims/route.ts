/**
 * ✅ API DE SINISTROS DE SEGURO
 * GET /api/insurance/claims - Listar sinistros do usuário
 * POST /api/insurance/claims - Registrar novo sinistro
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, withAuth } from '@/lib/api-auth';
import { createInsuranceClaim, listInsuranceClaims, updateClaimStatus } from '@/lib/insurance-service';
import { createInsuranceClaimSchema, getInsuranceClaimsQuerySchema } from '@/lib/schemas/insurance-schemas';

// GET: Listar sinistros do usuário
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = getInsuranceClaimsQuerySchema.safeParse({
      policy_id: searchParams.get('policy_id'),
      status: searchParams.get('status'),
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

    const { policy_id, status, limit, offset } = queryResult.data;

    // Buscar sinistros usando o service
    const claims = await listInsuranceClaims({
      user_id: user.id,
      policy_id,
      status,
      limit: limit || 50,
      offset: offset || 0,
    });

    // Contar total (simplificado)
    const total = claims.length;

    return NextResponse.json({
      success: true,
      data: claims,
      pagination: {
        total,
        limit: limit || 50,
        offset: offset || 0,
        hasMore: (offset || 0) + (limit || 50) < total,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar sinistros:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar sinistros' },
      { status: 500 }
    );
  }
}

// POST: Registrar novo sinistro
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = createInsuranceClaimSchema.safeParse(body);

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

    // Verificar se apólice existe e pertence ao usuário
    const { getInsurancePolicy } = await import('@/lib/insurance-service');
    const policy = await getInsurancePolicy(validatedData.policy_id, user.id);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Apólice não encontrada' },
        { status: 404 }
      );
    }

    if (policy.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Apólice não está ativa' },
        { status: 400 }
      );
    }

    // Buscar booking_id da apólice
    const bookingId = policy.booking_id;

    // Criar sinistro usando o service (com integração Kakau se aplicável)
    const claim = await createInsuranceClaim({
      policy_id: validatedData.policy_id,
      booking_id: bookingId,
      user_id: user.id,
      claim_type: validatedData.claim_type,
      description: validatedData.description,
      incident_date: validatedData.incident_date.toISOString(),
      incident_location: validatedData.incident_location,
      claimed_amount: validatedData.claimed_amount,
      documents: validatedData.documents,
      evidence_files: validatedData.evidence_files,
      metadata: validatedData.metadata,
    });

    return NextResponse.json({
      success: true,
      message: 'Sinistro registrado com sucesso',
      data: claim,
    });
  } catch (error: any) {
    console.error('Erro ao registrar sinistro:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao registrar sinistro' },
      { status: 500 }
    );
  }
});

