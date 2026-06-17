# Lint #237 — turismo authService + visas + workflows

**Cluster:** **#35** | **Branch:** `chore/lint-turismo-authservice-visas-workflows`

| Métrica | Pós-#34 | Esta PR |
|---------|---------|---------|
| warnings globais | **1258** | **1221** (**−37**) |
| 3 arquivos alvo | 37 | **0** |

**Correções principais:**
- `authService.ts`: removido `ApiResponse`; `catch (error: unknown)`; `_error` em verifyToken
- `visas.tsx`: imports enxutos; `useCallback` loadData; tipos `VisaType`/`VisaCountry`/`LucideIcon`
- `workflows.tsx`: imports enxutos; `useCallback` loadData; entidades escapadas; tipos em `setActiveTab`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #36 — ExecutiveDashboard + UserManagement + DocumentationSystem (−36)
