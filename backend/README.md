# Onboarding RSV Backend API

Backend completo para o Sistema de Onboarding RSV com Node.js, Express, PostgreSQL e JWT Authentication.

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis (opcional, para cache)
- NPM ou Yarn

## 🚀 Setup Rápido

### 1. Instalação de Dependências

```bash
# Instalar dependências
npm install

# Ou com yarn
yarn install
```

### 2. Configuração do Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

### 3. Configurar PostgreSQL

```bash
# No PostgreSQL, criar usuário e banco (opcional)
sudo -u postgres psql
CREATE USER onboarding_user WITH PASSWORD 'your_password';
CREATE DATABASE onboarding_rsv OWNER onboarding_user;
GRANT ALL PRIVILEGES ON DATABASE onboarding_rsv TO onboarding_user;
\q
```

### 4. Setup Automático do Banco

```bash
# Executar setup completo (cria banco, migra tabelas, cria admin)
npm run setup

# Ou individualmente:
npm run migrate
npm run seed
```

### 5. Iniciar Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Iniciar com nodemon
npm start               # Iniciar servidor
npm test               # Executar testes
npm run test:watch     # Testes em modo watch

# Banco de dados
npm run migrate        # Executar migrações
npm run migrate:rollback  # Reverter última migração
npm run seed           # Executar seeds
npm run setup          # Setup completo do banco

# Qualidade de código
npm run lint           # Verificar ESLint
npm run lint:fix       # Corrigir ESLint automaticamente
```

## 🔐 Variáveis de Ambiente Principais

```env
# Servidor
NODE_ENV=development
PORT=3001
HOST=localhost

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboarding_rsv
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 📡 Endpoints Principais

### Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/logout` - Logout

### Usuários

- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Reservas

- `GET /api/bookings` - Listar reservas
- `POST /api/bookings` - Criar reserva
- `GET /api/bookings/:id` - Obter reserva
- `PUT /api/bookings/:id` - Atualizar reserva
- `DELETE /api/bookings/:id` - Cancelar reserva

### Pagamentos

- `GET /api/payments` - Listar pagamentos
- `POST /api/payments` - Processar pagamento
- `GET /api/payments/:id` - Obter pagamento
- `POST /api/payments/:id/refund` - Estornar pagamento

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações
│   │   ├── database.js  # Conexão do banco
│   │   └── swagger.js   # Documentação API
│   ├── database/        # Banco de dados
│   │   ├── migrations/  # Migrações
│   │   └── seeds/       # Seeds
│   ├── middleware/      # Middlewares
│   │   ├── auth.js      # Autenticação
│   │   └── errorHandler.js # Tratamento de erros
│   ├── routes/          # Rotas da API
│   │   ├── auth.js      # Autenticação
│   │   ├── users.js     # Usuários
│   │   ├── bookings.js  # Reservas
│   │   └── payments.js  # Pagamentos
│   ├── utils/           # Utilitários
│   │   └── logger.js    # Sistema de logs
│   └── server.js        # Servidor principal
├── scripts/             # Scripts utilitários
│   └── setup-database.js # Setup do banco
├── package.json
├── knexfile.js         # Configuração Knex
└── README.md
```

## 🔒 Autenticação e Autorização

### JWT Tokens

- Access token: 7 dias de validade
- Refresh token: 30 dias de validade
- Tokens enviados no header: `Authorization: Bearer <token>`

### Roles e Permissões

- **admin**: Acesso total ao sistema
- **manager**: Gerenciamento de equipe e relatórios
- **user**: Funcionalidades básicas
- **guest**: Acesso limitado

### Middleware de Proteção

```javascript
// Autenticação obrigatória
router.use(authenticateToken);

// Autorização por role
router.use(authorize(["admin", "manager"]));

// Permissão específica
router.use(requirePermission("users.edit"));
```

## 📊 Banco de Dados

### Tabelas Principais

- `users` - Usuários do sistema
- `bookings` - Reservas e agendamentos
- `payments` - Transações e pagamentos
- `workflows` - Fluxos de trabalho
- `projects` - Projetos e tarefas
- `financial_transactions` - Gestão financeira

### Migrações

```bash
# Criar nova migração
npx knex migrate:make create_new_table

# Executar migrações
npm run migrate

# Reverter última migração
npm run migrate:rollback
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:coverage
```

### Estrutura de Testes

```
tests/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
└── e2e/           # Testes end-to-end
```

## 📝 Logs

### Níveis de Log

- `error`: Erros críticos
- `warn`: Avisos importantes
- `info`: Informações gerais
- `debug`: Informações de debug

### Logs em Produção

- Logs salvos em arquivos (`logs/`)
- Rotação automática de logs
- Integração com serviços de monitoramento

## 🚀 Deploy

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
# Build (se necessário)
npm run build

# Iniciar servidor
npm start

# Com PM2
pm2 start ecosystem.config.js
```

### Docker

```bash
# Build da imagem
docker build -t onboarding-rsv-backend .

# Executar container
docker run -p 3001:3001 onboarding-rsv-backend
```

## 📚 Documentação da API

A documentação completa da API está disponível em:

- **Desenvolvimento**: http://localhost:3001/api-docs
- **Produção**: https://api.onboardingrsv.com/api-docs

### Swagger/OpenAPI

- Documentação automática gerada
- Interface interativa para testes
- Schemas e exemplos incluídos

## 🔧 Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U postgres -d onboarding_rsv
```

#### Erro de Migração

```bash
# Reverter e executar novamente
npm run migrate:rollback
npm run migrate
```

#### Erro de Permissão

```bash
# Verificar permissões do usuário no banco
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE onboarding_rsv TO your_user;
```

## 📈 Monitoramento

### Health Check

- `GET /health` - Status do servidor
- `GET /api/health` - Status detalhado da API

### Métricas

- Tempo de resposta das APIs
- Uso de memória e CPU
- Conexões do banco de dados
- Taxa de erro das requisições

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **RSV Team** - Desenvolvimento inicial

## 📞 Suporte

Para suporte técnico:

- Email: support@onboardingrsv.com
- Documentação: http://docs.onboardingrsv.com
- Issues: https://github.com/rsv/onboarding-rsv/issues
