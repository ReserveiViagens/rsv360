# Script para executar migrations do módulo de turismo
# Executa as migrations SQL diretamente no PostgreSQL

param(
    [string]$DatabaseUrl = "",
    [string]$Host = "localhost",
    [int]$Port = 5433,
    [string]$Database = "rsv360",
    [string]$User = "postgres",
    [string]$Password = "290491Bb"
)

Write-Host "=== EXECUTAR MIGRATIONS - MÓDULOS DE TURISMO ===" -ForegroundColor Green
Write-Host ""

# Determinar string de conexão
if ($DatabaseUrl) {
    $connectionString = $DatabaseUrl
    Write-Host "Usando DATABASE_URL fornecida" -ForegroundColor Cyan
} else {
    $connectionString = "postgresql://${User}:${Password}@${Host}:${Port}/${Database}"
    Write-Host "Usando parâmetros: Host=$Host, Port=$Port, Database=$Database, User=$User" -ForegroundColor Cyan
}

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "ERRO: psql não encontrado em $psqlPath" -ForegroundColor Red
    Write-Host "Por favor, ajuste o caminho do psql no script" -ForegroundColor Yellow
    exit 1
}

# Diretório base do projeto
$projectRoot = Split-Path -Parent $PSScriptRoot
$migrationsDir = Join-Path $projectRoot "database\migrations"

# Lista de migrations a executar
$migrations = @(
    @{
        Name = "Leilões"
        Path = Join-Path $migrationsDir "leiloes\001-create-leiloes-tables.sql"
    },
    @{
        Name = "Excursões"
        Path = Join-Path $migrationsDir "excursoes\001-create-excursoes-tables.sql"
    },
    @{
        Name = "Viagens em Grupo"
        Path = Join-Path $migrationsDir "viagens-grupo\001-create-viagens-grupo-tables.sql"
    }
)

Write-Host "Migrations a executar:" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    Write-Host "  - $($migration.Name): $($migration.Path)" -ForegroundColor White
}
Write-Host ""

# Verificar se os arquivos existem
$allExist = $true
foreach ($migration in $migrations) {
    if (-not (Test-Path $migration.Path)) {
        Write-Host "ERRO: Arquivo não encontrado: $($migration.Path)" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host "Por favor, verifique os caminhos dos arquivos de migration" -ForegroundColor Yellow
    exit 1
}

# Executar cada migration
$successCount = 0
$errorCount = 0

foreach ($migration in $migrations) {
    Write-Host "Executando migration: $($migration.Name)..." -ForegroundColor Cyan
    
    try {
        $env:PGPASSWORD = $Password
        $result = & $psqlPath -h $Host -p $Port -U $User -d $Database -f $migration.Path 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Migration executada com sucesso!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ❌ Erro ao executar migration:" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host "  ❌ Erro ao executar migration: $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Resumo
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "Sucessos: $successCount" -ForegroundColor Green
Write-Host "Erros: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })

if ($errorCount -eq 0) {
    Write-Host ""
    Write-Host "✅ Todas as migrations foram executadas com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Verificar tabelas criadas no banco de dados" -ForegroundColor White
    Write-Host "2. Iniciar o backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "3. Iniciar o frontend: cd apps/turismo && npm run dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ Algumas migrations falharam. Verifique os erros acima." -ForegroundColor Yellow
}

