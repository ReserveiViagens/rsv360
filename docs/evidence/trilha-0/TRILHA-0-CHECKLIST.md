# TRILHA-0 — Checklist

**Data início:** _preencher_  
**Executor:** _preencher_  
**Branch:** `chore/trilha-0-prep` (base `main` @ pós-#246)

## Pré-requisitos (gates anteriores)

- [x] G2 integrado **GO** (21/21)
- [x] G3 segurança **GO**
- [x] G4-API P0 **GO** (#243)
- [x] Healthcheck frontends **#242 + #245**
- [x] Evidência G1 rodada 1 **#246**
- [x] **G1 dual-system = GO** (2026-05-30 — `G1-DUAL-SYSTEM-FINAL-REPORT.md`)

## T0 — Estabilidade runtime

- [x] `docker compose -p rsv360` serviços críticos Up (rede alinhada via connect + monitoring)
- [x] `site-publico` container **healthy**
- [x] `backend` container **healthy**
- [x] `postgres` container **healthy**
- [x] `site-publico` + `postgres` na **mesma rede** (`rsv360-phase1_default`)
- [x] Smoke: `:3002/health` → 200
- [x] Smoke: `:3000/` → 200
- [x] `logs/TRILHA0-PREFLIGHT.tsv` sem FAIL (rodada 1)

## T1 — Rollback readiness

- [x] `pg_dump` testado — `logs/rollback-pre-trilha0.dump` (84 104 bytes, local)
- [x] Commit rollback baseline: `main` @ `6f9d301b` (pós-#247)
- [x] Procedimento documentado em `TRILHA-0-ROLLBACK-RUNBOOK.md`
- [x] Drill: `logs/ROLLBACK-DRILL-RESULT.txt` → **PASS**

## T2 — Observabilidade mínima

- [x] Prometheus container **Up** (`rsv360-prometheus`)
- [x] Grafana container **Up** (`rsv360-grafana`, host `:3007`)
- [x] Logs backend acessíveis (sem crash loop na janela)
- [x] Critérios em `TRILHA-0-OBSERVABILITY.md` atendidos

## T3 — Isolamento e drift

- [x] `RSV360_DOCKER_PROJECT` / `COMPOSE_PROJECT_NAME` documentados no `.env.example` — `T3-ISOLAMENTO-DOCKER-CLOSE.md`
- [x] Segundo listener Postgres `:5432` — **GAP aceito** (Windows PG + Docker; inventário #251)
- [x] `docs/DOCKER-ISOLATION.md` alinhado ao clone em uso (`s2-pr232-validate`)

## T0.1 — Inventário React/Next (execução stack upgrade)

- [x] Script `scripts/trilha-0-inventory-react-next.ps1`
- [x] Relatório `T0.1-REACT-NEXT-INVENTORY.md` + `logs/T0.1-INVENTORY.tsv`
- [x] Gaps documentados (site-publico React 18 vs apps React 19)
- [x] ADR T0.2 **aprovado** — ADR-0002 status `Aceito` (2026-06-08)
- [x] Piloto T0.3 Fase A — `apps/guest` **GO** 2026-06-08 — `T0.3-GUEST-PILOT.md`
- [x] Fase B — `site-publico` React 19 **GO condicional** 2026-06-08 — `T0.4-SITE-PUBLICO-REACT19.md` (GAP-T01 fechado)
- [x] Fase C — Node 24 LTS **GO condicional** 2026-06-08 — `T0.5-NODE24-LTS.md` (GAP-T03 fechado Docker/CI)
- [x] Fase D — guest Next 16 **GO condicional** 2026-06-08 — `T0.6-GUEST-NEXT16.md` (GAP-T04 parcial)
- [x] Fase D — admin Next 16 **GO condicional** 2026-06-08 — `T0.7-ADMIN-NEXT16.md`
- [x] Fase D — turismo Next 16 **GO condicional** 2026-06-08 — `T0.8-TURISMO-NEXT16.md`
- [x] Fase D — site-publico Next 16 **GO condicional** 2026-06-08 — `T0.9-SITE-PUBLICO-NEXT16.md` (**GAP-T04 fechado**)
- [x] T0.5 CI Node 24 **GO** 2026-06-12 — PR #287 — `T0.5-CI-NODE24.md` (9 workflows raiz 22→24, checks verdes)
- [x] T0.10 guest+admin Docker **GO pós-merge** 2026-06-12 — PR #296 @ `0b900d8c2` — `T0.10-GUEST-ADMIN-DOCKER-STAB.md`

## Fase E — stack residual (ADR-0003)

- [x] ADR-0003 Fase E — **Aceito** 2026-06-12 — PR #297 @ `f7186aa95` — `ADR-0003-FASE-E-STACK-RESIDUAL.md`
- [x] T0.11 TS6 guest — **GO pós-merge** — impl #299, docs #300 — `T0.11-TYPESCRIPT6-GUEST-RESULT.md`
- [x] T0.12 TS6 admin — **GO pós-merge** — impl #302, docs #303 — `T0.12-TYPESCRIPT6-ADMIN-RESULT.md`
- [x] T0.13 TS6 turismo — **GO pós-merge** — impl #304, docs #306 — `T0.13-TYPESCRIPT6-TURISMO-RESULT.md`
- [x] T0.14 TS6 site-publico — **GO pós-merge** — impl #310, docs #312 — `T0.14-TYPESCRIPT6-SITE-PUBLICO-RESULT.md`
- [x] **Rodada TS6 Fase E — concluída** — `FASE-E-TS6-CLOSEOUT.md`
- [x] T0.15 TW4 guest — **GO pós-merge** — impl #330, carimbo #331 — `T0.15-TAILWIND4-GUEST-POST-MERGE.md`
- [x] T0.16 TW4 admin — **GO pós-merge** #332/#333
- [x] T0.17 preflight `.next/types` — **GO** #334
- [x] T0.18 handlers — **GO** #335 + carimbo #336
- [x] T0.19 Lucide — **GO** #338 + carimbo #339
- [x] T0.19b Recharts — **GO** #340 + carimbo #341
- [x] T0.20a Radix/leaflet — **GO** #350 + carimbo #351 — `T0.20a-RADIX-LEAFLET-POST-MERGE.md`
- [x] T0.20b TS2322/TS2339 — **GO** #352 — `T0.20b-TS2322-2339-RESULT.md`
- [x] T0.20c residual — **GO pós-merge** #353 + carimbo #354 — `T0.20c-RESIDUAL-POST-MERGE.md` (347 → 0 erros)
- [x] **Rodada T0.20 `.next/types` — encerrada** (a→b→c + carimbos)
- [x] E5 Express 5 revalidação pós-T0.20 — **GO** — `E5-EXPRESS5-POST-T0.20-REVERIFY.md`
- [x] Fase E HITL pós-T0.20 — **GO** — `FASE-E-HITL-POST-T0.20.md`
- [x] T0.21 TW4 site-publico preflight — **GO condicional** — `T0.21-TAILWIND4-SITE-PUBLICO-PREFLIGHT.md`
- [x] T0.21 TW4 site-publico impl — **GO pós-merge** #356 — `T0.21-TAILWIND4-SITE-PUBLICO-RESULT.md`
- [x] T0.21 TW4 site-publico carimbo — **GO pós-merge** #357 — `T0.21-TAILWIND4-SITE-PUBLICO-POST-MERGE.md`
- [x] **Fase E TW4 (guest+admin+site-publico) — encerrada** — `FASE-E-TW4-CLOSEOUT.md`
- [x] Fase E HITL pós-T0.21 — **GO** — `FASE-E-HITL-POST-T0.21.md`
- [x] T0.22 TW4 turismo preflight — **GO condicional** — `T0.22-TAILWIND4-TURISMO-PREFLIGHT.md`
- [x] T0.22 TW4 turismo impl — **GO pós-merge** #359 — `T0.22-TAILWIND4-TURISMO-RESULT.md`
- [x] T0.22 TW4 turismo carimbo — **GO pós-merge** *(esta PR)* — `T0.22-TAILWIND4-TURISMO-POST-MERGE.md`
- [x] **Fase E TW4 — encerrada** (4/4 apps Next em 4.3.1)
- [x] **Fase E ADR-0003 — encerrada** — `FASE-E-CLOSEOUT.md`

## Pós-Fase E — débito técnico / PLANO-MESTRE

- [x] HITL pós-Fase E — **GO** — `HITL-POST-FASE-E.md`
- [x] ADR-0004 PLANO-MESTRE Fase 1 — **Aceito** *(esta PR)* — `ADR-0004-PLANO-MESTRE-FASE1-PROPOSTA.md`
- [x] T0.23 TS turismo preflight — **GO condicional** — `T0.23-TURISMO-TS-RADIX-PREFLIGHT.md`
- [x] T0.23a Radix turismo impl — **GO condicional** #362 — `T0.23a-TURISMO-RADIX-RESULT.md` — TS2786 **150 → 0**
- [x] T0.23a Radix turismo carimbo — **GO pós-merge** #363 — `T0.23a-TURISMO-RADIX-POST-MERGE.md`
- [x] T0.23b TS2322/2339 turismo — **GO** #368 — `T0.23b-TS2322-2339-RESULT.md` — TS2322/TS2339 **→ 0**
- [x] T0.23b carimbo — **GO pós-merge** #371 — `T0.23b-TURISMO-TS2322-POST-MERGE.md`
- [x] T0.23c TS2305/TS2724 turismo — **GO** #372 — `T0.23c-TURISMO-RESIDUAL-RESULT.md` — TS2305/TS2724 **→ 0**
- [x] T0.23c carimbo — **GO pós-merge** #373 — `T0.23c-TURISMO-RESIDUAL-POST-MERGE.md`
- [x] T1.2 auth/session piloto — **GO** #374 — `T1.2-AUTH-SESSION-RESULT.md`
- [x] T1.3 tenant routing — **GO** #376 — `T1.3-TENANT-ROUTING-RESULT.md`
- [x] T1.2b refresh backend — **GO** #376 — `T1.2b-REFRESH-BACKEND-RESULT.md`
- [x] T0.23d TS turismo débito — **GO** #376 — `T0.23d-TURISMO-TS-DEBT-RESULT.md`
- [x] T0.23e TS clusters turismo — **GO** *(esta PR)* — `T0.23e-TURISMO-TS-CLUSTERS-RESULT.md`
- [x] T1.4 PropertySwitcher — **GO** *(esta PR)* — `T1.4-PROPERTY-SWITCHER-RESULT.md`
- [x] T1.2c refresh DB — **GO** *(esta PR)* — `T1.2c-REFRESH-DB-RESULT.md`
- [x] Lint #237 turismo notifications — **GO** *(esta PR)* — `issue-237/LINT-237-TURISMO-NOTIFICATIONS-MODULE.md`
- [x] T0.24 eslint hoist — **GO** *(esta PR)* — `T0.24-ESLINT-HOIST-RESULT.md`
- [x] Lint #237 retomada — **baseline capturado** — `LINT-237-RETOMADA-POS-T0.24.md`
- [x] Lint #237 site-publico — **GO** #369 — `issue-237/LINT-237-SITE-PUBLICO-POST-T0.24.md`
- [x] Lint #237 admin/guest/turismo — **GO** #375 — `issue-237/LINT-237-ADMIN-GUEST-TURISMO-POST-T0.24.md`
- [x] Lint #237 turismo api module — **GO** *(esta PR)* — `issue-237/LINT-237-TURISMO-API-MODULE.md`
- [x] T1.1 piloto tenant/auth — **GO condicional** *(esta PR)* — `T1.1-PILOTO-TENANT-AUTH-RESULT.md`
- [x] T0.23f TS turismo residual — **GO** *(esta PR)* — `T0.23f-TURISMO-TS-RESULT.md` — **49 → 0**
- [x] Lint #237 turismo cotacoes — **GO** *(esta PR)* — `issue-237/LINT-237-TURISMO-COTACOES-MODULE.md`
- [x] T1.2d login DB — **GO** *(PR #378)* — `T1.2d-LOGIN-DB-RESULT.md` + smoke `T1.2d-STAGING-SMOKE-RESULT.md`
- [x] T0.23g build smoke turismo — **GO** *(esta PR)* — `T0.23g-BUILD-SMOKE-RESULT.md`
- [x] Lint #237 turismo full quiet — **GO** *(esta PR)* — `issue-237/LINT-237-TURISMO-FULL-QUIET-RESULT.md` — **0 erros**
- [x] T1.5 rate limit auth — **GO** *(PR #379)* — `T1.5-RATE-LIMIT-AUTH-RESULT.md` + smoke `T1.5-STAGING-SMOKE-RESULT.md`
- [x] Carimbo pós-#379 — **GO** *(esta PR)* — `T379-POST-MERGE-CARIMBO.md`
- [x] T1.6 logout/revoke tokens — **GO** *(esta PR)* — `T1.6-LOGOUT-REVOKE-RESULT.md` + smoke
- [x] Lint warnings turismo −303 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-WARNINGS-REDUCTION.md`
- [x] T1.7 wire turismo AuthContext → `/api/v1/auth/*` — **GO** *(esta PR)* — `T1.7-AUTH-V1-WIRE-RESULT.md`
- [x] Lint AITutor −92 — **GO condicional** *(PR #381)* — `issue-237/LINT-237-TURISMO-AITUTOR-WARNINGS.md`
- [x] Lint voucher-editor + validation −503 — **GO condicional** *(PR #382)* — `issue-237/LINT-237-TURISMO-VOUCHER-VALIDATION-WARNINGS.md`
- [x] Lint voucher-editor dead code −66 — **GO condicional** *(PR #383)* — `issue-237/LINT-237-TURISMO-VOUCHER-DEAD-CODE.md`
- [x] Lint voucher-editor residual −12 — **GO** *(esta PR)* — `issue-237/LINT-237-TURISMO-VOUCHER-RESIDUAL-WARNINGS.md`
- [x] Lint performance module −286 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-PERFORMANCE-MODULE.md`
- [x] Lint upgrades + maps + LearningPaths −254 — **GO condicional** *(PR #392)* — `issue-237/LINT-237-TURISMO-UPGRADES-MAPS-LEARNINGPATHS.md`
- [x] Lint reviews + plans + billing −305 — **GO condicional** *(PR #393)* — `issue-237/LINT-237-TURISMO-REVIEWS-PLANS-BILLING.md`
- [x] Lint videos + photos + notifications −264 — **GO condicional** *(PR #394)* — `issue-237/LINT-237-TURISMO-VIDEOS-PHOTOS-NOTIFICATIONS.md`
- [x] Lint src/pages duplicates (upgrades, workflows, maps) −206 — **GO condicional** *(PR #395)* — `issue-237/LINT-237-TURISMO-SRC-PAGES-DUPLICATES.md`
- [x] Lint SkillsAssessment + DataReplication + src/pages/plans −191 — **GO condicional** *(PR #396)* — `issue-237/LINT-237-TURISMO-SKILLS-BACKUP-PLANS.md`
- [x] Lint refunds + photos duplicate + DisasterRecovery −177 — **GO condicional** *(PR #397)* — `issue-237/LINT-237-TURISMO-REFUNDS-PHOTOS-DISASTERRECOVERY.md`
- [x] Lint RecoveryTesting + TrainingCenter + vouchers + refunds −221 — **GO condicional** *(PR #398)* — `issue-237/LINT-237-TURISMO-RECOVERY-TRAINING-VOUCHERS-REFUNDS.md`
- [x] Lint BackupCenter + marketing + AuditSystem −152 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-BACKUP-MARKETING-AUDIT.md`
- [x] Lint DataProtectionCenter + pages/marketing + src/pages/reviews −148 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-DATAPROTECTION-MARKETING-REVIEWS.md`
- [x] Lint BackupAnalytics + reservations + SecurityCenter −189 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-BACKUPANALYTICS-RESERVATIONS-SECURITY.md`
- [x] Lint api.ts + pages/chat + src/pages/chat −136 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-API-CHAT.md`
- [x] Lint financeiro×2 + pages/vouchers −123 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-FINANCEIRO-VOUCHERS.md`
- [x] Lint AccessControlManager + DocumentationPage + ComplianceManager −121 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-ACCESS-DOC-COMPLIANCE.md`
- [x] Lint contracts×2 + pages/users −117 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-CONTRACTS-USERS.md`
- [x] Lint ServiceDiscovery + OnboardingWizard + MicroservicesManager −115 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-SERVICEDISCOVERY-ONBOARDING-MICROSERVICES.md`
- [x] Lint integracoes-automacao + pagamentos + integracoes-servicos −101 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-INTEGRACOES-PAGAMENTOS.md`
- [x] Lint APIGateway + WebhookManager + ProjectCollaboration −99 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-APIGATEWAY-WEBHOOK-PROJECTCOLLAB.md`
- [x] Lint hotels×2 + users −96 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-HOTELS-USERS.md`
- [x] Lint pagamentos + passeios + hotels-debug −92 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-PAGAMENTOS-PASSEIOS-HOTELS-DEBUG.md`
- [x] Lint useApi + conteudo×2 −88 — **GO condicional** *(PR #411)* — `issue-237/LINT-237-TURISMO-USEAPI-CONTEUDO.md`
- [x] Lint dashboard + tickets + ChatbotAI −87 — **GO condicional** *(esta PR)* — `issue-237/LINT-237-TURISMO-DASHBOARD-TICKETS-CHATBOT.md`
- [x] Lint parques + settings + OptimizationEngine −73 — **GO condicional** *(PR #417)* — `issue-237/LINT-237-TURISMO-PARQUES-SETTINGS-OPTIMIZATION.md`
- [x] Lint PredictiveAnalytics + SmartAutomation + OfflineSupport −72 — **GO condicional** *(PR #418)* — `issue-237/LINT-237-TURISMO-PREDICTIVE-SMART-OFFLINE.md`
- [x] Lint DeployPage + turismo + AIEngine −69 — **GO condicional** *(PR #419)* — `issue-237/LINT-237-TURISMO-DEPLOY-TURISMO-AIENGINE.md`
- [x] Lint TeamManager + hoteis + permissions −67 — **GO condicional** *(PR #420)* — `issue-237/LINT-237-TURISMO-TEAM-HOTEIS-PERMISSIONS.md`
- [x] Lint turismo (pages) + parks + permissions (src) −66 — **GO condicional** *(PR #421)* — `issue-237/LINT-237-TURISMO-PAGES-TURISMO-PARKS-PERMISSIONS.md`
- [x] Lint api-publica + Dashboard + ProcessMonitoring −63 — **GO condicional** *(PR #422)* — `issue-237/LINT-237-TURISMO-API-DASHBOARD-PROCESSMONITORING.md`
- [x] Lint cadastros + security-system-test + TaskAutomation −60 — **GO condicional** *(PR #423)* — `issue-237/LINT-237-TURISMO-CADASTROS-SECURITY-TASKAUTOMATION.md`
- [x] Lint automacao×2 + rsv-360-ecosystem −57 — **GO condicional** *(PR #424)* — `issue-237/LINT-237-TURISMO-AUTOMACAO-RSV-ECOSYSTEM.md`
- [x] Lint ProductionMonitoring + dashboard-personalizado + analytics-avancados −55 — **GO condicional** *(PR #425)* — `issue-237/LINT-237-TURISMO-PRODUCTION-DASHBOARD-ANALYTICS.md`
- [x] Lint animations-demo + backend-integration-test + configuracoes-sistema −54 — **GO condicional** *(PR #426)* — `issue-237/LINT-237-TURISMO-ANIMATIONS-BACKEND-CONFIG.md`
- [x] Lint cotacoes/hoteis + dashboard-personalizado (src) + insurance −54 — **GO condicional** *(PR #427)* — `issue-237/LINT-237-TURISMO-HOTEIS-DASHBOARD-INSURANCE.md`
- [x] Lint integracoes-webhooks + transport + AdvancedReportBuilder −54 — **GO condicional** *(PR #428)* — `issue-237/LINT-237-TURISMO-WEBHOOKS-TRANSPORT-REPORTBUILDER.md`
- [x] Lint GoLiveSystem + HelpSystem + ChatSystem −54 — **GO condicional** *(PR #429)* — `issue-237/LINT-237-TURISMO-GOLIVE-HELP-CHAT.md`
- [x] Lint WorkflowTemplates + visa + configuracoes-gerais −52 — **GO condicional** *(PR #430)* — `issue-237/LINT-237-TURISMO-WORKFLOW-VISA-CONFIG-GERAIS.md`
- [x] Lint visa (src) + BookingCalendar + BookingModal −51 — **GO condicional** *(PR #431)* — `issue-237/LINT-237-TURISMO-VISA-BOOKING-CALENDAR-MODAL.md`
- [x] Lint apiClient + cadastros + gestao −49 — **GO condicional** *(PR #432)* — `issue-237/LINT-237-TURISMO-APICLIENT-CADASTROS-GESTAO.md`
- [x] Lint hotels-complete + reports + travel −48 — **GO condicional** *(PR #433)* — `issue-237/LINT-237-TURISMO-HOTELS-REPORTS-TRAVEL.md`
- [x] Lint chatbot-ia + gestao + reports (src) −48 — **GO condicional** *(PR #434)* — `issue-237/LINT-237-TURISMO-CHATBOT-GESTAO-REPORTS-SRC.md`
- [x] Lint ChatConversations + NotificationManager + PushNotificationSystem −48 — **GO condicional** *(PR #435)* — `issue-237/LINT-237-TURISMO-CHAT-NOTIFICATIONS.md`
- [x] Lint TaskManager + leiloesApi + marketplace −47 — **GO condicional** *(PR #436)* — `issue-237/LINT-237-TURISMO-TASK-LEILOES-MARKETPLACE.md`
- [x] Lint CustomerManagement + FinalDeploySystem + AccountingIntegration −45 — **GO condicional** *(PR #437)* — `issue-237/LINT-237-TURISMO-CUSTOMER-DEPLOY-ACCOUNTING.md`
- [x] Lint documents + groups + TestingPage −42 — **GO condicional** *(PR #438)* — `issue-237/LINT-237-TURISMO-DOCUMENTS-GROUPS-TESTING.md`
- [x] Lint configuracoes-avancadas + configuracoes-usuarios + groups (src) −42 — **GO condicional** *(PR #439)* — `issue-237/LINT-237-TURISMO-CONFIGURACOES-AVANCADAS-USUARIOS-GROUPS.md`
- [x] Lint integracoes-apis + marketplace-parceiros + notification-system-test −42 — **GO condicional** *(PR #440)* — `issue-237/LINT-237-TURISMO-INTEGRACOES-MARKETPLACE-NOTIFICATION.md`
- [x] Lint relatorios-personalizados + DataExportSystem + BackupRecoverySystem −42 — **GO condicional** *(PR #441)* — `issue-237/LINT-237-TURISMO-RELATORIOS-DATAEXPORT-BACKUP.md`
- [x] Lint PerformanceTesting + templates + dashboard-rsv-backup −40 — **GO condicional** *(PR #442)* — `issue-237/LINT-237-TURISMO-PERFORMANCE-TEMPLATES-DASHBOARD-BACKUP.md`
- [x] Lint dashboard-rsv + voice-commerce + e-commerce −39 — **GO condicional** *(PR #443)* — `issue-237/LINT-237-TURISMO-DASHBOARD-RSV-VOICE-ECOMMERCE.md`
- [x] Lint src/documents + src/e-commerce + TutorialSystem −39 — **GO condicional** *(PR #444)* — `issue-237/LINT-237-TURISMO-SRC-DOCUMENTS-ECOMMERCE-TUTORIAL.md`
- [x] Lint TaxManagement + PaymentModal + CustomReportBuilder −39 — **GO condicional** *(PR #445)* — `issue-237/LINT-237-TURISMO-TAX-PAYMENT-CUSTOMREPORT.md`
- [x] Lint authService + visas + workflows −37 — **GO condicional** *(PR #446)* — `issue-237/LINT-237-TURISMO-AUTHSERVICE-VISAS-WORKFLOWS.md`
- [x] Lint ExecutiveDashboard + UserManagement + DocumentationSystem −36 — **GO condicional** *(PR #451)* — `issue-237/LINT-237-TURISMO-EXECUTIVE-USERMGMT-DOCSYSTEM.md`
- [x] Lint FAQSystem + FinancialDashboard + dashboard-reservei-viagens −35 — **GO condicional** *(PR #452)* — `issue-237/LINT-237-TURISMO-FAQ-FINANCIAL-DASHBOARD-RESERVEI.md`

## Decisão Trilha 0

| Campo | Valor |
|-------|--------|
| **Status** | **GO** |
| **Data** | 2026-05-30 |
| **Soak pós-Next 16** | **GO condicional** (encerrado — não reabrir) |
| **Fase E / TS6** | **GO / concluída** (2026-06-13) — ver `FASE-E-TS6-CLOSEOUT.md` |
| **Fase E / TW4 guest** | **GO pós-merge** #330/#331 |
| **Fase E / TW4 admin** | **GO pós-merge** #332/#333 |
| **Montanha `.next/types`** | T0.20c **GO pós-merge** (#353); **0** erros pos-build |
| **Fase E / TW4 site-publico** | T0.21 **GO pós-merge** (#356/#357) |
| **Fase E / TW4 (3 apps canônicos)** | **Encerrada** — `FASE-E-TW4-CLOSEOUT.md` |
| **Fase E / TW4** | **GO / encerrada** — 4/4 apps em **4.3.1** |
| **Fase E / ADR-0003** | **GO / encerrada** — `FASE-E-CLOSEOUT.md` |
| **Dependabot** | **Encerrado** — SEC-01→SEC-06 |
| **HITL pós-Fase E** | **GO** — T0.23 TS turismo selecionado |
| **ADR-0004** | **Aceito** — PLANO-MESTRE Fase 1 |
| **Próximo passo** | warnings por módulo (próximo cluster de volume no turismo) |
