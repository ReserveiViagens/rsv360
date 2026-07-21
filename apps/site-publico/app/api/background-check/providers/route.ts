/**
 * ✅ TAREFA MEDIUM-4: API para listar providers disponíveis
 * GET /api/background-check/providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { backgroundCheckService } from '@/lib/background-check-service';
import { jsonInternalError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    // Listar providers disponíveis
    const providers = await backgroundCheckService.listProviders();

    return NextResponse.json({
      success: true,
      data: providers,
    });
  } catch (error: any) {
    console.error('Erro ao listar providers:', error);
    return jsonInternalError(error);
  }
}

