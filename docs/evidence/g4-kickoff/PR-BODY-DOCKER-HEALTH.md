## Summary
- Ajusta `HEALTHCHECK` em `docker/frontend/Dockerfile` para frontends Next (incl. `site-publico`).
- Usa `127.0.0.1` + GET (`-O /dev/null`) em vez de `localhost` + `--spider` (evidência: `docs/evidence/2026-05-29-g3/logs/DOCKER-SITE-PUBLICO-HEALTH-2026-05-29.md`).
- `start-period` 45s → 60s para cold start do Next.

## Escopo
Somente probe Docker; **não** altera matriz API nem compose.

## Test plan
- [ ] `docker compose -p rsv360 build site-publico && docker compose -p rsv360 up -d site-publico`
- [ ] `docker inspect rsv360-site-publico --format '{{.State.Health.Status}}'` → `healthy` após warm-up
- [ ] Smoke host `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000` → 200
