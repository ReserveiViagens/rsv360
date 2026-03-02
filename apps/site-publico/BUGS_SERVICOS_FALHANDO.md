# 🐛 SERVIÇOS FALHANDO NOS TESTES - FUNC-002

**Data:** 2025-12-13  
**Status:** 🔍 Em Análise  
**Prioridade:** 🔴 Crítica

---

## 📊 RESUMO EXECUTIVO

**Total de Serviços com Falhas:** 8  
**Total de Testes:** 106 (28 falhando, 78 passando)  
**Taxa de Sucesso:** 73.6%

---

## 🔴 SERVIÇOS FALHANDO

### 1. ❌ vote-service.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `No tests found` - Arquivo não encontrado ou sem testes
- **Ações:**
  - [x] Verificar se arquivo existe
  - [ ] Verificar se há testes no arquivo
  - [ ] Criar testes se necessário ou corrigir caminho

### 2. ❌ split-payment-service.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `No tests found` - Arquivo não encontrado
- **Nota:** Teste E2E (`split-payment-flow.test.ts`) já está passando após FUNC-001
- **Ações:**
  - [x] Verificar se arquivo existe
  - [ ] Verificar se há testes unitários separados
  - [ ] Criar testes unitários se necessário

### 3. ❌ checkin-service.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `TypeError: queryDatabase.mockResolvedValueOnce is not a function`
- **Causa:** Mock de `queryDatabase` não está configurado corretamente
- **Ações:**
  - [x] Identificar erro específico
  - [ ] Adicionar `jest.mock('@/lib/db')` se faltando
  - [ ] Corrigir mock de `queryDatabase`
  - [ ] Validar que testes passam

### 4. ❌ db.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `Database connection failed`
- **Causa:** Mock de `getDbPool` não está configurado
- **Ações:**
  - [x] Identificar erro específico
  - [ ] Revisar mocks de conexão
  - [ ] Corrigir mocks de `getDbPool`
  - [ ] Validar que testes passam

### 5. ❌ ticket-service.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `TypeError: Cannot read properties of undefined (reading '0')`
- **Causa:** `queryDatabase` retorna `undefined`, falta fallback `|| []`
- **Localização:** `lib/ticket-service.ts:122`
- **Ações:**
  - [x] Identificar erro específico
  - [ ] Adicionar fallback `|| []` em `lib/ticket-service.ts:122`
  - [ ] Verificar outras ocorrências similares
  - [ ] Validar que testes passam

### 6. ❌ wishlist-service.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `No tests found` - Arquivo não encontrado
- **Ações:**
  - [x] Verificar se arquivo existe
  - [ ] Verificar se há testes no arquivo
  - [ ] Criar testes se necessário ou corrigir caminho

### 7. ❌ api-auth.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Erro:** `ReferenceError: Request is not defined`
- **Causa:** `Request` do Next.js não está disponível no ambiente de teste
- **Ações:**
  - [x] Identificar erro específico
  - [ ] Mockar `Request` no setup do Jest
  - [ ] Ou usar `@testing-library` para criar Request mockado
  - [ ] Validar que testes passam

### 8. ❌ smart-pricing-performance.test.ts
- **Status:** FAIL
- **Prioridade:** 🔴 Crítica
- **Tempo:** 6.525s
- **Erros:**
  1. `cacheGetOrSet is not a function`
  2. `Cannot find module 'googleapis'`
- **Ações:**
  - [x] Identificar erros específicos
  - [ ] Corrigir mock de `cacheGetOrSet`
  - [ ] Mockar `googleapis` ou instalar dependência
  - [ ] Revisar expectativa de tempo (2s pode ser muito restritivo)
  - [ ] Validar que testes passam

---

## ✅ SERVIÇOS PASSANDO

1. ✅ group-chat-service.test.ts
2. ✅ smart-pricing-service.test.ts
3. ✅ trip-invitation-service.test.ts
4. ✅ top-host-service.test.ts

---

## 📋 PLANO DE AÇÃO

### Fase 1: Análise Detalhada
- [ ] Executar cada teste individualmente
- [ ] Capturar erros completos
- [ ] Documentar cada erro
- [ ] Priorizar por impacto

### Fase 2: Correções
- [ ] Aplicar metodologia de debugging
- [ ] Corrigir mocks e lógica
- [ ] Validar com testes
- [ ] Documentar correções

### Fase 3: Validação
- [ ] Executar suite completa
- [ ] Verificar que todos passam
- [ ] Verificar sem regressões
- [ ] Documentar resumo

---

**Última Atualização:** 2025-12-13  
**Status:** 🔍 Em Análise

