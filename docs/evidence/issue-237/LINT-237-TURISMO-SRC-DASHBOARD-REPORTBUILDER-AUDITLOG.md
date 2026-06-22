# Lint #237 — turismo src/dashboard + ReportBuilder + AuditLog

**Cluster:** **#44** | **Branch:** `chore/lint-turismo-src-dashboard-reportbuilder-auditlog`

| Métrica | Pós-#43 | Esta PR |
|---------|---------|---------|
| warnings globais | **957** | **927** (**−30**) |
| 3 arquivos alvo | 30 | **0** |

**Correções principais:**
- `src/pages/dashboard.tsx`: imports Lucide enxutos (espelho pages/dashboard)
- `ReportBuilder.tsx`: `DEFAULT_REPORT_CONFIG` no módulo; tipos concretos; imports enxutos
- `AuditLog.tsx`: `MOCK_AUDIT_ENTRIES` no módulo; `useMemo` filtros; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #45 — ChatAnalytics + ApiConnector + NotificationSettings (−30)
