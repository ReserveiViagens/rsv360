# Spec de segurança — Auth v1: 2FA e recuperação de senha

**Versão:** 1.0  
**Data:** 2026-06-22  
**Status:** Aprovada para implementação (trilha D2 fase 2)  
**Escopo:** Backend `:3002` `/api/v1/auth/*`, apps turismo e site-publico (BFF)  
**Pré-requisitos:** T1.7 login/session/refresh/logout, D2.2 register, T1.5 rate limit

## 1. Objetivo

Definir contrato, requisitos de segurança e fases de entrega para:

1. **2FA TOTP** (setup, verificação no login, disable, backup codes)
2. **Forgot / reset password** (token opaco, e-mail, expiração)

Substitui rotas legado `/api/auth/2fa/*` e `/api/auth/forgot-password` / `reset-password` (404 hoje).

## 2. Princípios (alinhados ao canônico v1)

| Princípio | Regra |
|-----------|--------|
| Namespace | Apenas `/api/v1/auth/*` no backend |
| Resposta | `{ success, data?, error?, message? }` — mesmo padrão login/register |
| Senha | bcrypt cost ≥ 12 (igual register) |
| Rate limit | Reutilizar `auth_rate_limits` (T1.5); ações novas abaixo |
| Sem vazamento | Forgot-password sempre **200** genérico (não revelar se e-mail existe) |
| Tokens reset | Opacos, hash no DB, uso único, TTL curto |
| 2FA secret | Criptografado ou hash no DB; nunca retornar após setup |
| Login + 2FA | Fluxo em duas etapas: login → `requires_2fa` + `temp_token` → verify → tokens finais |

## 3. Endpoints propostos

### 3.1 Recuperação de senha

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/v1/auth/forgot-password` | Não | Solicita e-mail de reset |
| POST | `/api/v1/auth/reset-password` | Não | Define nova senha com token |

**POST forgot-password**

```json
{ "email": "user@example.com" }
```

| Status | Body |
|--------|------|
| 200 | `{ "success": true, "message": "Se o e-mail existir, enviaremos instruções." }` |
| 400 | e-mail ausente/inválido |
| 429 | rate limit |
| 501 | `DATABASE_URL` ausente |
| 503 | falha de serviço |

**POST reset-password**

```json
{
  "token": "opaque-token-from-email",
  "password": "minimo-8-chars",
  "password_confirmation": "minimo-8-chars"
}
```

| Status | Body |
|--------|------|
| 200 | `{ "success": true, "message": "Senha alterada. Faça login." }` |
| 400 | validação (senha curta, confirmação, token ausente) |
| 401 | token inválido/expirado/usado |
| 429 | rate limit |
| 503 | erro de serviço |

**Regras**

- Token: 32+ bytes aleatórios (base64url); armazenar **hash** (SHA-256) em `password_reset_tokens`
- TTL: **60 minutos**
- Uso único: invalidar após reset bem-sucedido
- Revogar refresh tokens do usuário após reset (forçar re-login)
- Rate limit: `forgot-password` — 5/email/hora, 20/IP/hora; `reset-password` — 10/IP/hora

### 3.2 Autenticação em dois fatores (TOTP)

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/v1/auth/2fa/setup` | Bearer | Gera secret + QR (não ativa ainda) |
| POST | `/api/v1/auth/2fa/verify-setup` | Bearer | Confirma TOTP e ativa 2FA |
| POST | `/api/v1/auth/2fa/verify` | `temp_token` ou Bearer parcial | Completa login ou step-up |
| POST | `/api/v1/auth/2fa/disable` | Bearer + senha + TOTP ou backup | Desativa 2FA |
| POST | `/api/v1/auth/2fa/backup-codes` | Bearer + senha + TOTP | Regenera backup codes |

**POST 2fa/setup** → 200

```json
{
  "success": true,
  "data": {
    "secret": "BASE32SECRET",
    "qr_code": "data:image/png;base64,...",
    "otpauth_url": "otpauth://totp/..."
  }
}
```

**POST 2fa/verify-setup**

```json
{ "code": "123456" }
```

→ 200 `{ success, data: { backup_codes: ["xxxx-xxxx", ...] } }` (10 códigos, exibidos **uma vez**)

**Login com 2FA** — estender `POST /api/v1/auth/login`:

Se usuário tem 2FA ativo e senha OK:

```json
{
  "success": true,
  "data": {
    "requires_2fa": true,
    "temp_token": "jwt-or-opaque-short-lived",
    "expires_in": 300
  }
}
```

Sem `access_token` / `refresh_token` até `2fa/verify`.

**POST 2fa/verify**

```json
{
  "temp_token": "...",
  "code": "123456"
}
```

ou `{ "temp_token", "backup_code": "xxxx-xxxx" }`

→ 200 com `access_token`, `refresh_token`, `user` (igual login normal).

**POST 2fa/disable**

```json
{
  "password": "current",
  "code": "123456"
}
```

**POST 2fa/backup-codes** — mesma autenticação que disable; retorna novos 10 códigos (invalida anteriores).

**Regras TOTP**

- Algoritmo: **TOTP RFC 6238**, 6 dígitos, janela ±1 step (30s)
- Secret: 160 bits, Base32
- Backup codes: 10× 8 chars; armazenar **hash** bcrypt; consumo único
- Rate limit `2fa/verify`: 5 tentativas / 15 min por `temp_token` ou IP
- `temp_token` TTL: **5 minutos**, uso único após sucesso

## 4. Modelo de dados (mínimo)

```sql
-- password_reset_tokens
user_id, token_hash, expires_at, used_at, created_at

-- user_2fa (ou colunas em users)
user_id, totp_secret_encrypted, enabled_at, backup_codes_hash jsonb

-- login_2fa_challenges (opcional)
temp_token_hash, user_id, expires_at, consumed_at
```

Campos `two_factor_enabled` já retornados em register/session devem refletir estado real.

## 5. Apps — wire planejado

| App | Padrão | Fase |
|-----|--------|------|
| **turismo** | Direto `AUTH_V1.*` (como register D2.3) | D2.6 |
| **site-publico** | BFF `/api/auth/*` → proxy v1 (T1.8) | D2.7 |
| **admin** | Já v1; adicionar telas 2FA se produto exigir | backlog |

Remover `auth-legacy-deferred.ts` no turismo após D2.6.

## 6. Fases de entrega

| Fase | Entregável | Evidência |
|------|------------|-----------|
| **D2.4** | Backend forgot/reset + migration + e-mail adapter | `D2.4-BACKEND-PASSWORD-RESET-RESULT.md` |
| **D2.5** | Backend 2FA TOTP + login `requires_2fa` | `D2.5-BACKEND-2FA-RESULT.md` |
| **D2.6** | Turismo wire + remover defer | `D2.6-TURISMO-2FA-RESET-V1-RESULT.md` |
| **D2.7** | site-publico BFF forgot/reset | `D2.7-SITE-PUBLICO-AUTH-BFF-RESULT.md` |

Ordem recomendada: **D2.4 → D2.5 → D2.6 → D2.7** (reset antes de 2FA reduz superfície no login).

## 7. Testes obrigatórios

| Tipo | Cenários |
|------|----------|
| Integration | forgot 200 genérico; reset token válido/expirado; 2fa setup→verify→login; backup code; disable |
| E2E | Adicionar em `tests/e2e/auth-v1/` após D2.4/D2.5 |
| Smoke | `turismo-legacy` atualizado: legado 404 mantido; v1 2fa/respondem conforme spec |

## 8. Fora de escopo v1

- SMS 2FA / WebAuthn / FIDO2
- OAuth social (Google/Facebook) — site-publico permanece local
- Admin enforcement “2FA obrigatório por role” (fase futura)
- E-mail production (SES/SMTP): adapter com log em dev, igual padrão atual

## 9. Referências

- `docs/evidence/auth/D2-DEFER-2FA-PASSWORD-RESET.md`
- `docs/evidence/auth/D2.2-BACKEND-AUTH-REGISTER-RESULT.md`
- `apps/site-publico/docs/ADRs/ADR-002-jwt-authentication.md`
- `apps/site-publico/docs/ADRs/ADR-003-rate-limiting.md`
- `backend/src/api/v1/auth/rate-limit.service.js`
