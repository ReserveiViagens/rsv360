# Docker — `rsv360-site-publico` health (2026-05-29)

## Contexto
Pós-merge PR #232. Smoke no host OK; container reportado `unhealthy`.

## Inspeção
```bash
docker inspect rsv360-site-publico --format '{{json .State.Health}}'
```

| Campo | Valor |
|-------|--------|
| Status | `unhealthy` |
| FailingStreak | 1111+ |
| Health log | `Connection refused` (wget spider em `localhost:3000`) |
| Port map | `3000/tcp -> 0.0.0.0:3000` |
| Smoke host | `curl http://127.0.0.1:3000` → **200** |

## Testes adicionais (mesma janela)
```bash
docker exec rsv360-site-publico wget -q -O- http://127.0.0.1:3000   # HTML OK
docker exec rsv360-site-publico wget --spider http://localhost:3000  # verificar na manutenção
```

## Hipótese provável
- **HEALTHCHECK** da imagem (`docker/frontend/Dockerfile`) usa `wget --spider` em `localhost:${APP_PORT}`.
- Processo Next responde no host mapeado, mas o probe interno falha de forma intermitente ou por diferença `localhost` vs `127.0.0.1` / timing / `--spider` vs GET.
- Não bloqueia operação atual (smoke 200); tratar em janela de manutenção.

## Ação recomendada (manutenção)
1. Alinhar HEALTHCHECK ao probe do backend (`127.0.0.1` + path estável, ex. `/api/health` se existir).
2. Aumentar `start-period` se cold start do Next > 45s.
3. Rebuild imagem após ajuste: `docker compose -p rsv360 build site-publico && docker compose -p rsv360 up -d site-publico`.
4. Usar `RSV360_DOCKER_PROJECT` distinto em clones secundários (ver `docs/DOCKER-ISOLATION.md`).

## Evidência bruta
Arquivo gerado a partir de `docker inspect` em 2026-05-29; ver também issue de lint #237 (escopo separado).
