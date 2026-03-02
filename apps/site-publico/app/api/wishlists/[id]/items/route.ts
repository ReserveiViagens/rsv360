/**
 * API: Itens da Wishlist
 * GET /api/wishlists/[id]/items - Listar itens da wishlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { listWishlistItems } from '@/lib/wishlist-service';
import { withAuth, AuthRequest } from '@/lib/api-auth';

export const GET = withAuth(
  async (request: AuthRequest) => {
    try {
      const id = request.nextUrl.pathname.split('/')[3]; // wishlists/[id]/items
      const wishlistId = parseInt(id, 10);

      if (isNaN(wishlistId)) {
        return NextResponse.json(
          { success: false, error: 'ID da wishlist inválido' },
          { status: 400 }
        );
      }

      const userId = request.user?.id;
      const email = request.user?.email;

      const items = await listWishlistItems(wishlistId, userId, email);

      // Mapear para o formato esperado pelo VotingPanel (compatível com diferentes schemas)
      const mappedItems = items.map((item: any) => {
        const votesUp = parseInt(item.votes_up || 0);
        const votesDown = parseInt(item.votes_down || 0);
        const votesMaybe = parseInt(item.votes_maybe || 0);
        const totalVotes = votesUp + votesDown + votesMaybe;

        return {
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
      });

      return NextResponse.json({
        success: true,
        data: mappedItems,
      });
    } catch (error: any) {
      console.error('Erro ao listar itens da wishlist:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Erro ao carregar itens',
        },
        { status: 500 }
      );
    }
  },
  { required: false }
);
