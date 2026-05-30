## Summary
- Pacote base **Trilha 0** (estabilidade, rollback, observabilidade, snapshot gates).
- Scripts `run-trilha0-preflight.sh` / `.ps1`.
- Plano formal **soak 72h** (rascunho, pós Trilha 0).
- Atualiza referência em `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md`.

## Escopo
Somente documentação + preflight — **não** inicia soak nem fecha G1.

## Pré-requisitos para executar Trilha 0
- G1 dual-system **GO** (S1 up + `docker compose -p rsv360` unificado)
- Merge #246 já em `main`

## Test plan
- [ ] Revisar checklist `TRILHA-0-CHECKLIST.md`
- [ ] Executar preflight após G1 GO
- [ ] Decisão Trilha 0 GO/NOGO antes de soak
