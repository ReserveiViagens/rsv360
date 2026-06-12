# T-WT — Inventário worktree sujo

**Snapshot:** 2026-06-12  
**Total paths:** 45 (44 modificados + 1 não rastreado)  
**HEAD:** `6f5850c5f` (= `origin/main`)

Nenhuma ação corretiva foi aplicada nesta trilha.

## Resumo por categoria

| Categoria | Qtd | Ação proposta (não aplicada) |
|-----------|-----|------------------------------|
| binário | 2 | Manter fora do Git; mover para storage local ou `.gitignore` dedicado; nunca commitar no monorepo |
| SQL/migration | 19 | `git diff` arquivo a arquivo vs `main`; se intencional → PR `chore/schema-*` dedicado; se ruído → descarte manual após revisão humana |
| runtime/config | 1 | Diff `docker/postgres/init.sql`; alinhar com decisão do grupo SQL antes de qualquer PR |
| logs/evidência | 22 | Regeneráveis; não commitar deltas locais; baseline preservado neste inventário |
| docs | 0 | — |
| desconhecido | 1 | `t0.5-push-blocked-workflow-scope.log` — log operacional T0.5; arquivar ou apagar localmente após PR #288 |

## Detalhe por grupo

### binário (2)

| Path | Status | Notas |
|------|--------|-------|
| `NTX + OTAS LEILÔES+ FLASHDEALS/SIDE-SLIDER CIRCLE MENU RSV GEN 2.pdf` | M | Asset de design; não pertence ao repo de código |
| `NTX + OTAS LEILÔES+ FLASHDEALS/SIDE-SLIDER CIRCLE MENU RSV GEN 2.zip` | M | Idem |

**Ação proposta:** mover para pasta de assets fora do clone ou adicionar padrão ao `.gitignore` em PR futuro (`chore/trilha-wt-gitignore-binaries`).

### SQL/migration (19)

19 arquivos em `apps/site-publico/scripts/*.sql` e `apps/site-publico/lib/migrations/create-onboarding-table.sql`.

**Ação proposta:** rodar `git diff --stat` e revisar em lote; separar scripts que refletem schema real de cópias/edições acidentais. Commits somente via branch dedicada após revisão DBA.

### runtime/config (1)

| Path | Status | Notas |
|------|--------|-------|
| `docker/postgres/init.sql` | M | Init Postgres Docker; acoplado ao schema |

**Ação proposta:** diff vs `main`; se mudanças espelham SQL de site-publico, unificar decisão num único PR de schema.

### logs/evidência (22)

- `docs/evidence/g4-kickoff/logs/` — 9 arquivos (A1–A7)
- `docs/evidence/soak-72h/logs/` — 13 arquivos (samples + kickoff)

**Ação proposta:** não versionar alterações locais pós-soak; logs no `main` são baseline oficial. Deltas locais podem ser descartados manualmente **após** confirmação de que `main` contém evidência fechada (GO condicional soak).

### desconhecido (1)

| Path | Status | Notas |
|------|--------|-------|
| `docs/evidence/trilha-0/logs/t0.5-push-blocked-workflow-scope.log` | ?? | Log local do bloqueio PAT; T0.5 já mergeada (#287) |

**Ação proposta:** deletar localmente ou mover para notas pessoais; não commitar.

## Gates T-WT

| Gate | Status |
|------|--------|
| G-WT1 Baseline salvo | OK |
| G-WT2 100% paths classificados | OK (45/45) |
| G-WT3 Nenhuma ação aplicada sem branch dedicada | OK |
| G-WT4 Veredito documentado | OK — **INVENTÁRIO COMPLETO** |

## Próximos passos (fora deste PR)

1. Merge PR inventário T-WT
2. Revisão humana grupo SQL (diff)
3. Decisão binários (mover / gitignore)
4. Limpeza manual opcional de logs locais — **somente após** confirmação explícita
