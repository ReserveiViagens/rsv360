# Release Note — Sprint 0 / Gate G3 Security GO

**Versão:** `g3-go-2026-05-29`  
**Data:** 29/05/2026  
**Branch:** `security/t0b-next15-site-publico` → merge em `master`/`main`  
**Produto:** RSV360 — monorepo S2 (`Sistema Reservei Viagens com todos os Servidores`)

---

## Resumo

Fechamento do **Gate G3** (segurança + rollback + smoke) com **SECURITY-BASELINE = GO** e **G3 = GO**.  
Stack `apps/site-publico` atualizada para **Next.js 15.5.x**, dependências de risco corrigidas ou migradas, evidências em `docs/evidence/2026-05-29-g3/`.

---

## Decisão de gates

| Gate | Status | Data |
|------|--------|------|
| G2-integrado | GO (21/21) | 29/05/2026 |
| SECURITY-BASELINE | **GO** | 29/05/2026 |
| G3 | **GO** | 29/05/2026 |
| G4 | NOGO | Trilha 0 pendente |

---

## Versões principais (`apps/site-publico`)

| Pacote | Antes | Depois |
|--------|-------|--------|
| next | ^14.2.35 | **^15.5.18** |
| eslint-config-next | ^14.2.35 | **^15.5.16+** |
| nodemailer | ^6.10.x | **^7.0.13** |
| jspdf | (vuln. critical) | **^4.2.1** |
| xlsx | ^0.18.5 | **removido** → **exceljs ^4.4.0** |

**Outros S2:** `apps/turismo` — removido `xlsx` não utilizado (0 high).

**S1 (CRM):** `drizzle-orm ^0.45.2`; `npm audit fix` conservador — **0 vulnerabilidades**.

---

## npm audit (gate G3)

| Workspace | critical | high | moderate |
|-----------|----------|------|----------|
| S1 CRM | 0 | 0 | 0 |
| S2 site-publico | 0 | **0** | 8 |
| S2 backend, admin, guest, turismo | 0 | 0 | 2–6 |

---

## Evidências (artefatos)

| Artefato | Caminho |
|----------|---------|
| **G3-SUMMARY** | `docs/evidence/2026-05-29-g3/logs/G3-SUMMARY.tsv` |
| G2 congelado | `docs/evidence/2026-05-29-g3/logs/g2-summary-frozen.tsv` |
| Rollback drill | `docs/evidence/2026-05-29-g3/logs/ROLLBACK-DRILL-RESULT.txt` |
| Rollback readiness | `docs/evidence/2026-05-29-g3/logs/ROLLBACK-READINESS.md` |
| Plano mitigação | `docs/evidence/2026-05-29-g3/S2-SITE-PUBLICO-HIGH-MITIGATION.md` |
| Baseline formal | `docs/integracao-v3/sprint-0/SECURITY-BASELINE.md` |
| Gates | `docs/integracao-v3/sprint-0/GATES-v3.md` |

**G3-SUMMARY (29/05):** `PASS=12`, `WARN=3`, **`FAIL=0`**

---

## Riscos aceitos (WARN — não bloqueantes)

| WARN | Motivo | Ação futura |
|------|--------|-------------|
| **smoke S1** `:5000` | CRM dev não estava em execução no momento do scan | Rodar smoke com `npm run dev` no S1 antes de G1 dual-system |
| **gitleaks S2** | Matches `demo-token` em arquivos `.md` de documentação/curl de exemplo | Adicionar `.gitleaksignore` ou excluir `**/*.md` de análise não-prod |
| **moderate S2** | Transitivas (esbuild, brace-expansion, etc.) | Trilha 0 — CI com `npm audit` + política de exceção |

Nenhum **critical** ou **high** aberto em S1/S2 no fechamento do gate.

---

## Rollback

- Drill executado: backup `rollback-test-pre-t0b.dump` + restore em DB isolada → **RESULT=PASS**
- Procedimento: `docs/evidence/2026-05-29-g3/logs/ROLLBACK-READINESS.md`
- Imagens Docker atuais (dev): `rsv360-phase1-site-publico`, etc.

---

## Mudanças de código (destaque)

- `lib/excel-workbook.ts` (novo) — utilitário ExcelJS
- `lib/export-reports.ts`, `lib/accounting-integration.ts`, `lib/reports-service.ts` — migração xlsx → exceljs
- `package.json` / lockfiles — Next 15, nodemailer 7, exceljs

---

## Próximos passos (pós-merge)

1. Merge `security/t0b-next15-site-publico`
2. `run-g2-wsl.sh` na branch principal → congelar `g2-summary-post-merge.tsv`
3. Rebuild imagem Docker `site-publico`
4. Trilha 0: CI/CD segurança obrigatório, G4

---

## Contato / aprovação

- **Aprovador gate segurança:** _preencher_  
- **Evidência coletada por:** pipeline G3 `run-g3-security-wsl.sh` + drills manuais  
- **Modernização (stack/fusão/auth):** permanece **NOGO** até G0–G4 conforme plano mestre
