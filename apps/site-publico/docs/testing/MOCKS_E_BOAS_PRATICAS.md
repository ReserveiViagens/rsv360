# 🧪 Mocks e Boas Práticas para Testes

**Data:** 2025-12-16  
**Versão:** 1.0

---

## 📋 Visão Geral

Este documento descreve a estratégia de mocks implementada no projeto RSV 360 para garantir testes robustos, reutilizáveis e fáceis de manter.

---

## 🏗️ Arquitetura de Mocks

### 1. Mocks Manuais (Recomendado)

**Localização:** `__mocks__/`

Os mocks manuais são arquivos que o Jest usa automaticamente quando você chama `jest.mock('module-name')`. Eles são a melhor opção para mocks reutilizáveis.

#### Estrutura:

```
__mocks__/
  ├── pg.js                    # Mock do módulo pg (PostgreSQL)
  └── @/
      └── lib/
          └── db.ts            # Mock do módulo @/lib/db
```

#### Exemplo: `__mocks__/pg.js`

```javascript
// Mock do Pool Client
const createMockClient = () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  release: jest.fn(),
  // ... outros métodos
});

// Mock da classe Pool
class MockPool {
  constructor(config) {
    // Implementação do mock
  }
}

module.exports = {
  Pool: MockPool,
  Client: jest.fn(() => createMockClient()),
  // ... outros exports
};
```

#### Como Usar:

```typescript
// No teste, simplesmente importe normalmente
import { Pool } from 'pg';

// O Jest automaticamente usará __mocks__/pg.js
// Não precisa de jest.mock('pg') se já estiver no jest.setup.js
```

---

### 2. Mock Global no `jest.setup.js`

**Uso:** Para mocks que devem ser aplicados em TODOS os testes.

#### Exemplo:

```javascript
// jest.setup.js
jest.mock('pg'); // Usa automaticamente __mocks__/pg.js
```

**Vantagens:**
- Aplicado automaticamente em todos os testes
- Não precisa repetir em cada arquivo de teste
- Previne conexões acidentais ao banco

**Desvantagens:**
- Pode interferir com mocks específicos
- Difícil de sobrescrever em testes individuais

---

### 3. Mocks Específicos em Testes (Factory Function)

**Uso:** Quando você precisa personalizar o comportamento do mock em um teste específico.

#### Abordagem Recomendada (Factory Function):

```typescript
// ✅ CORRETO: Criar mocks ANTES do jest.mock()
const mockQueryDatabaseFn = jest.fn();

jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
  getDbPool: jest.fn(() => ({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    // ...
  }))
}));

// Agora você pode usar mockQueryDatabaseFn diretamente
mockQueryDatabaseFn.mockResolvedValueOnce([{ id: 1 }]);
```

#### ❌ EVITAR: Criar mocks DENTRO do jest.mock()

```typescript
// ❌ ERRADO: Mock criado dentro do factory
jest.mock('@/lib/db', () => {
  const mockFn = jest.fn(); // Não pode ser acessado fora
  return {
    queryDatabase: mockFn
  };
});
```

---

## 🎯 Padrões de Mock por Tipo

### 1. Mock de Módulos de Banco de Dados

#### Para `pg` (PostgreSQL):

```typescript
// ✅ Usar mock manual de __mocks__/pg.js
// Não precisa fazer nada, já está configurado no jest.setup.js
```

#### Para `@/lib/db`:

```typescript
// ✅ Opção 1: Usar mock manual (padrão)
jest.mock('@/lib/db');

// ✅ Opção 2: Personalizar com factory function
const mockQueryDatabaseFn = jest.fn();
jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
  getDbPool: jest.fn(() => createMockPool())
}));
```

### 2. Mock de Serviços Externos

#### Para APIs HTTP:

```typescript
// Mock do fetch global
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' })
});
```

#### Para Redis:

```typescript
jest.mock('@/lib/redis-cache', () => ({
  redisCache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(true),
  }
}));
```

### 3. Mock de JWT (jsonwebtoken)

```typescript
// ✅ Abordagem 3: Factory Function
const mockVerify = jest.fn();
const mockSign = jest.fn();

jest.mock('jsonwebtoken', () => ({
  verify: (...args: any[]) => mockVerify(...args),
  sign: (...args: any[]) => mockSign(...args),
}));

// Usar diretamente
mockVerify.mockReturnValueOnce({ userId: 1 });
```

---

## 🔧 Boas Práticas

### 1. ✅ Sempre Limpar Mocks Entre Testes

```typescript
describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpa todos os mocks
  });
});
```

### 2. ✅ Usar `mockResolvedValueOnce` para Sequências

```typescript
// Para múltiplas chamadas em sequência
mockQueryDatabaseFn
  .mockResolvedValueOnce([]) // Primeira chamada
  .mockResolvedValueOnce([{ id: 1 }]) // Segunda chamada
  .mockResolvedValueOnce([{ id: 2 }]); // Terceira chamada
```

### 3. ✅ Verificar Chamadas dos Mocks

```typescript
expect(mockQueryDatabaseFn).toHaveBeenCalledTimes(2);
expect(mockQueryDatabaseFn).toHaveBeenCalledWith(
  'SELECT * FROM users WHERE id = $1',
  [1]
);
```

### 4. ✅ Mockar Apenas o Necessário

```typescript
// ✅ BOM: Mock apenas o que você precisa
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
}));

// ❌ EVITAR: Mockar tudo sem necessidade
jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn(),
  getDbPool: jest.fn(),
  getWebsiteContent: jest.fn(), // Não usado no teste
}));
```

### 5. ✅ Documentar Mocks Complexos

```typescript
/**
 * Mock de queryDatabase para este teste específico
 * 
 * Sequência de chamadas esperadas:
 * 1. Verificar se booking existe (retorna [])
 * 2. Criar check-in (retorna mockCheckin)
 */
mockQueryDatabaseFn
  .mockResolvedValueOnce([])
  .mockResolvedValueOnce([mockCheckin]);
```

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: Mock não está sendo aplicado

**Sintoma:** Teste tenta conectar ao banco real

**Solução:**
1. Verificar se `jest.mock('module-name')` está ANTES dos imports
2. Verificar se o mock manual existe em `__mocks__/`
3. Limpar cache do Jest: `npm test -- --clearCache`

### Problema 2: `mockFn.mockReturnValue is not a function`

**Sintoma:** Erro ao tentar usar métodos do mock

**Solução:**
- Usar Factory Function: criar `jest.fn()` ANTES do `jest.mock()`
- Ver exemplo em "Abordagem Recomendada (Factory Function)"

### Problema 3: Mock retorna dados incorretos

**Sintoma:** Mock retorna array vazio quando deveria retornar dados

**Solução:**
- Verificar se `mockResolvedValueOnce` está na ordem correta
- Verificar se não há `jest.clearAllMocks()` no meio do teste
- Usar `mockResolvedValue` para valores padrão

---

## 📚 Referências

- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest Factory Functions](https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options)

---

## 🔄 Atualizações Futuras

### Como Adicionar Novo Mock Manual:

1. Criar arquivo em `__mocks__/module-name.js` (ou `.ts`)
2. Implementar mock seguindo o padrão existente
3. Documentar no teste como usar
4. Atualizar este documento se necessário

### Como Atualizar Mock Existente:

1. Editar arquivo em `__mocks__/`
2. Manter compatibilidade com testes existentes
3. Testar que todos os testes ainda passam
4. Atualizar documentação se comportamento mudar

---

**Última Atualização:** 2025-12-16

