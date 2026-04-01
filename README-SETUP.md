# 📚 Guia Completo de Setup - PMS CRM RSV360

> Instruções detalhadas para configurar, executar e fazer deploy do sistema RSV360.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Local](#instalação-local)
3. [Configuração de Ambiente](#configuração-de-ambiente)
4. [Executar em Desenvolvimento](#executar-em-desenvolvimento)
5. [Build para Produção](#build-para-produção)
6. [Deploy](#deploy)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Sistema Operacional
- Windows 10/11, macOS 12+, ou Linux (Ubuntu 20.04+)

### Software Obrigatório
- **Node.js**: v18.0.0 ou superior
  ```bash
  node --version  # Verificar instalação
  ```
- **npm**: v9.0.0 ou superior (incluído com Node.js)
  ```bash
  npm --version   # Verificar versão
  ```
- **PostgreSQL**: v12 ou superior
  ```bash
  psql --version  # Verificar instalação
  ```
- **Git**: Para controle de versão
  ```bash
  git --version   # Verificar instalação
  ```

### Software Recomendado
- **Docker** e **Docker Compose** (para env padronizado)
- **VS Code** com extensões:
  - ES7+ React/Redux/React-Native snippets
  - PostgreSQL
  - Thunder Client (testes de API)
- **pgAdmin** (para gerenciar banco de dados)

---

## 📥 Instalação Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo.git
cd "PMS-CRM-RSV360-Versao-Oficial-definitivo"
```

### 2. Instalar Dependências

```bash
# Instalar dependências root
npm install

# Instalar dependências de todos os workspaces
npm install --workspaces
```

**Tempo estimado**: 5-15 minutos (depende da conexão)

### 3. Verificar Instalação

```bash
# Listar workspaces instalados
npm ls --all --depth=0

# Verificar estrutura de pastas
ls -la apps/
ls -la packages/
ls -la backend/
```

---

## ⚙️ Configuração de Ambiente

### 1. Arquivo `.env` (Root)

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rsv360
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=sua_senha

# API
API_PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Google Maps (opcional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### 2. Arquivo `.env` (Aplicações específicas)

Cada aplicação em `apps/*/` pode ter seu próprio `.env`:

```bash
# Para site-publico
cp apps/site-publico/.env.example apps/site-publico/.env

# Para turismo
cp apps/turismo/.env.example apps/turismo/.env

# Para backend
cp backend/.env.example backend/.env
```

### 3. Configurar PostgreSQL

```bash
# Windows (PowerShell)
# Criar database
psql -U postgres -c "CREATE DATABASE rsv360;"

# Criar usuário (opcional)
psql -U postgres -c "CREATE USER rsv360_user WITH PASSWORD 'senha_segura';"
psql -U postgres -c "ALTER USER rsv360_user CREATEDB;"

# macOS/Linux
sudo -u postgres psql
```

```sql
-- No prompt psql
CREATE DATABASE rsv360;
CREATE USER rsv360_user WITH PASSWORD 'senha_segura';
ALTER USER rsv360_user CREATEDB;
ALTER ROLE rsv360_user WITH LOGIN;
GRANT ALL PRIVILEGES ON DATABASE rsv360 TO rsv360_user;
```

### 4. Executar Migrations

```bash
# Aplicar todas as migrations
npm run migrate

# Verificar migrations aplicadas
npm run migrate:status

# Reverter última migration
npm run migrate:rollback
```

---

## 🚀 Executar em Desenvolvimento

### Opção 1: Todos os serviços de uma vez

```bash
npm run dev
```

Isso inicia:
- ✅ Backend API (porta 5000)
- ✅ Site Público + CRM (porta 3000)
- ✅ Dashboard Turismo (porta 3005)
- ✅ Atendimento IA (porta 3010)

**Tempo de inicialização**: 30-60 segundos

### Opção 2: Serviço específico

```bash
# Backend apenas
npm run dev:backend

# Site Público + CRM
npm run dev:site

# Dashboard de Turismo
npm run dev:turismo

# Atendimento IA
npm run dev:atendimento
```

### Opção 3: PowerShell Scripts (Windows)

```powershell
# Iniciar tudo
.\Iniciar Sistema Completo.ps1

# Parar tudo
.\Parar Sistema Completo.ps1

# Reiniciar
.\Reiniciar Sistema Completo.ps1
```

### Verificar Status

```bash
# Listar processos em execução
npm list --depth=0

# Testar conectividade
curl http://localhost:5000/api/health
curl http://localhost:3000
curl http://localhost:3005
```

---

## 🔨 Build para Produção

### 1. Build de todos os workspaces

```bash
npm run build

# Ou específicos:
npm run build:backend
npm run build:site
npm run build:turismo
```

### 2. Verificação de tipos TypeScript

```bash
npm run type-check
```

### 3. Lint e formatação

```bash
# Verificar lint
npm run lint

# Corrigir lint automaticamente
npm run lint:fix

# Formatar código
npm run format
```

### 4. Testes

```bash
# Rodar todos os testes
npm run test

# Com coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🚢 Deploy

### Preparação

```bash
# 1. Verificar se tudo está commitado
git status

# 2. Build production
npm run build

# 3. Verificar erros
npm run lint
npm run type-check

# 4. Rodar testes
npm run test
```

### Docker

```bash
# Build imagem Docker
docker build -t rsv360:latest .

# Rodar container
docker run -p 3000:3000 -p 5000:5000 \
  --env DATABASE_URL=... \
  --env JWT_SECRET=... \
  rsv360:latest

# Docker Compose
docker-compose up -d
```

### Azure App Service

```bash
# 1. Fazer login no Azure
az login

# 2. Criar resource group
az group create --name rsv360-rg --location eastus

# 3. Criar App Service Plan
az appservice plan create --name rsv360-plan --resource-group rsv360-rg --sku B2

# 4. Deploy
npm run deploy:azure
```

### Netlify/Vercel (Frontend)

```bash
# Deploy automático via Git
git push origin main

# Ou manual
npm run build
npm run deploy
```

---

## 🧪 Testes

### Testes Unitários

```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Testes de Integração

```bash
# Testar APIs
npm run test:api

# Testar com dados de produção (cuidado!)
npm run test:integration
```

### Testes de Performance

```bash
npm run test:performance
npm run test:load
```

---

## 🐛 Troubleshooting

### Erro: "Port already in use"

```bash
# Windows
netstat -ano | find ":5000"
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Erro: "Database connection refused"

```bash
# 1. Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT 1;"

# 2. Verificar credenciais em .env
cat .env | grep DATABASE_URL

# 3. Resetar conexão
npm run db:reset
```

### Erro: "Module not found"

```bash
# Limpar node_modules e reinstalar
rm -r node_modules
npm install --workspaces

# Ou em Windows PowerShell
Remove-Item -Recurse node_modules
npm install --workspaces
```

### Erro: "Port 5432 em uso"

```powershell
# Windows - Mudar porta PostgreSQL
.\MUDAR_PORTA_POSTGRESQL.ps1

# Ou manualmente
ALTER SYSTEM SET port = 5433;
SELECT pg_reload_conf();
```

### Logs de Desenvolvimento

```bash
# Ativar verbose logging
DEBUG=* npm run dev

# Ou específico
DEBUG=backend:* npm run dev:backend
```

---

## 📞 Suporte e Recursos

### Documentação
- [Estrutura do Projeto](./DOCUMENTACAO_COMPLETA_SISTEMA.md)
- [APIs disponíveis](./docs/API.md)
- [Guia de Contribuição](./docs/CONTRIBUTING.md)

### Links Úteis
- 🌐 Site: https://www.rsv360.com.br
- 📖 Docs: https://docs.rsv360.com.br
- 🐛 Issues: https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues
- 💬 Discussions: https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/discussions

### Equipe
- **Desenvolvedor Principal**: [Seu Nome]
- **Arquiteto**: [Nome]
- **DevOps**: [Nome]

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

---

**Última atualização**: Abril 2026
**Versão**: 1.0.0
