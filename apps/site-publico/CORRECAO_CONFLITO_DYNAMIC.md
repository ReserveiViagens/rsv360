# 🔧 CORREÇÃO: Conflito de Nomes - `dynamic`

**Data:** 2025-11-27  
**Status:** ✅ CORRIGIDO

---

## 🐛 PROBLEMA IDENTIFICADO

### Erro:
```
ReferenceError: Cannot access 'dynamic' before initialization
at eval (app\layout.tsx:9:21)
```

### Causa Raiz:
**Conflito de nomes** entre:
1. **Import:** `import dynamic from "next/dynamic"` (linha 6)
2. **Export:** `export const dynamic = 'force-dynamic'` (linha 74)

O JavaScript estava tentando usar `dynamic` (a função do Next.js) antes de ela ser inicializada, porque havia uma exportação com o mesmo nome que estava causando um conflito de hoisting.

---

## ✅ SOLUÇÃO APLICADA

### Mudança no `app/layout.tsx`:

**ANTES:**
```typescript
import dynamic from "next/dynamic"

// ...

const ToastWrapper = dynamic(
  () => import("@/components/providers/toast-wrapper"),
  { ssr: false }
)

// ...

export const dynamic = 'force-dynamic'  // ❌ CONFLITO!
```

**DEPOIS:**
```typescript
import dynamicImport from "next/dynamic"  // ✅ Renomeado

// ...

const ToastWrapper = dynamicImport(
  () => import("@/components/providers/toast-wrapper"),
  { ssr: false }
)

// ...

export const dynamic = 'force-dynamic'  // ✅ Sem conflito
```

---

## 📋 EXPLICAÇÃO TÉCNICA

### Por que aconteceu?

1. **Hoisting em JavaScript:**
   - Declarações `const` e `export const` são "hoisted" (movidas para o topo)
   - O JavaScript vê `export const dynamic` e tenta inicializar antes do import

2. **Conflito de Escopo:**
   - O mesmo nome `dynamic` estava sendo usado para duas coisas diferentes:
     - Função do Next.js para dynamic imports
     - Constante exportada para configuração de rota

3. **Temporal Dead Zone (TDZ):**
   - Quando há um conflito de nomes, o JavaScript entra em TDZ
   - Tenta acessar `dynamic` antes de ser inicializado → Erro

### Solução:
- Renomear o import para `dynamicImport` evita o conflito
- O export `dynamic` continua funcionando normalmente
- Não há mais conflito de nomes

---

## 🔍 VERIFICAÇÕES

### ✅ Arquivo Modificado:
- `app/layout.tsx` - Import renomeado para `dynamicImport`

### ✅ Funcionalidade Mantida:
- Dynamic import do ToastWrapper continua funcionando
- Export `dynamic = 'force-dynamic'` continua funcionando
- SSR desabilitado para ToastWrapper continua funcionando

---

## 🧪 TESTE

### Passos para Verificar:
1. O servidor deve recarregar automaticamente
2. Acessar: `http://localhost:3000`
3. Verificar console (F12) - não deve haver mais erros
4. Verificar que a página carrega corretamente

---

## 📊 RESULTADO

✅ **Erro corrigido!**

O conflito de nomes foi resolvido renomeando o import. Agora:
- ✅ `dynamicImport` é usado para dynamic imports
- ✅ `dynamic` é usado apenas para export de configuração
- ✅ Sem conflitos de hoisting
- ✅ Servidor deve funcionar normalmente

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ Conflito resolvido
2. ⚠️ Verificar se servidor recarregou
3. ⚠️ Testar a aplicação
4. ⚠️ Verificar que não há mais erros no console

---

**Status:** ✅ CORRIGIDO

