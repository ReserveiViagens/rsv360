/**
 * ✅ FASE 4: API DE VERIFICAÇÕES PENDENTES
 * GET /api/verification/pending - Listar verificações pendentes
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getPendingVerifications } from '@/lib/verification-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    // Apenas admin pode ver verificações pendentes
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const verifications = await getPendingVerifications(limit, offset);

    return NextResponse.json({
      success: true,
      data: verifications,
      count: verifications.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar verificações pendentes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar verificações pendentes' },
      { status: 500 }
    );
  }
}

