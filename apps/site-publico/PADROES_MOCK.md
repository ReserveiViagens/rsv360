# 🎭 PADRÕES DE MOCK - RSV Gen 2

**Data:** 11/12/2025  
**Guia de Referência Rápida**

---

## 📋 ÍNDICE RÁPIDO

1. [Database Mocks](#database-mocks)
2. [Redis Cache Mocks](#redis-cache-mocks)
3. [Transações](#transações)
4. [Serviços Internos](#serviços-internos)
5. [Exemplos Completos](#exemplos-completos)

---

## 🗄️ DATABASE MOCKS

### queryDatabase (Leituras Simples)

```typescript
import { queryDatabase } from '@/lib/db';

jest.mock('@/lib/db');
const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;

// Uso básico
mockQueryDatabase.mockResolvedValueOnce([{ id: '123', name: 'Test' }]);

// Múltiplas chamadas
mockQueryDatabase
  .mockResolvedValueOnce([{ id: '1' }])
  .mockResolvedValueOnce([{ id: '2' }]);

// Retornar array vazio (não encontrado)
mockQueryDatabase.mockResolvedValueOnce([]);
```

### getDbPool (Transações)

```typescript
import { getDbPool } from '@/lib/db';

jest.mock('@/lib/db');
const mockGetDbPool = getDbPool as jest.MockedFunction<typeof getDbPool>;

// Mock do client
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

// Setup no beforeEach
beforeEach(() => {
  mockGetDbPool.mockReturnValue({
    connect: jest.fn().mockResolvedValue(mockClient)
  } as any);
  
  mockClient.query.mockReset();
  mockClient.release.mockReset();
});
```

---

## 🔴 REDIS CACHE MOCKS

```typescript
import { redisCache } from '@/lib/redis-cache';

jest.mock('@/lib/redis-cache');
const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

// Setup
beforeEach(() => {
  mockRedisCache.get = jest.fn();
  mockRedisCache.set = jest.fn();
  mockRedisCache.del = jest.fn();
});

// Cache miss
mockRedisCache.get.mockResolvedValue(null);

// Cache hit (sempre retornar string JSON)
mockRedisCache.get.mockResolvedValue(JSON.stringify({ data: 'value' }));

// Set cache
mockRedisCache.set.mockResolvedValue(undefined);
```

---

## 💾 TRANSAÇÕES

### Transação Simples (INSERT)

```typescript
mockClient.query
  .mockResolvedValueOnce({ rows: [] }) // BEGIN
  .mockResolvedValueOnce({ 
    rows: [{ 
      id: '123',
      item_id: itemId,
      user_id: userId,
      created_at: new Date()
    }]
  }) // INSERT (RETURNING)
  .mockResolvedValueOnce({ rows: [] }) // COMMIT
```

### Transação com UPDATE

```typescript
mockClient.query
  .mockResolvedValueOnce({ rows: [] }) // BEGIN
  .mockResolvedValueOnce({ 
    rows: [{ 
      id: '123',
      status: 'updated'
    }]
  }) // UPDATE (RETURNING)
  .mockResolvedValueOnce({ rows: [] }) // UPDATE relacionado
  .mockResolvedValueOnce({ rows: [] }) // COMMIT
```

### Transação com Erro (ROLLBACK)

```typescript
mockClient.query
  .mockResolvedValueOnce({ rows: [] }) // BEGIN
  .mockRejectedValueOnce(new Error('Foreign key constraint')) // INSERT falha
  .mockResolvedValueOnce({ rows: [] }); // ROLLBACK
```

---

## 🔧 SERVIÇOS INTERNOS

### Mock de Método Interno

```typescript
// Para métodos que são chamados internamente
jest.spyOn(Service, 'internalMethod').mockResolvedValue(mockData);

// Restaurar após teste
afterEach(() => {
  jest.restoreAllMocks();
});
```

### Exemplo: getUserVote

```typescript
// Mock getUserVote retornando voto existente
jest.spyOn(VoteService, 'getUserVote').mockResolvedValue({
  id: 'vote-123',
  itemId: 'item-456',
  userId: 'user-789',
  voteType: 'upvote',
  createdAt: new Date()
});

// Mock getUserVote retornando null (não votou)
jest.spyOn(VoteService, 'getUserVote').mockResolvedValue(null);
```

---

## 📝 EXEMPLOS COMPLETOS

### Exemplo 1: Teste de Criação com Transação

```typescript
describe('createItem', () => {
  it('should create item successfully', async () => {
    // Arrange
    const itemData = { name: 'Test Item' };
    
    // Mock queryDatabase para verificação
    mockQueryDatabase.mockResolvedValueOnce([]); // Item não existe
    
    // Mock transação
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ 
        rows: [{ id: 'item-123', ...itemData }]
      }) // INSERT
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    // Act
    const result = await Service.createItem(itemData);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('item-123');
    expect(mockClient.query).toHaveBeenCalledTimes(3);
  });
});
```

### Exemplo 2: Teste com Cache

```typescript
describe('getItem', () => {
  it('should return cached item if available', async () => {
    // Arrange
    const cachedItem = { id: '123', name: 'Cached Item' };
    mockRedisCache.get.mockResolvedValue(JSON.stringify(cachedItem));

    // Act
    const result = await Service.getItem('123');

    // Assert
    expect(result).toEqual(cachedItem);
    expect(mockQueryDatabase).not.toHaveBeenCalled();
  });

  it('should fetch from database if cache miss', async () => {
    // Arrange
    mockRedisCache.get.mockResolvedValue(null); // Cache miss
    mockQueryDatabase.mockResolvedValueOnce([{ id: '123', name: 'Item' }]);
    mockRedisCache.set = jest.fn();

    // Act
    const result = await Service.getItem('123');

    // Assert
    expect(result).toBeDefined();
    expect(mockQueryDatabase).toHaveBeenCalled();
    expect(mockRedisCache.set).toHaveBeenCalled();
  });
});
```

### Exemplo 3: Teste de Rate Limit

```typescript
describe('rateLimit', () => {
  it('should throw error if rate limit exceeded', async () => {
    // Arrange
    const rateLimitData = {
      count: 30, // RATE_LIMIT_MAX = 30
      resetAt: Date.now() + 60000
    };
    
    mockRedisCache.get.mockResolvedValue(JSON.stringify(rateLimitData));

    // Act & Assert
    await expect(Service.action(userId)).rejects.toThrow('Limite excedido');
  });
});
```

---

## ⚠️ ERROS COMUNS E SOLUÇÕES

### Erro: Assignment to constant variable

```typescript
// ❌ ERRADO
mockQueryDatabase = jest.fn().mockResolvedValueOnce([...]);

// ✅ CORRETO
(mockQueryDatabase as jest.Mock).mockResolvedValueOnce([...]);
```

### Erro: Mock não está sendo chamado

```typescript
// Verificar se mock foi resetado
beforeEach(() => {
  jest.clearAllMocks();
  mockQueryDatabase.mockReset();
});
```

### Erro: Formato de retorno incorreto

```typescript
// Verificar formato esperado pelo serviço
// Cache sempre retorna string JSON
mockRedisCache.get.mockResolvedValue(JSON.stringify(data));

// Database retorna array
mockQueryDatabase.mockResolvedValueOnce([{ id: '123' }]);

// Transações retornam { rows: [...] }
mockClient.query.mockResolvedValueOnce({ rows: [{ id: '123' }] });
```

---

**Última Atualização:** 11/12/2025

