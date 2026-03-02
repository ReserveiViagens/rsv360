/**
 * ✅ ITEM 47: API DE PROPRIEDADES - CRUD COMPLETO
 * GET /api/properties - Listar propriedades
 * POST /api/properties - Criar propriedade
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '@/lib/properties-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// GET /api/properties - Listar propriedades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      owner_id: searchParams.get('owner_id') ? parseInt(searchParams.get('owner_id')!) : undefined,
      property_type: searchParams.get('property_type') || undefined,
      status: searchParams.get('status') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      is_featured: searchParams.get('is_featured') === 'true' ? true : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      min_guests: searchParams.get('min_guests') ? parseInt(searchParams.get('min_guests')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const properties = await listProperties(filters);

    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar propriedades:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar propriedades' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Criar propriedade
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

    const property = await createProperty(body, user.id);

    return NextResponse.json({
      success: true,
      message: 'Propriedade criada com sucesso',
      data: property,
    });
  } catch (error: any) {
    console.error('Erro ao criar propriedade:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar propriedade' },
      { status: 500 }
    );
  }
}
