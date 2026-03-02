# 🚀 Guia de Deploy - RSV 360 Sistema

Este guia contém todas as instruções necessárias para fazer o deploy do sistema RSV 360 em produção.

## 📋 Pré-requisitos

### Servidor de Produção
- **Sistema Operacional**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 2GB (Recomendado: 4GB+)
- **CPU**: 2 cores (Recomendado: 4 cores+)
- **Armazenamento**: 20GB+ livres
- **Rede**: Acesso à internet e porta 80/443 liberadas

### Software Necessário
- **Node.js**: v18+
- **PostgreSQL**: v13+
- **Redis**: v6+
- **Nginx**: v1.18+ (Proxy Reverso)
- **PM2**: Para gerenciamento de processos
- **Certbot**: Para SSL (Let's Encrypt)

## 🛠️ Instalação do Servidor

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Instalar PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Instalar Redis
```bash
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 5. Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Instalar PM2
```bash
sudo npm install -g pm2
```

## 🗄️ Configuração do Banco de Dados

### 1. Criar Banco e Usuário
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE rsv_360_db;
CREATE USER rsv_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE rsv_360_db TO rsv_user;
\q
```

### 2. Executar Migrações
```bash
cd backend
npm run migrate
npm run seed
```

## 📁 Deploy da Aplicação

### 1. Clonar Repositório
```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/rsv-360-sistema.git
sudo chown -R $USER:$USER rsv-360-sistema
cd rsv-360-sistema
```

### 2. Instalar Dependências

#### Frontend
```bash
cd Hotel-com-melhor-preco-main
npm install --production
npm run build
```

#### Backend
```bash
cd ../backend
npm install --production
```

### 3. Configurar Variáveis de Ambiente

#### Frontend (.env)
```bash
cd Hotel-com-melhor-preco-main
cp env.example .env
nano .env
```

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXT_PUBLIC_UPLOAD_URL=https://api.seudominio.com/uploads
NODE_ENV=production
```

#### Backend (.env)
```bash
cd ../backend
cp env.example .env
nano .env
```

```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv_360_db
DB_USER=rsv_user
DB_PASSWORD=sua_senha_segura
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
UPLOAD_DIR=./uploads
CORS_ORIGIN=https://seudominio.com
```

### 4. Configurar PM2

#### Backend
```bash
cd backend
pm2 start test-admin-server.js --name "rsv-backend"
pm2 save
pm2 startup
```

#### Frontend
```bash
cd ../Hotel-com-melhor-preco-main
pm2 start npm --name "rsv-frontend" -- start
pm2 save
```

## 🌐 Configuração do Nginx

### 1. Criar Configuração
```bash
sudo nano /etc/nginx/sites-available/rsv-360
```

```nginx
# Frontend (Next.js)
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload de arquivos
    location /uploads/ {
        alias /var/www/rsv-360-sistema/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/rsv-360 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configuração SSL (Let's Encrypt)

### 1. Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obter Certificados
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com -d api.seudominio.com
```

### 3. Renovação Automática
```bash
sudo crontab -e
```

Adicionar:
```cron
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento

### 1. Status dos Serviços
```bash
# Verificar status
pm2 status
pm2 logs

# Verificar serviços do sistema
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
```

### 2. Logs
```bash
# Logs do PM2
pm2 logs rsv-backend
pm2 logs rsv-frontend

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Atualizações

### 1. Deploy de Atualizações
```bash
cd /var/www/rsv-360-sistema
git pull origin main

# Frontend
cd Hotel-com-melhor-preco-main
npm install
npm run build
pm2 restart rsv-frontend

# Backend
cd ../backend
npm install
pm2 restart rsv-backend
```

### 2. Backup do Banco
```bash
# Backup diário
pg_dump -h localhost -U rsv_user rsv_360_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U rsv_user rsv_360_db < backup_20240101.sql
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -h localhost -U rsv_user -d rsv_360_db
```

#### 2. Erro de Permissões
```bash
# Corrigir permissões
sudo chown -R $USER:$USER /var/www/rsv-360-sistema
chmod -R 755 /var/www/rsv-360-sistema
```

#### 3. Erro de Porta em Uso
```bash
# Verificar portas em uso
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5002

# Matar processo se necessário
sudo kill -9 PID_DO_PROCESSO
```

#### 4. Erro de SSL
```bash
# Renovar certificado
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## 📈 Otimizações de Performance

### 1. Configuração do Nginx
```nginx
# Adicionar ao server block
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Cache de arquivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Configuração do PM2
```bash
# Configurar cluster mode
pm2 start test-admin-server.js --name "rsv-backend" -i max
pm2 start npm --name "rsv-frontend" -- start -i max
```

### 3. Configuração do PostgreSQL
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/13/main/postgresql.conf

# Ajustar configurações de memória
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

## 🔐 Segurança

### 1. Firewall
```bash
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

### 2. Backup Automático
```bash
# Script de backup
sudo nano /usr/local/bin/backup-rsv.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/rsv-360"
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -h localhost -U rsv_user rsv_360_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/rsv-360-sistema/backend/uploads/

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-rsv.sh

# Adicionar ao crontab
sudo crontab -e
0 2 * * * /usr/local/bin/backup-rsv.sh
```

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o deploy:

- **Email**: suporte@seudominio.com
- **WhatsApp**: +55 64 99931-9755
- **Documentação**: [Link para documentação completa]

---

**✅ Deploy Concluído!**

Seu sistema RSV 360 está agora rodando em produção com:
- ✅ Frontend Next.js
- ✅ Backend Node.js
- ✅ Banco PostgreSQL
- ✅ Cache Redis
- ✅ SSL/HTTPS
- ✅ Monitoramento PM2
- ✅ Backup automático
