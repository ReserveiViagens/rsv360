# Lint #237 — turismo ExecutiveDashboard + UserManagement + DocumentationSystem

**Cluster:** **#36** | **Branch:** `chore/lint-turismo-executive-usermgmt-docsystem`

| Métrica | Pós-#35 | Esta PR |
|---------|---------|---------|
| warnings globais | **1221** | **1185** (**−36**) |
| 3 arquivos alvo | 36 | **0** |

**Correções principais:**
- `ExecutiveDashboard.tsx`: removidos Tabs/lucide/recharts mortos; interface `ChartData` com `any` eliminada
- `UserManagement.tsx`: `MOCK_USERS` no módulo; `useMemo` para filtros; eslint img mock avatar
- `DocumentationSystem.tsx`: `MOCK_*` no módulo; props/tabs mortos removidos; sem `setState` em effect

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #37 — FAQSystem + FinancialDashboard + dashboard-reservei-viagens (−35)
