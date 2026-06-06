## Summary
- Rodada 2 G4-API P0: **8/8 OK** (re-smoke em `docs/evidence/g4-kickoff/logs/`).
- `site-publico` no compose: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` + `depends_on: postgres`.
- `GET /health/security` no backend (`SecurityConfig`).
- `database/g4-auth-smoke-tables.sql` para smoke de login (init em Postgres + one-shot documentado).

## Veredito
**G4-API P0: GO** (após merge + deploy com env/SQL)

## Test plan
- [ ] Merge após #241
- [ ] `docker compose up -d --build backend site-publico` (ou one-shot SQL em DB existente)
- [ ] `bash docs/evidence/g4-kickoff/run-api-p0-round1.sh` → 8× OK
- [ ] Validar matriz `API-CONTRACT-MATRIX.md` rodada 2
