# PR-16c — CSP Report-Only (4 Next apps)

**Branch:** `security/pr-16c-csp-report-only`  
**Base:** `main @ 6dea74f4`

## Escopo

| Item | Entrega |
| --- | --- |
| Header | `Content-Security-Policy-Report-Only` + `Reporting-Endpoints` via `packages/shared/security-headers.cjs` (fonte única; 4 Next já consomem `getNextSecurityHeaders`) |
| Enforce | **Ausente** — zero `Content-Security-Policy` (sem Report-Only) nesta fatia |
| Terceiros | Turnstile · Mercado Pago SDK/mlstatic · GTM/GA · Meta · TikTok · Google Fonts |
| Coleta | `POST /api/csp-report` em site-publico (App Router) + admin/guest/turismo (Pages API); log JSON estruturado sem PII |
| Override | `CSP_REPORT_URI` (default `/api/csp-report`) |

## Comportamento

Report-Only **não bloqueia** recursos — só reporta. Impacto observável de UX = zero.

## Higiene guest (nota do Decisor)

`apps/guest/src/lib/api.ts` autentica mutações com `Authorization: Bearer portal_*` + `X-Portal-Token` (espelho localStorage), **não** com cookie session no fetch. Cookie `rsv360_guest_portal_token` permanece só para middleware de páginas (16b).

## OUT

16d enforce · branding backend CSP · Helmet · cookies/CSRF · 04b · 10c

## Validação

```bash
cd backend && npx tsc --noEmit   # EXIT 0
cd backend && npx jest src/__tests__/unit/next-security-headers.test.ts --no-coverage
# 7 passed
```
