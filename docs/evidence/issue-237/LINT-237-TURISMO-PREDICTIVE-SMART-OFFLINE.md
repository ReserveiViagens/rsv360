# Lint #237 — turismo PredictiveAnalytics + SmartAutomation + OfflineSupport

**Cluster:** **#6** | **Branch:** `chore/lint-turismo-predictive-smart-offline`

| Métrica | Pós-#417 | Esta PR |
|---------|----------|---------|
| warnings globais | **2738** | **2666** (**−72**) |
| 3 arquivos alvo | 72 | **0** |

**Correções principais:**
- `PredictiveAnalytics.tsx`: imports Lucide/recharts enxutos; `ModelForm`/`ScenarioForm` movidos para nível de módulo
- `SmartAutomation.tsx`: `Pie` recharts; `unknown` em tipos; `RuleForm` no módulo; removido `selectedRule`
- `OfflineSupport.tsx`: helpers reordenados; `useMemo` para stats; `unknown`/`PendingAction`; functional updates em cache

**Próximo:** cluster #7 — DeployPage + turismo + AIEngine (−69)
