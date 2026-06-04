# Índice — issues pós-soak (Trilha C)

**Atualizado:** 2026-06-04  
**Label GitHub:** `post-soak-draft`  
**Status corpo:** **READY-TO-IMPLEMENT** (links **main**)

**Governança:** [TRILHA-PARALELA-POS-SOAK.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md) · [CHECKLIST-SOAK-SAFE.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/CHECKLIST-SOAK-SAFE.md)

> **G4 completo = GO** (2026-06-04). Trilha ativa — ver [POST-SOAK-EXECUTION-STATUS.md](../POST-SOAK-EXECUTION-STATUS.md).

## Mapa de issues

| ID | Tema | P | Issue | Corpo local |
|----|------|---|-------|-------------|
| GATE | G4 → PLANO-MESTRE | P0 | [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256) | `post-soak-07-g4-gate-plano-mestre.md` |
| C1 | Docker rede unificada | P1 | [#250](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/250) | `post-soak-01-docker-network.md` |
| C2 | Postgres :5432 | P1 | [#251](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/251) | `post-soak-02-postgres-5432.md` |
| C3 | Healthcheck frontends | P2 | [#252](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/252) | `post-soak-03-healthcheck-frontends.md` |
| C6 | Auth hardening | P1 | [#255](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255) | `post-soak-06-auth-hardening.md` |
| C4 | Lint warnings | P2 | [#253](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/253) | `post-soak-04-lint-warnings.md` |
| C5 | Observabilidade | P2 | [#254](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/254) | `post-soak-05-observability.md` |

## Ordem de execução (explícita)

```text
[SOAK até 2026-06-02T09:03:09-03:00 — somente observação]
        │
        ▼
   #256  GATE G4 (pacote soak + API P0 + GO revisor)
        │
        ├──► #250  rede compose     ─┐ paralelo (coordenar restart)
        └──► #251  Postgres :5432   ─┘
        │
        ▼
   #252  healthcheck guest/admin/turismo
        │
        ▼
   #255  auth hardening
        │
        ├──► #253  lint warnings    ─┐ paralelo
        └──► #254  observabilidade ─┘
```

## Evidência Trilha B (leitura concluída)

| Issue | Doc |
|-------|-----|
| #252 | [TRILHA-B-252-healthcheck-evidence.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/TRILHA-B-252-healthcheck-evidence.md) |
| #255 | [TRILHA-B-255-auth-evidence.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/TRILHA-B-255-auth-evidence.md) |

## Padrão de cada issue

- Links **main** (trilha / evidência)
- **Dependência de ordem** + bloqueio soak
- Critérios positivo / negativo (onde aplicável)
- **Evidência obrigatória no PR** (tabela de artefatos)
