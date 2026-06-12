# Trilha T-WT — Worktree Triage

**Worktree:** `C:\Users\RSV 360\Documents\s2-pr232-validate`  
**Soak:** GO condicional mantido

## Fases

| Fase | Status | PR |
|------|--------|-----|
| T-WT inventário inicial (45 paths) | DONE | #289 |
| T-WT-SQL (20 SQL/init) | **DONE** — atributos Git/LFS, sem schema | #291 |
| T-WT-REST (25 paths) | **INVENTÁRIO** — binários, logs, desconhecido | _este PR_ |

## Regras

- Sem restore, reset, clean
- Ações corretivas em PRs futuros por categoria
- SQL: **0 modificados** pós #291

## Artefatos

| Arquivo | Conteúdo |
|---------|----------|
| [T-WT-INVENTORY.md](./T-WT-INVENTORY.md) | Inventário original (45 paths) |
| [T-WT-SQL-PLAINTEXT-CLOSE.md](./T-WT-SQL-PLAINTEXT-CLOSE.md) | Fechamento T-WT-SQL |
| [T-WT-REST-INVENTORY.md](./T-WT-REST-INVENTORY.md) | 25 paths restantes |
| [logs/T-WT-REST-INVENTORY.tsv](./logs/T-WT-REST-INVENTORY.tsv) | TSV por path |
| [logs/t-wt-rest-baseline-dirty-status.txt](./logs/t-wt-rest-baseline-dirty-status.txt) | Snapshot pós #291 |
