/**
 * ✅ TESTES: CACHE SERVICE
 * Testes unitários para cache-service
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { cacheService } from '@/lib/cache-service';

describe('Cache Service', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('get/set', () => {
    it('deve armazenar e recuperar valores', () => {
      cacheService.set('test-key', { data: 'test' });
      const result = cacheService.get('test-key');

      expect(result).toEqual({ data: 'test' });
    });

    it('deve retornar null para chave inexistente', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeNull();
    });

    it('deve respeitar TTL', async () => {
      cacheService.set('test-key', { data: 'test' }, 100); // 100ms
      
      const before = cacheService.get('test-key');
      expect(before).toEqual({ data: 'test' });

      await new Promise(resolve => setTimeout(resolve, 150));

      const after = cacheService.get('test-key');
      expect(after).toBeNull();
    });
  });

  describe('delete', () => {
    it('deve remover chave do cache', () => {
      cacheService.set('test-key', { data: 'test' });
      cacheService.delete('test-key');

      const result = cacheService.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('generateKey', () => {
    it('deve gerar chave consistente', () => {
      const key1 = cacheService.generateKey('prefix', { a: 1, b: 2 });
      const key2 = cacheService.generateKey('prefix', { b: 2, a: 1 });

      expect(key1).toBe(key2);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas corretas', () => {
      cacheService.set('key1', { data: 1 });
      cacheService.set('key2', { data: 2 });

      const stats = cacheService.getStats();
      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
    });
  });
});

