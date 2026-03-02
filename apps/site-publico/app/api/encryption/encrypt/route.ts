/**
 * API de Criptografia
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { encryptionService } from '@/lib/encryption-service';

/**
 * POST /api/encryption/encrypt
 * Criptografar dados
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
    const { data, algorithm, key_id } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'data é obrigatório' },
        { status: 400 }
      );
    }

    const result = await encryptionService.encrypt(data, {
      algorithm,
      keyId: key_id,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao criptografar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criptografar dados' },
      { status: 500 }
    );
  }
}

