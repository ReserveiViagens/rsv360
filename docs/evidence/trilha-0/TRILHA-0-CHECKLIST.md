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

- [ ] `RSV360_DOCKER_PROJECT` / `COMPOSE_PROJECT_NAME` documentados no `.env`
- [ ] Sem segundo listener Postgres não documentado em `:5432` (ou GAP aceito)
- [ ] `docs/DOCKER-ISOLATION.md` alinhado ao clone em uso

## T0.1 — Inventário React/Next (execução stack upgrade)

- [x] Script `scripts/trilha-0-inventory-react-next.ps1`
- [x] Relatório `T0.1-REACT-NEXT-INVENTORY.md` + `logs/T0.1-INVENTORY.tsv`
- [x] Gaps documentados (site-publico React 18 vs apps React 19)
- [ ] ADR T0.2 stack alvo aprovado
- [ ] Piloto T0.3 (guest ou site-publico)

## Decisão Trilha 0

| Campo | Valor |
|-------|--------|
| **Status** | **GO** |
| **Data** | 2026-05-30 |
| **Próximo passo** | Iniciar soak 72h — preencher janela em `SOAK-72H-PLAN.md` |
