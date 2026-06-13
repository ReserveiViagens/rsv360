# SEC-06 — Resultado: uuid override 11.1.1

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-06-uuid`  
**Base:** `main` @ `98c21c531`

## Objetivo

Fechar alertas Dependabot **#122** (backend lock) e **#124** (root lock) — `uuid` &lt; 11.1.1.

## Alterações

| Arquivo | Alteração |
|---------|-----------|
| `package.json` | override `"uuid": "11.1.1"` |
| `package-lock.json` | `uuid` 9.0.1 → **11.1.1**; nested 8.3.2 deduped |
| `backend/package-lock.json` | `uuid` 9.0.1 → **11.1.1** |

**Inalterado:** `mercadopago@^2.12.0`, `exceljs` (site-publico), sem bump major mercadopago.

## npm audit

| Escopo | Resultado |
|--------|-----------|
| root | **0 vulnerabilities** |
| backend | **0 vulnerabilities** |
| uuid no audit | **ausente** |

## Gates

| Gate | Resultado |
|------|-----------|
| API P0 | **8/8 OK** — [logs/sec-06-api-p0-summary.tsv](./logs/sec-06-api-p0-summary.tsv) |
| mercadopago / exceljs versões | **inalteradas** |

## Nota

`@smithy/uuid@1.1.2` é pacote **distinto** de `uuid` — fora escopo alertas #122/#124.

## Veredito

**SEC-06 = GO condicional** — zerou npm audit local root+backend; alertas uuid esperados **fixed** pós-merge.

---

*Trilha security inventário→SEC-06 potencialmente completa após carimbo.*
