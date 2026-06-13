# E5 — Express 5 backend verification (ADR-0003)

**Data:** 2026-06-13  
**Base:** `main` @ `d845e65e8` (montanha A #327 mergeada)  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**ADR:** [ADR-0003-FASE-E-STACK-RESIDUAL.md](./ADR-0003-FASE-E-STACK-RESIDUAL.md) — sub-fase **E4** (verificação, sem bump)

## Objetivo

Confirmar que o **backend canônico** opera em **Express 5.x** sem APIs removidas do Express 4, com runtime Docker estável e API P0 verde — **sem alterar versões ou código** nesta montanha.

## Versão instalada

| Escopo | Declarado | Lock / runtime |
|--------|-----------|----------------|
| `backend/package.json` | `^5.2.1` | **5.2.1** |
| Container `rsv360-backend` | — | **5.2.1** (`docker compose exec`) |
| `swagger-ui-express` | `^5.0.1` | peer `express >=4 \|\| >=5` ✓ |

Artefato: [logs/express5-version.txt](./logs/express5-version.txt)

## Scan estático (APIs removidas Express 5)

Escopo: `backend/` + `server/modules/` (canônico).

| Padrão | Hits | Veredito |
|--------|------|----------|
| `app.del(` | 0 | **PASS** |
| `req.param(` | 0 | **PASS** |
| `app.configure(` | 0 | **PASS** |
| `res.send(<status>)` legado | 0 | **PASS** |

Artefato: [logs/express5-static-scan.tsv](./logs/express5-static-scan.tsv)

**Fora de escopo (ADR):** Express **4.x** em `apps/turismo/pages/**` (legado aninhado) — não entra no backend canônico `:3002`.

## Gates runtime

| Gate | Resultado | Artefato |
|------|-----------|----------|
| API P0 | **8/8 OK** | [logs/express5-api-p0-summary.tsv](./logs/express5-api-p0-summary.tsv) |
| `/health` Docker | **200** | incluso em API P0 A1 |
| `/health/security` | **200** | incluso em API P0 A2 |
| Payments POST/GET | **200** | A7g/A7p |

## Testes Jest (local worktree)

| Métrica | Resultado |
|---------|-----------|
| Total | **17/22 PASS** |
| Unit | **7/7 suites PASS** |
| Integration falhas | **5** — `DATABASE_URL is required` (ambiente local sem `.env`; **pré-existente**, não regressão Express) |

Artefato: [logs/express5-backend-test-run.log](./logs/express5-backend-test-run.log)

**Leitura:** runtime Docker + API P0 são gates primários desta montanha; integração local exige `DATABASE_URL` (débito operacional documentado na trilha SEC/G2G3).

## Veredito

| Item | Resultado |
|------|-----------|
| Backend canônico em Express 5 | **GO** — já em **5.2.1** |
| APIs deprecated Express 4 | **GO** — 0 hits no scan |
| Runtime produção-like (Docker) | **GO** — healthy + API P0 **8/8** |
| **Montanha D** | **GO condicional** |

**Não aplicado nesta montanha:** bump de versão, refactor de rotas, migração do legado `apps/turismo/pages/**`.

## Próxima montanha

**C — Tailwind 4** piloto `apps/guest` + `apps/admin` (ADR-0003 E3).

Script reprodutível: [run-express5-verify.ps1](./run-express5-verify.ps1)

---

*Evidência — não altera deps, código ou runtime.*
