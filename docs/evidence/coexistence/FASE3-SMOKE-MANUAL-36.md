# Fase 3 — Smoke manual (36 testes)

**Objetivo:** validação humana ponta a ponta (S1 `:5000` + S2 `:3002`/`:3000`) após merge PR #582.  
**Espelho:** Notion — Checklist Geral → Smoke manual Fase 3  
**Automatizado (subset):** `npm run test:e2e:marketing-lab` cobre testes **35–36** parcialmente.

## Pré-requisitos

```powershell
# Terminal 1 — S2 Docker ou dev
docker compose -p rsv360 up -d backend site-publico postgres
# ou: cd backend; npm run dev  +  cd apps/site-publico; npm run dev

# Terminal 2 — S1
cd "C:\Users\RSV 360\Documents\GitHub\Crm-RSV-360"
# RSV360_BACKEND_URL=http://127.0.0.1:3002
# SSO_BFF_SECRET=<mesmo valor no backend e site-publico>
npm run dev
```

| Variável | S1 | backend | site-publico |
|----------|-----|---------|--------------|
| `SSO_BFF_SECRET` | ✓ | ✓ | ✓ |
| `RSV360_BACKEND_URL` | `http://127.0.0.1:3002` | — | — |
| `MARKETING_LAB_URL` | — | `http://localhost:3000` | — |

**Executado por:** _______________ **Data:** _______________

---

## Bloco A — Infra S1 (6)

| # | Teste | Como validar | OK |
|---|-------|--------------|-----|
| A1 | S1 root responde | `GET http://localhost:5000/` → 200 | ☐ |
| A2 | S1 health | `GET http://localhost:5000/health` → 200 | ☐ |
| A3 | S1 API status | `GET http://localhost:5000/api/status` → 200 | ☐ |
| A4 | Login S1 | `demo@reservei.com.br` / `demo123` → sessão ativa | ☐ |
| A5 | Página perfil | `/perfil` ou equivalente carrega sem erro | ☐ |
| A6 | Link Marketing Lab | Botão/link visível no perfil ou menu | ☐ |

## Bloco B — Infra S2 (7)

| # | Teste | Como validar | OK |
|---|-------|--------------|-----|
| B1 | Backend health | `GET http://localhost:3002/health` → 200 | ☐ |
| B2 | Backend security health | `GET http://localhost:3002/health/security` → 200 | ☐ |
| B3 | Site público | `GET http://localhost:3000/` → 200 ou 307 | ☐ |
| B4 | Postgres (Docker) | `docker ps` → postgres `healthy` | ☐ |
| B5 | site-publico container | container `Up` / `healthy` | ☐ |
| B6 | Secret SSO alinhado | Mesmo `SSO_BFF_SECRET` nos 3 serviços | ☐ |
| B7 | `sso/issue` API | POST com `X-Sso-Bff-Secret` → 200 + `callback_url` | ☐ |

## Bloco C — SSO S1 → Lab (8)

| # | Teste | Como validar | OK |
|---|-------|--------------|-----|
| C1 | Handoff S1 | Perfil → Marketing Lab inicia redirect | ☐ |
| C2 | Callback URL | URL contém `/api/auth/sso/callback?code=` | ☐ |
| C3 | Sessão Lab | Após redirect, URL é `/lab` (ou `return_url`) | ☐ |
| C4 | Cookies | `auth_token` e `refresh_token` nos cookies `:3000` | ☐ |
| C5 | Shell visível | Heading **Marketing Lab** + **Bem-vindo ao Marketing Lab** | ☐ |
| C6 | User badge | Badge mostra email/nome (não só "Sessão SSO") | ☐ |
| C7 | Sem sessão | `/lab` sem cookie → redirect `/login` | ☐ |
| C8 | Nav lateral | 9 itens (Visão geral, Métricas, Eventos, Campanhas…) | ☐ |

## Bloco D — Tracking / Eventos (7)

| # | Teste | Como validar | OK |
|---|-------|--------------|-----|
| D1 | page_view automático | Navegar `/lab` → evento `page_view` em `/lab/events` | ☐ |
| D2 | page_view em métricas | Ir `/lab/metrics` → novo `page_view` no stream | ☐ |
| D3 | Simular lead | Botão **Simular lead** → linha `lead` na tabela | ☐ |
| D4 | Simular cadastro | Botão **Simular cadastro** → linha `signup` | ☐ |
| D5 | Simular conversão | Botão **Simular conversão** → linha `conversion` | ☐ |
| D6 | API eventos | DevTools → `GET /api/lab/events` → 200 + lista | ☐ |
| D7 | Pixel POST | DevTools → `POST /api/lab/track` → 200 | ☐ |

## Bloco E — Métricas (5)

| # | Teste | Como validar | OK |
|---|-------|--------------|-----|
| E1 | Dashboard carrega | `/lab/metrics` → 6 KPI cards visíveis | ☐ |
| E2 | Gráfico leads | Chart "Leads ao longo do tempo" renderiza | ☐ |
| E3 | Gráfico canais | Chart "Leads por canal" renderiza | ☐ |
| E4 | KPI leads ≥ 1 | Após eventos D1–D5, card **Leads** ≥ 1 | ☐ |
| E5 | KPI conversões ≥ 1 | Após D5, card **Conversões** ≥ 1 | ☐ |

## Bloco F — Regressão + E2E (3)

| # | Teste | Como validar | OK |
|---|-------|--------------|-----|
| F1 | Seletor período | Botões 7d / 30d / 90d alteram dados sem erro | ☐ |
| F2 | Links marketing | `/marketing/campaigns` abre (mesmo shell ou página) | ☐ |
| F3 | E2E automatizado | `SSO_BFF_SECRET=rsv360-docker-dev-oauth-bff npm run test:e2e:marketing-lab` → pass | ☐ |

---

## Resultado

| Bloco | Total | OK | FAIL |
|-------|-------|-----|------|
| A S1 | 6 | | |
| B S2 | 7 | | |
| C SSO | 8 | | |
| D Tracking | 7 | | |
| E Métricas | 5 | | |
| F Regressão | 3 | | |
| **Total** | **36** | | |

**Veredito:** ☐ GO (36/36) · ☐ NOGO (anotar falhas abaixo)

### Falhas / observações

```
# ID teste — descrição — evidência (screenshot/log)
```

## Comandos rápidos

```powershell
# E2E (F3 / teste F3)
$env:SSO_BFF_SECRET = "rsv360-docker-dev-oauth-bff"
$env:RSV_AUTH_V1_BACKEND_URL = "http://localhost:3002"
$env:RSV_MARKETING_LAB_URL = "http://localhost:3000"
npm run test:e2e:marketing-lab

# Issue manual (B7)
$headers = @{ "Content-Type" = "application/json"; "X-Sso-Bff-Secret" = $env:SSO_BFF_SECRET }
$body = '{"email":"smoke@test.local","name":"Smoke","external_user_id":"smoke-1","return_url":"/lab"}'
Invoke-RestMethod -Method POST -Uri "http://localhost:3002/api/v1/auth/sso/issue" -Headers $headers -Body $body
```
