# SEC-06 — Carimbo pós-merge

**Data:** 2026-06-13  
**Base:** `main` @ `6abaf520e`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Cadeia de auditoria

```
#314 inventário → SEC-01 → … → SEC-05 esbuild (#323) → SEC-06 uuid (#325) → este carimbo
```

| Etapa | PR / commit | Artefato |
|-------|-------------|----------|
| SEC-05 carimbo | [#324](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/324) | [SEC-05-POST-MERGE.md](./SEC-05-POST-MERGE.md) |
| SEC-06 fix | [#325](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/325) @ `6abaf520e` | [SEC-06-UUID-RESULT.md](./SEC-06-UUID-RESULT.md) |
| SEC-06 carimbo | *(esta PR)* | `SEC-06-POST-MERGE.md` |

## Merge SEC-06

| Item | Valor |
|------|-------|
| PR impl | [#325](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/325) |
| Merge commit | `6abaf520e` |
| Fix | override `uuid@11.1.1` + sync `backend/package-lock.json` |
| mercadopago / exceljs | **inalterados** (`^2.12.0` / `^4.4.0`) |

## Dependabot revalidado

| Alerta | Pacote | Estado pós-merge |
|--------|--------|------------------|
| **#122** | uuid (backend lock) | **fixed** |
| **#124** | uuid (root lock) | **fixed** |

| Métrica | Pos SEC-05 | Pos SEC-06 |
|---------|------------|------------|
| **Total open** | 2 | **0** |
| critical | 0 | **0** |
| high | 0 | **0** |
| medium | 2 (uuid) | **0** |
| low | 0 | **0** |

Artefatos: [logs/sec-06-post-merge-validation.json](./logs/sec-06-post-merge-validation.json), [logs/sec-06-post-merge-summary.tsv](./logs/sec-06-post-merge-summary.tsv)

## npm audit (local)

| Escopo | critical | high | moderate | total |
|--------|----------|------|----------|-------|
| root | 0 | 0 | 0 | **0** |
| backend | 0 | 0 | 0 | **0** |

`uuid` **ausente** do relatório. Artefatos: [logs/sec-06-post-merge-npm-audit-root.json](./logs/sec-06-post-merge-npm-audit-root.json), [logs/sec-06-post-merge-npm-audit-backend.json](./logs/sec-06-post-merge-npm-audit-backend.json)

## Gates

| Gate | Resultado |
|------|-----------|
| API P0 (SEC-06 impl) | **8/8 OK** — [logs/sec-06-api-p0-summary.tsv](./logs/sec-06-api-p0-summary.tsv) |
| mercadopago / exceljs versões | **inalteradas** |

## Veredito

**SEC-06 = GO pós-merge**

**Trilha security (inventário → SEC-06):** fechamento formal em [SECURITY-TRAIL-CLOSEOUT.md](./SECURITY-TRAIL-CLOSEOUT.md).

---

*Documento de carimbo — não altera deps, código ou runtime.*
