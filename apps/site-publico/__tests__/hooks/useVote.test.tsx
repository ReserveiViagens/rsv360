/**
 * ✅ FASE 5 - ETAPA 5.3: Testes Frontend - useVote Hook
 * Testes para o hook de votação
 * 
 * @module __tests__/hooks/useVote.test
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVote } from '@/hooks/useVote';
import voteService from '@/lib/group-travel/api/vote.service';

// Mock do service
jest.mock('@/lib/group-travel/api/vote.service');

const mockVoteService = voteService as jest.Mocked<typeof voteService>;

describe('useVote', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('vote mutation', () => {
    it('should vote successfully', async () => {
      // Arrange
      const itemId = 'item-123';
      const mockVote = {
        id: 'vote-123',
        itemId,
        userId: 'user-123',
        voteType: 'upvote' as const,
        createdAt: new Date()
      };

      mockVoteService.vote = jest.fn().mockResolvedValue(mockVote);

      // Act
      const { result } = renderHook(() => useVote({ itemId, userId: 'user-123' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isVoting).toBe(false);
      });

      result.current.vote({ itemId, voteType: 'upvote' });

      // Assert
      await waitFor(() => {
        expect(mockVoteService.vote).toHaveBeenCalledWith(itemId, 'upvote');
      });
    });

    it('should handle vote error', async () => {
      // Arrange
      const itemId = 'item-123';
      const error = new Error('Failed to vote');

      mockVoteService.vote = jest.fn().mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useVote({ itemId, userId: 'user-123' }), { wrapper });

      result.current.vote({ itemId, voteType: 'upvote' });

      // Assert
      await waitFor(() => {
        expect(mockVoteService.vote).toHaveBeenCalled();
      });
      // O erro será tratado pelo hook e exibido via toast
    });
  });

  describe('removeVote mutation', () => {
    it('should remove vote successfully', async () => {
      // Arrange
      const itemId = 'item-123';
      mockVoteService.removeVote = jest.fn().mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useVote({ itemId, userId: 'user-123' }), { wrapper });

      result.current.removeVote(itemId);

      // Assert
      await waitFor(() => {
        expect(mockVoteService.removeVote).toHaveBeenCalledWith(itemId);
      });
    });
  });

  describe('votes query', () => {
    it('should fetch votes for an item', async () => {
      // Arrange
      const itemId = 'item-123';
      const mockVotes = [
        { id: 'vote-1', itemId, userId: 'user-1', voteType: 'upvote' as const, createdAt: new Date() },
        { id: 'vote-2', itemId, userId: 'user-2', voteType: 'downvote' as const, createdAt: new Date() }
      ];

      mockVoteService.getItemVotes = jest.fn().mockResolvedValue(mockVotes);

      // Act
      const { result } = renderHook(() => useVote({ itemId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.votes).toBeDefined();
      });

      expect(result.current.votes).toEqual(mockVotes);
      expect(mockVoteService.getItemVotes).toHaveBeenCalledWith(itemId);
    });
  });

  describe('userVote query', () => {
    it('should fetch user vote if exists', async () => {
      // Arrange
      const itemId = 'item-123';
      const userId = 'user-123';
      const mockVote = {
        id: 'vote-123',
        itemId,
        userId,
        voteType: 'upvote' as const,
        createdAt: new Date()
      };

      mockVoteService.getUserVote = jest.fn().mockResolvedValue(mockVote);

      // Act
      const { result } = renderHook(() => useVote({ itemId, userId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.userVote).toBeDefined();
      });

      expect(result.current.userVote).toEqual(mockVote);
    });

    it('should return null if user has not voted', async () => {
      // Arrange
      const itemId = 'item-123';
      const userId = 'user-123';

      mockVoteService.getUserVote = jest.fn().mockResolvedValue(null);

      // Act
      const { result } = renderHook(() => useVote({ itemId, userId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.userVote).toBeDefined();
      });

      expect(result.current.userVote).toBeNull();
    });
  });

  describe('helper functions', () => {
    it('should check if user has voted', async () => {
      // Arrange
      const itemId = 'item-123';
      const mockVote = {
        id: 'vote-123',
        itemId,
        userId: 'user-123',
        voteType: 'upvote' as const,
        createdAt: new Date()
      };

      mockVoteService.getUserVote = jest.fn().mockResolvedValue(mockVote);

      // Act
      const { result } = renderHook(() => useVote({ itemId, userId: 'user-123' }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.hasUserVoted()).toBe(true);
      });
    });

    it('should get vote count correctly', async () => {
      // Arrange
      const itemId = 'item-123';
      const mockStats = {
        upvotes: 2,
        downvotes: 1,
        total: 3
      };

      mockVoteService.getVotesStats = jest.fn().mockResolvedValue(mockStats);

      // Act
      const { result } = renderHook(() => useVote({ itemId }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.votesStats).toBeDefined();
      });

      const counts = result.current.getVotesCount();
      expect(counts.upvotes).toBe(2);
      expect(counts.downvotes).toBe(1);
      expect(counts.total).toBe(3);
    });
  });
});

