// Mocks para testes
const mockPool = {
  query: jest.fn(),
  end: jest.fn(),
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  deletePattern: jest.fn(),
};

const mockLocks = {
  acquire: jest.fn(),
  release: jest.fn(),
};

// Mock do pool do PostgreSQL
jest.mock('../../../database/db', () => ({
  pool: mockPool,
}));

// Mock do Redis
jest.mock('../../../config/redis', () => ({
  cache: mockCache,
  locks: mockLocks,
}));

// Mock do logger
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Setup global
beforeEach(() => {
  // Resetar mocks antes de cada teste
  jest.clearAllMocks();

  // Mock padrão para queries - retorna dados vazios
  mockPool.query.mockResolvedValue({ rows: [] });
});

afterEach(() => {
  // Cleanup após cada teste
});