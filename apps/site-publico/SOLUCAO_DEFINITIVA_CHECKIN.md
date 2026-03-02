# ✅ Solução Definitiva: checkin-service.test.ts

**Data:** 2025-12-16  
**Status:** 🔄 Problema Complexo - Requer Análise Mais Profunda

---

## 🚨 Problema Identificado

O mock de `queryDatabase` **NÃO está interceptando** as chamadas. O código ainda tenta conectar ao banco real, causando:

1. **Log:** "🔌 Conectando ao banco" - Indica que `getDbPool()` está sendo executado
2. **Erro:** "Erro ao criar check-in" - O mock não retorna os dados esperados

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

### Opção 1: Verificar se o Mock Está Sendo Aplicado

Adicionar logs de debug para verificar se o mock está sendo chamado:

```typescript
queryDatabase: (...args: any[]) => {
  console.log('🔍 Mock queryDatabase chamado!', args);
  return mockQueryDatabaseFn(...args);
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

1. Adicionar logs de debug para verificar se o mock está sendo chamado
2. Tentar `jest.spyOn` em vez de `jest.mock`
3. Verificar se há cache de módulos interferindo
4. Considerar refatorar o teste para uma abordagem diferente

---

**Última Atualização:** 2025-12-16

