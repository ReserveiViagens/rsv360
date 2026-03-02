# 🔍 Resumo do Problema: checkin-service.test.ts

**Data:** 2025-12-16  
**Status:** 🔄 Problema Identificado - Solução em Análise

---

## 🚨 Problema Principal

O mock de `queryDatabase` não está sendo aplicado corretamente. O código ainda tenta conectar ao banco real, causando:

1. **Erro:** "Erro ao criar check-in" - O mock não retorna os dados esperados
2. **Log:** "🔌 Conectando ao banco" - Indica que `getDbPool()` está sendo executado

---

## 🔍 Causa Raiz

### Código Real (`lib/db.ts`)

```typescript
export async function queryDatabase<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getDbPool(); // ← Tenta criar pool real
  try {
    const result = await pool.query(text, params); // ← Usa pool real
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

### Problema

O mock de `queryDatabase` está configurado, mas quando o código chama `queryDatabase`, ele internamente chama `getDbPool()`, que tenta criar um `new Pool()` real antes que o mock possa interceptar.

---

## 💡 Soluções Tentadas

1. ✅ Factory Function - Mock criado antes do `jest.mock()`
2. ✅ Mock específico de `@/lib/db` - Sobrescreve mock manual
3. ✅ Mock global do `pg` - Previne conexões reais
4. ⏳ Ajustar ordem dos mocks - Em teste

---

## ✅ Solução Recomendada

### Opção 1: Mockar `getDbPool` para Retornar Pool Mockado

Garantir que o mock de `getDbPool` retorne um pool que tenha `query` mockado:

```typescript
const mockPoolQuery = jest.fn();
const mockPool = {
  query: mockPoolQuery,
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: jest.fn(),
  }),
  end: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
  getDbPool: jest.fn(() => mockPool) // ← Retornar pool mockado
}));
```

### Opção 2: Usar `jest.doMock` para Garantir Ordem

Usar `jest.doMock` em vez de `jest.mock` para garantir que o mock seja aplicado antes do import:

```typescript
jest.doMock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
  getDbPool: jest.fn(() => mockPool)
}));
```

---

## 📝 Próximos Passos

1. Implementar Opção 1 ou Opção 2
2. Testar se o mock está sendo aplicado corretamente
3. Verificar se os testes passam
4. Documentar a solução final

---

**Última Atualização:** 2025-12-16

