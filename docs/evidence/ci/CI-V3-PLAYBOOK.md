# CI/CD v3 Playbook — RSV360

**Data:** 2026-06-22

## Jobs adicionados em `.github/workflows/ci.yml`

| Job | Função |
|-----|--------|
| `turismo-eslint-gate` | Falha se warnings turismo > 0 (rank script) |
| `monorepo-build` | `npm run build` após `build:shared` no postinstall |

## Mudanças

- `frontend-typecheck`: removido `continue-on-error: true`
- Root `package.json`: `build:shared` antes de workspaces; postinstall compila `@rsv360/shared`

## Dependabot

- Auto-merge **desligado**
- Triagem: ver `docs/evidence/deps/DEPENDABOT-TRIAGE-2026-06.md`

## CodeQL

Já ativo em `.github/workflows/security.yml`.
