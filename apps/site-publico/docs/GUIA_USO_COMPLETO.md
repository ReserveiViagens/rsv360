# 📖 GUIA DE USO COMPLETO - RSV 360

**Data:** 2025-12-13  
**Versão:** 2.0.0

---

## 📋 ÍNDICE

1. [Início Rápido](#início-rápido)
2. [Configuração Inicial](#configuração-inicial)
3. [Funcionalidades Principais](#funcionalidades-principais)
4. [Guias por Perfil](#guias-por-perfil)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 INÍCIO RÁPIDO

### 1. Instalação

```bash
# Clonar repositório
git clone [repository-url]

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrations
npm run migrate

# Iniciar servidor
npm run dev
```

### 2. Primeiro Acesso

1. Acesse: `http://localhost:3000`
2. Registre-se como host ou hóspede
3. Configure seu perfil
4. Comece a usar o sistema!

---

## ⚙️ CONFIGURAÇÃO INICIAL

### Variáveis de Ambiente

**Arquivo:** `.env`

**Variáveis Obrigatórias:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rsv360_dev
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
NEXT_PUBLIC_API_URL=http://localhost:5002
```

**Variáveis Opcionais (mas recomendadas):**
```env
# SMTP (para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
EMAIL_FROM=noreply@rsv360.com

# Redis (para cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# APIs Externas
GOOGLE_MAPS_API_KEY=sua_chave_aqui
GOOGLE_VISION_API_KEY=sua_chave_aqui
STRIPE_SECRET_KEY=sua_chave_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
```

**Validação:**
```bash
npm run validate:env
```

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 1. Gerenciamento de Propriedades

**Criar Propriedade:**
1. Acesse: `/admin/properties`
2. Clique em "Nova Propriedade"
3. Preencha os dados
4. Faça upload de fotos
5. Salve

**Verificar Propriedade:**
1. Acesse a propriedade
2. Clique em "Solicitar Verificação"
3. Envie documentos e fotos
4. Aguarde aprovação

### 2. Sistema de Reservas

**Criar Reserva:**
1. Busque propriedades
2. Selecione datas
3. Escolha número de hóspedes
4. Complete o pagamento
5. Receba confirmação por email

**Gerenciar Reservas:**
1. Acesse: `/admin/bookings`
2. Visualize todas as reservas
3. Gerencie status
4. Processe pagamentos

### 3. Incentivos e Qualidade

**Visualizar Incentivos:**
1. Acesse: `/host/incentives`
2. Veja seus pontos
3. Veja badges conquistados
4. Veja programas disponíveis

**Usar Incentivos:**
1. Acesse seus incentivos
2. Selecione o incentivo
3. Use pontos ou descontos
4. Confirme

### 4. Seguros

**Criar Apólice:**
1. Acesse: `/insurance/policies`
2. Clique em "Nova Apólice"
3. Preencha os dados
4. Confirme

**Criar Sinistro:**
1. Acesse: `/insurance/claims`
2. Clique em "Novo Sinistro"
3. Preencha os dados
4. Envie documentos
5. Aguarde processamento

### 5. Viagens em Grupo

**Criar Grupo:**
1. Acesse: `/group-travel`
2. Clique em "Novo Grupo"
3. Convide membros
4. Configure calendário

**Gerenciar Calendário:**
1. Acesse o grupo
2. Clique em "Calendário"
3. Adicione eventos
4. Compartilhe com o grupo

---

## 👥 GUIAS POR PERFIL

### Para Hosts

**Checklist Inicial:**
- [ ] Criar conta
- [ ] Adicionar propriedade
- [ ] Solicitar verificação
- [ ] Configurar preços
- [ ] Ativar disponibilidade

**Funcionalidades Disponíveis:**
- Gerenciamento de propriedades
- Sistema de reservas
- Analytics e relatórios
- Incentivos e qualidade
- Seguros

### Para Hóspedes

**Checklist Inicial:**
- [ ] Criar conta
- [ ] Completar perfil
- [ ] Buscar propriedades
- [ ] Fazer primeira reserva

**Funcionalidades Disponíveis:**
- Busca de propriedades
- Sistema de reservas
- Viagens em grupo
- Wishlists compartilhadas
- Split payment

### Para Administradores

**Checklist Inicial:**
- [ ] Configurar sistema
- [ ] Configurar APIs
- [ ] Configurar pagamentos
- [ ] Revisar verificações
- [ ] Monitorar sistema

**Funcionalidades Disponíveis:**
- Dashboard administrativo
- Gerenciamento de usuários
- Revisão de verificações
- Processamento de sinistros
- Analytics completos

---

## 🔧 TROUBLESHOOTING

### Problemas Comuns

#### 1. Erro de Conexão com Banco de Dados

**Sintoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:**
1. Verifique se PostgreSQL está rodando
2. Verifique `DATABASE_URL` no `.env`
3. Teste conexão: `psql -h localhost -U postgres -d rsv360_dev`

#### 2. Erro de Autenticação

**Sintoma:**
```
Error: Invalid token
```

**Solução:**
1. Verifique `JWT_SECRET` no `.env`
2. Faça logout e login novamente
3. Limpe cookies do navegador

#### 3. Emails Não Enviando

**Sintoma:**
Emails não são recebidos

**Solução:**
1. Verifique configuração SMTP no `.env`
2. Teste: `npm run test:fase3`
3. Verifique logs do servidor

#### 4. Cache Não Funcionando

**Sintoma:**
Dados não são atualizados

**Solução:**
1. Verifique se Redis está rodando
2. Limpe cache: `npm run cache:clear`
3. Verifique `REDIS_HOST` e `REDIS_PORT`

#### 5. APIs Externas Não Funcionando

**Sintoma:**
Erro ao usar Google Maps, Stripe, etc.

**Solução:**
1. Verifique chaves de API no `.env`
2. Teste: `npm run test:integrations`
3. Verifique quotas das APIs

---

## 📞 SUPORTE

**Documentação:**
- API: `/docs/API_DOCUMENTATION.md`
- Troubleshooting: `/docs/TROUBLESHOOTING.md`

**Comandos Úteis:**
```bash
# Validar configuração
npm run validate:env

# Testar integrações
npm run test:integrations

# Testar funcionalidades
npm run test:fase3

# Testar tudo
npm run test:all

# Otimizar queries
npm run optimize:queries
```

---

**Última Atualização:** 2025-12-13

