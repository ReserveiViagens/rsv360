# Lint #237 — turismo documents + groups + TestingPage

**Cluster:** **#26** | **Branch:** `chore/lint-turismo-documents-groups-testing`

| Métrica | Pós-#437 | Esta PR |
|---------|----------|---------|
| warnings globais | **1625** | **1583** (**−42**) |
| 3 arquivos alvo | 42 | **0** |

**Correções principais:**
- `documents.tsx`: imports enxutos; `ImageIcon`; `loadData` com `useCallback`; params tipados; init deferido
- `groups.tsx`: imports enxutos; removidos `useAuth`, `isLoading`, `groupMembers`; `metadata` tipado
- `TestingPage.tsx`: tipos de callback; `quickStats` readonly; removido `Badge`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #27 — configuracoes-avancadas + configuracoes-usuarios + groups src (−42)
