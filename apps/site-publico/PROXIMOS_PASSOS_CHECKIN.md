# ✅ Status Final: checkin-service.test.ts

**Data:** 2025-12-16  
**Status:** 🔄 Problema Complexo - Requer Análise Mais Profunda

---

## 🚨 Problema Identificado

O mock de `queryDatabase` **NÃO está interceptando** as chamadas. O código ainda tenta conectar ao banco real, causando:

1. **Erro:** "Erro ao criar check-in" - O mock não retorna os dados esperados (`result.length === 0`)
2. **Log:** "🔌 Conectando ao banco" - Indica que `getDbPool()` está sendo executado

---

## 🔍 Causa Raiz

### Fluxo do Problema

1. `checkin-service.ts` importa `queryDatabase` de `./db` no topo do arquivo
2. Quando `queryDatabase` é chamado, ele executa `getDbPool()` internamente
3. `getDbPool()` tenta criar um `new Pool()` real **ANTES** que o mock possa interceptar
4. O mock de `queryDatabase` nunca é chamado porque o código real está sendo executado

### Código Real (`lib/db.ts`)

```typescript
export async function queryDatabase<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getDbPool(); // ← Executa ANTES do mock interceptar
  try {
    const result = await pool.query(text, params); // ← Usa pool real
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

---

## 💡 Soluções Tentadas

1. ✅ **Factory Function com jest.mock** - Mock criado antes do import
2. ✅ **jest.doMock** - Tentativa de garantir ordem correta
3. ✅ **Mock de getDbPool** - Pool mockado para prevenir conexões
4. ✅ **Mock global do pg** - Previne criação de Pool real
5. ⏳ **Verificação de chamadas** - Em progresso

**Resultado:** Nenhuma solução funcionou completamente.

---

## 🎯 Solução Recomendada

### Opção 1: Refatorar `lib/db.ts` para Permitir Injeção de Dependência

Modificar `lib/db.ts` para aceitar um pool mockado:

```typescript
let pool: Pool | null = null;
let mockPool: Pool | null = null;

export function setMockPool(mock: Pool) {
  mockPool = mock;
}

export function getDbPool(): Pool {
  if (mockPool) return mockPool; // ← Usar mock se disponível
  if (!pool) {
    // ... criar pool real
  }
  return pool;
}
```

### Opção 2: Usar `jest.spyOn` em vez de `jest.mock`

Em vez de mockar o módulo inteiro, usar `jest.spyOn` para interceptar chamadas:

```typescript
import * as dbModule from '@/lib/db';

jest.spyOn(dbModule, 'queryDatabase').mockImplementation((...args) => {
  return mockQueryDatabaseFn(...args);
});
```

### Opção 3: Refatorar o Teste para Usar Mocks Diferentes

Em vez de mockar `@/lib/db`, mockar diretamente as funções que são chamadas.

---

## 📝 Próximos Passos

1. **Análise Profunda:** Verificar se há cache de módulos interferindo
2. **Testar Opção 1:** Refatorar `lib/db.ts` para permitir injeção de dependência
3. **Testar Opção 2:** Usar `jest.spyOn` em vez de `jest.mock`
4. **Considerar Refatoração:** Modificar a arquitetura para facilitar testes

---

**Última Atualização:** 2025-12-16  
**Status:** 🔄 Aguardando Implementação de Solução Definitiva

