# ADR-0004: PLANO-MESTRE Fase 1 — identidade e tenant (proposta)

**Status:** Proposto  
**Data:** 2026-06-02  
**Base:** `main` @ `9aae8cc55` (pós FASE-E-CLOSEOUT)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Supersede:** nenhum  
**Referência:** ADR-0002 §consequências; PLANO-MESTRE-v3-CONSOLIDADO §Fase 1; issue [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256)

---

## Contexto

- Trilha 0 core + Fase E (ADR-0003) **concluídas** — [FASE-E-CLOSEOUT.md](./FASE-E-CLOSEOUT.md)
- G4 operacional **GO**; soak encerrado
- Débitos técnicos residuais (TS turismo, lint #237) tratados em montanhas **T0.23/T0.24** antes ou em paralelo controlado

## Proposta

Executar **Fase 1 do PLANO-MESTRE** no monorepo S2:

| Área | Escopo indicativo |
|------|-------------------|
| Identidade | Auth unificada, sessão, perfis |
| Tenant | Multi-tenant / `enterpriseId` canônico |
| Integração | Alinhamento backend `api/v1` + frontends |

**Não incluído nesta proposta (implementação):** detalhamento de schema, migrações financeiras, S1 completo.

## Pré-requisitos (GO)

| Pré-requisito | Status |
|---------------|--------|
| Fase E ADR-0003 | **GO** |
| API P0 baseline | **8/8** |
| Docker `rsv360` healthy | **GO** |
| War room / product sign-off | **Pendente** |

## Hard stops

| # | Condição |
|---|----------|
| H1 | Iniciar sem ADR **Aceito** |
| H2 | Misturar com T0.23 TS turismo na mesma PR |
| H3 | Hard stop temporada jul/2026 sem war room (ADR-0002 §6.7) |

## Decisão pendente

| Opção | Descrição |
|-------|-----------|
| **Aprovar ADR-0004** | Status → `Aceito`; abrir T1.x piloto tenant/auth |
| **Adiar** | Concluir T0.23/T0.24 antes de Fase 1 |
| **Rejeitar** | Manter só débito técnico; revisar PLANO-MESTRE |

## Consequências (se aceito)

- Desbloqueia backlog pós-soak #250–#255 conforme issue #256
- Exige PRs dedicadas por sub-domínio (auth ≠ tenant ≠ financeiro)

---

*Proposta documental — sem alteração de código até status `Aceito`.*
