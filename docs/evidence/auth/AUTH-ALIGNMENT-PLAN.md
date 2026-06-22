# Auth alignment plan — #56 / #31

## Escopo PACR-Ampla (read-only primeiro)

1. Mapear base URL client vs server (turismo, admin, site-publico)
2. Endpoints login/logout/refresh — comparar `authService`, API routes, cookies
3. Payload de tokens — shape esperado vs retornado
4. Implementar suíte 5 cenários (#31) antes de refactors

## Entregáveis

- [x] Matriz de divergências em `docs/evidence/auth/AUTH-ALIGNMENT-MATRIX.md`
- [x] Testes E2E ou integration para login/logout/session/expiração/RBAC — `T1.9-AUTH-V1-E2E-RESULT.md`
- [x] Register v1 backend + turismo + site-publico BFF — D2.2/D2.3/D1 (#565–#568)
- [x] D2.1 inventário legacy + smoke `test:e2e:turismo-legacy`
- [x] Docker backend rebuild — #569

- [x] Trilha **D2.4–D2.7** (forgot/reset + 2FA backend + turismo + site-publico BFF/UI)
- [x] **D2.8** e-mail reset produção (webhook + SMTP/SES) — `D2.8-BACKEND-EMAIL-RESET-RESULT.md`
- [x] **D2.9** OAuth social site-publico → v1 — `D2.9-SITE-PUBLICO-OAUTH-BFF-RESULT.md`

## Backlog auth (pós-plano)

**Decisão 2026-06-22:** trilha D2.8–D2.9 concluída.

| Item | Prioridade | Notas |
|------|------------|-------|
| Admin UI 2FA | Baixa | Spec §5 backlog |
| E2E 2FA fluxo completo | Baixa | setup→login→verify (manual hoje) |
| E2E OAuth mock | Baixa | `OAUTH_DEV_MOCK` + Playwright |

## Produção

Checklist deploy: `docs/evidence/auth/AUTH-PRODUCTION-DEPLOY.md` · template `.env.production.example`

## Fora de escopo

- D3 guest namespace (by design)
- SMS/WebAuthn 2FA (spec §8)
