# ✅ Solução Final: Mock de checkin-service.test.ts

**Data:** 2025-12-16  
**Status:** 🔄 Em Implementação

---

## 🔍 Problema Identificado

O mock de `queryDatabase` não está sendo aplicado corretamente. O código ainda tenta conectar ao banco real, indicando que:

1. O mock de `queryDatabase` não está interceptando as chamadas
2. O `queryDatabase` está usando `getDbPool()` internamente, que tenta criar um pool real
3. O mock do `pg` no `jest.setup.js` não está sendo aplicado antes que o módulo seja carregado

---

## 💡 Solução Definitiva

### Problema Raiz

O `queryDatabase` em `lib/db.ts` chama `getDbPool()` internamente:

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

### Solução: Mockar `getDbPool` para Retornar Pool Mockado

O mock de `getDbPool` precisa retornar um pool que tenha `query` mockado:

```typescript
const mockPoolQuery = jest.fn();
const mockPool = {
  query: mockPoolQuery,
  // ...
};

jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => mockQueryDatabaseFn(...args),
  getDbPool: jest.fn(() => mockPool) // ← Retornar pool mockado
}));
```

**MAS** o problema é que `queryDatabase` ainda vai tentar usar `getDbPool().query()`, então precisamos garantir que o mock de `queryDatabase` intercepte ANTES.

---

## ✅ Solução Implementada

### Abordagem: Mock Completo de `queryDatabase`

O mock de `queryDatabase` deve interceptar TODAS as chamadas, não apenas algumas:

```typescript
const mockQueryDatabaseFn = jest.fn();

jest.mock('@/lib/db', () => ({
  queryDatabase: (...args: any[]) => {
    // Interceptar e retornar diretamente do mock
    return mockQueryDatabaseFn(...args);
  },
  getDbPool: jest.fn(() => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    // ...
  }))
}));
```

---

## 🔧 Correção Final

A solução é garantir que o mock de `queryDatabase` seja uma função que **sempre** chama `mockQueryDatabaseFn`, e que `mockQueryDatabaseFn` seja configurado corretamente antes de cada teste.

---

**Última Atualização:** 2025-12-16

