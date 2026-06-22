# Branch protection — aplicação manual

Repo privado: configurar via **GitHub → Settings → Branches**.

## `main`

- [ ] Require pull request + 1 approval
- [ ] Require status checks: `CI`, `CodeQL` (quando disponível)
- [ ] Block force push
- [ ] Require CODEOWNERS review (`.cursor/`, `AGENTS.md`)

## `develop`

- [ ] Require PR + CI verde (regras leves)

Ver [`.github/BRANCH_PROTECTION.md`](../../.github/BRANCH_PROTECTION.md).
