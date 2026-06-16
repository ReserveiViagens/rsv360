# Lint #237 — turismo dashboard-master + hotels-funcional + FinancialAnalytics

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-dashboard-master-hotels-financial`  
**Cluster:** **#2** do plano `lint-237-clusters.json`

## Cluster selecionado

Ranking pós-#413 (excl. voucher-editor + validation): **3055** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/dashboard-master.tsx` | 28 |
| `pages/hotels-funcional.tsx` | 28 |
| `src/components/financial/FinancialAnalytics.tsx` | 28 |
| **Total cluster** | **84** |

## Baseline → after

| Métrica | Pós-#413 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3055** | **2971** (**−84**) |
| 3 arquivos alvo | 84 | **0** (**−84**) |

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| ESLint (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **2971** global |

## Próximo cluster (#3)

1. `src/components/layout/Sidebar.tsx` — 28
2. `pages/customers-rsv.tsx` — 27
3. `src/pages/NotificationsPage.tsx` — 27

## Veredito

**GO condicional** — cluster #2 saneado; débito global ~2971 warnings.
