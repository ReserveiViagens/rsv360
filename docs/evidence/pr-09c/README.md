# PR-09c — gitleaks full-history report-only

**Branch:** `security/pr-09c-gitleaks-history`  
**Baseline:** `20c680209753bc90227ab87666fad82473e2d8b3` (pós-#234; paralelo ao #235 followup-e)

## Escopo

- Novo workflow [`.github/workflows/gitleaks-history.yml`](../../.github/workflows/gitleaks-history.yml):
  - `fetch-depth: 0` (histórico completo)
  - `--redact` + JSON artifact
  - `--exit-code 0` + `continue-on-error: true` (**nunca** fail-closed)
  - triggers: `workflow_dispatch`, weekly cron, PR path filter
- Tip-tree fail-closed [`gitleaks.yml`](../../.github/workflows/gitleaks.yml) **inalterado** (só comentário → 09c)
- Comentário em `.gitleaks.toml` atualizado

## OUT

- Tornar histórico required / fail-closed
- Rotação de secrets (ops)
- Required checks ruleset

## Como rodar local (owner)

```bash
gitleaks detect --source . --config .gitleaks.toml --redact --report-path /tmp/gl.json --report-format json --exit-code 0
```

Não versionar o JSON bruto no repo (pode conter metadados sensíveis mesmo redacted). Artifact CI retém 14 dias.

## Risco

- Blast: só CI/docs. Sem runtime.
- Histórico pode reportar centenas de FPs/dead secrets — esperado; não bloqueia merge.

## Rollback

Remover `gitleaks-history.yml` / reverter comentários.
