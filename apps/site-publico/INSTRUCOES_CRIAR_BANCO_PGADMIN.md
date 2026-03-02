# 📋 INSTRUÇÕES: CRIAR BANCO DE DADOS NO PGADMIN

**Senha fornecida:** `.,@#290491Bb` ou `290491Bb`

---

## 🎯 MÉTODO 1: VIA PGADMIN (GUI)

### Passo a Passo Detalhado

1. **Abrir pgAdmin 4**
   - Se já estiver aberto, pule este passo

2. **Conectar ao Servidor**
   - No painel esquerdo, localize **"Servers"**
   - Expanda **"Servers"**
   - Clique direito no servidor PostgreSQL (geralmente **"PostgreSQL 15"** ou similar)
   - Selecione **"Connect Server"**
   - **Senha:** Digite `.,@#290491Bb` ou `290491Bb`
   - Clique em **"OK"**

3. **Criar Banco de Dados**
   - No painel esquerdo, expanda o servidor conectado
   - Clique direito em **"Databases"**
   - Selecione **"Create"** → **"Database..."**

4. **Preencher Formulário**
   - **General Tab:**
     - **Database:** `rsv360_dev`
     - **Owner:** `postgres` (já deve estar selecionado)
   - **Definition Tab:**
     - **Encoding:** `UTF8` (padrão)
     - **Template:** `template0` (ou deixar padrão)
   - **Security Tab:** (deixar padrão)
   - **Parameters Tab:** (deixar padrão)

5. **Salvar**
   - Clique em **"Save"** (ou pressione `Ctrl+S`)
   - Aguarde a confirmação

6. **Verificar**
   - O banco `rsv360_dev` deve aparecer na lista de databases
   - Clique direito nele → **"Properties"** para verificar detalhes

---

## 🎯 MÉTODO 2: VIA QUERY TOOL (SQL)

### Passo a Passo

1. **Abrir Query Tool**
   - Conecte ao servidor (passo 2 do método anterior)
   - Clique direito em **"Databases"** → **"Query Tool"**
   - OU clique direito no servidor → **"Query Tool"**

2. **Executar Script SQL**
   - Abra o arquivo: `scripts/create-database.sql`
   - Copie todo o conteúdo
   - Cole no Query Tool
   - Clique em **"Execute"** (ou pressione `F5`)

3. **Verificar Resultado**
   - Você deve ver mensagens de sucesso
   - O banco `rsv360_dev` será criado

---

## 🎯 MÉTODO 3: VIA POWERSHELL (AUTOMÁTICO)

### Executar Script Automático

```powershell
# Navegar até o projeto
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"

# Executar script
.\scripts\create-database.ps1
```

**O script irá:**
- ✅ Verificar se o banco já existe
- ✅ Criar o banco `rsv360_dev`
- ✅ Verificar a criação
- ✅ Mostrar próximos passos

---

## ✅ VERIFICAÇÃO

### Após Criar o Banco

1. **No pgAdmin:**
   - Expanda **"Databases"**
   - Você deve ver `rsv360_dev` na lista
   - Clique direito → **"Properties"** para verificar

2. **Via SQL:**
   ```sql
   -- Conectar ao banco
   \c rsv360_dev
   
   -- Verificar conexão
   SELECT current_database();
   ```

3. **Via Script:**
   ```bash
   npm run validate:env
   ```

---

## 🔧 CONFIGURAR DATABASE_URL

Após criar o banco, configure no arquivo `.env`:

```bash
DATABASE_URL=postgresql://postgres:.,@#290491Bb@localhost:5432/rsv360_dev
```

**⚠️ IMPORTANTE:** 
- Se a senha tiver caracteres especiais, pode ser necessário usar URL encoding
- Caracteres especiais na senha: `.,@#` podem precisar ser codificados
- Se houver problemas, tente usar a senha alternativa: `290491Bb`

**Versão com URL Encoding (se necessário):**
```bash
# Senha: .,@#290491Bb
# URL encoded: .%2C%40%23290491Bb
DATABASE_URL=postgresql://postgres:.%2C%40%23290491Bb@localhost:5432/rsv360_dev
```

---

## 🚀 PRÓXIMOS PASSOS

Após criar o banco:

1. **Configurar DATABASE_URL no .env**
   ```bash
   DATABASE_URL=postgresql://postgres:.,@#290491Bb@localhost:5432/rsv360_dev
   ```

2. **Validar configuração:**
   ```bash
   npm run validate:env
   ```

3. **Executar migrations:**
   ```bash
   npm run migrate
   ```

4. **Executar seed:**
   ```bash
   npm run seed
   ```

5. **Ou executar tudo de uma vez:**
   ```bash
   npm run setup
   ```

---

## 🆘 TROUBLESHOOTING

### Erro: "autenticação do tipo senha falhou"

**Solução:**
- Verifique se a senha está correta: `.,@#290491Bb` ou `290491Bb`
- Tente conectar manualmente primeiro no pgAdmin
- Se funcionar no pgAdmin, use a mesma senha no script

### Erro: "banco de dados já existe"

**Solução:**
- O banco já foi criado anteriormente
- Você pode usar o banco existente
- OU deletar e recriar (cuidado com dados!)

### Erro: "permissão negada"

**Solução:**
- Certifique-se de estar conectado como usuário `postgres`
- Verifique permissões do usuário

---

**Última atualização:** 2025-12-13

