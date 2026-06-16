# Lint #237 — turismo DataProtectionCenter + pages/marketing + src/pages/reviews

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-dataprotection-marketing-reviews`

## Cluster selecionado

Ranking pós-#399 (excl. voucher-editor + validation): **4653** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/security/DataProtectionCenter.tsx` | 50 |
| `pages/marketing.tsx` | 49 |
| `src/pages/reviews.tsx` | 49 |
| **Total cluster** | **148** |

## Baseline → after

| Métrica | Pós-#399 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **4653** | **4505** (**−148**) |
| 3 arquivos alvo | 148 | **0** (**−148**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `DataProtectionCenter.tsx` | 50 | 0 |
| `pages/marketing.tsx` | 49 | 0 |
| `src/pages/reviews.tsx` | 49 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −114 (67→25, 45→16, 57→14) |
| DataProtectionCenter: `Textarea`/recharts mortos, interfaces mortas, `selectedAsset` morto; `Line` mantido (uso em `AreaChart`) | residual security |
| pages/marketing: espelha `src/pages/marketing` (#399) — hooks mortos, state só-setter, handlers mortos | residual pages |
| src/pages/reviews: espelha `pages/reviews` (#397) — `useAuth`/`useRouter`/`isLoading`, params prefixados | residual src/pages |

## Scripts adicionados

- `scripts/fix-dataprotection-marketing-reviews-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/components/backup/BackupAnalytics.tsx` — 49
2. `pages/reservations.tsx` + `src/pages/reservations.tsx` — ~47 cada
3. `src/components/security/SecurityCenter.tsx` — 46

## Veredito

**GO condicional** — cluster DataProtectionCenter/pages/marketing/src/pages/reviews saneado; débito global ~4505 warnings.
