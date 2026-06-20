# Lint #237 — turismo FAQSystem + FinancialDashboard + dashboard-reservei-viagens

**Cluster:** **#37** | **Branch:** `chore/lint-turismo-faq-financial-dashboard-reservei`

| Métrica | Pós-#36 | Esta PR |
|---------|---------|---------|
| warnings globais | **1185** | **1150** (**−35**) |
| 3 arquivos alvo | 35 | **0** |

**Correções principais:**
- `FAQSystem.tsx`: `MOCK_*` no módulo; tabs/props mortos removidos
- `FinancialDashboard.tsx`: imports enxutos; `currentMetrics` read-only; `previousMetrics` morto removido
- `dashboard-reservei-viagens.tsx`: `ImageIcon`; stats estáticos; effect/load mortos removidos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #38 — google-hotel-ads + giftcards + marketing-dashboard (−33)
