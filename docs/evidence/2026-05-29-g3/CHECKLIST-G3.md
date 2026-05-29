# CHECKLIST-G3

Data: 2026-05-29
Executor: run-g3-security-wsl.sh (WSL)

## Pre-requisitos

- [x] G2-S2 = GO
- [x] G2-integrado = GO (21/21)
- [x] Evidencia G2 congelada (`logs/g2-summary-frozen.tsv`)

## Seguranca

- [x] npm audit S1 — `logs/S1/npm-audit.json` (WARN: 7 high, 0 critical)
- [x] npm audit S2 (backend + frontends) — `logs/S2/*-npm-audit.json`
- [x] gitleaks S1 — 0 findings
- [x] gitleaks S2 — 0 findings
- [x] Sem segredos reportados (gitleaks)
- [x] Findings criticos S2: jspdf ^4.2.1 (site-publico + turismo)

## Smoke critico

- [x] `http://127.0.0.1:3000` (site S2) — 200
- [x] `http://127.0.0.1:3002/health` (backend S2) — 200
- [ ] `http://127.0.0.1:5000` ou `/api/status` (S1 — servico parado)

## Rollback

- [x] `ROLLBACK-READINESS.md` gerado
- [ ] Tag/imagem Docker anterior identificada
- [ ] Procedimento restore DB documentado

## Decisao

- SECURITY-BASELINE: **GO** (29/05/2026)
- GATES-v3 G3: **GO**

## Proximos passos

1. [x] gitleaks + S1 audit fix (0 total)
2. [x] **T0** site-publico: `next` + `eslint-config-next` → 14.2.35 (high Next sem redução)
3. [x] **T1** site-publico: `nodemailer` ^7.0.13 + lint/build OK (6→5 high)
4. [x] turismo: `xlsx` removido (0 high)
5. [x] **T2** `xlsx` → `exceljs` (4 high restantes = Next/eslint)
6. [x] **T0b** Next 15.5.x — lint/build OK, **high=0**
7. [x] **ROLLBACK-READINESS** + drill PASS
8. [ ] Merge branch `security/t0b-next15-site-publico`
8. [ ] Reexecutar **G2** site-publico na branch (recomendado antes do merge)
5. [ ] Plano completo: `S2-SITE-PUBLICO-HIGH-MITIGATION.md`
6. [ ] Rollback-READINESS.md + re-audit G3
