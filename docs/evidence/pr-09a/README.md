# PR-09a — Gitleaks CI + allowlist de placeholders

**Branch:** `security/pr-09a-gitleaks`  
**Base:** `main @ a7da0940` (pós-PR-08 #195)  
**Estado:** PARAR na URL (H0)

## Auditoria canônica (pré-GO)

| Item | Status |
| --- | --- |
| PR-07 (07a–07c4) | FECHADO — #194 → `04de9de8` |
| PR-08 | DONE — #195 → `a7da0940` · Gate 5/5 |
| Fase 0 PR-09 | 6 claims MCP verificadas (sem gitleaks pré-existente) |

## Diff

| Arquivo | Papel |
| --- | --- |
| `.gitleaks.toml` | allowlist 6 paths `APP_USR-` + `docs/evidence/**` + regexes placeholder |
| `.github/workflows/gitleaks.yml` | CLI gitleaks fail-closed (`--exit-code 1`); sem `GITLEAKS_LICENSE` |
| `docs/evidence/pr-09a/README.md` | esta evidence |

## Allowlist (paths)

1. `apps/site-publico/ATIVACAO_CREDENCIAIS_PRODUCAO.md`
2. `apps/site-publico/GUIA_MERCADO_PAGO_PASSO_A_PASSO.md`
3. `apps/site-publico/PROXIMOS_PASSOS_MERCADO_PAGO.md`
4. `apps/site-publico/lib/credentials-service.ts`
5. `apps/turismo/pages/reservei/configuracoes.tsx`
6. `NTX + OTAS LEILÕES+ FLASHDEALS/…SPLIT DE PAGAMENTOS….txt` (regex path)

Regexes: `CHANGE_ME_*`, `REDACTED_*`, `demo-token`, máscaras `sk_live_*` / `AKIA*` / `APP_USR-x+`.

## OUT

- Rotação / `.env` / `git filter-repo`
- Endurecer `docker-compose.yml` → **09b**
- Required check no ruleset → **owner**
- `dependency-review` → **09b**

## Validação

```bash
# Local (se CLI instalada):
gitleaks detect --source . --config .gitleaks.toml --verbose --redact --exit-code 1

# Senão: validação = job `gitleaks` no PR
```

**Não** rodar pickaxe que imprima valores de `.env`.
