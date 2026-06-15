# Lint #237 — turismo voucher-editor + validation warnings trim

**Data:** 2026-06-02  
**Branch:** `chore/lint-voucher-validation-warnings`

## Baseline → after (4 arquivos alvo)

| Arquivo | Antes | Depois | Δ |
|---------|-------|--------|---|
| `pages/voucher-editor.tsx` | 218 | 68 | **−150** |
| `src/pages/voucher-editor.tsx` | 159 | 10 | **−149** |
| `pages/validation.tsx` | 112 | 0 | **−112** |
| `src/pages/validation.tsx` | 92 | 0 | **−92** |
| **Subtotal módulos** | **581** | **78** | **−503** |

Estimativa repo turismo: **7877 → ~7374** warnings (−503).

## Ações

| Ação | Impacto |
|------|---------|
| `scripts/trim-lucide-imports.cjs` — trim imports Lucide | −471 |
| Remover maps/cores mortos + `useEffect` em `validation.tsx` | −8 |
| Corrigir `Date.now()` em handler (purity) | −4 |
| Remover state/handlers mortos parciais em `voucher-editor` | −20 |

## Gates

| Gate | Resultado |
|------|-----------|
| `type-check` turismo | **PASS** |
| `build` turismo | **PASS** |
| `eslint . --quiet` | **0 erros** |

## Veredito

**GO condicional** — módulos `voucher-editor` e `validation` saneados; ~7374 warnings restantes no turismo.
