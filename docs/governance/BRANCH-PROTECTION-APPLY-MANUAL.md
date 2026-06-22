# Branch protection — aplicação manual

Repo privado: configurar via **GitHub → Settings → Branches**.

**Tentativa automática (2026-06-22):** API `GET/PUT .../branches/main/protection` → **HTTP 403** — *Upgrade to GitHub Pro or make this repository public*. Browser MCP sem sessão GitHub → página 404. **Ação restante: owner autenticado na UI.**

## `main`

- [ ] Require pull request + 1 approval
- [ ] Require status checks: `CI`, `CodeQL` (quando disponível)
- [ ] Block force push
- [ ] Require CODEOWNERS review (`.cursor/`, `AGENTS.md`)

### Passos na UI (copiar/colar)

1. https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/settings/branches
2. **Add branch protection rule** → pattern: `main`
3. ☑ Require a pull request before merging → **1** approval
4. ☑ Require review from Code Owners
5. ☑ Require status checks → selecionar workflows `CI`, `CodeQL` (se listados)
6. ☑ Require branches to be up to date
7. ☑ Do not allow bypassing
8. ☑ Block force pushes + restrict deletions

## `develop`

- [ ] Require PR + CI verde (regras leves)

Ver [`.github/BRANCH_PROTECTION.md`](../../.github/BRANCH_PROTECTION.md).
