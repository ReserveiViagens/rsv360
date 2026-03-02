# 🧪 GUIA DE TESTES - RSV360

## 📋 Visão Geral

Este projeto possui uma suíte completa de testes automatizados cobrindo:
- ✅ Testes Unitários (Jest)
- ✅ Testes de Integração (Jest)
- ✅ Testes End-to-End (Playwright)
- ✅ Testes de Performance (Playwright)
- ✅ Testes de Segurança (Playwright)

---

## 🚀 Como Executar os Testes

### Pré-requisitos

1. **Servidor Backend rodando:**
   ```bash
   cd backend
   npm start
   # Ou em modo desenvolvimento:
   npm run dev
   ```

2. **Frontend rodando (para testes E2E):**
   ```bash
   cd apps/site-publico
   npm run dev
   ```

3. **Banco de dados configurado:**
   ```bash
   cd backend
   npm run migrate
   ```

### Executar Todos os Testes

```bash
cd backend
npm run test:all
```

### Executar Testes Específicos

```bash
# Testes Unitários
npm run test:unit

# Testes de Integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes de Performance
npm run test:performance

# Testes de Segurança
npm run test:security
```

---

## 📁 Estrutura de Testes

```
backend/
├── tests/
│   ├── unit/              # Testes unitários
│   │   └── auctions/
│   │       └── service.test.js
│   ├── integration/       # Testes de integração
│   │   └── api.test.js
│   ├── e2e/               # Testes end-to-end
│   │   └── playwright.spec.js
│   ├── performance/       # Testes de performance
│   │   ├── load.spec.js
│   │   └── response-time.spec.js
│   └── security/          # Testes de segurança
│       ├── auth.spec.js
│       ├── rate-limiting.spec.js
│       └── validation.spec.js
├── playwright.config.js   # Configuração Playwright
├── jest.config.js          # Configuração Jest
└── scripts/
    └── run-all-tests.js    # Script para executar todos os testes
```

---

## 🎯 Tipos de Testes

### 1. Testes Unitários

Testam funções e métodos isoladamente.

**Exemplo:**
```javascript
test('deve criar um leilão', async () => {
  const auction = await AuctionsService.create({...});
  expect(auction).toBeDefined();
});
```

**Executar:**
```bash
npm run test:unit
```

### 2. Testes de Integração

Testam fluxos completos entre componentes.

**Exemplo:**
```javascript
test('deve criar e listar leilões', async () => {
  const response = await request(app)
    .post('/api/v1/auctions')
    .send({...});
  expect(response.status).toBe(201);
});
```

**Executar:**
```bash
npm run test:integration
```

### 3. Testes End-to-End (E2E)

Testam o sistema completo do ponto de vista do usuário.

**Cobertura:**
- ✅ Autenticação
- ✅ Leilões (criar, listar, fazer lance)
- ✅ Flash Deals (criar, reservar)
- ✅ Marketplace (listar, filtrar)
- ✅ Google Hotel Ads (criar feed, gerar XML)
- ✅ Voice Commerce (visualizar chamadas)
- ✅ Afiliados (visualizar dashboard)

**Executar:**
```bash
npm run test:e2e
```

**Requisitos:**
- Servidor backend rodando em `http://localhost:5000`
- Frontend rodando em `http://localhost:3000`

### 4. Testes de Performance

Avaliam tempo de resposta, throughput e escalabilidade.

**Métricas testadas:**
- ⚡ Tempo de resposta < 200-500ms
- ⚡ Throughput > 50 req/s
- ⚡ Suporte a 100+ requisições simultâneas
- ⚡ Escalabilidade linear

**Executar:**
```bash
npm run test:performance
```

### 5. Testes de Segurança

Validam proteções contra vulnerabilidades comuns.

**Cobertura:**
- 🔒 Autenticação (JWT, tokens)
- 🔒 Autorização (permissões)
- 🔒 Rate Limiting
- 🔒 Validação de Input
- 🔒 Proteção contra SQL Injection
- 🔒 Proteção contra XSS
- 🔒 Proteção contra Path Traversal
- 🔒 Proteção contra Command Injection
- 🔒 Headers de Segurança (Helmet)
- 🔒 CORS

**Executar:**
```bash
npm run test:security
```

---

## 📊 Relatórios

### Relatório HTML (Playwright)

Após executar testes Playwright, visualize o relatório:

```bash
npx playwright show-report
```

### Relatório JSON

Relatório resumido salvo em:
```
backend/test-results/summary.json
```

### Coverage (Jest)

```bash
npm run test:unit -- --coverage
```

Relatório HTML gerado em:
```
backend/coverage/index.html
```

---

## ⚙️ Configuração

### Variáveis de Ambiente para Testes

Crie um arquivo `.env.test`:

```env
# API
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv360_test
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=test-secret-key
```

### Playwright Config

Arquivo: `backend/playwright.config.js`

Configurações principais:
- Timeout: 30s por teste
- Workers: 2 (paralelo)
- Retries: 2 em CI
- Screenshots: apenas em falhas
- Vídeos: apenas em falhas

### Jest Config

Arquivo: `backend/jest.config.js`

Configurações principais:
- Ambiente: Node.js
- Timeout: 10s por teste
- Coverage: HTML, LCOV, texto

---

## 🐛 Troubleshooting

### Erro: "Connection Refused"

**Problema:** Servidor não está rodando.

**Solução:**
```bash
# Terminal 1: Iniciar backend
cd backend
npm start

# Terminal 2: Executar testes
npm run test:e2e
```

### Erro: "Cannot find module"

**Problema:** Dependências não instaladas.

**Solução:**
```bash
npm install
npx playwright install chromium
```

### Erro: "Database connection failed"

**Problema:** Banco de dados não configurado.

**Solução:**
```bash
# Criar banco de teste
createdb rsv360_test

# Executar migrations
npm run migrate
```

### Testes E2E falhando

**Problema:** Frontend não está rodando.

**Solução:**
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd apps/site-publico && npm run dev

# Terminal 3: Testes
cd backend && npm run test:e2e
```

---

## 📈 CI/CD Integration

### GitHub Actions

Exemplo de workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run migrate
      - run: npm start &
      - run: npm run test:all
```

---

## ✅ Checklist de Testes

Antes de fazer commit:

- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes E2E passando (se aplicável)
- [ ] Testes de performance dentro dos limites
- [ ] Testes de segurança passando
- [ ] Coverage > 70%

---

## 📚 Recursos Adicionais

- [Documentação Playwright](https://playwright.dev)
- [Documentação Jest](https://jestjs.io)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

**Última atualização:** 22/01/2025
