# Lint #237 — turismo ProductionMonitoring + dashboard-personalizado + analytics-avancados

**Cluster:** **#13** | **Branch:** `chore/lint-turismo-production-dashboard-analytics`

| Métrica | Pós-#424 | Esta PR |
|---------|----------|---------|
| warnings globais | **2284** | **2229** (**−55**) |
| 3 arquivos alvo | 55 | **0** |

**Correções principais:**
- `ProductionMonitoring.tsx`: imports Lucide enxutos; removido `AlertDescription`; state morto simplificado; `Alert['severity']` no Select
- `dashboard-personalizado.tsx`: `loadUserPreferences`/`loadDashboardData` hoisted; tipos `DashboardData`/`Record<string, unknown>` nos widgets
- `analytics-avancados.tsx`: imports recharts/lucide enxutos; `AnalyticsData`/`AnalyticsPrediction`; funções hoisted; map sem `any`

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #14 — animations-demo + backend-integration-test + configuracoes-sistema (−54)
