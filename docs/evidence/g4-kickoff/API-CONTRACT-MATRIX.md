# Matriz contrato API — P0 (rodada 1)

**Data:** 2026-05-29T19:09-03:00  
**Perfil:** Docker Compose canônico (serviços `Up`)  
**Bases URL:**

| Superfície | Base | Rotas P0 BFF |
|------------|------|----------------|
| Backend S2 | `http://127.0.0.1:3002` | `/health`, `/api/v1/payments/*` |
| Site público (Next BFF) | `http://127.0.0.1:3000` | `/api/auth/*`, `/api/bookings`, `/api/admin/website/*` |

**Script:** `run-api-p0-round1.sh`  
**Logs:** `logs/A*.log`, `logs/API-P0-SUMMARY.tsv`

## Legenda

| Status | Significado |
|--------|-------------|
| **OK** | Resposta HTTP esperada para smoke/payload mínimo |
| **GAP** | Rota ausente, env incompleto ou contrato documentado ≠ implementação |
| **FAIL** | 5xx ou comportamento incorreto (ex.: 500 onde esperava 4xx) |
| **SKIP** | Fora do perfil canônico S2 |

## Matriz P0

| ID | Rota | Método | Consumidor | HTTP | Status | Nota |
|----|------|--------|------------|------|--------|------|
| A1 | `/health` | GET | todos | 200 | **OK** | Backend JSON `status: OK` |
| A2 | `/health/security` | GET | admin/ops | 404 | **GAP** | Rota anunciada em `server.js` log; não registrada em `SecurityConfig` |
| A3 | `/api/auth/login` | POST | site-publico | 500 | **FAIL** | Payload inválido; esperado 400/401, não 5xx — provável falha DB/env no container `:3000` |
| A4 | `/api/auth/refresh` | POST | site-publico | 400 | **OK** | `{}` → `refresh_token é obrigatório` |
| A5g | `/api/bookings` | GET | site-publico | 400 | **OK** | Sem query → mensagem de contrato válida |
| A5p | `/api/bookings` | POST | site-publico | 400 | **OK** | `{}` → validação de campos |
| A6 | `/api/admin/website/pages` | GET | site-publico CMS | 500 | **GAP** | Auth demo OK no código; **500** — `DATABASE_URL` ausente no serviço `site-publico` no compose |
| A7g | `/api/v1/payments/payments?enterpriseId=ent_1` | GET | integrações | 200 | **OK** | Lista pagamentos mock |
| A7p | `/api/v1/payments/payments` | POST | site-publico | 200 | **OK** | Payload mínimo PIX mock `pay_mock_*` |
| A8 | CRM S1 `:5000` | — | legado | — | **SKIP** | Fora do perfil canônico |

## Veredito bloco G4-API (rodada 1)

| Critério | Resultado |
|----------|-----------|
| P0 sem SKIP com OK | **6/8** rotas testáveis |
| FAIL | **1** (A3) |
| GAP | **2** (A2, A6) |
| **Gate G4-API** | **NOGO** |

### Ações para GO (rodada 2)

1. **A2:** implementar `GET /health/security` no backend ou remover referência em `server.js`.
2. **A3/A6:** injetar `DATABASE_URL` (e deps) no serviço `site-publico` no `docker-compose.yml`; re-smoke.
3. Reexecutar `bash docs/evidence/g4-kickoff/run-api-p0-round1.sh` até 0 FAIL e GAPs aceitos/documentados.
