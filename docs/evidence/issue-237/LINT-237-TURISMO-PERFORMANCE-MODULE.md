# Lint #237 — turismo performance module warnings trim

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-next-module`

## Cluster selecionado

Ranking pós-#384 (excl. voucher-editor + validation): **6709** warnings globais.

| Diretório | Warnings |
|-----------|----------|
| `src/components` | 2573 |
| `src/pages` | 1987 |
| `pages` | 1944 |

**Próximo cluster de maior volume por pasta:** `src/components/performance/` — **286 warnings** (5 arquivos).

Breakdown inicial por regra: **281×** `@typescript-eslint/no-unused-vars`, **4×** `no-explicit-any`, **1×** `react/jsx-no-undef`.

## Baseline → after

| Métrica | Pós-#384 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **6709** | **6423** (**−286**) |
| `src/components/performance/*` | 286 | **0** (**−286**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `CacheManager.tsx` | 54 | 0 |
| `DatabaseOptimizer.tsx` | 60 | 0 |
| `LoadBalancer.tsx` | 61 | 0 |
| `MetricsDashboard.tsx` | 58 | 0 |
| `PerformanceCenter.tsx` | 53 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (script `trim-lucide-imports.cjs`) | −224 |
| Trim imports Recharts não usados | −~35 |
| Remover state/handlers mortos (`selected*`, `formatBytes`, `getWidgetTypeIcon`, etc.) | −~20 |
| Remover interface morta `CacheAnalytics` | −1 |
| Tipar `Record<string, any>` → `unknown` | −4 |
| Import `History` (Lucide) em LoadBalancer | corrige `jsx-no-undef` |

## Scripts adicionados

- `scripts/eslint-warnings-rank.cjs` — ranking por arquivo (excl. voucher/validation)
- `scripts/fix-performance-residual-warnings.cjs` — residual recharts/state (complementar ao trim Lucide)

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint src/components/performance` | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes (single-file, não módulo):

1. `pages/upgrades.tsx` — 90
2. `pages/maps.tsx` — 83
3. `src/components/training/LearningPaths.tsx` — 81

Ou agrupar **`src/components/training/`** (~205 warnings: LearningPaths + SkillsAssessment + TrainingCenter).

## Veredito

**GO condicional** — módulo `performance/` saneado; débito global ~6423 warnings.
