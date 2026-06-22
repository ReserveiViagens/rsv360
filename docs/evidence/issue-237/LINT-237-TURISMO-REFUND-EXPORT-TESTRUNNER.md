# Lint #237 — turismo RefundManager + DataExport + TestRunner

**Cluster:** **#50** | **Branch:** `chore/lint-turismo-refund-export-testrunner`

| Métrica | Pós-#49 | Esta PR |
|---------|---------|---------|
| warnings globais | **786** | **759** (**−27**) |
| 3 arquivos alvo | 27 | **0** |

**Correções principais:**
- `RefundManager.tsx`: `RefundFilters` tipado; imports enxutos
- `DataExport.tsx`: `ExportTemplate`; `Record<string, ...>`; imports enxutos
- `TestRunner.tsx`: `MOCK_TEST_SUITES` module-level; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #51 — analytics-financeiro + recommendations + sales-dashboard (−24)
