# 🧪 Framework de Testes - RSV 360° Ecosystem

## 📋 Visão Geral

Este framework de testes abrangente foi desenvolvido para garantir a qualidade e confiabilidade do RSV 360° Ecosystem. Ele inclui testes unitários, de integração e end-to-end, cobrindo todos os módulos do sistema.

## 🏗️ Arquitetura de Testes

### **Tipos de Testes**

1. **🧪 Testes Unitários** - Testam funções e componentes individuais
2. **🔗 Testes de Integração** - Testam a interação entre módulos e APIs
3. **🎭 Testes End-to-End** - Testam fluxos completos do usuário
4. **📊 Testes de Performance** - Verificam métricas de performance
5. **🔒 Testes de Segurança** - Validam aspectos de segurança

### **Estrutura de Diretórios**

```
testing-framework/
├── unit-tests/              # Testes unitários por módulo
├── integration-tests/       # Testes de integração de API
├── e2e-tests/              # Testes end-to-end com Playwright
├── test-data/              # Dados de teste e fixtures
├── test-utils/             # Utilitários e helpers de teste
├── package.json            # Configuração do framework
├── jest.config.js          # Configuração do Jest
├── playwright.config.ts    # Configuração do Playwright
├── run-tests.js           # Script principal de execução
└── README.md              # Esta documentação
```

## 🚀 Como Usar

### **Instalação**

```bash
cd INFRASTRUCTURE/testing-framework
npm install
```

### **Configuração**

1. Copie o arquivo de ambiente:
```bash
cp env.test.example .env.test
```

2. Configure as variáveis de ambiente conforme necessário

3. Inicie o banco de dados de teste:
```bash
docker-compose -f ../database-cluster/docker-compose.databases.yml up -d
```

### **Execução de Testes**

#### **Executar Todos os Testes**
```bash
npm run test:all
# ou
node run-tests.js
```

#### **Executar Testes Específicos**
```bash
# Testes unitários
npm run test:unit
node run-tests.js unit

# Testes de integração
npm run test:integration
node run-tests.js integration

# Testes end-to-end
npm run test:e2e
node run-tests.js e2e

# Relatório de cobertura
npm run test:coverage
node run-tests.js coverage
```

#### **Executar Testes em Modo Watch**
```bash
npm run test:watch
```

#### **Executar Testes com UI do Playwright**
```bash
npm run test:e2e:ui
```

## 📊 Relatórios e Cobertura

### **Cobertura de Código**
- **Threshold**: 80% (configurável)
- **Formatos**: Text, LCOV, HTML
- **Localização**: `coverage/` directory

### **Relatórios de Teste**
- **Jest**: Console + HTML
- **Playwright**: HTML + JSON + JUnit
- **Localização**: `test-results/` directory

## 🔧 Configurações

### **Jest Configuration**
- **Timeout**: 30 segundos
- **Environment**: Node.js
- **Coverage**: Automático para todos os arquivos TypeScript
- **Setup**: Configuração global em `test-utils/setup.ts`

### **Playwright Configuration**
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop + Mobile
- **Base URL**: http://localhost:3000
- **Timeout**: 30 segundos
- **Retries**: 2 tentativas

### **Database Testing**
- **Environment**: PostgreSQL isolado
- **Schemas**: Separados por módulo
- **Data**: Gerada automaticamente com Faker.js
- **Cleanup**: Automático após cada teste

## 🛠️ Utilitários de Teste

### **TestDataGenerator**
Gera dados de teste realistas usando Faker.js:

```typescript
import { TestDataGenerator } from './test-utils/test-helpers';

const user = TestDataGenerator.generateUser();
const hotel = TestDataGenerator.generateHotel();
const reservation = TestDataGenerator.generateReservation();
```

### **DatabaseTestHelpers**
Auxilia na criação e limpeza de dados de teste:

```typescript
import { DatabaseTestHelpers } from './test-utils/test-helpers';

const user = await DatabaseTestHelpers.createTestUser();
const customer = await DatabaseTestHelpers.createTestCustomer();
```

### **APITestHelpers**
Facilita testes de API:

```typescript
import { APITestHelpers } from './test-utils/test-helpers';

const authOptions = await APITestHelpers.makeAuthenticatedRequest('/api/users');
const response = await APITestHelpers.waitForAPIResponse('/api/health');
```

## 📝 Escrevendo Testes

### **Testes Unitários**
```typescript
describe('CRM System - Unit Tests', () => {
  test('should create a new user', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    const result = await createUser(userData);
    expect(result.name).toBe(userData.name);
  });
});
```

### **Testes de Integração**
```typescript
describe('API Integration Tests', () => {
  test('should create user via API', async () => {
    const response = await request(SERVER_URL)
      .post('/api/crm/users')
      .send({ name: 'Test User', email: 'test@example.com' })
      .expect(201);
    
    expect(response.body.name).toBe('Test User');
  });
});
```

### **Testes End-to-End**
```typescript
test('Complete customer journey', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Services');
  await expect(page).toHaveURL(/.*services/);
  // ... mais passos do fluxo
});
```

## 🔍 Debugging

### **Logs de Teste**
- **Nível**: Configurável via `LOG_LEVEL`
- **Formato**: Estruturado JSON
- **Localização**: Console + arquivos de log

### **Screenshots e Videos**
- **Playwright**: Automático em falhas
- **Localização**: `test-results/` directory
- **Formato**: PNG (screenshots), WebM (videos)

### **Tracing**
- **Playwright**: Habilitado em primeira tentativa
- **Localização**: `test-results/trace/` directory
- **Visualização**: `npx playwright show-trace trace.zip`

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **Banco de dados não conecta**
   ```bash
   # Verificar se PostgreSQL está rodando
   pg_isready -h localhost -p 5432
   
   # Iniciar com Docker
   docker-compose -f ../database-cluster/docker-compose.databases.yml up -d
   ```

2. **Playwright não instala**
   ```bash
   # Instalar dependências do sistema
   npx playwright install --with-deps
   ```

3. **Testes falham por timeout**
   - Verificar se o servidor está rodando
   - Aumentar timeout nas configurações
   - Verificar conectividade de rede

4. **Cobertura baixa**
   - Verificar se todos os arquivos estão sendo testados
   - Adicionar testes para casos não cobertos
   - Ajustar threshold se necessário

### **Logs de Debug**
```bash
# Executar com logs detalhados
DEBUG=* npm run test

# Executar Playwright em modo debug
npx playwright test --debug
```

## 📈 Métricas e KPIs

### **Métricas de Qualidade**
- **Cobertura de Código**: > 80%
- **Tempo de Execução**: < 5 minutos (todos os testes)
- **Taxa de Sucesso**: > 95%
- **Performance**: < 3s (carregamento de página)

### **Relatórios Automáticos**
- **CI/CD**: Integração com GitHub Actions
- **Notificações**: Slack/Email em falhas
- **Dashboard**: Métricas em tempo real

## 🔄 Integração CI/CD

### **GitHub Actions**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd INFRASTRUCTURE/testing-framework && npm install
      - run: cd INFRASTRUCTURE/testing-framework && npm run test:all
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY INFRASTRUCTURE/testing-framework/ .
RUN npm install
CMD ["npm", "run", "test:all"]
```

## 📚 Recursos Adicionais

- **Documentação Jest**: https://jestjs.io/docs/getting-started
- **Documentação Playwright**: https://playwright.dev/docs/intro
- **Faker.js**: https://fakerjs.dev/guide/
- **Supertest**: https://github.com/visionmedia/supertest

## 🤝 Contribuição

Para adicionar novos testes:

1. Crie o arquivo de teste no diretório apropriado
2. Siga as convenções de nomenclatura
3. Use os utilitários fornecidos
4. Adicione documentação se necessário
5. Execute os testes para verificar

---

**Desenvolvido para o RSV 360° Ecosystem**  
**Versão**: 1.0.0  
**Última Atualização**: 2024-12-19
