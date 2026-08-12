# Fase 0 — PR-16d CSP enforce (PARAR)

**Base:** `main @ 20c680209753bc90227ab87666fad82473e2d8b3`  
**Modo:** read-only · **zero** runtime nesta fatia  
**Veredito:** **PARAR** — sem baseline de telemetria agregável para enforce.

## Inventário (pós-16c)

| Item | Estado |
|------|--------|
| Header | `Content-Security-Policy-Report-Only` via `packages/shared/security-headers.cjs` |
| Collectors | `POST /api/csp-report` nos 4 Next apps |
| Persistência | **stdout** `console.info` JSON `csp_report` — sem store/dashboard |
| Evidence agregada | **Ausente** (`docs/evidence/pr-16d/` não existia) |
| Enforce header | **Ausente** (intencional em 16c) |

## Blockers

1. Sem janela staging/prod de violações (counts por diretiva / app).
2. Policy ainda permissiva (`unsafe-inline` etc.) — enforce prematuro quebra UX.
3. Sem pipeline de métricas (Prometheus/log drain) documentado para “zero violações reais”.

## Pré-requisito para GO 16d

Owner coleta ≥ N dias de reports (ou export sanitizado) → evidence `pr-16d-telemetry/` → só então `GO 16d @ main <tip>` para trocar Report-Only → enforce com allowlist afinada.
