# ✅ CHECKLIST - PRÓXIMOS PASSOS OPCIONAIS

Use este checklist para garantir que tudo está configurado corretamente.

---

## 📦 1. INSTALAÇÃO DE DEPENDÊNCIAS

- [ ] Executar: `npm install socket.io @aws-sdk/client-s3`
- [ ] Verificar instalação: `npm list socket.io @aws-sdk/client-s3`
- [ ] **OU** executar setup automático: `npm run setup:next-steps`

---

## ⚙️ 2. CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

### 2.1 Arquivo .env.local

- [ ] Copiar `.env.example` para `.env.local`
- [ ] **OU** executar: `npm run setup:next-steps` (cria automaticamente)

### 2.2 Variáveis Essenciais

- [ ] `JWT_SECRET` - Chave secreta para JWT (mínimo 32 caracteres)
- [ ] `DATABASE_URL` - URL de conexão PostgreSQL
- [ ] `NEXT_PUBLIC_WS_URL` - URL do servidor WebSocket (ex: `ws://localhost:3001`)
- [ ] `WS_PORT` - Porta do servidor WebSocket (padrão: 3001)
- [ ] `STORAGE_TYPE` - Tipo de storage: `local` ou `s3`

### 2.3 Variáveis Opcionais (S3)

Se usar S3, configurar:

- [ ] `STORAGE_TYPE=s3`
- [ ] `S3_BUCKET` - Nome do bucket S3
- [ ] `S3_REGION` - Região do bucket (ex: `us-east-1`)
- [ ] `S3_ACCESS_KEY` - Access Key da AWS
- [ ] `S3_SECRET_KEY` - Secret Key da AWS

---

## 🔌 3. SERVIDOR WEBSOCKET

### 3.1 Verificação

- [ ] Script existe: `scripts/setup-websocket-server.js`
- [ ] Dependências instaladas: `socket.io`, `jsonwebtoken`

### 3.2 Iniciar Servidor

- [ ] Executar: `npm run ws:server`
- [ ] Verificar mensagem: "🚀 Servidor WebSocket rodando na porta 3001"
- [ ] Testar conexão do cliente

### 3.3 Desenvolvimento (Opcional)

- [ ] Instalar nodemon: `npm install -D nodemon`
- [ ] Executar: `npm run ws:dev` (auto-reload)

---

## 📁 4. STORAGE (ARQUIVOS)

### 4.1 Storage Local

- [ ] Diretório `storage/` existe
- [ ] Permissões de escrita configuradas
- [ ] `STORAGE_TYPE=local` no `.env.local`

### 4.2 Storage S3 (Opcional)

- [ ] Credenciais AWS configuradas
- [ ] Bucket S3 criado
- [ ] Política IAM configurada
- [ ] `STORAGE_TYPE=s3` no `.env.local`
- [ ] Testar upload de arquivo

---

## 🧪 5. TESTES

### 5.1 WebSocket

- [ ] Servidor WebSocket iniciado
- [ ] Cliente conecta com sucesso
- [ ] Mensagens são recebidas em tempo real
- [ ] Fallback para polling funciona se WebSocket falhar

### 5.2 Upload de Arquivos

- [ ] Upload funciona (local ou S3)
- [ ] Arquivo é salvo corretamente
- [ ] URL de download é gerada
- [ ] Download funciona

---

## 📚 6. DOCUMENTAÇÃO

- [ ] Ler: `GUIA_CONFIGURACAO_PROXIMOS_PASSOS.md`
- [ ] Ler: `IMPLEMENTACAO_PROXIMOS_PASSOS.md`
- [ ] Consultar: `.env.example` para referência

---

## 🚀 7. PRODUÇÃO

### 7.1 WebSocket

- [ ] Servidor WebSocket em produção configurado
- [ ] CORS configurado corretamente
- [ ] HTTPS/WSS configurado
- [ ] Rate limiting implementado
- [ ] Monitoramento configurado

### 7.2 S3

- [ ] Bucket privado configurado
- [ ] CloudFront CDN configurado (opcional)
- [ ] CORS configurado no bucket
- [ ] IAM roles configuradas (ao invés de access keys)
- [ ] Lifecycle policies configuradas

### 7.3 Variáveis de Ambiente

- [ ] Variáveis configuradas no serviço de hospedagem
- [ ] `.env.local` não commitado no git
- [ ] Credenciais diferentes para dev/staging/prod

---

## ✅ CONCLUSÃO

Quando todos os itens estiverem marcados:

- ✅ WebSocket funcionando para mensagens em tempo real
- ✅ Upload de arquivos funcionando (S3 ou Local)
- ✅ Sistema completo e pronto para produção

---

## 🆘 TROUBLESHOOTING

### WebSocket não conecta

1. Verificar se servidor está rodando: `npm run ws:server`
2. Verificar `NEXT_PUBLIC_WS_URL` no `.env.local`
3. Verificar CORS no servidor
4. Verificar autenticação (token JWT válido)
5. Sistema usa fallback para polling automaticamente

### Upload S3 falha

1. Verificar credenciais AWS
2. Verificar permissões IAM
3. Verificar se bucket existe
4. Verificar região do bucket
5. Sistema usa storage local como fallback

### Dependências não instalam

1. Verificar Node.js e npm atualizados
2. Limpar cache: `npm cache clean --force`
3. Deletar `node_modules` e `package-lock.json`
4. Reinstalar: `npm install`

---

**Última atualização:** 2025-11-27

