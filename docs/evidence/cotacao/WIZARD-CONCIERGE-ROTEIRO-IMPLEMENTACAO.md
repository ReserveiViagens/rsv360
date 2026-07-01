# Wizard Concierge + Roteiro Interativo (RSV360)

> **Status:** Implementado  
> **Data:** 22/06/2026  
> **Repositório:** `rsv360`  
> **Stack:** Next.js (site-publico :3000) + Express API (:3002) + Postgres  
> **Não usar:** Crm-RSV-360 (:5000) para este módulo

---

## Resumo executivo

O módulo de **Cotação Interativa** foi transformado em um funil de **8 passos** com cards ricos (imagem, galeria, vídeo, badges comportamentais), **preview imersivo "Seu Roteiro"** antes do pagamento, geração de **proposta persistida** no Postgres, **roteiro público** pós-envio, **Concierge CaldasAI** (chat + HITL), alerta **Hot Lead** via WhatsApp e **analytics de drop-off** por etapa.

**URLs principais**

| Rota | Porta | Descrição |
|------|-------|-----------|
| `/cotacao` | 3000 | Wizard 8 passos (preview imersivo no passo 7) |
| `/roteiro/{token}` | 3000 | Roteiro interativo pós-aprovação |
| `/proposta/{id}` | 3000 | Proposta legada (chat HITL) |
| `/api/v1/cotacao-publica/*` | 3002 | Backend público (gerar proposta, roteiro) |

---

## Decisões de arquitetura

| Item | Decisão |
|------|---------|
| Onde implementar | `apps/site-publico` (S2 Next.js) |
| Protótipo visual | Portado de `Modulo Interativo de Cotações` (ItineraryCard, VideoModal, itinerary, concierge) |
| Backend | Reutiliza `:3002` — orçamentos, propostas, Socket.IO `/propostas` |
| Fluxo | Step 0 datas → Steps 1–5 seleções → **Step 6 preview imersivo** → Step 7 contato/pagamento → POST gerar-proposta → `/roteiro/{token}` |
| Pagamento MVP | UI Pix/Cartão + WhatsApp (gateway real = Fase 3) |
| Hot Lead | Evolution API assíncrona; modo demo se credenciais ausentes |

---

## Fluxo do funil (8 passos)

```
Step 0 — Datas e hóspedes
    ↓ GET /api/cotacao/disponibilidade
Step 1 — Hotel (1 seleção)
Step 2 — Diversão / parques (multi)
Step 3 — Atrações (multi, opcional)
Step 4 — Café da manhã (1 opção)
Step 5 — Kit acomodação (kit OU itens avulsos)
Step 6 — Seu Roteiro (preview imersivo, Aprovar Roteiro)
Step 7 — Contato + Pix/Cartão
    ↓ POST /api/cotacao/gerar-proposta
    ↓ Hot Lead WhatsApp (async)
    ↓ Redirect /roteiro/{token}
Concierge CaldasAI (modal + Socket.IO)
```

---

## Checklist de entregas (plano original)

### Fase 1 — UI rica + Wizard

- [x] Token de design `--accent-lime: #D0F308` em `styles/globals.css`
- [x] `ItineraryCard` com modos selection/summary/readonly, galeria, vídeo, badges, escassez, prova social
- [x] `VideoModal` fullscreen
- [x] `WizardContext` + persistência localStorage (`rsv360-cotacao-wizard-v2`)
- [x] Expiração de draft em 7 dias + botão **Reiniciar cotação**
- [x] `WizardProgressBar` (8 segmentos)
- [x] `WizardStickyTotal` (visível nos passos 1–5)
- [x] Steps 0–7 implementados
- [x] `WizardStepItinerary` — preview imersivo com **Aprovar Roteiro**
- [x] Componentes `RoteiroDayNav`, `RoteiroOverview`, `RoteiroTimelineImersiva`, `RoteiroPreviewShell`
- [x] `lib/montar-roteiro-preview.ts` — montagem client-side enriquecida
- [x] `app/cotacao/page.tsx` refatorado para `WizardPageWrapper`
- [x] Toasts sonner + loading states + fallback de catálogo
- [x] `GET /api/cotacao/disponibilidade`
- [x] `lib/cotacao-catalog.ts` (café + kits)
- [x] Seed enriquecido `database/seeds/cotacao-demo-website-content.sql`

### Fase 2 — Backend + proposta pública

- [x] BFF `POST /api/cotacao/gerar-proposta`
- [x] Módulo `server/modules/cotacao-publica`
- [x] Orçamento → proposta → `tokenPublico` → `dailySchedule`
- [x] Hot Lead `hot-lead-notify.service.ts` (Evolution API + demo graceful)
- [x] Rate-limit simples (1 req/min por IP)

### Fase 3 — Roteiro + Concierge

- [x] `app/roteiro/[token]/page.tsx`
- [x] `RoteiroPublico` refatorado para `RoteiroPreviewShell` (paridade visual com wizard)
- [x] `montar-roteiro.ts` enriquecido com `videoUrl`, `mood`, `behaviorTag`, `id`
- [x] `ConciergeModal` + chat Socket.IO + HITL
- [x] `/roteiro` no allowlist `lib/app-mode.ts`

### Fase 4 — Behavioral + Analytics

- [x] `wizard-behavior.ts` / `lib/cotacao-behavior.ts` (família / casal / aventura)
- [x] `wizard-pricing.ts` (total dinâmico)
- [x] `lib/cotacao-analytics.ts` (PostHog/gtag + sessionStorage dev)
- [x] Eventos: `step_viewed`, `step_completed`, `step_abandoned`, `item_selected`, `proposta_generated`, `roteiro_opened`, `roteiro_preview_viewed`, `roteiro_day_selected`, `roteiro_video_played`, `roteiro_preview_approved`

### Testes

- [x] E2E `tests/e2e/cotacao-wizard.spec.ts`
- [x] Smoke atualizado em `tests/e2e/smoke-core-routes.spec.ts` (8 passos)

---

## Mapa de arquivos

### Frontend — `apps/site-publico`

**Wizard**

| Arquivo | Função |
|---------|--------|
| `components/cotacao/wizard/WizardContext.tsx` | Estado global, persistência, analytics |
| `components/cotacao/wizard/wizard-types.ts` | Tipos, chaves localStorage, helpers |
| `components/cotacao/wizard/wizard-pricing.ts` | Cálculo de total |
| `components/cotacao/wizard/wizard-behavior.ts` | Perfil + ordenação de cards |
| `components/cotacao/wizard/WizardPageWrapper.tsx` | Shell do wizard + fetch disponibilidade |
| `components/cotacao/wizard/WizardProgressBar.tsx` | Barra 8 passos |
| `components/cotacao/wizard/WizardStickyTotal.tsx` | Total fixo inferior |
| `components/cotacao/wizard/ItineraryCard.tsx` | Card rico (port V0) |
| `components/cotacao/wizard/VideoModal.tsx` | Modal de vídeo |
| `components/cotacao/wizard/PaymentMethodSelector.tsx` | Pix / Cartão |
| `components/cotacao/wizard/WizardStepDates.tsx` | Step 0 |
| `components/cotacao/wizard/WizardStepHotel.tsx` | Step 1 |
| `components/cotacao/wizard/WizardStepActivities.tsx` | Step 2 |
| `components/cotacao/wizard/WizardStepAttractions.tsx` | Step 3 |
| `components/cotacao/wizard/WizardStepBreakfast.tsx` | Step 4 |
| `components/cotacao/wizard/WizardStepAccommodation.tsx` | Step 5 |
| `components/cotacao/wizard/WizardStepItinerary.tsx` | Step 6 — preview imersivo |
| `components/cotacao/wizard/WizardStepReview.tsx` | Step 7 — contato e pagamento |
| `app/cotacao/page.tsx` | Entry point |

**Roteiro + Concierge**

| Arquivo | Função |
|---------|--------|
| `components/cotacao/roteiro/RoteiroPublico.tsx` | Página do roteiro (usa `RoteiroPreviewShell`) |
| `components/cotacao/roteiro/RoteiroPreviewShell.tsx` | Layout imersivo completo + sticky bar |
| `components/cotacao/roteiro/RoteiroDayNav.tsx` | Navegação Dia 1…N |
| `components/cotacao/roteiro/RoteiroOverview.tsx` | Cards Duração / Hóspedes / Destino |
| `components/cotacao/roteiro/RoteiroTimelineImersiva.tsx` | Timeline com mídia e gatilhos |
| `components/cotacao/concierge/ConciergeModal.tsx` | Chat + HITL |
| `app/roteiro/[token]/page.tsx` | Rota pública |

**APIs BFF (Next.js)**

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/cotacao/disponibilidade` | GET | Catálogo filtrado por datas/hóspedes |
| `/api/cotacao/gerar-proposta` | POST | Proxy → backend `:3002` |
| `/api/cotacao/roteiro/[token]` | GET | Dados do roteiro por token |

**Libs**

| Arquivo | Função |
|---------|--------|
| `lib/cotacao-catalog.ts` | Café + kits de acomodação |
| `lib/cotacao-analytics.ts` | Wrapper de eventos |
| `lib/cotacao-behavior.ts` | Re-export behavioral |
| `lib/montar-roteiro-preview.ts` | Montagem client-side do roteiro enriquecido |
| `lib/app-mode.ts` | Allowlist `/roteiro` |

**Estilo**

| Arquivo | Alteração |
|---------|-----------|
| `styles/globals.css` | `--accent-lime: #D0F308`, utilitários Tailwind |

### Backend — `server/modules/cotacao-publica`

| Arquivo | Função |
|---------|--------|
| `index.ts` | Registro do módulo em `server/app.ts` |
| `routes/index.ts` | Rotas HTTP |
| `services/cotacao-publica.service.ts` | Orçamento → proposta → token |
| `services/montar-roteiro.ts` | `dailySchedule` enriquecido + itens do orçamento |
| `services/hot-lead-notify.service.ts` | Alerta WhatsApp Evolution API |

**Registro:** `registerCotacaoPublicaModule(app)` em `server/app.ts`

### Banco / Seed

| Arquivo | Função |
|---------|--------|
| `database/seeds/cotacao-demo-website-content.sql` | Hotéis, tickets, atrações com metadata rica |

---

## API Backend (`:3002`)

### POST `/api/v1/cotacao-publica/gerar-proposta`

**Auth:** Público (sem staffAuth)  
**Rate limit:** 1 requisição/minuto por IP

**Body (resumo):**

```json
{
  "checkIn": "2026-07-01",
  "checkOut": "2026-07-04",
  "adults": 2,
  "children": 0,
  "hotelId": 1,
  "ticketIds": [1],
  "attractionIds": [],
  "breakfastId": "executivo",
  "accommodationMode": "kit",
  "accommodationKitId": "kit-casal",
  "name": "Cliente Teste",
  "phone": "64999999999",
  "email": "cliente@email.com",
  "paymentMethod": "pix",
  "profile": "casal",
  "total": 1500,
  "catalog": {
    "hotels": [{ "id": 1, "title": "Hotel X", "price": 450, "images": [] }],
    "tickets": [],
    "attractions": []
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "propostaId": 42,
    "tokenPublico": "rt-abc123...",
    "url": "/roteiro/rt-abc123...",
    "urlPublica": "http://localhost:3000/roteiro/rt-abc123..."
  }
}
```

### GET `/api/v1/cotacao-publica/roteiro/:token`

Retorna proposta pública com `conteudo.dailySchedule`, `inclusions`, `media`.

---

## Variáveis de ambiente

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | Backend | Postgres (obrigatório para gerar proposta) |
| `NEXT_PUBLIC_BACKEND_URL` / `BACKEND_INTERNAL_URL` | site-publico | Base do backend (default `http://localhost:3002`) |
| `NEXT_PUBLIC_SITE_URL` | site-publico / backend | URL pública para links do Hot Lead |
| `COTACAO_PUBLIC_BASE_URL` | Backend | URL base nos links do alerta comercial |
| `COTACAO_HOT_LEAD_WHATSAPP` | Backend | Número destino do Hot Lead |
| `EVOLUTION_API_URL` | Backend | URL Evolution API |
| `EVOLUTION_API_KEY` | Backend | Chave Evolution API |
| `EVOLUTION_INSTANCE_NAME` | Backend | Instância WhatsApp (default `rsv360`) |
| `NEXT_PUBLIC_WS_URL` | site-publico | WebSocket para Concierge |

**Modo demo Hot Lead:** se `EVOLUTION_API_KEY` ou `COTACAO_HOT_LEAD_WHATSAPP` ausentes → log + evento `hot_lead_skipped` (não bloqueia a proposta).

---

## Persistência de sessão (localStorage)

| Chave | Conteúdo |
|-------|----------|
| `rsv360-cotacao-wizard-v2` | `{ state, step, savedAt }` |
| `rsv360-cotacao-wizard-v2-step` | Step atual (0–6) |
| `rsv360-cotacao-analytics` | Últimos 50 eventos (sessionStorage, dev) |

**Expiração:** 7 dias (`WIZARD_DRAFT_MAX_AGE_MS`)

---

## Analytics — eventos rastreados

| Evento | Quando |
|--------|--------|
| `cotacao_step_viewed` | Entrada em cada step 0–6 |
| `cotacao_step_completed` | Avançar com validação OK |
| `cotacao_step_abandoned` | `beforeunload` ou idle > 5 min |
| `cotacao_item_selected` | Seleção hotel/parque/café/kit |
| `cotacao_proposta_generated` | Sucesso Step 6 |
| `cotacao_roteiro_opened` | Primeira abertura do roteiro |

Integração: PostHog (`window.posthog`) e gtag (`window.gtag`) quando disponíveis.

---

## Catálogo estático (café e kits)

**Café da manhã** (`lib/cotacao-catalog.ts`)

| ID | Nome | Preço/pessoa/dia |
|----|------|------------------|
| `continental` | Café Continental | R$ 25 |
| `executivo` | Café Executivo | R$ 45 |
| `completo` | Café Completo | R$ 65 |

**Itens avulsos**

| Item | Preço |
|------|-------|
| Lençol | R$ 10 |
| Fronha | R$ 5 |
| Toalha de banho | R$ 8 |
| Cobertor | R$ 15 |
| Travesseiro extra | R$ 12 |

**Kits**

| ID | Nome | Preço |
|----|------|-------|
| `kit-casal` | Kit Casal | R$ 70 |
| `kit-familia` | Kit Família | R$ 120 |
| `kit-individual` | Kit Individual | R$ 40 |

---

## Metadata CMS (`website_content`)

Campos enriquecidos no seed demo:

```json
{
  "images": ["url1", "url2"],
  "videoUrl": "https://www.youtube.com/embed/...",
  "behaviorTags": ["familia", "casal"],
  "scarcity": { "unitsLeft": 2 },
  "socialProof": { "bookings24h": 12 },
  "premiumLabel": "Suíte Vista Premium",
  "maxGuests": 6
}
```

---

## Hot Lead — template WhatsApp

```
🔥 Hot Lead — Nova proposta gerada
Cliente: {nome} | {telefone}
Destino: {hotel} | {datas}
Total: R$ {valor}
Ver roteiro: {urlPublica}
Perfil: {familia|casal|aventura}
```

Disparo **assíncrono** após sucesso do POST. Eventos em `proposta_eventos`: `hot_lead_sent`, `hot_lead_failed`, `hot_lead_skipped`.

---

## Como testar localmente

### 1. Subir serviços

```bash
# Postgres (Docker, porta 5433)
# Backend :3002
# site-publico :3000
```

### 2. Seed do catálogo (opcional)

Executar `database/seeds/cotacao-demo-website-content.sql` no Postgres.

### 3. Fluxo manual

1. Abrir `http://localhost:3000/cotacao`
2. Preencher datas e hóspedes → avançar
3. Selecionar hotel, parques, café, kit
4. Passo 7 (UI): preview **Seu Roteiro** → **Aprovar Roteiro**
5. Passo 8: nome + telefone → **Confirmar e gerar proposta**
6. Redireciona para `/roteiro/{token}`
7. Abrir **Concierge** e testar chat

### 4. E2E Playwright

```bash
cd apps/site-publico
npx playwright test tests/e2e/cotacao-wizard.spec.ts
```

### 5. Docker (após alterações)

```bash
docker compose build site-publico
docker compose up -d --force-recreate site-publico
```

---

## Critérios de aceite

| Critério | Status |
|----------|--------|
| `/cotacao` exibe wizard 8 passos com preview imersivo no passo 7 | ✅ |
| Step 0 bloqueia datas inválidas; disponibilidade MVP | ✅ |
| Recuperação de sessão via localStorage | ✅ |
| Toasts + loading em erros de API | ✅ |
| Total acumulado nos passos 1–5 | ✅ |
| Passo 7 (Seu Roteiro) aprova sem gerar proposta; passo 8 persiste e redireciona | ✅ |
| Hot Lead WhatsApp (ou demo graceful) | ✅ |
| Analytics por step 0–7 + eventos de preview do roteiro | ✅ |
| Roteiro público com mesmos componentes imersivos do wizard | ✅ |
| Concierge com chat real da proposta | ✅ |
| Funciona em :3000 sem depender de :5000 | ✅ |
| `website_content` com mídia demo | ✅ (seed) |

---

## Pendências / Fase futura

| Item | Fase | Notas |
|------|------|-------|
| Gateway Pix real | Fase 3 | MVP usa UI + WhatsApp |
| Inventário real / fornecedores hub na disponibilidade | Fase 3 | MVP usa regras simples + CMS |
| Mensagens proativas IA (ia-copiloto) | Fase 3 | Concierge usa chat existente |
| Comparativo mercado no roteiro | Fase 4 | `exibirComparativo` já existe na proposta v2 |
| Dashboard PostHog do funil | Fase 4 | Eventos já emitidos |
| Captcha no endpoint público | Opcional | Rate-limit já ativo |

---

## Referências

| Recurso | Caminho / URL |
|---------|---------------|
| Protótipo V0 | `Modulo Interativo de Cotações` (pasta externa) |
| Propostas backend | `server/modules/propostas` |
| Smoke E2E cotação v2 | `server/scripts/smoke-e2e-cotacao.ts` |
| Plano original | `.cursor/plans/wizard_cotação_concierge_4dd2572a.plan.md` |

---

## Notas para importação no Notion

1. Importar este arquivo via **Import → Markdown** no Notion.
2. Tabelas e checklists são convertidos automaticamente.
3. Blocos de código permanecem formatados.
4. Atualizar a data no topo ao revisar o documento.
