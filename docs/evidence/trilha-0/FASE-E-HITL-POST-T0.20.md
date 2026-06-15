# Fase E — Decisão HITL pós-T0.20 (stack residual)

**Data:** 2026-06-02  
**Base:** `main` @ `1322e0aae`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Contexto

Após [T0.20-RODADA-ENCERRAMENTO.md](./T0.20-RODADA-ENCERRAMENTO.md) (`.next/types` **0 erros**), a [FASE-E-TS6-CLOSEOUT.md](./FASE-E-TS6-CLOSEOUT.md) §6 listava quatro opções HITL. Estado atual:

| Opção | Descrição | Status |
|-------|-----------|--------|
| **A** | Tailwind 4 por app | guest **GO** · admin **GO** · **site-publico preflight GO** |
| **B** | Express 5 backend | **GO** (#328 + revalidação pós-T0.20) |
| **C** | Saneamento `.next/types` | **GO encerrado** (T0.17–T0.20) |
| **D** | Dependabot / security | débito separado — não misturar |

## Decisão HITL

| Direção escolhida | Próximo marco |
|-------------------|---------------|
| **TW4 `apps/site-publico`** | [T0.21 preflight](./T0.21-TAILWIND4-SITE-PUBLICO-PREFLIGHT.md) → impl PR dedicada |
| Montanha D Express 5 | **Encerrada** — revalidada, sem nova impl |

**Não misturar** TW4 site-publico com security bumps ou turismo na mesma PR (ADR-0003 H5).

## Gates baseline (preflight T0.21)

| Gate | Resultado |
|------|-----------|
| type-check site-publico | **0 erros** |
| build webpack | **PASS** |
| `:3000` | **200** |
| API P0 | **8/8** |
| Express 5 reverify | **GO** |

## Veredito

**Fase E HITL pós-T0.20 = GO** — próxima execução: **T0.21 impl Tailwind 4 site-publico**.

---

*Documento de decisão — não altera runtime.*
