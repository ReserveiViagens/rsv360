# 🔴 Problema: checkin-service.test.ts - Mock não aplicado

**Data:** 2025-12-16  
**Status:** 🔄 Em investigação

---

## 📋 Descrição do Problema

O mock de `queryDatabase` não está sendo aplicado corretamente. O código ainda tenta conectar ao banco de dados real, resultando em:

```
error: autenticação do tipo senha falhou para o usuário "postgres"
```

---

## 🔍 Análise

### Como `queryDatabase` funciona:

```typescript
// lib/db.ts
export async function queryDatabase<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getDbPool(); // ← Chama getDbPool() internamente
  try {
    const result = await pool.query(text, params); // ← Tenta query real
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

### Como `checkin-service.ts` usa:

```typescript
// lib/checkin-service.ts
import { queryDatabase } from './db'; // ← Import direto

export async function createCheckinRequest(...) {
  const existing = await queryDatabase<DigitalCheckin>(...); // ← Chama diretamente
  // ...
}
```

### Tentativas Realizadas:

1. ❌ `jest.doMock` - não funcionou
2. ❌ `jest.mock` com factory function simples - não funcionou
3. ❌ `jest.mock` com factory function completa - não funcionou
4. ❌ Mockar `pg` diretamente - não funcionou

---

## 💡 Soluções Possíveis

### Opção 1: Mockar `pg` no `jest.setup.js` (Recomendado)

Adicionar mock global do `pg` no `jest.setup.js`:

```javascript
// jest.setup.js
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn()
  };
  
  return {
    Pool: jest.fn(() => mockPool)
  };
});
```

### Opção 2: Usar `__mocks__` directory

Criar `__mocks__/lib/db.ts`:

```typescript
export const queryDatabase = jest.fn();
export const getDbPool = jest.fn(() => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
}));
```

### Opção 3: Refatorar `checkin-service.ts` para usar injeção de dependência

Permitir passar `queryDatabase` como parâmetro (mais complexo, requer mudanças no código de produção).

---

## ✅ Próxima Ação Recomendada

**Implementar Opção 1** - Adicionar mock global do `pg` no `jest.setup.js` para interceptar todas as tentativas de conexão ao banco.

---

**Última Atualização:** 2025-12-16

