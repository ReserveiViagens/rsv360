# Fase E — TW4 Closeout (apps Next canônicos guest / admin / site-publico)

**Data:** 2026-06-02  
**Base:** `main` @ `d97c2f2da` (merge #357 — carimbo T0.21)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**ADR:** [ADR-0003-FASE-E-STACK-RESIDUAL.md](./ADR-0003-FASE-E-STACK-RESIDUAL.md) — sub-fase **E3**

## Resumo executivo

**Sub-fase TW4 dos três apps Next canônicos (App Router) concluída.**

Todos migrados para **Tailwind CSS 4.3.1** com configuração **CSS-first**, build **webpack** (T0.10), gates operacionais verdes e carimbo documental pós-merge.

**Fora deste closeout:** `apps/turismo` — permanece TW **3.4.19**; candidato **T0.22** (ver [FASE-E-HITL-POST-T0.21.md](./FASE-E-HITL-POST-T0.21.md)).

## Tabela por app

| App | Impl | Carimbo | tailwindcss | Build | Smoke | API P0 |
|-----|------|---------|-------------|-------|-------|--------|
| **guest** | [#330](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/330) | [#331](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/331) | **4.3.1** | webpack | `:3006` **200** | **8/8** |
| **admin** | [#332](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/332) | [#333](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/333) | **4.3.1** | webpack | `:3004` **200** | **8/8** |
| **site-publico** | [#356](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/356) | [#357](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/357) | **4.3.1** | webpack + `css-loader url: false` | `:3000` **200** | **8/8** |

## Evidência

| Marco | Documento |
|-------|-----------|
| T0.15 guest | [T0.15-TAILWIND4-GUEST-POST-MERGE.md](./T0.15-TAILWIND4-GUEST-POST-MERGE.md) |
| T0.16 admin | carimbo #333 |
| T0.21 site-publico | [T0.21-TAILWIND4-SITE-PUBLICO-POST-MERGE.md](./T0.21-TAILWIND4-SITE-PUBLICO-POST-MERGE.md) |
| HITL pós-T0.21 | [FASE-E-HITL-POST-T0.21.md](./FASE-E-HITL-POST-T0.21.md) |

## Lições (site-publico)

- TW4 `@source` com globs amplos gera `url(./...)` que o **css-loader webpack** do Next 16 resolve como módulo.
- Mitigação: `use.options.url = false` em `next.config.js` `webpack()` — **somente site-publico**; guest/admin não precisaram.

## Veredito

| Item | Resultado |
|------|-----------|
| **Fase E / TW4 (guest+admin+site-publico)** | **GO / encerrada** |
| **Próximo TW4** | `apps/turismo` — T0.22 preflight |

---

*Documento de fechamento — não altera código, dependências, Docker ou runtime.*
