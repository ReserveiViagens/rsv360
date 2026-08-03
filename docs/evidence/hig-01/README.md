# HIG-01 — CodeQL workflow-level “fail-fast” (5–7s)

**Branch:** `ci/hyg-01-codeql-failfast`  
**Base:** `main @ ac35de91`

## Causa raiz (evidência API)

O check PR chamado **`CodeQL`** que fecha em **5–7s** **não** é um segundo workflow Actions.

| Check | App | Duração típica | Significado |
| --- | --- | --- | --- |
| `Analyze (javascript-typescript)` | `github-actions` | ~5–6 min | Job real de `.github/workflows/security.yml` |
| `CodeQL` | `github-advanced-security` | ~5–7 s | Gate de **alertas novos** no diff do PR |

Provas (commits de PRs):

| PR | Tip | GHAS `CodeQL` | Título do check | Analyze |
| --- | --- | --- | --- | --- |
| #200 | `0ced3710` | **failure** | “5 new alerts including 4 high…” | success |
| #202 | `787e0dea` | **failure** | “1 new alert including 1 high…” | success |
| #201 | `723c16b9` | **success** | “No new alerts in code changed…” | success |
| #203 | `774b0eef` | **success** | (sem alertas novos) | success |

Default Code Scanning setup no repo: **`not-configured`**. Não há duplicidade com default setup. Só existe o advanced workflow em `.github/workflows/security.yml`.

## O que NÃO fazer

- Remover o workflow CodeQL / Analyze → perde análise real.
- Tratar o FAIL de 5–7s como flake de runner → é gate de alertas.

## Correção nesta PR (mínima, só CI)

1. Renomear workflow `CodeQL` → **`CodeQL Analysis`** (evita confusão com o check GHAS homônimo).
2. Comentário no topo do YAML documentando os dois checks.
3. Esta evidence.

## Ação do owner (Settings — fora do Cursor)

Se o objetivo for **não** falhar o check GHAS em alertas medium/high (ou só bloquear critical):

1. GitHub → **Settings** → **Code security** → **Code scanning**.
2. Ajustar política de checks em PRs / rulesets de severity (org/repo conforme plano).
3. Triar alertas abertos em Security → Code scanning (ex.: anotações em PRs de auth).

**Em paralelo (HIG monorepo-build):** Ruleset `main-required-checks` → adicionar context **`monorepo-build`** aos required status checks (hoje só `backend-typecheck`).

## OUT

Produto (`apps/`/`backend/`/`packages/`) · 16d · 10c · merge (H0)
