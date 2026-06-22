# Lint #237 — turismo financeiro + pages/vouchers

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-financeiro-vouchers`

## Cluster selecionado

Ranking pós-#402 (excl. voucher-editor + validation): **4180** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/financeiro.tsx` | 41 |
| `src/pages/financeiro.tsx` | 41 |
| `pages/vouchers.tsx` | 41 |
| **Total cluster** | **123** |

## Baseline → after

| Métrica | Pós-#402 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **4180** | **4057** (**−123**) |
| 3 arquivos alvo | 123 | **0** (**−123**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/financeiro.tsx` | 41 | 0 |
| `src/pages/financeiro.tsx` | 41 | 0 |
| `pages/vouchers.tsx` | 41 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −78 (financeiro×2: 30→9, vouchers: 63→27) |
| financeiro×2: `ProtectedRoute`/interface mortos, state só-setter, mocks module-level, `PERIOD_CUTOFFS` estáticos | residual pages |
| vouchers: `loadData` reordenado, params tipado, entidades HTML, `CreditCard`/api restaurados pós-trim, QR img eslint-disable | residual pages |

## Scripts adicionados

- `scripts/fix-financeiro-vouchers-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/components/security/AccessControlManager.tsx` — 41
2. `src/pages/DocumentationPage.tsx` — 40
3. `src/components/security/ComplianceManager.tsx` — 40

## Veredito

**GO condicional** — cluster financeiro/vouchers saneado; débito global ~4057 warnings.
