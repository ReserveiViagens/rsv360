# F-023f - Back-end, banco, containers e qualidade

## 1. Visao geral

Esta fatia cobre docs, back-end, banco, containers e testes/qualidade.
Onda 1.5 ja esta registrada no 00-INDICE; aqui nao repetimos o plano.

### Leitura rapida

| Area | Concluido | Parcial | Pendente |
| --- | --- | --- | --- |
| Docs | 0 | 2 | 10 |
| Back-end | 0 | 6 | 12 |
| Banco | 0 | 3 | 7 |
| Containers | 0 | 4 | 8 |
| Testes | 0 | 5 | 10 |

## 2. Docs

| ID | Item | St | Risco |
| --- | --- | --- | --- |
| BL-001 | PRD | A | high |
| BL-002 | Stories | A | high |
| BL-003 | ADRs | A | high |
| BL-004 | C4 | A | med |
| BL-005 | Seq diagrams | A | med |
| BL-006 | Security policy | A | high |
| BL-007 | Runbook | A | high |
| BL-008 | DR backup | A | high |
| BL-009 | Integrations | A | high |
| BL-010 | README | P | low |
| BL-011 | Route contracts | P | med |
| BL-012 | Archive docs | A | low |

## 3. Back-end

| ID | Item | St | Risco |
| --- | --- | --- | --- |
| BL-013 | Port 3002 | A | med |
| BL-014 | checkin/status | A | high |
| BL-015 | admin portal docs | A | med |
| BL-016 | checkout/session | P | high |
| BL-017 | tenant fail-closed | A | high |
| BL-018 | CORS env | A | high |
| BL-019 | CSP hardening | A | high |
| BL-020 | availability | P | med |
| BL-021 | gateway | A | high |
| BL-022 | group trips | A | med |
| BL-023 | notifications | P | med |
| BL-024 | smart pricing | A | high |
| BL-025 | host quality | A | med |
| BL-026 | CRM | P | med |
| BL-027 | analytics | P | med |
| BL-028 | OTA/PMS | A | high |
| BL-029 | MFA/sessions | P | high |
| BL-030 | rate limit | A | high |

## 4. Banco

| ID | Item | St | Risco |
| --- | --- | --- | --- |
| BL-051 | source of truth | A | high |
| BL-052 | reconcile phase1 | A | high |
| BL-053 | validate journal CI | A | high |
| BL-054 | schema snapshot | P | med |
| BL-055 | deterministic seeds | P | med |
| BL-056 | backups restore | A | high |
| BL-057 | hot indexes | A | med |
| BL-058 | partitioning | A | med |
| BL-059 | portal tokens | P | high |
| BL-060 | LGPD retention | A | high |

## 5. Containers

| ID | Item | St | Risco |
| --- | --- | --- | --- |
| BL-061 | 32 services boot | A | high |
| BL-062 | healthchecks | P | high |
| BL-063 | multi-stage Docker | A | med |
| BL-064 | slim images | A | med |
| BL-065 | vault secrets | A | high |
| BL-066 | build/push | P | med |
| BL-067 | prod profiles | A | med |
| BL-068 | metrics | P | med |
| BL-069 | dashboards | P | med |
| BL-070 | JSON logs | A | med |
| BL-071 | tracing | A | med |
| BL-072 | alerts | A | high |

## 6. Testes e qualidade

| ID | Item | St | Risco |
| --- | --- | --- | --- |
| BL-073 | type-check | A | high |
| BL-074 | ESLint/Prettier | P | med |
| BL-075 | Husky | A | med |
| BL-076 | smoke tests | A | med |
| BL-077 | reservations E2E | P | high |
| BL-078 | checkout E2E | A | high |
| BL-079 | checkin E2E | A | high |
| BL-080 | contract tests | A | high |
| BL-081 | CodeQL | A | high |
| BL-082 | Dependabot | P | low |
| BL-083 | SAST/DAST | A | high |
| BL-084 | load tests | A | med |
| BL-085 | coverage target | A | med |
| BL-086 | mutation tests | A | low |
| BL-087 | quality dashboard | A | low |

## 7. Resumo final

- O bloco tecnico ainda e majoritariamente pendente.
- As partes mais avancadas sao docs-base, checkout, observabilidade e alguns
  pontos de qualidade.
- O resto do backlog precisa de implementacao, alinhamento de contrato e mais
  automacao.
- PACR-Ampla nao foi necessario aqui: o arquivo ficou abaixo do teto de
  250 linhas.
