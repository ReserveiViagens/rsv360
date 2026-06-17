# Lint #237 — turismo configuracoes-avancadas + configuracoes-usuarios + groups (src)

**Cluster:** **#27** | **Branch:** `chore/lint-turismo-configuracoes-avancadas-usuarios-groups`

| Métrica | Pós-#438 | Esta PR |
|---------|----------|---------|
| warnings globais | **1583** | **1541** (**−42**) |
| 3 arquivos alvo | 42 | **0** |

**Correções principais:**
- `configuracoes-avancadas.tsx`: imports enxutos; `loadConfig` hoistado; `updateConfig` tipado; arrays sem `any`; removido `getProgressColor`
- `configuracoes-usuarios.tsx`: imports enxutos; `updateUserField`/`updateRoleField` genéricos
- `groups.tsx` (src): imports enxutos; removidos `useAuth`, `isLoading`, `groupMembers`; `metadata` tipado

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #28 — integracoes-apis + marketplace-parceiros + notification-system-test (−42)
