# Capacity baseline (E5) — k6 + `/metrics`

Scaffolding only. **Douglas runs the measurement** after merge and brings p95 / error% back for SLO work.

## Backend `/metrics`

Already wired in the RSV360 backend (`prom-client` — no new npm dependency):

| Piece | Location |
| --- | --- |
| Registry + default Node metrics (`rsv360_*`) | `backend/src/monitoring/prometheus.js` |
| HTTP duration / total by route | same + `metricsMiddleware` in `backend/app.js` |
| Expose | `GET /metrics` |

```bash
curl -s http://localhost:3002/metrics | head
```

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed as a **system binary** (not in `package.json`)
- Backend reachable (local Docker `http://localhost:3002` by default)
- For import preview: `TOKEN` (admin/manager JWT) **or** `EMAIL` + `PASSWORD`

## Env

| Variable | Default | Notes |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:3002` | No trailing slash |
| `TOKEN` | _(empty)_ | Bearer JWT; skips login |
| `EMAIL` / `PASSWORD` | _(empty)_ | Login when `TOKEN` absent |
| `HOTEL_ID` | `piazza-diroma` | Listagem `/disponiveis` |
| `CHECK_IN` / `CHECK_OUT` | `2026-09-01` / `2026-09-04` | Stay window |

## Smoke

```powershell
k6 run tools/k6/smoke.js
k6 run -e BASE_URL=http://localhost:3002 -e TOKEN=$env:RSV_TOKEN tools/k6/smoke.js
```

Probes: `/health` → `/metrics` → login (optional) → `GET /api/v1/acomodacoes/disponiveis` → `POST /api/v1/cotacao/gerar-proposta` → `POST .../import/preview` (needs token).

## Load

```powershell
k6 run -e BASE_URL=http://localhost:3002 -e TOKEN=$env:RSV_TOKEN tools/k6/load.js
```

Light stages (5→15 VUs). Capture `http_req_duration` p95 and `http_req_failed` for the Notion SLO note.

## Notes

- `gerar-proposta` may return 403 when Turnstile is enforced; local bypass when `TURNSTILE_SECRET_KEY` is absent.
- Import preview is dry-run (`preview`) — still requires staff JWT (RBAC D1 / E4=A).
- Cooldown: do **not** add npm packages for this path; `prom-client` is already a backend dependency.
