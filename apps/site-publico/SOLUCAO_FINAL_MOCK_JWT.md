# ✅ Solução Final para Mock de jwt.verify

## 🔍 Problema Identificado

O mock de `jwt.verify` não estava funcionando porque:
1. O módulo `api-auth.ts` importa `jsonwebtoken` antes do mock ser aplicado
2. O Jest pode estar usando uma versão cached do módulo
3. O mock precisa ser criado ANTES do `jest.mock()` para garantir que as referências estão corretas

## ✅ Solução: Abordagem 3 - Factory Function

**Esta é a melhor abordagem** porque:
- ✅ Cria os mocks ANTES do `jest.mock()`
- ✅ Garante que as referências estão disponíveis quando o módulo é mockado
- ✅ Funciona perfeitamente com Jest 29.7.0
- ✅ Não depende de type assertions complexas

## 📝 Implementação

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ✅ PASSO 1: Criar os mocks ANTES do jest.mock()
const mockVerify = jest.fn();
const mockSign = jest.fn();
const mockQueryDatabaseFn = jest.fn();

// ✅ PASSO 2: Mockar os módulos usando factory functions
jest.mock('jsonwebtoken', () => ({
  verify: (...args: any[]) => mockVerify(...args),
  sign: (...args: any[]) => mockSign(...args),
}));

jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
}));

// ✅ PASSO 3: Importar os módulos DEPOIS dos mocks
import { extractToken, verifyToken } from '@/lib/api-auth';

// ✅ PASSO 4: Usar as referências diretas aos mocks
const mockQueryDatabase = mockQueryDatabaseFn;

describe('API Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify.mockReset();
    mockQueryDatabase.mockReset();
  });

  it('deve verificar token válido e retornar usuário', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      status: 'active',
    };

    // Configurar mocks
    mockVerify.mockReturnValueOnce({ userId: 1 } as any);
    mockQueryDatabase.mockResolvedValueOnce([mockUser]);

    const user = await verifyToken('valid-token');

    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(mockQueryDatabase).toHaveBeenCalledTimes(1);
    expect(user.id).toBe(1);
  });
});
```

## 🎯 Por que Funciona

1. **Ordem de Execução:**
   - Os mocks são criados primeiro (`jest.fn()`)
   - Depois o `jest.mock()` usa esses mocks na factory function
   - Por último, os módulos são importados, já com os mocks aplicados

2. **Referências Corretas:**
   - A factory function retorna uma função que chama o mock criado
   - Isso garante que o mock correto é usado, não uma nova instância

3. **Sem Problemas de Cache:**
   - Como os mocks são criados antes, não há problemas com cache de módulos

## ⚠️ Problemas Comuns e Soluções

### Problema: "mockReturnValueOnce is not a function"
**Solução:** Certifique-se de que o mock foi criado com `jest.fn()` ANTES do `jest.mock()`

### Problema: Mock não está sendo interceptado
**Solução:** Use factory functions que retornam funções que chamam os mocks criados

### Problema: "Cannot redefine property"
**Solução:** Não use `jest.spyOn()` em módulos já mockados com `jest.mock()`

## 📚 Referências

- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Jest Factory Functions](https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options)

