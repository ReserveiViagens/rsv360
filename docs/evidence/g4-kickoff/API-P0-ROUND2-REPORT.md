# API P0 — Rodada 2 (evidência)

**Branch:** `chore/g4-api-p0-round2`  
**Referência:** `API-CONTRACT-MATRIX.md`  
**Rodada 1:** #241 merged · NOGO confirmado pelo operador

## Resumo executivo

| Métrica | Rodada 1 | Rodada 2 |
|---------|----------|----------|
| OK | 6 | **8** |
| FAIL | 1 | **0** |
| GAP | 2 | **0** |
| SKIP | 1 | 1 |

## Veredito

**Bloco G4-API (P0 smoke): GO**

## Correções

| Item | Ação |
|------|------|
| A2 | `GET /health/security` em `SecurityConfig` |
| A3/A6 | Env DB no `site-publico` (`DB_HOST=postgres`, …) |
| A3 (schema) | `database/g4-auth-smoke-tables.sql` — init em volume Postgres + one-shot em clusters existentes |

### One-shot em DB já provisionado

```bash
cat database/g4-auth-smoke-tables.sql | docker exec -i rsv360-postgres psql -U rsv360 -d rsv360
```

## Re-smoke

```bash
bash docs/evidence/g4-kickoff/run-api-p0-round1.sh
```

Snapshot: `logs/API-P0-SUMMARY.tsv` @ 2026-05-29T19:45-03:00 — todos **OK**.

## Deploy local (evidência)

Imagens rebuild: `rsv360-backend`, `rsv360-site-publico`. Containers recriados na rede `rsv360-phase1_default` com env DB (compose `up` em host com volume Postgres existente pode exigir `docker rm` + `up` ou one-shot SQL acima).
