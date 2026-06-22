# Lint #237 — turismo chatbot-ia + gestao + reports (src)

**Cluster:** **#22** | **Branch:** `chore/lint-turismo-chatbot-gestao-reports-src`

| Métrica | Pós-#433 | Esta PR |
|---------|----------|---------|
| warnings globais | **1813** | **1765** (**−48**) |
| 3 arquivos alvo | 48 | **0** |

**Correções principais:**
- `src/pages/chatbot-ia.tsx`: imports enxutos; tipos para speech/actions; `nextMessageId` ref; `applySuggestion` (evita rules-of-hooks); `speechSupported` state; init de voz via `setTimeout`
- `src/pages/gestao.tsx`: interfaces `StatsCard`/`GestaoUser`/etc.; imports enxutos; handlers e validação tipados
- `src/pages/reports.tsx`: mesmo padrão do cluster #21 em `pages/reports.tsx` (mocks deferidos, tipos nos maps, código morto removido)

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #24 — TaskManager + leiloesApi + marketplace (−47)
