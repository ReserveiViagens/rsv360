## Summary
- Preenche `docs/evidence/g4-kickoff/API-CONTRACT-MATRIX.md` com status real (OK/GAP/FAIL) da rodada 1 P0.
- Anexa logs em `docs/evidence/g4-kickoff/logs/` (A1–A7p + `API-P0-SUMMARY.tsv`).
- Script reprodutível: `run-api-p0-round1.sh`.
- Exceção `.gitignore` + `.gitattributes` para versionar evidência G4 sem LFS nos smokes.

## Veredito (rodada 1)
**G4-API: NOGO** — 6 OK, 1 FAIL (A3 login 500), 2 GAP (A2 `/health/security` 404, A6 CMS sem `DATABASE_URL` no compose).

## Test plan
- [ ] Revisar matriz e logs por fluxo P0
- [ ] Validar GO/NOGO do bloco API para G4
- [ ] Rodada 2 em PRs separadas (compose + A2)
