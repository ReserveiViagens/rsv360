# 🎯 CRIAR BANCO DE DADOS NO PGADMIN - PASSO A PASSO

**Status:** pgAdmin está aberto  
**Senha:** `.,@#290491Bb` ou `290491Bb`

---

## 📋 INSTRUÇÕES PASSO A PASSO

### PASSO 1: Conectar ao Servidor (se ainda não conectou)

1. No painel esquerdo do pgAdmin, localize **"Servers"**
2. Expanda **"Servers"**
3. Você verá um servidor PostgreSQL (ex: **"PostgreSQL 15"** ou **"PostgreSQL 14"**)
4. Se houver um ícone de cadeado 🔒, o servidor não está conectado
5. **Clique direito** no servidor → **"Connect Server"**
6. **Senha:** Digite `.,@#290491Bb` (ou `290491Bb` se a primeira não funcionar)
7. Marque **"Save password"** (opcional, para não digitar sempre)
8. Clique em **"OK"**

**✅ Resultado esperado:** O ícone de cadeado deve desaparecer e o servidor deve expandir mostrando:
- Databases
- Login/Group Roles
- Tablespaces
- etc.

---

### PASSO 2: Criar o Banco de Dados

1. No painel esquerdo, **expanda o servidor conectado**
2. Você verá uma pasta chamada **"Databases"**
3. **Clique direito** em **"Databases"**
4. No menu que aparece, selecione **"Create"** → **"Database..."**

---

### PASSO 3: Preencher o Formulário

Uma janela **"Create - Database"** será aberta com várias abas:

#### Aba "General"

1. **Database:** Digite `rsv360_dev`
2. **Owner:** Selecione `postgres` (geralmente já vem selecionado)
3. **Comment (opcional):** `Banco de dados do sistema RSV 360 - Ambiente de Desenvolvimento`

#### Aba "Definition" (Opcional)

- **Encoding:** Deixe `UTF8` (padrão)
- **Template:** Deixe `template0` ou padrão
- **Tablespace:** Deixe padrão

#### Abas "Security", "Parameters", "Advanced" (Opcional)

- Deixe tudo como padrão

---

### PASSO 4: Salvar

1. Clique no botão **"Save"** (canto inferior direito)
2. OU pressione `Ctrl+S`
3. Aguarde alguns segundos

**✅ Resultado esperado:** 
- A janela será fechada
- No painel esquerdo, dentro de **"Databases"**, você verá o novo banco **"rsv360_dev"**

---

### PASSO 5: Verificar Criação

1. Expanda **"Databases"** no painel esquerdo
2. Você deve ver **"rsv360_dev"** na lista
3. **Clique direito** em **"rsv360_dev"** → **"Properties"**
4. Verifique:
   - **Name:** `rsv360_dev`
   - **Owner:** `postgres`
   - **Encoding:** `UTF8`

---

## 🔧 ALTERNATIVA: VIA QUERY TOOL (SQL)

Se preferir usar SQL diretamente:

### Passo a Passo

1. **Abrir Query Tool:**
   - Clique direito em **"Databases"** (ou no servidor)
   - Selecione **"Query Tool"**

2. **Copiar e Colar o SQL:**
   ```sql
   CREATE DATABASE rsv360_dev
       WITH 
       OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       CONNECTION LIMIT = -1;
   ```

3. **Executar:**
   - Clique no botão **"Execute"** (⚡ ícone de raio)
   - OU pressione `F5`

4. **Verificar:**
   - Na aba **"Messages"** você verá: `CREATE DATABASE`
   - O banco aparecerá na lista de databases

---

## ✅ APÓS CRIAR O BANCO

### 1. Configurar DATABASE_URL no .env

Abra o arquivo `.env` e adicione/atualize:

```bash
DATABASE_URL=postgresql://postgres:.,@#290491Bb@localhost:5432/rsv360_dev
```

**⚠️ NOTA:** Se a senha com caracteres especiais não funcionar, tente:

```bash
# Opção 1: Senha alternativa
DATABASE_URL=postgresql://postgres:290491Bb@localhost:5432/rsv360_dev

# Opção 2: Com URL encoding
DATABASE_URL=postgresql://postgres:.%2C%40%23290491Bb@localhost:5432/rsv360_dev
```

### 2. Validar Configuração

```bash
npm run validate:env
```

**Resultado esperado:**
```
✅ DATABASE_URL = postgresql://postgres:***@localhost:5432/rsv360_dev
```

### 3. Executar Migrations

```bash
npm run migrate
```

### 4. Executar Seed

```bash
npm run seed
```

### 5. Ou Executar Tudo de Uma Vez

```bash
npm run setup
```

---

## 🆘 PROBLEMAS COMUNS

### Problema: "autenticação do tipo senha falhou"

**Soluções:**
1. Verifique se a senha está correta: `.,@#290491Bb` ou `290491Bb`
2. Tente conectar manualmente no pgAdmin primeiro
3. Se funcionar no pgAdmin, use a mesma senha no `.env`

### Problema: "banco de dados já existe"

**Soluções:**
- O banco já foi criado anteriormente
- Você pode usar o banco existente
- OU deletar e recriar:
  ```sql
  -- No Query Tool
  DROP DATABASE IF EXISTS rsv360_dev;
  CREATE DATABASE rsv360_dev WITH OWNER = postgres;
  ```

### Problema: "permissão negada"

**Soluções:**
- Certifique-se de estar conectado como `postgres`
- Verifique se o usuário tem permissões de superusuário

---

## 📝 CHECKLIST

Após seguir os passos, verifique:

- [ ] Servidor PostgreSQL conectado no pgAdmin
- [ ] Banco `rsv360_dev` aparece na lista de databases
- [ ] DATABASE_URL configurada no `.env`
- [ ] `npm run validate:env` mostra DATABASE_URL como ✅
- [ ] Pronto para executar migrations

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Banco criado no pgAdmin
2. ⏳ Configurar DATABASE_URL no `.env`
3. ⏳ Executar `npm run validate:env`
4. ⏳ Executar `npm run setup`

---

**Última atualização:** 2025-12-13

