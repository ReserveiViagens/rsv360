# PR F5 — Consolidação MFA admin + UI segura de senha

## Contexto

F4 (enforcement 06c) encerrada e registrada no canônico Notion (29/07/2026).  
Esta fatia versiona os patches locais que já rodavam em runtime na janela + UI segura de senha (spec F5).

## Inventário pré-commit (6 patches locais originais)

| # | Arquivo | Papel |
|---|---------|--------|
| 1 | `apps/site-publico/app/admin/login/page.tsx` | E-mail + desafio TOTP |
| 2 | `apps/site-publico/app/api/admin/auth/login/route.ts` | Preferência URL interna backend |
| 3 | `apps/site-publico/app/api/admin/auth/2fa/route.ts` | Proxy TOTP + cookie `admin_token` |
| 4 | `apps/site-publico/middleware.ts` | `/admin/mfa-enroll` público |
| 5 | `apps/site-publico/components/lab/LabShell.tsx` | Botão Sair |
| 6 | `docker-compose.override.yml` | **Não versionado** (LOCAL ONLY) |

Nenhum arquivo fora do escopo MFA/senha no inventário inicial.

### Tratamento do item 6

Wiring permanente movido para `docker-compose.yml` (flags `AUTH_*` default OFF + `ADMIN_JWT_SECRET` + `AUTH_V1_BASE_URL`).  
`docker-compose.override.yml` permanece **apenas no host** (não entra no PR).

## Adições F5 (UI segura — spec BLOCO 3)

- `POST /api/v1/auth/change-password` — senha atual + TOTP; bcrypt 12; rate limit; `[AUTH][PASSWORD-AUDIT]` sem segredos
- Proxy `POST /api/admin/auth/change-password` — e-mail **só** do cookie JWT (anti-IDOR)
- `/admin/security` — UI troca de senha
- Link “Esqueci a senha” no login admin → `/recuperar-senha?from=/admin/login` (reusa forgot/reset existentes)

## Base

- Branch: `feat/f5-mfa-consolidacao`
- Tip `origin/main` no GO: `0c3eca07` (ancestral de `904bc2bb` ✓)

## Validação

| Check | GO | Resultado | Notas |
|-------|-----|-----------|-------|
| `backend` `tsc --noEmit` | 0 | **4 erros** | Preexistentes (`nodemailer` types / `@sendgrid/mail` / `twilio`) — **zero** em arquivos F5/auth |
| jest backend (excl. integration) | 575 + net-new | **573 PASS** · 2 suites FAIL | Suites `roteiro-entrega` / `aviso-expiracao` falham por `@sendgrid/mail` ausente no host — fora do escopo F5 |
| net-new F5 backend | — | **+4** | `change-password-f5.test.ts` |
| site-publico pattern | 58 | **60 PASS** | 58 baseline + **+2** `admin-change-password-f5` |
| build `apps/site-publico` | PASS | **PASS** | |
| lockfile | — | **inalterado** | Docker Fase 5 N/A |

### Comandos

```bash
cd packages/shared && npm run build
cd backend && npx tsc --noEmit
cd backend && npx jest --runInBand --coverage=false --testPathIgnorePatterns=integration
cd backend && npx jest --runInBand --testPathPattern change-password-f5
cd apps/site-publico && npx jest --runInBand --testPathPattern 'bookings-pr03-idor|checkin-pr03b|webhooks-pr02b|webhooks-pr02c|image-error-telemetry|admin-login|admin-change-password-f5'
npm run build --workspace=apps/site-publico
```

## Logs

- `tsc-backend.log`
- `jest-backend-tail.log`
- `jest-site-publico-tail.log`
- `build-site-publico-tail.log`

## Segurança / LGPD

- Zero senha/TOTP/token em código, evidence ou logs de auditoria
- E-mail no change-password admin sempre do cookie (body `email` ignorado)
- Flags `AUTH_*` continuam default **false** no compose versionado

## Rollback

- Reverter PR / flags `AUTH_MFA_ENFORCE=false` + `AUTH_LOGIN_PROTECTION_ENABLED=false` + `compose up -d`
- Remover rota change-password não afeta login MFA já consolidado

## Fora de escopo (próximas fatias)

- Bypass hardcoded turismo `AuthContext`
- Wiring `AUTH_*` no turismo / alinhamento `:5000` vs `:3005`
