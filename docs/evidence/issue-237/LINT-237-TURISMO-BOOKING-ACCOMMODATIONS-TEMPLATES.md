# Lint #237 — turismo bookingService + accommodations/analytics + cotacoes/templates

**Cluster:** **#42** | **Branch:** `chore/lint-turismo-booking-accommodations-templates`

| Métrica | Pós-#41 | Esta PR |
|---------|---------|---------|
| warnings globais | **1018** | **987** (**−31**) |
| 3 arquivos alvo | 31 | **0** |

**Correções principais:**
- `bookingService.ts`: remove `ApiResponse`; `guest_details` tipado; `catch (error: unknown)`
- `accommodations/analytics.tsx`: interfaces mínimas; `useCallback` load; imports enxutos; `AnalyticsPeriod`
- `cotacoes/templates/page.tsx`: `useMemo` filtros; `useCallback` load; `WindowWithTestModule`; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #44 — src/dashboard + ReportBuilder + AuditLog (−30)
