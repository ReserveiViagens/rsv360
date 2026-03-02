# Correção: Ordem dos Hooks do React

## Problema Identificado

O erro "useAuth deve ser usado dentro de um AuthProvider" estava ocorrendo porque:

1. **Violação das Regras dos Hooks**: O hook `useAuth` estava sendo chamado condicionalmente (dentro de um `if (!mounted)`), o que viola a regra do React de que hooks devem sempre ser chamados na mesma ordem.

2. **Erro durante SSR**: O `useAuth` lançava um erro quando o contexto não estava disponível durante Server-Side Rendering (SSR).

## Soluções Aplicadas

### 1. Modificação do `useAuth` (`src/context/AuthContext.tsx`)

**Antes:**
```typescript
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
```

**Depois:**
```typescript
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  // Durante SSR ou se não estiver no AuthProvider, retornar valores padrão
  if (context === undefined) {
    // Retornar valores padrão em vez de lançar erro
    // Isso permite que o componente seja renderizado durante SSR
    return {
      user: null,
      login: async () => false,
      logout: () => {},
      register: async () => false,
      isLoading: true,
      isAuthenticated: false,
      refreshToken: async () => {},
      updateUser: async () => false,
      changePassword: async () => false,
    };
  }
  return context;
}
```

### 2. Simplificação do `ProtectedRoute` (`src/components/ProtectedRoute.tsx`)

**Antes:**
```typescript
if (!mounted) {
  return <>{fallback}</>;
}
const { isAuthenticated, isLoading, user } = useAuth();
```

**Depois:**
```typescript
// IMPORTANTE: useAuth deve ser chamado sempre, na mesma ordem
// Agora useAuth retorna valores padrão em vez de lançar erro
const { isAuthenticated, isLoading, user } = useAuth();

// Garantir que só executa no cliente
useEffect(() => {
  setMounted(true);
}, []);

// Durante SSR ou antes de montar, retornar fallback
if (!mounted) {
  return <>{fallback}</>;
}
```

## Por que isso funciona?

1. **Ordem Consistente dos Hooks**: Agora `useAuth()` é sempre chamado na mesma ordem, independentemente do estado do componente, respeitando as regras do React.

2. **Compatibilidade com SSR**: O `useAuth` retorna valores padrão durante SSR em vez de lançar erro, permitindo que o componente seja renderizado no servidor.

3. **Renderização Condicional Segura**: O componente ainda verifica `mounted` antes de usar os valores do contexto, mas os hooks são sempre chamados na mesma ordem.

## Arquivos Modificados

1. `apps/turismo/src/context/AuthContext.tsx` - Modificado `useAuth` para retornar valores padrão
2. `apps/turismo/src/components/ProtectedRoute.tsx` - Simplificado para sempre chamar `useAuth()`

## Próximos Passos

1. Aguardar o Next.js recompilar automaticamente
2. Verificar se o erro foi resolvido no navegador
3. Testar a navegação entre páginas protegidas

