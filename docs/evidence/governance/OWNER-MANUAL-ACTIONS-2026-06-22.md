# Owner manual actions — execução 2026-06-22

| Ação | Resultado |
|------|-----------|
| Branch protection `main`/`develop` | ⛔ Bloqueado: API 403 (repo privado sem Pro). UI requer login owner — ver `BRANCH-PROTECTION-APPLY-MANUAL.md` |
| Cursor Automation go-live | ⚠️ Smoke/hooks OK; automação **Find critical bugs** requer UI Cursor (checklist atualizado) |
| PR #229 merge | ✅ Fechada como **superseded** — ESLint já na `main` (0 errors admin/guest lint) |
| #195 rotação secrets | ✅ Plano **aprovado** em `SECRETS-ROTATION-APPROVAL.md`; execução **não** iniciada |
| #543 nodemailer 9 | ✅ Staging smoke PASS → **merged** (#543 → `main` 2026-06-22) |

## PRs / issues

- #229 closed (superseded)
- #543 merged
- #195: comentário de aprovação pendente no issue (via gh)
