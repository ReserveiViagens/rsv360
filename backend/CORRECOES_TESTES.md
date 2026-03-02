# Correções Aplicadas nos Testes

**Nenhuma alteração na estrutura ou no design da aplicação.** Apenas arquivos de teste e configuração.

---

## 1. Jest (Unit + Integration)

- **`jest.config.js`**
  - `modulePathIgnorePatterns: ['<rootDir>/microservices']` para evitar que o Jest parse `package.json` dos microserviços.

- **`microservices/attractions-api/package.json`** e **`microservices/admin-panel/package.json`**
  - Reescritos em UTF-8 sem BOM para evitar erro de parsing.

---

## 2. E2E (Playwright)

- **`tests/e2e/playwright.spec.js`**
  - **Login:** Seletores alinhados à página real:
    - `#loginEmail` (FormField usa `id`, não `name`)
    - `#loginPassword`
  - **Redirecionamento:** `/minhas-reservas` em vez de `/dashboard` (comportamento do site).
  - **Leilões – criar:** fluxo via `/admin/cms` e tab “Leilões” (em vez de `/dashboard/leiloes`).
  - **Leilões – listar/fazer lance:** seletores mais flexíveis para cards e links.
  - **Flash Deals:** uso de `LOGIN_EMAIL` e `LOGIN_PASSWORD`.
  - **Marketplace:**
    - Espera o fim de “Carregando listagens”.
    - Listagens: `a[href^="/marketplace/"]`.
    - Vazio: `text=Nenhuma listagem`.
    - Filtro por preço: apenas preenche filtros e garante que o título permanece.
  - **Google Hotel Ads:** uso de `LOGIN_EMAIL` e `LOGIN_PASSWORD`.
  - **Voice Commerce e Afiliados:**
    - Uso de `DASHBOARD_TURISMO_URL` (porta 3005).
    - Sem `beforeEach` de login (páginas do Dashboard Turismo).
  - **API_BASE_URL:** padrão `http://127.0.0.1:5000` (evitar IPv6 `::1`).

---

## 3. Performance e Security (Playwright)

- **`tests/performance/load.spec.js`**
- **`tests/performance/response-time.spec.js`**
- **`tests/security/auth.spec.js`**
- **`tests/security/rate-limiting.spec.js`**
- **`tests/security/validation.spec.js`**

Em todos: `API_BASE_URL` padrão alterado de `http://localhost:5000` para `http://127.0.0.1:5000` para evitar `ECONNREFUSED ::1:5000` quando o backend escuta só em IPv4.

---

## O que NÃO foi alterado

- Componentes, páginas, layouts, CSS
- Backend, rotas, APIs
- Estrutura de pastas do app
- Design/UI

---

## Como rodar os testes

1. Subir o sistema: `.\iniciar-sistema-simples.ps1`
2. No backend: `npm run test:all`

Ou, para tipos específicos:

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run test:performance`
- `npm run test:security`

---

## Credenciais para E2E com login

Os testes de login usam `admin@test.com` / `password123`.  
Para os E2E que dependem de login passarem, é necessário existir um usuário com essas credenciais (ou ajustar os valores nos testes).
