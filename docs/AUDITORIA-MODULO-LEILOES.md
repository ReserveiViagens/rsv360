# Auditoria do Módulo de Leilões (/leiloes)

**Data:** 11/02/2026  
**Objetivo:** Identificar gaps e criar lista passo a passo para concluir o módulo de leilões.

---

## 1. Estrutura de Arquivos do Módulo

### 1.1 Páginas (Frontend - site-publico)

| Arquivo | Rota | Descrição |
|---------|------|-----------|
| `apps/site-publico/app/leiloes/page.tsx` | `/leiloes` | Listagem principal - mapa, lista, filtros |
| `apps/site-publico/app/leiloes/[id]/page.tsx` | `/leiloes/:id` | Detalhe do leilão + formulário de lance |
| `apps/site-publico/app/leiloes/novo/page.tsx` | `/leiloes/novo` | Criar leilão (placeholder - "em breve") |

### 1.2 Componentes (Frontend)

| Arquivo | Uso |
|---------|-----|
| `components/auctions/AuctionCardHorizontal.tsx` | Card horizontal para leilões reais (lista) |
| `components/auctions/AuctionCardGrid.tsx` | Card em grid para exemplos de hotéis |
| `components/auctions/AuctionMapLeaflet.tsx` | Mapa Leaflet com marcadores |
| `components/auctions/AuctionTimer.tsx` | Contagem regressiva do leilão |
| `components/auctions/BidForm.tsx` | Formulário para dar lance |
| `components/auctions/BidHistory.tsx` | Histórico de lances |
| `components/auctions/AuctionLiveUpdates.tsx` | Atualizações em tempo real (WebSocket) |

### 1.3 Hooks e APIs (Frontend)

| Arquivo | Função |
|---------|--------|
| `hooks/useAuctions.ts` | useAuctions, useAuction, useBids, useBidMutation |
| `hooks/useHotels.ts` | useCaldasNovasHotels - hotéis de Caldas Novas |
| `lib/auction-examples.ts` | getAuctionExamples, getAuctionExamplesForMap |
| `lib/caldas-novas-coordinates.ts` | getCoordinatesByHotelName, CALDAS_NOVAS_CENTER |

### 1.4 Backend (API)

| Arquivo | Função |
|---------|--------|
| `backend/src/api/v1/auctions/routes.js` | Rotas da API |
| `backend/src/api/v1/auctions/controller.js` | Controller |
| `backend/src/api/v1/auctions/service.js` | Lógica de negócio |
| `backend/scripts/seed-auctions.js` | Seed de leilões para teste |

---

## 2. Fluxos Atuais e Problemas Identificados

### 2.1 Botão "Participar do Leilão"

**Onde aparece:**
- AuctionCardGrid (exemplos de hotéis)
- Popup do mapa (AuctionMapLeaflet)

**Comportamento atual:**
- **Leilões reais:** Link `/leiloes/{id}` → abre página de detalhe com BidForm
- **Exemplos (hotéis mock):** Link `/leiloes?hotel={hotelId}` → **não filtra nada**, volta para a listagem

**Problema:** Ao clicar em "Participar do Leilão" nos exemplos (Lagoa Eco Towers, Piazza DiRoma, etc.), a página `/leiloes` não usa o parâmetro `?hotel=xxx` para filtrar ou destacar. O usuário vê a mesma tela.

### 2.2 Botão "Dar Lance"

**Onde aparece:** AuctionCardHorizontal (leilões reais da API)

**Comportamento atual:** Link `/leiloes/{id}` → página de detalhe

**Problemas:**
1. **Autenticação obrigatória:** POST `/api/v1/auctions/:id/bids` requer `authenticateToken`. Usuário não logado não consegue dar lance.
2. **Mensagem confusa:** BidForm exibe "Você precisa estar logado para fazer um lance" mas o formulário ainda aparece. Ao submeter, retorna erro 401.
3. **Leilão não encontrado:** Se o backend não retornar o leilão (404), a página exibe "Leilão não encontrado".

### 2.3 Busca por Datas

**Campos na interface:**
- Data (header)
- Entrada / Saída (sidebar - Período)

**Comportamento atual:** **NENHUM** – Os inputs de data **não estão conectados** a nenhum estado ou API.

**Código atual:**
- Não há `useState` para check-in/check-out
- Não há `onChange` nos inputs de data
- `useAuctions` não aceita filtro por data
- `getActive()` do backend **não aceita** filtros de data

### 2.4 Filtros (Faixa de Preço, Hóspedes)

**Comportamento atual:**
- **Faixa de preço:** O slider não está conectado. `filters.minPrice` e `filters.maxPrice` existem mas nunca são atualizados.
- **Hóspedes:** O input não está conectado a nenhum estado.
- **Tipo de propriedade:** Funciona (Hotéis, Resorts, etc.) – filtra `useCaldasNovasHotels`.
- **Localização:** Funciona – `regionSearch` é passado para `useAuctions({ search })`.

### 2.5 Backend - Filtros na API /active

**Problema:** O endpoint `GET /api/v1/auctions/active` **não aceita** parâmetros de query (status, search, datas). O controller chama `getActive()` sem passar `req.query`.

**Frontend envia:** `?status=active&search=Caldas` mas o backend ignora.

---

## 3. Schema do Banco de Dados

**Tabela auctions (migration 007):**
- `start_price`, `current_price`, `min_increment`, `reserve_price`
- `start_date`, `end_date`, `status`
- `enterprise_id`, `property_id`, `accommodation_id` (opcionais)

**Seed script** usa `starting_price` – pode haver incompatibilidade com migration que usa `start_price`. O service tem fallback: `r.start_price ?? r.starting_price`.

---

## 4. Lista Passo a Passo para Concluir o Módulo

### Fase 1: Conectar Filtros e Busca por Datas

- [ ] **1.1** Adicionar `useState` para check-in e check-out em `leiloes/page.tsx`
- [ ] **1.2** Conectar inputs de data com `onChange` e `value`
- [ ] **1.3** Adicionar `useState` para faixa de preço (minPrice, maxPrice) e conectar o slider
- [ ] **1.4** Adicionar `useState` para número de hóspedes
- [ ] **1.5** Atualizar `useAuctions` (hook) para aceitar `checkIn`, `checkOut` e passar ao backend
- [ ] **1.6** Atualizar backend `getActive()` para aceitar filtros: `search`, `checkIn`, `checkOut`, `minPrice`, `maxPrice`
- [ ] **1.7** Atualizar controller `getActive` para passar `req.query` ao service
- [ ] **1.8** Aplicar filtros de data na query SQL (WHERE start_date <= checkOut AND end_date >= checkIn)

### Fase 2: Fluxo "Participar do Leilão" para Exemplos

- [ ] **2.1** Criar página `/leiloes/exemplo/[hotelId]` OU usar `/leiloes?hotel=xxx` com lógica
- [ ] **2.2** Na página `/leiloes`, ler `searchParams.get('hotel')` e, se existir, rolar até o card do hotel ou abrir modal/detalhe do exemplo
- [ ] **2.3** Alternativa: transformar exemplos em leilões reais via seed (criar auctions para cada hotel de exemplo)

### Fase 3: Fluxo "Dar Lance" sem Login (Opcional)

- [ ] **3.1** Avaliar: permitir lances sem login (email + nome) OU exigir login
- [ ] **3.2** Se permitir sem login: criar rota `POST /api/v1/auctions/:id/bids` pública com body `{ amount, email?, name? }` e criar customer anônimo
- [ ] **3.3** Se exigir login: redirecionar para login ao clicar "Dar Lance" e retornar à página do leilão após login
- [ ] **3.4** Exibir mensagem clara: "Faça login para participar" com link para login

### Fase 4: Melhorias de UX

- [ ] **4.1** Ao clicar "Participar do Leilão" em exemplo, scroll suave até a seção "Mais hotéis em leilão" e highlight no card do hotel (se ?hotel=xxx)
- [ ] **4.2** Desabilitar botão "Fazer Lance" no BidForm quando não logado, com tooltip "Faça login para dar lance"
- [ ] **4.3** Adicionar feedback visual ao aplicar filtros (ex.: "X resultados encontrados")

### Fase 5: Verificações de Infraestrutura

- [ ] **5.1** Confirmar que migrations foram executadas: `npx knex migrate:latest` no backend
- [ ] **5.2** Executar seed de leilões: `node scripts/seed-auctions.js` (na pasta backend)
- [ ] **5.3** Verificar schema da tabela auctions: colunas `start_price` ou `starting_price`, `min_increment`
- [ ] **5.4** Se seed usa `starting_price` e migration usa `start_price`, ajustar seed para `start_price` ou adicionar migration de compatibilidade

---

## 5. Resumo dos Gaps Críticos

| Gap | Impacto | Prioridade |
|-----|---------|------------|
| Filtros de data não conectados | Usuário não consegue buscar por período | Alta |
| Faixa de preço não conectada | Filtro não funciona | Alta |
| "Participar do Leilão" em exemplos não filtra | Clicar não leva a lugar útil | Alta |
| Dar lance exige login sem redirecionamento | Usuário tenta dar lance e falha | Alta |
| API /active não aceita search/datas | Busca por região/datas não funciona no backend | Média |

---

## 6. Arquivos a Modificar (Resumo)

1. **leiloes/page.tsx** – estados e handlers para datas, preço, hóspedes; leitura de searchParams hotel
2. **hooks/useAuctions.ts** – passar checkIn, checkOut, minPrice, maxPrice na query
3. **backend controller (auctions)** – getActive receber req.query
4. **backend service (auctions)** – getActive aceitar e aplicar filtros
5. **BidForm.tsx** – desabilitar submit quando não logado; redirecionar para login
6. **AuctionCardGrid.tsx** – link /leiloes?hotel=xxx com scroll/highlight (ou nova rota)

---

## 7. Comandos Úteis

```bash
# Backend - migrations
cd "RSV360 Versao Oficial definitivo/backend"
npx knex migrate:latest

# Backend - seed de leilões
node scripts/seed-auctions.js

# Iniciar sistema completo
.\Iniciar Sistema Completo.ps1
```

---

*Documento gerado por auditoria automatizada do módulo /leiloes.*
