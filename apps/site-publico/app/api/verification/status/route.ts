/**
 * API de Status de Verificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { getVerificationStatus, updatePropertyBadges } from '@/lib/verification-levels-service';

/**
 * GET /api/verification/status
 * Obter status de verificação de uma propriedade
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = parseInt(searchParams.get('property_id') || '0');

    if (!propertyId) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    const status = await getVerificationStatus(propertyId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Erro ao obter status de verificação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/verification/status/update
 * Atualizar badges de uma propriedade
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { property_id } = body;

    if (!property_id) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    const badges = await updatePropertyBadges(property_id);
    const status = await getVerificationStatus(property_id);

    return NextResponse.json({
      success: true,
      data: {
        badges,
        status,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar badges:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar badges' },
      { status: 500 }
    );
  }
}

