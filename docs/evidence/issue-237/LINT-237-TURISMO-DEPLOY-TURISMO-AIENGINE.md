# Lint #237 — turismo DeployPage + turismo + AIEngine

**Cluster:** **#7** | **Branch:** `chore/lint-turismo-deploy-turismo-aiengine`

| Métrica | Pós-#418 | Esta PR |
|---------|----------|---------|
| warnings globais | **2666** | **2597** (**−69**) |
| 3 arquivos alvo | 69 | **0** |

**Correções principais:**
- `DeployPage.tsx`: imports Lucide enxutos; interfaces tipadas nos handlers; `quickStats` read-only
- `turismo.tsx`: formulários no módulo; `useCallback`/`useMemo`; notificações sem `Date.now` em render
- `AIEngine.tsx`: `ModelForm`/`TaskForm` no módulo; imports recharts/lucide; `result?: unknown`

**Próximo:** cluster #8 — TeamManager + cotacoes/hoteis + permissions (−67)
