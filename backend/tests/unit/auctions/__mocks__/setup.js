// Mocks para testes
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
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
  exists: jest.fn(),
};

// Setup global
beforeEach(() => {
  // Resetar mocks antes de cada teste
  jest.clearAllMocks();

  // Mock padrão para queries - retorna dados vazios
  mockPool.query.mockResolvedValue({ rows: [] });
  mockPool.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({ rows: [] });
  mockClient.release.mockResolvedValue();
});

afterEach(() => {
  // Cleanup após cada teste
});

module.exports = { mockPool, mockCache, mockLocks, mockClient };