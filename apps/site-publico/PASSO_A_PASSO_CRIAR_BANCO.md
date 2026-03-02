# 🎯 PASSO A PASSO: CRIAR BANCO NO PGADMIN

**pgAdmin está aberto**  
**Senha:** `.,@#290491Bb` ou `290491Bb`

---

## 📋 INSTRUÇÕES VISUAIS

### ✅ PASSO 1: Conectar ao Servidor

1. No **painel esquerdo** do pgAdmin, localize **"Servers"**
2. Expanda **"Servers"** (clique na seta)
3. Você verá um servidor PostgreSQL (ex: **"PostgreSQL 15"**)
4. Se houver um **ícone de cadeado 🔒**, o servidor não está conectado
5. **Clique direito** no servidor → **"Connect Server"**
6. **Senha:** Digite `.,@#290491Bb`
   - Se não funcionar, tente: `290491Bb`
7. Marque **"Save password"** (opcional)
8. Clique em **"OK"**

**✅ Resultado:** O servidor deve expandir mostrando:
- 📁 Databases
- 👥 Login/Group Roles
- 📦 Tablespaces

---

### ✅ PASSO 2: Criar Banco de Dados

1. No painel esquerdo, **expanda o servidor conectado**
2. Você verá uma pasta **"Databases"**
3. **Clique direito** em **"Databases"**
4. No menu, selecione: **"Create"** → **"Database..."**

---

### ✅ PASSO 3: Preencher Formulário

Uma janela **"Create - Database"** será aberta:

#### Aba "General" (Principal)

1. **Database:** Digite exatamente: `rsv360_dev`
2. **Owner:** Selecione `postgres` (geralmente já vem selecionado)
3. **Comment (opcional):** `Banco de dados RSV 360 - Desenvolvimento`

#### Outras Abas

- **Definition:** Deixe padrão (UTF8)
- **Security:** Deixe padrão
- **Parameters:** Deixe padrão
- **Advanced:** Deixe padrão

---

### ✅ PASSO 4: Salvar

1. Clique no botão **"Save"** (canto inferior direito)
2. OU pressione `Ctrl+S`
3. Aguarde 2-3 segundos

**✅ Resultado:** 
- A janela será fechada
- No painel esquerdo, dentro de **"Databases"**, você verá **"rsv360_dev"**

---

### ✅ PASSO 5: Verificar

1. Expanda **"Databases"** no painel esquerdo
2. Você deve ver **"rsv360_dev"** na lista
3. **Clique direito** em **"rsv360_dev"** → **"Properties"**
4. Verifique:
   - **Name:** `rsv360_dev` ✅
   - **Owner:** `postgres` ✅
   - **Encoding:** `UTF8` ✅

---

## 🔄 ALTERNATIVA: VIA SQL (Query Tool)

Se preferir usar SQL:

### Passo 1: Abrir Query Tool

1. Clique direito em **"Databases"** (ou no servidor)
2. Selecione **"Query Tool"**

### Passo 2: Executar SQL

Cole este código no Query Tool:

```sql
CREATE DATABASE rsv360_dev
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### Passo 3: Executar

1. Clique no botão **"Execute"** (⚡ ícone de raio)
2. OU pressione `F5`

### Passo 4: Verificar

Na aba **"Messages"** você verá:
```
CREATE DATABASE
```

---

## ✅ APÓS CRIAR O BANCO

### 1. Validar Configuração

```bash
npm run validate:env
```

**Resultado esperado:**
```
✅ DATABASE_URL
✅ JWT_SECRET
✅ NEXT_PUBLIC_API_URL
✅ Todas as variáveis obrigatórias estão definidas!
```

### 2. Executar Migrations

```bash
npm run migrate
```

Isso criará:
- Tabela `host_points`
- Tabela `incentive_programs`
- Tabela `host_program_enrollments`
- Funções SQL
- Views
- Triggers

### 3. Executar Seed

```bash
npm run seed
```

Isso inserirá:
- 5 programas de incentivo iniciais
- Configurações de smart pricing padrão
- Pontos iniciais para hosts

### 4. Executar Setup Completo

```bash
npm run setup
```

Isso executará tudo de uma vez (validar + migrar + seed + testar)

---

## 📊 STATUS ATUAL

### ✅ Configurado:
- DATABASE_URL no .env
- NEXT_PUBLIC_API_URL no .env
- JWT_SECRET no .env

### ⏳ Aguardando:
- Criação do banco `rsv360_dev` no pgAdmin

---

## 🆘 PROBLEMAS?

### "autenticação do tipo senha falhou"

**Soluções:**
1. Tente a senha alternativa: `290491Bb`
2. Verifique se o PostgreSQL está rodando
3. Tente conectar manualmente no pgAdmin primeiro

### "banco de dados já existe"

**Solução:**
- O banco já foi criado! Você pode usar o existente.
- OU deletar e recriar (cuidado com dados!)

---

## 📝 CHECKLIST

- [ ] Servidor conectado no pgAdmin
- [ ] Banco `rsv360_dev` criado
- [ ] Banco aparece na lista de databases
- [ ] `npm run validate:env` passa
- [ ] `npm run migrate` executa com sucesso
- [ ] `npm run seed` executa com sucesso

---

**Última atualização:** 2025-12-13

