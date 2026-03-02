# 📋 Instruções para Migração Docker → Porta 5433

## 🎯 Objetivo

Migrar todas as 22 tabelas do banco `rsv_360_ecosystem` no Docker (porta 5432) para o PostgreSQL nativo (porta 5433).

## ✅ Status Atual

- ✅ **Container Docker:** `postgres-rsv360` está rodando na porta 5432
- ✅ **Banco Docker:** `rsv_360_ecosystem` com 22 tabelas
- ❌ **PostgreSQL nativo:** Serviço parado (precisa iniciar)

## 📝 Passo a Passo

### 1. Iniciar PostgreSQL Nativo (Porta 5433)

**Opção A: Via PowerShell (como Administrador)**

```powershell
# Abrir PowerShell como Administrador
Start-Service -Name "postgresql-x64-18"

# Verificar se iniciou
Get-Service -Name "postgresql-x64-18"

# Verificar porta
Get-NetTCPConnection -LocalPort 5433
```

**Opção B: Via Serviços do Windows**

1. Pressione `Win + R`
2. Digite `services.msc` e pressione Enter
3. Procure por `postgresql-x64-18 - PostgreSQL Server 18`
4. Clique com botão direito → **Iniciar**

### 2. Verificar Conexão

```powershell
# Testar conexão
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -p 5433 -c "SELECT version();"
```

**Senha:** `290491Bb`

### 3. Criar Banco de Dados (se não existir)

```powershell
$env:PGPASSWORD = "290491Bb"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -p 5433 -c "CREATE DATABASE rsv360;"
```

### 4. Executar Migração

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
node scripts\migrar-docker-via-docker-exec.js
```

## 📊 Tabelas que Serão Migradas

1. `audit_logs`
2. `bookings`
3. `bookings_rsv360`
4. `customers`
5. `customers_rsv360`
6. `files`
7. `knex_migrations`
8. `knex_migrations_lock`
9. `notifications`
10. `owners`
11. `payments`
12. `payments_rsv360`
13. `properties`
14. `property_availability`
15. `property_shares`
16. `share_calendar`
17. `travel_packages`
18. `user_fcm_tokens`
19. `users`
20. `website_content`
21. `website_content_history`
22. `website_settings`

## 🔍 Verificação

Após a migração, verifique:

```powershell
$env:PGPASSWORD = "290491Bb"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d rsv360 -p 5433 -c "\dt"
```

## 📄 Relatório

O script gerará um relatório em:
- `RELATORIO_MIGRACAO_DOCKER_5433.md`

## ⚠️ Observações

- O script **não sobrescreve** dados existentes
- Se uma tabela já existir no destino, apenas os dados serão migrados
- Se já houver dados no destino, a migração será pulada para evitar duplicação

## 🆘 Troubleshooting

**Erro: "ECONNREFUSED" na porta 5433**
- Verifique se o serviço PostgreSQL está rodando
- Verifique se a porta está configurada corretamente em `postgresql.conf`

**Erro: "Container não encontrado"**
- Verifique se o container Docker está rodando: `docker ps | findstr postgres-rsv360`

**Erro: "Permission denied"**
- Execute o PowerShell como Administrador
