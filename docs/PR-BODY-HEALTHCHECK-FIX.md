## Summary
- Complementa **#242**: `HEALTHCHECK` do Docker **não expande** `${APP_PORT}` / `${PORT}` na instrução `CMD`.
- Gera `/healthcheck.sh` no build com porta do `ARG APP_PORT` (ex.: 3000 para `site-publico`).

## Validação local
```bash
docker inspect rsv360-site-publico --format '{{.State.Health.Status}}'
# healthy
```

## Test plan
- [ ] Merge
- [ ] `docker compose -p rsv360 build site-publico && docker compose -p rsv360 up -d --no-deps site-publico`
- [ ] Confirmar `healthy` após ~60s (`start-period`)
