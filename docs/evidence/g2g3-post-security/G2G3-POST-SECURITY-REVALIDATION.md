# G2/G3 — Revalidação formal pós-security

**Data:** 2026-06-13  
**Base:** `main` @ `934917b5c` (closeout security #326)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Montanha:** A — revalidação G2/G3 pós-trilha SEC-01→06

## Contexto

Após merge da trilha security (#314→#326) e Fase E TS6 (#299→#313), reexecutar gates operacionais antes de Tailwind 4, Express 5 ou `.next/types`.

Script: [run-g2g3-post-security.ps1](./run-g2g3-post-security.ps1)

## G3 — Segurança / runtime

| Gate | Resultado | Artefato |
|------|-----------|----------|
| API P0 | **8/8 OK** | [logs/API-P0-SUMMARY.tsv](./logs/API-P0-SUMMARY.tsv) |
| Dependabot open | **0** | [logs/dependabot-open-count.json](./logs/dependabot-open-count.json) |
| npm audit root | **0** | [logs/npm-audit-root.json](./logs/npm-audit-root.json) |
| npm audit backend | **0** | [logs/npm-audit-backend.json](./logs/npm-audit-backend.json) |
| npm audit apps (4) | **0** cada | [logs/](./logs/) |
| HTTP smoke Docker | **5/5 PASS** (:3000–:3006) | [logs/smoke-http.tsv](./logs/smoke-http.tsv) |
| Docker `rsv360` | **healthy** | [logs/docker-ps.txt](./logs/docker-ps.txt) |

**Veredito G3 pós-security:** **GO**

## G2 — Qualidade build

### Operacional (build + type-check core + smoke)

| Workspace | build | type-check | Notas |
|-----------|-------|------------|-------|
| packages/shared | **PASS** | **PASS** | |
| apps/guest | **PASS** | **PASS** | TS6 |
| apps/admin | **PASS** | **PASS** | TS6 |
| apps/turismo | **PASS** | **DEBT** | exit=1 — débito baseline documentado (TS6 T0.13) |
| apps/site-publico | **PASS** | **DEBT** | exit=1 — `.next/types` / baseline app (TS6 T0.14) |

Evidência: [logs/G2-SUMMARY.tsv](./logs/G2-SUMMARY.tsv)

### Estrito (lint)

| Workspace | lint | Leitura |
|-----------|------|---------|
| apps/guest | **FAIL** | `Cannot find module 'eslint/package.json'` — hoisting local worktree, **não** regressão SEC |
| apps/turismo | **FAIL** | idem eslint tooling |
| apps/admin | **DEBT** | exit=2 — baseline #237 |
| apps/site-publico | **DEBT** | exit=2 — baseline #237 |

Runtime Docker **não afetado** (containers healthy; builds PASS).

**Veredito G2 operacional:** **GO**  
**Veredito G2 estrito (lint):** **NOGO condicional** — débito conhecido #237 + lint local bloqueado por eslint hoist

## Rollup

| Gate | Status |
|------|--------|
| G2 operacional | **GO** |
| G2 estrito | **NOGO condicional** |
| G3 pós-security | **GO** |
| **Montanha A** | **GO condicional** |

Artefato: [logs/g2g3-rollup-summary.tsv](./logs/g2g3-rollup-summary.tsv)

## Débitos inalterados (fora escopo desta rodada)

- Lint baseline #237 (admin, site-publico)
- type-check turismo / site-publico (pré-build DEBT)
- `.next/types` site-publico pós-build
- eslint hoist no worktree local (guest/turismo lint local)

## Próxima montanha recomendada

**D — Express 5 / backend verification** (ADR-0003 E4, baixo risco) → depois **C** Tailwind 4 piloto guest/admin.

---

*Evidência — não altera deps, código ou runtime.*
