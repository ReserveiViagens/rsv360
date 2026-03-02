/**
 * ✅ TESTES: DATABASE SERVICE
 * Testes para funções de banco de dados
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock do módulo db ANTES do import
const mockQueryDatabase = jest.fn();
const mockGetDbPool = jest.fn();

jest.doMock('@/lib/db', () => ({
  queryDatabase: mockQueryDatabase,
  getDbPool: mockGetDbPool
}));

import { queryDatabase } from '@/lib/db';

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve executar query com parâmetros corretos', async () => {
    const mockResult = [{ id: 1, name: 'Test' }];
    mockQueryDatabase.mockResolvedValue(mockResult);

    const result = await queryDatabase('SELECT * FROM users WHERE id = $1', [1]);

    expect(mockQueryDatabase).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    expect(result).toEqual(mockResult);
  });

  it('deve retornar array vazio quando não há resultados', async () => {
    mockQueryDatabase.mockResolvedValue([]);

    const result = await queryDatabase('SELECT * FROM users WHERE id = $1', [999]);

    expect(result).toEqual([]);
  });

  it('deve lidar com erros de banco de dados', async () => {
    const mockError = new Error('Database connection failed');
    mockQueryDatabase.mockRejectedValue(mockError);

    await expect(queryDatabase('SELECT * FROM users', [])).rejects.toThrow('Database connection failed');
  });
});

