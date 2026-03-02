# ✅ Correção: Erro do Servidor Interno

**Data:** 2025-01-05

---

## ❌ Problema Identificado

**Erro:** Internal Server Error (500) no Next.js

**Causa Raiz:**
- `AuthContext.tsx` estava usando `useRouter()` do Next.js no nível superior do componente
- `useRouter()` não funciona durante SSR (Server-Side Rendering)
- Isso causava erro quando o Next.js tentava renderizar o componente no servidor

---

## ✅ Correção Aplicada

### 1. Removido `useRouter` do AuthContext

**Antes:**
```typescript
import { useRouter } from 'next/router';

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter(); // ❌ Causa erro em SSR
  // ...
  router.push('/login'); // ❌ Não funciona em SSR
}
```

**Depois:**
```typescript
// Removido: import { useRouter } from 'next/router';

export function AuthProvider({ children }: AuthProviderProps) {
  // ✅ Sem useRouter no nível superior
  // ...
  // Redirecionar usando window.location (funciona em SSR)
  if (typeof window !== 'undefined') {
    window.location.href = '/login'; // ✅ Funciona em SSR
  }
}
```

### 2. Mudanças Específicas

1. **Removido import:**
   - ❌ `import { useRouter } from 'next/router';`

2. **Removido uso de router:**
   - ❌ `const router = useRouter();`

3. **Substituído redirecionamento:**
   - ❌ `router.push('/login');`
   - ✅ `window.location.href = '/login';` (com verificação `typeof window !== 'undefined'`)

---

## 📊 Por Que Isso Funciona?

### Problema com `useRouter()` em SSR:
- `useRouter()` é um hook do Next.js que só funciona no cliente
- Durante SSR, o Next.js renderiza componentes no servidor
- Hooks que dependem do browser (como `useRouter`) causam erro

### Solução com `window.location.href`:
- `window.location.href` é uma API nativa do browser
- Verificamos `typeof window !== 'undefined'` antes de usar
- Isso garante que só executa no cliente
- Não causa erro durante SSR porque a verificação previne a execução

---

## 🔄 Status

- ✅ `useRouter` removido do `AuthContext`
- ✅ Redirecionamento corrigido
- ✅ Compatível com SSR
- ✅ Cache limpo
- ⏳ **Reinicie o frontend manualmente**

---

## 📋 Próximos Passos

### 1. Reiniciar Frontend

```powershell
cd apps\turismo
npm run dev
```

### 2. Verificar Logs

Procure por:
- ✅ "Ready on http://localhost:3005"
- ❌ Sem erros "Internal Server Error"
- ❌ Sem erros relacionados a `useRouter`

### 3. Testar no Navegador

1. Acesse: http://localhost:3005
2. Verifique se a página carrega sem erros
3. Teste login: http://localhost:3005/login
4. Teste dashboard: http://localhost:3005/dashboard/modulos-turismo

---

## 📚 Arquivos Modificados

1. `apps/turismo/src/context/AuthContext.tsx`
   - Removido `import { useRouter }`
   - Removido `const router = useRouter()`
   - Substituído `router.push('/login')` por `window.location.href = '/login'`

---

## ✅ Checklist

- [x] `useRouter` removido do AuthContext
- [x] Redirecionamento corrigido
- [x] Verificação `typeof window` adicionada
- [x] Cache limpo
- [ ] Frontend reiniciado? (fazer manualmente)
- [ ] Erro resolvido? (verificar após reiniciar)

---

## 💡 Notas Técnicas

### Por que não usar `useRouter` em Context Providers?

1. **SSR Compatibility:** Context providers são renderizados no servidor
2. **Hook Rules:** Hooks devem ser chamados na mesma ordem sempre
3. **Browser APIs:** `useRouter` depende de APIs do browser que não existem no servidor

### Alternativas para Redirecionamento:

1. ✅ `window.location.href` - Funciona em SSR (com verificação)
2. ✅ `useRouter` em componentes de página (não em providers)
3. ✅ `useEffect` + `router.push` em componentes client-side

---

**Última atualização:** 2025-01-05

