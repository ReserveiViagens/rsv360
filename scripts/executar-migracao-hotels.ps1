# ===================================================================
# Script PowerShell: Executar Migração de Hotéis
# ===================================================================
# Migra hotéis de website_content para enterprises via SQL ou API
# ===================================================================

param(
    [switch]$DryRun,
    [int]$Limit = 0,
    [string]$Method = "sql"  # "sql" ou "api"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 MIGRAÇÃO DE HOTÉIS: website_content → enterprises`n" -ForegroundColor Cyan

# Verificar se PostgreSQL está rodando
Write-Host "📋 Verificando PostgreSQL..." -ForegroundColor Yellow
$pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if (-not $pgProcess) {
    Write-Host "⚠️  PostgreSQL não está rodando. Iniciando..." -ForegroundColor Yellow
    & ".\scripts\verificar-iniciar-postgresql.ps1"
    Start-Sleep -Seconds 3
}

# Configurações
$DB_HOST = $env:DB_HOST ?? "localhost"
$DB_PORT = $env:DB_PORT ?? "5433"
$DB_NAME = $env:DB_NAME ?? "rsv360"
$DB_USER = $env:DB_USER ?? "postgres"
$DB_PASSWORD = $env:DB_PASSWORD ?? "290491Bb"

$MIGRATION_FILE = ".\database\migrations\002_migrate_website_content_to_enterprises.sql"

if ($Method -eq "sql") {
    Write-Host "`n📊 Método: SQL (Direto no banco)`n" -ForegroundColor Blue
    
    if (-not (Test-Path $MIGRATION_FILE)) {
        Write-Host "❌ Arquivo de migração não encontrado: $MIGRATION_FILE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📝 Executando migração SQL..." -ForegroundColor Yellow
    
    # Executar SQL via psql
    $env:PGPASSWORD = $DB_PASSWORD
    $sqlContent = Get-Content $MIGRATION_FILE -Raw
    
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $sqlContent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Migração SQL concluída com sucesso!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Erro ao executar migração SQL:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    
} elseif ($Method -eq "api") {
    Write-Host "`n📊 Método: API (Via Node.js)`n" -ForegroundColor Blue
    
    # Verificar se Node.js está instalado
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        Write-Host "❌ Node.js não encontrado. Instale Node.js para usar o método API." -ForegroundColor Red
        exit 1
    }
    
    # Verificar se o script existe
    $scriptFile = ".\scripts\migrate-hotels-to-enterprises.js"
    if (-not (Test-Path $scriptFile)) {
        Write-Host "❌ Script de migração não encontrado: $scriptFile" -ForegroundColor Red
        exit 1
    }
    
    # Preparar argumentos
    $args = @()
    if ($DryRun) {
        $args += "--dry-run"
    }
    if ($Limit -gt 0) {
        $args += "--limit=$Limit"
    }
    
    Write-Host "📝 Executando migração via API..." -ForegroundColor Yellow
    Write-Host "   Argumentos: $($args -join ' ')`n" -ForegroundColor Gray
    
    # Executar script Node.js
    & node $scriptFile $args
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Migração via API concluída!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Erro ao executar migração via API" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Método inválido: $Method. Use 'sql' ou 'api'." -ForegroundColor Red
    exit 1
}

# Verificar resultados
Write-Host "📊 Verificando resultados..." -ForegroundColor Yellow

$env:PGPASSWORD = $DB_PASSWORD
$countOld = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM website_content WHERE page_type = 'hotels' AND status = 'active';" 2>&1 | ForEach-Object { $_.Trim() }
$countNew = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM enterprises WHERE enterprise_type = 'hotel' AND metadata->>'migrated_from' = 'website_content';" 2>&1 | ForEach-Object { $_.Trim() }

Write-Host "`n📈 Estatísticas:" -ForegroundColor Cyan
Write-Host "   Hotéis originais (website_content): $countOld" -ForegroundColor White
Write-Host "   Hotéis migrados (enterprises): $countNew" -ForegroundColor White

if ([int]$countNew -lt [int]$countOld) {
    Write-Host "`n⚠️  Alguns hotéis não foram migrados!" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Todos os hotéis foram migrados com sucesso!`n" -ForegroundColor Green
}

Write-Host "🎉 Processo concluído!`n" -ForegroundColor Green
