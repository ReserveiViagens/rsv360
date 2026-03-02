# 🔬 DEBUGGING MASTER - split-payment-service.test.ts

**Data:** 11/12/2025  
**Metodologia:** CoT + ToT + SoT

---

## 📍 FASE 1: COMPREENSÃO PROFUNDA 🎯

### ANÁLISE INICIAL:

**Erro Principal:** `TypeError: Cannot read properties of undefined (reading 'value')`

**Local:** 
- Arquivo: `lib/group-travel/split-payment-service.ts`
- Linha: ~205 (createSplitPayment)
- Contexto: Durante validação Zod ou acesso a propriedades do booking

**Mensagem Completa:**
```
TypeError: Cannot read properties of undefined (reading 'value')
at console.error (node_modules/@jest/console/build/index.js:288:48)
at SplitPaymentService.error [as createSplitPayment] (lib/group-travel/split-payment-service.ts:205:15)
```

**Erros Secundários:**
1. `Cannot read properties of undefined (reading 'toString')` - getBookingSplits
2. `Cannot read properties of null (reading 'length')` - getSplitStatus
3. `Erro ao enviar lembrete: Split não encontrado` - sendReminder

**Contexto de Execução:**
- Ambiente: Jest (Node.js)
- Estado: Testes unitários com mocks
- Quando ocorre: Ao executar testes de createSplitPayment, getBookingSplits, getSplitStatus, sendReminder

---

## 📊 FASE 2: INVESTIGAÇÃO DO CONTEXTO 🔍

### CONTEXTO COLETADO:

**Variáveis Envolvidas:**
- `bookingId`: string ('123')
- `userId1/2/3`: string ('1', '2', '3')
- `createDTO`: CreateSplitPaymentDTO
- `booking`: resultado de queryDatabase
- `mockQueryDatabase`: jest.Mock
- `mockClient.query`: jest.Mock

**Dependências:**
```typescript
import SplitPaymentService from '@/lib/group-travel/split-payment-service';
import { queryDatabase, getDbPool } from '@/lib/db';
import { redisCache } from '@/lib/redis-cache';
```

**Configuração:**
- Jest configurado com ts-jest
- Mocks de @/lib/db e @/lib/redis-cache
- beforeEach reseta mocks

**Fluxo de Execução Identificado:**
1. `createSplitPayment` é chamado
2. Valida DTO com Zod
3. Busca booking com `queryDatabase`
4. Verifica se booking existe
5. Chama `getBookingSplits` para verificar se já existe split
6. Inicia transação com `getDbPool`
7. Executa queries com `client.query`

**Problema Identificado:**
- O serviço chama `getBookingSplits` internamente (linha 76)
- `getBookingSplits` usa `queryDatabase` que precisa ser mockado
- O mock atual não cobre essa chamada interna

---

## 🌲 FASE 3: GERAÇÃO DE HIPÓTESES (ToT) 🌳

### ÁRVORE DE HIPÓTESES:

**Hipótese 1: Mock de queryDatabase não cobre chamada interna de getBookingSplits**
├─ Probabilidade: **ALTA** ⭐⭐⭐
├─ Evidências +: 
│  ├─ Serviço chama `this.getBookingSplits(bookingId)` na linha 76
│  ├─ getBookingSplits usa `queryDatabase` que precisa ser mockado
│  └─ Teste atual não mocka essa chamada
├─ Evidências -: Nenhuma
└─ Impacto: **ALTO** - Teste falha completamente

**Hipótese 2: Formato de retorno do mock não corresponde ao esperado**
├─ Probabilidade: **ALTA** ⭐⭐⭐
├─ Evidências +:
│  ├─ Serviço espera `booking[0].total_amount` (parseFloat)
│  ├─ Serviço espera `booking[0].currency`
│  └─ Mock pode estar retornando formato incorreto
├─ Evidências -: Mock parece correto na estrutura
└─ Impacto: **ALTO** - Erro de tipo

**Hipótese 3: Validação Zod falhando por formato de dados**
├─ Probabilidade: **MÉDIA** ⭐⭐
├─ Evidências +:
│  ├─ Erro ocorre antes de acessar booking
│  ├─ Zod pode estar validando DTO incorretamente
│  └─ Mensagem de erro sugere acesso a propriedade undefined
├─ Evidências -: DTO parece estar correto
└─ Impacto: **MÉDIO** - Validação falha

**Hipótese 4: Ordem de mocks incorreta (mockResolvedValueOnce)**
├─ Probabilidade: **MÉDIA** ⭐⭐
├─ Evidências +:
│  ├─ Múltiplas chamadas a queryDatabase
│  ├─ Ordem importa para mockResolvedValueOnce
│  └─ getBookingSplits é chamado antes da transação
├─ Evidências -: Ordem parece correta
└─ Impacto: **MÉDIO** - Mock retorna dados errados

**Hipótese 5: getBookingSplits retorna null mas serviço não trata**
├─ Probabilidade: **BAIXA** ⭐
├─ Evidências +:
│  ├─ getBookingSplits pode retornar null
│  └─ Serviço verifica `if (existing)` mas pode ter problema
├─ Evidências -: Serviço trata null corretamente
└─ Impacto: **BAIXO** - Não é causa principal

**🎯 HIPÓTESE PRINCIPAL:** 
**Hipótese 1 + Hipótese 2 combinadas**
- Mock não cobre chamada interna de getBookingSplits
- E quando cobre, formato pode estar incorreto

---

## 🔬 FASE 4: ANÁLISE DE CAUSA RAIZ 🎯

### OS 5 PORQUÊS:

**1. Por que o erro "Cannot read properties of undefined (reading 'value')" ocorre?**
→ Porque o código tenta acessar uma propriedade 'value' de algo que é undefined

**2. Por que está undefined?**
→ Porque o mock de queryDatabase não está retornando dados no formato esperado OU não está sendo chamado na ordem correta

**3. Por que o mock não está funcionando?**
→ Porque `getBookingSplits` é chamado internamente e precisa de mock separado, mas o teste só mocka a primeira chamada de queryDatabase (verificar booking)

**4. Por que getBookingSplits precisa de mock separado?**
→ Porque ele faz 2 chamadas a queryDatabase:
   - Uma para buscar split_payments
   - Outra para buscar participants
   E o teste atual não mocka essas chamadas

**5. CAUSA RAIZ:**
→ **Falta de mock para chamadas internas de `getBookingSplits` dentro de `createSplitPayment`**
→ **E possível formato incorreto dos dados mockados**

### CAUSA RAIZ IDENTIFICADA:

- **Categoria:** Erro de mock/teste
- **Causa primária:** Teste não mocka todas as chamadas a `queryDatabase` que ocorrem internamente
- **Componente responsável:** `__tests__/lib/group-travel/split-payment-service.test.ts`
- **Linha específica:** Teste de `createSplitPayment` (linha ~66-133)
- **Razão técnica:** 
  O serviço `createSplitPayment` faz a seguinte sequência:
  1. Valida DTO (Zod)
  2. `queryDatabase` - busca booking (MOCKADO ✅)
  3. `this.getBookingSplits(bookingId)` - verifica se já existe split
     - Internamente chama `queryDatabase` 2x (NÃO MOCKADO ❌)
  4. Inicia transação
  5. `client.query` - múltiplas queries (MOCKADO ✅)

  O teste só mocka o passo 2, mas não mocka o passo 3.

---

## 🎨 FASE 5: DESIGN DA SOLUÇÃO 🎨

### ALTERNATIVA 1: Mockar todas as chamadas de queryDatabase em sequência
├─ Abordagem: Adicionar mockResolvedValueOnce para cada chamada na ordem exata
├─ Prós: 
│  ├─ Simples e direto
│  ├─ Mantém controle sobre cada chamada
│  └─ Fácil de debugar
├─ Contras:
│  ├─ Pode quebrar se ordem mudar
│  └─ Precisa conhecer ordem exata de chamadas
└─ Complexidade: **BAIXA**

### ALTERNATIVA 2: Mockar getBookingSplits diretamente com jest.spyOn
├─ Abordagem: Usar jest.spyOn para mockar o método getBookingSplits
├─ Prós:
│  ├─ Não precisa conhecer implementação interna
│  ├─ Mais robusto a mudanças
│  └─ Isola a dependência
├─ Contras:
│  ├─ Pode ocultar bugs reais
│  └─ Menos teste de integração
└─ Complexidade: **MÉDIA**

### ALTERNATIVA 3: Refatorar teste para mockar getBookingSplits + queryDatabase
├─ Abordagem: Combinar ambas - mockar getBookingSplits E suas chamadas internas
├─ Prós:
│  ├─ Cobre todos os casos
│  ├─ Mais completo
│  └─ Testa integração parcial
├─ Contras:
│  ├─ Mais complexo
│  └─ Pode ser redundante
└─ Complexidade: **ALTA**

### ✅ SOLUÇÃO ESCOLHIDA: **ALTERNATIVA 1**

**JUSTIFICATIVA:**
- É a abordagem mais direta e clara
- Permite testar o fluxo completo do serviço
- Facilita identificar problemas específicos
- Mantém o teste focado na funcionalidade principal
- Complexidade baixa facilita manutenção

### 📁 ARQUIVOS A MODIFICAR:

**1. `__tests__/lib/group-travel/split-payment-service.test.ts`**
   - Adicionar mocks para chamadas internas de `getBookingSplits`
   - Ajustar ordem de mocks para corresponder à sequência real
   - Garantir formato correto de retorno

**2. Verificar formato de dados em:**
   - Mock de booking (id, total_amount, currency)
   - Mock de split_payments (id, booking_id, total_amount, etc)
   - Mock de participants (id, split_payment_id, user_id, etc)

### ⚠️ IMPACTOS:

**Positivos:**
- Testes passarão
- Cobertura completa do fluxo
- Melhor entendimento do serviço

**Negativos:**
- Teste mais verboso
- Precisa manter sincronizado com implementação

**Riscos:**
- Se implementação mudar, teste pode quebrar
- Mitigação: Testes quebrados indicam mudança de contrato

---

## 🔧 FASE 6: IMPLEMENTAÇÃO INCREMENTAL 🔧

### PASSO 1: Analisar sequência exata de chamadas

Vou ler o código do serviço para entender a ordem exata:

