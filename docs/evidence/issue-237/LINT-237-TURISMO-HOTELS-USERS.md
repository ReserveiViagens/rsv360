# Lint #237 — turismo hotels×2 + users

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-hotels-users`

## Cluster selecionado

Ranking pós-#408 (excl. voucher-editor + validation): **3504** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/hotels.tsx` | 32 |
| `src/pages/hotels.tsx` | 32 |
| `src/pages/users.tsx` | 32 |
| **Total cluster** | **96** |

## Baseline → after

| Métrica | Pós-#408 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3504** | **3408** (**−96**) |
| 3 arquivos alvo | 96 | **0** (**−96**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/hotels.tsx` | 32 | 0 |
| `src/pages/hotels.tsx` | 32 | 0 |
| `users.tsx` | 32 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −89 (41→11 hotels×2, 34→5 users) |
| hotels×2: `MOCK_HOTELS` hoist, `getStatisticLabel` morto | residual pages |
| users: mocks hoist, state inicial direto, `loadData`/loading mortos | residual pages |

## Scripts adicionados

- `scripts/fix-hotels-users-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3408** global |

## Próximo cluster sugerido

1. `pages/pagamentos.tsx` — 32
2. `pages/cotacoes/passeios.tsx` — 30
3. `pages/hotels-debug.tsx` — 30

## Veredito

**GO condicional** — cluster hotels/users saneado; débito global ~3408 warnings.
