# Lint #237 — turismo CustomerManagement + FinalDeploySystem + AccountingIntegration

**Cluster:** **#25** | **Branch:** `chore/lint-turismo-customer-deploy-accounting`

| Métrica | Pós-#436 | Esta PR |
|---------|----------|---------|
| warnings globais | **1670** | **1625** (**−45**) |
| 3 arquivos alvo | 45 | **0** |

**Correções principais:**
- `CustomerManagement.tsx`: imports enxutos; `DollarSign` adicionado; removido state `showFilters`; tipagem `sortBy`; eslint-disable em avatar mock
- `FinalDeploySystem.tsx`: imports enxutos; `nextDeployIdRef` no lugar de `Date.now()`; removidos `setEnvironments`/`onDeployFailed` não usados
- `AccountingIntegration.tsx`: imports enxutos; `Pie` do recharts; `AccountingSystemForm` extraído (static-components); removido state `selectedSystem`; `_systemId` em `handleConnect`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #26 — documents + groups + TestingPage (−42)
