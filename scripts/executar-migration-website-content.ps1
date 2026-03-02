# Script para executar migration de website_content e properties
# Banco: rsv360
# Porta: 5433

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$MigrationFile = Join-Path $RootPath "database\migrations\create-website-content-and-properties.sql"

# Configurações do banco
$DB_HOST = "localhost"
$DB_PORT = "5433"
$DB_NAME = "rsv360"
$DB_USER = "postgres"
$DB_PASSWORD = "290491Bb"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EXECUTANDO MIGRATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Banco: $DB_NAME" -ForegroundColor Yellow
Write-Host "Porta: $DB_PORT" -ForegroundColor Yellow
Write-Host "Arquivo: $MigrationFile" -ForegroundColor Yellow
Write-Host ""

# Tentar encontrar psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ psql.exe não encontrado!" -ForegroundColor Red
    Write-Host "   Tente instalar o PostgreSQL ou adicionar ao PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ psql encontrado: $psqlPath" -ForegroundColor Green
Write-Host ""

# Executar migration
try {
    $env:PGPASSWORD = $DB_PASSWORD
    
    $arguments = @(
        "-h", $DB_HOST,
        "-p", $DB_PORT,
        "-U", $DB_USER,
        "-d", $DB_NAME,
        "-f", $MigrationFile
    )
    
    Write-Host "Executando migration..." -ForegroundColor Yellow
    & $psqlPath $arguments
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ MIGRATION EXECUTADA COM SUCESSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tabelas criadas:" -ForegroundColor Yellow
        Write-Host "  - website_content" -ForegroundColor White
        Write-Host "  - properties" -ForegroundColor White
        Write-Host "  - website_settings" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao executar migration (código: $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao executar migration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}
