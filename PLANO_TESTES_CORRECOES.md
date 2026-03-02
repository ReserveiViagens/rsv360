# Plano de Testes e Correções - Dashboard Turismo e Backend

## Resumo dos erros identificados

| # | Erro | Causa provável | Módulo |
|---|------|----------------|--------|
| 1 | `Failed to fetch` / `Network Error` (AxiosError ERR_NETWORK) | Backend (porta 5000) não está rodando ou não é alcançável | Login, Leilões, Marketplace, Afiliados |
| 2 | Login usa `/api/core/token` | Backend expõe `/api/auth/login`; formato de resposta diferente (`token`/`refreshToken` vs `access_token`/`refresh_token`) | AuthContext |
| 3 | `fetchUserData` usa `/api/users/me` | Backend expõe `/api/auth/me` e retorna `{ success, user }` | AuthContext |
| 4 | `verifyToken` usa `/api/core/verify` | Endpoint não existe; usar `/api/auth/me` | AuthContext |
| 5 | `refreshAccessToken` usa `/api/core/refresh` e `refresh_token` | Backend: `/api/auth/refresh` com `{ refreshToken }` e retorna `{ token }` (sem novo refresh) | AuthContext |
| 6 | GET `/api/v1/affiliates/:id/referrals` | Rota não existe (só POST `/:id/referrals`) | Backend affiliates |
| 7 | GET `/api/v1/affiliates/:id/payouts` | Rota não existe (só POST `/:id/payouts`) | Backend affiliates |
| 8 | `Invalid easing type 'cubic-bezier(0.4, 0, 0.2, 1)'` | Uso de string CSS em Motion; usar array `[0.4, 0, 0.2, 1]` ou nome de easing | motion/framer (ex.: marketplace ou componente UI) |

---

## Ordem de execução: uma funcionalidade por vez

### Fase 0 – Infraestrutura (pré-requisito)

- [ ] **0.1** Backend sobe sem erro: sem `Cannot find module './service'` em `twilio-voice.js` (já removido).
- [ ] **0.2** `GET http://127.0.0.1:5000/health` retorna 200.
- [ ] **0.3** CORS: `http://localhost:3005` está em `origin` do backend (já configurado).

### Fase 1 – Autenticação (AuthContext + Backend Auth)

- [ ] **1.1** Login (backend): `POST /api/auth/login` com `{ email, password }` → `{ token, refreshToken, user }`.
- [ ] **1.2** AuthContext: trocar `/api/core/token` → `/api/auth/login` e mapear `token`→`access_token`, `refreshToken`→`refresh_token` para `localStorage`.
- [ ] **1.3** AuthContext: `fetchUserData` → `GET /api/auth/me` com `Authorization: Bearer {token}`; usar `data.user` e `name`→`full_name`.
- [ ] **1.4** AuthContext: `verifyToken` → `GET /api/auth/me`; se 200, token válido.
- [ ] **1.5** AuthContext: `refreshAccessToken` → `POST /api/auth/refresh` com `{ refreshToken }`; atualizar só `access_token` com `data.token`.
- [ ] **1.6** Registro: AuthContext usa `/api/users/`; backend tem `/api/auth/register` com `{ name, email, password }` → enviar `name: full_name`.
- [ ] **1.7** Teste: login com `admin@onionrsv.com` / `admin123` (mock local) e com usuário real via `/api/auth/login`.

### Fase 2 – Leilões (Auctions)

- [ ] **2.1** Backend: `GET /api/v1/auctions` (com Auth) e `GET /api/v1/auctions/active` (público) respondem.
- [ ] **2.2** Frontend: `leiloesApi.getLeiloes()` → `GET /api/v1/auctions`; `apiClient` envia `Authorization` a partir do token do AuthContext.
- [ ] **2.3** Páginas: `dashboard/leiloes/index`, `leiloes/novo`, `leiloes/[id]`, `leiloes/flash-deals`, `leiloes/relatorios` carregam sem Network Error (com backend no ar).
- [ ] **2.4** CRUD: criar, editar, listar, detalhe e (se houver) finalizar leilão.

### Fase 3 – Marketplace

- [ ] **3.1** Backend: `GET /api/v1/marketplace/listings` → `{ data, pagination }`; `GET /api/v1/marketplace/orders` e `GET /api/v1/marketplace/commissions` → arrays.
- [ ] **3.2** Frontend: `listingsRes.data`, `Array.isArray(ordersRes)`, `Array.isArray(commissionsRes)` já compatíveis com o retorno atual.
- [ ] **3.3** Página `dashboard/marketplace`: carrega listagens, pedidos e comissões sem Network Error.
- [ ] **3.4** (Opcional) Corrigir easing Motion na página/componente que usa `cubic-bezier(0.4, 0, 0.2, 1)`.

### Fase 4 – Afiliados

- [ ] **4.1** Backend: criar `listReferrals(id, filters)` e `listPayouts(id, filters)` no `affiliates` service.
- [ ] **4.2** Backend: rotas `GET /api/v1/affiliates/:id/referrals` e `GET /api/v1/affiliates/:id/payouts`.
- [ ] **4.3** Frontend: `affiliates.tsx` chama `GET .../referrals` e `.../payouts`; tratar `{ data }` se o backend padronizar paginação.
- [ ] **4.4** `GET /api/v1/affiliates/1` e demais chamadas: 200 quando afiliado existir; 404 tratado no frontend.

### Fase 5 – Demais módulos (Google Hotel Ads, OTA, Voice Commerce, etc.)

- [ ] **5.1** Para cada módulo: verificar se as rotas usadas pelo frontend existem no backend e se o formato de resposta está alinhado.
- [ ] **5.2** Testar uma ação principal por módulo (ex.: listar, criar, ou obter métricas).

### Fase 6 – Motion (easing)

- [ ] **6.1** Procurar `cubic-bezier(0.4, 0, 0.2, 1)` ou similar em `apps/turismo` (exceto `node_modules`).
- [ ] **6.2** Substituir por easing aceito pelo Motion (ex.: `[0.4, 0, 0.2, 1]` ou `"easeInOut"`).

---

## Checklist de conclusão por funcionalidade

Uma funcionalidade é considerada **100% desenvolvida e testada** quando:

1. Backend sobe sem erros de import/crash.
2. Endpoints usados pelo frontend existem e retornam o formato esperado.
3. Frontend trata `{ data }` / arrays / 404 de forma consistente.
4. Login (mock ou real) e token no `apiClient` permitem acesso às rotas autenticadas.
5. Não há Network Error com o backend rodando; erros 4xx/5xx são tratados na UI (toast, mensagem, etc.).

---

## Ordem sugerida para testes manuais

1. Subir backend: `cd backend && npm run dev` (ou `node src/server.js`).
2. Verificar `GET http://127.0.0.1:5000/health`.
3. Subir Dashboard Turismo: `cd apps/turismo && npm run dev`.
4. **Auth:** login em `/login` (demo, admin ou usuário real).
5. **Leilões:** acessar `/dashboard/leiloes` e listar/criar.
6. **Marketplace:** `/dashboard/marketplace`.
7. **Afiliados:** `/dashboard/affiliates` (após criar rotas `referrals` e `payouts`).
8. Repetir para Google Hotel Ads, OTA, Voice Commerce, etc.

---

## Correções já aplicadas (nesta sessão)

- Remoção de `require('./service')` em `backend/src/integrations/twilio-voice.js`.
- **AuthContext:** `/api/core/token` → `/api/auth/login`; `/api/users/me` → `/api/auth/me`; `/api/core/verify` → `/api/auth/me`; `/api/core/refresh` → `/api/auth/refresh` (body `{ refreshToken }`). Mapeamento `token`/`refreshToken` para `access_token`/`refresh_token`; `fetchUserData` e login usam `user`/`name` → `full_name`. Registro: `/api/auth/register` com `{ name: full_name, email, password }`.
- **Affiliates:** `GET /api/v1/affiliates/:id/referrals` e `GET /api/v1/affiliates/:id/payouts` (service, controller e rotas). Ajuste em `processPayout`: `payment_method` e `commission_amount` em `affiliate_commissions`.
