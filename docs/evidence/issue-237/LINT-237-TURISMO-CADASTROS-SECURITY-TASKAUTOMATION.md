# Lint #237 — turismo cadastros + security-system-test + TaskAutomation

**Cluster:** **#11** | **Branch:** `chore/lint-turismo-cadastros-security-taskautomation`

| Métrica | Pós-#422 | Esta PR |
|---------|----------|---------|
| warnings globais | **2401** | **2341** (**−60**) |
| 3 arquivos alvo | 60 | **0** |

**Correções principais:**
- `cadastros.tsx`: imports Lucide enxutos; removido `NavigationButtons` e state `selectedVideo`; `eslint-disable` em tab effect e `<img>`; `UserForm` tipado com `Partial<Owner>`
- `security-system-test.tsx`: imports Lucide enxutos; removida `getModuleIcon` (evita `no-assign-module-variable`)
- `TaskAutomation.tsx`: `MOCK_TASKS` com datas ISO fixas; `config: Record<string, unknown>`; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #12 — automacao×2 + rsv-360-ecosystem (−57)
