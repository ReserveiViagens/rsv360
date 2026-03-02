/**
 * ✅ TESTES: API AUTH
 * Testes para autenticação e autorização
 * 
 * ✅ Usa injeção de dependência para mockar o pool do banco
 * A função __setMockPool permite injetar um pool mockado antes
 * que o código tente criar uma conexão real.
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { Pool } from 'pg';
import { __setMockPool, closeDbPool } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/api-auth';

// Mock do jsonwebtoken usando manual mock
jest.mock('jsonwebtoken');

// Importar o mock após jest.mock
import { mockVerify } from '@/__mocks__/jsonwebtoken';
import * as jwt from 'jsonwebtoken';

describe('API Authentication', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockQuery: jest.Mock;

  beforeAll(() => {
    // Criar mock do Pool
    mockQuery = jest.fn();
    mockPool = {
      query: mockQuery,
      connect: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
      }),
      end: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any;

    // Injetar mock no sistema
    __setMockPool(mockPool);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar mockQuery para retornar array vazio por padrão
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    // Resetar mockVerify
    mockVerify.mockClear();
  });

  afterAll(async () => {
    await closeDbPool();
  });

  describe('extractToken', () => {
    it('deve extrair token do header Authorization', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') return 'Bearer test-token-123';
            return null;
          },
        },
      } as any;

      const token = extractToken(request);
      expect(token).toBe('test-token-123');
    });

    it('deve retornar null quando não há header Authorization', () => {
      const request = {
        headers: {
          get: () => null,
        },
      } as any;

      const token = extractToken(request);
      expect(token).toBeNull();
    });

    it('deve retornar null quando formato do header é inválido', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') return 'InvalidFormat test-token';
            return null;
          },
        },
      } as any;

      const token = extractToken(request);
      expect(token).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('deve verificar token válido e retornar usuário', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        phone: '1234567890',
        status: 'active',
      };

      // Mock JWT verify retornando payload válido
      mockVerify.mockReturnValueOnce({
        userId: 1,
        email: 'test@example.com',
      });

      // Mock do banco retornando usuário
      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const user = await verifyToken('valid-token-123');

      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(mockVerify).toHaveBeenCalledWith(
        'valid-token-123',
        expect.any(String) // JWT_SECRET
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
    });

    it('deve lançar erro quando token é inválido', async () => {
      // Mock JWT verify lançando erro
      const jwtError: any = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      
      mockVerify.mockImplementationOnce(() => {
        throw jwtError;
      });

      await expect(verifyToken('invalid-token')).rejects.toThrow('Invalid token');
      expect(mockQuery).not.toHaveBeenCalled(); // Não deve chamar DB
    });

    it('deve lançar erro quando usuário não existe no banco', async () => {
      // JWT válido mas usuário não encontrado
      mockVerify.mockReturnValueOnce({
        userId: 999,
        email: 'ghost@example.com',
      });

      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Nenhum usuário encontrado

      await expect(verifyToken('token-with-deleted-user')).rejects.toThrow('User not found');
      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando token está expirado', async () => {
      mockVerify.mockImplementationOnce(() => {
        const error: any = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(verifyToken('expired-token')).rejects.toThrow('Token expired');
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando usuário está inativo', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        phone: '1234567890',
        status: 'inactive', // Usuário inativo
      };

      mockVerify.mockReturnValueOnce({
        userId: 1,
        email: 'test@example.com',
      });

      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      await expect(verifyToken('valid-token')).rejects.toThrow('User account is inactive');
    });
  });
});

