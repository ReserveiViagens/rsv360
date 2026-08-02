# PR-10b — step-up new device (1B + 2B-lite)

**Branch:** `security/pr-10b-step-up-new-device`  
**Base:** `main @ bc98aa39`  
**Decisão:** 1B + 2B-lite · `AUTH_STEP_UP_ENABLED` default **OFF**

## Fase 0

| Item | Achado |
| --- | --- |
| Fingerprint | `ip_address` + `user_agent` em `refresh_tokens` |
| `device_info` | Não usado (quase sempre null) |
| Geo | OUT |
| MFA 06c | Reuso `createLoginChallenge` — sem segundo 2FA |

## Semântica

- **Conhecido (1B):** IP **ou** UA bate **qualquer** family ativa (não-revogada, não-expirada). Zero ativas → conhecido.
- **Login + flag ON + MFA + desconhecido:** `requires_2fa` (06c).
- **Login + flag ON + MFA + conhecido:** tokens sem challenge (step-up mode).
- **Login + flag ON + sem MFA + desconhecido:** `[AUTH][STEP_UP_SKIP] reason=no_mfa`.
- **Refresh + flag ON + IP e UA ambos desconhecidos:** `null`/401 — **sem UPDATE** em `refresh_tokens`.
- **Refresh + só IP novo (UA conhecido):** rotaciona normal.
- **Flag OFF:** comportamento pré-10b byte a byte (MFA sempre se enrolado).

## Diff

| Arquivo | Papel |
| --- | --- |
| `step-up.service.js` | Flag, fingerprints, known OR, alien AND, logs |
| `refresh-token.service.js` | Deny antes de rotação |
| `login.service.js` | Step-up / skip / known bypass challenge |
| `.env.example` | `AUTH_STEP_UP_ENABLED=false` |
| `auth-v1-step-up.integration.test.ts` | Test plan mínimo |
| `docs/evidence/pr-10b/README.md` | esta evidence |

## Ligar (owner)

```env
AUTH_STEP_UP_ENABLED=true
```

Nunca default ON no merge.

## OUT

Geo · DPoP · device_info enrich · 04b · logout-all · lifetimes · challenge TOTP no body do refresh
