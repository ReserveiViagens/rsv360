# Lint #237 — turismo integracoes-webhooks + transport + AdvancedReportBuilder

**Cluster:** **#16** | **Branch:** `chore/lint-turismo-webhooks-transport-reportbuilder`

| Métrica | Pós-#427 | Esta PR |
|---------|----------|---------|
| warnings globais | **2121** | **2067** (**−54**) |
| 3 arquivos alvo | 54 | **0** |

**Correções principais:**
- `integracoes-webhooks.tsx`: imports enxutos; tipos `Record<string, unknown>`; removidas funções mortas `addHeader`/`removeHeader`
- `transport.tsx`: `MOCK_TRANSPORTS` em escopo de módulo; state morto removido; `eslint-disable` em `<img>`; tipagem `statsPeriod`
- `AdvancedReportBuilder.tsx`: imports enxutos; tipos em filters/fields; `DragEndEvent` no drag handler

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #17 — GoLiveSystem + HelpSystem + ChatSystem (−54)
