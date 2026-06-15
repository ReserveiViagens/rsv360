# Lint #237 — turismo redução warnings (incremental)

**Data:** 2026-06-02  
**Branch:** `chore/t1.6-carimbo-warnings`

## Baseline → after

| Métrica | T0.24 / pós-#379 | Esta PR |
|---------|------------------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings | **8272** | **7969** (**−303**) |

## Ações

| Ação | Impacto |
|------|---------|
| `eslint . --fix` | −13 |
| Trim imports `ModernSidebar.tsx` | −290 |
| `no-unused-vars` ignore `_` prefix | preventivo |

Top rules restantes: `@typescript-eslint/no-unused-vars` (~6300), `no-explicit-any` (~850).

Artefatos: [logs/T0.23h-warnings-baseline.json](./logs/T0.23h-warnings-baseline.json), [logs/T0.23h-warnings-after.log](./logs/T0.23h-warnings-after.log)

## Veredito

**GO condicional** — redução incremental −303; débito ~8k warnings permanece para PRs por módulo.
