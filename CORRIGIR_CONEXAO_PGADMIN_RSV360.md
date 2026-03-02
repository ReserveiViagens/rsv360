# Corrigir Conexão pgAdmin - Servidor "rsv360"

## Erro que você está vendo

```
connection timeout expired
host: 'localhost', port: '54332'
```

## Causa

A porta **54332** está incorreta. O PostgreSQL RSV360 está rodando na porta **5432** (padrão).

## Solução

### 1. Editar o servidor no pgAdmin

1. Abra o **pgAdmin 4**
2. No painel esquerdo, clique com o botão direito no servidor **"rsv360"**
3. Selecione **Properties** (Propriedades)
4. Vá na aba **Connection** (Conexão)
5. Altere o campo **Port** de `54332` para `5432`
6. Em **Password**, digite: `290491Bb` (ou a senha que você configurou)
7. Marque **Save Password** se quiser salvar
8. Clique em **Save**

### 2. Configuração correta

| Campo | Valor |
|-------|-------|
| **Host** | localhost |
| **Port** | **5432** (não 54332) |
| **Maintenance database** | postgres |
| **Username** | postgres |
| **Password** | 290491Bb |

### 3. Testar a conexão

Após salvar, clique em **Connect** ou expanda o servidor. A conexão deve funcionar.

---

## Se ainda der timeout

1. **Verifique se o PostgreSQL está rodando:**
   ```powershell
   .\scripts\verificar-iniciar-postgresql.ps1
   ```

2. **Teste via linha de comando:**
   ```powershell
   $env:PGPASSWORD = "290491Bb"
   psql -U postgres -d rsv360 -h localhost -p 5432 -c "SELECT 1;"
   ```

3. **Se o PostgreSQL estiver na porta 5433** (após mudança por conflito com Docker):
   - Use **Port: 5433** no pgAdmin
   - Execute: `netstat -ano | findstr ":5432 :5433"` para ver qual porta está ativa

---

**Resumo:** Troque a porta de **54332** para **5432** nas propriedades do servidor "rsv360" no pgAdmin.
