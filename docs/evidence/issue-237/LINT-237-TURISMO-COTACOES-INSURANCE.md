# Lint #237 — turismo cotacoes + insurance

**Cluster:** **#47** | **Branch:** `chore/lint-turismo-cotacoes-insurance`

| Métrica | Pós-#46 | Esta PR |
|---------|---------|---------|
| warnings globais | **867** | **840** (**−27**) |
| 3 arquivos alvo | 27 | **0** |

**Correções principais:**
- `cotacoes/index.tsx`: `useCallback` load; `BudgetWithExpiry`; imports enxutos
- `cotacoes/test-page.tsx`: `WindowWithTestModule`; `useCallback` tests; entities escapadas
- `insurance.tsx`: `useCallback` load; `InsuranceType`; `LucideIcon` badges

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #48 — notifications + DevOpsPage + demo-layout (−27)
