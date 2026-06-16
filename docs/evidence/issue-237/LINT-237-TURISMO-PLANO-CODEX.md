# Lint #237 — Plano completo turismo (handoff Codex)

**Issue:** [#237](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/237)  
**App:** `apps/turismo`  
**Atualizado:** 2026-06-02 (cluster #1 concluído)  
**Baseline global:** **3055** warnings (excl. `voucher-editor` + `validation.tsx`)  
**Arquivos com débito:** **360**  
**Clusters planejados:** **120** (−3141 total)  
**Máquina de clusters:** `apps/turismo/scripts/lint-237-clusters.json` (gerar: `node scripts/lint-237-generate-clusters.cjs`)

## Status executivo

| Métrica | Valor |
|---------|-------|
| Warnings globais | **3055** |
| Clusters concluídos | **1** / 120 |
| PR empilhada mais recente | **#413** (cluster #1, −86) |
| Branch ativa | `chore/lint-turismo-integration-project-atracoes` |
| Próximo cluster | **#2** — dashboard-master + hotels-funcional + FinancialAnalytics (−84) |

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

## Clusters 1–20 (próximos na fila)

| # | Δ | Arquivos | Status |
|---|-----|----------|--------|
| 1 | −86 | IntegrationHub, ProjectTimeline, cotacoes/atracoes | **concluído** (#413) |
| 2 | −84 | dashboard-master, hotels-funcional, FinancialAnalytics | **em andamento** |
| 3 | −82 | Sidebar, customers-rsv, NotificationsPage | pendente |
| 4 | −78 | customers-complete, AdvancedCharts, ApprovalSystem | pendente |
| 5 | −73 | cotacoes/parques, settings, OptimizationEngine | pendente |
| 6 | −72 | PredictiveAnalytics, SmartAutomation, OfflineSupport | pendente |
| 7 | −69 | DeployPage, turismo (src), AIEngine | pendente |
| 8 | −67 | TeamManager, cotacoes/hoteis, permissions (pages) | pendente |
| 9 | −66 | turismo (pages), parks, permissions (src) | pendente |
| 10 | −63 | api-publica, Dashboard, ProcessMonitoring | pendente |
| 11 | −60 | cadastros, security-system-test, TaskAutomation | pendente |
| 12 | −57 | automacao×2, rsv-360-ecosystem | pendente |
| 13 | −55 | ProductionMonitoring, dashboard-personalizado, analytics-avancados | pendente |
| 14 | −54 | animations-demo, backend-integration-test, configuracoes-sistema | pendente |
| 15 | −54 | cotacoes/hoteis, dashboard-personalizado, insurance | pendente |
| 16 | −54 | integracoes-webhooks, transport, AdvancedReportBuilder | pendente |
| 17 | −54 | GoLiveSystem, HelpSystem, ChatSystem | pendente |
| 18 | −52 | WorkflowTemplates, visa, configuracoes-gerais | pendente |
| 19 | −51 | visa (src), BookingCalendar, BookingModal | pendente |
| 20 | −49 | apiClient, cadastros, gestao | pendente |

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

- [x] Clusters **1** (3055 warnings restantes)
- [ ] Clusters **2–120**
- [ ] Atualizar este doc após cada PR (global, PR#, branch)
- [ ] Fechar issue #237 quando global ≈ 0 ou plano de exceções aprovado
