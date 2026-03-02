/**
 * ✅ API DE LISTAGEM DE VERIFICAÇÕES (Admin)
 * GET /api/verification/list - Listar solicitações de verificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { listVerificationRequests } from '@/lib/verification-service';
import { listVerificationRequestsQuerySchema } from '@/lib/schemas/verification-schemas';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;

  // Verificar se é admin
  if (user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Acesso negado. Apenas administradores podem listar verificações' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = listVerificationRequestsQuerySchema.safeParse({
      status: searchParams.get('status'),
      host_id: searchParams.get('host_id'),
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

    const { status, host_id, limit, offset } = queryResult.data;

    // Buscar verificações
    const verifications = await listVerificationRequests({
      status,
      host_id,
      limit: limit || 50,
      offset: offset || 0,
    });

    return NextResponse.json({
      success: true,
      data: verifications,
      pagination: {
        total: verifications.length,
        limit: limit || 50,
        offset: offset || 0,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar verificações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar verificações' },
      { status: 500 }
    );
  }
}

