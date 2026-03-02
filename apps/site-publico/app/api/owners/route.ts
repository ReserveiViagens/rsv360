/**
 * ✅ ITEM 49: API DE PROPRIETÁRIOS - CRUD COMPLETO
 * GET /api/owners - Listar proprietários
 * POST /api/owners - Criar proprietário
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createOwner,
  listOwners,
  getOwnerById,
  updateOwner,
  getOwnerByUserId,
} from '@/lib/properties-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/owners - Listar proprietários
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      verification_status: searchParams.get('verification_status') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Se não for admin, retornar apenas o próprio proprietário
    if (user.role !== 'admin') {
      const owner = await getOwnerByUserId(user.id);
      return NextResponse.json({
        success: true,
        data: owner ? [owner] : [],
        count: owner ? 1 : 0,
      });
    }

    const owners = await listOwners(filters);

    return NextResponse.json({
      success: true,
      data: owners,
      count: owners.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar proprietários:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar proprietários' },
      { status: 500 }
    );
  }
}

// POST /api/owners - Criar proprietário
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Se não for admin, usar o próprio user_id
    if (user.role !== 'admin' && body.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para criar proprietário para outro usuário' },
        { status: 403 }
      );
    }

    const owner = await createOwner({
      ...body,
      user_id: body.user_id || user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Proprietário criado com sucesso',
      data: owner,
    });
  } catch (error: any) {
    console.error('Erro ao criar proprietário:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar proprietário' },
      { status: 500 }
    );
  }
}

