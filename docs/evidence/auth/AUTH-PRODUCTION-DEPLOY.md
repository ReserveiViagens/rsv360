# Auth produção — checklist deploy (D2.8 + D2.9)

**Data:** 2026-06-22  
**Template:** copie `.env.production.example` → `.env` e preencha secrets.

## 1. Build Docker site-publico

O `docker/frontend/Dockerfile` usa `npm install --ignore-scripts` para evitar falha do postinstall root (`build:shared`).

```bash
docker compose -p rsv360 build backend site-publico
docker compose -p rsv360 up -d --force-recreate backend site-publico
```

## 2. OAUTH_BFF_SECRET (obrigatório)

| Serviço | Variável |
|---------|----------|
| backend | `OAUTH_BFF_SECRET` |
| site-publico | `OAUTH_BFF_SECRET` (mesmo valor) |

Gerar:

```bash
openssl rand -hex 32
```

Em produção, `OAUTH_DEV_MOCK` deve ser **`false`**.

## 3. Google / Facebook

Registrar redirect URIs **exatos** nos consoles IdP:

| Provider | Redirect URI |
|----------|--------------|
| Google | `{NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` |
| Facebook | `{NEXT_PUBLIC_SITE_URL}/api/auth/facebook/callback` |

Exemplo produção:

- `https://www.reserveiviagens.com.br/api/auth/google/callback`
- `https://www.reserveiviagens.com.br/api/auth/facebook/callback`

## 4. E-mail reset (D2.8)

Configure **uma** opção no **backend**:

| Modo | Variáveis |
|------|-----------|
| Webhook | `PASSWORD_RESET_EMAIL_WEBHOOK`, `PASSWORD_RESET_EMAIL_WEBHOOK_SECRET` (opcional) |
| SMTP/SES | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |

Link no e-mail: `PASSWORD_RESET_BASE_URL` + `/redefinir-senha?token=…`

## 5. Validar variáveis

```bash
npm run validate:auth-env
```

Com `NODE_ENV=production` no `.env`, o script exige `OAUTH_BFF_SECRET` forte e alerta sobre SMTP/OAuth.

## 6. Smoke pós-deploy

```bash
npm run test:e2e:auth-v1
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

Fluxo manual:

1. `/recuperar-senha` → e-mail recebido (ou webhook)
2. `/login` → Google/Facebook → redirect com `access_token`

## Referências

- `D2.8-BACKEND-EMAIL-RESET-RESULT.md`
- `D2.9-SITE-PUBLICO-OAUTH-BFF-RESULT.md`
- `.env.production.example`
