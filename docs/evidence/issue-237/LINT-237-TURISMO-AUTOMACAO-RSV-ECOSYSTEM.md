# Lint #237 — turismo automacao×2 + rsv-360-ecosystem

**Cluster:** **#12** | **Branch:** `chore/lint-turismo-automacao-rsv-ecosystem`

| Métrica | Pós-#423 | Esta PR |
|---------|----------|---------|
| warnings globais | **2341** | **2284** (**−57**) |
| 3 arquivos alvo | 57 | **0** |

**Correções principais:**
- `pages/automacao.tsx` + `src/pages/automacao.tsx`: imports Lucide enxutos; `AutomacaoSelectedItem` no modal; handlers tipados; `validateForm` com `Record<string, string>`
- `rsv-360-ecosystem.tsx`: imports Lucide enxutos; removidos `useEffect`, `RSVSidebar`, `toggleSidebar`; `LucideIcon` nas interfaces; state sidebar simplificado

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #13 — ProductionMonitoring + dashboard-personalizado + analytics-avancados (−55)
