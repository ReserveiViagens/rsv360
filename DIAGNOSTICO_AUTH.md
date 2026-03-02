# Diagnóstico de Autenticação

## Problema
A página `/dashboard/modulos-turismo` fica travada na tela "Verificando permissões..."

## Logs de Debug Adicionados

### AuthContext (`src/context/AuthContext.tsx`)
- Log quando inicia verificação de autenticação
- Log quando encontra tokens no localStorage
- Log quando detecta token demo
- Log quando verifica token real
- Log quando finaliza inicialização

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- Log quando componente é montado
- Log do estado de autenticação (mounted, isLoading, isAuthenticated, hasUser)
- Log quando redireciona para /login

## Como Diagnosticar

1. **Abra o Console do Navegador** (F12 → Console)
2. **Recarregue a página** (`http://localhost:3005/dashboard/modulos-turismo`)
3. **Verifique os logs** que começam com `[AuthContext]` ou `[ProtectedRoute]`

## Possíveis Causas

### 1. Não há token armazenado
**Sintoma**: Logs mostram "Nenhum token encontrado"
**Solução**: Fazer login primeiro em `/login`

### 2. Verificação de token está travando
**Sintoma**: Logs mostram "Verificando token real..." mas não finaliza
**Solução**: O timeout de 5s deve resolver, mas verifique se o backend está rodando

### 3. isLoading nunca vira false
**Sintoma**: Logs mostram que `isLoading` permanece `true`
**Solução**: Verificar se o `finally` está sendo executado

## Solução Rápida para Teste

Para testar rapidamente sem fazer login, você pode:

1. **Abrir o Console do Navegador** (F12)
2. **Executar este comando**:
```javascript
localStorage.setItem('access_token', 'demo-token');
localStorage.setItem('refresh_token', 'demo-refresh');
location.reload();
```

Isso criará um usuário demo automaticamente e permitirá acesso à página.

## Próximos Passos

1. Verificar os logs no console
2. Compartilhar os logs para análise
3. Verificar se o backend está rodando em `http://localhost:5000`

