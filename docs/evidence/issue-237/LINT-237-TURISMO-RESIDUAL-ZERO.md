# Lint #237 — Residual sweep → baseline 0

**Data:** 2026-06-21  
**Branch:** `chore/lint-turismo-residual-zero`  
**Base:** `chore/lint-turismo-api-booking-excursoes-viagens` (PR #541)

## Objetivo

Fechar gaps fora da pilha empilhada: cluster **#30** (42 warnings) e **35 arquivos residuais** (1 warning cada).

## Gates

| Gate | Resultado |
|------|-----------|
| ESLint alvos cluster #30 | **0** |
| `eslint-warnings-rank.cjs` global | **0** |
| `npm run build` | **OK** |

## Cluster #30

- `src/components/documentation/TrainingSystem.tsx`
- `src/components/marketing/LeadCapture.tsx`
- `src/components/settings/SettingsPanel.tsx`

Fix reaplicado do commit `38c18ed6b` (PR #447).

## Residual sweep (35 arquivos)

Imports mortos, `Record<string, unknown>`, `useCallback` + mount effects, estado derivado (`NotificationBell`), mock stats sem `useEffect`, `displayName` em Radix UI, etc.

## Tracking

- `lint-237-clusters.json`: clusters **#30** e **#89** → `done`
- Baseline global confirmado: **0** warnings (excl. voucher-editor + validation)
