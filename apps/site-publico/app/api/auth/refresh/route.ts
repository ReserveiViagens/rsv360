/**
 * ✅ ITEM 23: API DE REFRESH TOKEN
 * POST /api/auth/refresh - Renovar access token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAndRotateRefreshToken } from '@/lib/refresh-token-service';
import { getClientIP, getUserAgent } from '@/lib/advanced-auth';

// POST /api/auth/refresh - Renovar tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { success: false, error: 'refresh_token é obrigatório' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const result = await verifyAndRotateRefreshToken(
      refresh_token,
      ipAddress,
      userAgent
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Refresh token inválido ou expirado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      data: {
        access_token: result.newAccessToken,
        refresh_token: result.newRefreshToken,
        user: result.user,
        expires_in: 900, // 15 minutos em segundos
      },
    });
  } catch (error: any) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao renovar token' },
      { status: 500 }
    );
  }
}

