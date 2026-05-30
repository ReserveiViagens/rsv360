# Índice — issues rascunho pós-soak (Trilha C)

**Criado:** 2026-05-30  
**Label GitHub:** `post-soak-draft`  
**Governança:** [TRILHA-PARALELA-POS-SOAK.md](../TRILHA-PARALELA-POS-SOAK.md) · [CHECKLIST-SOAK-SAFE.md](../CHECKLIST-SOAK-SAFE.md)

> Não iniciar implementação até **G4 completo = GO** e `>= 2026-06-02T09:03:09-03:00`.

| # | Tema | P | Issue | Corpo local |
|---|------|---|-------|-------------|
| C1 | Docker rede unificada | P1 | [#250](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/250) | `post-soak-01-docker-network.md` |
| C2 | Postgres :5432 | P1 | [#251](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/251) | `post-soak-02-postgres-5432.md` |
| C3 | Healthcheck frontends | P2 | [#252](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/252) | `post-soak-03-healthcheck-frontends.md` |
| C4 | Lint warnings | P2 | [#253](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/253) | `post-soak-04-lint-warnings.md` |
| C5 | Observabilidade | P2 | [#254](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/254) | `post-soak-05-observability.md` |
| C6 | Auth hardening | P1 | [#255](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255) | `post-soak-06-auth-hardening.md` |
| GATE | G4 → PLANO-MESTRE | P0 | [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256) | `post-soak-07-g4-gate-plano-mestre.md` |

## Ordem de disparo sugerida (pós-GO)

1. **#256** — gate G4 (checklist C1–C16)
2. **#250** + **#251** — infra rede + PG (paralelo possível)
3. **#252** — healthcheck frontends (**antes** de #255)
4. **#255** — auth hardening
5. **#253** + **#254** — lint + observabilidade

## Trilha B (próximo passo)

Enriquecer issues com evidência de leitura (sem deploy):

- B1 → #252
- B2 → #255
- B3 → #255 / API matrix
- B4 → #253
