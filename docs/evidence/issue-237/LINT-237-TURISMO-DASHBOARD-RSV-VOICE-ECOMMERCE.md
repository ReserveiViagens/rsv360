# Lint #237 — turismo dashboard-rsv + voice-commerce + e-commerce

**Cluster:** **#32** | **Branch:** `chore/lint-turismo-dashboard-rsv-voice-ecommerce`

| Métrica | Pós-#31 | Esta PR |
|---------|---------|---------|
| warnings globais | **1375** | **1336** (**−39**) |
| 3 arquivos alvo | 39 | **0** |

**Correções principais:**
- `dashboard-rsv.tsx`: imports enxutos (espelho do backup)
- `voice-commerce.tsx`: imports enxutos; `useCallback` + `setTimeout(0)` para loadData/loadCallInteractions
- `e-commerce.tsx`: imports enxutos; `_user`; `Product | Order | Category` em vez de `any`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #33 — src/documents + src/e-commerce + TutorialSystem (−39)
