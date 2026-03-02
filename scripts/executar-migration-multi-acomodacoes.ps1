# Script para executar migration de multi-acomodações
param(
    [switch]$Ajuda = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$MigrationFile = Join-Path $RootPath "database\migrations\001_create_enterprises_and_accommodations.sql"

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\executar-migration-multi-acomodacoes.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script executa a migration de multi-acomodações no PostgreSQL" -ForegroundColor Yellow
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EXECUTANDO MIGRATION MULTI-ACOMODAÇÕES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo existe
if (-not (Test-Path $MigrationFile)) {
    Write-Host "  [ERRO] Arquivo de migration não encontrado: $MigrationFile" -ForegroundColor Red
    exit 1
}

# Configurar variáveis de ambiente
$env:PGPASSWORD = "290491Bb"
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# Verificar se psql existe
if (-not (Test-Path $psqlPath)) {
    Write-Host "  [ERRO] psql.exe não encontrado em: $psqlPath" -ForegroundColor Red
    Write-Host "  [INFO] Verifique a instalação do PostgreSQL" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Verificando conexão com banco de dados..." -ForegroundColor Yellow
try {
    $teste = & $psqlPath -U postgres -d rsv360 -p 5433 -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRO] Não foi possível conectar ao banco de dados" -ForegroundColor Red
        Write-Host "  [INFO] Verifique se PostgreSQL está rodando na porta 5433" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "  [OK] Conexão estabelecida" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Erro ao conectar: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Executando migration..." -ForegroundColor Yellow
Write-Host "   Arquivo: $MigrationFile" -ForegroundColor Gray

try {
    $output = & $psqlPath -U postgres -d rsv360 -p 5433 -f $MigrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Migration executada com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "3. Verificando tabelas criadas..." -ForegroundColor Yellow
        
        # Verificar se as tabelas foram criadas
        $tables = @("enterprises", "properties", "accommodations", "accommodation_availability", "pricing_rules")
        $created = 0
        
        foreach ($table in $tables) {
            $check = & $psqlPath -U postgres -d rsv360 -p 5433 -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" -t 2>&1
            if ($check -match "t") {
                Write-Host "   ✅ Tabela '$table' criada" -ForegroundColor Green
                $created++
            } else {
                Write-Host "   ⚠️  Tabela '$table' não encontrada" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        if ($created -eq $tables.Count) {
            Write-Host "  [OK] Todas as tabelas foram criadas com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "  [AVISO] Algumas tabelas podem não ter sido criadas" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "  [ERRO] Erro ao executar migration" -ForegroundColor Red
        Write-Host "  [INFO] Verifique os logs acima" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Saída do psql:" -ForegroundColor Gray
        Write-Host $output -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "  [ERRO] Erro ao executar migration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] MIGRATION CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

return $true
