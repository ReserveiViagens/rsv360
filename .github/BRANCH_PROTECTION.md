# Branch Protection — RSV360

Configuração recomendada no GitHub para alinhar com **Enterprise Automation Rules v2**.

> Branch protection é configurada no GitHub (Settings → Branches), não via arquivo no repo. Use este guia como checklist.

## Branches protegidas

| Branch | Proteção mínima |
|--------|-----------------|
| `main` / `master` | Review + CI verde + sem force push |
| `develop` / `development` | Review + CI verde |

## Regras recomendadas (main)

- [ ] Require a pull request before merging
- [ ] Require approvals: **≥ 1** (≥ 2 para migrations ou auth)
- [ ] Dismiss stale pull request approvals when new commits are pushed
- [ ] Require review from Code Owners (paths `.cursor/`, `AGENTS.md`, migrations)
- [ ] Require status checks to pass: `ci`, `lint`, `test`, `build` (conforme workflows ativos)
- [ ] Require branches to be up to date before merging
- [ ] Do not allow bypassing the above settings
- [ ] Restrict force pushes
- [ ] Restrict deletions

## Regras recomendadas (develop)

- [ ] Require PR + 1 approval
- [ ] Require CI verde
- [ ] Sem auto-merge para PRs criadas por automação Cursor

## Automação Cursor

- **Nunca** habilitar auto-merge no template Find critical bugs
- PRs do agente devem passar pelo mesmo gate que PRs humanas

## Comandos úteis (gh CLI)

Substitua `main` pela branch default do repo:

```bash
gh api repos/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/branches/main/protection
```

Para configurar via UI: **Settings → Branches → Add rule → Branch name pattern: `main`**.

## CODEOWNERS

Alterações em `.cursor/**`, `AGENTS.md` e `docs/cursor/**` exigem review de `@ReserveiViagens/devops-team` e `@ReserveiViagens/core-team` (ver `.github/CODEOWNERS`).
