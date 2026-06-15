# ADR-0004: PLANO-MESTRE Fase 1 — identidade e tenant

**Status:** Aceito  
**Data proposta:** 2026-06-02  
**Data aceite:** 2026-06-02  
**Base:** `main` @ `1463b29c7` (pós T0.24 #364)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Supersede:** nenhum  
**Referência:** ADR-0002 §consequências; PLANO-MESTRE-v3-CONSOLIDADO §Fase 1; issue [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256)

---

## Contexto

- Trilha 0 core + Fase E (ADR-0003) **concluídas** — [FASE-E-CLOSEOUT.md](./FASE-E-CLOSEOUT.md)
- G4 operacional **GO**; soak encerrado
- T0.23a (TS2786 turismo) e T0.24 (eslint hoist) **GO** — lint #237 retomável

## Proposta

Executar **Fase 1 do PLANO-MESTRE** no monorepo S2:

| Área | Escopo indicativo |
|------|-------------------|
| Identidade | Auth unificada, sessão, perfis |
| Tenant | Multi-tenant / `enterpriseId` canônico |
| Integração | Alinhamento backend `api/v1` + frontends |

**Não incluído nesta ADR (implementação):** detalhamento de schema, migrações financeiras, S1 completo.

## Pré-requisitos (GO)

| Pré-requisito | Status |
|---------------|--------|
| Fase E ADR-0003 | **GO** |
| API P0 baseline | **8/8** |
| Docker `rsv360` healthy | **GO** |
| T0.23a / T0.24 | **GO** (#362–#364) |
| War room / product sign-off | **HITL pós-T0.24** |

## Hard stops

| # | Condição |
|---|----------|
| H1 | Iniciar impl sem ADR **Aceito** |
| H2 | Misturar Fase 1 impl com T0.23b TS ou lint #237 na mesma PR |
| H3 | Hard stop temporada jul/2026 sem war room (ADR-0002 §6.7) |

## Decisão

**Aprovado (HITL pós-T0.24)** — Status **`Aceito`**; desbloqueia trilha **T1.x** piloto tenant/auth.

| Consequência | Detalhe |
|--------------|---------|
| Backlog | Issues pós-soak #250–#255 conforme [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256) |
| PRs | Dedicadas por sub-domínio (auth ≠ tenant ≠ financeiro) |

---

*ADR aceito — implementação em PRs T1.x dedicadas.*
