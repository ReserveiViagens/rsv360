# Dependabot triage — 2026-06-22

## Merged (low risk)

| PR | Pacote | Notas |
|----|--------|-------|
| #547 | GitHub Actions group | |
| #449 | dompurify patch | |
| #450 | undici dev | |
| **#367** | form-data 4.0.5→4.0.6 | Merge 2026-06-22 (patch CVE) |

## Deferred (fora do sprint)

| PR | Motivo |
|----|--------|
| #342 | batch 35 deps — revisar por grupo |
| #343–#349 | React/ESLint patch/minor em apps — agrupar após smoke |
| #346 | ESLint 10 admin — breaking |
| #311, #305, #286 | batches prod-minor antigos — triagem separada |
| #228 | TypeScript 6 — major |
| #227 | mercadopago 3 — breaking |

## Observação #543

`nodemailer` 8→9 já constava como defer no plano; verificar em `main` se merge ocorreu antes desta triagem e validar e-mail em staging se necessário.

## Comandos

```bash
gh pr merge <n> --merge
gh pr checks <n>
npm audit --json | python3 .github/scripts/audit-gate.py /dev/stdin
```

## Pós-#367

Revalidar `security-scan.yml` na próxima execução em `main`.
