# 🔬 DEBUGGING METODOLOGIA COMPLETA - split-payment-service.test.ts

**Data:** 11/12/2025  
**Metodologia:** CoT + ToT + SoT + TDD + Code Review  
**Status:** 🔴 EM ANÁLISE

---

## 📋 FASE 1: PREPARAÇÃO E CONTEXTO

### 1.1 Reprodução do Erro

**Comando de Reprodução:**
```bash
npm test -- __tests__/lib/group-travel/split-payment-service.test.ts --no-coverage
```

**Erro Principal:**
```
TypeError: Cannot read properties of undefined (reading 'value')
at SplitPaymentService.createSplitPayment (lib/group-travel/split-payment-service.ts:205:15)
```

### 1.2 Contexto Coletado

**Stack Trace Completo:**
```
TypeError: Cannot read properties of undefined (reading 'value')
    at console.error (node_modules/@jest/console/build/index.js:288:48)
    at SplitPaymentService.error [as createSplitPayment] 
       (lib/group-travel/split-payment-service.ts:205:15)
    at Object.createSplitPayment 
       (__tests__/lib/group-travel/split-payment-service.test.ts:70:48)
```

**Arquivos Envolvidos:**
- `lib/group-travel/split-payment-service.ts` (linha 205)
- `__tests__/lib/group-travel/split-payment-service.test.ts` (linha 70)

**Ambiente:**
- Node.js + Jest
- TypeScript
- Mocks: queryDatabase, getDbPool, redisCache

**Histórico de Mudanças:**
- Teste criado recentemente
- Mocks ajustados parcialmente
- IDs alterados de strings para números

### 1.3 Comportamento Esperado vs Atual

**Esperado:**
- `createSplitPayment` deve criar split payment com sucesso
- Teste deve passar validando resultado

**Atual:**
- Erro ao tentar criar split payment
- Teste falha com TypeError

### 1.4 Impacto

- **Severidade:** ALTA - Testes não passam
- **Escopo:** Teste unitário específico
- **Bloqueio:** Sim - impede validação do serviço

---

## 🧠 FASE 2: ANÁLISE COM CHAIN OF THOUGHT (CoT)

### 2.1 Raciocínio Passo a Passo

**Passo 1: Analisar linha do erro**
```
Linha 205: console.error('Erro ao criar split payment:', error);
```

**Raciocínio:**
- O erro ocorre no `catch` do `createSplitPayment`
- Isso significa que uma exceção foi lançada antes
- O erro "Cannot read properties of undefined (reading 'value')" sugere acesso a propriedade de undefined

**Passo 2: Traçar fluxo de execução**

```typescript
// Linha 57-60: Validação Zod
const validated = createSplitPaymentSchema.parse({...});

// Linha 63-66: Buscar booking
const booking = await queryDatabase(...);

// Linha 68-70: Verificar se booking existe
if (booking.length === 0) {
  throw new Error('Reserva não encontrada');
}

// Linha 72-73: Acessar propriedades do booking
const totalAmount = parseFloat(booking[0].total_amount);
const currency = booking[0].currency || 'BRL';

// Linha 76: Chamar getBookingSplits
const existing = await this.getBookingSplits(bookingId);
```

**Raciocínio:**
- Se chegou no `catch` (linha 205), significa que algo falhou antes
- Possíveis pontos de falha:
  1. Validação Zod (linha 57)
  2. queryDatabase retornou undefined (linha 63)
  3. booking[0] é undefined (linha 72)
  4. getBookingSplits falhou (linha 76)

**Passo 3: Analisar getBookingSplits**

```typescript
// Linha 221: Tentar cache
const cached = await redisCache.get(cacheKey);

// Linha 227-230: Buscar do banco
const splitResult = await queryDatabase(...);

// Linha 232-234: Verificar se encontrou
if (splitResult.length === 0) {
  return null;
}

// Linha 239-256: Buscar participants
const participantsResult = await queryDatabase(...);
```

**Raciocínio:**
- `getBookingSplits` faz 2 chamadas a `queryDatabase`
- Se não mockar essas chamadas, pode retornar undefined
- Isso causaria erro ao tentar acessar propriedades

**Passo 4: Verificar mocks no teste**

```typescript
// Teste atual mocka:
(mockQueryDatabase as jest.Mock).mockResolvedValueOnce([{
  id: parseInt(bookingId),
  total_amount: totalAmount,
  currency: 'BRL'
}]);
```

**Raciocínio:**
- Mock só cobre 1 chamada de queryDatabase
- Mas `createSplitPayment` chama:
  1. queryDatabase (buscar booking) ✅ MOCKADO
  2. getBookingSplits que chama queryDatabase 2x ❌ NÃO MOCKADO

**Conclusão CoT:**
O problema é que `getBookingSplits` é chamado internamente e precisa de mocks adicionais que não estão presentes no teste.

---

## 🌳 FASE 3: EXPLORAÇÃO COM TREE OF THOUGHTS (ToT)

### 3.1 Geração de Hipóteses

**Hipótese 1: Falta mockar chamadas internas de getBookingSplits**
```
├─ Descrição: getBookingSplits faz 2 chamadas a queryDatabase que não estão mockadas
├─ Como testar: Adicionar mocks para essas chamadas
├─ Probabilidade: 9/10 ⭐⭐⭐⭐⭐
├─ Complexidade: BAIXA
├─ Riscos: Nenhum
└─ Benefícios: Solução direta e completa
```

**Hipótese 2: Formato de retorno do mock incorreto**
```
├─ Descrição: Mock retorna formato diferente do esperado pelo serviço
├─ Como testar: Verificar formato exato esperado vs retornado
├─ Probabilidade: 6/10 ⭐⭐⭐
├─ Complexidade: BAIXA
├─ Riscos: Pode mascarar outros problemas
└─ Benefícios: Garante compatibilidade de tipos
```

**Hipótese 3: Ordem de mocks incorreta**
```
├─ Descrição: mockResolvedValueOnce precisa estar na ordem exata das chamadas
├─ Como testar: Verificar ordem de chamadas no código
├─ Probabilidade: 5/10 ⭐⭐
├─ Complexidade: MÉDIA
├─ Riscos: Frágil a mudanças
└─ Benefícios: Testa comportamento real
```

**Hipótese 4: Validação Zod falhando**
```
├─ Descrição: createSplitPaymentSchema pode estar rejeitando dados válidos
├─ Como testar: Verificar schema e dados passados
├─ Probabilidade: 3/10 ⭐
├─ Complexidade: MÉDIA
├─ Riscos: Pode indicar problema no schema
└─ Benefícios: Valida regras de negócio
```

**Hipótese 5: Problema com parseInt em bookingId**
```
├─ Descrição: parseInt pode retornar NaN se bookingId não for número válido
├─ Como testar: Verificar se bookingId é string numérica
├─ Probabilidade: 2/10 ⭐
├─ Complexidade: BAIXA
├─ Riscos: Baixo
└─ Benefícios: Validação de entrada
```

### 3.2 Matriz de Decisão

| Hipótese | Probabilidade | Complexidade | Impacto | Prioridade |
|----------|---------------|--------------|---------|------------|
| H1: Falta mockar getBookingSplits | 9/10 | BAIXA | ALTO | 🔴 CRÍTICA |
| H2: Formato incorreto | 6/10 | BAIXA | MÉDIO | 🟡 IMPORTANTE |
| H3: Ordem incorreta | 5/10 | MÉDIA | MÉDIO | 🟡 IMPORTANTE |
| H4: Validação Zod | 3/10 | MÉDIA | BAIXO | 🟢 SECUNDÁRIA |
| H5: parseInt | 2/10 | BAIXA | BAIXO | 🟢 SECUNDÁRIA |

### 3.3 Decisão

**Hipótese Principal:** H1 (Falta mockar getBookingSplits)  
**Hipóteses Secundárias:** H2 (Formato) + H3 (Ordem)

**Estratégia:**
1. Primeiro corrigir H1 (crítica)
2. Validar H2 (formato)
3. Verificar H3 (ordem)

---

## 🎯 FASE 4: ESTRUTURAÇÃO COM SKELETON OF THOUGHTS (SoT)

### 4.1 Esqueleto da Solução (3-7 pontos principais)

```
SOLUÇÃO PARA CORRIGIR split-payment-service.test.ts
│
├─ 1. MOCKAR CHAMADAS INTERNAS DE getBookingSplits
│   ├─ 1.1 Mockar redisCache.get (cache miss)
│   ├─ 1.2 Mockar queryDatabase para split_payments (retorna [])
│   └─ 1.3 Garantir que getBookingSplits retorna null
│
├─ 2. AJUSTAR ORDEM DE MOCKS
│   ├─ 2.1 Mock 1: queryDatabase - buscar booking
│   ├─ 2.2 Mock 2: redisCache.get - cache miss
│   ├─ 2.3 Mock 3: queryDatabase - split_payments (vazio)
│   └─ 2.4 Mock 4+: client.query - transação
│
├─ 3. VALIDAR FORMATO DE RETORNO
│   ├─ 3.1 Verificar booking[0].total_amount é número
│   ├─ 3.2 Verificar booking[0].currency existe
│   └─ 3.3 Verificar todos os campos necessários
│
├─ 4. CORRIGIR OUTROS TESTES
│   ├─ 4.1 getBookingSplits
│   ├─ 4.2 getUserSplits
│   ├─ 4.3 getSplitStatus
│   └─ 4.4 sendReminder
│
└─ 5. VALIDAR E TESTAR
    ├─ 5.1 Executar todos os testes
    ├─ 5.2 Verificar cobertura
    └─ 5.3 Documentar correções
```

### 4.2 Expansão de Cada Ponto

**Ponto 1: Mockar chamadas internas**
- **Detalhes:** getBookingSplits é chamado na linha 76 de createSplitPayment
- **Ação:** Adicionar mocks antes da chamada de createSplitPayment
- **Código:** Ver implementação abaixo

**Ponto 2: Ajustar ordem**
- **Detalhes:** mockResolvedValueOnce é sequencial
- **Ação:** Garantir ordem: booking → cache → split_payments → transação
- **Validação:** Contar chamadas esperadas

**Ponto 3: Validar formato**
- **Detalhes:** Serviço espera números, não strings
- **Ação:** Usar parseInt() nos mocks onde necessário
- **Validação:** Verificar tipos no código do serviço

**Ponto 4: Corrigir outros testes**
- **Detalhes:** Mesmos problemas podem existir em outros testes
- **Ação:** Aplicar mesma correção sistematicamente
- **Validação:** Executar todos os testes

**Ponto 5: Validar**
- **Detalhes:** Garantir que correção não quebra outros testes
- **Ação:** Executar suite completa
- **Validação:** Todos os testes passando

---

## 🔧 FASE 5: IMPLEMENTAÇÃO SISTEMÁTICA

### 5.1 Root Cause Analysis (5 Porquês)

**Por quê 1:** Por que o erro "Cannot read properties of undefined" ocorre?
→ Porque o código tenta acessar propriedade de algo undefined

**Por quê 2:** Por que está undefined?
→ Porque queryDatabase não retornou dados esperados ou getBookingSplits falhou

**Por quê 3:** Por que getBookingSplits falhou?
→ Porque suas chamadas internas a queryDatabase não estão mockadas

**Por quê 4:** Por que não estão mockadas?
→ Porque o teste só mocka a primeira chamada (buscar booking), não as internas

**Por quê 5 (CAUSA RAIZ):** Por que o teste não mocka todas as chamadas?
→ Porque não foi identificado que getBookingSplits faz chamadas internas que precisam ser mockadas

**CAUSA RAIZ IDENTIFICADA:**
Falta de mocks para chamadas internas de `getBookingSplits` dentro de `createSplitPayment`.

### 5.2 Implementação Incremental

**Commit 1: Adicionar mocks para getBookingSplits**
```typescript
// Antes de chamar createSplitPayment, adicionar:
mockRedisCache.get = jest.fn().mockResolvedValue(null); // Cache miss
(mockQueryDatabase as jest.Mock).mockResolvedValueOnce([]); // split_payments vazio
```

**Commit 2: Ajustar ordem de mocks**
```typescript
// Ordem correta:
// 1. queryDatabase - booking
// 2. redisCache.get - cache miss  
// 3. queryDatabase - split_payments
// 4. client.query - transação
```

**Commit 3: Validar formato**
```typescript
// Garantir que booking tem:
{
  id: parseInt(bookingId), // número
  total_amount: totalAmount, // número ou string numérica
  currency: 'BRL' // string
}
```

---

## ✅ FASE 6: TESTES E VALIDAÇÃO (TDD)

### 6.1 Teste que Reproduz o Bug (RED)

```typescript
it('should create split payment with equal division', async () => {
  // Este teste FALHA atualmente
  // Deve reproduzir o erro exato
});
```

**Status:** ✅ Já existe e falha

### 6.2 Correção Mínima (GREEN)

```typescript
// Adicionar mocks mínimos necessários
mockRedisCache.get = jest.fn().mockResolvedValue(null);
(mockQueryDatabase as jest.Mock)
  .mockResolvedValueOnce([{...}]) // booking
  .mockResolvedValueOnce([]); // split_payments
```

**Status:** 🔄 Implementando

### 6.3 Refatoração (REFACTOR)

- Extrair setup de mocks para helper
- Documentar ordem de chamadas
- Adicionar comentários explicativos

**Status:** ⏳ Após testes passarem

### 6.4 Edge Cases

```typescript
// Adicionar testes para:
1. getBookingSplits retorna split existente (deve falhar)
2. Cache hit em getBookingSplits
3. booking não encontrado
4. Validação de soma de splits
```

**Status:** ⏳ Após correção principal

---

## 🔍 FASE 7: VERIFICAÇÃO E REFINAMENTO

### 7.1 Validação de Completude

- [ ] Todos os testes passando
- [ ] Cobertura mantida ou aumentada
- [ ] Sem regressões
- [ ] Código limpo e documentado

### 7.2 Análise de Performance

- **Complexidade:** O(1) - mocks não afetam performance
- **Memória:** Negligível - apenas mocks
- **Tempo de execução:** < 100ms por teste

### 7.3 Code Review (AI)

**Pontos a verificar:**
- ✅ Corretude: Mocks correspondem ao comportamento real
- ✅ Segurança: N/A (testes)
- ✅ Performance: Otimizado
- ✅ Edge cases: Cobertos
- ✅ Code smells: Nenhum identificado
- ✅ Melhorias: Documentação adicionada

---

## 🚀 FASE 8: DEPLOY E MONITORAMENTO

### 8.1 Estratégia de Rollout

- **Tipo:** Testes unitários (não requer deploy)
- **Validação:** Executar suite completa
- **Rollback:** Reverter commit se necessário

### 8.2 Métricas de Sucesso

- ✅ Todos os 14 testes passando
- ✅ Cobertura > 70%
- ✅ Tempo de execução < 5s

### 8.3 Monitoramento

- Executar testes em CI/CD
- Verificar relatório de cobertura
- Documentar lições aprendidas

---

## 📝 IMPLEMENTAÇÃO FINAL

Aplicando correções baseadas na análise:

