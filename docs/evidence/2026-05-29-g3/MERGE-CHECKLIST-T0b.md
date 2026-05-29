# Checklist — merge `security/t0b-next15-site-publico`

**Data alvo:** 2026-05-29  
**Gates:** SECURITY-BASELINE **GO** | G3 **GO** | G2-integrado **GO** (pré-merge)

> **Nota:** se o repositório ainda não tiver commit inicial, faça o **primeiro commit** na branch T0b antes do merge.

---

## 1) Pré-merge (na branch T0b)

```bash
S2_ROOT='/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores'
cd "$S2_ROOT"

git branch --show-current   # deve: security/t0b-next15-site-publico

# Validar site-publico
cd apps/site-publico
npm run lint
npm run build
npm audit   # esperado: 0 critical, 0 high

# G2 integrado (recomendado)
cd "$S2_ROOT"
bash docs/evidence/2026-05-28/run-g2-wsl.sh
# esperado: PASS=21, FAIL=0

# G3 evidência final
bash docs/evidence/2026-05-29-g3/run-g3-security-wsl.sh
# esperado: FAIL=0; site-publico crit=0 high=0
```

---

## 2) Commit (se ainda não commitado)

```bash
cd "$S2_ROOT"
git add apps/site-publico/package.json apps/site-publico/package-lock.json
git add apps/site-publico/lib/excel-workbook.ts
git add apps/site-publico/lib/export-reports.ts
git add apps/site-publico/lib/accounting-integration.ts
git add apps/site-publico/lib/reports-service.ts
git add apps/turismo/package.json apps/turismo/package-lock.json
git add docs/evidence/2026-05-29-g3/
git add docs/integracao-v3/sprint-0/SECURITY-BASELINE.md   # se path no monorepo integração — ajustar

git status
git commit -m "$(cat <<'EOF'
security(site-publico): G3 GO — Next 15, exceljs, nodemailer 7

- Upgrade next/eslint-config-next to 15.5.x (T0b)
- Migrate xlsx to exceljs; nodemailer ^7; jspdf ^4.2.1
- Evidence: docs/evidence/2026-05-29-g3 (G3 FAIL=0, rollback drill PASS)
- Gates: SECURITY-BASELINE=GO, G3=GO (2026-05-29)

EOF
)"
```

Ajuste `git add` conforme arquivos realmente alterados (`git status`).

---

## 3) Merge para branch principal

```bash
cd "$S2_ROOT"
git checkout master   # ou main
git merge --no-ff security/t0b-next15-site-publico -m "Merge branch 'security/t0b-next15-site-publico' — G3 security GO"
```

Se `master` não existir (repo novo):

```bash
git checkout -b master
# commit já na T0b; renomear ou merge fast-forward conforme política do time
```

---

## 4) Pós-merge

```bash
# Recongelar G2 na main/master
bash docs/evidence/2026-05-28/run-g2-wsl.sh
cp docs/evidence/2026-05-28/logs/SUMMARY.tsv \
   docs/evidence/2026-05-29-g3/logs/g2-summary-post-merge.tsv

# Rebuild Docker site-publico (quando aplicável)
docker compose -p rsv360 build site-publico
docker compose -p rsv360 up -d site-publico backend

# Smoke
curl -s -o /dev/null -w 'site %{http_code}\n' http://127.0.0.1:3000
curl -s -o /dev/null -w 'api %{http_code}\n' http://127.0.0.1:3002/health
```

---

## 5) Checklist final

- [ ] Merge concluído sem conflitos (ou resolvidos + build OK)
- [ ] G2 pós-merge: 21/21 PASS
- [ ] G3-SUMMARY.tsv arquivado pós-merge
- [ ] Release note publicada (`RELEASE-NOTE-2026-05-29-G3-GO.md`)
- [ ] Tag opcional: `g3-go-2026-05-29` / `site-publico-next15`
