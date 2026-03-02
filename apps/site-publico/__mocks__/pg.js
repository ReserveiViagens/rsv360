/**
 * ✅ MOCK MANUAL DO MÓDULO pg
 * 
 * Este mock é usado automaticamente pelo Jest quando o módulo 'pg' é importado.
 * Ele previne conexões reais ao banco de dados durante os testes.
 * 
 * Para usar este mock em um teste, simplesmente importe 'pg' normalmente.
 * Para sobrescrever o mock em um teste específico, use jest.mock('pg', ...) no teste.
 */

// Mock do Pool Client (retornado por pool.connect())
const createMockClient = () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  release: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
});

// Mock do Pool
const createMockPool = () => {
  const mockClient = createMockClient();
  
  return {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  };
};

// Mock da classe Pool
class MockPool {
  constructor(config) {
    // Armazenar config para referência (não usado, mas útil para debug)
    this._config = config;
    const pool = createMockPool();
    
    // Copiar métodos e propriedades
    Object.assign(this, pool);
  }
}

// Exportar mocks
module.exports = {
  Pool: MockPool,
  Client: jest.fn(() => createMockClient()),
  types: {
    getTypeParser: jest.fn(),
    setTypeParser: jest.fn(),
    arrayParser: jest.fn(),
    builtins: {},
  },
  defaults: {},
  native: {},
};

