# Auth hardening smoke (#255)

| Cenário | Esperado | Como testar |
|---------|----------|-------------|
| Admin API sem token | **401** | `GET /api/admin/website/pages` |
| Admin API Bearer `admin-token-123` | **401** | Header demo rejeitado |
| Admin API JWT válido | **200** | Login admin + Bearer JWT |
| Login credencial inválida | **401** | API P0 A3 |
| Login infra DB down | **503** | PG parado (teste controlado) |
| Cookie demo admin | só dev | `ALLOW_DEMO_ADMIN=true` + `NODE_ENV=development` |

API P0: `docs/evidence/g4-kickoff/run-api-p0-round1.ps1` — A6 sem token = **401 OK**.
