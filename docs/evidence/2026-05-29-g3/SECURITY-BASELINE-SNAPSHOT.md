# SECURITY-BASELINE — GO formal (29/05/2026)

**Decisão:** **`GO`**

## Evidência consolidada

| Área | Status |
|------|--------|
| S1 npm audit | 0 / 0 / 0 |
| S2 workspaces | 0 high (site-publico Next 15.5.18) |
| gitleaks S1 | 0 findings |
| G3 `G3-SUMMARY.tsv` | FAIL=0 |
| Rollback | drill PASS + `ROLLBACK-READINESS.md` |

## Trilha segurança S2 (resumo)

jspdf → nodemailer 7 → exceljs → T0b Next 15 → **0 high**

## Pendências pós-GO (não bloqueiam baseline)

- Merge branch `security/t0b-next15-site-publico`
- G2 site-publico na branch
- CI/CD segurança (Trilha 0)
- gitleaks S2: `.gitleaksignore` para `*.md` demo (opcional)
