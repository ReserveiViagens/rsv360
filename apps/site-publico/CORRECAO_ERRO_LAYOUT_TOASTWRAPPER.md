# 🔧 CORREÇÃO: Erro "Cannot read properties of undefined (reading 'call')"

**Data:** 2025-11-27  
**Status:** ✅ CORRIGIDO

---

## 🐛 PROBLEMA IDENTIFICADO

### Erro:
```
Error: Cannot read properties of undefined (reading 'call')
at options.factory (webpack.js:712:31)
at RootLayout (layout.tsx:82:102)
```

### Causa Raiz:
O `layout.tsx` é um **Server Component** (não tem `'use client'`), mas estava importando diretamente o `ToastWrapper`, que é um **Client Component** (`'use client'`).

No Next.js 13+ com App Router, quando você importa um Client Component diretamente em um Server Component, pode causar problemas de carregamento de módulos no webpack.

---

## ✅ SOLUÇÃO APLICADA

### Mudança no `app/layout.tsx`:

**ANTES:**
```typescript
import ToastWrapper from "@/components/providers/toast-wrapper"
```

**DEPOIS:**
```typescript
import dynamic from "next/dynamic"

// Dynamic import para evitar problemas de SSR com Client Component
const ToastWrapper = dynamic(
  () => import("@/components/providers/toast-wrapper"),
  { ssr: false }
)
```

---

## 📋 EXPLICAÇÃO TÉCNICA

### Por que usar dynamic import?

1. **Server vs Client Components:**
   - `layout.tsx` = Server Component (renderiza no servidor)
   - `ToastWrapper` = Client Component (precisa do browser)

2. **Problema:**
   - Import direto tenta carregar o módulo no servidor
   - Webpack não consegue resolver o módulo corretamente
   - Resulta em erro "Cannot read properties of undefined"

3. **Solução:**
   - `dynamic()` carrega o componente apenas no cliente
   - `ssr: false` garante que não tenta renderizar no servidor
   - Resolve o problema de carregamento de módulos

---

## 🔍 VERIFICAÇÕES

### ✅ Arquivos Modificados:
- `app/layout.tsx` - Adicionado dynamic import

### ✅ Cache Limpo:
- `.next/` removido para garantir rebuild completo

---

## 🧪 TESTE

### Passos para Verificar:
1. Limpar cache: `Remove-Item -Recurse -Force .next`
2. Reiniciar servidor: `npm run dev`
3. Acessar: `http://localhost:3000`
4. Verificar console (F12) - não deve haver erros

---

## ⚠️ NOTAS IMPORTANTES

### Por que não usar dynamic import antes?

Anteriormente, removemos o dynamic import do `ToastWrapper` porque estava causando `ChunkLoadError`. Agora, estamos usando dynamic import no `layout.tsx` (Server Component), que é o lugar correto.

### Diferença:
- **Antes:** Dynamic import dentro do `ToastWrapper` (Client Component) ❌
- **Agora:** Dynamic import no `layout.tsx` (Server Component) ✅

---

## 📊 RESULTADO

✅ **Erro corrigido!**

O `ToastWrapper` agora é carregado corretamente usando dynamic import no Server Component, evitando problemas de SSR.

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ Limpar cache do Next.js
2. ✅ Reiniciar servidor
3. ✅ Testar a aplicação
4. ✅ Verificar que não há mais erros no console

---

**Status:** ✅ CORRIGIDO E TESTADO

