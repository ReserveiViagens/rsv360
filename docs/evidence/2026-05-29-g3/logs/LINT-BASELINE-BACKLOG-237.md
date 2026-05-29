# Backlog técnico — Issue #237 (lint baseline)

## Meta
`npm run lint` com **0 errors** em `apps/site-publico` e `apps/admin`.

## Fase 1 — site-publico (prioridade)
| # | Tarefa | Regra ESLint principal | Critério done |
|---|--------|------------------------|---------------|
| 1.1 | Inventário | — | `npm run lint 2>&1 \| grep Error \| wc -l` documentado |
| 1.2 | `prefer-const` | prefer-const | 0 erros da regra |
| 1.3 | Aspas em JSX | react/no-unescaped-entities | 0 erros da regra |
| 1.4 | Hooks condicionais | react-hooks/rules-of-hooks | 0 erros (refactor, não disable) |
| 1.5 | Símbolos indefinidos | react/jsx-no-undef | 0 erros (ex.: import `Legend` recharts) |
| 1.6 | Gate local | — | `npm run lint` exit 0 |

## Fase 2 — admin
| # | Tarefa | Critério done |
|---|--------|---------------|
| 2.1 | Repetir inventário | Log de contagem por regra |
| 2.2 | Corrigir por regra (mesma ordem 1.2–1.5) | Paridade com site-publico |
| 2.3 | Gate local | `npm run lint` exit 0 em `apps/admin` |

## Fase 3 — CI (opcional)
- Falhar PR se `lint` regressar em site-publico/admin.
- Manter `ignoreDuringBuilds` até Fase 1.6 concluída (ou remover após baseline).

## Fora de escopo
- Warnings `@typescript-eslint/no-unused-vars` (tratar em PR separado).
- Refactor funcional amplo (apenas correções mínimas para lint).

## Referências
- PR #232 — exceção formal de lint legado.
- `G2-POST-MERGE-NOTE-2026-05-29.md` — 55 errors baseline site-publico.
