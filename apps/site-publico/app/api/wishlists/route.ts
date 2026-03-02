/**
 * ✅ ITEM 12: API DE WISHLISTS COMPARTILHADAS
 * GET /api/wishlists - Listar wishlists
 * POST /api/wishlists - Criar wishlist
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createWishlist,
  listUserWishlists,
  getWishlist,
} from '@/lib/wishlist-service';
import { createWishlistSchema, listWishlistsQuerySchema } from '@/lib/schemas/wishlist-schemas';
import { withAuth, optionalAuth, AuthRequest } from '@/lib/api-auth';

// GET /api/wishlists - Listar wishlists do usuário
export const GET = withAuth(
  async (request: AuthRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Validar query params
      const queryResult = listWishlistsQuerySchema.safeParse({
        id: searchParams.get('id'),
        token: searchParams.get('token'),
        user_id: searchParams.get('user_id'),
        email: searchParams.get('email'),
      });

      if (!queryResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Parâmetros inválidos',
            details: queryResult.error.errors,
          },
          { status: 400 }
        );
      }

      const { id, token, user_id, email } = queryResult.data;
      const userId = user_id || request.user?.id;

      // Buscar wishlist específica
      if (id || token) {
        const wishlist = await getWishlist(
          id || token!,
          userId,
          email || request.user?.email
        );

        if (!wishlist) {
          return NextResponse.json(
            { success: false, error: 'Wishlist não encontrada ou sem permissão' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: wishlist,
        });
      }

      // Listar wishlists do usuário
      const wishlists = await listUserWishlists(userId, email || request.user?.email);

      return NextResponse.json({
        success: true,
        data: wishlists,
      });
    } catch (error: any) {
      console.error('Erro ao listar wishlists:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Erro ao listar wishlists' },
        { status: 500 }
      );
    }
  },
  { required: false } // Autenticação opcional para permitir acesso via token
);

// POST /api/wishlists - Criar wishlist
export const POST = withAuth(
  async (request: AuthRequest, user) => {
    try {
      const body = await request.json();
      
      // Validar body com Zod
      const validationResult = createWishlistSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dados inválidos',
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }

      const { name, description, is_public, creator_id } = validationResult.data;

      const wishlist = await createWishlist(
        name,
        description || undefined,
        creator_id || user.id,
        is_public
      );

      return NextResponse.json({
        success: true,
        message: 'Wishlist criada com sucesso',
        data: wishlist,
      });
    } catch (error: any) {
      console.error('Erro ao criar wishlist:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Erro ao criar wishlist' },
        { status: 500 }
      );
    }
  },
  { required: true } // Autenticação obrigatória
);

