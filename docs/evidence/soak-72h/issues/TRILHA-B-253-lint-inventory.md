# Trilha B — Inventário lint (#253)

**Modo:** leitura local (`npm run lint`) — **sem** Docker/restart  
**Data:** 2026-05-30  
**Issue:** [#253](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/253)

## Resumo

| Workspace | Script lint | Resultado observado |
|-----------|-------------|---------------------|
| `apps/site-publico` | `next lint` | **Warnings** (unused imports Recharts, etc.) — sem FAIL bloqueante exibido no tail |
| `apps/admin` | `next lint` | **Warnings** (unused vars, `@next/next/no-img-element`) |
| `backend` | — | **Sem script `lint`** no `package.json` — adicionar ou usar ESLint raiz no escopo #253 |

Log bruto: `lint-inventory-2026-05-30.log`

## Padrões de warning (amostra)

- `@typescript-eslint/no-unused-vars` — imports/componentes não usados
- `@next/next/no-img-element` — preferir `next/image` em admin cloud modules

## Plano PR (#253)

1. PR **site-publico**: remover imports mortos (ex. `PricingRules.tsx`, `RateComparison.tsx`).
2. PR **admin**: unused imports + avaliar `<Image />` (pode ser PR separado se grande).
3. PR **backend**: definir `npm run lint` ou documentar exclusão com justificativa G2.

## Critérios de pronto (link issue #253)

- [ ] `lint-inventory-before-after.tsv` no PR
- [ ] Zero regressão API P0 8/8
- [ ] Não misturar com #255 auth na mesma PR

## Non-goals

- Refactor de features; mudança de runtime/API.
