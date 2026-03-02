# 🔬 DEBUGGING METODOLOGIA COMPLETA - wishlist-service.test.ts

**Data:** 11/12/2025  
**Metodologia:** CoT + ToT + SoT + TDD + Code Review  
**Status:** 🔴 EM ANÁLISE

---

## 📋 FASE 1: PREPARAÇÃO E CONTEXTO

### 1.1 Reprodução do Erro

**Comando de Reprodução:**
```bash
npm test -- __tests__/lib/group-travel/wishlist-service.test.ts --no-coverage
```

**Erro Principal:**
```
TypeError: Cannot read properties of undefined (reading 'createWishlist')
at Object.createWishlist (__tests__/lib/group-travel/wishlist-service.test.ts:49:44)
```

### 1.2 Contexto Coletado

**Stack Trace Completo:**
```
TypeError: Cannot read properties of undefined (reading 'createWishlist')
    at Object.createWishlist 
       (__tests__/lib/group-travel/wishlist-service.test.ts:49:44)
```

**Arquivos Envolvidos:**
- `__tests__/lib/group-travel/wishlist-service.test.ts` (linha 49)
- `lib/group-travel/wishlist-service.ts` (import)

**Ambiente:**
- Node.js + Jest
- TypeScript
- Mocks: queryDatabase, redisCache

**Testes Afetados:**
- createWishlist (2 testes)
- getWishlist (3 testes)
- addItem (2 testes)
- removeItem (1 teste)
- inviteMember (2 testes)
- removeMember (2 testes)
- updateWishlist (1 teste)
- deleteWishlist (2 testes)
- getUserWishlists (1 teste)

**Total:** 16 testes falhando com mesmo erro

### 1.3 Comportamento Esperado vs Atual

**Esperado:**
- `WishlistService` deve estar importado e disponível
- Métodos devem ser acessíveis

**Atual:**
- `WishlistService` está `undefined`
- Não é possível acessar métodos

### 1.4 Impacto

- **Severidade:** CRÍTICA - Todos os testes falham
- **Escopo:** Arquivo completo de testes
- **Bloqueio:** Sim - impede validação completa do serviço

---

## 🧠 FASE 2: ANÁLISE COM CHAIN OF THOUGHT (CoT)

### 2.1 Raciocínio Passo a Passo

**Passo 1: Analisar erro**
```
TypeError: Cannot read properties of undefined (reading 'createWishlist')
```

**Raciocínio:**
- O erro indica que `WishlistService` é `undefined`
- Tentativa de acessar `WishlistService.createWishlist` falha
- Isso sugere problema de import/export

**Passo 2: Verificar import no teste**

```typescript
// Linha provável do teste:
import WishlistService from '@/lib/group-travel/wishlist-service';
```

**Raciocínio:**
- Se o import está correto, o problema pode ser:
  1. Export default não existe no serviço
  2. Caminho do import está incorreto
  3. Serviço não está sendo exportado corretamente
  4. Problema de módulo/compilação

**Passo 3: Verificar export no serviço**

**Raciocínio:**
- Preciso verificar como o serviço está sendo exportado
- Pode ser export default ou named export
- Pode ser classe ou objeto

**Passo 4: Verificar estrutura do serviço**

**Raciocínio:**
- Se é classe, precisa ser instanciada ou métodos estáticos
- Se é objeto, métodos devem estar no objeto
- Se é função, precisa ser exportada corretamente

**Conclusão CoT:**
O problema mais provável é incompatibilidade entre como o serviço é exportado e como está sendo importado no teste.

---

## 🌳 FASE 3: EXPLORAÇÃO COM TREE OF THOUGHTS (ToT)

### 3.1 Geração de Hipóteses

**Hipótese 1: Export default não existe ou está incorreto**
```
├─ Descrição: Serviço não tem export default, ou export está errado
├─ Como testar: Verificar arquivo do serviço
├─ Probabilidade: 9/10 ⭐⭐⭐⭐⭐
├─ Complexidade: BAIXA
├─ Riscos: Nenhum
└─ Benefícios: Solução direta
```

**Hipótese 2: Import usando caminho incorreto**
```
├─ Descrição: Caminho @/lib/group-travel/wishlist-service não resolve
├─ Como testar: Verificar tsconfig.json paths
├─ Probabilidade: 5/10 ⭐⭐
├─ Complexidade: BAIXA
├─ Riscos: Pode indicar problema de configuração
└─ Benefícios: Corrige problema de build
```

**Hipótese 3: Serviço é classe mas está sendo usado como objeto**
```
├─ Descrição: Serviço é classe, mas teste tenta usar métodos diretamente
├─ Como testar: Verificar se precisa instanciar ou usar métodos estáticos
├─ Probabilidade: 6/10 ⭐⭐⭐
├─ Complexidade: MÉDIA
├─ Riscos: Pode precisar refatorar testes
└─ Benefícios: Alinha com padrão do serviço
```

**Hipótese 4: Problema de compilação TypeScript**
```
├─ Descrição: TypeScript não está compilando corretamente
├─ Como testar: Verificar se arquivo .js existe
├─ Probabilidade: 3/10 ⭐
├─ Complexidade: MÉDIA
├─ Riscos: Pode indicar problema maior
└─ Benefícios: Resolve problema de build
```

**Hipótese 5: Named export ao invés de default export**
```
├─ Descrição: Serviço usa named export mas teste espera default
├─ Como testar: Verificar tipo de export
├─ Probabilidade: 7/10 ⭐⭐⭐⭐
├─ Complexidade: BAIXA
├─ Riscos: Baixo
└─ Benefícios: Alinha import/export
```

### 3.2 Matriz de Decisão

| Hipótese | Prob | Complex | Impacto | Prioridade |
|----------|------|---------|---------|------------|
| H1: Export default incorreto | 9/10 | BAIXA | ALTO | 🔴 CRÍTICA |
| H5: Named vs default export | 7/10 | BAIXA | ALTO | 🔴 CRÍTICA |
| H3: Classe vs objeto | 6/10 | MÉDIA | MÉDIO | 🟡 IMPORTANTE |
| H2: Caminho incorreto | 5/10 | BAIXA | BAIXO | 🟡 IMPORTANTE |
| H4: Compilação TS | 3/10 | MÉDIA | BAIXO | 🟢 SECUNDÁRIA |

### 3.3 Decisão

**Hipótese Principal:** H1 (Export default) + H5 (Named vs default)  
**Hipóteses Secundárias:** H3 (Classe vs objeto)

**Estratégia:**
1. Verificar como serviço está exportado
2. Verificar como teste está importando
3. Alinhar import/export
4. Verificar se precisa instanciar classe

---

## 🎯 FASE 4: ESTRUTURAÇÃO COM SKELETON OF THOUGHTS (SoT)

### 4.1 Esqueleto da Solução (3-7 pontos principais)

```
SOLUÇÃO PARA CORRIGIR wishlist-service.test.ts
│
├─ 1. VERIFICAR EXPORT DO SERVIÇO
│   ├─ 1.1 Ler arquivo do serviço
│   ├─ 1.2 Identificar tipo de export
│   └─ 1.3 Verificar se é classe ou objeto
│
├─ 2. VERIFICAR IMPORT DO TESTE
│   ├─ 2.1 Ler linha de import
│   ├─ 2.2 Verificar se usa default ou named
│   └─ 2.3 Verificar caminho
│
├─ 3. ALINHAR IMPORT/EXPORT
│   ├─ 3.1 Se serviço é default export → manter import default
│   ├─ 3.2 Se serviço é named export → mudar para named import
│   └─ 3.3 Se serviço é classe → verificar uso (estático vs instância)
│
├─ 4. CORRIGIR USO NO TESTE
│   ├─ 4.1 Se classe com métodos estáticos → usar diretamente
│   ├─ 4.2 Se classe sem estáticos → instanciar
│   └─ 4.3 Se objeto → usar diretamente
│
└─ 5. VALIDAR E TESTAR
    ├─ 5.1 Executar testes
    ├─ 5.2 Verificar se todos passam
    └─ 5.3 Documentar correção
```

### 4.2 Expansão de Cada Ponto

**Ponto 1: Verificar export**
- **Ação:** Ler `lib/group-travel/wishlist-service.ts`
- **Verificar:** Tipo de export (default, named, class, object)
- **Resultado:** Identificar padrão usado

**Ponto 2: Verificar import**
- **Ação:** Ler linha de import no teste
- **Verificar:** Se corresponde ao export
- **Resultado:** Identificar incompatibilidade

**Ponto 3: Alinhar**
- **Ação:** Corrigir import ou export para corresponder
- **Verificar:** Padrão usado em outros serviços (split-payment, vote)
- **Resultado:** Import/export alinhados

**Ponto 4: Corrigir uso**
- **Ação:** Ajustar como métodos são chamados
- **Verificar:** Se precisa instanciar classe
- **Resultado:** Testes podem acessar métodos

**Ponto 5: Validar**
- **Ação:** Executar testes
- **Verificar:** Todos passando
- **Resultado:** Problema resolvido

---

## 🔧 FASE 5: IMPLEMENTAÇÃO SISTEMÁTICA

### 5.1 Root Cause Analysis (5 Porquês)

**Por quê 1:** Por que o erro "Cannot read properties of undefined" ocorre?
→ Porque `WishlistService` é `undefined` quando o teste tenta acessá-lo

**Por quê 2:** Por que `WishlistService` está undefined?
→ Porque o import não está retornando o valor esperado

**Por quê 3:** Por que o import não retorna valor?
→ Porque há incompatibilidade entre como o serviço é exportado e como está sendo importado

**Por quê 4:** Por que há incompatibilidade?
→ Porque o padrão de export/import não foi verificado ou está incorreto

**Por quê 5 (CAUSA RAIZ):** Por que o padrão não foi verificado?
→ Porque o teste foi criado assumindo um padrão sem verificar o serviço real

**CAUSA RAIZ IDENTIFICADA:**
Incompatibilidade entre export do serviço e import do teste.

### 5.2 Implementação Incremental

**Passo 1: Verificar serviço**
- Ler arquivo do serviço
- Identificar padrão de export

**Passo 2: Verificar teste**
- Ler linha de import
- Comparar com padrão do serviço

**Passo 3: Corrigir**
- Ajustar import ou export
- Garantir compatibilidade

**Passo 4: Validar**
- Executar testes
- Verificar se passam

---

## ✅ FASE 6: TESTES E VALIDAÇÃO (TDD)

### 6.1 Teste que Reproduz o Bug (RED)

```typescript
it('should create a wishlist successfully', async () => {
  // Este teste FALHA atualmente
  // Erro: WishlistService is undefined
});
```

**Status:** ✅ Já existe e falha

### 6.2 Correção Mínima (GREEN)

```typescript
// Corrigir import baseado no export real do serviço
// Se serviço usa default export:
import WishlistService from '@/lib/group-travel/wishlist-service';

// Se serviço usa named export:
import { WishlistService } from '@/lib/group-travel/wishlist-service';

// Se serviço é classe:
// Verificar se métodos são estáticos ou precisa instanciar
```

**Status:** 🔄 Implementando

---

## 🔍 FASE 7: VERIFICAÇÃO E REFINAMENTO

- [ ] Import/export alinhados
- [ ] Todos os 16 testes passando
- [ ] Padrão consistente com outros serviços
- [ ] Código documentado

---

## 🚀 FASE 8: DEPLOY E MONITORAMENTO

- **Tipo:** Correção de teste (não requer deploy)
- **Validação:** Executar suite completa
- **Métricas:** 16/16 testes passando

---

## 📝 IMPLEMENTAÇÃO FINAL

### 5.3 CAUSA RAIZ CONFIRMADA

**Status:** ✅ Serviço criado, mas há erros nos mocks dos testes

**Erros Identificados:**
1. `Cannot read properties of undefined (reading 'length')` - Mock não retorna array
2. `Cannot read properties of undefined (reading 'map')` - Resultado não é array
3. Mocks precisam retornar formato correto

### 5.4 Correções Aplicadas

✅ Serviço `wishlist-service.ts` criado
✅ Import corrigido no teste
✅ Métodos implementados

### 5.5 Correções Pendentes

**Problema 1: Mock retorna undefined ao invés de array**
- **Causa:** `mockQueryDatabase.mockResolvedValueOnce` pode não estar funcionando
- **Solução:** Verificar se mock está sendo chamado corretamente

**Problema 2: Formato de retorno dos mocks**
- **Causa:** Mocks podem não estar no formato esperado
- **Solução:** Ajustar mocks para retornar arrays com objetos corretos

**Problema Identificado:**
- O teste importa: `import WishlistService from '@/lib/wishlist-service';`
- Mas `lib/wishlist-service.ts` exporta apenas **funções**, não uma classe
- Não existe `lib/group-travel/wishlist-service.ts` (serviço backend)
- O teste espera uma classe com métodos como `createWishlist()`

**Solução:**
1. **Opção A:** Criar serviço backend `lib/group-travel/wishlist-service.ts` (padrão dos outros)
2. **Opção B:** Ajustar teste para usar funções exportadas de `lib/wishlist-service.ts`
3. **Opção C:** Verificar se deveria testar o frontend service `lib/group-travel/api/wishlist.service.ts`

**Decisão:** Opção A - Criar serviço backend seguindo padrão de `vote-service.ts` e `split-payment-service.ts`

### 5.4 Implementação

**Passo 1:** Verificar estrutura de vote-service.ts para usar como template
**Passo 2:** Criar wishlist-service.ts no padrão correto
**Passo 3:** Ajustar import no teste
**Passo 4:** Validar testes

