# 🔧 Abordagens para Mockar jwt.verify

## Análise do Problema

O problema atual é que `jest.mock('jsonwebtoken')` cria os mocks, mas quando fazemos `import * as jwt`, o TypeScript não reconhece corretamente que `jwt.verify` é um mock do Jest, resultando em `mockVerify.mockReturnValueOnce is not a function`.

## ✅ Abordagem 1: `jest.mocked()` (RECOMENDADA - Jest 27+)

**Vantagens:**
- ✅ Type-safe
- ✅ Moderna e recomendada pelo Jest
- ✅ Funciona perfeitamente com TypeScript
- ✅ Não requer type assertions manuais

**Implementação:**

```typescript
import { jest } from '@jest/globals';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('@/lib/db');

// Usar jest.mocked() para garantir type-safety
const mockVerify = jest.mocked(jwt.verify);
const mockQueryDatabase = jest.mocked(queryDatabase);

// Agora funciona perfeitamente:
mockVerify.mockReturnValueOnce({ userId: 1 });
mockQueryDatabase.mockResolvedValueOnce([mockUser]);
```

---

## ✅ Abordagem 2: `jest.spyOn()` (Alternativa Simples)

**Vantagens:**
- ✅ Funciona em qualquer versão do Jest
- ✅ Mais explícito sobre o que está sendo mockado
- ✅ Permite restaurar implementação original se necessário

**Desvantagens:**
- ⚠️ Requer importar o módulo real primeiro
- ⚠️ Pode ser mais verboso

**Implementação:**

```typescript
import * as jwt from 'jsonwebtoken';
import { queryDatabase } from '@/lib/db';

// Mock apenas as funções específicas
const mockVerify = jest.spyOn(jwt, 'verify');
const mockQueryDatabase = jest.spyOn(require('@/lib/db'), 'queryDatabase');

// Funciona normalmente:
mockVerify.mockReturnValueOnce({ userId: 1 });
```

---

## ✅ Abordagem 3: Factory Function com Referências Explícitas

**Vantagens:**
- ✅ Controle total sobre os mocks
- ✅ Funciona em versões antigas do Jest

**Desvantagens:**
- ⚠️ Mais verboso
- ⚠️ Requer gerenciamento manual das referências

**Implementação:**

```typescript
// Criar mocks antes do jest.mock
const mockVerify = jest.fn();
const mockSign = jest.fn();
const mockQueryDatabase = jest.fn();

jest.mock('jsonwebtoken', () => ({
  verify: (...args: any[]) => mockVerify(...args),
  sign: (...args: any[]) => mockSign(...args),
}));

jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabase(...args),
}));

// Agora usar diretamente:
mockVerify.mockReturnValueOnce({ userId: 1 });
```

---

## 🏆 RECOMENDAÇÃO FINAL

**Use a Abordagem 3 (Factory Function)** - ✅ MAIS CONFIÁVEL:
- ✅ Funciona perfeitamente com Jest 29.7.0
- ✅ Garante que os mocks são criados antes dos imports
- ✅ Controle total sobre os mocks
- ✅ Não depende de type assertions complexas

**Por que a Abordagem 3 é melhor:**
1. Os mocks são criados ANTES do `jest.mock()`, garantindo que as referências estão disponíveis
2. A factory function garante que o mock correto é usado
3. Não há problemas com cache de módulos ou ordem de importação

**NOTA:** No projeto atual (Jest 29.7.0), a **Abordagem 3 (Factory Function)** é a mais confiável e recomendada para mockar `jwt.verify` e outros módulos externos.

---

## 📝 Implementação Final para api-auth.test.ts (✅ FUNCIONANDO - Abordagem 3)

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Abordagem 3: Factory Function - Criar mocks ANTES do jest.mock
const mockVerify = jest.fn();
const mockSign = jest.fn();
const mockQueryDatabaseFn = jest.fn();

// Mock de jsonwebtoken usando factory function
jest.mock('jsonwebtoken', () => ({
  verify: (...args: any[]) => mockVerify(...args),
  sign: (...args: any[]) => mockSign(...args),
}));

// Mock de db usando factory function
jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
}));

import { extractToken, verifyToken } from '@/lib/api-auth';

// Usar as referências diretas aos mocks criados
const mockQueryDatabase = mockQueryDatabaseFn;

describe('API Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('deve verificar token válido e retornar usuário', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        status: 'active',
      };

      // Agora funciona perfeitamente!
      mockVerify.mockReturnValueOnce({ userId: 1 } as any);
      mockQueryDatabase.mockResolvedValueOnce([mockUser]);

      const user = await verifyToken('valid-token');

      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(mockQueryDatabase).toHaveBeenCalledTimes(1);
      expect(user.id).toBe(1);
    });
  });
});
```

