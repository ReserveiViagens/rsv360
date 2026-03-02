/**
 * API de Hashing
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { encryptionService } from '@/lib/encryption-service';

/**
 * POST /api/encryption/hash
 * Gerar hash de dados
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { data, algorithm, salt } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'data é obrigatório' },
        { status: 400 }
      );
    }

    const result = await encryptionService.hash(
      data,
      algorithm || 'sha256',
      salt
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao gerar hash:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar hash' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/encryption/hash/verify
 * Verificar hash
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { data, hash, salt, algorithm } = body;

    if (!data || !hash || !salt) {
      return NextResponse.json(
        { error: 'data, hash e salt são obrigatórios' },
        { status: 400 }
      );
    }

    const isValid = await encryptionService.verifyHash(
      data,
      hash,
      salt,
      algorithm || 'sha256'
    );

    return NextResponse.json({
      success: true,
      data: { valid: isValid },
    });
  } catch (error: any) {
    console.error('Erro ao verificar hash:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar hash' },
      { status: 500 }
    );
  }
}

