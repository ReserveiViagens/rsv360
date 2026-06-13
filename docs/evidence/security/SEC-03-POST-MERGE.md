# SEC-03 - Carimbo pos-merge

**Data:** 2026-06-13
**Branch:** `codex/security-sec-03-post-merge-docs`
**Base:** `main` @ `9f11d7d3`
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Cadeia de auditoria

```
Inventario (#314) -> SEC-01 (#315/#316) -> SEC-02 (#317/#318) -> SEC-03 site-publico nodemailer (#319) -> Revalidacao pos-merge (este documento)
```

| Etapa | PR / commit | Artefato |
|-------|-------------|----------|
| Inventario | #314 | [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) |
| SEC-01 fix | #315 @ `b320b0543` | [SEC-01-SHELL-QUOTE-JOI.md](./SEC-01-SHELL-QUOTE-JOI.md) |
| SEC-01 carimbo | #316 @ `f207e329` | [SEC-01-POST-MERGE.md](./SEC-01-POST-MERGE.md) |
| SEC-02 fix | #317 @ `714078a4` | root `nodemailer` patch |
| SEC-02 carimbo | #318 @ `7fc5728f` | [SEC-02-POST-MERGE.md](./SEC-02-POST-MERGE.md) |
| SEC-03 fix | #319 @ `9f11d7d3` | `apps/site-publico` `nodemailer` major 7 -> 8 |
| SEC-03 carimbo | *(esta PR)* | `SEC-03-POST-MERGE.md` |

## Merge SEC-03

| Item | Valor |
|------|-------|
| PR implementacao | [#319](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/319) |
| Estado | **MERGED** |
| Merge commit | `9f11d7d3bb1597e2a81c0cf8fb0c0ebead656e66` |
| Merged at | `2026-06-13T14:37:04Z` |
| Bugbot | **SUCCESS** |
| Pacote `apps/site-publico` | `nodemailer` `^7.0.13` -> `^8.0.11` |

Validacao GitHub (`gh pr view 319 --json state,mergeCommit,statusCheckRollup`):

- `state`: **MERGED**
- `mergeCommit.oid`: **9f11d7d3bb1597e2a81c0cf8fb0c0ebead656e66**
- `Cursor Bugbot`: **SUCCESS**

## Lockfile revalidado

| Local | Valor pos-merge |
|-------|-----------------|
| `apps/site-publico/package.json` | `nodemailer` `^8.0.11` |
| `package-lock.json` spec de `apps/site-publico` | `nodemailer` `^8.0.11` |
| `apps/site-publico/node_modules/nodemailer` | ausente |
| root `node_modules/nodemailer` | `8.0.11` |

O escopo da SEC-03 foi preservado: somente `apps/site-publico/package.json` e `package-lock.json` foram alterados na PR de implementacao.

## Dependabot revalidado

Fonte primaria: GitHub Dependabot API, coletada em `2026-06-13T14:39:52Z`.

| Metrica | Pos SEC-02 | Pos SEC-03 |
|---------|------------|------------|
| **Total open** | 13 | **9** |
| critical | 0 | **0** |
| high | 2 | **2** |
| medium | 7 | **5** |
| low | 4 | **2** |
| `nodemailer` open | 4 | **0** |

Alertas `nodemailer` revalidados:

| Alerta | Manifest | Severidade | Estado | Fixed at |
|--------|----------|------------|--------|----------|
| #128 | `apps/site-publico/package.json` | low | **fixed** | `2026-06-13T14:37:09Z` |
| #129 | `apps/site-publico/package.json` | medium | **fixed** | `2026-06-13T14:37:09Z` |
| #130 | `package-lock.json` | low | **fixed** | `2026-06-13T14:37:09Z` |
| #131 | `package-lock.json` | medium | **fixed** | `2026-06-13T14:37:09Z` |

## npm audit apps/site-publico

| Severidade | Total |
|------------|-------|
| critical | **0** |
| high | **0** |
| moderate | 7 |
| low | 0 |
| **total** | **7** |

`npm audit --workspace=apps/site-publico --json` nao lista mais `nodemailer`.

Vulnerabilidades remanescentes no workspace:

```
@ngneat/falso
artillery
artillery-plugin-fake-data
exceljs
next
postcss
uuid
```

## Artefatos

- [logs/sec-03-post-merge-validation.json](./logs/sec-03-post-merge-validation.json)
- [logs/sec-03-post-merge-dependabot-open.tsv](./logs/sec-03-post-merge-dependabot-open.tsv)
- [logs/sec-03-post-merge-summary.tsv](./logs/sec-03-post-merge-summary.tsv)
- [logs/sec-03-post-merge-npm-audit-site-publico.json](./logs/sec-03-post-merge-npm-audit-site-publico.json)

## Ressalvas

| Item | Nota |
|------|------|
| Build / type-check `site-publico` | Debitos baseline conhecidos; nao corrigidos nesta PR documental |
| `test:ticket` | Baseline falha por ausencia de `ts-jest` no transform |
| Tailwind 4 / Express 5 / `.next/types` | **NOGO** ate nova HITL |
| Dependabot remanescente | 9 alertas open; proxima trilha deve seguir fila HITL |

## Veredito

**SEC-03 implementacao = GO pos-merge.**

**SEC-03 fechamento Dependabot nodemailer = GO.**

O patch `apps/site-publico` foi mergeado, o audit local nao lista `nodemailer`, e a fonte primaria GitHub marca os alertas #128, #129, #130 e #131 como **fixed**.

---

*Documento de carimbo - nao altera deps, codigo ou runtime.*
