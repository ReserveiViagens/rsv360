/**
 * ✅ TAREFA MEDIUM-2: API para revogar código de smart lock
 * POST /api/smart-locks/revoke-code
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokePin } from '@/lib/smartlock-integration';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, booking_id } = body;

    // Validar dados obrigatórios
    if (!property_id || !booking_id) {
      return NextResponse.json(
        { success: false, error: 'property_id e booking_id são obrigatórios' },
        { status: 400 }
      );
    }

    // Revogar PIN
    const revoked = await revokePin(property_id, booking_id);

    if (!revoked) {
      return NextResponse.json(
        { success: false, error: 'PIN não encontrado ou já foi revogado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Código revogado com sucesso',
        property_id,
        booking_id,
      },
    });
  } catch (error: any) {
    console.error('Erro ao revogar código smart lock:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao revogar código' },
      { status: 500 }
    );
  }
}

