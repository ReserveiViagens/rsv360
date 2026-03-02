# ✅ Solução Final: checkin-service.test.ts

**Data:** 2025-12-16  
**Status:** ✅ Implementado

---

## 🔍 Problema Identificado

O mock de `queryDatabase` não estava sendo aplicado corretamente porque:

1. `queryDatabase` chama `getDbPool()` internamente
2. `getDbPool()` tenta criar um `new Pool()` real antes do mock interceptar
3. Isso causa "🔌 Conectando ao banco" e falha nos testes

---

## ✅ Solução Implementada

### Abordagem: Mock Completo com Factory Function

O mock de `queryDatabase` agora intercepta **TODAS** as chamadas antes que `getDbPool()` seja executado:

```typescript
const mockQueryDatabaseFn = jest.fn();

jest.mock('@/lib/db', () => {
  const createMockPool = () => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  });

  return {
    // Intercepta TODAS as chamadas antes de getDbPool() ser executado
    queryDatabase: (...args: any[]) => {
      return mockQueryDatabaseFn(...args);
    },
    // Mock de getDbPool também previne criação de pool real
    getDbPool: jest.fn(() => createMockPool())
  };
});
```

### Por Que Funciona

1. **Mock de `queryDatabase` intercepta primeiro**: Quando `checkin-service.ts` chama `queryDatabase()`, o mock intercepta **antes** que o código real execute `getDbPool()`
2. **Mock de `getDbPool` como fallback**: Se por algum motivo `getDbPool()` for chamado diretamente, ele retorna um pool mockado
3. **Factory Function**: Garante que os mocks são criados antes dos imports

---

## 📝 Configuração dos Testes

### beforeEach

```typescript
beforeEach(() => {
  // mockReset() limpa histórico mas mantém a função mock
  // Não usar clearAllMocks() porque pode interferir com mockResolvedValueOnce
  mockQueryDatabaseFn.mockReset();
});
```

### Configuração de Mocks por Teste

```typescript
it('deve criar uma solicitação de check-in com sucesso', async () => {
  const mockCheckin = { /* ... */ };

  // Configurar mocks ANTES de chamar a função
  mockQueryDatabaseFn
    .mockResolvedValueOnce([]) // 1. SELECT retorna vazio
    .mockResolvedValueOnce([mockCheckin]); // 2. INSERT retorna mockCheckin

  const result = await createCheckinRequest({ /* ... */ });

  expect(result).toBeDefined();
  expect(result.id).toBe(1);
  expect(mockQueryDatabaseFn).toHaveBeenCalledTimes(2);
});
```

---

## ✅ Resultado

- ✅ Mock de `queryDatabase` intercepta corretamente
- ✅ Não há mais tentativas de conexão real ao banco
- ✅ Testes passam corretamente
- ✅ Compatível com outros testes que usam mocks similares

---

## 🔄 Compatibilidade

Esta solução é compatível com:
- ✅ Mock global do `pg` no `jest.setup.js`
- ✅ Mock manual em `__mocks__/@/lib/db.ts`
- ✅ Outros testes que mockam `@/lib/db` especificamente

---

**Última Atualização:** 2025-12-16

