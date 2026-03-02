/**
 * ✅ ITEM 51: API DE INTERAÇÕES
 * GET /api/crm/interactions - Listar interações
 * POST /api/crm/interactions - Criar interação
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createInteraction,
  listInteractions,
} from '@/lib/crm-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/crm/interactions - Listar interações
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
      customer_id: searchParams.get('customer_id') ? parseInt(searchParams.get('customer_id')!) : undefined,
      user_id: searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined,
      interaction_type: searchParams.get('interaction_type') || undefined,
      channel: searchParams.get('channel') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const interactions = await listInteractions(filters);

    return NextResponse.json({
      success: true,
      data: interactions,
      count: interactions.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar interações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar interações' },
      { status: 500 }
    );
  }
}

// POST /api/crm/interactions - Criar interação
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
    const interaction = await createInteraction({
      ...body,
      user_id: body.user_id || user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Interação criada com sucesso',
      data: interaction,
    });
  } catch (error: any) {
    console.error('Erro ao criar interação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar interação' },
      { status: 500 }
    );
  }
}

