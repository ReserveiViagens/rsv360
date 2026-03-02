# ADR-002: Autenticação JWT

**Status:** Aceito  
**Data:** 2025-11-22  
**Decisores:** Equipe de Desenvolvimento

## Contexto

O RSV Gen 2 precisa de um sistema de autenticação seguro e escalável para:
- Usuários (hóspedes e hosts)
- API pública para integrações
- Sessões stateless para escalabilidade
- Suporte a múltiplos dispositivos

Requisitos:
- Stateless (sem sessões no servidor)
- Escalável horizontalmente
- Seguro contra ataques comuns
- Suporte a refresh tokens
- Revogação de tokens

## Decisão

**JWT (JSON Web Tokens)** foi escolhido como método de autenticação principal.

### Estrutura

- **Access Token:** JWT com expiração curta (1 hora)
- **Refresh Token:** JWT com expiração longa (7 dias), armazenado em banco
- **Algoritmo:** HS256 (HMAC-SHA256)
- **Validação:** Verificação de assinatura, expiração e algoritmo

## Consequências

### Positivas

- ✅ Stateless: não requer armazenamento de sessão no servidor
- ✅ Escalável: funciona bem em arquitetura distribuída
- ✅ Portátil: token contém informações do usuário
- ✅ Padrão da indústria: amplamente adotado
- ✅ Suporte a múltiplos dispositivos: cada dispositivo tem seu próprio token

### Negativas

- ⚠️ Não pode ser revogado facilmente (sem blacklist)
- ⚠️ Tamanho maior que session IDs
- ⚠️ Dados no token são visíveis (mas não modificáveis)

## Alternativas Consideradas

### Session-based Authentication

**Prós:**
- Revogação fácil (remover sessão)
- Tokens pequenos (apenas session ID)

**Contras:**
- Requer armazenamento de sessão (Redis/banco)
- Não escala bem sem configuração adicional
- Stateful (complexidade em load balancing)

**Por que não:** Stateless é preferível para escalabilidade. Refresh tokens com blacklist resolvem o problema de revogação.

### OAuth 2.0 / OpenID Connect

**Prós:**
- Padrão da indústria
- Suporte a múltiplos provedores
- Fluxos bem definidos

**Contras:**
- Complexidade adicional
- Overhead para casos simples
- Requer servidor de autorização

**Por que não:** Para autenticação própria, JWT é mais simples. OAuth pode ser adicionado depois para login social.

### API Keys

**Prós:**
- Simples
- Fácil de implementar

**Contras:**
- Sem expiração automática
- Menos seguro (sem assinatura)
- Não contém informações do usuário

**Por que não:** Usado apenas para integrações de API pública. JWT é mais seguro e flexível.

## Implementação

### Estrutura do Token

```json
{
  "userId": 123,
  "email": "usuario@example.com",
  "role": "host",
  "iat": 1637596800,
  "exp": 1637600400
}
```

### Fluxo de Autenticação

1. **Login:** Usuário envia credenciais
2. **Validação:** Servidor valida credenciais
3. **Geração:** Servidor gera access token e refresh token
4. **Resposta:** Tokens retornados ao cliente
5. **Uso:** Cliente envia access token em requisições
6. **Renovação:** Quando expira, usar refresh token para obter novo access token

### Segurança

- **HS256:** Algoritmo seguro e amplamente suportado
- **Expiração curta:** Access tokens expiram em 1 hora
- **Refresh tokens:** Armazenados em banco com revogação
- **Validação rigorosa:** Verificar algoritmo, assinatura e expiração
- **HTTPS obrigatório:** Tokens sempre transmitidos via HTTPS

### Blacklist para Revogação

Refresh tokens são armazenados no banco com status. Quando revogados, são marcados como inativos.

---

**Status:** ✅ Implementado e em produção

