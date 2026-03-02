/**
 * ✅ TAREFA HIGH-2: API para atribuir usuário a variante
 */

import { NextRequest, NextResponse } from 'next/server';
import { assignParticipant } from '@/lib/ab-testing-service';

/**
 * POST /api/pricing/ab-test/assign
 * Atribuir usuário a uma variante do experimento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experiment_id, user_id } = body;

    if (!experiment_id || !user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'experiment_id e user_id são obrigatórios',
        },
        { status: 400 }
      );
    }

    const participant = await assignParticipant(
      parseInt(experiment_id),
      parseInt(user_id)
    );

    return NextResponse.json({
      success: true,
      data: participant,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao atribuir participante',
      },
      { status: 500 }
    );
  }
}

