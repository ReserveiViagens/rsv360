# Fase 0 — PR-04b cut-over refresh HttpOnly (PARAR)

**Base:** `main @ 20c680209753bc90227ab87666fad82473e2d8b3`  
**Modo:** read-only · **zero** runtime nesta fatia  
**Veredito:** **PARAR** — não emitir GO de implementação até blockers abaixo.

## Inventário

| Superfície | Estado |
|------------|--------|
| site-publico BFF cookie `rsv360_refresh_token` | Entregue em 10c-pré-a; LS limpo no login path |
| Flag `AUTH_REFRESH_COOKIE_REQUIRED` | Default **OFF** (`resolve-refresh-token.js` + prometheus) |
| turismo `AuthContext` / `api.ts` | Ainda lê/grava `localStorage.refresh_token` (dívida explícita T1) |
| admin / guest | 10c-pré-b path; Domain multi-subdomínio pendente |
| Telemetria cut-over | `docs/evidence/pr-10c-telemetry/` — prep only |

## Blockers (não negociáveis)

1. **10c-infra-c Blocked (VPS)** — `AUTH_REFRESH_COOKIE_DOMAIN` antes de cut-over multi-subdomínio.
2. Turismo ainda depende de refresh em `localStorage` — cut-over sem migração = logout em massa.
3. Flag OFF em produção — ligar exige métricas `auth_refresh_body_deprecated` verdes + janela de observação.

## Próximo GO (quando desbloquear)

`GO 04b @ main <tip>` só após: infra-c Done **ou** escopo 04b limitado a single-host lab com Domain explícito aprovado pelo owner.
