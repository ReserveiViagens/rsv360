# Lint #237 — turismo WorkflowTemplates + visa + configuracoes-gerais

**Cluster:** **#18** | **Branch:** `chore/lint-turismo-workflow-visa-config-gerais`

| Métrica | Pós-#429 | Esta PR |
|---------|----------|---------|
| warnings globais | **2013** | **1961** (**−52**) |
| 3 arquivos alvo | 52 | **0** |

**Correções principais:**
- `WorkflowTemplates.tsx`: imports enxutos; datas mock fixas (sem `Date.now()` no render)
- `pages/visa.tsx`: imports mortos removidos; `useAuth`/`isLoading` não usados removidos
- `configuracoes-gerais.tsx`: imports enxutos; `loadConfig` hoistado; `updateConfig` tipado; entidades JSX escapadas

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #19 — visa (src) + BookingCalendar + BookingModal (−51)
