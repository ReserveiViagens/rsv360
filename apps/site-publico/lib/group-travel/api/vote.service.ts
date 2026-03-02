/**
 * ✅ FASE 1 - ETAPA 1.5: API Service Frontend - Vote
 * Service para comunicação com API de votos
 * 
 * @module group-travel/api/vote.service
 */

import type { Vote, VoteDTO } from '../types';
import { requestWithRetry, getAuthToken } from './wishlist.service';

// ============================================
// VOTE SERVICE
// ============================================

class VoteService {
  private baseURL = '/api/wishlists/items';

  /**
   * Votar em um item
   */
  async vote(itemId: string, voteType: 'upvote' | 'downvote'): Promise<Vote> {
    const url = `${this.baseURL}/${itemId}/vote`;
    return requestWithRetry<Vote>(url, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  /**
   * Remover voto
   */
  async removeVote(itemId: string): Promise<void> {
    const url = `${this.baseURL}/${itemId}/vote`;
    await requestWithRetry<void>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Buscar votos de um item
   */
  async getItemVotes(
    itemId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Vote[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const url = `${this.baseURL}/${itemId}/votes${params.toString() ? `?${params}` : ''}`;
    return requestWithRetry<Vote[]>(url);
  }

  /**
   * Buscar voto do usuário em um item
   */
  async getUserVote(itemId: string, userId: string): Promise<Vote | null> {
    const url = `${this.baseURL}/${itemId}/votes/user/${userId}`;
    try {
      return await requestWithRetry<Vote>(url);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obter estatísticas de votos
   */
  async getVotesStats(itemId: string): Promise<{
    upvotes: number;
    downvotes: number;
    total: number;
  }> {
    const url = `${this.baseURL}/${itemId}/votes/stats`;
    return requestWithRetry<{ upvotes: number; downvotes: number; total: number }>(url);
  }
}

// Exportar instância singleton
export default new VoteService();

