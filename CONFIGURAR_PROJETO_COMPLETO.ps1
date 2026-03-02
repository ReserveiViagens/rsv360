# Script para Configurar Projeto Completo
# 1. Criar arquivos .env
# 2. Verificar banco de dados
# 3. Executar migrations

Write-Host "CONFIGURANDO PROJETO COMPLETO" -ForegroundColor Cyan
Write-Host ""

# Configuracoes
$dbHost = "localhost"
$dbPort = "5433"
$dbName = "rsv360"
$dbUser = "postgres"
$dbPassword = "290491Bb"
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# 1. Criar arquivo .env na raiz
Write-Host "1. Criando arquivo .env na raiz do projeto..." -ForegroundColor Yellow
$rootEnvContent = @"
# Configuracao do Banco de Dados PostgreSQL
DB_HOST=$dbHost
DB_PORT=$dbPort
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPassword

# DATABASE_URL (formato completo)
DATABASE_URL=postgresql://$dbUser`:$dbPassword@$dbHost`:$dbPort/$dbName

# Configuracoes do Servidor
NODE_ENV=development
PORT=5000

# JWT Secret
JWT_SECRET=rsv360_super_secret_key_2025_dev_change_in_production

# Outras configuracoes
NEXT_PUBLIC_API_URL=http://localhost:5000
"@

$rootEnvPath = Join-Path $PSScriptRoot ".env"
Set-Content -Path $rootEnvPath -Value $rootEnvContent -Encoding UTF8
Write-Host "   OK: Arquivo criado: $rootEnvPath" -ForegroundColor Green

# 2. Criar arquivo .env no backend
Write-Host ""
Write-Host "2. Criando arquivo .env no backend..." -ForegroundColor Yellow
$backendEnvPath = Join-Path $PSScriptRoot "backend\.env"
Set-Content -Path $backendEnvPath -Value $rootEnvContent -Encoding UTF8
Write-Host "   OK: Arquivo criado: $backendEnvPath" -ForegroundColor Green

# 3. Verificar banco de dados
Write-Host ""
Write-Host "3. Verificando banco de dados..." -ForegroundColor Yellow
$dbExists = & $psqlPath -U $dbUser -p $dbPort -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$dbName';" -t 2>&1
if ($dbExists -match "1") {
    Write-Host "   OK: Banco de dados '$dbName' ja existe" -ForegroundColor Green
} else {
    Write-Host "   Criando banco de dados '$dbName'..." -ForegroundColor Yellow
    $result = & $psqlPath -U $dbUser -p $dbPort -d postgres -c "CREATE DATABASE $dbName;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Banco de dados criado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: $result" -ForegroundColor Red
    }
}

# 4. Executar migrations
Write-Host ""
Write-Host "4. Executando migrations SQL..." -ForegroundColor Yellow

$migrationsPath = Join-Path $PSScriptRoot "database\migrations"
$migrations = @(
    @{Path="leiloes\001-create-leiloes-tables.sql"; Name="Leiloes"},
    @{Path="excursoes\001-create-excursoes-tables.sql"; Name="Excursoes"},
    @{Path="viagens-grupo\001-create-viagens-grupo-tables.sql"; Name="Viagens em Grupo"},
    @{Path="atendimento-ia\001-create-atendimento-ia-tables.sql"; Name="Atendimento IA"}
)

$successCount = 0
$errorCount = 0

foreach ($migration in $migrations) {
    $migrationFile = Join-Path $migrationsPath $migration.Path
    
    if (Test-Path $migrationFile) {
        Write-Host "   Executando: $($migration.Name)..." -ForegroundColor Cyan
        $result = & $psqlPath -U $dbUser -p $dbPort -d $dbName -f $migrationFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      OK: Migration executada com sucesso!" -ForegroundColor Green
            $successCount++
        } else {
            # Verificar se e erro de tabela ja existe (normal se executar novamente)
            if ($result -match "already exists" -or $result -match "ja existe") {
                Write-Host "      INFO: Tabelas ja existem (normal)" -ForegroundColor Cyan
                $successCount++
            } else {
                Write-Host "      AVISO: $result" -ForegroundColor Yellow
                $errorCount++
            }
        }
    } else {
        Write-Host "   ERRO: Arquivo nao encontrado: $migrationFile" -ForegroundColor Red
        $errorCount++
    }
}

# 5. Resumo
Write-Host ""
Write-Host "RESUMO:" -ForegroundColor Cyan
Write-Host "   Migrations executadas com sucesso: $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "   Migrations com avisos: $errorCount" -ForegroundColor Yellow
}

# 6. Verificar tabelas criadas
Write-Host ""
Write-Host "5. Verificando tabelas criadas..." -ForegroundColor Yellow
$tables = & $psqlPath -U $dbUser -p $dbPort -d $dbName -c "\dt" -t 2>&1
if ($tables) {
    Write-Host "   Tabelas encontradas:" -ForegroundColor Green
    $tables | Where-Object { $_ -match "\w+" } | ForEach-Object {
        $tableName = ($_ -split '\s+')[0]
        if ($tableName) {
            Write-Host "      - $tableName" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   Nenhuma tabela encontrada ou erro ao listar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host ""
Write-Host "INFORMACOES DE CONEXAO:" -ForegroundColor Cyan
Write-Host "   Host: $dbHost" -ForegroundColor White
Write-Host "   Port: $dbPort" -ForegroundColor White
Write-Host "   Database: $dbName" -ForegroundColor White
Write-Host "   User: $dbUser" -ForegroundColor White
Write-Host "   Password: $dbPassword" -ForegroundColor White

