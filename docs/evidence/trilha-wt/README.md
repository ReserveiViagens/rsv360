# Trilha T-WT — Worktree Triage

**Data abertura:** 2026-06-12  
**Worktree:** `C:\Users\RSV 360\Documents\s2-pr232-validate`  
**Base Git:** `main` @ `6f5850c5f` (pós PR #287)

## Objetivo

Inventariar e classificar alterações locais **não commitadas** no worktree de validação S2, sem `git restore`, `git reset` ou `git clean`.

## Regras

- **Proibido** nesta trilha: restore, reset, clean, commit de SQL/PDFs/logs misturados com trilhas de stack (T0.x)
- **Permitido:** inventário, diff, classificação, proposta de ação por grupo
- Ações corretivas ficam em PRs/branches **futuros** por categoria
- Soak: **GO condicional** mantido (não reaberto)
- T0.5: **GO** fechado via PR #287 + PR #288 (docs)

## Artefatos

| Arquivo | Conteúdo |
|---------|----------|
| [T-WT-INVENTORY.md](./T-WT-INVENTORY.md) | Resumo por categoria + ações propostas |
| [logs/T-WT-INVENTORY.tsv](./logs/T-WT-INVENTORY.tsv) | Um registro por path |
| [logs/t-wt-baseline-dirty-status.txt](./logs/t-wt-baseline-dirty-status.txt) | Snapshot `git status --porcelain` |

## Status

**INVENTÁRIO** — classificação concluída; nenhuma ação aplicada.
