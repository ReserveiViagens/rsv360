# T3 — Isolamento Docker (fechamento pós-Next 16)

**Data:** 2026-06-08  
**Clone:** `s2-pr232-validate` (worktree `C:\Users\RSV 360\Documents\s2-pr232-validate`)  
**Compose project:** `rsv360`

## Checklist T3

| Item | Resultado | Evidência |
|------|-----------|-----------|
| `RSV360_DOCKER_PROJECT` / `COMPOSE_PROJECT_NAME` documentados | **OK** | `.env.example` L13–14; `docs/DOCKER-ISOLATION.md` |
| Segundo listener Postgres `:5432` | **GAP aceito** | Windows `postgres` PID + Docker `rsv360-postgres` — ver abaixo |
| `docs/DOCKER-ISOLATION.md` alinhado ao clone | **OK** | Seção worktree adicionada 2026-06-08 |

## Postgres `:5432` (GAP aceito)

| Listener | PID / origem | Notas |
|----------|--------------|-------|
| `0.0.0.0:5432` | **4992** — serviço Windows `postgres` | Stack legado host |
| Docker publish | **6892** — `com.docker.backend` → `rsv360-postgres` | **Canônico S2 / soak / API backend** |

**Decisão:** manter GAP documentado (#251). Stack `docker compose -p rsv360` usa container `rsv360-postgres`. Ferramentas host devem usar `:5433` quando apontarem ao PG Windows (ver `POSTGRES-5432-INVENTORY.md`).

## Variáveis canônicas (clone principal)

```env
COMPOSE_PROJECT_NAME=rsv360
RSV360_DOCKER_PROJECT=rsv360
```

Operação diária: `docker compose -p rsv360 up -d` (ou `--env-file .env`).
