# Status: api-auth.test.ts

## ✅ Progresso

1. **Mock de jsonwebtoken**: ✅ Funcionando corretamente
   - Manual mock criado em `__mocks__/jsonwebtoken.ts`
   - `mockVerify` está sendo chamado corretamente

2. **Mock de @/lib/db**: ❌ Não está funcionando
   - O `queryDatabase` real está sendo chamado
   - Está tentando conectar ao banco real ("🔌 Conectando ao banco")
   - O mock não está interceptando a chamada

## 🔍 Problema Identificado

O `queryDatabase` em `lib/db.ts` chama `getDbPool()` internamente:

```typescript
export async function queryDatabase<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getDbPool(); // ← Isso tenta criar uma conexão real
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

O mock de `@/lib/db` não está sendo aplicado antes que `lib/api-auth.ts` importe `queryDatabase`.

## 💡 Soluções Tentadas

1. ✅ Factory function com `jest.mock` - Não funcionou
2. ✅ `jest.doMock` - Não funcionou
3. ✅ Manual mock em `__mocks__/@/lib/db.ts` - Não funcionou
4. ⏳ Usar injeção de dependência (como em `checkin-service.test.ts`)

## 🎯 Próxima Solução Recomendada

Usar a mesma abordagem de injeção de dependência que funcionou para `checkin-service.test.ts`:

1. Usar `__setMockPool` para injetar um pool mockado
2. Criar um mock do Pool com `query` method
3. Injetar antes de importar `api-auth`

OU

Usar `jest.spyOn` para mockar `queryDatabase` diretamente após o import.

---

**Status**: ⏳ Em progresso - Mock de `queryDatabase` não está funcionando

