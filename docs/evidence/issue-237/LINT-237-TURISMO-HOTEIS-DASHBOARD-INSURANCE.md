# Lint #237 — turismo cotacoes/hoteis + dashboard-personalizado (src) + insurance

**Cluster:** **#15** | **Branch:** `chore/lint-turismo-hoteis-dashboard-insurance`

| Métrica | Pós-#426 | Esta PR |
|---------|----------|---------|
| warnings globais | **2175** | **2121** (**−54**) |
| 3 arquivos alvo | 54 | **0** |

**Correções principais:**
- `cotacoes/hoteis.tsx`: imports enxutos; `eslint-disable` client mount; tipos em `updateItem`/`updateHighlight`; entidades JSX escapadas
- `dashboard-personalizado.tsx` (src): mesmo padrão do cluster #13 em `pages/` — funções hoisted, `DashboardData`, widgets tipados
- `insurance.tsx`: imports enxutos; removidos `useAuth`/`isLoading`/`getStatusIcon` mortos

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #16 — integracoes-webhooks + transport + AdvancedReportBuilder (−54)
