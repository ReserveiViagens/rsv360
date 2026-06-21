# Lint #237 — turismo PerformanceTesting + templates + dashboard-rsv-backup

**Cluster:** **#31** | **Branch:** `chore/lint-turismo-performance-templates-dashboard-backup`

| Métrica | Pós-#30 | Esta PR |
|---------|---------|---------|
| warnings globais | **1415** | **1375** (**−40**) |
| 3 arquivos alvo | 40 | **0** |

**Correções principais:**
- `PerformanceTesting.tsx`: imports enxutos; mock data e `simulateTestResults` fora do componente; `setTimeout(0)` no effect; `useRef` para IDs de teste; `_onPerformanceAlert`
- `templates.tsx`: imports enxutos; `useCallback` para `loadTemplates`/`filterTemplates`; `setTimeout(0)` nos effects; `AdvancedStats` tipado; `V0Window` em vez de `any`
- `dashboard-rsv-backup.tsx`: imports enxutos (removidos ícones e hooks não usados)

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #32 — dashboard-rsv + voice-commerce + e-commerce (−39)
