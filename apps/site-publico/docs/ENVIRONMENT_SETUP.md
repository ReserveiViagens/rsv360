# 🌍 CONFIGURAÇÃO DE AMBIENTES - GUIA COMPLETO

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📋 VARIÁVEIS DE AMBIENTE POR AMBIENTE

### Development (.env.local)

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://rsv_user:rsv_password@localhost:5432/rsv_db
POSTGRES_USER=rsv_user
POSTGRES_PASSWORD=rsv_password
POSTGRES_DB=rsv_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-key-change-in-production

# Upload
UPLOAD_METHOD=local

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Klarna
KLARNA_API_KEY=your-klarna-api-key
KLARNA_BASE_URL=https://api.klarna.com
KLARNA_ENABLED=false

# External APIs
OPENWEATHER_API_KEY=your-openweather-api-key
EVENTBRITE_API_KEY=your-eventbrite-api-key
```

---

### Staging

```env
# App
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.rsv.com

# Database (usar secrets management)
DATABASE_URL=[FROM_SECRETS_MANAGER]
POSTGRES_USER=[FROM_SECRETS_MANAGER]
POSTGRES_PASSWORD=[FROM_SECRETS_MANAGER]
POSTGRES_DB=rsv_db_staging

# Redis
REDIS_URL=[FROM_SECRETS_MANAGER]

# JWT
JWT_SECRET=[FROM_SECRETS_MANAGER]

# Upload
UPLOAD_METHOD=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[FROM_SECRETS_MANAGER]
AWS_SECRET_ACCESS_KEY=[FROM_SECRETS_MANAGER]
AWS_S3_BUCKET=rsv-staging-uploads

# Google Calendar
GOOGLE_CLIENT_ID=[FROM_SECRETS_MANAGER]
GOOGLE_CLIENT_SECRET=[FROM_SECRETS_MANAGER]
GOOGLE_REDIRECT_URI=https://staging.rsv.com/api/auth/google/callback

# Klarna
KLARNA_API_KEY=[FROM_SECRETS_MANAGER]
KLARNA_BASE_URL=https://api.klarna.com
KLARNA_ENABLED=true

# Monitoring
SENTRY_DSN=[FROM_SECRETS_MANAGER]
```

---

### Production

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://api.rsv.com

# Database (usar secrets management)
DATABASE_URL=[FROM_SECRETS_MANAGER]
POSTGRES_USER=[FROM_SECRETS_MANAGER]
POSTGRES_PASSWORD=[FROM_SECRETS_MANAGER]
POSTGRES_DB=rsv_db_prod

# Redis
REDIS_URL=[FROM_SECRETS_MANAGER]

# JWT
JWT_SECRET=[FROM_SECRETS_MANAGER] # Muito seguro!

# Upload
UPLOAD_METHOD=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[FROM_SECRETS_MANAGER]
AWS_SECRET_ACCESS_KEY=[FROM_SECRETS_MANAGER]
AWS_S3_BUCKET=rsv-prod-uploads

# Google Calendar
GOOGLE_CLIENT_ID=[FROM_SECRETS_MANAGER]
GOOGLE_CLIENT_SECRET=[FROM_SECRETS_MANAGER]
GOOGLE_REDIRECT_URI=https://api.rsv.com/api/auth/google/callback

# Klarna
KLARNA_API_KEY=[FROM_SECRETS_MANAGER]
KLARNA_BASE_URL=https://api.klarna.com
KLARNA_ENABLED=true

# Monitoring
SENTRY_DSN=[FROM_SECRETS_MANAGER]
```

---

## 🔐 SECRETS MANAGEMENT

### Opção 1: AWS Secrets Manager

```typescript
// lib/secrets-manager.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecret(secretName: string): Promise<any> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString || '{}');
}
```

### Opção 2: HashiCorp Vault

```typescript
// lib/vault.ts
import { Vault } from 'node-vault';

const vault = Vault({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

export async function getSecret(path: string): Promise<any> {
  const secret = await vault.read(`secret/data/${path}`);
  return secret.data.data;
}
```

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

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

