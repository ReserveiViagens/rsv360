# Fase E — Closeout da rodada TypeScript 6

**Data:** 2026-06-13  
**Base:** `main` @ `e0851a675` (docs pós-merge T0.14 — PR #312)  
**Worktree canônico:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**ADR:** [ADR-0003-FASE-E-STACK-RESIDUAL.md](./ADR-0003-FASE-E-STACK-RESIDUAL.md)

## 1. Resumo executivo

**Rodada TS6 Fase E concluída.**

Apps migrados para TypeScript **6.0.3** (`^6.0.3`): **guest**, **admin**, **turismo**, **site-publico**.

Cada app seguiu o padrão **PR de implementação + PR documental pós-merge** (“carimbo de cartório”). Nenhuma destas PRs alterou Tailwind, Express, Dockerfile ou saneamento de `.next/types`.

## 2. Tabela por app

| App | PR implementação | PR docs pós-merge | Status | Validações principais | Observações |
|-----|------------------|-------------------|--------|----------------------|-------------|
| **guest** (E1 / T0.11) | [#299](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/299) | [#300](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/300) | **GO** | type-check **PASS**; build webpack **PASS**; `:3006` **200**; health **healthy**; API P0 **8/8** | `ignoreDeprecations: "6.0"` por TS5101 (`baseUrl`); TS em `devDependencies` |
| **admin** (E2 / T0.12) | [#302](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/302) | [#303](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/303) | **GO** | type-check **PASS**; build webpack **PASS**; `:3004` **200**; health **healthy**; API P0 **8/8** | Mesmo padrão guest; avisos Recharts no SSG pré-existentes |
| **turismo** (E3 / T0.13) | [#304](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/304) | [#306](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/306) | **GO** | type-check **PASS** (pré-build, escopo tsconfig restrito); build Turbopack **PASS**; `:3005` **200**; health **healthy**; API P0 **8/8** | Gate oficial = type-check **sem** `.next/types`; pós-build com `.next/types` fora do escopo TS6 |
| **site-publico** (E4 / T0.14) | [#310](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/310) | [#312](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/312) | **GO** | type-check **pré-build PASS**; build webpack **PASS**; `:3000` **200**; health **healthy**; API P0 **8/8** | TS mantido em **`dependencies`**; `ignoreBuildErrors: true` inalterado; type-check **pós-build FAIL** baseline (~1968 erros `.next/types`) |

### Evidência detalhada por marco

| Marco | Documento |
|-------|-----------|
| T0.11 guest | [T0.11-TYPESCRIPT6-GUEST-RESULT.md](./T0.11-TYPESCRIPT6-GUEST-RESULT.md) |
| T0.12 admin | [T0.12-TYPESCRIPT6-ADMIN-RESULT.md](./T0.12-TYPESCRIPT6-ADMIN-RESULT.md) |
| T0.13 turismo | [T0.13-TYPESCRIPT6-TURISMO-RESULT.md](./T0.13-TYPESCRIPT6-TURISMO-RESULT.md) |
| T0.14 site-publico | [T0.14-TYPESCRIPT6-SITE-PUBLICO-RESULT.md](./T0.14-TYPESCRIPT6-SITE-PUBLICO-RESULT.md) |
| Plano HITL T0.14 | [T0.14-SITE-PUBLICO-TS6-PREFLIGHT.md](./T0.14-SITE-PUBLICO-TS6-PREFLIGHT.md) |
| Bugfix turismo (paralelo) | [TURISMO-AUTHPROVIDER-ROOT-LOADER.md](./TURISMO-AUTHPROVIDER-ROOT-LOADER.md) — #308 / #309 |

## 3. PRs consolidadas (referência rápida)

| App | Implementação | Docs pós-merge | Status |
|-----|---------------|----------------|--------|
| guest | #299 | #300 | **GO** |
| admin | #302 | #303 | **GO** |
| turismo | #304 | #306 | **GO** |
| site-publico | #310 | #312 | **GO** |

## 4. Débitos conhecidos

| Débito | Escopo | Ação na rodada TS6 |
|--------|--------|-------------------|
| **site-publico** type-check pós-build **FAIL** por `.next/types` baseline | ~1968 erros após build | Documentado; **não corrigido** |
| **site-publico** mantém `typescript` em **`dependencies`** | Diferente de guest/admin/turismo (`devDependencies`) | **Mantido** conforme plano HITL #307 |
| **site-publico** mantém `typescript.ignoreBuildErrors: true` | `next.config.js` | **Inalterado** — build operacional preservado |
| **turismo** type-check pós-build com `.next/types` | Pode falhar se ampliar escopo do tsconfig | Tratar em **PR separada** se ampliar escopo; gate TS6 = pré-build |
| **Tailwind 4** | ADR-0003 sub-fase posterior | **Não iniciado** |
| **Express 5** | ADR-0003 sub-fase posterior | **Não iniciado** |
| **Dependabot / security** | 15 alertas reportados no remote (snapshot 2026-06) | **Fora desta rodada** — candidato a próxima HITL |

## 5. Veredito

| Item | Resultado |
|------|-----------|
| **Fase E / TS6** | **GO / concluída** |
| **Tailwind 4** | **NOGO** até nova decisão HITL |
| **Express 5** | **NOGO** até nova decisão HITL |

## 6. Próxima decisão HITL

Escolher **uma** direção antes de abrir nova rodada:

| Opção | Descrição |
|-------|-----------|
| **A** | **Tailwind 4** por app — começar por guest/admin (piloto incremental, espelho TS6) |
| **B** | **Express 5 / backend verification** — sub-fase E do ADR-0003 no backend |
| **C** | **Saneamento type-check `.next/types`** — foco `apps/site-publico` (e turismo se ampliar escopo) |
| **D** | **Auditoria / security Dependabot** — triagem dos alertas reportados no repositório |

**Recomendação operacional:** não misturar opções na mesma PR; cada montanha = branch + evidência + HITL próprio.

---

*Documento de fechamento — não altera código, dependências, Docker ou runtime.*
