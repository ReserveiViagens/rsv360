/**
 * API de Descriptografia
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { encryptionService } from '@/lib/encryption-service';

/**
 * POST /api/encryption/decrypt
 * Descriptografar dados
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { encrypted_data } = body;

    if (!encrypted_data) {
      return NextResponse.json(
        { error: 'encrypted_data é obrigatório' },
        { status: 400 }
      );
    }

    const result = await encryptionService.decrypt(encrypted_data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao descriptografar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao descriptografar dados' },
      { status: 500 }
    );
  }
}

