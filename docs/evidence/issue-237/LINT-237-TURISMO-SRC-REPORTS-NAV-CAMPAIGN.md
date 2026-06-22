# Lint #237 — turismo src/reports-dashboard + Navigation + CampaignManager

**Cluster:** **#40** | **Branch:** `chore/lint-turismo-src-reports-nav-campaign`

| Métrica | Pós-#39 | Esta PR |
|---------|---------|---------|
| warnings globais | **1084** | **1051** (**−33**) |
| 3 arquivos alvo | 33 | **0** |

**Correções principais:**
- `src/pages/reports-dashboard.tsx`: alinhado ao fix do cluster #39 (`REPORT_TEMPLATES`, `useCallback`)
- `Navigation.tsx`: `trim-lucide-imports` + restore `Home`/auth/router imports
- `CampaignManager.tsx`: `ImageIcon`; tipos em filters/status; dead code removido

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #41 — ProjectManager + ReportExport + TestSuites (−33)
