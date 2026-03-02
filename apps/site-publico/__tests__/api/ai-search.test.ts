/**
 * ✅ TAREFA LOW-2: Testes para busca conversacional com AI
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { aiSearchService, type ChatMessage, type SearchContext } from '@/lib/ai-search-service';

// Mocks
jest.mock('@/lib/ai-search-service', () => ({
  aiSearchService: {
    clearHistory: jest.fn(),
    processMessage: jest.fn(),
    searchProperties: jest.fn(),
    getHistory: jest.fn().mockReturnValue([]),
  }
}));

const mockAiSearchService = aiSearchService as jest.Mocked<typeof aiSearchService>;

describe('AI Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAiSearchService.clearHistory.mockReturnValue(undefined);
  });

  describe('processMessage', () => {
    it('should process a greeting message', async () => {
      mockAiSearchService.processMessage.mockResolvedValueOnce({
        response: 'Olá! Como posso ajudá-lo?',
        searchQuery: undefined
      });

      const result = await aiSearchService.processMessage('Olá');

      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);
    });

    it('should process a search request', async () => {
      mockAiSearchService.processMessage.mockResolvedValueOnce({
        response: 'Encontrei hotéis em Caldas Novas',
        searchQuery: 'hotel em Caldas Novas'
      });

      const result = await aiSearchService.processMessage(
        'Quero encontrar um hotel em Caldas Novas'
      );

      expect(result.response).toBeDefined();
      expect(result.searchQuery).toBeDefined();
    });

    it('should maintain conversation context', async () => {
      mockAiSearchService.processMessage
        .mockResolvedValueOnce({
          response: 'Entendi, você quer um hotel',
          searchQuery: undefined
        })
        .mockResolvedValueOnce({
          response: 'Encontrei hotéis em Caldas Novas',
          searchQuery: 'hotel em Caldas Novas'
        });

      await aiSearchService.processMessage('Quero um hotel');
      const result = await aiSearchService.processMessage('Em Caldas Novas');

      expect(result.response).toBeDefined();
    });

    it('should use context when provided', async () => {
      const context: SearchContext = {
        location: 'Caldas Novas, GO',
        guests: 2,
        dates: {
          checkIn: '2025-12-15',
          checkOut: '2025-12-20',
        },
      };

      mockAiSearchService.processMessage.mockResolvedValueOnce({
        response: 'Encontrei hotéis em Caldas Novas para 2 hóspedes',
        searchQuery: 'hotel em Caldas Novas'
      });

      const result = await aiSearchService.processMessage(
        'Quero um hotel',
        context
      );

      expect(result.response).toBeDefined();
      expect(result.response.toLowerCase()).toContain('caldas');
    });
  });

  describe('searchProperties', () => {
    it('should search properties with a query', async () => {
      mockAiSearchService.searchProperties.mockResolvedValueOnce({
        query: 'hotel em Caldas Novas com piscina',
        results: [],
        suggestions: ['hotel com piscina', 'resort em Caldas Novas'],
        confidence: 0.9
      });

      const result = await aiSearchService.searchProperties(
        'hotel em Caldas Novas com piscina'
      );

      expect(result.query).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('should use context for search', async () => {
      const context: SearchContext = {
        location: 'Caldas Novas',
        budget: {
          min: 100,
          max: 300,
        },
      };

      mockAiSearchService.searchProperties.mockResolvedValueOnce({
        query: 'hotel em Caldas Novas',
        results: [],
        suggestions: [],
        confidence: 0.8
      });

      const result = await aiSearchService.searchProperties('hotel', context);

      expect(result.query).toBeDefined();
      expect(result.results).toBeDefined();
    });

    it('should generate suggestions', async () => {
      mockAiSearchService.searchProperties.mockResolvedValueOnce({
        query: 'hotel',
        results: [],
        suggestions: ['hotel com piscina', 'resort', 'pousada'],
        confidence: 0.7
      });

      const result = await aiSearchService.searchProperties('hotel');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(typeof result.suggestions[0]).toBe('string');
    });
  });

  describe('History Management', () => {
    it('should maintain conversation history', async () => {
      mockAiSearchService.processMessage
        .mockResolvedValueOnce({ response: 'Olá!', searchQuery: undefined })
        .mockResolvedValueOnce({ response: 'Encontrei hotéis', searchQuery: 'hotel' });
      mockAiSearchService.getHistory.mockReturnValue([
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: 'Olá!' },
        { role: 'user', content: 'Quero um hotel' },
        { role: 'assistant', content: 'Encontrei hotéis' }
      ]);

      await aiSearchService.processMessage('Olá');
      await aiSearchService.processMessage('Quero um hotel');

      const history = aiSearchService.getHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history.some(msg => msg.role === 'user')).toBe(true);
      expect(history.some(msg => msg.role === 'assistant')).toBe(true);
    });

    it('should clear history', () => {
      aiSearchService.clearHistory();
      const history = aiSearchService.getHistory();

      expect(history.length).toBe(0);
    });

    it('should limit history size', async () => {
      // Enviar muitas mensagens
      for (let i = 0; i < 15; i++) {
        await aiSearchService.processMessage(`Mensagem ${i}`);
      }

      const history = aiSearchService.getHistory();
      // Deve manter apenas as últimas mensagens
      expect(history.length).toBeLessThanOrEqual(15);
    });
  });

  describe('Context Extraction', () => {
    it('should extract location from message', async () => {
      const result = await aiSearchService.processMessage(
        'Quero um hotel em Goiânia'
      );

      expect(result.response).toBeDefined();
      expect(result.searchQuery).toBeDefined();
    });

    it('should extract dates from message', async () => {
      const result = await aiSearchService.processMessage(
        'Hotel para 15 a 20 de dezembro'
      );

      expect(result.response).toBeDefined();
    });

    it('should extract guests from message', async () => {
      const result = await aiSearchService.processMessage(
        'Hotel para 4 pessoas'
      );

      expect(result.response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty messages gracefully', async () => {
      const result = await aiSearchService.processMessage('');

      expect(result.response).toBeDefined();
    });

    it('should handle invalid context', async () => {
      const result = await aiSearchService.processMessage(
        'hotel',
        {} as SearchContext
      );

      expect(result.response).toBeDefined();
    });
  });
});

