# T-WT-REST — Fechamento decisões humanas

**Data:** 2026-06-12  
**PR inventário:** #292 **MERGED** (`cb77d3202`)  
**Soak:** GO condicional mantido  
**Regras:** sem restore/reset/clean; sem commit de binários/logs

## Decisões aplicadas (somente movimentação física)

| Grupo | Decisão | Ação | Destino |
|-------|---------|------|---------|
| binário (2) | Mover fora do repo | **MOVIDO** | `C:\Users\RSV 360\Documents\RSV360-ARQUIVOS-LOCAIS-FORA-DO-GIT\trilha-wt-rest\2026-06-12\binarios-NTX\` |
| | | `SIDE-SLIDER CIRCLE MENU RSV GEN 2.pdf` | idem |
| | | `SIDE-SLIDER CIRCLE MENU RSV GEN 2.zip` | idem |
| logs/evidência (22) | Não commitar; manter local | **MANTIDO** | worktree `s2-pr232-validate` (deltas locais) |
| desconhecido (1) | Mover para notas pessoal | **MOVIDO** | `...\trilha-wt-rest\2026-06-12\notas-evidencia\t0.5-push-blocked-workflow-scope.log` |

## Git status pós-ação (esperado)

- **22 logs** — ainda `M` (mantidos localmente, não commitados)
- **2 binários** — ` D` (deletados do worktree após move; **não** restaurados do Git)
- **t0.5 log** — removido do untracked (movido para fora)

## Veredito T-WT-REST

| Fase | Status |
|------|--------|
| Inventário #292 | **DONE** |
| Decisão binários | **DONE** — preservados fora do Git |
| Decisão logs | **ADIADO** — limpeza manual futura |
| Decisão t0.5 log | **DONE** — arquivado fora do repo |

**Próximo (opcional):** limpeza manual dos 22 logs quando aprovado; PR futuro `.gitignore` para pasta NTX se necessário.

## T-WT completo

| Trilha | Veredito |
|--------|----------|
| T-WT-SQL | Correção atributos Git/LFS (#291) — sem schema |
| T-WT-REST | Inventário + decisões (#292) — binários/log t0.5 movidos |
