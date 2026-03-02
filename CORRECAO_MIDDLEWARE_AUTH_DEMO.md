# Correção: Middleware de Autenticação Aceitar Tokens Demo

## Problema Identificado

O middleware de autenticação estava rejeitando tokens demo (`demo-token` e `admin-token`), causando:
- Erro `Unauthorized: Invalid token` em todas as requisições
- Páginas de leilões e excursões não carregavam dados
- Sistema não funcionava em desenvolvimento

## Solução Implementada

### Modificação no Middleware de Autenticação

**Arquivo:** `backend/src/middleware/auth.js`

**Mudança:**
- Adicionado suporte para tokens demo em modo desenvolvimento
- Tokens `demo-token` e `admin-token` são aceitos automaticamente
- Cria usuário mockado quando token demo é detectado
- Em produção, continua usando JWT real

### Código Adicionado

```javascript
// MODO DESENVOLVIMENTO: Aceitar tokens demo
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
  if (token === 'demo-token' || token === 'admin-token') {
    // Criar usuário demo mockado
    const demoUser = {
      id: token === 'demo-token' ? 1 : 2,
      email: token === 'demo-token' ? 'demo@onionrsv.com' : 'admin@onionrsv.com',
      name: token === 'demo-token' ? 'Usuário Demo' : 'Administrador',
      role: 'admin',
      status: 'active',
      permissions: ['admin'],
      last_login: new Date().toISOString(),
    };

    req.user = demoUser;
    req.token = token;
    return next();
  }
}
```

## Tokens Suportados

### `demo-token`
- **ID:** 1
- **Email:** demo@onionrsv.com
- **Nome:** Usuário Demo
- **Role:** admin
- **Permissões:** ['admin']

### `admin-token`
- **ID:** 2
- **Email:** admin@onionrsv.com
- **Nome:** Administrador
- **Role:** admin
- **Permissões:** ['admin']

## Como Usar

### No Frontend

O `AuthContext` já suporta tokens demo. Quando o usuário faz login com:
- Email: `demo@onionrsv.com` / Senha: `demo123`
- Email: `admin@onionrsv.com` / Senha: `admin123`

O token `demo-token` ou `admin-token` é armazenado no `localStorage` e será aceito pelo backend.

### Teste Manual

```powershell
# Testar com token demo
curl http://localhost:5000/api/v1/leiloes -H "Authorization: Bearer demo-token"

# Testar com token admin
curl http://localhost:5000/api/v1/excursoes -H "Authorization: Bearer admin-token"
```

## Segurança

⚠️ **IMPORTANTE**: Esta funcionalidade só funciona em modo desenvolvimento!

- Em produção (`NODE_ENV=production`), apenas tokens JWT reais são aceitos
- Tokens demo são rejeitados em produção
- Sempre use autenticação real em produção

## Status

✅ **Correção Implementada**
- Middleware modificado para aceitar tokens demo
- Suporte para `demo-token` e `admin-token`
- Funciona apenas em desenvolvimento
- Produção continua segura

## Data da Correção

12 de Janeiro de 2026
