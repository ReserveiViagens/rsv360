# Lint #237 — turismo GoLiveSystem + HelpSystem + ChatSystem

**Cluster:** **#17** | **Branch:** `chore/lint-turismo-golive-help-chat`

| Métrica | Pós-#428 | Esta PR |
|---------|----------|---------|
| warnings globais | **2067** | **2013** (**−54**) |
| 3 arquivos alvo | 54 | **0** |

**Correções principais:**
- `GoLiveSystem.tsx`: imports enxutos; `estimatedCompletion` sem `Date.now()` no render; `_index` removido; `GoLiveChecklist['priority']` no Select
- `HelpSystem.tsx`: `MOCK_*` em escopo de módulo; state inicial direto (sem `useEffect`); callbacks/props mortos removidos; imports Lucide enxutos
- `ChatSystem.tsx`: `MOCK_*` com datas ISO fixas; `BadgeVariant` tipado; `eslint-disable` em `<img>` mock; imports mortos removidos

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #19 — visa (src) + BookingCalendar + BookingModal (−51)
