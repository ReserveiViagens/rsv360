/**
 * ✅ TAREFA MEDIUM-4: API para solicitar background check
 * POST /api/background-check/request
 */

import { NextRequest, NextResponse } from 'next/server';
import { backgroundCheckService } from '@/lib/background-check-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, cpf, full_name, birth_date, check_type, provider } = body;

    // Validar dados obrigatórios
    if (!user_id || !cpf || !full_name) {
      return NextResponse.json(
        { success: false, error: 'user_id, cpf e full_name são obrigatórios' },
        { status: 400 }
      );
    }

    // Solicitar check
    const result = await backgroundCheckService.requestCheck({
      user_id,
      cpf,
      full_name,
      birth_date,
      check_type,
      provider,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao solicitar background check:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao solicitar background check' },
      { status: 500 }
    );
  }
}

