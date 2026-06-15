# HITL pós-Fase E (fora ADR-0003)

**Data:** 2026-06-02  
**Base:** `main` @ `9aae8cc55` (merge #360 — FASE-E-CLOSEOUT)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Contexto

[ADR-0003](./ADR-0003-FASE-E-STACK-RESIDUAL.md) e [FASE-E-CLOSEOUT](./FASE-E-CLOSEOUT.md) encerrados. Três candidatos naturais à próxima montanha:

| Opção | Descrição | Avaliação baseline |
|-------|-----------|-------------------|
| **A** | Lint #237 (admin/site-publico/turismo) | **Bloqueado** — `eslint/package.json` hoist em todos os apps (tooling) |
| **B** | Saneamento TS `apps/turismo` | **842 erros** — perfil espelha T0.20 site-publico (TS2322/TS2786) |
| **C** | Nova ADR — PLANO-MESTRE Fase 1 | Escopo estratégico (identidade/tenant); **proposta** em [ADR-0004](./ADR-0004-PLANO-MESTRE-FASE1-PROPOSTA.md) |

## Estado dos candidatos

### A — Lint #237

| Item | Valor |
|------|-------|
| Histórico | Fases 1–2 (#238/#239) entregaram setup ESLint admin/site-publico |
| G2 pós-#237 | **GO** (21/21) em 2026-05-29 |
| Estado atual worktree | `eslint .` **FAIL** — `Cannot find module 'eslint/package.json'` (guest/admin/turismo/site-publico) |
| turismo warnings legado | ~8233 (T0.8) — **não mensurável** até hoist corrigido |

**Veredito candidato A:** **adiado** — pré-requisito **T0.24 eslint hoist/tooling** antes de retomar redução #237.

Artefatos: [logs/T0.23-lint-admin-baseline.log](./logs/T0.23-lint-admin-baseline.log), [logs/T0.23-lint-turismo-baseline.log](./logs/T0.23-lint-turismo-baseline.log)

### B — TS turismo

| Item | Valor |
|------|-------|
| type-check (`tsc --noEmit`) | **FAIL 842 erros** |
| TS2786 (Radix/JSX) | **150** |
| TS2322 | **275** |
| TS2305 | **80** |
| TS2339 | **66** |
| TS2559 | **63** |
| `ignoreBuildErrors` | **true** (mantido) |
| build / `:3005` | **PASS** / **200** |
| API P0 | **8/8 OK** |

**Veredito candidato B:** **selecionado** — montanha **T0.23** com tracks a→b→c (espelho T0.20).

Artefatos: [logs/T0.23-turismo-ts-baseline.log](./logs/T0.23-turismo-ts-baseline.log), [logs/T0.23-turismo-ts-inventory.tsv](./logs/T0.23-turismo-ts-inventory.tsv), [T0.23-TURISMO-TS-RADIX-PREFLIGHT.md](./T0.23-TURISMO-TS-RADIX-PREFLIGHT.md)

### C — ADR-0004 PLANO-MESTRE Fase 1

| Item | Valor |
|------|-------|
| Referência | ADR-0002 §consequências — Fase 1 identidade/tenant pós-Trilha 0 |
| Issue soak | [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256) G4 → PLANO-MESTRE |
| Escopo | Auth, tenant, financeiro — **fora** débito técnico TS/lint |
| Status proposta | [ADR-0004-PLANO-MESTRE-FASE1-PROPOSTA.md](./ADR-0004-PLANO-MESTRE-FASE1-PROPOSTA.md) — **Proposto** |

**Veredito candidato C:** **proposta documental** — implementação **após** T0.23 (ou em paralelo com war room dedicado).

## Decisão HITL

| Direção | Próximo marco |
|---------|---------------|
| **T0.23 TS turismo** | [T0.23 preflight](./T0.23-TURISMO-TS-RADIX-PREFLIGHT.md) → T0.23a Radix impl → T0.23b/c |
| Lint #237 | **T0.24** eslint hoist — depois retomar #237 |
| PLANO-MESTRE Fase 1 | ADR-0004 **Aceito** — impl T1.x após war room |

**Não misturar** T0.23 com lint, TW4, PLANO-MESTRE impl ou `tsconfig` include na mesma PR.

## Gates baseline (preflight T0.23)

| Gate | Resultado |
|------|-----------|
| build turismo | **PASS** |
| `:3005` | **200** |
| API P0 | **8/8** |
| type-check turismo | **842 erros** (baseline) |
| lint (todos apps) | **BLOCKED** hoist |

## Veredito

**HITL pós-Fase E = GO** — próxima montanha: **T0.23 saneamento TS turismo** (track Radix/JSX primeiro).

**Próximo:** impl `chore/t0.23a-turismo-radix` (espelho T0.20a).

---

*Documento de decisão — não altera runtime.*
