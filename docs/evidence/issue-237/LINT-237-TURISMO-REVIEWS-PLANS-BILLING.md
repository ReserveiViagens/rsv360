# Lint #237 — turismo reviews + plans + billing

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-reviews-plans-billing`

## Cluster selecionado

Ranking pós-#392 merge (excl. voucher-editor + validation): **6169** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/reviews.tsx` | 80 |
| `pages/plans.tsx` | 77 |
| `pages/billing.tsx` | 74 |
| `src/pages/billing.tsx` | 74 |
| **Total cluster** | **305** |

Breakdown: **305×** `@typescript-eslint/no-unused-vars`.

## Baseline → after

| Métrica | Pós-#392 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **6169** | **5864** (**−305**) |
| 4 arquivos alvo | 305 | **0** (**−305**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/reviews.tsx` | 80 | 0 |
| `pages/plans.tsx` | 77 | 0 |
| `pages/billing.tsx` | 74 | 0 |
| `src/pages/billing.tsx` | 74 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (`trim-lucide-imports.cjs`) | −292 (88→14, 84→10, 83→11×2) |
| Remover `useAuth`/`useRouter`/`isLoading` mortos (reviews) | −4 |
| Unificar `showCreateModal` → `showModal`; remover handlers mortos | plans + billing×2 |
| Remover `priorityColors` morto (plans) | −1 |
| Mock state read-only (`plans`, `billings`) | −3 |
| Prefixar `_cardId` / `_action` em handlers (reviews) | −2 |

## Scripts adicionados

- `scripts/fix-reviews-plans-billing-residual.cjs` — residual hooks/handlers após trim Lucide

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (4 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes (single-file):

1. `pages/upgrades.tsx` — 90
2. `pages/maps.tsx` — 83
3. `src/components/training/LearningPaths.tsx` — 81

Ou agrupar **`pages/videos.tsx` + `src/pages/videos.tsx`** se duplicata existir (~142).

## Veredito

**GO condicional** — cluster reviews/plans/billing saneado; débito global ~5864 warnings.
