# T-WT-REST — Inventário paths restantes (pós T-WT-SQL)

**Data:** 2026-06-12  
**Base:** `main` @ `70297e622` (pós PR #291)  
**Worktree:** `s2-pr232-validate`  
**Pré-requisito:** T-WT-SQL **DONE** — PR #291 mergeada; #290 fechada (superseded)

**T-WT-SQL veredito:** correção de atributos Git/LFS (`.gitattributes`), **sem alteração de schema**. 20/20 SQL/init limpos no worktree.

## Escopo desta trilha

**25 paths** restantes no worktree sujo — **somente inventário**, sem restore/reset/clean, sem commit de binários/logs.

| Categoria | Qtd | Ação proposta (não aplicada) |
|-----------|-----|------------------------------|
| binário | 2 | Mover para storage local fora do repo; ou `.gitignore` em PR futuro; **não commitar** |
| logs/evidência | 22 | Regeneráveis; deltas locais pós-soak — **não commitar**; baseline no `main` é referência (soak GO condicional encerrado) |
| desconhecido | 1 | `t0.5-push-blocked-workflow-scope.log` — apagar/arquivar localmente; T0.5 mergeada (#287) |

## Detalhe

### binário (2)

| Path | Status | Notas |
|------|--------|-------|
| `NTX + OTAS LEILÔES+ FLASHDEALS/SIDE-SLIDER CIRCLE MENU RSV GEN 2.pdf` | M | Asset design; LFS no `.gitattributes` |
| `NTX + OTAS LEILÔES+ FLASHDEALS/SIDE-SLIDER CIRCLE MENU RSV GEN 2.zip` | M | Idem |

**Ação proposta:** PR futuro `chore/trilha-wt-binaries-gitignore` ou mover para pasta assets externa.

### logs/evidência — g4-kickoff (9)

`docs/evidence/g4-kickoff/logs/A1.log` … `A7p.log`

**Ação proposta:** não versionar deltas locais; `.gitattributes` já tem `-filter` para `docs/evidence/g4-kickoff/logs/*.log`.

### logs/evidência — soak-72h (13)

`docs/evidence/soak-72h/logs/*` (samples 000–006, kickoff, observations)

**Ação proposta:** idem; soak **GO condicional** encerrado — `main` contém evidência oficial.

### desconhecido (1)

| Path | Status | Notas |
|------|--------|-------|
| `docs/evidence/trilha-0/logs/t0.5-push-blocked-workflow-scope.log` | ?? | Log operacional local; irrelevante pós-#287 |

## Gates T-WT-REST

| Gate | Status |
|------|--------|
| G-REST1 Baseline 25 paths | OK |
| G-REST2 Classificação por categoria | OK |
| G-REST3 Nenhuma ação aplicada | OK |
| G-REST4 SQL fora do escopo | OK (0 SQL modificados) |

## Veredito

**INVENTÁRIO COMPLETO** — aguardando decisão humana por grupo (binários vs logs). Nenhuma correção aplicada nesta trilha.

## PRs relacionados

| PR | Status |
|----|--------|
| #289 | MERGED — inventário inicial T-WT |
| #290 | CLOSED — superseded |
| #291 | MERGED — T-WT-SQL plain text |

Soak: **GO condicional** mantido.
