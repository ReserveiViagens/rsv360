# Matriz contrato API — P0

**Perfil:** Docker Compose canônico (serviços `Up`)  
**Bases URL:**

| Superfície | Base | Rotas P0 BFF |
|------------|------|----------------|
| Backend S2 | `http://127.0.0.1:3002` | `/health`, `/health/security`, `/api/v1/payments/*` |
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

---

## Rodada 2 (snapshot atual)

**Data:** 2026-05-29T19:45-03:00  
**PR código:** `chore/g4-api-p0-round2`  
**Validação rodada 1:** PR [#241](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/241) merged (docs)

| ID | Rota | Método | Consumidor | HTTP | Status | Nota |
|----|------|--------|------------|------|--------|------|
| A1 | `/health` | GET | todos | 200 | **OK** | Backend JSON `status: OK` |
| A2 | `/health/security` | GET | admin/ops | 200 | **OK** | Implementado em `SecurityConfig.setupHealthCheck` |
| A3 | `/api/auth/login` | POST | site-publico | 401 | **OK** | Credencial inválida → 401; exige tabelas `auth_rate_limits` (ver `database/g4-auth-smoke-tables.sql`) |
| A4 | `/api/auth/refresh` | POST | site-publico | 400 | **OK** | `{}` → `refresh_token é obrigatório` |
| A5g | `/api/bookings` | GET | site-publico | 400 | **OK** | Sem query → mensagem de contrato válida |
| A5p | `/api/bookings` | POST | site-publico | 400 | **OK** | `{}` → validação de campos |
| A6 | `/api/admin/website/pages` | GET | site-publico CMS | **401** sem token; 200 com JWT admin | **OK** | Pós-#255: demo `admin-token-123` rejeitado |
| A7g | `/api/v1/payments/payments?enterpriseId=ent_1` | GET | integrações | 200 | **OK** | Lista pagamentos mock |
| A7p | `/api/v1/payments/payments` | POST | site-publico | 200 | **OK** | Payload mínimo PIX mock |
| A8 | CRM S1 `:5000` | — | legado | — | **SKIP** | Fora do perfil canônico |

### Veredito bloco G4-API (rodada 2)

| Critério | Resultado |
|----------|-----------|
| P0 testáveis com OK | **8/8** |
| FAIL | **0** |
| GAP | **0** |
| **Gate G4-API (P0 smoke)** | **GO** |

### Mudanças aplicadas (rodada 2)

1. `docker-compose.yml` — `site-publico`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`; `depends_on: postgres`.
2. `backend/src/middleware/security-config.js` — `GET /health/security`.
3. `database/g4-auth-smoke-tables.sql` — init idempotente + one-shot em DB existente para A3.
4. Re-smoke: `API-P0-SUMMARY.tsv` (8× OK).

---

## Rodada 1 (histórico — NOGO)

**Data:** 2026-05-29T19:09-03:00 · **PR:** #241

| Resultado | Valor |
|-----------|------:|
| OK | 6/8 |
| FAIL | 1 (A3 → 500) |
| GAP | 2 (A2 → 404, A6 → 500) |
| **Gate** | **NOGO** |

Veredito validado pelo operador em 2026-05-29T19:25.
