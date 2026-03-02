/**
 * ✅ FASE 5 - ETAPA 5.1: Testes Unitários - Vote Service
 * Testes para o serviço de votação em wishlist items
 * 
 * @module __tests__/lib/group-travel/vote-service.test
 */

import VoteService from '@/lib/group-travel/vote-service';
import { queryDatabase, getDbPool } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';
import type { Vote, VoteDTO } from '@/lib/group-travel/types';

// Mocks
jest.mock('@/lib/db');
jest.mock('@/lib/redis-cache');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;
const mockGetDbPool = getDbPool as jest.MockedFunction<typeof getDbPool>;
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

// Mock do client do pool
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

describe('VoteService', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const itemId = '550e8400-e29b-41d4-a716-446655440001';
  const wishlistId = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.get = jest.fn();
    mockRedisCache.set = jest.fn();
    mockRedisCache.del = jest.fn();
    
    // Mock do pool
    mockGetDbPool.mockReturnValue({
      connect: jest.fn().mockResolvedValue(mockClient)
    } as any);
    
    // Reset client mocks
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    mockClient.query.mockResolvedValue({ rows: [] });
    mockClient.release.mockResolvedValue(undefined);
  });

  describe('vote', () => {
    it('should create an upvote successfully', async () => {
      // Arrange
      const voteDTO: VoteDTO = {
        itemId,
        voteType: 'upvote'
      };

      mockRedisCache.get = jest.fn().mockResolvedValue(null); // No rate limit
      
      // Mock getUserVote (chamado internamente) - retorna null (não votou ainda)
      jest.spyOn(VoteService, 'getUserVote').mockResolvedValue(null);
      
      // Mock client.query para transação
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ 
          rows: [{
            id: 'vote-123',
            item_id: itemId,
            user_id: userId,
            vote_type: 'up',
            created_at: new Date()
          }]
        }) // INSERT vote (RETURNING)
        .mockResolvedValueOnce({ rows: [] }) // UPDATE item votes
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const result = await VoteService.vote(userId, voteDTO);

      // Assert
      expect(result).toBeDefined();
      expect(result.voteType).toBe('upvote');
      expect(result.id).toBe('vote-123');
      expect(mockClient.query).toHaveBeenCalledTimes(4); // BEGIN, INSERT, UPDATE, COMMIT
      expect(mockRedisCache.del).toHaveBeenCalled(); // Cache invalidation
    });

    it('should update existing vote when user votes again', async () => {
      // Arrange
      const voteDTO: VoteDTO = {
        itemId,
        voteType: 'downvote'
      };

      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      // Mock getUserVote para retornar voto existente
      jest.spyOn(VoteService, 'getUserVote').mockResolvedValue({
        id: 'vote-123',
        itemId,
        userId,
        voteType: 'upvote',
        createdAt: new Date()
      });
      
      // Mock client.query para transação de atualização
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: 'vote-123',
            item_id: itemId,
            user_id: userId,
            vote_type: 'down',
            created_at: new Date()
          }]
        }) // UPDATE vote (RETURNING)
        .mockResolvedValueOnce({ rows: [] }) // UPDATE item votes (decrement up, increment down)
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      const result = await VoteService.vote(userId, voteDTO);

      // Assert
      expect(result.voteType).toBe('downvote');
      expect(mockClient.query).toHaveBeenCalledTimes(4); // BEGIN, UPDATE, UPDATE, COMMIT
    });

    it('should throw error if rate limit exceeded', async () => {
      // Arrange
      const voteDTO: VoteDTO = { itemId, voteType: 'upvote' };
      const rateLimitData = {
        count: 30, // RATE_LIMIT_MAX = 30, então 30 já excede
        resetAt: Date.now() + 60000
      };

      // Mock rate limit retornando dados que excedem o limite
      mockRedisCache.get = jest.fn().mockResolvedValue(JSON.stringify(rateLimitData));
      mockRedisCache.set = jest.fn(); // Para o incremento que será tentado

      // Act & Assert
      await expect(VoteService.vote(userId, voteDTO)).rejects.toThrow('Limite de votos excedido');
    });

    it('should throw error if item does not exist', async () => {
      // Arrange
      const voteDTO: VoteDTO = { itemId, voteType: 'upvote' };
      mockRedisCache.get = jest.fn().mockResolvedValue(null);
      
      // Mock getUserVote retornando null (usuário não votou ainda)
      jest.spyOn(VoteService, 'getUserVote').mockResolvedValue(null);
      
      // Mock client.query para simular erro ao inserir (item não existe)
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('foreign key constraint "wishlist_votes_item_id_fkey"')) // INSERT falha - item não existe
        .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      // Act & Assert
      await expect(VoteService.vote(userId, voteDTO)).rejects.toThrow();
    });
  });

  describe('removeVote', () => {
    it('should remove vote successfully', async () => {
      // Arrange
      // Mock getUserVote retornando voto existente
      jest.spyOn(VoteService, 'getUserVote').mockResolvedValue({
        id: 'vote-123',
        itemId,
        userId,
        voteType: 'upvote',
        createdAt: new Date()
      });
      
      // Mock client.query para transação
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // DELETE vote
        .mockResolvedValueOnce({ rows: [] }) // UPDATE item votes
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      // Act
      await VoteService.removeVote(userId, itemId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(4); // BEGIN, DELETE, UPDATE, COMMIT
      expect(mockRedisCache.del).toHaveBeenCalled(); // Cache invalidation
    });

    it('should throw error if vote does not exist', async () => {
      // Arrange
      // Mock getUserVote retornando null (voto não existe)
      jest.spyOn(VoteService, 'getUserVote').mockResolvedValue(null);

      // Act & Assert
      await expect(VoteService.removeVote(userId, itemId)).rejects.toThrow('Voto não encontrado');
    });
  });

  describe('getItemVotes', () => {
    it('should return votes for an item', async () => {
      // Arrange
      const mockVotes = [
        { 
          id: 'vote-1', 
          item_id: itemId,
          user_id: 'user-1', 
          vote_type: 'upvote', 
          created_at: new Date(),
          user_name: 'User 1',
          user_avatar: null
        },
        { 
          id: 'vote-2', 
          item_id: itemId,
          user_id: 'user-2', 
          vote_type: 'upvote', 
          created_at: new Date(),
          user_name: 'User 2',
          user_avatar: null
        },
        { 
          id: 'vote-3', 
          item_id: itemId,
          user_id: 'user-3', 
          vote_type: 'downvote', 
          created_at: new Date(),
          user_name: 'User 3',
          user_avatar: null
        }
      ];

      mockRedisCache.get = jest.fn().mockResolvedValue(null); // Cache miss
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce(mockVotes);
      mockRedisCache.set = jest.fn();

      // Act
      const result = await VoteService.getItemVotes(itemId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.filter(v => v.voteType === 'upvote')).toHaveLength(2);
      expect(result.filter(v => v.voteType === 'downvote')).toHaveLength(1);
      expect(mockRedisCache.set).toHaveBeenCalled(); // Cache set
    });

    it('should return cached votes if available', async () => {
      // Arrange
      const cachedVotes: Vote[] = [
        {
          id: 'vote-1',
          itemId: itemId,
          userId: 'user-1',
          voteType: 'upvote',
          createdAt: new Date(),
          user: {
            name: 'User 1',
            avatar: ''
          }
        }
      ];

      mockRedisCache.get = jest.fn().mockResolvedValue(JSON.stringify(cachedVotes));

      // Act
      const result = await VoteService.getItemVotes(itemId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].voteType).toBe('upvote');
      expect(mockQueryDatabase).not.toHaveBeenCalled(); // Should use cache
    });
  });

  describe('getUserVote', () => {
    it('should return user vote if exists', async () => {
      // Arrange
      const mockVote = {
        id: 'vote-123',
        item_id: itemId,
        user_id: userId,
        vote: 'up',
        created_at: new Date()
      };

      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([mockVote]);

      // Act
      const result = await VoteService.getUserVote(userId, itemId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.voteType).toBe('upvote');
      expect(result?.id).toBe('vote-123');
    });

    it('should return null if user has not voted', async () => {
      // Arrange
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]);

      // Act
      const result = await VoteService.getUserVote(userId, itemId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getVotesStats', () => {
    it('should calculate vote statistics correctly', async () => {
      // Arrange
      const mockStats = {
        upvotes: '3',
        downvotes: '2',
        total: '5'
      };

      mockRedisCache.get = jest.fn().mockResolvedValue(null); // Cache miss
      (mockQueryDatabase as jest.Mock).mockResolvedValueOnce([mockStats]);
      mockRedisCache.set = jest.fn();

      // Act
      const stats = await VoteService.getVotesStats(itemId);

      // Assert
      expect(stats.total).toBe(5);
      expect(stats.upvotes).toBe(3);
      expect(stats.downvotes).toBe(2);
      expect(mockRedisCache.set).toHaveBeenCalled(); // Cache set
    });
  });

  describe('bulkRemoveVotes', () => {
    it('should remove all votes for an item', async () => {
      // Arrange
      (mockQueryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ id: 'vote-1' }, { id: 'vote-2' }]) // Find votes
        .mockResolvedValueOnce([]); // Deleted

      // Act
      await VoteService.bulkRemoveVotes(itemId);

      // Assert
      expect(mockQueryDatabase).toHaveBeenCalledTimes(2);
      expect(mockRedisCache.del).toHaveBeenCalled();
    });
  });
});

