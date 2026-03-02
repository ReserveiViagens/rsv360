# Documentação Completa – Páginas do Site Público (localhost:3000)

**Data:** 2025-02-11  
**Versão:** 1.0

Este documento descreve **todas as páginas** solicitadas: Login/Entrar/Cadastrar, Recuperar senha, Leilões, Flash deals, Excursões/Viagens em grupo, e as demais rotas do site público (perfil, minhas-reservas, dashboard, booking, cupons, group-travel, insurance, quality, onboarding, crm, analytics, loyalty, fidelidade, notificações, hoteis/[id], leiloes/[id]).

---

## Sumário

1. [Mapa de Rotas e Arquivos](#1-mapa-de-rotas-e-arquivos)
2. [Login, Entrar e Cadastrar](#2-login-entrar-e-cadastrar)
3. [Recuperar Senha](#3-recuperar-senha)
4. [Leilões e Flash Deals](#4-leilões-e-flash-deals)
5. [Excursões / Viagens em Grupo](#5-excursões--viagens-em-grupo)
6. [Perfil e Minhas Reservas](#6-perfil-e-minhas-reservas)
7. [Dashboard e Dashboard RSV](#7-dashboard-e-dashboard-rsv)
8. [Booking, Cupons, Group Travel, Insurance](#8-booking-cupons-group-travel-insurance)
9. [Quality, Onboarding, CRM, Analytics](#9-quality-onboarding-crm-analytics)
10. [Loyalty, Fidelidade, Notificações](#10-loyalty-fidelidade-notificações)
11. [Páginas Dinâmicas: Hotel e Leilão](#11-páginas-dinâmicas-hotel-e-leilão)
12. [Sistema de Cores (resumo por página)](#12-sistema-de-cores-resumo-por-página)

---

## 1. Mapa de Rotas e Arquivos

| URL (localhost:3000) | Arquivo | Tipo |
|---------------------|---------|------|
| `/login` | `app/login/page.tsx` | Client |
| `/recuperar-senha` | `app/recuperar-senha/page.tsx` | Client |
| `/leiloes` | `app/leiloes/page.tsx` | Client |
| `/leiloes/[id]` | `app/leiloes/[id]/page.tsx` | Client |
| `/leiloes/novo` | `app/leiloes/novo/page.tsx` | Client |
| `/flash-deals` | `app/flash-deals/page.tsx` | Client |
| `/viagens-grupo` | `app/viagens-grupo/page.tsx` | Client (Excursões/dashboard grupo) |
| `/group-travel` | `app/group-travel/page.tsx` | Client (Landing viagens grupo) |
| `/perfil` | `app/perfil/page.tsx` | Client |
| `/minhas-reservas` | `app/minhas-reservas/page.tsx` | Client |
| `/dashboard` | `app/dashboard/page.tsx` | Client |
| `/dashboard-rsv` | `app/dashboard-rsv/page.tsx` | Client |
| `/booking` | `app/booking/page.tsx` | Client |
| `/cupons` | `app/cupons/page.tsx` | Client |
| `/insurance` | `app/insurance/page.tsx` | Client |
| `/quality` | `app/quality/page.tsx` | Client |
| `/onboarding` | `app/onboarding/page.tsx` | Client |
| `/crm` | `app/crm/page.tsx` | Client |
| `/analytics` | `app/analytics/page.tsx` | Client |
| `/loyalty` | `app/loyalty/page.tsx` | Client |
| `/fidelidade` | `app/fidelidade/page.tsx` | Client |
| `/notificacoes` | `app/notificacoes/page.tsx` | Client |
| `/hoteis/[id]` | `app/hoteis/[id]/page.tsx` | Client |
| `/leiloes/[id]` | `app/leiloes/[id]/page.tsx` | Client |

**Nota:** “Entrar” e “Cadastrar” são **abas (Tabs)** na mesma página `/login`. Não existem rotas separadas `/entrar` ou `/cadastrar`.

---

## 2. Login, Entrar e Cadastrar

**Rota:** `/login`  
**Arquivo:** `app/login/page.tsx`  
**Tipo:** Client Component

### Descrição

Página única com **duas abas**: **Entrar** (login) e **Cadastrar** (registro). Suporta login por e-mail/senha, registro com nome, e-mail, senha, telefone e CPF/CNPJ (opcionais), e login social (Google e Facebook). Redirecionamento pós-login via query `?redirect=` (padrão: `/minhas-reservas`). Suporte a token na URL para confirmação de e-mail.

### Layout

- **Desktop:** Dois painéis. Esquerda: gradiente azul→índigo (branding, título “Sua próxima viagem começa aqui”, texto em `text-blue-200`/`text-blue-100`, ícones Shield/Sparkles). Direita: fundo `bg-gray-50/50`, card branco com Tabs (Entrar | Cadastrar) e formulários.
- **Mobile:** Apenas painel direito; header com logo e link para home.

### Estados

| Estado | Uso |
|--------|-----|
| `activeTab` | `"login"` \| `"register"` – controlado também por `?tab=register` |
| `loginEmail`, `loginPassword` | Formulário de login |
| `registerName`, `registerEmail`, `registerPassword`, `registerPhone`, `registerDocument` | Formulário de cadastro |
| `isLoading` | Durante login/registro |
| `showPassword` | Alternar visibilidade da senha |
| `error` | Mensagem de erro (ex.: credenciais inválidas, rate limit) |
| `rateLimitBlocked` | Bloqueio por tentativas; em dev há botão para reset |

### Integrações

- **Login:** `login(loginEmail, loginPassword)` de `@/lib/auth` (chama API de login).
- **Registro:** `register({ name, email, password, phone?, document? })` de `@/lib/auth`.
- **Social:** redirecionamento para `/api/auth/google` ou `/api/auth/facebook` com `redirect`.
- **Query:** `?redirect=`, `?tab=register`, `?token=` (define token e redireciona).

### Links

- Esqueci senha → `/recuperar-senha`
- Termos de Uso → `/termos`
- Política de Privacidade → `/privacidade`

### Cores principais

- Painel esquerdo: `from-blue-600 via-blue-700 to-indigo-800`, texto `text-white`, `text-blue-200`, `text-blue-100`, `bg-white/10`.
- Formulário: fundo `bg-gray-50/50`, card `bg-white`, Tabs `bg-gray-100`, erro `bg-red-50 border-red-200 text-red-700`.
- Botão Entrar: `bg-blue-600 hover:bg-blue-700`.
- Botão Cadastrar: `bg-green-600 hover:bg-green-700`.
- Links: `text-blue-600 hover:text-blue-700`.

---

## 3. Recuperar Senha

**Rota:** `/recuperar-senha`  
**Arquivo:** `app/recuperar-senha/page.tsx`  
**Tipo:** Client Component

### Descrição

Formulário para solicitar redefinição de senha por e-mail. Envio para `/api/auth/forgot-password` (POST, body: `{ email }`). Após sucesso, exibe mensagem de confirmação e link para voltar ao login.

### Layout

- **Desktop:** Split igual ao login – esquerda gradiente azul→índigo com título “Recupere o acesso à sua conta” e texto em `text-blue-200`/`text-blue-100`; direita formulário (e-mail) e estados de sucesso/erro.
- **Mobile:** Só o painel do formulário.

### Estados

| Estado | Uso |
|--------|-----|
| `email` | Campo e-mail |
| `loading` | Envio do formulário |
| `success` | Exibe mensagem “Verifique sua caixa de entrada” |
| `error` | Mensagem de erro da API |

### Cores principais

- Mesmo gradiente do login: `from-blue-600 via-blue-700 to-indigo-800`.
- Card e inputs no painel direito; link “Voltar ao login” em azul.

---

## 4. Leilões e Flash Deals

### 4.1. Leilões – Listagem (`/leiloes`)

**Arquivo:** `app/leiloes/page.tsx`

- **Descrição:** Listagem de leilões ativos com filtros (status, preço, datas, região, tipo de propriedade), visualização em **mapa** (Leaflet) ou **lista**. Combina dados de `useAuctions(auctionFilters)` e `useCaldasNovasHotels` para enriquecer cards. Componentes: `AuctionCardHorizontal`, `AuctionCardGrid`, `AuctionMapLeaflet` (dinâmico, SSR off), `AuctionFilters`.
- **Estados:** `filters`, `checkIn`, `checkOut`, `guestCount`, `regionSearch`, `viewMode` ('mapa' | 'lista'), `selectedAuctionId`, `selectedPropertyTypes`, `highlightedHotelId`.
- **Cores:** Fundo `bg-gray-50`, cards brancos, links/botões azul (`text-blue-600`, `bg-blue-600`), loading com `border-blue-600`.

### 4.2. Leilões – Detalhe (`/leiloes/[id]`)

**Arquivo:** `app/leiloes/[id]/page.tsx`

- **Descrição:** Página do leilão por ID. Usa `useAuction(id)` e `useBids(id)`. Exibe título, descrição, timer (se ativo), informações do leilão, formulário de lance (`BidForm`), histórico de lances (`BidHistory`). Em leilão ativo, usa `AuctionLiveUpdates` (WebSocket).
- **Estados:** `refreshKey` para forçar atualização após novo lance; loading e erro tratados (leilão não encontrado).
- **Cores:** `bg-gray-50`, header branco com sombra, botão “Voltar” `text-blue-600`, CTA azul.

### 4.3. Leilões – Novo (`/leiloes/novo`)

**Arquivo:** `app/leiloes/novo/page.tsx`  
- Fluxo de criação de novo leilão (não detalhado neste doc; existe como rota).

### 4.4. Flash Deals (`/flash-deals`)

**Arquivo:** `app/flash-deals/page.tsx`

- **Descrição:** Ofertas relâmpago. Dados de `useFlashDeals()` e `useCaldasNovasHotels` combinados; filtros e busca por texto/localização/ordenação. Grid de `FlashDealCard`; cross-sell com `MobileCrossSellCard` e fallback de side rails.
- **Estados:** `filters`, `search`, `showFilters`.
- **Cores:** Alinhado ao tema do site (cards, botões primários azul/laranja conforme componente).

---

## 5. Excursões / Viagens em Grupo

### 5.1. Viagens em Grupo – Dashboard (`/viagens-grupo`)

**Arquivo:** `app/viagens-grupo/page.tsx`

- **Descrição:** Dashboard com abas: Listas de Desejos (`WishlistManager`), Divisão de Pagamento (`SplitPaymentManager`), Convites (`TripInvitationManager`), Chat (`EnhancedGroupChatUI`). Params: `?booking_id`, `?wishlist_id`, `?group_chat_id` para abrir aba e contexto.
- **Estados:** `bookingId`, `wishlistId`, `groupChatId`, `activeTab`.
- **Cores:** Container padrão, título `text-4xl`, `text-muted-foreground`, cards com hover.

### 5.2. Group Travel – Landing (`/group-travel`)

**Arquivo:** `app/group-travel/page.tsx`

- **Descrição:** Página de entrada com cards para: Listas de Desejos Compartilhadas → `/group-travel/shared-wishlist`, Planejamento de Viagem → `/group-travel/trip-planning`, Convites → `/viagens-grupo?tab=invitations`, Chat → `/viagens-grupo` (ou link para chat).
- **Cores:** `container`, `text-muted-foreground`, botões outline e links.

**Excursões:** O conceito de “excursões” está coberto por **Viagens em Grupo** (`/viagens-grupo` e `/group-travel`); não há rota literal `/excursoes` no mapeamento atual.

---

## 6. Perfil e Minhas Reservas

### 6.1. Perfil (`/perfil`)

- Já documentado em **PAGE_DOC_CONTATO_INSTITUCIONAL_PERFIL.md** e **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md**.
- Resumo: área logada, GET/PUT `/api/users/profile`, abas Básico/Biografia/Contato/Negócio/Serviços/Redes, header azul, fundo `bg-gray-50`.

### 6.2. Minhas Reservas (`/minhas-reservas`)

**Arquivo:** `app/minhas-reservas/page.tsx`

- **Descrição:** Lista de reservas do usuário. Exige login (redireciona para `/login?redirect=/minhas-reservas`). Dados da API `/api/bookings` (por e-mail) ou fallback `localStorage.user_bookings`. Filtros por busca e status (all/confirmed/pending/cancelled/completed). Cards por reserva com imagem, datas, hóspedes, valor, status e ações (detalhes, avaliação).
- **Componentes:** `ReviewForm` em dialog para avaliar reserva concluída.
- **Estados:** `bookings`, `filteredBookings`, `searchTerm`, `statusFilter`, `isLoading`, `reviewDialogOpen`.
- **Cores:** Header/layout consistente com área logada; badges por status (verde/amarelo/vermelho/cinza); botões azul.

---

## 7. Dashboard e Dashboard RSV

### 7.1. Dashboard (`/dashboard`)

**Arquivo:** `app/dashboard/page.tsx`

- **Descrição:** “Dashboard do Proprietário” – três cards: Meus Hotéis → `/dashboard/hotels`, Dashboard RSV → `/dashboard-rsv`, Precificação → `/pricing/dashboard`.
- **Cores:** `bg-gray-50`, títulos `text-gray-900`/`text-gray-600`, cards padrão, botões primários.

### 7.2. Dashboard RSV (`/dashboard-rsv`)

**Arquivo:** `app/dashboard-rsv/page.tsx`

- **Descrição:** Dashboard de reservas e atendimento: estatísticas (reservas, receita, clientes, destino popular, taxa de conversão, ticket médio), lista de reservas recentes, ações rápidas (ex.: abrir perfil admin). Sidebar colapsável em mobile; dados simulados em estado (em produção viriam de API).
- **Cores:** Layout com sidebar, cards de métricas, tabela; cinzas e azul para links/botões.

---

## 8. Booking, Cupons, Group Travel, Insurance

### 8.1. Booking (`/booking`)

**Arquivo:** `app/booking/page.tsx`

- **Descrição:** Página de entrada para reservas: card “Buscar Hotéis” → `/hoteis`, “Busca Avançada” → `/hoteis/busca/completa`, “Pagar Depois” → `/booking/pay-later`. Link “Já tem reserva?” para minhas-reservas.
- **Cores:** `container`, `text-muted-foreground`, cards com hover, botão primário e outline/secondary.

### 8.2. Cupons (`/cupons`)

**Arquivo:** `app/cupons/page.tsx`

- **Descrição:** Gestão de cupons: abas/listagem de cupons, histórico de uso, criação e aplicação. Estados para formulário (código, tipo de desconto, valores, datas, limites). APIs: `/api/coupons`, `/api/coupons/usage` (inferido).
- **Cores:** Tabs, tabelas, badges (ativo/inativo), botões e inputs padrão.

### 8.3. Group Travel (`/group-travel`)

- Ver [5.2](#52-group-travel--landing-group-travel).

### 8.4. Insurance (`/insurance`)

**Arquivo:** `app/insurance/page.tsx`

- **Descrição:** Apólices e sinistros. Lista de apólices (GET `/api/insurance/policies`) e de sinistros (GET `/api/insurance/claims`). Formulários para contratar apólice e registrar sinistro. Usa `useAuth()` e `authenticatedFetch`.
- **Estados:** `policies`, `claims`, `showPolicyForm`, `showClaimForm`, `bookingId`, `claimType`, `claimDescription`, `claimAmount`, etc.
- **Cores:** Cards, badges de status (active/expired/pending/approved), botões primários.

---

## 9. Quality, Onboarding, CRM, Analytics

### 9.1. Quality (`/quality`)

- Já referenciado em **PAGE_DOC_CONTATO_INSTITUCIONAL_PERFIL.md**. Página de entrada com links para Dashboard de Qualidade e Ranking (leaderboard).

### 9.2. Onboarding (`/onboarding`)

**Arquivo:** `app/onboarding/page.tsx`

- **Descrição:** Wizard de integração para agentes. Exige autenticação (redireciona para `/login?redirect=/onboarding`). Componente lazy `OnboardingWizard` (treinamento BMAD). Fundo em gradiente `from-blue-50 via-white to-emerald-50`.
- **Cores:** Gradiente suave azul/branco/verde; spinner azul; cards de benefícios (treinamento, integração, suporte).

### 9.3. CRM (`/crm`)

**Arquivo:** `app/crm/page.tsx`

- **Descrição:** CRM com abas: Dashboard (`CRMDashboard`), Clientes (`CustomerList`), Segmentos (`CustomerSegments`), Campanhas (`CampaignList`). Busca de cliente (`CustomerSearch`). Formulário de campanha (`CampaignForm`) em overlay. Navegação para `/crm/[customerId]` ao selecionar cliente.
- **Cores:** Layout container, título e subtítulo cinza, botões e tabelas padrão.

### 9.4. Analytics (`/analytics`)

**Arquivo:** `app/analytics/page.tsx`

- **Descrição:** Análises com abas: Dashboard, Previsão (receita), Heatmap (demanda), Benchmark (concorrência), Insights. Filtro opcional por ID da propriedade. Componentes: `AnalyticsDashboard`, `RevenueForecast`, `DemandHeatmap`, `CompetitorBenchmark`, `AnalyticsInsights`.
- **Cores:** Título `text-3xl`, descrição `text-gray-600`, inputs e botões outline.

---

## 10. Loyalty, Fidelidade, Notificações

### 10.1. Loyalty (`/loyalty`)

**Arquivo:** `app/loyalty/page.tsx`

- **Descrição:** Programa de fidelidade com abas: Dashboard, Meus Pontos, Níveis, Recompensas, Meus Resgates, Histórico. Componentes: `LoyaltyPointsDisplay`, `LoyaltyTiers`, `LoyaltyTransactions`, `RewardsCatalog`, `MyRewards`, `LoyaltyDashboard`, `RewardRedemption` (dialog).
- **Cores:** Tema padrão; destaque para níveis e recompensas.

### 10.2. Fidelidade (`/fidelidade`)

**Arquivo:** `app/fidelidade/page.tsx`

- **Descrição:** Outra interface de fidelidade: pontos, tiers (bronze, prata, ouro, platina, diamante com cores `bg-amber-600`, `bg-gray-400`, `bg-yellow-500`, `bg-blue-500`, `bg-purple-500`), histórico de transações, catálogo de recompensas, resgates. APIs: `/api/loyalty/points`, `/api/loyalty/tiers`, `/api/loyalty/history`, `/api/loyalty/rewards` (inferido).
- **Cores:** Títulos e cards; badges por tier; botões de resgate.

### 10.3. Notificações (`/notificacoes`)

**Arquivo:** `app/notificacoes/page.tsx`

- **Descrição:** Lista de notificações do usuário. GET `/api/notifications` (com Authorization). Marcar como lida: PUT `/api/notifications/[id]/read`. Link “Voltar” para `/perfil`. Estados vazios e loading com spinner.
- **Cores:** `bg-gray-50`, header com ícone Bell, cards por notificação, badge de não lidas.

---

## 11. Páginas Dinâmicas: Hotel e Leilão

### 11.1. Detalhe do Hotel / Empreendimento (`/hoteis/[id]`)

**Arquivo:** `app/hoteis/[id]/page.tsx`

- **Descrição:** Página pública do empreendimento (hotel). Dados: GET `/api/v1/enterprises/[id]` e GET `/api/v1/enterprises/[id]/properties`. Exibe galeria de imagens (hero com indicadores), nome, tipo, localização, estrelas, descrição, propriedades (acomodações), cards de cross-sell (`MobileCrossSellCard`, cotação).
- **Estados:** `enterprise`, `properties`, `loading`, `selectedImage`.
- **Cores:** Hero `bg-gray-900` com overlay `bg-black bg-opacity-40`; fundo geral `bg-gray-50`; links `text-blue-600`; botões primários.

### 11.2. Detalhe do Leilão (`/leiloes/[id]`)

- Descrito em [4.2](#42-leilões--detalhe-leiloesid). Rota dinâmica por `id` do leilão.

---

## 12. Sistema de Cores (resumo por página)

| Página | Cores principais |
|--------|-------------------|
| **Login / Recuperar senha** | Gradiente `from-blue-600 via-blue-700 to-indigo-800`; texto `blue-200`, `blue-100`; card branco; botão login `blue-600`, cadastro `green-600`; erro `red-50/red-200/red-700`. |
| **Leilões** | `bg-gray-50`, cards brancos, `blue-600` para CTAs e links. |
| **Flash Deals** | Alinhado ao tema (azul/laranja em cards e CTAs). |
| **Viagens grupo / Group travel** | Container padrão, `text-muted-foreground`, cards hover. |
| **Perfil** | Header `from-blue-600 to-blue-800`, fundo `gray-50`, verde para verificado, vermelho para erro. |
| **Minhas reservas** | Fundo claro, badges por status (verde/amarelo/vermelho/cinza). |
| **Dashboard / Dashboard RSV** | `bg-gray-50`, `text-gray-900`/`text-gray-600`, cards e botões padrão. |
| **Booking** | Tema neutro, botão primário e secondary. |
| **Cupons / Insurance / CRM / Analytics** | Cards, tabelas, badges de status; azul para primário. |
| **Onboarding** | `from-blue-50 via-white to-emerald-50`; spinner azul. |
| **Loyalty / Fidelidade** | Tiers com cores (âmbar, cinza, amarelo, azul, roxo); tema padrão. |
| **Notificações** | `bg-gray-50`, ícone Bell, cards. |
| **Hoteis [id]** | Hero escuro, overlay, `gray-50`, `blue-600` links. |
| **Leilões [id]** | `bg-gray-50`, header branco, `blue-600` para links e CTA. |

Para detalhes de cores das páginas Contato, Institucionais e Perfil, ver **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md**. Para a página Melhorias Mobile, ver **DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md**.
