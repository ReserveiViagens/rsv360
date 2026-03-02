/**
 * API: Votar em item da Wishlist
 * POST /api/wishlists/[id]/items/[itemId]/vote
 */

import { NextRequest, NextResponse } from 'next/server';
import { voteOnWishlistItem } from '@/lib/wishlist-service';
import { withAuth, AuthRequest } from '@/lib/api-auth';

export const POST = withAuth(
  async (request: AuthRequest) => {
    try {
      const pathParts = request.nextUrl.pathname.split('/');
      const itemIdStr = pathParts[pathParts.length - 2]; // .../items/[itemId]/vote
      const itemId = parseInt(itemIdStr, 10);

      if (isNaN(itemId)) {
        return NextResponse.json(
          { success: false, error: 'ID do item inválido' },
          { status: 400 }
        );
      }

      const body = await request.json();
      const vote = body?.vote as 'up' | 'down' | 'maybe';

      if (!vote || !['up', 'down', 'maybe'].includes(vote)) {
        return NextResponse.json(
          { success: false, error: 'Voto inválido. Use: up, down ou maybe' },
          { status: 400 }
        );
      }

      const userId = request.user?.id;
      const email = request.user?.email;

      if (!userId && !email) {
        return NextResponse.json(
          { success: false, error: 'Faça login para votar' },
          { status: 401 }
        );
      }

      const result = await voteOnWishlistItem(itemId, vote, userId, email);

      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Item não encontrado ou sem permissão para votar' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Voto registrado com sucesso',
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Erro ao registrar voto',
        },
        { status: 500 }
      );
    }
  },
  { required: false }
);
