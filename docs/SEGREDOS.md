# Segredos â€” mapa e runbook (RASCUNHO S0c)

> **Draft.** Promover para `docs/SEGREDOS.md` na prep tip prÃ©-rewrite.  
> **Nunca** colar valores reais neste arquivo. SÃ³ nomes, onde vivem, e rotaÃ§Ã£o.

## PrincÃ­pios

1. Segredo vive em env / secret store â€” nunca em Git tip nem histÃ³rico.
2. Docs e exemplos usam placeholders Ã³bvios (`CHANGE_ME`, `REDACTED_WHSEC`).
3. ApÃ³s exposiÃ§Ã£o no Git: **rotar no provedor** â†’ sÃ³ entÃ£o purge de histÃ³rico.
4. Rewrite (`filter-repo`) exige janela owner: **zero PRs abertos** + branch protection coordenada.

## Mapa (onde vive â€” sem valores)

| Segredo | Runtime | Store | Notas |
|---------|---------|-------|-------|
| `JWT_SECRET` / refresh | backend, Next | host `.env` / GH Secrets CI | heranÃ§a refresh documentada na 04a |
| `DATABASE_URL` / `POSTGRES_*` | postgres, backend, site-publico | compose + host `.env` | senha de teste `REDACTED_PASSWORD` = alvo purge |
| `MERCADO_PAGO_WEBHOOK_SECRET` | site-publico | host `.env` (nunca commit) | HMAC obrigatÃ³rio (02b/c); mock URL no host = risco 503 |
| `MERCADO_PAGO_ACCESS_TOKEN` | site-publico | host `.env` | conferir len; stub â†’ lookup falha |
| `METRICS_TOKEN` | `/metrics` | host `.env` | fecha SKIP 05b + 06a-â‘¤ |
| `OAUTH_*` / SSO BFF | Next apps | compose defaults sÃ³ em lab | |
| Stripe / outros `REDACTED_WHSEC_` | (legado docs) | â€” | strings mortas no tip â€” alvo S0c |
| Grafana `GF_SECURITY_ADMIN_PASSWORD` | compose | host `.env` | |
| `TWO_FA_ENCRYPTION_KEY` | backend 2FA | host `.env` | opcional; fallback `JWT_SECRET` |
| `TURNSTILE_SECRET_KEY` | login (06c) + cotação | host `.env` | fail-closed no login quando proteção ativa |

## PR-06c — MFA / lockout (sem valores)

- Runbook: [`docs/evidence/pr-06c/RUNBOOK-MFA-RESET.md`](./evidence/pr-06c/RUNBOOK-MFA-RESET.md)
- Flags (default OFF): `AUTH_LOGIN_PROTECTION_ENABLED`, `AUTH_MFA_ENFORCE`, `AUTH_MFA_ENROLLMENT_START_AT`, `AUTH_MFA_ADMIN_OPS`
- Último recurso owner: SQL em `auth_login_protection` / `user_2fa` (ver runbook) — credenciais só no secret store

## Alvos tip + histÃ³rico (S0c)

Ver sequÃªncia completa em [`PLAYBOOK-P1-GATILHOS.md`](./PLAYBOOK-P1-GATILHOS.md) (Gatilho 1).

- `REDACTED_WHSEC_*` em `.md` / componentes / evidence gitleaks
- `REDACTED_PASSWORD` em workflows e docs
- JWT hardcodado em `.ps1` / guias
- Literais no histÃ³rico (jÃ¡ limpos no WT pela 04a): `REDACTED_JWT_SECRET` Â· `REDACTED_JWT_SECRET` Â· `REDACTED_REFRESH_SECRET` Â· `REDACTED_JWT_SECRET` (+ senha Postgres prÃ©-S0)
- Docs â€œCONFIGURADOâ€ com segredos mortos

## Runbook de rotaÃ§Ã£o (alta)

1. InventÃ¡rio (`git grep` + gitleaks) â€” paths only.
2. Rotacionar no provedor (MP, DB, JWT, etc.).
3. Atualizar host `.env` / GH Secrets â€” **sem** commit.
4. Smoke: unsigned webhook â†’ 401; signed path; metrics bearer.
5. SÃ³ depois: janela `filter-repo` + force-push (ver `docs/evidence/s0c-prep/README.md`).

## VerificaÃ§Ã£o pÃ³s-rewrite

```bash
# Esperado: zero hits no histÃ³rico
git grep -I REDACTED_WHSEC_ $(git rev-list --all) || true
git grep -I REDACTED_PASSWORD $(git rev-list --all) || true
```

## Relacionados

- `docs/security/SECRETS-ROTATION-PLAN.md`
- `docs/security/SECRETS-ROTATION-APPROVAL.md`
- Notion PR-00c / S0c

