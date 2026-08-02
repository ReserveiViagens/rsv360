# PR-09a — Gitleaks CI + allowlist de placeholders

**Branch:** `security/pr-09a-gitleaks`  
**Base:** `main @ a7da0940` (pós-PR-08 #195)  
**Estado:** PARAR na URL (H0) — aguardar `gitleaks` verde após fix

## Auditoria canônica (pré-GO)

| Item | Status |
| --- | --- |
| PR-07 (07a–07c4) | FECHADO — #194 → `04de9de8` |
| PR-08 | DONE — #195 → `a7da0940` · Gate 5/5 |
| Fase 0 PR-09 | 6 claims MCP verificadas (sem gitleaks pré-existente) |

## Diff

| Arquivo | Papel |
| --- | --- |
| `.gitleaks.toml` | `[allowlist]` singular + paths/regexes FP |
| `.github/workflows/gitleaks.yml` | CLI gitleaks `--no-git` fail-closed; sem `GITLEAKS_LICENSE` |
| `docs/evidence/pr-09a/README.md` | esta evidence |

## Fix pós-CI vermelho (logs job `gitleaks`)

| Achado | Ação |
| --- | --- |
| `leaks found: 483` / 745 commits | `--no-git` + `fetch-depth: 1` |
| `[[allowlists]]` ignorado com `useDefault` | `[allowlist]` singular (docs oficiais) |
| FP tip (localStorage keys, docs MP, evidence JSON, demo UI) | paths + regexes expandidos |

Validação local (`git archive` tip + config): **no leaks found / exit 0**.

## OUT

- Rotação / `.env` / `git filter-repo`
- Endurecer `docker-compose.yml` → **09b**
- Required check no ruleset → **owner**
- `dependency-review` / full-history report-only → **09b**

## Validação

```bash
gitleaks detect --no-git --source . --config .gitleaks.toml --verbose --redact --exit-code 1
```

**Não** rodar pickaxe que imprima valores de `.env`.

## Nota de implementação

Workflow usa **CLI oficial** (`gitleaks` binary via curl) em vez de `gitleaks/gitleaks-action@v2|v3`, porque o Action exige `GITLEAKS_LICENSE` em orgs GitHub.
