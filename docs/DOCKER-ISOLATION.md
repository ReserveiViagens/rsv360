# Isolamento Docker entre clones (RSV360)

## Problema
Vários clones do monorepo no mesmo host compartilhavam nomes fixos (`rsv360-postgres`, `rsv360-site-publico`, …), gerando conflito ao subir `docker compose` em paralelo.

## Padrão canônico

| Variável | Uso |
|----------|-----|
| `COMPOSE_PROJECT_NAME` | Projeto Compose (redes, labels, volumes sem `name:` explícito). Definir no `.env` ou exportar no shell. |
| `RSV360_DOCKER_PROJECT` | Prefixo de `container_name` no `docker-compose.yml` (padrão: `rsv360`). |

### Clone principal (dev diário)
```bash
# .env
COMPOSE_PROJECT_NAME=rsv360
RSV360_DOCKER_PROJECT=rsv360

docker compose --env-file .env -p rsv360 up -d
```

### Clone secundário (validação / worktree)
```bash
# .env — prefixo único por pasta
COMPOSE_PROJECT_NAME=rsv360-wt-validate
RSV360_DOCKER_PROJECT=rsv360-wt-validate

docker compose --env-file .env up -d
```

### Worktree em uso (2026-06-08)

| Campo | Valor |
|-------|--------|
| Pasta | `C:\Users\RSV 360\Documents\s2-pr232-validate` |
| Git worktree | `.git\worktrees\s2-pr232-validate` |
| Project Compose | **`rsv360`** (stack principal dev — não usar prefixo `-wt-validate` neste host) |
| Evidência T3 | `docs/evidence/trilha-0/T3-ISOLAMENTO-DOCKER-CLOSE.md` |

**Importante:** alterar `RSV360_DOCKER_PROJECT` cria containers novos; não recrie o stack principal sem necessidade.

## Portas
Portas publicadas (`3000`, `3002`, `5432`, …) continuam globais no host. Para dois stacks simultâneos, use override local com portas diferentes (ex. `3001:3000`) — fora do escopo do compose base.

## Referências
- `docker-compose.yml` — `container_name: ${RSV360_DOCKER_PROJECT:-rsv360}-<serviço>`
- `.env.example` — bloco Docker isolation
