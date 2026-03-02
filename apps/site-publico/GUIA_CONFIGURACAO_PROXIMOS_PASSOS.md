# 🎯 GUIA DE CONFIGURAÇÃO - PRÓXIMOS PASSOS

Este guia detalha como configurar os próximos passos opcionais implementados.

---

## 1. CONFIGURAÇÃO DO SERVIDOR WEBSOCKET

### 1.1 Instalar Dependências

```bash
npm install socket.io @types/socket.io
```

### 1.2 Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
WS_PORT=3001
```

### 1.3 Iniciar Servidor WebSocket

**Opção 1: Servidor Standalone (Recomendado)**

```bash
npm run ws:server
```

**Opção 2: Integrado com Next.js**

Crie um arquivo `server.js` na raiz do projeto:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeWebSocketServer } = require('./server/websocket-server');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Inicializar WebSocket
  initializeWebSocketServer(server);

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
```

### 1.4 Testar Conexão WebSocket

O cliente WebSocket já está configurado e tentará conectar automaticamente. Se o servidor não estiver disponível, o sistema usa fallback para polling.

---

## 2. CONFIGURAÇÃO DO STORAGE S3

### 2.1 Instalar AWS SDK

```bash
npm install @aws-sdk/client-s3
```

### 2.2 Configurar Credenciais AWS

1. Acesse o AWS Console
2. Crie um bucket S3
3. Crie um usuário IAM com permissões S3
4. Gere Access Key e Secret Key

### 2.3 Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
STORAGE_TYPE=s3
S3_BUCKET=seu-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=sua-access-key
S3_SECRET_KEY=sua-secret-key
```

### 2.4 Política IAM Recomendada

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::seu-bucket-name/*",
        "arn:aws:s3:::seu-bucket-name"
      ]
    }
  ]
}
```

### 2.5 Testar Upload S3

O sistema automaticamente usa S3 se configurado, caso contrário usa storage local.

---

## 3. CONFIGURAÇÃO COMPLETA DO .ENV

Copie o arquivo `.env.example` para `.env.local` e preencha todas as variáveis:

```bash
cp .env.example .env.local
```

### Variáveis Essenciais:

- **JWT_SECRET**: Chave secreta para JWT (mínimo 32 caracteres)
- **DATABASE_URL**: URL de conexão do PostgreSQL
- **NEXT_PUBLIC_WS_URL**: URL do servidor WebSocket
- **STORAGE_TYPE**: 'local' ou 's3'

### Variáveis Opcionais:

- **S3_***: Apenas se usar S3
- **SMTP_***: Para envio de emails
- **TWILIO_***: Para SMS
- **WHATSAPP_***: Para WhatsApp Business
- **FIREBASE_***: Para push notifications
- **MERCADOPAGO_***: Para pagamentos
- **UNICO_*** / **IDWALL_***: Para verificação de identidade
- **CLOUDBEDS_*** / **AIRBNB_*** / **BOOKING_***: Para integrações OTA

---

## 4. TESTES

### 4.1 Testar WebSocket

1. Inicie o servidor WebSocket: `npm run ws:server`
2. Abra o chat em grupo
3. Verifique no console do navegador se a conexão foi estabelecida
4. Envie uma mensagem e verifique se aparece em tempo real

### 4.2 Testar Upload S3

1. Configure as variáveis S3
2. Faça upload de um arquivo
3. Verifique no console se o arquivo foi salvo no S3
4. Verifique a URL retornada

### 4.3 Testar Storage Local

1. Configure `STORAGE_TYPE=local`
2. Faça upload de um arquivo
3. Verifique se o arquivo foi salvo em `./storage/`

---

## 5. PRODUÇÃO

### 5.1 WebSocket em Produção

- Use um servidor WebSocket dedicado (ex: Socket.io com Redis adapter)
- Configure CORS adequadamente
- Use HTTPS/WSS
- Configure rate limiting
- Monitore conexões

### 5.2 S3 em Produção

- Use bucket privado com CloudFront para CDN
- Configure CORS no bucket
- Use IAM roles ao invés de access keys quando possível
- Configure lifecycle policies
- Monitore custos

### 5.3 Variáveis de Ambiente em Produção

- Use serviços como Vercel, AWS Secrets Manager, ou similar
- Nunca commite `.env.local` no git
- Use diferentes credenciais para dev/staging/prod

---

## 6. TROUBLESHOOTING

### WebSocket não conecta

1. Verifique se o servidor está rodando
2. Verifique `NEXT_PUBLIC_WS_URL` no `.env.local`
3. Verifique CORS no servidor
4. Verifique autenticação (token JWT válido)
5. O sistema usa fallback para polling automaticamente

### Upload S3 falha

1. Verifique credenciais AWS
2. Verifique permissões IAM
3. Verifique se o bucket existe
4. Verifique região do bucket
5. O sistema usa storage local como fallback

### Storage Local não funciona

1. Verifique permissões de escrita na pasta `./storage`
2. Crie a pasta manualmente se necessário
3. Verifique `STORAGE_LOCAL_PATH` no `.env.local`

---

## 7. PRÓXIMOS PASSOS ADICIONAIS

### 7.1 Melhorias de Performance

- [ ] Implementar Redis para WebSocket scaling
- [ ] Implementar CDN para arquivos S3
- [ ] Implementar cache de uploads
- [ ] Implementar compressão de imagens

### 7.2 Segurança

- [ ] Implementar rate limiting no WebSocket
- [ ] Implementar validação de arquivos mais rigorosa
- [ ] Implementar antivírus scanning
- [ ] Implementar assinatura de URLs S3

### 7.3 Monitoramento

- [ ] Implementar logging de WebSocket
- [ ] Implementar métricas de upload
- [ ] Implementar alertas de falhas
- [ ] Implementar dashboard de monitoramento

---

## ✅ CONCLUSÃO

Com essas configurações, você terá:

- ✅ WebSocket funcionando para mensagens em tempo real
- ✅ Upload de arquivos funcionando (S3 ou Local)
- ✅ Sistema completo e pronto para produção

Para dúvidas, consulte a documentação de cada serviço ou os logs do sistema.

