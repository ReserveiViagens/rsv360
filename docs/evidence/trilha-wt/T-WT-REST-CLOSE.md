# T-WT-REST — Fechamento decisões humanas

**Data:** 2026-06-12  
**Soak:** GO condicional mantido  
**Regras:** sem restore/reset/clean; sem commit de binários/logs

## PRs mergeadas

| PR | Conteúdo |
|----|----------|
| #292 | Inventário 25 paths |
| #293 | Fechamento decisões iniciais |
| #294 | README storage externo + remoção binários Git |

## Decisões por grupo

### binários (2) — **DONE** (#294)

| Ação | Detalhe |
|------|---------|
| Removidos do Git | PDF/ZIP `SIDE-SLIDER CIRCLE MENU RSV GEN 2.*` |
| README | `NTX + OTAS LEILÔES+ FLASHDEALS/README-ASSETS-EXTERNOS.md` |
| Storage externo | `C:\Users\RSV 360\Documents\RSV360-ARQUIVOS-LOCAIS-FORA-DO-GIT\trilha-wt-rest\2026-06-12\binarios-NTX\` |

**Worktree pós #294:** sem `D/M` em binários.

### desconhecido (1) — **DONE**

`t0.5-push-blocked-workflow-scope.log` → movido para `...\notas-evidencia\` (T0.5 mergeada #287).

### logs/evidência (22) — **DECIDIDO: manter fora de PR**

| Subgrupo | Qtd | Decisão | Ação |
|----------|-----|---------|------|
| g4-kickoff | 9 | **A** — fora de PR | Deltas locais preservados |
| soak-72h | 13 | **A** — fora de PR | Deltas locais preservados |

**Justificativa:** soak encerrado GO condicional; API P0 e relatório final consolidados no `main`. Logs locais são regeneráveis/duplicatas — **não commitar**, **sem PR de logs**, limpeza manual futura se aprovada.

## Estado worktree (2026-06-12 pós #294)

| Categoria | Git status | Notas |
|-----------|------------|-------|
| SQL/init | limpo | T-WT-SQL #291 |
| binários | limpo | T-WT-REST #294 |
| logs | **22× `M`** | intencional — preservados localmente |
| untracked | 0 | t0.5 log movido |

## Veredito T-WT-REST

**ENCERRADO** — inventariado e decidido. Limpeza manual de logs: **opcional futura**.

## T-WT completo

| Trilha | Veredito | PR |
|--------|----------|-----|
| T-WT-SQL | Atributos Git/LFS, sem schema | #291 |
| T-WT-REST binários | README + remoção Git | #294 |
| T-WT-REST logs | Fora de PR, local preservado | — |
| **T-WT geral** | **ENCERRADO** | #289–#294 |
