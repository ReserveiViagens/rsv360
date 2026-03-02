/**
 * API de Verificação com AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { verifyPropertyWithAI } from '@/lib/ai-verification-service';
import { validatePropertyAddress } from '@/lib/google-maps-verification-service';
import { updatePropertyBadges } from '@/lib/verification-levels-service';

/**
 * POST /api/verification/verify
 * Executar verificação completa (AI + Google Maps)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { property_id, include_address_validation = true } = body;

    if (!property_id) {
      return NextResponse.json({ error: 'property_id é obrigatório' }, { status: 400 });
    }

    // Verificação AI
    const aiResult = await verifyPropertyWithAI(property_id);

    // Validação de endereço (opcional)
    let addressValidation = null;
    if (include_address_validation) {
      try {
        addressValidation = await validatePropertyAddress(property_id);
      } catch (error) {
        console.error('Erro ao validar endereço:', error);
      }
    }

    // Atualizar badges
    const badges = await updatePropertyBadges(property_id);

    return NextResponse.json({
      success: true,
      data: {
        verification: aiResult,
        addressValidation,
        badges,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar propriedade:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar propriedade' },
      { status: 500 }
    );
  }
}

