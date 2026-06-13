# SEC-01 — Carimbo pós-merge

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-01-post-merge-docs`  
**Base:** `main` @ `b320b0543`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Cadeia de auditoria

```
Inventário (#314) → Correção SEC-01 (#315) → Merge → Dependabot revalidado (este documento)
```

| Etapa | PR / commit | Artefato |
|-------|-------------|----------|
| Inventário | #314 @ `2af03f386` | [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) |
| Correção | #315 @ `b320b0543` | [SEC-01-SHELL-QUOTE-JOI.md](./SEC-01-SHELL-QUOTE-JOI.md) |
| Carimbo | *(esta PR)* | `SEC-01-POST-MERGE.md` |

## Merge SEC-01

| Item | Valor |
|------|--------|
| PR implementação | [#315](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/315) |
| Estado | **MERGED** |
| Merge commit | `b320b0543` |
| Pacotes corrigidos | `shell-quote` 1.8.3→**1.8.4**, `joi` 17.13.3→**17.13.4** |

Validação GitHub (`gh pr view 315 --json state,mergeCommit`):

- `state`: **MERGED**
- `mergeCommit.oid`: **b320b0543b8923a7b56b47c62b40f01cba5bf330**

## Dependabot revalidado

| Alerta | Pacote | Severidade | Estado pós-merge |
|--------|--------|------------|------------------|
| **#132** | shell-quote | critical | **fixed** |
| **#136** | joi | medium | **fixed** |

### Snapshot alertas abertos (pós SEC-01)

| Métrica | Antes (inventário) | Depois |
|---------|-------------------|--------|
| **Total open** | 15 | **13** |
| critical | 1 | **0** |
| high | 2 | **2** |
| medium | 8 | **7** |
| low | 4 | **4** |

Artefatos:

- [logs/sec-01-post-merge-validation.json](./logs/sec-01-post-merge-validation.json)
- [logs/sec-01-post-merge-dependabot-open.tsv](./logs/sec-01-post-merge-dependabot-open.tsv)
- [logs/sec-01-post-merge-summary.tsv](./logs/sec-01-post-merge-summary.tsv)
- [logs/sec-01-post-merge-npm-audit-root.json](./logs/sec-01-post-merge-npm-audit-root.json)

### npm audit root (local)

| Severidade | Total |
|------------|-------|
| critical | **0** |
| high | 3 |
| moderate | 11 |
| **total** | **14** |

`shell-quote` e `joi` **ausentes** do relatório npm audit root.

## Ressalvas (não bloqueantes)

| Item | Nota |
|------|------|
| type-check **turismo** | FAIL baseline (@types/react drift) — **não regressão SEC-01** |
| type-check **site-publico** | FAIL baseline (`.next/types` / débitos TS6) — **não regressão SEC-01** |
| API P0 na SEC-01 | **8/8 OK** (evidência em #315) |

## Veredito

**SEC-01 = GO pós-merge**

Critical eliminado; quick wins P0 encerrados com trilha auditável.

## Próxima trilha

| PR | Escopo | Status |
|----|--------|--------|
| **SEC-02** | nodemailer root `8.0.7` → `8.0.11` (patch) | **Autorizado** — PR separada |
| SEC-03 | nodemailer site-publico 7→8 (major) | Após SEC-02 |
| Tailwind 4 / Express 5 / `.next/types` | — | **NOGO** até nova HITL |

---

*Documento de carimbo — não altera deps, código ou runtime.*
