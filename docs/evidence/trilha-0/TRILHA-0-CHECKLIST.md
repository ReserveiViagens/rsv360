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
| **Próximo passo** | Encerramento rodada T0.20 / HITL Fase E (TW4 site-publico ou ADR) |
