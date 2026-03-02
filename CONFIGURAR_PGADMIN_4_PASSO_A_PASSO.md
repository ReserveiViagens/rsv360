# 🎯 Configurar pgAdmin 4 - Passo a Passo Visual

**Data:** 2026-01-05  
**Status:** PostgreSQL - Porta 5432 (padrão) ou 5433

---

## ✅ Configuração Padronizada

- **PostgreSQL 18** – use a porta que estiver ativa
- **Porta:** `5432` (padrão – igual ao backend) ou `5433` se configurado
- **Senha:** `290491Bb`
- **Importante:** Se der "connection timeout", use a porta 5432. O backend usa 5432.

---

## 🔧 CONFIGURAR PGADMIN 4

### PASSO 1: Abrir pgAdmin 4

1. Abra o **pgAdmin 4** (procure no menu Iniciar ou na área de trabalho)
2. Aguarde a interface carregar completamente

---

### PASSO 2: Criar Nova Conexão

1. No painel esquerdo, localize **"Servers"**
2. **Clique com botão direito** em **"Servers"**
3. No menu que aparece, selecione:
   - **"Create"** → **"Server..."**

---

### PASSO 3: Preencher Aba "General"

Uma janela **"Create - Server"** será aberta com várias abas.

#### Na aba **"General"** (primeira aba):

1. **Name:** Digite `rsv360` ou `PostgreSQL 18`
   - Este é apenas um nome de identificação

2. **Server group:** Deixe como padrão

3. **Comments (opcional):** `Servidor rsv360 - Porta 5432`

---

### PASSO 4: Preencher Aba "Connection" ⚠️ IMPORTANTE

Clique na aba **"Connection"** (segunda aba).

#### Preencha os seguintes campos:

1. **Host name/address:** 
   ```
   localhost
   ```
   - ⚠️ **NÃO use** `127.0.0.1` ou IP, use `localhost`

2. **Port:** 
   ```
   5432
   ```
   - ⚠️ **Use 5432** (padrão do PostgreSQL, igual ao backend)
   - Se der "connection timeout", execute `.\scripts\verificar-iniciar-postgresql.ps1` para ver qual porta está ativa

3. **Maintenance database:** 
   ```
   postgres
   ```
   - Este é o banco padrão do PostgreSQL

4. **Username:** 
   ```
   postgres
   ```
   - Usuário padrão do PostgreSQL

5. **Password:** 
   ```
   290491Bb
   ```
   - ⚠️ **Digite exatamente assim** (sem espaços)

6. **✅ Save password:** 
   - **MARQUE ESTA CAIXA** ✅
   - Isso evita ter que digitar a senha toda vez

---

### PASSO 5: Outras Abas (Opcional)

#### Aba "SSL":
- Deixe tudo como padrão (desmarcado)

#### Aba "Advanced":
- Deixe tudo como padrão

#### Aba "Variables":
- Deixe tudo como padrão

---

### PASSO 6: Salvar Conexão

1. Clique no botão **"Save"** (canto inferior direito)
2. OU pressione `Ctrl+S`
3. Aguarde alguns segundos

---

### PASSO 7: Verificar Conexão ✅

**Resultado esperado:**

1. ✅ A janela será fechada
2. ✅ No painel esquerdo, dentro de **"Servers"**, você verá:
   - **"PostgreSQL 18 (Porta 5433)"** (ou o nome que você escolheu)
   - **SEM ícone de cadeado** 🔓 (se houver cadeado, a conexão falhou)

3. ✅ **Clique na seta** ao lado do servidor para expandir
4. ✅ Você deve ver:
   - **Databases**
   - **Login/Group Roles**
   - **Tablespaces**
   - etc.

---

## 🧪 TESTAR CONEXÃO

### Teste 1: Expandir Servidor
- Clique na seta ao lado do servidor
- Se expandir sem erros: ✅ **Funcionando!**

### Teste 2: Executar Query
1. **Clique com botão direito** no servidor
2. Selecione **"Query Tool"**
3. Digite:
   ```sql
   SELECT version();
   ```
4. Clique no botão **▶ Execute** (ou pressione `F5`)
5. **Resultado esperado:** Versão do PostgreSQL exibida

---

## ❌ SE NÃO CONECTAR

### Erro: "password authentication failed"

**Solução:**
1. Verifique se a senha está correta: `290491Bb`
2. Verifique se não há espaços extras
3. Tente executar o script de reset de senha:
   ```powershell
   .\CORRIGIR_PGADMIN_E_POSTGRESQL.ps1
   ```

### Erro: "could not connect to server"

**Solução:**
1. Verifique se PostgreSQL está rodando:
   ```powershell
   Get-Service -Name "postgresql-x64-18"
   ```
   - Status deve ser `Running`

2. Verifique se a porta está correta:
   - Use `5433`, **NÃO** `5432`

3. Verifique se o host está correto:
   - Use `localhost`, **NÃO** `127.0.0.1`

### Erro: "connection refused"

**Solução:**
1. Inicie o serviço PostgreSQL:
   ```powershell
   Start-Service -Name "postgresql-x64-18"
   ```

2. Aguarde 5 segundos e tente novamente

---

## 📋 RESUMO DA CONFIGURAÇÃO

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5433` ⚠️ |
| **Database** | `postgres` |
| **Username** | `postgres` |
| **Password** | `290491Bb` |
| **Save password** | ✅ Marcado |

---

## ✅ CHECKLIST

- [ ] pgAdmin 4 aberto
- [ ] Nova conexão criada
- [ ] Host: `localhost`
- [ ] Port: `5433` (não 5432!)
- [ ] Username: `postgres`
- [ ] Password: `290491Bb`
- [ ] Save password marcado
- [ ] Conexão salva
- [ ] Servidor aparece sem cadeado
- [ ] Servidor expande corretamente
- [ ] Query Tool funciona

---

## 🎯 PRÓXIMOS PASSOS

Após conectar com sucesso:

1. **Criar banco de dados** (se necessário):
   - Clique com botão direito em **"Databases"**
   - **"Create"** → **"Database..."**
   - Nome: `rsv360`
   - Owner: `postgres`
   - Save

2. **Executar migrations** do projeto

3. **Testar aplicação** completa

---

**Última Atualização:** 2026-01-05  
**Status:** ✅ PostgreSQL Rodando - Pronto para Configurar pgAdmin 4
