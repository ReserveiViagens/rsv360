# Lint #237 — turismo ProjectManager + ReportExport + TestSuites

**Cluster:** **#41** | **Branch:** `chore/lint-turismo-project-reportexport-testsuites`

| Métrica | Pós-#40 | Esta PR |
|---------|---------|---------|
| warnings globais | **1051** | **1018** (**−33**) |
| 3 arquivos alvo | 33 | **0** |

**Correções principais:**
- `ProjectManager.tsx`: imports enxutos; tipos `Project['status'|'priority']`
- `ReportExport.tsx`: `DEFAULT_EXPORT_TEMPLATES`/`MOCK_EXPORT_JOBS` no módulo; tipos export param
- `TestSuites.tsx`: `MOCK_TEST_SUITES` no módulo; state/tabs mortos removidos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #43 — dashboard + affiliates + roles (−30)
