# SEC-04 — Resultado: postcss override 8.5.15

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-04-postcss`  
**Base:** `main` @ `74a01aa18`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Objetivo

Fechar alerta Dependabot **#83** (`postcss` &lt; 8.5.10) sem alterar Next 16.2.7.

Plano: [SEC-04-POSTCSS-PLAN.md](./SEC-04-POSTCSS-PLAN.md)

## Alterações

| Arquivo | Alteração |
|---------|-----------|
| `package.json` | overrides `postcss: "8.5.15"` + `next.postcss: "8.5.15"` |
| `package-lock.json` | dedupe: 4× nested `8.4.31` → hoisted `8.5.15` |

**Não alterado:** versão Next (`16.2.7`), código, Dockerfile, workflows, demais pacotes SEC-05+.

## Antes / depois

| Métrica | Antes | Depois |
|---------|-------|--------|
| Instâncias postcss no lock | 9 (4× 8.4.31 VULN) | **1× 8.5.15 OK** |
| npm audit root total | 13 | **11** |
| postcss no npm audit | sim | **não** |
| next no npm audit (postcss chain) | sim (4 apps) | **não** |

Detalhe: [logs/sec-04-postcss-before-after.tsv](./logs/sec-04-postcss-before-after.tsv)

## Gates

| Gate | Resultado | Artefato |
|------|-----------|----------|
| postcss scan | **PASS** (1× 8.5.15) | [logs/sec-04-postcss-scan-after.log](./logs/sec-04-postcss-scan-after.log) |
| npm audit root | **11** total, 0 critical | [logs/sec-04-npm-audit-root.json](./logs/sec-04-npm-audit-root.json) |
| npm audit guest | **0** | — |
| npm audit admin | **0** | — |
| npm audit turismo | **0** | [logs/sec-04-npm-audit-turismo.json](./logs/sec-04-npm-audit-turismo.json) |
| npm audit site-publico | **5** (sem postcss) | [logs/sec-04-npm-audit-site-publico.json](./logs/sec-04-npm-audit-site-publico.json) |
| type-check guest | **PASS** | [logs/sec-04-typecheck-apps-guest.log](./logs/sec-04-typecheck-apps-guest.log) |
| type-check admin | **PASS** | [logs/sec-04-typecheck-apps-admin.log](./logs/sec-04-typecheck-apps-admin.log) |
| API P0 | **8/8 OK** | [logs/sec-04-api-p0-summary.tsv](./logs/sec-04-api-p0-summary.tsv) |

## Ressalvas

- turismo/site-publico type-check: baseline TS6 — **não escopo SEC-04**
- site-publico audit remanescente: uuid, exceljs, artillery (SEC-06 / dev deps)
- Dependabot **#83**: esperado **fixed** após merge + re-scan GitHub

## Rollback

```bash
git revert <merge-commit-SEC-04>
npx -y npm@10.9.7 install --ignore-scripts
```

Remover overrides `postcss` / `next.postcss` de `package.json`.

## Veredito

**SEC-04 = GO condicional** — postcss unificado em 8.5.15; 4 frontends limpos no npm audit; G2 guest/admin PASS; G3 **8/8**.

Aguardando merge + carimbo documental.

---

*Atualizar [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md) após merge.*
