# Correção: PostgreSQL não conecta - Connection Timeout

## Problema

Ao tentar conectar ao banco de dados RSV360 no PostgreSQL:

```
connection timeout expired
Multiple connection attempts failed. All failures were:
- host: 'localhost', port: '5433', hostaddr: '::1': connection timeout expired
- host: 'localhost', port: '5433', hostaddr: '127.0.0.1': connection timeout expired
```

**Causa:** O serviço PostgreSQL está **parado** (Stopped). Quando o serviço não está rodando, qualquer tentativa de conexão resulta em timeout.

---

## Solução Rápida

### Opção 1: PowerShell como Administrador (recomendado)

1. **Feche** o PowerShell atual
2. **Clique direito** no ícone do PowerShell
3. Selecione **"Executar como administrador"**
4. Execute:

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
.\scripts\INICIAR-POSTGRESQL.ps1
```

### Opção 2: Serviços do Windows

1. Pressione **Win + R**, digite `services.msc` e Enter
2. Procure **"postgresql-x64-18"** ou **"PostgreSQL Server 18"**
3. Clique direito no serviço > **Iniciar**
4. Aguarde 10-15 segundos

### Opção 3: Linha de comando (Administrador)

```powershell
Start-Service -Name "postgresql-x64-18"
```

---

## Verificar se funcionou

### 1. Verificar serviço

```powershell
Get-Service -Name "postgresql-x64-18"
```

Status deve ser **Running**.

### 2. Verificar porta

```powershell
Get-NetTCPConnection -LocalPort 5433 -ErrorAction SilentlyContinue
```

Se não retornar nada, tente a porta 5432:

```powershell
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
```

### 3. Testar conexão

```powershell
$env:PGPASSWORD = "290491Bb"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d rsv360 -p 5433 -c "SELECT 1;"
```

Se funcionar, retornará `1`.

---

## Configuração da porta (5432 vs 5433)

O PostgreSQL pode estar configurado em **5432** (padrão) ou **5433** (segunda instalação).

- **verificar-iniciar-postgresql.ps1** usa porta **5433**
- **backend/.env** pode estar em **5432**

Se a conexão falhar na 5433, verifique qual porta está ativa e atualize o `backend/.env`:

```
DB_PORT=5433   # ou 5432 conforme sua instalação
DATABASE_URL=postgresql://postgres:290491Bb@localhost:5433/rsv360
```

---

## Credenciais RSV360

| Campo | Valor |
|-------|-------|
| Host | localhost |
| Porta | 5433 (ou 5432) |
| Banco | rsv360 |
| Usuário | postgres |
| Senha | 290491Bb |

---

## Iniciar automaticamente com o sistema

Para o PostgreSQL iniciar junto com o Windows:

1. Abra `services.msc`
2. Clique duplo em **postgresql-x64-18**
3. Em "Tipo de inicialização", selecione **Automático**
4. Clique em **Aplicar** e **OK**

---

## Próximos passos

Após o PostgreSQL estar rodando:

1. Execute **Iniciar Sistema Completo.ps1** para iniciar o RSV360
2. O script já verifica o PostgreSQL automaticamente
3. Volte a trabalhar de onde parou
