# PR-06c — Turnstile pós-3-falhas + MFA TOTP (evidence)

## Vinculantes

| # | Item | Status |
|---|------|--------|
| ⓐ | Turnstile fail-closed onde ativo (secret ausente → nega) | OK |
| ⓑ | Enrollment 72h via `AUTH_MFA_ENROLLMENT_START_AT` (não relógio de deploy) | OK |
| ⓒ | Reuso `/api/v1/auth/2fa/*` (otplib; sem lib nova) | OK |
| ⓓ | Três superfícies: staff DB · `POST /api/admin/auth/login` · `AUTH_PILOT_ENABLED` | OK |

## Decisões ①/②

| Parâmetro | Valor |
|-----------|-------|
| Contagem | Por conta; TTL 24h; reset pós-login ok |
| Turnstile | 3ª falha consecutiva |
| Lockout | 5ª → 15 → 30 → 60 min (teto) |
| Enrollment | 72h a partir de `AUTH_MFA_ENROLLMENT_START_AT` |
| Enforcement default | `AUTH_*` = **false** (ligar = ato do owner) |

## Matriz superfície × regra

| Superfície | Turnstile pós-3 | Lockout 15/30/60 | MFA admin\|manager | Enrollment |
|------------|-----------------|------------------|--------------------|------------|
| Staff DB `POST /api/v1/auth/login` | sim (flag) | sim (flag) | sim (flag) | sim |
| Admin Next `POST /api/admin/auth/login` | sim (flag) | sim (flag) | proxy v1 quando enforce | via v1 |
| Pilot `AUTH_PILOT_ENABLED` | sim (flag) | sim (flag) | deny sem DB / exige staff | N/A sem DB |

## Diff (arquivos principais)

- `backend/src/api/v1/auth/login-protection.service.js` (novo)
- `backend/src/api/v1/auth/mfa-policy.js` / `mfa-audit.js` (novos)
- `backend/src/api/v1/auth/two-factor.service.js` (anti-replay + audit + admin reset)
- `backend/src/api/v1/auth/login.service.js` / `routes.js`
- `backend/drizzle/0040_pr06c_login_protection_mfa.sql`
- `server/lib/turnstile.ts` (opção failClosed)
- `apps/site-publico/lib/admin-login-protection.ts` + login route
- `.env.example` / `apps/site-publico/.env.example`
- `docs/evidence/pr-06c/RUNBOOK-MFA-RESET.md` · `docs/SEGREDOS.md`

## Auditoria (8 eventos)

Emitidos via `console.info('[AUTH][MFA-AUDIT] '+JSON)` — **nunca** loga TOTP/secret/recovery:

`MFAEnrollmentStarted` · `MFAEnrollmentCompleted` · `MFAVerificationFailed` · `MFAVerificationSucceeded` · `RecoveryCodeUsed` · `RecoveryCodeRegenerated` · `MFAResetRequested` · `MFAResetCompleted`

## Capturas enrollment

QR + recovery codes: valores mascarados em ambiente de canário do owner (não versionar plaintext). Suite unitária cobre geração hashed + anti-replay.

## Commands

```bash
cd backend && npx tsc --noEmit
cd backend && npm test -- --coverage=false --testPathIgnorePatterns=integration --testPathPattern 'login-protection-pr06c|mfa-policy-pr06c|mfa-audit-pr06c|two-factor-pr06c|rate-limit-pr06a|turnstile'
cd apps/site-publico && npx jest --runInBand --testPathPattern 'admin-login-pr06a|admin-login-pr06c'
npm run build --workspace apps/site-publico
```

## Reconciliacao de contagem

| Check | Entrada (GO) | Saida | Delta |
|-------|--------------|-------|-------|
| backend `tsc --noEmit` | 0 | **0** | — |
| jest backend (excl. integration) | 563 | **575** | **+12** net-new 06c |
| site-publico pattern (idor/webhooks/telemetry/admin-login*) | GO citou 58; host sem 06c = **54** | **58** | **+4** (`admin-login-pr06c`) |
| build `apps/site-publico` | PASS | **PASS** | — |
| lockfile | — | **inalterado** | Docker Fase 5 N/A |
| audit-gate | BLOCK vazio · allowlist 3 | allowlist **3** inalterada; BLOCK **3** preexistentes no host (`concurrently`, `js-yaml`, `shell-quote`) — **nao introduzidos por 06c** (lockfile intacto). Documentar drift vs H6d. | |

### Net-new backend (12)

`login-protection-pr06c` 6 · `mfa-policy-pr06c` 3 · `mfa-audit-pr06c` 1 · `two-factor-pr06c` 1 · `turnstile` failClosed +1

### Net-new site-publico (4)

`admin-login-pr06c` (flags off · Turnstile@3 · lockout@5 · safeEqual regressao)

## Ops

Ativação **não** é efeito do merge. Ver runbook.
