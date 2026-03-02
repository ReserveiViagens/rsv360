# 🔍 Análise Detalhada: Problema do Mock em checkin-service.test.ts

**Data:** 2025-12-16  
**Status:** 🔄 Em Investigação

---

## 📋 Problema

O mock de `queryDatabase` não está retornando os dados corretos. O teste espera que a segunda chamada retorne `[mockCheckin]`, mas está retornando array vazio, causando o erro "Erro ao criar check-in".

---

## 🔍 Análise do Código

### Código Real (`lib/checkin-service.ts`)

```typescript
export async function createCheckinRequest(data: CheckinRequest): Promise<DigitalCheckin> {
  // 1. Verificar se já existe check-in
  const existing = await queryDatabase<DigitalCheckin>(
    `SELECT * FROM digital_checkins WHERE booking_id = $1`,
    [data.booking_id]
  );

  if (existing.length > 0) {
    throw new Error('Check-in já existe para esta reserva');
  }

  // 2. Criar registro
  const result = await queryDatabase<DigitalCheckin>(
    `INSERT INTO digital_checkins (...) VALUES (...) RETURNING *`,
    [...]
  );

  if (result.length === 0) {
    throw new Error('Erro ao criar check-in'); // ← Erro aqui
  }

  return result[0];
}
```

### Mock Configurado

```typescript
mockQueryDatabaseFn
  .mockResolvedValueOnce([]) // 1. SELECT retorna vazio
  .mockResolvedValueOnce([mockCheckin]); // 2. INSERT deveria retornar mockCheckin
```

---

## 🚨 Possíveis Causas

### 1. Mock não está sendo aplicado

**Sintoma:** Ainda vê "Conectando ao banco" no log

**Causa Possível:** O módulo `checkin-service.ts` importa `queryDatabase` antes do mock ser aplicado

**Solução:** Garantir que o mock está ANTES do import

### 2. Mock está sendo limpo incorretamente

**Sintoma:** `mockResolvedValueOnce` não funciona

**Causa Possível:** `jest.clearAllMocks()` ou `mockClear()` está limpando os mocks configurados

**Solução:** Usar `mockReset()` em vez de `mockClear()`, ou não limpar antes de configurar

### 3. Ordem incorreta dos mocks

**Sintoma:** Primeira chamada funciona, segunda não

**Causa Possível:** Os mocks estão sendo consumidos na ordem errada

**Solução:** Verificar a ordem exata das chamadas no código

---

## 🔧 Soluções Tentadas

1. ✅ Factory Function - Mock criado antes do `jest.mock()`
2. ✅ Mock específico de `@/lib/db` - Sobrescreve mock manual
3. ✅ Mock global do `pg` - Previne conexões reais
4. ⏳ Ajustar ordem dos mocks - Em teste

---

## 📝 Próximos Passos

1. Verificar se o mock está sendo aplicado corretamente
2. Adicionar logs para debugar as chamadas
3. Verificar se há outras chamadas a `queryDatabase` que não estão sendo mockadas
4. Testar com `mockImplementation` em vez de `mockResolvedValueOnce`

---

**Última Atualização:** 2025-12-16

