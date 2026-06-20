# Lint #237 — turismo reports-dashboard + travel-catalog-rsv + src/marketing-dashboard

**Cluster:** **#39** | **Branch:** `chore/lint-turismo-reports-travel-marketing-src`

| Métrica | Pós-#38 | Esta PR |
|---------|---------|---------|
| warnings globais | **1117** | **1084** (**−33**) |
| 3 arquivos alvo | 33 | **0** |

**Correções principais:**
- `reports-dashboard.tsx`: `REPORT_TEMPLATES` no módulo; `useCallback`; imports enxutos
- `travel-catalog-rsv.tsx`: lucide enxuto; favoritos simplificados; eslint img mock
- `src/pages/marketing-dashboard.tsx`: espelho do cluster #38 pages/marketing-dashboard

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #40 — src/reports-dashboard + Navigation + CampaignManager (−33)
