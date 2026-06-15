# Lint #237 — Retomada pós-T0.24

**Data:** 2026-06-02  
**Base:** `main` pós T0.24 eslint hoist  
**Referência:** [HITL-POST-FASE-E.md](./HITL-POST-FASE-E.md), [issue #237](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/237)

## Desbloqueio

Pré-requisito **T0.24** atendido — `Cannot find module 'eslint/package.json'` **eliminado**.

## Baseline mensurável (@ T0.24)

| App | exit | erros ~ | warnings ~ |
|-----|------|---------|------------|
| guest | 0 | 7 | 8 |
| admin | 0 | 1 | 7 |
| site-publico | **1** | **288** | 3247 |
| turismo | 0 | 455 | 8277 |

Artefatos: [logs/T0.24-lint-baseline.tsv](./logs/T0.24-lint-baseline.tsv)

## Veredito

**Lint #237 = RETOMADO (baseline capturado)** — redução incremental em PRs por app; **não** misturar com T0.23b ou PLANO-MESTRE impl.

**Prioridade sugerida:** site-publico (exit 1) → admin/guest (warnings) → turismo (volume legado).
