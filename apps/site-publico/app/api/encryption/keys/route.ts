/**
 * API de Gerenciamento de Chaves
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { keyManagementService } from '@/lib/key-management-service';

/**
 * GET /api/encryption/keys
 * Listar chaves de criptografia
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const keys = await keyManagementService.listKeys(includeInactive);

    // Não retornar as chaves reais por segurança
    const safeKeys = keys.map(key => ({
      id: key.id,
      type: key.type,
      algorithm: key.algorithm,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      isActive: key.isActive,
      usageCount: key.usageCount,
      lastUsed: key.lastUsed,
    }));

    return NextResponse.json({
      success: true,
      data: safeKeys,
    });
  } catch (error: any) {
    console.error('Erro ao listar chaves:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao listar chaves' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/encryption/keys/rotate
 * Rotacionar chave
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
    const { key_id } = body;

    if (!key_id) {
      return NextResponse.json(
        { error: 'key_id é obrigatório' },
        { status: 400 }
      );
    }

    const newKey = await keyManagementService.rotateKey(key_id);

    return NextResponse.json({
      success: true,
      data: {
        id: newKey.id,
        type: newKey.type,
        algorithm: newKey.algorithm,
        createdAt: newKey.createdAt,
        expiresAt: newKey.expiresAt,
      },
      message: 'Chave rotacionada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao rotacionar chave:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao rotacionar chave' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/encryption/keys/rotation-check
 * Verificar chaves que precisam ser rotacionadas
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const keysToRotate = await keyManagementService.checkKeyRotation();

    return NextResponse.json({
      success: true,
      data: {
        keysToRotate,
        count: keysToRotate.length,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar rotação de chaves:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar rotação de chaves' },
      { status: 500 }
    );
  }
}

