# ✅ INSTRUÇÕES FINAIS: CRIAR BANCO NO PGADMIN

**pgAdmin está aberto**  
**Senha:** `.,@#290491Bb` ou `290491Bb`

---

## 🎯 MÉTODO MAIS RÁPIDO: QUERY TOOL

### Passo a Passo

1. **No pgAdmin, clique direito em "Databases"** (ou no servidor)
2. **Selecione "Query Tool"**
3. **Cole este SQL:**

```sql
CREATE DATABASE rsv360_dev
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

4. **Clique no botão "Execute"** (⚡ ícone de raio) ou pressione `F5`
5. **Verifique na aba "Messages":** Deve aparecer `CREATE DATABASE`

**✅ Pronto!** O banco `rsv360_dev` foi criado.

---

## 🎯 MÉTODO GUI: CRIAR VIA INTERFACE

### Passo a Passo

1. **Conectar ao Servidor** (se ainda não conectou)
   - Clique direito no servidor → **"Connect Server"**
   - Senha: `.,@#290491Bb` ou `290491Bb`
   - Clique **"OK"**

2. **Criar Banco**
   - Clique direito em **"Databases"**
   - **"Create"** → **"Database..."**
   - **Database:** `rsv360_dev`
   - **Owner:** `postgres`
   - Clique **"Save"**

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

**O que faz:**
- Cria tabelas `host_points`, `incentive_programs`, `host_program_enrollments`
- Cria funções SQL
- Cria views e triggers

### 3. Executar Seed

```bash
npm run seed
```

**O que faz:**
- Insere 5 programas de incentivo
- Insere configurações de smart pricing
- Insere pontos iniciais para hosts

### 4. Executar Setup Completo

```bash
npm run setup
```

**Executa tudo de uma vez:**
- ✅ Validação
- ✅ Migrations
- ✅ Seed
- ✅ Testes de integração

---

## 📊 STATUS ATUAL

### ✅ Configurado:
- DATABASE_URL no .env: `postgresql://postgres:.,@#290491Bb@localhost:5432/rsv360_dev`
- NEXT_PUBLIC_API_URL no .env: `http://localhost:5002`
- JWT_SECRET no .env

### ⏳ Aguardando:
- Criação do banco `rsv360_dev` no pgAdmin

---

## 📝 CHECKLIST

- [ ] pgAdmin aberto e servidor conectado
- [ ] Banco `rsv360_dev` criado
- [ ] Banco aparece na lista de databases
- [ ] `npm run validate:env` passa (3/3 obrigatórias)
- [ ] `npm run migrate` executa com sucesso
- [ ] `npm run seed` executa com sucesso

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Criar banco no pgAdmin (seguir instruções acima)
2. ⏳ Executar `npm run validate:env`
3. ⏳ Executar `npm run setup`

---

**Última atualização:** 2025-12-13

