# Lint #237 — site-publico pós-T0.24 (retomada)

**Data:** 2026-06-02  
**Branch:** `chore/lint-237-site-publico`  
**Base:** `main` pós T0.24 eslint hoist

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `app/layout.tsx` | Remove `/// <reference` (eslint triple-slash) |
| `tsconfig.json` | Inclui `types/third-party.d.ts` |

## Gates

| Gate | Antes (T0.24) | Depois |
|------|---------------|--------|
| `eslint . --quiet` | **1 error** | **0 errors** ✓ |
| exit code | **1** | **0** |

Artefatos: [logs/LINT-237-site-publico-post-fix.log](./logs/LINT-237-site-publico-post-fix.log)

## Veredito

**Lint #237 site-publico = GO** — erros ESLint zerados; warnings legados permanecem (não bloqueantes).

**Próximo:** admin/guest lint incremental; turismo volume legado.
