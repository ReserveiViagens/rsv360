# 📚 GUIA DE TESTES - RSV Gen 2

**Data:** 11/12/2025  
**Versão:** 2.0.0

---

## 📋 ÍNDICE

1. [Configuração](#configuração)
2. [Padrões de Mock](#padrões-de-mock)
3. [Estrutura de Testes](#estrutura-de-testes)
4. [Executando Testes](#executando-testes)
5. [Boas Práticas](#boas-práticas)

---

## ⚙️ CONFIGURAÇÃO

### Arquivos de Configuração

- **jest.config.js** - Configuração principal do Jest
- **jest.setup.js** - Setup global (polyfills, mocks)

### Dependências Necessárias

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0"
  }
}
```

---

## 🎭 PADRÕES DE MOCK

### 1. Mock de Database (queryDatabase)

```typescript
import { queryDatabase } from '@/lib/db';

jest.mock('@/lib/db');

const mockQueryDatabase = queryDatabase as jest.MockedFunction<typeof queryDatabase>;

// Uso
mockQueryDatabase.mockResolvedValueOnce([{ id: '123', name: 'Test' }]);
```

### 2. Mock de Database Pool (getDbPool)

```typescript
import { getDbPool } from '@/lib/db';

jest.mock('@/lib/db');

const mockGetDbPool = getDbPool as jest.MockedFunction<typeof getDbPool>;

// Mock do client
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

// Configuração
mockGetDbPool.mockReturnValue({
  connect: jest.fn().mockResolvedValue(mockClient)
} as any);

// Uso em transações
mockClient.query
  .mockResolvedValueOnce({ rows: [] }) // BEGIN
  .mockResolvedValueOnce({ rows: [{ id: '123' }] }) // INSERT/UPDATE (RETURNING)
  .mockResolvedValueOnce({ rows: [] }) // COMMIT
```

### 3. Mock de Redis Cache

```typescript
import { redisCache } from '@/lib/redis-cache';

jest.mock('@/lib/redis-cache');

const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

// Configuração
mockRedisCache.get = jest.fn();
mockRedisCache.set = jest.fn();
mockRedisCache.del = jest.fn();

// Uso
mockRedisCache.get.mockResolvedValue(null); // Cache miss
mockRedisCache.get.mockResolvedValue(JSON.stringify({ data: 'value' })); // Cache hit
```

### 4. Mock de Serviços Internos

```typescript
// Para métodos internos que precisam ser mockados
jest.spyOn(Service, 'methodName').mockResolvedValue(mockData);
```

---

## 📁 ESTRUTURA DE TESTES

```
__tests__/
├── lib/
│   ├── group-travel/
│   │   ├── vote-service.test.ts
│   │   ├── split-payment-service.test.ts
│   │   ├── wishlist-service.test.ts
│   │   └── group-chat-service.test.ts
│   ├── smart-pricing-service.test.ts
│   └── top-host-service.test.ts
├── hooks/
│   ├── useVote.test.tsx
│   ├── useSharedWishlist.test.tsx
│   ├── useSplitPayment.test.tsx
│   └── useGroupChat.test.tsx
├── components/
│   ├── pricing/
│   │   ├── PricingChart.test.tsx
│   │   ├── PricingCalendar.test.tsx
│   │   └── PricingConfig.test.tsx
│   └── quality/
│       ├── HostBadges.test.tsx
│       ├── QualityDashboard.test.tsx
│       ├── RatingDisplay.test.tsx
│       └── IncentivesPanel.test.tsx
├── integration/
│   ├── wishlist-flow.test.ts
│   ├── split-payment-flow.test.ts
│   ├── group-chat-flow.test.ts
│   └── permissions-flow.test.ts
└── performance/
    ├── load-test.test.ts
    ├── response-time.test.ts
    └── optimizations.test.ts
```

---

## 🚀 EXECUTANDO TESTES

### Comandos Básicos

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm test -- --coverage

# Executar testes específicos
npm test -- __tests__/lib/group-travel/vote-service.test.ts

# Executar testes de uma pasta
npm test -- __tests__/lib/group-travel

# Executar testes sem cobertura (mais rápido)
npm test -- --no-coverage
```

### Executar por Categoria

```bash
# Backend Services
npm test -- __tests__/lib

# Frontend Hooks
npm test -- __tests__/hooks

# Frontend Components
npm test -- __tests__/components

# Integração E2E
npm test -- __tests__/integration

# Performance
npm test -- __tests__/performance
```

---

## ✅ BOAS PRÁTICAS

### 1. Estrutura de Teste (AAA Pattern)

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange - Preparar dados e mocks
      const mockData = { id: '123' };
      mockQueryDatabase.mockResolvedValueOnce([mockData]);

      // Act - Executar ação
      const result = await Service.methodName('123');

      // Assert - Verificar resultado
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });
  });
});
```

### 2. Limpeza de Mocks

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Resetar mocks específicos
  mockClient.query.mockReset();
  mockClient.release.mockReset();
});
```

### 3. Testes de Erro

```typescript
it('should throw error when data is invalid', async () => {
  // Arrange
  mockQueryDatabase.mockResolvedValueOnce([]);

  // Act & Assert
  await expect(Service.methodName('invalid')).rejects.toThrow('Error message');
});
```

### 4. Testes de Cache

```typescript
it('should return cached data if available', async () => {
  // Arrange
  const cachedData = { id: '123' };
  mockRedisCache.get.mockResolvedValue(JSON.stringify(cachedData));

  // Act
  const result = await Service.getData('123');

  // Assert
  expect(result).toEqual(cachedData);
  expect(mockQueryDatabase).not.toHaveBeenCalled(); // Não deve chamar DB
});
```

### 5. Testes de Transações

```typescript
it('should handle transaction correctly', async () => {
  // Arrange
  mockClient.query
    .mockResolvedValueOnce({ rows: [] }) // BEGIN
    .mockResolvedValueOnce({ rows: [{ id: '123' }] }) // INSERT
    .mockResolvedValueOnce({ rows: [] }) // COMMIT

  // Act
  await Service.createWithTransaction(data);

  // Assert
  expect(mockClient.query).toHaveBeenCalledTimes(3);
  expect(mockClient.release).toHaveBeenCalled();
});
```

---

## 🔍 TROUBLESHOOTING

### Problema: TextEncoder is not defined

**Solução:** Adicionar polyfill no `jest.setup.js`:
```javascript
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

### Problema: Assignment to constant variable

**Solução:** Usar type assertion ao invés de reatribuir:
```typescript
// ❌ Errado
mockQueryDatabase = jest.fn();

// ✅ Correto
(mockQueryDatabase as jest.Mock).mockResolvedValueOnce([...]);
```

### Problema: Mock não está funcionando

**Solução:** Verificar ordem dos mocks e usar `mockResolvedValueOnce`:
```typescript
// Resetar antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
  mockQueryDatabase.mockReset();
});
```

---

## 📊 COBERTURA DE TESTES

### Meta de Cobertura

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### Verificar Cobertura

```bash
npm test -- --coverage
```

### Relatório de Cobertura

Após executar com `--coverage`, o relatório será gerado em:
- `coverage/lcov-report/index.html` (HTML)
- `coverage/coverage-summary.json` (JSON)

---

## 📝 NOTAS IMPORTANTES

1. **UUIDs Válidos:** Sempre use UUIDs válidos nos testes para passar validação Zod
2. **Formato de Retorno:** Mocks devem retornar dados no mesmo formato que o serviço real
3. **Transações:** Sempre mockar BEGIN, COMMIT e ROLLBACK para transações
4. **Cache:** Cache Redis retorna strings JSON, não objetos
5. **Isolamento:** Cada teste deve ser independente e não depender de outros

---

**Última Atualização:** 11/12/2025

