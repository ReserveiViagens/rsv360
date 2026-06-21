# Lint #237 — turismo TaxManagement + PaymentModal + CustomReportBuilder

**Cluster:** **#34** | **Branch:** `chore/lint-turismo-tax-payment-customreport`

| Métrica | Pós-#33 | Esta PR |
|---------|---------|---------|
| warnings globais | **1297** | **1258** (**−39**) |
| 3 arquivos alvo | 39 | **0** |

**Correções principais:**
- `TaxManagement.tsx`: imports enxutos; `ObligationForm` extraído; `Pie` importado; `isDueWithinSevenDays` helper
- `PaymentModal.tsx`: imports enxutos; `_isProcessing`; tipagem em `handleInputChange`
- `CustomReportBuilder.tsx`: templates/mock fora do componente; `useRef` IDs; `setTimeout(0)`; tipos `GeneratedReport`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #35 — authService + visas + workflows (−37)
