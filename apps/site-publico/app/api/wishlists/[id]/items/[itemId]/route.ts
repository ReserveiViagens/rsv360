/**
 * API: Item individual da Wishlist
 * GET /api/wishlists/[id]/items/[itemId] - Buscar item específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { listWishlistItems } from '@/lib/wishlist-service';
import { withAuth, AuthRequest } from '@/lib/api-auth';

export const GET = withAuth(
  async (request: AuthRequest) => {
    try {
      const pathParts = request.nextUrl.pathname.split('/');
      const wishlistId = parseInt(pathParts[pathParts.length - 3], 10); // wishlists/[id]/items/[itemId]
      const itemId = parseInt(pathParts[pathParts.length - 1], 10);

      if (isNaN(wishlistId) || isNaN(itemId)) {
        return NextResponse.json(
          { success: false, error: 'IDs inválidos' },
          { status: 400 }
        );
      }

      const userId = request.user?.id;
      const email = request.user?.email;

      const items = await listWishlistItems(wishlistId, userId, email);
      const item = items.find((i: any) => i.id === itemId);

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Item não encontrado' },
          { status: 404 }
        );
      }

      const votesUp = parseInt(item.votes_up || 0);
      const votesDown = parseInt(item.votes_down || 0);
      const votesMaybe = parseInt(item.votes_maybe || 0);
      const totalVotes = votesUp + votesDown + votesMaybe;

      const mappedItem = {
        id: item.id,
        wishlist_id: item.wishlist_id,
        property_id: item.property_id ?? item.item_id,
        item_name: item.item_name || item.item_title || item.notes || `Item #${item.id}`,
        item_description: item.item_description ?? item.notes,
        item_url: item.item_url,
        votes_up: votesUp,
        votes_down: votesDown,
        votes_maybe: votesMaybe,
        total_votes: totalVotes,
        user_vote: item.user_vote || null,
      };

      return NextResponse.json({
        success: true,
        data: mappedItem,
      });
    } catch (error: any) {
      console.error('Erro ao buscar item:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Erro ao carregar item',
        },
        { status: 500 }
      );
    }
  },
  { required: false }
);
