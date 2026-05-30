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
- [ ] **G1 dual-system = GO** (S1 `:5000` + rede unificada)

## T0 — Estabilidade runtime

- [ ] `docker compose -p rsv360 up -d` sem conflito de nome de container
- [ ] `site-publico` container **healthy** ≥ 5 min
- [ ] `backend` container **healthy**
- [ ] `postgres` container **healthy**
- [ ] `site-publico` + `postgres` na **mesma rede** Docker do projeto
- [ ] Smoke: `:3002/health` → 200
- [ ] Smoke: `:3000/` → 200
- [ ] `logs/TRILHA0-PREFLIGHT.tsv` sem FAIL em checks S2

## T1 — Rollback readiness

- [ ] `pg_dump` testado (ver `TRILHA-0-ROLLBACK-RUNBOOK.md`)
- [ ] Tag/commit de rollback identificado (`main` pré-deploy ou imagem anterior)
- [ ] Procedimento parar → restore → subir → smoke documentado
- [ ] Drill registrado em `logs/` (opcional: reutilizar G3 `ROLLBACK-DRILL-RESULT.txt`)

## T2 — Observabilidade mínima

- [ ] Prometheus container **Up** (rede interna)
- [ ] Grafana container **Up** (ou justificativa de exposição host)
- [ ] Logs backend acessíveis (`docker logs` ≤ 100 linhas sem crash loop)
- [ ] Critérios em `TRILHA-0-OBSERVABILITY.md` revisados

## T3 — Isolamento e drift

- [ ] `RSV360_DOCKER_PROJECT` / `COMPOSE_PROJECT_NAME` documentados no `.env`
- [ ] Sem segundo listener Postgres não documentado em `:5432` (ou GAP aceito)
- [ ] `docs/DOCKER-ISOLATION.md` alinhado ao clone em uso

## Decisão Trilha 0

| Campo | Valor |
|-------|--------|
| **Status** | GO / NOGO |
| **Data** | |
| **Próximo passo** | Soak 72h (`SOAK-72H-PLAN.md`) se GO |
