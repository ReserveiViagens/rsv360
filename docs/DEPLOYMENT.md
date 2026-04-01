# 🚀 Guia de Deploy - PMS CRM RSV360

## 📍 Ambientes Suportados

- ✅ **Azure App Service** (recomendado)
- ✅ **Docker/Kubernetes**
- ✅ **AWS EC2/Lambda**
- ✅ **Heroku**
- ✅ **DigitalOcean App Platform**
- ✅ **Vercel** (frontend)
- ✅ **Netlify** (frontend)

---

## 🔷 Deploy em Azure App Service

### Pré-requisitos
```bash
# Instalar Azure CLI
choco install azure-cli  # Windows
brew install azure-cli   # macOS

# Login
az login
```

### Passos

1. **Criar Resource Group**
```bash
az group create \
  --name rsv360-rg \
  --location eastus
```

2. **Criar App Service Plan**
```bash
az appservice plan create \
  --name rsv360-plan \
  --resource-group rsv360-rg \
  --sku B2 \
  --is-linux
```

3. **Criar Web App (Node.js)**
```bash
az webapp create \
  --resource-group rsv360-rg \
  --plan rsv360-plan \
  --name rsv360-app \
  --runtime "NODE:18-lts"
```

4. **Configurar Variáveis de Ambiente**
```bash
az webapp config appsettings set \
  --resource-group rsv360-rg \
  --name rsv360-app \
  --settings \
    DATABASE_URL="postgresql://user:pass@server:5432/rsv360" \
    JWT_SECRET="seu_secret_aqui" \
    NODE_ENV="production" \
    WEBSITE_RUN_FROM_PACKAGE="1"
```

5. **Deploy via Git**
```bash
# Adicionar remote do Azure
az webapp deployment source config-local-git \
  --resource-group rsv360-rg \
  --name rsv360-app

# Deploy
git remote add azure <URL_GIT_DO_AZURE>
git push azure main
```

---

## 🐳 Deploy com Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000 3000
CMD ["npm", "run", "start:production"]
```

### Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## ☁️ Deploy em AWS

### Opção 1: EC2

```bash
# 1. Conectar ao servidor
ssh -i chave.pem ubuntu@seu-servidor.com

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar PostgreSQL
sudo apt-get install -y postgresql

# 4. Clonar e configurar projeto
git clone <seu-repo>
cd <projeto>
npm install
npm run build

# 5. Usar PM2 para gerenciar processo
npm install -g pm2
pm2 start npm --name "rsv360" -- start:production
pm2 startup
pm2 save
```

### Opção 2: Lambda (Serverless)

```bash
# 1. Instalar Serverless Framework
npm install -g serverless

# 2. Configurar credenciais AWS
serverless config credentials --provider aws --key <KEY> --secret <SECRET>

# 3. Deploy
serverless deploy
```

---

## 🎯 Deploy em Heroku

```bash
# 1. Login no Heroku
heroku login

# 2. Criar app
heroku create rsv360

# 3. Adicionar PostgreSQL
heroku addons:create heroku-postgresql:standard-0 -a rsv360

# 4. Configurar env vars
heroku config:set JWT_SECRET=seu_secret -a rsv360

# 5. Deploy
git push heroku main

# 6. Rodar migrations
heroku run npm run migrate -a rsv360

# 7. Ver logs
heroku logs --tail -a rsv360
```

---

## 🎨 Deploy Frontend (Vercel/Netlify)

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=apps/site-publico/.next
```

---

## 🔄 CI/CD com GitHub Actions

Veja `.github/workflows/ci-cd.yml` para detalhes.

O pipeline automático:
1. ✅ Testa lint
2. ✅ Roda testes unitários
3. ✅ Faz build
4. ✅ Checa segurança
5. 🚀 Deploy automático em develop/main

---

## 📊 Monitoramento Pós-Deploy

### Health Checks

```bash
# Backend
curl https://seu-domain.com/api/health

# Frontend
curl https://seu-domain.com
```

### Logs

```bash
# Azure
az webapp log tail --resource-group rsv360-rg --name rsv360-app

# Docker
docker logs container-name

# Heroku
heroku logs --tail
```

### Performance

- Monitore com **New Relic**, **DataDog**, ou **AppInsights**
- Configure alertas para taxa de erro > 5%
- Monitore latência P95/P99

---

## 🔄 Rollback

```bash
# GitHub/Git
git revert <commit-hash>
git push origin main

# Azure
az webapp deployment slot swap \
  --resource-group rsv360-rg \
  --name rsv360-app
```

---

## 📋 Checklist Pré-Deploy

- [ ] Todos os testes passando
- [ ] Lint sem erros
- [ ] Build sem warnings
- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations testadas
- [ ] Backup do banco realizado
- [ ] SSL/TLS configurado
- [ ] CDN/Cache configurado

---

## 🆘 Troubleshooting Deploy

### Erro: Build timeout
```bash
# Aumentar timeout no CI/CD
# GitHub Actions: aumentar timeout para 60 min
timeout-minutes: 60
```

### Erro: Out of memory
```bash
# Aumentar SKU (Azure)
az appservice plan update --sku P1V2
```

### Erro: Database connection
```bash
# Verificar connection string
echo $DATABASE_URL
# Revisar firewall rules
```

---

**Documentação atualizada**: Abril 2026
