# Lint #237 — turismo upgrades + maps + LearningPaths

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-upgrades-maps-learningpaths`

## Cluster selecionado

Ranking pós-#391 (excl. voucher-editor + validation): **6423** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/upgrades.tsx` | 90 |
| `pages/maps.tsx` | 83 |
| `src/components/training/LearningPaths.tsx` | 81 |
| **Total cluster** | **254** |

Breakdown predominante: **253×** `@typescript-eslint/no-unused-vars`, **1×** `no-explicit-any`.

## Baseline → after

| Métrica | Pós-#391 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **6423** | **6169** (**−254**) |
| 3 arquivos alvo | 254 | **0** (**−254**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/upgrades.tsx` | 90 | 0 |
| `pages/maps.tsx` | 83 | 0 |
| `LearningPaths.tsx` | 81 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (`trim-lucide-imports.cjs`) | −236 (99→11, 98→18, 100→32) |
| Unificar `showCreateModal` → `showModal`; remover handler morto | upgrades residual |
| Mock state read-only (`locations`, `routes`, `upgrades`); geolocation só setter | maps/upgrades residual |
| Remover `Textarea`, recharts não usados, `selectedPath` | LearningPaths residual |
| `correctAnswer: any` → `unknown` | −1 |

## Scripts adicionados

- `scripts/fix-upgrades-maps-learningpaths-residual.cjs` — residual hooks/state/recharts após trim Lucide

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes (single-file):

1. `pages/reviews.tsx` — 80
2. `pages/plans.tsx` — 77
3. `pages/billing.tsx` — 74

Ou agrupar **`pages/billing.tsx` + `src/pages/billing.tsx`** (~148).

## Veredito

**GO condicional** — cluster upgrades/maps/LearningPaths saneado; débito global ~6169 warnings.
