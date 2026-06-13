# SEC-01 — Quick wins: shell-quote + joi

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-01-shell-quote-joi`  
**Base:** `main` @ `2af03f386` (inventário #314)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`

## Objetivo

Fechar bloco **P0** do [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md):

| Pacote | Antes | Depois | Alerta Dependabot |
|--------|-------|--------|-------------------|
| **shell-quote** | 1.8.3 | **1.8.4** | #132 (**critical**) |
| **joi** | 17.13.3 | **17.13.4** | #136 (**medium**) |

Sem `npm audit fix`, sem `npm audit fix --force`, sem downgrade, sem alterar Next / drizzle / mercadopago / exceljs / nodemailer / postcss / esbuild / uuid.

## Alterações

| Arquivo | Alteração |
|---------|-----------|
| `package.json` | `overrides`: `"shell-quote": "1.8.4"`, `"joi": "17.13.4"` |
| `package-lock.json` | bump **somente** `node_modules/shell-quote` e `node_modules/joi` (+ resolved/integrity) |

**Não alterado:** código de app, Dockerfile, workflows, demais dependências.

### Procedimento lockfile

1. `npx -y npm@10.9.7 install --package-lock-only --ignore-scripts` → aplicou **shell-quote@1.8.4**
2. `npx -y npm@10.9.7 update joi --ignore-scripts` → aplicou **joi@17.13.4** (override sozinho não rebentou entrada pinada do joi no lock)

Diff lockfile: **+8 / −2 linhas** — sem mudança massiva.

## Alertas esperados a fechar

| ID | Pacote | GHSA/CVE | Status esperado pós-merge |
|----|--------|----------|---------------------------|
| #132 | shell-quote | CVE-2026-9277 | **closed** |
| #136 | joi | CVE-2026-48038 | **closed** |

Confirmar no GitHub Security após merge (Dependabot re-scan).

## Validações

### npm audit (local)

| Escopo | critical | high | moderate | total | Δ vs inventário |
|--------|----------|------|----------|-------|-----------------|
| root | **0** | 3 | 11 | **14** | critical **−1**, total **−1** |
| apps/site-publico | **0** | 0 | 8 | **8** | total **−1** (joi) |

Artefatos: [logs/sec-01-npm-audit-root.json](./logs/sec-01-npm-audit-root.json), [logs/sec-01-npm-audit-site-publico.json](./logs/sec-01-npm-audit-site-publico.json)

### Lock scan

| Pacote | Versão lock | Artefato |
|--------|-------------|----------|
| shell-quote | **1.8.4** | [logs/sec-01-lock-verification.tsv](./logs/sec-01-lock-verification.tsv) |
| joi | **17.13.4** | idem |

### type-check (G2 mínimo)

| Workspace | Resultado | Notas |
|-----------|-----------|-------|
| apps/guest | **PASS** | [log](./logs/sec-01-typecheck-apps-guest.log) |
| apps/admin | **PASS** | [log](./logs/sec-01-typecheck-apps-admin.log) |
| apps/turismo | **FAIL** | @types/react drift root vs app — **pré-existente**, não ligado a joi/shell-quote |
| apps/site-publico | **FAIL** | baseline `.next/types` + débitos app — **fora escopo SEC-01** |

**Veredito type-check:** overrides **não** introduziram regressão em guest/admin (apps sem joi/shell-quote direct). Falhas turismo/site-publico = débitos documentados na rodada TS6, não hard stop desta PR.

### API P0 (G3 mínimo)

| Resultado | Artefato |
|-----------|----------|
| **8/8 OK** | [logs/sec-01-api-p0-summary.tsv](./logs/sec-01-api-p0-summary.tsv) |

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Override joi afeta artillery (dev site-publico) | Patch semver; sem API runtime |
| shell-quote via concurrently (dev) | Patch semver; não entra bundle produção front |
| `npm update joi` toca só entrada joi no lock | Diff revisado — 2 pacotes apenas |

## Rollback

```bash
git revert <merge-commit-SEC-01>
npx -y npm@10.9.7 install --ignore-scripts
```

Ou remover overrides `shell-quote` / `joi` de `package.json` e regenerar lock.

## Veredito

**SEC-01 = GO condicional** — quick wins P0 aplicados; critical shell-quote e medium joi resolvidos no lock local; G3 API P0 **8/8**; G2 guest/admin **PASS**.

**Aguardando:** merge + re-scan Dependabot GitHub.

---

*PR de correção isolada — não mistura inventário (#314) com fix.*
