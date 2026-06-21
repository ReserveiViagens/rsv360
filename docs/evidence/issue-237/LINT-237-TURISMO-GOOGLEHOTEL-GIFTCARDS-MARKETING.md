# Lint #237 — turismo google-hotel-ads + giftcards + marketing-dashboard

**Cluster:** **#38** | **Branch:** `chore/lint-turismo-googlehotel-giftcards-marketing`

| Métrica | Pós-#37 | Esta PR |
|---------|---------|---------|
| warnings globais | **1150** | **1117** (**−33**) |
| 3 arquivos alvo | 33 | **0** |

**Correções principais:**
- `google-hotel-ads.tsx`: imports/UI mortos removidos; `useCallback` + eslint mount load
- `giftcards.tsx`: lucide enxuto; `Record<string,string>` params; `useCallback`; entidades escapadas
- `marketing-dashboard.tsx`: imports enxutos; `useCallback`; eslint reload on filter

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #39 — reports-dashboard + travel-catalog-rsv + src/marketing-dashboard (−33)
