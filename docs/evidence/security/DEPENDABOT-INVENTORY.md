# Dependabot / Security — Inventário HITL

**Data:** 2026-06-13  
**Branch:** `chore/security-dependabot-inventory`  
**Base:** `main` @ `77d01d561` (closeout TS6 — PR #313)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Modo:** inventário apenas — **nenhuma correção aplicada**

## Objetivo

Priorizar vulnerabilidades reportadas pelo GitHub Dependabot e `npm audit` **sem** `npm audit fix`, bumps automáticos ou alteração de runtime.

## Fontes coletadas

| Fonte | Comando / artefato |
|-------|------------------|
| Repositório | `gh repo view` — private, security policy habilitada |
| Dependabot (GitHub) | `gh api …/dependabot/alerts --paginate` → [logs/dependabot-alerts-raw.json](./logs/dependabot-alerts-raw.json) |
| Alertas abertos (TSV) | [logs/dependabot-alerts-open.tsv](./logs/dependabot-alerts-open.tsv) |
| npm audit por workspace | `npx -y npm@10.9.7 audit --workspace=<ws> --json` → [logs/npm-audit-*.json](./logs/) |
| Consolidação npm audit | [logs/npm-audit-consolidated.tsv](./logs/npm-audit-consolidated.tsv) |

Workspaces auditados: `backend`, `apps/site-publico`, `apps/turismo`, `apps/admin`, `apps/guest`, `packages/shared`.

---

## 1. Totais por severidade

### Dependabot — alertas **open** (fonte primária GitHub)

| Severidade | Quantidade |
|------------|------------|
| **critical** | 1 |
| **high** | 2 |
| **medium** | 8 |
| **low** | 4 |
| **Total open** | **15** |

Histórico total no API: 134 alertas (inclui `fixed` / `dismissed`).

### npm audit — por workspace (snapshot local, 2026-06-13)

| Workspace | critical | high | moderate | total |
|-----------|----------|------|----------|-------|
| backend | 0 | 3 | 4 | **7** |
| apps/site-publico | 0 | 0 | 9 | **9** |
| apps/turismo | 0 | 0 | 2 | **2** |
| apps/admin | 0 | 0 | 2 | **2** |
| apps/guest | 0 | 0 | 2 | **2** |
| packages/shared | 0 | 0 | 0 | **0** |

**Nota:** severidades npm (`moderate`) ≠ nomenclatura Dependabot (`medium`). Consolidar por **pacote + GHSA/CVE**, não só por contagem.

---

## 2. Top pacotes (alertas Dependabot open)

| Pacote | Alertas open | Severidade máxima | Manifests principais |
|--------|--------------|-------------------|----------------------|
| **esbuild** | 6 | **high** | `package-lock.json`, `backend/package-lock.json` |
| **nodemailer** | 4 | medium | `package-lock.json`, `apps/site-publico/package.json` |
| **uuid** | 2 | medium | `package-lock.json`, `backend/package-lock.json` |
| **joi** | 1 | medium | `package-lock.json` |
| **shell-quote** | 1 | **critical** | `package-lock.json` |
| **postcss** | 1 | medium | `package-lock.json` |

---

## 3. Workspaces afetados

| Workspace | Dependabot (manifest) | npm audit | Pacotes-chave |
|-----------|----------------------|-----------|---------------|
| **root / monorepo** | `package-lock.json` (9 alertas) | indireto via hoisting | shell-quote, joi, postcss, uuid, esbuild, nodemailer |
| **backend** | `backend/package-lock.json` (4 alertas) | 7 vulns | esbuild (tsx, drizzle-kit), uuid |
| **apps/site-publico** | `apps/site-publico/package.json` (2 alertas) | 9 vulns | nodemailer **7.0.13**, uuid, joi, postcss/next, exceljs, artillery (dev) |
| **apps/turismo** | — | 2 vulns | postcss/next (transitivo) |
| **apps/admin** | — | 2 vulns | postcss/next (transitivo) |
| **apps/guest** | — | 2 vulns | postcss/next (transitivo) |
| **packages/shared** | — | 0 | — |

### Versões instaladas relevantes (lockfile scan)

| Pacote | Onde | Versão atual | Patched mínimo (advisory) |
|--------|------|--------------|---------------------------|
| shell-quote | root → `concurrently` | **1.8.3** | **1.8.4** |
| joi | root (transitivo, ex. artillery) | **17.13.3** | **17.13.4** |
| nodemailer | root | 8.0.7 | 8.0.11 (npm audit) / 8.0.5 (GHSA-vvjj) |
| nodemailer | apps/site-publico | **7.0.13** | **8.x** (major) |
| uuid | root | 9.0.1 (+ nested 8.3.2) | 11.1.1 (Dependabot) |
| uuid | backend lock | 9.0.1 | 11.1.1 |
| postcss | next em cada app | **8.4.31** (nested) + 8.5.15 app-level | **8.5.10** |
| postcss | root hoisted | 8.5.13 | 8.5.10 ✓ |
| esbuild | tsx / drizzle-kit / backend | 0.18.20 – **0.28.0** | **0.28.1** (high), 0.25.0+ (medium antigo) |

---

## 4. Matriz de priorização

| # | Pacote | Sev. | Origem provável | Correção provável | Breaking change | Ordem sugerida |
|---|--------|------|-----------------|-------------------|-----------------|---------------|
| 1 | **shell-quote** | critical | `concurrently` (root devDep) | override `1.8.4` ou bump `concurrently` | **Baixo** | **P0 — quick win** |
| 2 | **joi** | medium | artillery / dev tooling (root) | bump transitivo → 17.13.4 | **Baixo** (patch) | **P0 — quick win** |
| 3 | **nodemailer** (site-publico) | medium/low | direct dep `^7.0.13` | bump **7 → 8.x** + testes SMTP | **Médio** (major) | **P1 — PR isolado** |
| 4 | **nodemailer** (root) | medium/low | direct dep `^8.0.7` | patch **8.0.11** | **Baixo** | **P1 — PR isolado** |
| 5 | **postcss** via **Next** | medium | `next/node_modules/postcss@8.4.31` em 4 apps | override postcss ≥8.5.10 **ou** Next patch/canary | **Médio** (build/CSS) | **P1 — PR isolado por app ou override monorepo** |
| 6 | **uuid** | medium | exceljs, mercadopago, @ngneat/falso, root | bump deps pai ou override uuid | **Médio–Alto** (mercadopago 3.x?) | **P2** |
| 7 | **esbuild** | high/medium | tsx, drizzle-kit, backend lock duplicado | bump tsx/drizzle-kit; alinhar locks | **Alto** (drizzle-kit major sugerido pelo audit — **rejeitar**) | **P2 — PR backend isolado** |

---

## 5. Quick wins (sem breaking change esperado)

1. **`shell-quote@1.8.4`** via `overrides` no root ou upgrade `concurrently` — fecha alerta **critical #132**.
2. **`joi@17.13.4`** — patch; origem dev (`artillery` no site-publico / tooling root).
3. **`nodemailer@8.0.11`** no root — patch sobre 8.0.7 (validar changelog 8.0.5–8.0.11).
4. Revisar alertas **postcss root #83** — lock já tem 8.5.13; pode ser **alerta stale** ou cópia nested; confirmar após PR postcss/Next.

---

## 6. Hard stops (não aplicar cegamente)

| Sugestão npm audit | Por que parar |
|--------------------|---------------|
| `next@9.3.3` para corrigir postcss | **Downgrade major** — incompatible com Next 16 / rodada TS6 |
| `drizzle-kit@0.19.1` para corrigir esbuild | **Downgrade major** — backend usa ^0.31.10 |
| `mercadopago@3.1.0` para uuid | **Major** — backend usa ^2.12.0 |
| `exceljs@3.4.0` para uuid | **Downgrade** — site-publico usa >=3.5.0 |
| `npm audit fix --force` | Proibido nesta trilha — risco de quebra silenciosa |
| Alterar workflows / Docker / S1 | **Fora de escopo** desta trilha |

---

## 7. Proposta de PRs pequenos (próxima fase — ainda **não** abrir)

| PR | Escopo | Gates sugeridos |
|----|--------|-----------------|
| **SEC-01** | override `shell-quote@1.8.4` (+ joi 17.13.4) | **GO pós-merge** #315 — alertas #132/#136 fixed |
| **SEC-02** | nodemailer root 8.0.11 | **GO pós-merge** #317/#318 |
| **SEC-03** | nodemailer site-publico 7→8 | **GO pós-merge** #319/#320 |
| **SEC-04** | postcss override 8.5.15 | **PR impl pendente** — [SEC-04-POSTCSS-RESULT.md](./SEC-04-POSTCSS-RESULT.md) |
| **SEC-05** | backend esbuild chain (tsx / drizzle-kit) | backend tests; migrate dry-run; **sem** downgrade drizzle |
| **SEC-06** | uuid via bumps controlados (mercadopago, exceljs) | pagamentos + export xlsx smoke |

Após quick wins + high/critical: **revalidar G2/G3** antes de `.next/types`, Express 5 ou Tailwind 4.

---

## 8. Sequência recomendada (estilo bisturi)

```
1. Security inventory (este documento)     ← AGORA
2. Quick wins sem breaking change          ← SEC-01, SEC-02
3. High/Critical por PR isolado            ← SEC-03, SEC-04, SEC-05
4. Revalidar G2/G3
5. Só então: .next/types | Express 5 | Tailwind 4
```

---

## 9. Veredito HITL

| Item | Status |
|------|--------|
| Inventário Dependabot/security | **GO** — #314 mergeada |
| **SEC-01** (shell-quote + joi) | **GO pós-merge** — #315 @ `b320b0543`; alertas #132/#136 **fixed** — ver [SEC-01-POST-MERGE.md](./SEC-01-POST-MERGE.md) |
| Dependabot open (pós SEC-01) | **13** (0 critical, 2 high, 7 medium, 4 low) |
| **SEC-02** nodemailer root patch | **MERGED** — #317 @ `714078a4`; root `nodemailer` em `8.0.11`; fechamento Dependabot **HOLD** (#130/#131 ainda `open` antes da SEC-03) — ver [SEC-02-POST-MERGE.md](./SEC-02-POST-MERGE.md) |
| **SEC-03** nodemailer site-publico major | **GO pos-merge** — #319 @ `9f11d7d3`; `apps/site-publico` `nodemailer` em `8.0.11`; alertas #128/#129/#130/#131 **fixed** — ver [SEC-03-POST-MERGE.md](./SEC-03-POST-MERGE.md) |
| Dependabot open (pos SEC-03) | **9** (0 critical, 2 high, 5 medium, 2 low) |
| **SEC-04** postcss override | **GO pós-merge** — #321/#322; alerta #83 **fixed** |
| **SEC-05** esbuild | **GO pós-merge** — #323/#324; alertas esbuild **fixed** |
| **SEC-06** uuid | **GO pós-merge** — #325 + carimbo; alertas #122/#124 **fixed** |
| Dependabot open (pós SEC-06) | **0** |
| Tailwind 4 / Express 5 / `.next/types` | **NOGO** — trilhas separadas |

**Handoff vivo:** [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md)

**Closeout trilha:** [SECURITY-TRAIL-CLOSEOUT.md](./SECURITY-TRAIL-CLOSEOUT.md)

**Próxima decisão HITL:** G2/G3, `.next/types`, Tailwind 4 ou Express 5 — ver closeout §8.

---

## Artefatos

| Arquivo | Descrição |
|---------|-----------|
| [logs/dependabot-alerts-raw.json](./logs/dependabot-alerts-raw.json) | Payload completo API (134 alertas) |
| [logs/dependabot-alerts-open.tsv](./logs/dependabot-alerts-open.tsv) | 15 alertas open tabulados |
| [logs/npm-audit-consolidated.tsv](./logs/npm-audit-consolidated.tsv) | 22 entradas npm audit (6 workspaces) |
| [logs/npm-audit-backend.json](./logs/npm-audit-backend.json) | Audit JSON backend |
| [logs/npm-audit-apps-site-publico.json](./logs/npm-audit-apps-site-publico.json) | Audit JSON site-publico |
| [logs/npm-audit-apps-turismo.json](./logs/npm-audit-apps-turismo.json) | Audit JSON turismo |
| [logs/npm-audit-apps-admin.json](./logs/npm-audit-apps-admin.json) | Audit JSON admin |
| [logs/npm-audit-apps-guest.json](./logs/npm-audit-apps-guest.json) | Audit JSON guest |
| [logs/npm-audit-packages-shared.json](./logs/npm-audit-packages-shared.json) | Audit JSON shared (0 vulns) |
| [SEC-01-SHELL-QUOTE-JOI.md](./SEC-01-SHELL-QUOTE-JOI.md) | Correção SEC-01 (#315) |
| [SEC-01-POST-MERGE.md](./SEC-01-POST-MERGE.md) | Carimbo pós-merge SEC-01 |
| [logs/sec-01-post-merge-summary.tsv](./logs/sec-01-post-merge-summary.tsv) | Gates pós-merge SEC-01 |
| [SEC-02-POST-MERGE.md](./SEC-02-POST-MERGE.md) | Carimbo pós-merge SEC-02 |
| [logs/sec-02-post-merge-summary.tsv](./logs/sec-02-post-merge-summary.tsv) | Gates pós-merge SEC-02 |
| [SEC-03-POST-MERGE.md](./SEC-03-POST-MERGE.md) | Carimbo pós-merge SEC-03 |
| [logs/sec-03-post-merge-summary.tsv](./logs/sec-03-post-merge-summary.tsv) | Gates pós-merge SEC-03 |
| [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md) | **Handoff vivo Cursor + Codex** |
| [SEC-04-POSTCSS-PLAN.md](./SEC-04-POSTCSS-PLAN.md) | Plano HITL SEC-04 |
| [SEC-04-POSTCSS-RESULT.md](./SEC-04-POSTCSS-RESULT.md) | Resultado impl SEC-04 |
| [SEC-04-POST-MERGE.md](./SEC-04-POST-MERGE.md) | Carimbo pós-merge SEC-04 |
| [SEC-05-POST-MERGE.md](./SEC-05-POST-MERGE.md) | Carimbo pós-merge SEC-05 |
| [SEC-06-UUID-RESULT.md](./SEC-06-UUID-RESULT.md) | Resultado impl SEC-06 |
| [SEC-06-POST-MERGE.md](./SEC-06-POST-MERGE.md) | Carimbo pós-merge SEC-06 |
| [SECURITY-TRAIL-CLOSEOUT.md](./SECURITY-TRAIL-CLOSEOUT.md) | Fechamento formal trilha security |

*Documento de inventário — não altera `package.json`, lockfiles, código, Docker ou workflows.*
