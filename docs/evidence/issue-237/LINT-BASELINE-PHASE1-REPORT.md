# Issue #237 — Fase 1 site-publico (2026-05-29)

## Branch
`codex/issue-237-lint-baseline-site-publico`

## Inventário inicial (pré-correção)
| Regra | Erros |
|-------|------:|
| react/no-unescaped-entities | 40 |
| prefer-const | 9 |
| react-hooks/rules-of-hooks | 2 |
| react/jsx-no-comment-textnodes | 2 |
| react/jsx-no-undef | 1 |
| @typescript-eslint/ban-types (Function) | 1 |
| **Total** | **55** |

Artefatos: `lint-inventory-site-publico.tsv`, `lint-inventory-summary.txt`

## Lotes aplicados
1. `next lint --fix` — 8× prefer-const (libs)
2. prefer-const manual — `app/api/reports/export/route.ts`
3. react-hooks — `AuctionMap.tsx` (hooks antes de early return)
4. jsx-no-undef — import `Legend` em `QualityDashboard.tsx`
5. jsx-no-comment-textnodes — `n8n-integration.tsx`
6. ban-types — `websocket-client.ts` (`Function` → callback tipado)
7. no-unescaped-entities — 17 arquivos (aspas → `&quot;` / `&amp;`)

## Resultado final Fase 1
```bash
cd apps/site-publico && npm run lint
# exit 0 — 0 errors (warnings legados permanecem)
```

## Próximo
Fase 2: repetir inventário + correção em `apps/admin`.
