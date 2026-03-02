# 🔍 ANÁLISE COMPLETA: Dois Erros Identificados

## ERRO 1: formatCPFCNPJ is not a function
## ERRO 2: Cannot read properties of undefined (reading 'call') - ToastWrapper

---

## FASE 1: PREPARAÇÃO E CONTEXTO ✅

**Erro 1:** `formatCPFCNPJ is not a function`  
**Local:** `app/reservar/[id]/page.tsx:333`  
**Contexto:** Usuário digitando CPF no formulário de reserva

**Erro 2:** `Cannot read properties of undefined (reading 'call')`  
**Local:** `app/layout.tsx:59`  
**Contexto:** ToastWrapper no layout

---

## FASE 2: ANÁLISE COM CHAIN OF THOUGHT (CoT)

### ERRO 1 - Raciocínio Passo a Passo:

**PASSO 1:** Código tenta usar `formatCPFCNPJ(value)` na linha 333  
**PASSO 2:** Import na linha 17: `import { formatCPFCNPJ, formatPhone } from "@/lib/validations"`  
**PASSO 3:** Verificando `lib/validations.ts`:  
- ✅ Existe `formatCPF(cpf: string)`  
- ✅ Existe `formatCNPJ(cnpj: string)`  
- ❌ **NÃO existe `formatCPFCNPJ`**  
**PASSO 4:** Função não existe no arquivo de validações  
**PASSO 5:** Causa: Função foi referenciada mas nunca criada

### ERRO 2 - Raciocínio Passo a Passo:

**PASSO 1:** Layout.tsx usa `ToastWrapper` na linha 59  
**PASSO 2:** Import: `import ToastWrapper from "@/components/providers/toast-wrapper"`  
**PASSO 3:** Erro "Cannot read properties of undefined (reading 'call')"  
**PASSO 4:** Este erro geralmente indica problema de cache/build do Next.js  
**PASSO 5:** Webpack não consegue resolver o módulo corretamente

---

## FASE 3: EXPLORAÇÃO COM TREE OF THOUGHTS (ToT)

### ERRO 1 - 5 Hipóteses:

1. **Função não existe** ⭐⭐⭐⭐⭐ (10/10) - **ESCOLHIDA**
   - Criar função `formatCPFCNPJ` que detecta CPF ou CNPJ

2. Import incorreto (1/10)
3. Função com nome diferente (2/10)
4. Arquivo não exporta (1/10)
5. Problema de build (1/10)

### ERRO 2 - 5 Hipóteses:

1. **Cache corrompido** ⭐⭐⭐⭐⭐ (9/10) - **ESCOLHIDA**
   - Limpar cache do Next.js

2. Import incorreto (3/10)
3. Arquivo não existe (1/10)
4. Problema de SSR (2/10)
5. Webpack bundling (4/10)

---

## FASE 4: CAUSA RAIZ - 5 PORQUÊS

### ERRO 1:
1. Por quê? → Função `formatCPFCNPJ` não existe
2. Por quê? → Foi referenciada mas nunca implementada
3. Por quê? → Código copiado de outro lugar ou função renomeada
4. Por quê? → Falta de validação de imports
5. **Causa Raiz:** Falta de função unificada para formatar CPF/CNPJ

### ERRO 2:
1. Por quê? → Webpack não consegue carregar módulo
2. Por quê? → Cache do Next.js corrompido
3. Por quê? → Build anterior com referências incorretas
4. Por quê? → Múltiplas mudanças sem rebuild completo
5. **Causa Raiz:** Cache não limpo após mudanças arquiteturais

---

## FASE 5: IMPLEMENTAÇÃO SISTEMÁTICA

### Solução ERRO 1:
Criar função `formatCPFCNPJ` que detecta automaticamente se é CPF ou CNPJ

### Solução ERRO 2:
Limpar cache do Next.js completamente e reiniciar servidor

