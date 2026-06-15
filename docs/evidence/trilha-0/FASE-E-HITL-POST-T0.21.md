# Fase E — Decisão HITL pós-T0.21 (stack residual)

**Data:** 2026-06-02  
**Base:** `main` @ `d97c2f2da` (merge #357)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Contexto

Após encerramento TW4 nos três apps Next canônicos ([FASE-E-TW4-CLOSEOUT.md](./FASE-E-TW4-CLOSEOUT.md)), restam três candidatos à próxima montanha Fase E:

| Opção | Descrição | Avaliação |
|-------|-----------|-----------|
| **A** | TW4 `apps/turismo` | Único app Next ainda em TW **3.4.19**; continuação natural E3 |
| **B** | Dependabot / security bumps | Trilha **SEC-01→SEC-06 encerrada** — **0 alertas open** |
| **C** | ADR pendente / closeout Fase E | ADR-0003 **Aceito**; closeout global Fase E **após** TW4 turismo |

## Estado dos candidatos

### A — TW4 turismo

| Item | Valor |
|------|-------|
| tailwindcss | **3.4.19** (decl `^3.3.0`) |
| Arquivos TS/TSX | **659** (`pages` + `components` + `src` + `lib`) |
| `tailwind.config.js` | **309** linhas — tokens CSS vars, animações, fontes |
| Build | **Turbopack** (`next build`, sem `--webpack`) |
| `@apply` em CSS | **0** |
| `ignoreBuildErrors` | **true** (débito TS legado) |
| `:3005` / Docker | **200** / **healthy** |
| Baseline build | **PASS** (2026-06-02) |

Artefatos: [logs/tw4-turismo-baseline.tsv](./logs/tw4-turismo-baseline.tsv), [T0.22-TAILWIND4-TURISMO-PREFLIGHT.md](./T0.22-TAILWIND4-TURISMO-PREFLIGHT.md)

### B — Dependabot

| Item | Valor |
|------|-------|
| Trilha security | **Concluída** — [SECURITY-TRAIL-CLOSEOUT.md](../security/SECURITY-TRAIL-CLOSEOUT.md) |
| Dependabot open | **0** (API GitHub 2026-06-02) |
| SEC-01→SEC-06 | **GO** pós-merge |

**Veredito candidato B:** **não selecionado** — trilha fechada; reabrir somente se novos alertas críticos aparecerem.

### C — ADR / closeout Fase E

| Item | Valor |
|------|-------|
| ADR-0003 | **Aceito** (#297) — sem ADR-0004 proposto |
| TS6 | **Concluída** — `FASE-E-TS6-CLOSEOUT.md` |
| Express 5 | **GO** — montanha D encerrada |
| `.next/types` site-publico | **GO** — T0.20 encerrada |
| TW4 | guest/admin/site-publico **GO**; turismo **pendente** |

**Veredito candidato C:** **adiado** — `FASE-E-CLOSEOUT` global somente após T0.22 TW4 turismo (último app Next do monorepo).

## Decisão HITL

| Direção escolhida | Próximo marco |
|-------------------|---------------|
| **TW4 `apps/turismo` (T0.22)** | [T0.22 preflight](./T0.22-TAILWIND4-TURISMO-PREFLIGHT.md) → impl PR dedicada → carimbo |
| Dependabot | **Encerrado** — monitorar; não iniciar nova rodada |
| Closeout Fase E global | **Após** T0.22 GO pós-merge |

**Não misturar** TW4 turismo com security bumps, saneamento TS turismo ou site-publico na mesma PR (ADR-0003 H5).

## Gates baseline (preflight T0.22)

| Gate | Resultado |
|------|-----------|
| build turismo (Turbopack) | **PASS** |
| `:3005` | **200** |
| turismo Docker | **healthy** |
| API P0 | **8/8** |
| type-check turismo | **DEBT** — 842 erros TS (pré-existente; `ignoreBuildErrors: true`; fora de escopo TW4) |
| TW4 canônicos regressão | guest `:3006` **200** · admin `:3004` **200** · site-publico `:3000` **200** |

## Veredito

**HITL Fase E pós-T0.21 = GO** — próxima montanha: **T0.22 TW4 turismo**.

**Próximo:** implementação TW4 turismo em PR dedicada (`chore/t0.22-tw4-turismo`).

---

*Documento de decisão — não altera runtime.*
