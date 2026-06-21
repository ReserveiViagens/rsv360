# Lint #237 — Plano completo turismo (handoff Codex)

**Issue:** [#237](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/237)  
**App:** `apps/turismo`  
**Atualizado:** 2026-06-20 (cluster #64 concluído)  
**Baseline global:** **445** warnings  
**Arquivos com débito:** **345**  
**Clusters planejados:** **120** (−3141 total)  
**Máquina de clusters:** `apps/turismo/scripts/lint-237-clusters.json` (gerar: `node scripts/lint-237-generate-clusters.cjs`)

## Status executivo

| Métrica | Valor |
|---------|-------|
| Warnings globais | **445** |
| Clusters concluídos | **64** / 120 |
| PR empilhada mais recente | **#479** (cluster #64, −21) |
| Próximo cluster | **#65** — NotificationContext + finance + notifications-dashboard (−19) |

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
| #433 | hotels-complete + reports + travel | −48 → **1813** | apiclient-cadastros-gestao |
| #434 | chatbot-ia + gestao + reports (src) | −48 → **1765** | hotels-reports-travel |
| #435 | ChatConversations + NotificationManager + PushNotificationSystem | −48 → **1717** | chatbot-gestao-reports-src |
| #436 | TaskManager + leiloesApi + marketplace | −47 → **1670** | chat-notifications |
| #437 | CustomerManagement + FinalDeploySystem + AccountingIntegration | −45 → **1625** | task-leiloes-marketplace |
| #438 | documents + groups + TestingPage | −42 → **1583** | customer-deploy-accounting |
| #439 | configuracoes-avancadas + configuracoes-usuarios + groups (src) | −42 → **1541** | documents-groups-testing |
| #440 | integracoes-apis + marketplace-parceiros + notification-system-test | −42 → **1499** | configuracoes-avancadas-usuarios-groups |
| #441 | relatorios-personalizados + DataExportSystem + BackupRecoverySystem | −42 → **1457** | integracoes-marketplace-notification |
| #442 | PerformanceTesting + templates + dashboard-rsv-backup | −40 → **1375** | training-leadcapture-settings |
| #444 | src/documents + src/e-commerce + TutorialSystem | −39 → **1297** | dashboard-rsv-voice-ecommerce |
| #445 | TaxManagement + PaymentModal + CustomReportBuilder | −39 → **1258** | src-documents-ecommerce-tutorial |
| #446 | authService + visas + workflows | −37 → **1221** | tax-payment-customreport |
| #451 | ExecutiveDashboard + UserManagement + DocumentationSystem | −36 → **1185** | authservice-visas-workflows |
| #452 | FAQSystem + FinancialDashboard + dashboard-reservei-viagens | −35 → **1150** | executive-usermgmt-docsystem |
| #453 | google-hotel-ads + giftcards + marketing-dashboard | −33 → **1117** | faq-financial-dashboard-reservei |
| #454 | reports-dashboard + travel-catalog-rsv + src/marketing-dashboard | −33 → **1084** | googlehotel-giftcards-marketing |
| #455 | src/reports-dashboard + Navigation + CampaignManager | −33 → **1051** | reports-travel-marketing-src |
| #456 | ProjectManager + ReportExport + TestSuites | −33 → **1018** | src-reports-nav-campaign |
| #457 | bookingService + accommodations/analytics + cotacoes/templates | −31 → **987** | project-reportexport-testsuites |
| #458 | dashboard + affiliates + roles | −30 → **957** | booking-accommodations-templates |
| #459 | src/dashboard + ReportBuilder + AuditLog | −30 → **927** | dashboard-affiliates-roles |
| #460 | ChatAnalytics + ApiConnector + NotificationSettings | −30 → **897** | src-dashboard-reportbuilder-auditlog |
| #461 | ReportBuilder + CodeCoverage + TravelCatalog | −30 → **867** | chat-api-notifications |
| #462 | cotacoes/index + test-page + insurance | −27 → **840** | reports-coverage-travelcatalog |
| #463 | notifications + DevOpsPage + demo-layout | −27 → **813** | cotacoes-insurance |
| #464 | ChatSystem + SocialMediaIntegration + PaymentHistory | −27 → **786** | notifications-devops-demo |
| #465 | RefundManager + DataExport + TestRunner | −27 → **759** | chat-social-payment |
| #466 | seo + ReportsPage + BookingsPage | −24 → **711** | analytics-recommendations-sales |
| #467 | analytics-financeiro + recommendations + sales-dashboard | −24 → **735** | refund-export-testrunner |
| #468 | chat-test + clients + layout-test | −24 → **687** | seo-reports-bookings |
| #469 | ml-recomendacoes + navigation-test + sales-dashboard (src) | −24 → **663** | chat-clients-layout |
| #470 | travel + CustomerModal + EmailAutomation | −24 → **639** | ml-nav-sales-src |
| #471 | ReportGenerator + WorkflowEngine + paymentService | −24 → **615** | travel-customer-email |
| #472 | websocket + AuthContext + calendar | −23 → **592** | report-workflow-payment |
| #473 | cotacoes/templates/new + loyalty + analytics-dashboard | −21 → **571** | websocket-auth-calendar |
| #474 | analytics-system-test + calendar (src) + component-test | −21 → **550** | cotacoes-loyalty-analytics |
| #475 | dashboard-new + financial-system-test + loyalty (src) | −21 → **529** | analytics-calendar-component |
| #476 | TwoFactorAuth + BookingTable + CustomerList | −21 → **508** | dashboard-financial-integration |
| #477 | DocumentManager + BudgetSystem + FinancialManager | −21 → **487** | twofactor-booking-customer |
| #478 | ModernSidebar + MarketingAnalytics + PushNotifications | −21 → **466** | document-budget-financial |
| #479 | ReportScheduler + AITutor + Select | −21 → **445** | sidebar-marketing-push |
| #480 | NotificationContext + finance + notifications-dashboard | −19 → **426** | report-aitutor-select |
| #481 | attractions + integration-system-test + notifications-dashboard (src) | −18 → **408** | notification-finance-dashboard |
| #482 | AnalyticsDashboard + AdminPanel + AuthPage | −18 → **390** | attractions-integration-notifications-src |
| #483 | CustomerProfile + Layout + NotificationToast | −18 → **372** | analytics-admin-auth |
| #484 | SMSSystem + PaymentGateway + ReportTemplates | −18 → **354** | customer-layout-toast |
| #485 | AccessibilityPanel + finance-dashboard + parks | −16 → **338** | sms-payment-report-templates |

## Clusters 1–50 (concluídos)

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
| 21 | −48 | hotels-complete, reports, travel | **concluído** (#433) |
| 22 | −48 | chatbot-ia, gestao, reports (src) | **concluído** (#434) |
| 23 | −48 | ChatConversations, NotificationManager, PushNotificationSystem | **concluído** (#435) |
| 24 | −47 | TaskManager, leiloesApi, marketplace | **concluído** (#436) |
| 25 | −45 | CustomerManagement, FinalDeploySystem, AccountingIntegration | **concluído** (#437) |
| 26 | −42 | documents, groups, TestingPage | **concluído** (#438) |
| 27 | −42 | configuracoes-avancadas, configuracoes-usuarios, groups (src) | **concluído** (#439) |
| 28 | −42 | integracoes-apis, marketplace-parceiros, notification-system-test | **concluído** (#440) |
| 29 | −42 | relatorios-personalizados, DataExportSystem, BackupRecoverySystem | **concluído** (#441) |
| 30 | −42 | TrainingSystem, LeadCapture, SettingsPanel | **concluído** (#447) |
| 31 | −40 | PerformanceTesting, cotacoes/templates, dashboard-rsv-backup | **concluído** (#442) |
| 32 | −39 | dashboard-rsv, voice-commerce, e-commerce | **concluído** (#443) |
| 33 | −39 | src/documents, src/e-commerce, TutorialSystem | **concluído** (#444) |
| 34 | −39 | TaxManagement, PaymentModal, CustomReportBuilder | **concluído** (#445) |
| 35 | −37 | authService, visas, workflows | **concluído** (#446) |
| 36 | −36 | ExecutiveDashboard, UserManagement, DocumentationSystem | **concluído** (#451) |
| 37 | −35 | FAQSystem, FinancialDashboard, dashboard-reservei-viagens | **concluído** (#452) |
| 38 | −33 | google-hotel-ads, giftcards, marketing-dashboard | **concluído** (#453) |
| 39 | −33 | reports-dashboard, travel-catalog-rsv, src/marketing-dashboard | **concluído** (#454) |
| 40 | −33 | src/reports-dashboard, Navigation, CampaignManager | **concluído** (#455) |
| 41 | −33 | ProjectManager, ReportExport, TestSuites | **concluído** (#456) |

## Clusters 42–120

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
