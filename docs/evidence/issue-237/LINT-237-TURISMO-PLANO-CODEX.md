# Lint #237 — Plano completo turismo (handoff Codex)

**Issue:** [#237](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/237)  
**App:** `apps/turismo`  
**Atualizado:** 2026-06-02 (cluster #20 concluído)  
**Baseline global:** **1861** warnings  
**Arquivos com débito:** **360**  
**Clusters planejados:** **120** (−3141 total)  
**Máquina de clusters:** `apps/turismo/scripts/lint-237-clusters.json` (gerar: `node scripts/lint-237-generate-clusters.cjs`)

## Status executivo

| Métrica | Valor |
|---------|-------|
| Warnings globais | **1861** |
| Clusters concluídos | **20** / 120 |
| PR empilhada mais recente | **#432** (cluster #20, −49) |
| Próximo cluster | **#21** — hotels-complete + reports + travel (−48) |

## Padrão por cluster (repetir)

1. Branch `chore/lint-turismo-<slug>` a partir da PR anterior (empilhada).
2. `node scripts/trim-lucide-imports.cjs <arquivo>` em cada alvo.
3. `scripts/fix-<slug>-residual.cjs` para hooks, `any`, recharts, state morto.
4. Gates: `type-check`, `build`, ESLint 0 nos alvos, `eslint-warnings-rank.cjs`.
5. `docs/evidence/issue-237/LINT-237-TURISMO-<SLUG>.md` + linha em `TRILHA-0-CHECKLIST.md`.
6. Commit só arquivos da PR → push → `gh pr create --base <branch-anterior>`.

## PRs empilhadas (histórico recente)

| PR | Cluster | Δ global | Branch base |
|----|---------|----------|-------------|
| #411 | useApi + conteudo×2 | −88 → 3228 | … |
| #412 | dashboard + tickets + ChatbotAI | −87 → **3141** | useapi-conteudo |
| #413 | IntegrationHub + ProjectTimeline + atracoes | −86 → **3055** | dashboard-tickets-chatbot |
| #414 | dashboard-master + hotels-funcional + FinancialAnalytics | −84 → **2971** | integration-project-atracoes |
| #415 | Sidebar + customers-rsv + NotificationsPage | −82 → **2889** | dashboard-master-hotels-financial |
| #416 | customers-complete + AdvancedCharts + ApprovalSystem | −78 → **2811** | sidebar-customers-notifications |
| #417 | parques + settings + OptimizationEngine | −73 → **2738** | customers-complete-charts-approval |
| #418 | PredictiveAnalytics + SmartAutomation + OfflineSupport | −72 → **2666** | parques-settings-optimization |
| #419 | DeployPage + turismo + AIEngine | −69 → **2597** | predictive-smart-offline |
| #420 | TeamManager + hoteis + permissions | −67 → **2530** | deploy-turismo-aiengine |
| #421 | turismo (pages) + parks + permissions (src) | −66 → **2464** | team-hoteis-permissions |
| #422 | api-publica + Dashboard + ProcessMonitoring | −63 → **2401** | pages-turismo-parks-permissions |
| #423 | cadastros + security-system-test + TaskAutomation | −60 → **2341** | api-dashboard-processmonitoring |
| #424 | automacao×2 + rsv-360-ecosystem | −57 → **2284** | cadastros-security-taskautomation |
| #425 | ProductionMonitoring + dashboard-personalizado + analytics-avancados | −55 → **2229** | automacao-rsv-ecosystem |
| #426 | animations-demo + backend-integration-test + configuracoes-sistema | −54 → **2175** | production-dashboard-analytics |
| #427 | cotacoes/hoteis + dashboard-personalizado (src) + insurance | −54 → **2121** | animations-backend-config |
| #428 | integracoes-webhooks + transport + AdvancedReportBuilder | −54 → **2067** | hoteis-dashboard-insurance |
| #429 | GoLiveSystem + HelpSystem + ChatSystem | −54 → **2013** | webhooks-transport-reportbuilder |
| #430 | WorkflowTemplates + visa + configuracoes-gerais | −52 → **1961** | golive-help-chat |
| #431 | visa (src) + BookingCalendar + BookingModal | −51 → **1910** | workflow-visa-config-gerais |
| #432 | apiClient + cadastros + gestao | −49 → **1861** | visa-booking-calendar-modal |

## Clusters 1–20 (próximos na fila)

| # | Δ | Arquivos | Status |
|---|-----|----------|--------|
| 1 | −86 | IntegrationHub, ProjectTimeline, cotacoes/atracoes | **concluído** (#413) |
| 2 | −84 | dashboard-master, hotels-funcional, FinancialAnalytics | **concluído** (#414) |
| 3 | −82 | Sidebar, customers-rsv, NotificationsPage | **concluído** (#415) |
| 4 | −78 | customers-complete, AdvancedCharts, ApprovalSystem | **concluído** (#416) |
| 5 | −73 | cotacoes/parques, settings, OptimizationEngine | **concluído** (#417) |
| 6 | −72 | PredictiveAnalytics, SmartAutomation, OfflineSupport | **concluído** (#418) |
| 7 | −69 | DeployPage, turismo (src), AIEngine | **concluído** (#419) |
| 8 | −67 | TeamManager, cotacoes/hoteis, permissions (pages) | **concluído** (#420) |
| 9 | −66 | turismo (pages), parks, permissions (src) | **concluído** (#421) |
| 10 | −63 | api-publica, Dashboard, ProcessMonitoring | **concluído** (#422) |
| 11 | −60 | cadastros, security-system-test, TaskAutomation | **concluído** (#423) |
| 12 | −57 | automacao×2, rsv-360-ecosystem | **concluído** (#424) |
| 13 | −55 | ProductionMonitoring, dashboard-personalizado, analytics-avancados | **concluído** (#425) |
| 14 | −54 | animations-demo, backend-integration-test, configuracoes-sistema | **concluído** (#426) |
| 15 | −54 | cotacoes/hoteis, dashboard-personalizado (src), insurance | **concluído** (#427) |
| 16 | −54 | integracoes-webhooks, transport, AdvancedReportBuilder | **concluído** (#428) |
| 17 | −54 | GoLiveSystem, HelpSystem, ChatSystem | **concluído** (#429) |
| 18 | −52 | WorkflowTemplates, visa, configuracoes-gerais | **concluído** (#430) |
| 19 | −51 | visa (src), BookingCalendar, BookingModal | **concluído** (#431) |
| 20 | −49 | apiClient, cadastros, gestao | **concluído** (#432) |

## Clusters 21–120

Lista completa em `apps/turismo/scripts/lint-237-clusters.json`.  
Meta final: **0** warnings globais (excl. voucher/validation) ou GO condicional documentado por módulo.

## Instrução Codex (colar na sessão)

```
Contexto: issue #237, app apps/turismo, baseline 3141 warnings.
Leia: docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md
Leia: apps/turismo/scripts/lint-237-clusters.json (cluster id=N)
Execute o padrão por cluster; não commitar arquivos fora da PR.
Base empilhada: última branch chore/lint-turismo-* mergeada ou PR aberta.
```

## O que falta

- [x] Clusters **1–8** (2530 warnings restantes)
- [ ] Clusters **9–120**
- [ ] Atualizar este doc após cada PR (global, PR#, branch)
- [ ] Fechar issue #237 quando global ≈ 0 ou plano de exceções aprovado
