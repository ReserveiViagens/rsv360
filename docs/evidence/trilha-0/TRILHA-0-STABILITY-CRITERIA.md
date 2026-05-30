# Trilha 0 — Critérios de estabilidade

Perfil canônico: **Docker Compose** `rsv360` (ver `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md`).

## Serviços obrigatórios

| Serviço | Porta host | Health esperado |
|---------|------------|-----------------|
| `backend` | 3002 | `GET /health` → 200; probe Docker **healthy** |
| `site-publico` | 3000 | HTTP `/` → 200; probe **healthy** (#245 `/healthcheck.sh`) |
| `postgres` | 5432 | `pg_isready` **healthy** |
| `redis` | 6379 | container **Up** (backend pode usar `REDIS_DISABLED=true`) |

## Serviços recomendados (não bloqueiam T0 se unhealthy documentado)

| Serviço | Nota |
|---------|------|
| `admin`, `turismo`, `guest` | Podem estar `unhealthy` no probe legado; smoke host 200 é referência |
| `prometheus`, `grafana` | T2 observabilidade |

## Rede Docker

**Obrigatório:** `site-publico` e `postgres` compartilham rede do **mesmo** `COMPOSE_PROJECT_NAME`.

```bash
docker network inspect rsv360_default --format '{{range .Containers}}{{.Name}} {{end}}'
```

Deve listar `rsv360-site-publico` e `rsv360-postgres` (nomes com prefixo do projeto).

## Estabilidade temporal

| Critério | Limiar |
|----------|--------|
| Health `healthy` contínuo | ≥ 5 min após `up` |
| Restart count | 0 novos restarts em 5 min |
| FailingStreak health | 0 quando avaliado |

## Comando canônico de subida

```bash
cd s2-pr232-validate
cp -n .env.example .env   # se necessário
docker compose -p rsv360 up -d --build backend site-publico postgres redis
# one-shot DB auth (volume existente):
# cat database/g4-auth-smoke-tables.sql | docker exec -i rsv360-postgres psql -U rsv360 -d rsv360
```
