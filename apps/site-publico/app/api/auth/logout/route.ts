/**
 * ✅ ITEM 23: API DE LOGOUT
 * POST /api/auth/logout - Revogar refresh tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokeAllUserTokens } from '@/lib/refresh-token-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

// POST /api/auth/logout - Logout
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    // Revogar todos os tokens do usuário
    await revokeAllUserTokens(user.id, 'Logout do usuário');

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}

