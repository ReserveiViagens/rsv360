/**
 * API de Tiers de Fidelidade
 * GET /api/loyalty/tiers - Listar tiers disponíveis
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const tiers = await queryDatabase(
      `SELECT * FROM loyalty_tiers 
       WHERE is_active = true 
       ORDER BY tier_order ASC, min_points ASC`
    );

    return NextResponse.json({
      success: true,
      data: tiers,
      count: tiers.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar tiers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar tiers' },
      { status: 500 }
    );
  }
}

