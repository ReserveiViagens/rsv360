# 🔧 Solução Detalhada: Corrigir Mocks dos Testes

## 🎯 Problema Identificado

Todos os 5 testes falhando têm o mesmo problema: **O mock `mockQuery` não está retornando os dados corretos na ordem esperada**, resultando em `undefined` para propriedades do objeto retornado.

## 🔍 Causa Raiz

### Problema 1: `getTicketById` Consome Mock

**Descoberta**: `getTicketById` também usa `queryDatabase`, que por sua vez usa `pool.query`. Isso significa que quando uma função chama `getTicketById`, ela consome um mock de `pool.query` ANTES da query principal.

**Exemplo com `assignTicket`**:
```typescript
// assignTicket faz:
1. getTicketById(data.ticket_id) 
   → queryDatabase('SELECT * FROM support_tickets WHERE id = $1', [ticket_id])
   → pool.query(...) // ← Consome mockQuery[0]
2. queryDatabase('UPDATE support_tickets ... RETURNING *', [...])
   → pool.query(...) // ← Consome mockQuery[1]
```

**Problema**: Se o mock não estiver na ordem correta, `getTicketById` pode consumir o mock errado, deixando o UPDATE sem mock.

### Problema 2: Queries de Métricas Não Mockadas

`changeTicketStatus` faz até 5 queries:
1. `SELECT * FROM support_tickets WHERE id = $1` (via `getTicketById`)
2. `UPDATE support_tickets SET status = ..., ... RETURNING *`
3. `SELECT COUNT(*) FROM support_tickets WHERE status IN (...)` (se status mudou para `resolved`)
4. `SELECT COUNT(*) FROM support_tickets WHERE status IN (...)` (se status mudou)
5. `SELECT COUNT(*) FROM support_tickets WHERE sla_breached = true ...` (sempre)

Se não mockarmos todas as queries na ordem correta, o mock será consumido prematuramente.

### Problema 3: Mock Retornando Array Vazio

Se o mock retornar `{ rows: [], rowCount: 0 }`, então `result[0]` será `undefined`. Isso pode acontecer se:
- O mock não estiver configurado corretamente
- O mock estiver sendo consumido por outra query
- A ordem dos mocks estiver incorreta

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar Ordem Exata das Queries

Para cada função, verificar a ordem exata das queries executadas:

#### `addComment`
1. `SELECT * FROM support_tickets WHERE id = $1` (via `getTicketById`)
2. `INSERT INTO ticket_comments ... RETURNING *`
3. `UPDATE support_tickets SET first_response_at = ... WHERE id = $2` (condicional, se `first_response_at` é null e não é interno)

#### `assignTicket`
1. `SELECT * FROM support_tickets WHERE id = $1` (via `getTicketById`)
2. `UPDATE support_tickets SET assigned_to = $1, status = ... RETURNING *`

#### `changeTicketStatus`
1. `SELECT * FROM support_tickets WHERE id = $1` (via `getTicketById`)
2. `UPDATE support_tickets SET status = ..., ... RETURNING *`
3. `SELECT COUNT(*) FROM support_tickets WHERE status IN (...)` (se status mudou para `resolved`)
4. `SELECT COUNT(*) FROM support_tickets WHERE status IN (...)` (se status mudou)
5. `SELECT COUNT(*) FROM support_tickets WHERE sla_breached = true ...` (sempre)

### Passo 2: Ajustar Mocks na Ordem Correta

Garantir que os mocks estejam na mesma ordem das queries executadas:

```typescript
// Exemplo para assignTicket
mockQuery
  .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById
  .mockResolvedValueOnce({ rows: [mockAssignedTicket], rowCount: 1 }); // UPDATE

// Exemplo para changeTicketStatus
mockQuery
  .mockResolvedValueOnce({ rows: [mockTicket], rowCount: 1 }) // getTicketById
  .mockResolvedValueOnce({ rows: [mockResolvedTicket], rowCount: 1 }) // UPDATE
  .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }) // openTickets (resolved)
  .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }) // openTickets (status changed)
  .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }); // breachedTickets
```

### Passo 3: Verificar se `getTicketById` está sendo mockado corretamente

`getTicketById` também usa `queryDatabase`, que usa `pool.query`. Então, quando `getTicketById` é chamado, ele consome um mock de `pool.query`.

**Solução**: Sempre mockar `getTicketById` primeiro, antes da query principal.

### Passo 4: Adicionar Logs de Debug (Temporário)

Adicionar logs temporários para verificar a ordem das queries:

```typescript
// No teste, antes de chamar a função
mockQuery.mockImplementation((query, params) => {
  console.log('Query executada:', query.substring(0, 50), 'Params:', params);
  // Retornar mock apropriado baseado na query
  return Promise.resolve({ rows: [], rowCount: 0 });
});
```

---

## 📝 Checklist de Correção

- [ ] Verificar ordem exata das queries em cada função
- [ ] Ajustar mocks para corresponder à ordem de execução
- [ ] Garantir que `getTicketById` está sendo mockado primeiro
- [ ] Garantir que todas as queries de métricas estão mockadas
- [ ] Testar cada função isoladamente
- [ ] Validar que todos os testes passam

---

**Status**: ⏳ Aguardando implementação da solução

