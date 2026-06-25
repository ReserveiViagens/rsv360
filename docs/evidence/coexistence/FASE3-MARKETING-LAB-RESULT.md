# Fase 3 — Marketing Lab (coexistência S1 :5000 + S2 :3000)

**Data:** 2026-06-24  
**Repo:** `rsv360` · **App:** `apps/site-publico`  
**Contexto:** S1 (`Crm-RSV-360` em `:5000`) permanece site B2C intocável; `:3000` vira hub interno de marketing e analytics.

---

## Arquitetura

| Porta | Papel |
|-------|--------|
| **:5000** | S1 — site principal B2C (hotéis, leilões, CRM legado) |
| **:3000** | S2 — Marketing Lab (`RSV360_APP_MODE=marketing-lab`) |
| **:3002** | Backend API v1 + BFF |
| **:3004** / **:3005** | Admin / Turismo |

**Rollback:** `RSV360_APP_MODE=public` (ou remover a variável) + rebuild `site-publico`.

---

## Entregas

### 3.1 — Middleware + env + redirects ✅

| Artefato | Descrição |
|----------|-----------|
| `apps/site-publico/lib/app-mode.ts` | Modo `public` \| `marketing-lab` |
| `apps/site-publico/middleware.ts` | `/` → `/lab`; B2C → `:5000` |
| `.env` / `docker-compose.yml` / `Dockerfile` | Build-args `NEXT_PUBLIC_APP_MODE`, `NEXT_PUBLIC_PRIMARY_SITE_URL` |
| `scripts/smoke-marketing-lab.ps1` | Smoke PowerShell (Windows) |

### 3.2 — LabShell + `/lab` ✅

| Artefato | Descrição |
|----------|-----------|
| `components/lab/LabShell.tsx` | Sidebar + banner site principal |
| `components/lab/LabNav.tsx` | Navegação interna + Grafana/Prometheus |
| `app/lab/page.tsx` | Hub com cards de módulos |
| Layouts | `lab`, `analytics`, `crm`, `marketing`, `pricing`, `admin` |

### 3.3 — Marketing MVP ✅

| Rota | Implementação |
|------|----------------|
| `/marketing` | Hub 6 módulos |
| `/marketing/campaigns` | `CampaignList` + `CampaignForm` (CRM) |
| `/marketing/analytics` | Ponte para `/analytics` |
| `/marketing/ab-tests` | Rascunho local (localStorage) |
| `/marketing/funnels` | Funil 5 etapas (ilustrativo) |
| `/marketing/broadcasts` | Campanhas (filtro e-mail) |
| `/marketing/whatsapp` | Link CRM S1 `:5000/admin/crm` |

### 3.4 — Docker, docs, CI ✅

| Artefato | Descrição |
|----------|-----------|
| `tests/e2e/marketing-lab-smoke.js` | Smoke Node (CI + cross-platform) |
| `npm run smoke:marketing-lab` | Script raiz |
| `tests/e2e/route-smoke.js` | Skip B2C em modo lab (`marketing-lab-b2c-external`) |
| `.github/workflows/route-smoke.yml` | Wait `/lab`; step marketing-lab smoke |

---

## Variáveis de ambiente

```env
RSV360_APP_MODE=marketing-lab
NEXT_PUBLIC_APP_MODE=marketing-lab
NEXT_PUBLIC_PRIMARY_SITE_URL=http://localhost:5000
NEXT_PUBLIC_LAB_TITLE=RSV360 Marketing Lab
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Allowlist vs redirect (middleware)

**Permanecem em :3000:** `/lab`, `/analytics`, `/marketing`, `/crm`, `/admin`, `/pricing`, `/dashboard*`, auth, `/api/*`.

**Redirect → :5000:** demais rotas B2C (`/hoteis`, `/leiloes`, `/perfil`, etc.).

---

## Comandos locais

```powershell
# Stack S2
cd rsv360
docker compose up -d --build site-publico

# S1 (opcional, para redirect B2C e WhatsApp)
cd Crm-RSV-360
npm run dev

# Smoke
npm run smoke:marketing-lab
# ou
powershell -File scripts/smoke-marketing-lab.ps1

# Route smoke (com lab)
$env:RSV360_APP_MODE="marketing-lab"
npm run test:e2e:routes
```

---

## Critérios de aceite (Definition of Done)

- [x] `http://localhost:3000/` → `/lab`
- [x] `http://localhost:3000/hoteis` → `http://localhost:5000/hoteis`
- [x] `/analytics` e `/crm` com LabShell
- [x] Banner “Site principal” visível
- [x] Marketing hub sem stubs “Em construção”
- [x] Smoke automatizado (`smoke:marketing-lab`)
- [x] CI route-smoke compatível com modo lab
- [x] S1 intocável (sem commits em `Crm-RSV-360`)
- [x] CRM migrations Drizzle `0010_crm_tables` (004+009+021)
- [x] CRM marketing-lab: `marketingLabAuth` + smoke `/crm` + `/api/crm/dashboard`

---

## Smoke — resultado local (2026-06-24)

```
OK / -> /lab
OK /hoteis -> http://localhost:5000/hoteis
OK /lab -> 200
OK /analytics has LabShell
OK /marketing hub MVP
OK /marketing/campaigns -> 200
```

---

## Fases seguintes

| Fase | Escopo |
|------|--------|
| **4** | SSO S1 ↔ S2 | `FASE4-SSO-RESULT.md` |
| **5** | API leilões em `:3002` |
| **6** | Domínios prod (`www.` / `lab.`) |

---

## Referências

- `apps/site-publico/lib/app-mode.ts`
- `apps/site-publico/middleware.ts`
- `tests/e2e/ROUTE-SMOKE-README.md`
