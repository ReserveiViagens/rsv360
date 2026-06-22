# Lint #237 — turismo pagamentos + passeios + hotels-debug

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-pagamentos-passeios-hotels-debug`

## Cluster selecionado

Ranking pós-#409 (excl. voucher-editor + validation): **3408** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/pagamentos.tsx` | 32 |
| `pages/cotacoes/passeios.tsx` | 30 |
| `pages/hotels-debug.tsx` | 30 |
| **Total cluster** | **92** |

## Baseline → after

| Métrica | Pós-#409 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3408** | **3316** (**−92**) |
| 3 arquivos alvo | 92 | **0** (**−92**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/pagamentos.tsx` | 32 | 0 |
| `pages/cotacoes/passeios.tsx` | 30 | 0 |
| `pages/hotels-debug.tsx` | 30 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −48 (37→21 pagamentos, 22→12 passeios, 32→10 hotels-debug) |
| pagamentos: espelha fix src/pages — MOCK_PAYMENTS, export, modais mortos | residual pages |
| passeios: types, effects split, TourSelection, ImageIcon, entities | residual cotacoes |
| hotels-debug: MOCK_HOTELS hoist, loading morto, unknown errors | residual pages |

## Scripts adicionados

- `scripts/fix-pagamentos-passeios-hotels-debug-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3316** global |

## Próximo cluster sugerido

1. `src/hooks/useApi.ts` — 30
2. `pages/conteudo.tsx` — 29
3. `src/pages/conteudo.tsx` — 29

## Veredito

**GO condicional** — cluster pagamentos/passeios/hotels-debug saneado; débito global ~3316 warnings.
