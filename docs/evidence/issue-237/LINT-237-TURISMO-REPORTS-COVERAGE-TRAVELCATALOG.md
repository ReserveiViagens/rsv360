# Lint #237 — turismo ReportBuilder + CodeCoverage + TravelCatalog

**Cluster:** **#46** | **Branch:** `chore/lint-turismo-reports-coverage-travelcatalog`

| Métrica | Pós-#45 | Esta PR |
|---------|---------|---------|
| warnings globais | **897** | **867** (**−30**) |
| 3 arquivos alvo | 30 | **0** |

**Correções principais:**
- `reports/ReportBuilder.tsx`: imports enxutos; `Record<string, unknown>`; tipos em tabs/schedule
- `CodeCoverage.tsx`: `MOCK_COVERAGE_DATA` + `buildCoverageSummary` no módulo
- `TravelCatalog.tsx`: imports enxutos; `sortBy` tipado; eslint-disable img

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #47 — cotacoes/index + test-page + insurance (−27)
