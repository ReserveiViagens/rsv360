# Lint #237 — turismo módulo `pages/cotacoes`

**Data:** 2026-06-02  
**Branch:** `chore/t0.23f-turismo-lint-login`

## Escopo

Lint scoped: `npx eslint pages/cotacoes`

| Gate | Resultado |
|------|-----------|
| `--quiet` | **exit 0** (0 erros) |
| warnings módulo | **158** |

Correções TS7053/TS2341/TS7006 no mesmo PR reduzem warnings implícitos de parse.

## Veredito

**GO condicional** — módulo cotacoes isolado sem erros ESLint; warnings cosméticos (react/no-unescaped-entities, etc.).
