# 🌍 CONFIGURAÇÃO DE AMBIENTES - RSV GEN 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📋 VISÃO GERAL

O sistema suporta múltiplos ambientes: Development, Staging e Production.

---

## 🔧 AMBIENTES CONFIGURADOS

### 1. Development (Local)
**Status:** ✅ Configurado

**Configuração:**
- **URL:** `http://localhost:3000`
- **Database:** PostgreSQL local (Docker)
- **Redis:** Redis local (Docker)
- **Upload:** Sistema local (`public/uploads`)
- **Logs:** Console
- **Debug:** Habilitado

**Variáveis de Ambiente:**
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://rsv_user:rsv_password@localhost:5432/rsv_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
UPLOAD_METHOD=local
```

---

### 2. Staging
**Status:** ⚠️ A Configurar

**Configuração Necessária:**
- **URL:** `https://staging.rsv.com`
- **Database:** PostgreSQL gerenciado (RDS/Cloud SQL)
- **Redis:** Redis gerenciado (ElastiCache/Memorystore)
- **Upload:** S3 ou Cloudinary
- **Logs:** Centralizados (CloudWatch/Stackdriver)
- **Debug:** Parcialmente habilitado

**Variáveis de Ambiente:**
```env
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.rsv.com
DATABASE_URL=postgresql://user:pass@staging-db.rsv.com:5432/rsv_db
REDIS_URL=redis://staging-redis.rsv.com:6379
JWT_SECRET=[SECRET_FROM_VAULT]
UPLOAD_METHOD=s3
AWS_S3_BUCKET=rsv-staging-uploads
```

---

### 3. Production
**Status:** ⚠️ A Configurar

**Configuração Necessária:**
- **URL:** `https://api.rsv.com`
- **Database:** PostgreSQL gerenciado (RDS/Cloud SQL) com replicação
- **Redis:** Redis gerenciado (ElastiCache/Memorystore) com cluster
- **Upload:** S3 ou Cloudinary com CDN
- **Logs:** Centralizados (CloudWatch/Stackdriver) com alertas
- **Debug:** Desabilitado
- **Monitoring:** Prometheus + Grafana
- **Backup:** Automatizado diário

**Variáveis de Ambiente:**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://api.rsv.com
DATABASE_URL=postgresql://user:pass@prod-db.rsv.com:5432/rsv_db
REDIS_URL=redis://prod-redis.rsv.com:6379
JWT_SECRET=[SECRET_FROM_VAULT]
UPLOAD_METHOD=s3
AWS_S3_BUCKET=rsv-prod-uploads
SENTRY_DSN=[SENTRY_DSN]
```

---

## 🔐 SECRETS MANAGEMENT

### Opções Recomendadas:

#### 1. AWS Secrets Manager
```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'rsv/prod/database' });
```

#### 2. HashiCorp Vault
```typescript
import { Vault } from 'node-vault';

const vault = Vault({ endpoint: 'https://vault.rsv.com' });
const secret = await vault.read('secret/data/rsv/prod');
```

#### 3. Environment Variables (Desenvolvimento)
```bash
# .env.local (não commitar)
DATABASE_URL=...
JWT_SECRET=...
```

---

## 📁 ESTRUTURA DE ARQUIVOS DE AMBIENTE

```
/
├── .env                    # Base (commitar com valores de exemplo)
├── .env.local              # Local overrides (não commitar)
├── .env.development        # Development (não commitar)
├── .env.staging            # Staging (não commitar)
├── .env.production         # Production (não commitar)
└── env.example             # Template (commitar)
```

---

## 🔄 CONFIGURAÇÃO POR AMBIENTE

### Next.js Config:

```typescript
// next.config.mjs
const env = process.env.NODE_ENV || 'development';

const config = {
  // Configurações específicas por ambiente
  ...(env === 'production' && {
    compress: true,
    poweredByHeader: false,
  }),
  ...(env === 'development' && {
    reactStrictMode: true,
  }),
};
```

---

## 🚀 DEPLOY POR AMBIENTE

### Development:
```bash
npm run dev
```

### Staging:
```bash
NODE_ENV=staging npm run build
NODE_ENV=staging npm run start
```

### Production:
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

---

## 📊 CHECKLIST DE CONFIGURAÇÃO

### Development:
- [x] Docker Compose configurado
- [x] Variáveis de ambiente locais
- [x] Database local
- [x] Redis local
- [x] Upload local

### Staging:
- [ ] Ambiente criado
- [ ] Database gerenciado
- [ ] Redis gerenciado
- [ ] S3/Cloudinary configurado
- [ ] Secrets management
- [ ] Monitoring básico
- [ ] CI/CD para staging

### Production:
- [ ] Ambiente criado
- [ ] Database com replicação
- [ ] Redis cluster
- [ ] S3/Cloudinary com CDN
- [ ] Secrets management
- [ ] Monitoring completo
- [ ] Alertas configurados
- [ ] Backup automatizado
- [ ] Disaster recovery plan
- [ ] CI/CD para produção

---

**Última atualização:** 22/11/2025

