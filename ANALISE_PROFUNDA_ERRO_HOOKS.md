# 🔍 Análise Profunda: Erro "Rendered more hooks than during the previous render"

**Data:** 2025-01-05

---

## 🎯 Problema Identificado

### Erro
```
Rendered more hooks than during the previous render.

Previous render            Next render
------------------------------------------------------
1. useState                   useState
2. useContext                 useContext
3. useContext                 useContext
4. useEffect                  useEffect
5. undefined                  useEffect  ← PROBLEMA!
```

### Causa Raiz

O componente `ProtectedRoute` estava violando as **Regras dos Hooks** do React ao chamar um `useEffect` **DEPOIS** de um `return` condicional.

---

## 📋 Análise Detalhada

### Arquivos Encontrados

1. **`apps/turismo/components/ProtectedRoute.tsx`** ← **PROBLEMA AQUI**
   - Usado por: `dashboard.tsx` e outras 30+ páginas
   - Import: `import ProtectedRoute from '../components/ProtectedRoute'`

2. **`apps/turismo/src/components/ProtectedRoute.tsx`** ✅ **CORRETO**
   - Usado por: páginas em `dashboard/leiloes`, `dashboard/excursoes`, etc.
   - Import: `import ProtectedRoute from '../../../src/components/ProtectedRoute'`

### Problema no Arquivo `components/ProtectedRoute.tsx`

**Código ANTES (ERRADO):**
```typescript
const [isMounted, setIsMounted] = useState(false);        // Hook 1
const router = useRouter();                               // Hook 2
const { ... } = useAuth();                                // Hook 3 (usa useContext)
useEffect(() => { setIsMounted(true); }, []);             // Hook 4

if (!isMounted) {                                         // ← RETURN CONDICIONAL
  return <>{fallback}</>;
}

useEffect(() => {                                         // ← Hook 5 - PROBLEMA!
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
  }
}, [isAuthenticated, isLoading, router]);
```

**Problema:**
- Quando `isMounted` é `false` (SSR ou primeira renderização):
  - Hooks 1-4 são chamados
  - Componente retorna na linha 36
  - Hook 5 **NÃO é chamado**

- Quando `isMounted` se torna `true` (após montagem):
  - Hooks 1-4 são chamados
  - Componente **NÃO retorna** na linha 36
  - Hook 5 **É chamado**

**Resultado:** Ordem dos hooks muda entre renderizações → **ERRO!**

---

## ✅ Solução Aplicada

### Código DEPOIS (CORRETO):
```typescript
const [isMounted, setIsMounted] = useState(false);        // Hook 1
const router = useRouter();                               // Hook 2
const { ... } = useAuth();                                // Hook 3 (usa useContext)
useEffect(() => { setIsMounted(true); }, []);             // Hook 4
useEffect(() => {                                         // Hook 5 ← MOVIDO PARA ANTES DO RETURN
  if (isMounted && !isLoading && !isAuthenticated) {
    router.push('/login');
  }
}, [isMounted, isAuthenticated, isLoading, router]);

if (!isMounted) {                                         // ← RETURN CONDICIONAL (agora depois de todos os hooks)
  return <>{fallback}</>;
}
```

**Solução:**
- ✅ **TODOS os hooks são sempre chamados** na mesma ordem
- ✅ `useEffect` do redirecionamento verifica `isMounted` internamente
- ✅ Ordem dos hooks nunca muda entre renderizações

---

## 🔍 Regras dos Hooks do React

### Regra #1: Só chame hooks no nível superior
❌ **ERRADO:** Chamar hooks dentro de condições, loops ou funções aninhadas
✅ **CORRETO:** Sempre chamar hooks no mesmo nível superior

### Regra #2: Só chame hooks de funções React
✅ **CORRETO:** Chamar hooks de componentes funcionais ou hooks customizados

### Regra #3: Chame hooks na mesma ordem
❌ **ERRADO:** Ordem dos hooks muda entre renderizações
✅ **CORRETO:** Sempre chamar hooks na mesma ordem

---

## 📊 Comparação: Antes vs Depois

### Antes (ERRADO)
```
Renderização 1 (isMounted = false):
1. useState
2. useRouter
3. useAuth (useContext)
4. useEffect (setIsMounted)
→ RETURN (Hook 5 não é chamado)

Renderização 2 (isMounted = true):
1. useState
2. useRouter
3. useAuth (useContext)
4. useEffect (setIsMounted)
5. useEffect (router.push) ← EXTRA!
→ Continua...
```

### Depois (CORRETO)
```
Renderização 1 (isMounted = false):
1. useState
2. useRouter
3. useAuth (useContext)
4. useEffect (setIsMounted)
5. useEffect (router.push) ← Sempre chamado!
→ RETURN

Renderização 2 (isMounted = true):
1. useState
2. useRouter
3. useAuth (useContext)
4. useEffect (setIsMounted)
5. useEffect (router.push) ← Sempre chamado!
→ Continua...
```

**Resultado:** Ordem sempre igual → ✅ **SEM ERRO!**

---

## 🔧 Mudanças Aplicadas

### Arquivo: `apps/turismo/components/ProtectedRoute.tsx`

**Mudança Principal:**
- ✅ Movido `useEffect` do redirecionamento para **ANTES** do `if (!isMounted) return`
- ✅ Adicionada verificação `isMounted` dentro do `useEffect` em vez de fora
- ✅ Todos os hooks agora são sempre chamados na mesma ordem

**Código Corrigido:**
```typescript
// Todos os hooks ANTES de qualquer return
const [isMounted, setIsMounted] = useState(false);
const router = useRouter();
const { isAuthenticated, isLoading, hasPermission } = useAuth();

useEffect(() => {
  setIsMounted(true);
}, []);

useEffect(() => {
  // Verificação isMounted DENTRO do useEffect
  if (isMounted && !isLoading && !isAuthenticated) {
    router.push('/login');
  }
}, [isMounted, isAuthenticated, isLoading, router]);

// Agora pode retornar condicionalmente
if (!isMounted) {
  return <>{fallback}</>;
}
```

---

## ✅ Verificação

### Ordem dos Hooks (Correta)
```
1. useState (isMounted)
2. useRouter
3. useAuth (que usa useContext internamente)
4. useEffect (setIsMounted)
5. useEffect (router.push)
```

### Durante SSR
- Todos os hooks são chamados
- `useAuth` retorna valores padrão
- `isMounted` é `false`
- Retorna `fallback` imediatamente

### Após Montagem no Cliente
- Todos os hooks são chamados (mesma ordem)
- `useAuth` retorna valores reais do contexto
- `isMounted` se torna `true`
- `useEffect` do redirecionamento funciona corretamente

---

## 🚨 Por que isso acontece?

React mantém um registro interno da ordem dos hooks chamados. Quando a ordem muda entre renderizações, React não consegue associar os valores corretos aos hooks, causando bugs e erros.

### Exemplo do Problema

```typescript
// Renderização 1: isMounted = false
const [a] = useState(1);     // Hook 1
const [b] = useState(2);     // Hook 2
if (false) return;           // Return cedo
const [c] = useState(3);     // Hook 3 - NÃO É CHAMADO

// Renderização 2: isMounted = true
const [a] = useState(1);     // Hook 1
const [b] = useState(2);     // Hook 2
if (true) return;            // NÃO retorna
const [c] = useState(3);     // Hook 3 - É CHAMADO

// React confunde: "Hook 3 não existia antes, agora existe?"
// → ERRO: "Rendered more hooks than during the previous render"
```

---

## 📝 Arquivos Modificados

### 1. `apps/turismo/components/ProtectedRoute.tsx`
- ✅ Movido `useEffect` para antes do `return` condicional
- ✅ Adicionada verificação `isMounted` dentro do `useEffect`

### 2. `apps/turismo/src/components/ProtectedRoute.tsx`
- ✅ Já estava correto (todos os hooks antes do return)

---

## 🔍 Verificação Final

### Checklist
- [x] Todos os hooks chamados antes de qualquer `return`
- [x] Ordem dos hooks sempre igual entre renderizações
- [x] `useEffect` verifica condições internamente
- [x] Compatível com SSR
- [x] Compatível com renderização no cliente

---

## 🎯 Resumo

### Problema
- `useEffect` chamado **DEPOIS** de um `return` condicional
- Ordem dos hooks mudava entre renderizações

### Solução
- Movido `useEffect` para **ANTES** do `return` condicional
- Verificação `isMounted` movida para **DENTRO** do `useEffect`
- Todos os hooks sempre chamados na mesma ordem

### Resultado
- ✅ Erro resolvido
- ✅ Regras dos Hooks respeitadas
- ✅ Compatível com SSR e cliente

---

**Status:** ✅ **PROBLEMA RESOLVIDO DEFINITIVAMENTE**

**Última atualização:** 2025-01-05

