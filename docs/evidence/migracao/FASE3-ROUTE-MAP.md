# Fase 3 — Mapa de rotas wouter → Next.js

**Data:** 2026-06-23  
**Branch:** `feat/migracao-sistema-a-para-b`  
**Legado:** Sistema A (`Crm-RSV-360/client/src/App.tsx` — wouter)  
**Destino:** monorepo RSV360 (App Router + Pages Router)

---

## 3.1 — Conversão de rotas

| Sistema A (wouter) | App destino | Router | Rota Next.js |
|--------------------|-------------|--------|--------------|
| `/` | site-publico | App | `app/page.tsx` |
| `/proposta/:id` *(novo)* | site-publico | App | `app/proposta/[id]/page.tsx` |
| `/admin/financeiro` | admin | Pages | `pages/financeiro/index.tsx` |
| `/admin/crm` | admin | Pages | `pages/crm/` (existente) |
| `/admin/passageiros` | admin | Pages | `pages/passageiros/index.tsx` |
| `/entrar`, `/login` | site-publico | App | `app/login/` |
| `/minhas-reservas` | guest | Pages | `pages/reservations/` |
| *(módulos Fase 1)* | turismo | Pages | `pages/orcamentos`, `pages/propostas` |

### Turismo (CRM operacional) — Pages Router

| Rota | Arquivo |
|------|---------|
| `/orcamentos` | `apps/turismo/pages/orcamentos/index.tsx` |
| `/propostas` | `apps/turismo/pages/propostas/index.tsx` |
| `/propostas/nova` | `apps/turismo/pages/propostas/nova.tsx` |
| `/propostas/[id]` | `apps/turismo/pages/propostas/[id]/index.tsx` |
| `/propostas/[id]/atendimento` | `apps/turismo/pages/propostas/[id]/atendimento.tsx` |

### Site público — App Router

| Rota | Arquivo |
|------|---------|
| `/proposta/[id]` | `apps/site-publico/app/proposta/[id]/page.tsx` |

### Admin — Pages Router (7 módulos)

| Rota | Módulo API |
|------|------------|
| `/orcamentos` | `/api/v1/orcamentos` |
| `/propostas` | `/api/v1/propostas` |
| `/passageiros` | `/api/v1/passageiros` |
| `/financeiro` | `/api/v1/financeiro` |
| `/campanhas` | `/api/v1/campanhas` |
| `/logistica` | `/api/v1/logistica` |
| `/relatorios` | `/api/v1/relatorios` |

### Guest

| Rota | Arquivo |
|------|---------|
| `/minhas-propostas` | `apps/guest/pages/minhas-propostas/index.tsx` |

---

## 3.2 — TanStack Query + API_URL

| App | Query setup | API base |
|-----|-------------|----------|
| site-publico | `app/providers.tsx` | BFF `/api/propostas` → backend |
| turismo | `src/lib/query-client.tsx` + `_app.tsx` | `NEXT_PUBLIC_API_URL` → `:3002` |
| admin | `src/lib/query-client.tsx` | `NEXT_PUBLIC_API_URL` → `:3002` |
| guest | existente | `:3002` |

Hooks: `hooks/usePropostas.ts` (site-publico), `src/hooks/useFase1Modules.ts` (turismo), `src/modules/fase1/hooks` (admin).

---

## 3.3 — PropostaPublica

- Componente: `apps/site-publico/components/propostas/PropostaPublica.tsx`
- WebSocket: namespace `/propostas` (Socket.IO)
- Aceitar/recusar: `POST /api/propostas/:id/responder` (BFF → backend)

---

## 3.4 — PropostaEditor + AtendimentoProposta

- `apps/turismo/src/components/propostas/PropostaEditor.tsx` — preview tempo real
- `apps/turismo/src/components/propostas/AtendimentoProposta.tsx` — HITL takeover/release

---

## 3.6 — Auth BFF

Auth existente: `apps/site-publico/app/api/auth/*` (13 rotas, `proxyAuthV1`).

BFF Fase 1 (novo):

- `app/api/propostas/[...path]/route.ts`
- `app/api/orcamentos/[...path]/route.ts`
- Helper: `lib/fase1-bff.ts`

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BACKEND_INTERNAL_URL=http://backend:3002   # Docker BFF
```
