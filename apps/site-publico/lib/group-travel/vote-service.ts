/**
 * ✅ FASE 1 - ETAPA 1.2: Vote Service Backend
 * Serviço dedicado para gerenciar votações em itens de wishlist
 * 
 * @module group-travel/vote-service
 */

import { queryDatabase, getDbPool } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';
import type { Vote, VoteDTO } from './types';

// ============================================
// VALIDAÇÃO ZOD
// ============================================

const voteSchema = z.object({
  itemId: z.string().uuid('itemId deve ser um UUID válido'),
  voteType: z.enum(['upvote', 'downvote'], {
    errorMap: () => ({ message: 'voteType deve ser "upvote" ou "downvote"' })
  })
});

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_MAX = 30; // 30 votos por minuto
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto em ms

async function checkRateLimit(userId: string): Promise<boolean> {
  const cacheKey = `vote:ratelimit:${userId}`;
  
  try {
    const cached = await redisCache.get(cacheKey);
    
    if (!cached) {
      // Primeira requisição
      await redisCache.set(cacheKey, JSON.stringify({
        count: 1,
        resetAt: Date.now() + RATE_LIMIT_WINDOW
      }), RATE_LIMIT_WINDOW / 1000);
      return true;
    }

    const entry: RateLimitEntry = JSON.parse(cached);
    
    if (Date.now() > entry.resetAt) {
      // Janela expirou, resetar
      await redisCache.set(cacheKey, JSON.stringify({
        count: 1,
        resetAt: Date.now() + RATE_LIMIT_WINDOW
      }), RATE_LIMIT_WINDOW / 1000);
      return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
      return false; // Limite excedido
    }

    // Incrementar contador
    entry.count++;
    await redisCache.set(cacheKey, JSON.stringify(entry), 
      Math.ceil((entry.resetAt - Date.now()) / 1000));
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar rate limit:', error);
    // Em caso de erro, permitir (fail open)
    return true;
  }
}

// ============================================
// VOTE SERVICE
// ============================================

class VoteService {
  /**
   * Votar em um item da wishlist
   * Se usuário já votou:
   *   - Se voto é igual → remover voto
   *   - Se voto é diferente → atualizar voto
   * Se não votou → inserir novo voto
   */
  async vote(userId: string, data: VoteDTO): Promise<Vote> {
    try {
      // Validar dados
      const validated = voteSchema.parse(data);

      // Verificar rate limit
      const allowed = await checkRateLimit(userId);
      if (!allowed) {
        throw new Error('Limite de votos excedido. Aguarde 1 minuto.');
      }

      // Verificar se usuário já votou no item
      const existingVote = await this.getUserVote(userId, validated.itemId);

      // Iniciar transação usando pool
      const pool = getDbPool();
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        let vote: Vote;

        if (existingVote) {
          // Usuário já votou
          if (existingVote.voteType === validated.voteType) {
            // Voto igual → remover
            await client.query(
              `DELETE FROM wishlist_votes WHERE id = $1`,
              [existingVote.id]
            );
            
            // Decrementar contador
            await client.query(
              `UPDATE wishlist_items 
               SET votes_${validated.voteType === 'upvote' ? 'up' : 'down'} = GREATEST(0, votes_${validated.voteType === 'upvote' ? 'up' : 'down'} - 1)
               WHERE id = $1`,
              [validated.itemId]
            );

            // Invalidar cache
            await this.invalidateCache(validated.itemId, userId);

            throw new Error('Voto removido'); // Retornar null ou criar tipo específico
          } else {
            // Voto diferente → atualizar
            const result = await client.query(
              `UPDATE wishlist_votes 
               SET vote = $1, created_at = CURRENT_TIMESTAMP
               WHERE id = $2
               RETURNING id, item_id, user_id, vote as vote_type, created_at`,
              [validated.voteType === 'upvote' ? 'up' : 'down', existingVote.id]
            );

            // Atualizar contadores
            const oldType = existingVote.voteType === 'upvote' ? 'up' : 'down';
            const newType = validated.voteType === 'upvote' ? 'up' : 'down';

            await client.query(
              `UPDATE wishlist_items 
               SET votes_${oldType} = GREATEST(0, votes_${oldType} - 1),
                   votes_${newType} = votes_${newType} + 1
               WHERE id = $1`,
              [validated.itemId]
            );

            vote = {
              id: result.rows[0].id,
              itemId: result.rows[0].item_id,
              userId: result.rows[0].user_id,
              voteType: validated.voteType,
              createdAt: result.rows[0].created_at
            };
          }
        } else {
          // Novo voto
          const result = await client.query(
            `INSERT INTO wishlist_votes (item_id, user_id, vote, created_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             RETURNING id, item_id, user_id, vote as vote_type, created_at`,
            [
              validated.itemId,
              userId,
              validated.voteType === 'upvote' ? 'up' : 'down'
            ]
          );

          // Incrementar contador
          await client.query(
            `UPDATE wishlist_items 
             SET votes_${validated.voteType === 'upvote' ? 'up' : 'down'} = votes_${validated.voteType === 'upvote' ? 'up' : 'down'} + 1
             WHERE id = $1`,
            [validated.itemId]
          );

          vote = {
            id: result.rows[0].id,
            itemId: result.rows[0].item_id,
            userId: result.rows[0].user_id,
            voteType: validated.voteType,
            createdAt: result.rows[0].created_at
          };
        }

        await client.query('COMMIT');

        // Invalidar cache
        await this.invalidateCache(validated.itemId, userId);

        return vote;
      } catch (error: any) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      if (error.message === 'Voto removido') {
        // Retornar null ou criar tipo específico para voto removido
        throw new Error('Voto removido com sucesso');
      }
      throw new Error(`Erro ao processar voto: ${error.message}`);
    }
  }

  /**
   * Remover voto do usuário em um item
   */
  async removeVote(userId: string, itemId: string): Promise<void> {
    try {
      // Buscar voto existente
      const existingVote = await this.getUserVote(userId, itemId);
      
      if (!existingVote) {
        throw new Error('Voto não encontrado');
      }

      const pool = getDbPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Deletar voto
        await client.query(
          `DELETE FROM wishlist_votes WHERE id = $1`,
          [existingVote.id]
        );

        // Decrementar contador
        const voteType = existingVote.voteType === 'upvote' ? 'up' : 'down';
        await client.query(
          `UPDATE wishlist_items 
           SET votes_${voteType} = GREATEST(0, votes_${voteType} - 1)
           WHERE id = $1`,
          [itemId]
        );

        await client.query('COMMIT');

        // Invalidar cache
        await this.invalidateCache(itemId, userId);
      } catch (error: any) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Erro ao remover voto:', error);
      throw new Error(`Erro ao remover voto: ${error.message}`);
    }
  }

  /**
   * Buscar votos de um item com paginação
   */
  async getItemVotes(
    itemId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Vote[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const cacheKey = `vote:item:${itemId}:${limit}:${offset}`;

    try {
      // Tentar cache
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Buscar do banco
      const result = await queryDatabase(
        `SELECT 
          v.id,
          v.item_id,
          v.user_id,
          CASE WHEN v.vote = 'up' THEN 'upvote' ELSE 'downvote' END as vote_type,
          v.created_at,
          u.name as user_name,
          u.avatar_url as user_avatar
         FROM wishlist_votes v
         LEFT JOIN users u ON v.user_id = u.id
         WHERE v.item_id = $1
         ORDER BY v.created_at DESC
         LIMIT $2 OFFSET $3`,
        [itemId, limit, offset]
      );

      const votes: Vote[] = result.map((row: any) => ({
        id: row.id,
        itemId: row.item_id,
        userId: row.user_id,
        voteType: row.vote_type,
        createdAt: row.created_at,
        user: row.user_name ? {
          name: row.user_name,
          avatar: row.user_avatar || ''
        } : undefined
      }));

      // Cachear resultado (TTL 60s)
      await redisCache.set(cacheKey, JSON.stringify(votes), 60);

      return votes;
    } catch (error: any) {
      console.error('Erro ao buscar votos:', error);
      throw new Error(`Erro ao buscar votos: ${error.message}`);
    }
  }

  /**
   * Buscar voto específico do usuário em um item
   */
  async getUserVote(userId: string, itemId: string): Promise<Vote | null> {
    const cacheKey = `vote:user:${userId}:item:${itemId}`;

    try {
      // Tentar cache
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Buscar do banco
      const result = await queryDatabase(
        `SELECT 
          id,
          item_id,
          user_id,
          CASE WHEN vote = 'up' THEN 'upvote' ELSE 'downvote' END as vote_type,
          created_at
         FROM wishlist_votes
         WHERE user_id = $1 AND item_id = $2
         LIMIT 1`,
        [userId, itemId]
      );

      if (result.length === 0) {
        return null;
      }

      const vote: Vote = {
        id: result[0].id,
        itemId: result[0].item_id,
        userId: result[0].user_id,
        voteType: result[0].vote_type,
        createdAt: result[0].created_at
      };

      // Cachear resultado (TTL 300s)
      await redisCache.set(cacheKey, JSON.stringify(vote), 300);

      return vote;
    } catch (error: any) {
      console.error('Erro ao buscar voto do usuário:', error);
      throw new Error(`Erro ao buscar voto: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas de votos de um item
   */
  async getVotesStats(itemId: string): Promise<{
    upvotes: number;
    downvotes: number;
    total: number;
  }> {
    const cacheKey = `vote:stats:${itemId}`;

    try {
      // Tentar cache
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Buscar do banco
      const result = await queryDatabase(
        `SELECT 
          COUNT(*) FILTER (WHERE vote = 'up') as upvotes,
          COUNT(*) FILTER (WHERE vote = 'down') as downvotes,
          COUNT(*) as total
         FROM wishlist_votes
         WHERE item_id = $1`,
        [itemId]
      );

      const stats = {
        upvotes: parseInt(result[0].upvotes) || 0,
        downvotes: parseInt(result[0].downvotes) || 0,
        total: parseInt(result[0].total) || 0
      };

      // Cachear resultado (TTL 60s)
      await redisCache.set(cacheKey, JSON.stringify(stats), 60);

      return stats;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }

  /**
   * Remover todos os votos de um item (quando item é deletado)
   */
  async bulkRemoveVotes(itemId: string): Promise<number> {
    try {
      const result = await queryDatabase(
        `DELETE FROM wishlist_votes WHERE item_id = $1 RETURNING id`,
        [itemId]
      );

      const count = result.length;

      // Invalidar todos os caches relacionados
      await this.invalidateItemCache(itemId);

      return count;
    } catch (error: any) {
      console.error('Erro ao remover votos em massa:', error);
      throw new Error(`Erro ao remover votos: ${error.message}`);
    }
  }

  /**
   * Invalidar cache de um item e usuário
   */
  private async invalidateCache(itemId: string, userId: string): Promise<void> {
    const patterns = [
      `vote:item:${itemId}:*`,
      `vote:user:${userId}:item:${itemId}`,
      `vote:stats:${itemId}`
    ];

    for (const pattern of patterns) {
      try {
        // Redis não suporta pattern delete diretamente, então invalidamos chaves conhecidas
        await redisCache.delete(`vote:item:${itemId}:50:0`);
        await redisCache.delete(`vote:user:${userId}:item:${itemId}`);
        await redisCache.delete(`vote:stats:${itemId}`);
      } catch (error) {
        console.warn(`Erro ao invalidar cache ${pattern}:`, error);
      }
    }
  }

  /**
   * Invalidar todos os caches de um item
   */
  private async invalidateItemCache(itemId: string): Promise<void> {
    try {
      // Invalidar todas as variações de cache
      await redisCache.delete(`vote:stats:${itemId}`);
      // Nota: Para invalidar padrões, seria necessário usar SCAN, mas por simplicidade
      // invalidamos apenas as chaves mais comuns
    } catch (error) {
      console.warn(`Erro ao invalidar cache do item ${itemId}:`, error);
    }
  }
}

// Exportar instância singleton
export default new VoteService();

