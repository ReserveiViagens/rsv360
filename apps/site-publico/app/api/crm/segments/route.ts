/**
 * ✅ ITEM 52: API DE SEGMENTAÇÃO
 * GET /api/crm/segments - Listar segmentos
 * POST /api/crm/segments - Criar segmento
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSegment,
  listSegments,
  getSegmentById,
  calculateSegmentCustomers,
} from '@/lib/crm-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/crm/segments - Listar segmentos
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
      is_active: searchParams.get('is_active') === 'true' ? true : 
                 searchParams.get('is_active') === 'false' ? false : undefined,
    };

    const segments = await listSegments(filters);

    return NextResponse.json({
      success: true,
      data: segments,
      count: segments.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar segmentos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar segmentos' },
      { status: 500 }
    );
  }
}

// POST /api/crm/segments - Criar segmento
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
    const segment = await createSegment({
      ...body,
      created_by: user.id,
    });

    // Calcular clientes automaticamente se is_auto_update
    if (segment.is_auto_update) {
      await calculateSegmentCustomers(segment.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Segmento criado com sucesso',
      data: segment,
    });
  } catch (error: any) {
    console.error('Erro ao criar segmento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar segmento' },
      { status: 500 }
    );
  }
}

