# T-WT-SQL — Correção plain text (decisão B + C)

**Data:** 2026-06-12  
**Decisão humana:** B (remover `*.sql` do LFS) + C (normalizar worktree)  
**Branch:** `chore/lfs-sql-dedup`  
**Veredito:** correção de atributos Git/LFS — **não alteração de schema**

## Antes

| Check | Resultado |
|-------|-----------|
| `git lfs ls-files \| findstr .sql` | 0 |
| SQL/init modificados | **20/20** |
| Causa | `*.sql filter=lfs` em `.gitattributes` vs blobs plain no `main` |

## Alteração

Removido `*.sql filter=lfs` global. Adicionado plain text explícito:

```
apps/site-publico/**/*.sql -filter -diff -text
apps/site-publico/lib/migrations/**/*.sql -filter -diff -text
docker/postgres/init.sql -filter -diff -text
```

(`-text` evita conversão EOL que mantinha `init.sql` como modificado.)

## Depois

| Check | Resultado |
|-------|-----------|
| `git add --renormalize` (escopo SQL inventário) | OK |
| SQL/init modificados | **0/20** |
| Conteúdo schema | **inalterado** (sem diff funcional commitado) |

## Comandos executados

```powershell
git checkout -b chore/lfs-sql-dedup origin/main
# editar .gitattributes
git add .gitattributes
git add --renormalize "apps/site-publico/scripts/*.sql" "apps/site-publico/lib/migrations/*.sql" "docker/postgres/init.sql"
git status --porcelain -- <20 paths>
```

## Escopo do commit

- `.gitattributes` somente
- Esta evidência
- **Sem** SQL, PDFs, logs no commit

## PRs relacionados

- #290 (diagnóstico LFS) — superseded por este PR após merge
- Soak: **GO condicional** mantido
