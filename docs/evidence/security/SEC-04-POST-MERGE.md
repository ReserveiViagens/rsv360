# SEC-04 — Carimbo pós-merge

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-04-post-merge-docs`  
**Base:** `main` @ `6de6a70d5`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Cadeia de auditoria

```
#314 inventário → SEC-01 → SEC-02 → SEC-03 → SEC-04 postcss (#321) → este carimbo
```

| Etapa | PR / commit | Artefato |
|-------|-------------|----------|
| SEC-04 fix | [#321](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/321) @ `6de6a70d5` | [SEC-04-POSTCSS-RESULT.md](./SEC-04-POSTCSS-RESULT.md) |
| SEC-04 carimbo | *(esta PR)* | `SEC-04-POST-MERGE.md` |

## Merge SEC-04

| Item | Valor |
|------|-------|
| Estado | **MERGED** |
| Merge commit | `6de6a70d5` |
| Bugbot | **SUCCESS** |
| Alteração | overrides `postcss@8.5.15` + dedupe lock; **Next 16.2.7 inalterado** |

## Dependabot revalidado

| Alerta | Pacote | Estado pós-merge |
|--------|--------|------------------|
| **#83** | postcss | **fixed** |

| Métrica | Pos SEC-03 | Pos SEC-04 |
|---------|------------|------------|
| **Total open** | 9 | **8** |
| critical | 0 | **0** |
| high | 2 | **2** |
| medium | 5 | **4** |
| low | 2 | **2** |

Artefatos: [logs/sec-04-post-merge-validation.json](./logs/sec-04-post-merge-validation.json), [logs/sec-04-post-merge-dependabot-open.tsv](./logs/sec-04-post-merge-dependabot-open.tsv), [logs/sec-04-post-merge-summary.tsv](./logs/sec-04-post-merge-summary.tsv)

## npm audit root (local)

| Severidade | Total |
|------------|-------|
| critical | **0** |
| high | 3 |
| moderate | 8 |
| **total** | **11** |

`postcss` **ausente** do relatório.

## Veredito

**SEC-04 = GO pós-merge**

## Próxima trilha

**SEC-05** — esbuild backend (alertas #32, #35, #137, #138, #139, #140) — PR isolada.

Atualizar [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md) após merge deste carimbo.

---

*Documento de carimbo — não altera deps, código ou runtime.*
