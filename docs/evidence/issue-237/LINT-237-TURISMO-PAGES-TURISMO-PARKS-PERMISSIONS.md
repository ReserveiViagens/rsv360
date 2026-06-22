# Lint #237 — turismo (pages) + parks + permissions (src)

**Cluster:** **#9** | **Branch:** `chore/lint-turismo-pages-turismo-parks-permissions`

| Métrica | Pós-#420 | Esta PR |
|---------|----------|---------|
| warnings globais | **2530** | **2464** (**−66**) |
| 3 arquivos alvo | 66 | **0** |

**Correções principais:**
- `pages/turismo.tsx`: imports Lucide enxutos; `useMemo`/`useCallback`/`useRef` para notificações; formulários `NewTravelForm`/`NewTicketForm` extraídos para nível de módulo; preservadas seções tema dark e acesso rápido (Activity/Zap/Cpu)
- `src/pages/parks.tsx`: `MOCK_PARKS` em escopo de módulo; componentes `ParkForm`/`ImageModal`/`StatsDetails`/`ExportModal` extraídos; tipos `Park['type']`/`StatsPeriod`; eslint-disable em `<img>` de galeria
- `src/pages/permissions.tsx`: replica fixes de `pages/permissions.tsx` — imports enxutos, `loadData` hoisted, removido `loading` morto

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #10 — api-publica + Dashboard + ProcessMonitoring (−63)
