# Security Trail — Closeout (Dependabot / npm audit)

**Data:** 2026-06-13  
**Base:** `main` @ `6abaf520e` (merge SEC-06 — PR #325)  
**Worktree canônico:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Contexto:** pós [FASE-E-TS6-CLOSEOUT.md](../trilha-0/FASE-E-TS6-CLOSEOUT.md)

## 1. Resumo executivo

**Trilha security concluída.**

Partindo de **15 alertas Dependabot open** (inventário #314), a trilha fechou **SEC-01 → SEC-06** com padrão **PR de implementação + PR documental pós-merge** (“carimbo de cartório”). Nenhuma PR alterou Docker, workflows S1, Tailwind, Express ou saneamento de `.next/types`.

**Estado final:** Dependabot **open: 0**; `npm audit` local (root + backend) **0 vulnerabilities**.

## 2. Tabela por etapa

| Etapa | PR impl | PR carimbo | Status | Fix principal | Observações |
|-------|---------|------------|--------|---------------|-------------|
| **Inventário** | — | [#314](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/314) | **GO** | Baseline 15 alertas | [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) |
| **SEC-01** shell-quote + joi | [#315](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/315) | [#316](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/316) | **GO** | override `shell-quote@1.8.4`, joi 17.13.4 | Alertas #132/#136 **fixed**; 0 critical |
| **SEC-02** nodemailer root | [#317](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/317) | [#318](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/318) | **GO** | patch root → **8.0.11** | Alertas root fechados na SEC-03 |
| **SEC-03** nodemailer site-publico | [#319](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/319) | [#320](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/320) | **GO** | major 7 → **8.0.11** | Alertas #128–#131 **fixed** |
| **SEC-04** postcss | [#321](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/321) | [#322](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/322) | **GO** | override **8.5.15** | Next **16.2.7 inalterado**; #83 **fixed** |
| **SEC-05** esbuild | [#323](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/323) | [#324](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/324) | **GO** | override **0.28.1** + backend lock | Alertas #32/#35/#137–#140 **fixed** |
| **SEC-06** uuid | [#325](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/325) | *(esta PR)* | **GO** | override **11.1.1** + backend lock | Alertas #122/#124 **fixed**; mercadopago/exceljs **inalterados** |

### Evidência detalhada por etapa

| Marco | Documento |
|-------|-----------|
| Inventário | [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) |
| SEC-01 | [SEC-01-SHELL-QUOTE-JOI.md](./SEC-01-SHELL-QUOTE-JOI.md) · [SEC-01-POST-MERGE.md](./SEC-01-POST-MERGE.md) |
| SEC-02 | [SEC-02-POST-MERGE.md](./SEC-02-POST-MERGE.md) |
| SEC-03 | [SEC-03-POST-MERGE.md](./SEC-03-POST-MERGE.md) |
| SEC-04 | [SEC-04-POSTCSS-RESULT.md](./SEC-04-POSTCSS-RESULT.md) · [SEC-04-POST-MERGE.md](./SEC-04-POST-MERGE.md) |
| SEC-05 | [SEC-05-POST-MERGE.md](./SEC-05-POST-MERGE.md) |
| SEC-06 | [SEC-06-UUID-RESULT.md](./SEC-06-UUID-RESULT.md) · [SEC-06-POST-MERGE.md](./SEC-06-POST-MERGE.md) |

## 3. Overrides consolidados (root `package.json`)

| Pacote | Versão forçada | Etapa |
|--------|----------------|-------|
| `shell-quote` | 1.8.4 | SEC-01 |
| `postcss` | 8.5.15 | SEC-04 |
| `esbuild` | 0.28.1 | SEC-05 |
| `uuid` | 11.1.1 | SEC-06 |

Patches diretos (sem override): `joi@17.13.4`, `nodemailer@8.0.11` (root e site-publico). Locks aninhados sincronizados manualmente em `backend/package-lock.json` (esbuild, uuid).

## 4. Métricas antes / depois

| Métrica | Inventário (#314) | Pós SEC-06 |
|---------|-------------------|------------|
| Dependabot **open** | **15** | **0** |
| critical | 1 | **0** |
| high | 2 | **0** |
| medium | 8 | **0** |
| low | 4 | **0** |
| npm audit root (local) | 15+ | **0** |
| npm audit backend (local) | 7 | **0** |

Validação pós-merge: [logs/sec-06-post-merge-validation.json](./logs/sec-06-post-merge-validation.json)

## 5. Gates recorrentes

| Gate | Resultado na trilha |
|------|---------------------|
| API P0 | **8/8 OK** em todas as rodadas SEC (evidência por `logs/sec-0N-api-p0-summary.tsv`) |
| `npm audit fix --force` | **Não utilizado** |
| Downgrades proibidos (Next 9, drizzle-kit 0.19, mercadopago 3.x, exceljs 3.x) | **Respeitados** |

## 6. Débitos conhecidos (fora desta trilha)

| Débito | Escopo | Ação na trilha security |
|--------|--------|-------------------------|
| **site-publico** type-check pós-build **FAIL** (`.next/types`) | ~1968 erros | **Não corrigido** — trilha TS6 |
| **type-check** turismo/site-publico baseline pré-build | Débito documentado | **Não corrigido** |
| **backend** testes integração | 17/22 pass (snapshot SEC) | **Não bloqueou** SECs |
| **Tailwind 4** | ADR-0003 | **NOGO** até nova HITL |
| **Express 5** | ADR-0003 | **NOGO** até nova HITL |
| **Revalidação G2/G3 formal** | Gates operacionais | **Pendente** — próxima montanha |

## 7. Veredito

| Item | Resultado |
|------|-----------|
| **Trilha security (inventário → SEC-06)** | **GO / concluída** |
| **Dependabot open** | **0** |
| **Tailwind 4** | **NOGO** até nova decisão HITL |
| **Express 5** | **NOGO** até nova decisão HITL |
| **`.next/types` site-publico** | **NOGO** até PR dedicada |

## 8. Próxima decisão HITL

Escolher **uma** direção antes de abrir nova rodada (espelho Fase E closeout):

| Opção | Descrição |
|-------|-----------|
| **A** | **Revalidação G2/G3 formal** — gates operacionais pós-security |
| **B** | **Saneamento type-check `.next/types`** — foco `apps/site-publico` |
| **C** | **Tailwind 4** por app — piloto incremental (guest/admin) |
| **D** | **Express 5 / backend verification** — sub-fase ADR-0003 |

**Recomendação operacional:** não misturar opções na mesma PR; cada montanha = branch + evidência + HITL próprio.

---

*Documento de fechamento — não altera código, dependências, Docker ou runtime.*
