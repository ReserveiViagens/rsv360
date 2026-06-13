# SEC-02 - Carimbo pos-merge

**Data:** 2026-06-13
**Branch:** `codex/security-sec-02-post-merge-docs`
**Base:** `main` @ `714078a4`
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Cadeia de auditoria

```
Inventario (#314) -> SEC-01 (#315/#316) -> SEC-02 root nodemailer (#317) -> Revalidacao pos-merge (este documento)
```

| Etapa | PR / commit | Artefato |
|-------|-------------|----------|
| Inventario | #314 | [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) |
| SEC-01 fix | #315 @ `b320b0543` | [SEC-01-SHELL-QUOTE-JOI.md](./SEC-01-SHELL-QUOTE-JOI.md) |
| SEC-01 carimbo | #316 @ `f207e329` | [SEC-01-POST-MERGE.md](./SEC-01-POST-MERGE.md) |
| SEC-02 fix | #317 @ `714078a4` | root `nodemailer` patch |
| SEC-02 carimbo | *(esta PR)* | `SEC-02-POST-MERGE.md` |

## Merge SEC-02

| Item | Valor |
|------|-------|
| PR implementacao | [#317](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/317) |
| Estado | **MERGED** |
| Merge commit | `714078a4` |
| Bugbot | **SUCCESS** |
| Pacote root | `nodemailer` `^8.0.7` -> `^8.0.11` |

Validacao GitHub (`gh pr view 317 --json state,mergeCommit,statusCheckRollup`):

- `state`: **MERGED**
- `mergeCommit.oid`: **714078a4b5f2110cab781e9f491cc4efef2ebb90**
- `Cursor Bugbot`: **SUCCESS**

## Lockfile revalidado

| Local | Valor pos-merge |
|-------|-----------------|
| root `package.json` | `nodemailer` `^8.0.11` |
| root `package-lock.json` spec | `nodemailer` `^8.0.11` |
| root `node_modules/nodemailer` | `8.0.11` |
| `apps/site-publico/node_modules/nodemailer` | `7.0.13` (inalterado) |

O escopo da SEC-02 foi preservado: somente root package/lock foram alterados na PR de implementacao.

## Dependabot revalidado

Fonte primaria: GitHub Dependabot API, coletada em `2026-06-13T14:14:06Z`.

| Metrica | Pos SEC-01 | Pos SEC-02 |
|---------|------------|------------|
| **Total open** | 13 | **13** |
| critical | 0 | **0** |
| high | 2 | **2** |
| medium | 7 | **7** |
| low | 4 | **4** |

Alertas `nodemailer` ainda abertos:

| Alerta | Manifest | Severidade | Estado |
|--------|----------|------------|--------|
| #128 | `apps/site-publico/package.json` | low | open |
| #129 | `apps/site-publico/package.json` | medium | open |
| #130 | `package-lock.json` | low | open |
| #131 | `package-lock.json` | medium | open |

Observacao: apesar do root estar em `8.0.11`, os alertas #130/#131 continuam `open` na API. A evidencia local aponta o `npm audit` remanescente para `apps/site-publico/node_modules/nodemailer`, que foi mantido fora do escopo da SEC-02.

## npm audit root

| Severidade | Total |
|------------|-------|
| critical | **0** |
| high | 3 |
| moderate | 11 |
| low | 0 |
| **total** | **14** |

`npm audit` ainda lista `nodemailer`, mas o node afetado e:

```
apps/site-publico/node_modules/nodemailer
```

## Artefatos

- [logs/sec-02-post-merge-validation.json](./logs/sec-02-post-merge-validation.json)
- [logs/sec-02-post-merge-dependabot-open.tsv](./logs/sec-02-post-merge-dependabot-open.tsv)
- [logs/sec-02-post-merge-summary.tsv](./logs/sec-02-post-merge-summary.tsv)
- [logs/sec-02-post-merge-npm-audit-root.json](./logs/sec-02-post-merge-npm-audit-root.json)

## Ressalvas

| Item | Nota |
|------|------|
| Dependabot #130/#131 | Ainda `open`; fechamento nao comprovado pela API |
| `apps/site-publico` nodemailer | Continua em `7.0.13`; reservado para SEC-03 |
| Tailwind 4 / Express 5 / `.next/types` | **NOGO** ate nova HITL |
| type-check turismo/site-publico | Debitos baseline conhecidos; nao revalidados nesta PR documental |

## Veredito

**SEC-02 implementacao = GO pos-merge.**

**SEC-02 fechamento Dependabot = HOLD.**

O patch root foi mergeado e validado, mas a fonte primaria GitHub ainda nao comprova fechamento dos alertas `nodemailer`. A proxima decisao HITL recomendada e **SEC-03** (`apps/site-publico` `nodemailer` 7 -> 8) ou rechecagem posterior do Dependabot se houver reclassificacao automatica.

---

*Documento de carimbo - nao altera deps, codigo ou runtime.*
