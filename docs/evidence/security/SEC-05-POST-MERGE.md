# SEC-05 — Carimbo pós-merge

**Data:** 2026-06-13  
**Base:** `main` @ `3f7de5ab2`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Merge SEC-05

| Item | Valor |
|------|-------|
| PR impl | [#323](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/323) |
| Merge commit | `3f7de5ab2` |
| Fix | override `esbuild@0.28.1` + sync `backend/package-lock.json` |
| drizzle-kit / tsx | **inalterados** |

## Dependabot revalidado

| Métrica | Pos SEC-04 | Pos SEC-05 |
|---------|------------|------------|
| **Total open** | 8 | **2** |
| critical | 0 | **0** |
| high | 2 | **0** |
| medium | 4 | **2** (uuid) |

Alertas esbuild **#32, #35, #137, #138, #139, #140** → **fixed**

Artefatos: [logs/sec-05-post-merge-validation.json](./logs/sec-05-post-merge-validation.json), [logs/sec-05-post-merge-dependabot-open.tsv](./logs/sec-05-post-merge-dependabot-open.tsv)

## npm audit root

| Severidade | Total |
|------------|-------|
| high | **0** |
| moderate | **6** |
| **total** | **6** |

`esbuild` **ausente** do relatório.

## Veredito

**SEC-05 = GO pós-merge**

**Próximo:** SEC-06 uuid (#122, #124) — override `11.1.1` sem bump major mercadopago/exceljs.

---

*Atualizar [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md) após merge.*
